#!/usr/bin/env python3
"""Fail if a same-origin resource referenced by the site is absent from dist."""

from __future__ import annotations

import argparse
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit


class References(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[str] = []
        self.manifests: list[str] = []
        self.base: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {key.lower(): (value or "") for key, value in attrs}
        for key in ("href", "src", "action", "poster", "data"):
            value = values.get(key, "").strip()
            if value:
                self.urls.append(value)
                if tag == "link" and "manifest" in values.get("rel", "").lower().split():
                    self.manifests.append(value)
                if tag == "base" and key == "href":
                    self.base = value
        srcset = values.get("srcset", "").strip()
        if srcset:
            # Each srcset candidate begins with the URL followed by optional width/density.
            self.urls.extend(candidate.strip().split()[0] for candidate in srcset.split(",") if candidate.strip())
        if tag == "meta" and values.get("property", "").lower() in {"og:image", "og:image:url", "og:url"}:
            if values.get("content"):
                self.urls.append(values["content"])
        if tag == "meta" and values.get("name", "").lower() in {"twitter:image", "twitter:image:src"}:
            if values.get("content"):
                self.urls.append(values["content"])


def same_origin_path(raw: str, page_url: str, hosts: set[str]) -> str | None:
    raw = raw.strip()
    if not raw or raw.startswith(("#", "data:", "blob:", "mailto:", "tel:", "javascript:")):
        return None
    resolved = urljoin(page_url, raw)
    parts = urlsplit(resolved)
    if parts.scheme not in {"http", "https"} or (parts.hostname or "").lower() not in hosts:
        return None
    path = unquote(parts.path or "/")
    if path == "/":
        return "index.html"
    path = path.lstrip("/")
    if path.endswith("/"):
        path += "index.html"
    return path


def add_url(urls: set[str], raw: str, page_url: str, hosts: set[str]) -> None:
    path = same_origin_path(raw, page_url, hosts)
    if path is not None:
        urls.add(path)


def collect_html(root: Path, html_paths: list[str], hosts: set[str], site_domain: str) -> tuple[set[str], set[str]]:
    urls: set[str] = set()
    manifest_paths: set[str] = set()
    for rel in html_paths:
        file = root / rel
        if not file.is_file():
            raise FileNotFoundError(f"built HTML is missing: {rel}")
        page_url = f"https://{site_domain}/{rel.lstrip('/')}"
        parser = References()
        parser.feed(file.read_text(encoding="utf-8"))
        base_url = urljoin(page_url, parser.base) if parser.base else page_url
        for value in parser.urls:
            add_url(urls, value, base_url, hosts)
        for value in parser.manifests:
            path = same_origin_path(value, base_url, hosts)
            if path:
                manifest_paths.add(path)
    return urls, manifest_paths


def collect_manifest(root: Path, manifest_paths: set[str], urls: set[str], hosts: set[str], site_domain: str) -> None:
    for rel in manifest_paths:
        file = root / rel
        if not file.is_file():
            raise FileNotFoundError(f"web manifest is missing: {rel}")
        manifest = json.loads(file.read_text(encoding="utf-8"))
        manifest_url = f"https://{site_domain}/{rel}"
        for value in [manifest.get("start_url", ""), *(icon.get("src", "") for icon in manifest.get("icons", []))]:
            add_url(urls, value, manifest_url, hosts)


def collect_service_worker(source: Path, urls: set[str], hosts: set[str]) -> None:
    text = source.read_text(encoding="utf-8")
    cache_match = re.search(r"CACHE_NAME\s*=\s*['\"]mindquest-v([^'\"]+)['\"]", text)
    cache_array = re.search(r"STATIC_CACHE_URLS\s*=\s*\[(.*?)\]", text, re.S)
    if not cache_match or not cache_array:
        raise ValueError("could not find CACHE_NAME and STATIC_CACHE_URLS in sw.js")
    version = cache_match.group(1)
    tokens = re.findall(r"(['\"`])((?:\\.|(?!\1).)*)\1", cache_array.group(1), re.S)
    if not tokens:
        raise ValueError("service worker precache list is empty or unreadable")
    for _, value in tokens:
        value = value.replace("${VERSION}", version)
        add_url(urls, value, "https://mindquestquiz.com/", hosts)


def collect_script(source: Path, urls: set[str], hosts: set[str]) -> None:
    """Catch literal same-origin URLs used by fetch/lazy loading or DOM assignment."""
    text = source.read_text(encoding="utf-8")
    literal = re.compile(r"(['\"`])((?:https?://(?:www\.)?mindquestquiz\.com)?(?:/|\./|\.\./)[^'\"`\s]*)\1", re.I)
    for _, value in literal.findall(text):
        add_url(urls, value, "https://mindquestquiz.com/", hosts)


def collect_css(root: Path, urls: set[str], hosts: set[str], site_domain: str) -> None:
    for css in root.rglob("*.css"):
        text = css.read_text(encoding="utf-8", errors="replace")
        relative_path = css.relative_to(root).as_posix()
        stylesheet_url = f"https://{site_domain}/{relative_path}"
        for value in re.findall(r"url\(\s*(['\"]?)(.*?)\1\s*\)", text, re.I):
            add_url(urls, value[1].strip(), stylesheet_url, hosts)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--html", nargs="+", required=True)
    parser.add_argument("--service-worker-source", type=Path, required=True)
    parser.add_argument("--script-source", type=Path, required=True)
    parser.add_argument("--site-domain", required=True)
    args = parser.parse_args()

    root = args.root.resolve()
    hosts = {args.site_domain.lower(), f"www.{args.site_domain.lower()}"}
    urls, manifests = collect_html(root, args.html, hosts, args.site_domain)
    collect_manifest(root, manifests, urls, hosts, args.site_domain)
    collect_service_worker(args.service_worker_source, urls, hosts)
    collect_script(args.script_source, urls, hosts)
    collect_css(root, urls, hosts, args.site_domain)

    missing = sorted(path for path in urls if not (root / path).is_file())
    if missing:
        print("Missing same-origin resources in dist:", file=sys.stderr)
        for path in missing:
            print(f"  /{path}", file=sys.stderr)
        return 1

    print(f"Verified {len(urls)} same-origin files in {root}:")
    for path in sorted(urls):
        print(f"  /{path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
