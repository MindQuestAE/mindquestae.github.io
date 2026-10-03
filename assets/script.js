document.documentElement.classList.add("js");

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const navbar = document.getElementById("navbar");

// Google Analytics and Tracking
window.dataLayer = window.dataLayer || [];
function gtag() {
  dataLayer.push(arguments);
}
window.gtag = gtag;
let analyticsLoaded = false;

function loadAnalytics() {
  if (analyticsLoaded) return;
  analyticsLoaded = true;
  gtag("js", new Date());
  gtag("config", "G-NVLZZP28ME", {
    page_title: "MindQuest 2026 — UAE Inter-School General Knowledge Quiz",
    page_location: "https://mindquestquiz.com/",
  });
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src =
    "https://www.googletagmanager.com/gtag/js?id=G-NVLZZP28ME";
  document.head.append(analyticsScript);
}

// Track CTA clicks
function trackCTAClick(action, section) {
  gtag("event", "click", {
    event_category: "CTA",
    event_label: action,
    value: section,
  });
}
window.trackCTAClick = trackCTAClick;

// Cookie Consent Management
const cookieBanner = document.getElementById("cookieConsent");

function readConsent() {
  try {
    return localStorage.getItem("cookieConsent");
  } catch (e) {
    return null;
  }
}

function saveConsent(value) {
  try {
    localStorage.setItem("cookieConsent", value);
  } catch (e) {
    // Storage unavailable (private mode); banner simply reappears next visit.
  }
  if (cookieBanner) cookieBanner.hidden = true;
}

function showCookieConsent() {
  if (readConsent() === "accepted") {
    loadAnalytics();
  } else if (cookieBanner && !readConsent()) {
    cookieBanner.hidden = false;
  }
}

function acceptCookies() {
  saveConsent("accepted");
  gtag("consent", "update", { analytics_storage: "granted" });
  loadAnalytics();
}

function declineCookies() {
  saveConsent("declined");
  gtag("consent", "update", { analytics_storage: "denied" });
}

window.showCookieConsent = showCookieConsent;
window.acceptCookies = acceptCookies;
window.declineCookies = declineCookies;
window.addEventListener("load", showCookieConsent);

// Mobile Navigation
function setMenu(open) {
  navMenu.classList.toggle("active", open);
  hamburger.classList.toggle("active", open);
  hamburger.setAttribute("aria-expanded", String(open));
  hamburger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
}

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  setMenu(!navMenu.classList.contains("active"));
});

document.addEventListener("click", (e) => {
  if (
    navMenu.classList.contains("active") &&
    !navMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    setMenu(false);
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    setMenu(false);
    hamburger.focus();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 900 && navMenu.classList.contains("active")) {
    setMenu(false);
  }
});

// Smooth scrolling for in-page links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    setMenu(false);
    const top =
      targetId === "#home"
        ? 0
        : target.getBoundingClientRect().top +
          window.scrollY -
          navbar.offsetHeight;
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
    history.pushState(null, "", targetId);
  });
});

// Scroll progress + navbar state
const progressBar = document.querySelector(".scroll-progress-bar");
let ticking = false;

function updateScrollEffects() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  navbar.classList.toggle("scrolled", window.scrollY > 40);
  ticking = false;
}

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  },
  { passive: true }
);
updateScrollEffects();

// Highlight the nav link for the section in view
const navLinks = [...navMenu.querySelectorAll('a[href^="#"]:not(.btn)')];
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) =>
        link.classList.toggle(
          "active",
          link.getAttribute("href") === "#" + entry.target.id
        )
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
navLinks.forEach((link) => {
  const section = document.querySelector(link.getAttribute("href"));
  if (section) sectionObserver.observe(section);
});

// Reveal-on-scroll animations
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
);

document.querySelectorAll(".reveal").forEach((el) => {
  // Stagger siblings in the same grid for a card-dealing effect
  const siblings = [...el.parentElement.children].filter((c) =>
    c.classList.contains("reveal")
  );
  el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 80 + "ms";
  revealObserver.observe(el);
});

