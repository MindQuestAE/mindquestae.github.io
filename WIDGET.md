awesome—here’s a clean, copy-pasteable **embeddable widget** that shows a small banner linking to your site (good for natural backlinks + referral tracking). You get both: a JS widget for easy embedding and an HTML-only badge for maximum crawlability.

---

# 1) How partners embed it (one-liner)

```html
<!-- MindQuest banner widget -->
<script async src="https://mindquestquiz.com/widget/mq-widget.v1.js"
        data-text="MindQuest Quiz — Register now"
        data-url="https://mindquestquiz.com/?utm_source=widget&utm_medium=referral&utm_campaign=partner_banner"
        data-theme="light"         <!-- light | dark -->
        data-position="br"         <!-- br | bl | tr | tl -->
        data-size="sm"             <!-- sm | md | lg -->
        data-rounded="true"        <!-- true | false -->
        data-rel=""                <!-- "", "nofollow", "sponsored", "ugc" -->
        data-seo="true"            <!-- also injects a crawable <a> in the light DOM -->
></script>
```

> Host the file below at `https://mindquestquiz.com/widget/mq-widget.v1.js`.
> You can change text, UTM, theme, position, size, and rel attributes via `data-*`.

---

# 2) The widget script (save as `/widget/mq-widget.v1.js`)

```javascript
/*! MindQuest Widget v1 | lightweight, no deps */
(function () {
  try {
    var s = document.currentScript;
    if (!s) return;

    // --- Options with sensible defaults ---
    var opts = {
      text: s.dataset.text || "MindQuest Quiz — Register now",
      url: s.dataset.url || "https://mindquestquiz.com/?utm_source=widget&utm_medium=referral&utm_campaign=partner_banner",
      theme: (s.dataset.theme || "light").toLowerCase(),              // light | dark
      position: (s.dataset.position || "br").toLowerCase(),           // br|bl|tr|tl
      size: (s.dataset.size || "sm").toLowerCase(),                   // sm|md|lg
      rounded: String(s.dataset.rounded || "true") === "true",
      rel: (s.dataset.rel || "").toLowerCase(),                       // "", "nofollow", "sponsored", "ugc"
      seo: String(s.dataset.seo || "true") === "true"                 // also place a crawlable light-DOM link
    };

    // --- Build rel attribute safely (avoid manipulative linking) ---
    var relParts = ["noopener", "noreferrer"];
    if (opts.rel) relParts.push(opts.rel);
    var relAttr = relParts.join(" ");

    // --- Sizes ---
    var sizeMap = {
      sm: { padY: 8, padX: 12, font: 12, radius: 9999 },
      md: { padY: 10, padX: 14, font: 14, radius: 9999 },
      lg: { padY: 12, padX: 18, font: 16, radius: 16 }
    };
    var S = sizeMap[opts.size] || sizeMap.sm;

    // --- Colors ---
    var light = {
      bg: "#ffffff",
      text: "#111827",
      border: "#e5e7eb",
      accent: "#4f46e5",
      shadow: "0 6px 20px rgba(0,0,0,.12)"
    };
    var dark = {
      bg: "#111827",
      text: "#f9fafb",
      border: "#1f2937",
      accent: "#6366f1",
      shadow: "0 6px 20px rgba(0,0,0,.30)"
    };
    var C = opts.theme === "dark" ? dark : light;

    // --- Container + Shadow DOM (prevents CSS clashes) ---
    var mount = document.createElement("div");
    mount.setAttribute("data-mq-widget", "banner");
    mount.style.all = "initial"; // isolate as much as possible
    mount.style.position = "fixed";
    mount.style.zIndex = "2147483646";
    var gap = 16;
    var pos = opts.position;
    if (pos.includes("b")) mount.style.bottom = gap + "px";
    if (pos.includes("t")) mount.style.top = gap + "px";
    if (pos.includes("r")) mount.style.right = gap + "px";
    if (pos.includes("l")) mount.style.left = gap + "px";

    var root = mount.attachShadow ? mount.attachShadow({ mode: "open" }) : mount;

    // --- UI (button-like banner) ---
    var a = document.createElement("a");
    a.href = opts.url;
    a.target = "_blank";
    a.rel = relAttr;
    a.setAttribute("aria-label", opts.text);
    a.style.display = "inline-flex";
    a.style.alignItems = "center";
    a.style.gap = "10px";
    a.style.background = C.bg;
    a.style.color = C.text;
    a.style.border = "1px solid " + C.border;
    a.style.boxShadow = C.shadow;
    a.style.padding = S.padY + "px " + S.padX + "px";
    a.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'";
    a.style.fontSize = S.font + "px";
    a.style.fontWeight = "600";
    a.style.textDecoration = "none";
    a.style.lineHeight = "1";
    a.style.borderRadius = (opts.rounded ? S.radius : 6) + "px";
    a.style.transition = "transform .08s ease, box-shadow .15s ease, background-color .2s ease";
    a.onmouseenter = function(){ a.style.transform = "translateY(-1px)"; };
    a.onmouseleave = function(){ a.style.transform = "translateY(0)"; };

    // --- Simple inline SVG logo mark (no external asset) ---
    var svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    svg.setAttribute("viewBox","0 0 24 24");
    svg.setAttribute("aria-hidden","true");
    svg.style.width = "18px";
    svg.style.height = "18px";
    svg.style.flexShrink = "0";
    svg.innerHTML = '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="'+C.accent+'"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs><circle cx="12" cy="12" r="10" fill="url(#g)"></circle><path d="M7.5 14.5l3-5 2.5 4 2-3 1.5 2.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
    a.appendChild(svg);

    var span = document.createElement("span");
    span.textContent = opts.text;
    a.appendChild(span);

    // --- Close (X) ---
    var close = document.createElement("button");
    close.type = "button";
    close.setAttribute("aria-label", "Close MindQuest banner");
    close.style.marginLeft = "6px";
    close.style.border = "0";
    close.style.background = "transparent";
    close.style.cursor = "pointer";
    close.style.color = C.text;
    close.style.opacity = "0.6";
    close.style.fontSize = (S.font + 2) + "px";
    close.textContent = "×";
    close.onmouseenter = function(){ close.style.opacity = "1"; };
    close.onmouseleave = function(){ close.style.opacity = "0.6"; };
    close.onclick = function(e){
      e.preventDefault();
      if (mount && mount.parentNode) mount.parentNode.removeChild(mount);
      window.dispatchEvent(new CustomEvent("mq:closed"));
    };

    // Layout wrapper for anchor + close
    var wrap = document.createElement("div");
    wrap.style.display = "inline-flex";
    wrap.style.alignItems = "center";
    wrap.appendChild(a);
    wrap.appendChild(close);

    // --- Inject styles fix for prefers-color-scheme hover background ---
    var style = document.createElement("style");
    style.textContent = `
      a:hover { box-shadow: 0 10px 24px rgba(0,0,0,.18); }
      @media (prefers-reduced-motion: reduce) {
        a { transition: none !important; }
      }
    `;

    root.appendChild(style);
    root.appendChild(wrap);
    document.body.appendChild(mount);

    // --- Optional SEO: add a *visible & crawlable* light-DOM link near the script tag
    // This is a simple, compliant anchor (no hidden/obscure tactics).
    if (opts.seo && s.parentNode) {
      var crawlable = document.createElement("a");
      crawlable.href = opts.url;
      crawlable.target = "_blank";
      crawlable.rel = relAttr;
      crawlable.textContent = (opts.text || "MindQuest Quiz");
      crawlable.style.display = "inline-block";
      crawlable.style.margin = "8px 0";
      crawlable.style.font = "600 12px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial";
      crawlable.style.textDecoration = "none";
      crawlable.style.border = "1px solid " + C.border;
      crawlable.style.padding = "6px 10px";
      crawlable.style.borderRadius = "6px";
      crawlable.style.color = C.text;
      crawlable.style.background = C.bg;
      s.parentNode.insertBefore(crawlable, s.nextSibling);
    }

    // --- Analytics hooks (GTM/GA friendly) ---
    // Dispatch DOM events and push to dataLayer if present.
    var pushEvent = function(name){
      try {
        window.dispatchEvent(new CustomEvent(name, { detail: { widget: "mindquest", url: opts.url }}));
        if (Array.isArray(window.dataLayer)) {
          window.dataLayer.push({ event: name, widget: "mindquest", url: opts.url });
        }
      } catch(_) {}
    };
    pushEvent("mq:loaded");
    a.addEventListener("click", function(){ pushEvent("mq:click"); });

  } catch (err) {
    // Fail silently (never break host page)
    console && console.warn && console.warn("[MindQuest Widget] error:", err);
  }
})();
```