// FAQ: only one open at a time (fallback for browsers without <details name>)
document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("toggle", () => {
    if (!item.open) return;
    document.querySelectorAll(".faq-item[open]").forEach((other) => {
      if (other !== item) other.open = false;
    });
  });
});

// Instagram gallery: load embed.js only when the gallery nears the viewport
const gallery = document.getElementById("gallery");
if (gallery) {
  const igObserver = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      igObserver.disconnect();
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      document.head.appendChild(script);
    },
    { rootMargin: "600px 0px" }
  );
  igObserver.observe(gallery);
}

// Warm-up quiz card
const warmupQuestions = [
  {
    cat: "Space",
    q: "Which Indian mission made the first-ever soft landing near the Moon’s south pole?",
    options: ["Chandrayaan-2", "Chandrayaan-3", "Mangalyaan", "Aditya-L1"],
    answer: 1,
    fact: "It touched down on 23 August 2023.",
  },
  {
    cat: "UAE",
    q: "Which bird is the national bird of the UAE?",
    options: ["Flamingo", "Houbara bustard", "Falcon", "Eagle"],
    answer: 2,
    fact: "Falconry is a treasured part of Emirati heritage.",
  },
  {
    cat: "Science",
    q: "Which element has the chemical symbol ‘K’?",
    options: ["Krypton", "Calcium", "Potassium", "Phosphorus"],
    answer: 2,
    fact: "‘K’ comes from its Latin name, kalium.",
  },
  {
    cat: "Literature",
    q: "Whose autobiography is titled ‘Wings of Fire’?",
    options: ["Ruskin Bond", "R. K. Narayan", "Vikram Seth", "A. P. J. Abdul Kalam"],
    answer: 3,
    fact: "Co-written with Arun Tiwari and published in 1999.",
  },
  {
    cat: "Sports",
    q: "In which sport is India’s Ranji Trophy contested?",
    options: ["Cricket", "Hockey", "Football", "Kabaddi"],
    answer: 0,
    fact: "It’s named after cricketer K. S. Ranjitsinhji.",
  },
];

const quizCard = document.getElementById("quizCard");
if (quizCard) {
  const qNum = document.getElementById("qNum");
  const qTotal = document.getElementById("qTotal");
  const qCat = document.getElementById("qCat");
  const qText = document.getElementById("qText");
  const qOptions = document.getElementById("qOptions");
  const qFeedback = document.getElementById("qFeedback");
  const qNext = document.getElementById("qNext");
  let current = 0;

  const render = () => {
    const item = warmupQuestions[current];
    qNum.textContent = current + 1;
    qTotal.textContent = warmupQuestions.length;
    qCat.textContent = item.cat;
    qText.textContent = item.q;
    qFeedback.textContent = "Tap an answer to lock it in.";
    qFeedback.classList.remove("good");
    qOptions.innerHTML = "";
    item.options.forEach((text, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-opt";
      btn.dataset.i = i;
      btn.innerHTML = `<span class="opt-key">${"ABCD"[i]}</span>`;
      btn.append(text);
      qOptions.appendChild(btn);
    });
  };

  qOptions.addEventListener("click", (e) => {
    const btn = e.target.closest(".quiz-opt");
    if (!btn || btn.disabled) return;
    const item = warmupQuestions[current];
    const picked = Number(btn.dataset.i);
    qOptions.querySelectorAll(".quiz-opt").forEach((opt) => {
      const i = Number(opt.dataset.i);
      opt.disabled = true;
      if (i === item.answer) opt.classList.add("correct");
      else if (i === picked) opt.classList.add("wrong");
    });
    const right = picked === item.answer;
    qFeedback.textContent = (right ? "Correct! " : "Not quite. ") + item.fact;
    qFeedback.classList.toggle("good", right);
    if (typeof window.gtag === "function") {
      window.gtag("event", "warmup_answer", {
        question: current + 1,
        correct: right,
      });
    }
  });

  qNext.addEventListener("click", () => {
    current = (current + 1) % warmupQuestions.length;
    render();
  });

  render();
}