**Why this helps SEO (safely):**

* The anchor is **normal, visible HTML** by default (`data-seo="true"` injects a light-DOM `<a>` right after the script). This keeps it straightforward for crawlers while staying user-visible (no hidden links).
* Partners can set `data-rel` to `sponsored` / `ugc` / `nofollow` if appropriate. Leave it blank for natural, editorial links.

---

# 3) Pure HTML badge (no JS, ultra-crawlable)

If a partner prefers **no JavaScript**, share this:

```html
<a href="https://mindquestquiz.com/?utm_source=badge&utm_medium=referral&utm_campaign=partner_banner"
   target="_blank" rel="noopener noreferrer"
   style="display:inline-flex;align-items:center;gap:10px;background:#111827;color:#f9fafb;border:1px solid #1f2937;border-radius:9999px;padding:10px 14px;font:600 14px ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial;text-decoration:none;">
  <svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#22d3ee"/></linearGradient></defs>
    <circle cx="12" cy="12" r="10" fill="url(#g)"></circle>
    <path d="M7.5 14.5l3-5 2.5 4 2-3 1.5 2.5" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  MindQuest Quiz — Register now
</a>
```

---

## Notes & tips

* **Hosting:** Put the JS at `https://mindquestquiz.com/widget/mq-widget.v1.js` (or a CDN). Consider versioning (e.g., `mq-widget.v1.js`) so partners don’t break on updates.
* **Tracking:** UTM params are included; adjust per partner if you want source-level attribution (e.g., `utm_source=school_abc`).
* **Compliance:** If any placements are paid or incentivized, partners should set `data-rel="sponsored"` (or add `rel="sponsored"` to the HTML badge).
* **Theming:** Partners can switch `data-theme="dark"` or `light`; positions: `br`, `bl`, `tr`, `tl`; sizes: `sm | md | lg`.

If you want, I can tailor the default text/UTM/theme to the exact MindQuest campaign and add a compact “ribbon” variant too.