// Contact form
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const endpoint =
    "https://script.google.com/macros/s/AKfycbwDldZ2ZJGRvpFkuNC1hUQ22qTc4x8GG8gn9eSjnX29FQYWg_2E_v8xWwoARj8Lxvw0/exec";
  const statusContainer = document.getElementById("contactStatus");
  const fieldIds = ["contactName", "contactEmail", "subject", "message"];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const setStatus = (type, message) => {
    statusContainer.className = "form-status" + (type ? " " + type : "");
    statusContainer.textContent = message;
  };

  const setFieldState = (input, isValid, message = "") => {
    const formGroup = input.closest(".form-group");
    const errorEl = document.getElementById(`${input.id}Error`);
    if (!formGroup || !errorEl) return;

    formGroup.classList.toggle("error", !isValid);
    formGroup.classList.toggle("valid", isValid && !!input.value.trim());
    input.setAttribute("aria-invalid", String(!isValid));
    errorEl.textContent = message;
    errorEl.style.display = isValid ? "none" : "block";
  };

  const validateField = (input) => {
    const value = input.value.trim();
    let errorMessage = "";

    switch (input.id) {
      case "contactName":
        if (!value) errorMessage = "Name is required.";
        else if (value.length < 3 || value.length > 50)
          errorMessage = "Name must be between 3 and 50 characters.";
        break;
      case "contactEmail":
        if (!value) errorMessage = "Email is required.";
        else if (!emailPattern.test(value))
          errorMessage = "Please enter a valid email address.";
        break;
      case "subject":
        if (!value) errorMessage = "Subject is required.";
        else if (value.length < 3 || value.length > 100)
          errorMessage = "Subject must be between 3 and 100 characters.";
        break;
      case "message":
        if (!value) errorMessage = "Message is required.";
        else if (value.length < 10 || value.length > 1000)
          errorMessage = "Message must be between 10 and 1000 characters.";
        break;
    }

    setFieldState(input, !errorMessage, errorMessage);
    return !errorMessage;
  };

  const inputs = fieldIds.map((id) => document.getElementById(id));
  inputs.forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
  });

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", "");

    const formIsValid = inputs.map(validateField).every(Boolean);
    if (!formIsValid) {
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        contactForm.animate(
          [
            { transform: "translateX(0)" },
            { transform: "translateX(-8px)" },
            { transform: "translateX(8px)" },
            { transform: "translateX(0)" },
          ],
          { duration: 350 }
        );
      }
      setStatus("error", "Please fix the highlighted fields and try again.");
      inputs.find((i) => i.getAttribute("aria-invalid") === "true")?.focus();
      return;
    }

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML =
      '<svg class="icon icon-spin" aria-hidden="true"><use href="#icon-loader"></use></svg> Sending…';

    try {
      const payload = {
        name: contactForm.contactName.value.trim(),
        email: contactForm.contactEmail.value.trim(),
        subject: contactForm.subject.value.trim(),
        message: contactForm.message.value.trim(),
      };

      // no-cors: the Apps Script endpoint returns an opaque response (status 0)
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });

      if (response.status === 0 || response.ok) {
        setStatus("success", "Thanks! Your message has been sent — we’ll get back to you soon.");
        contactForm.reset();
        inputs.forEach((input) => setFieldState(input, true));
      } else {
        setStatus("error", "We could not send your message. Please try again later.");
      }
    } catch (err) {
      setStatus("error", "We could not send your message. Please try again later.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }
  });
}

// Hide images that fail to load
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    this.style.display = "none";
    console.warn("Image failed to load:", this.src);
  });
});
