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
    page_title: "MindQuest 2.0 — UAE Inter-School General Knowledge Quiz 2026",
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
    // "Get notified" buttons: move focus to the sign-up heading
    if (targetId === "#register") {
      document.getElementById("registerTitle")?.focus({ preventScroll: true });
    }
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

// Archives: load Instagram's embed.js only when the section nears the viewport
const archives = document.getElementById("archives");
if (archives) {
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
  igObserver.observe(archives);
}

// Archive videos: each .video-facade in index.html is a plain link to YouTube
// with a thumbnail. On click it is replaced by a youtube-nocookie iframe, so
// no YouTube code loads until a visitor asks for the video.
document.querySelectorAll(".video-facade[data-video-id]").forEach((facade) => {
  facade.addEventListener("click", (event) => {
    event.preventDefault();
    const frame = document.createElement("iframe");
    frame.className = "video-frame";
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
      facade.dataset.videoId
    )}?autoplay=1`;
    frame.title = facade.dataset.videoTitle;
    frame.allow = "autoplay; encrypted-media; picture-in-picture";
    frame.allowFullscreen = true;
    facade.replaceWith(frame);
    frame.focus();
  });
});

// Warm-up card: questions and answers from the MindQuest 2025 written prelims,
// copied from the question paper and answer key in assets/2025/. `n` is the
// question number on the paper. Questions 14, 16, 20, 23, 28 and 30 refer to
// pictures printed on the paper and are left out here.
const warmupQuestions = [
  {
    n: 1,
    q: "Under what professional name is rapper Sooraj Cherukat known in the music and entertainment industry?",
    a: "Hanumankind",
  },
  {
    n: 2,
    q: "What is the smallest unit of measurable movement for a computer mouse called?",
    a: "Mickey",
  },
  {
    n: 3,
    q: "Which North African capital city derives its name from the phrase meaning “three cities,” a reference to its ancient foundation comprising the historic settlements of Oea, Sabratha, and Leptis Magna?",
    a: "Tripoli",
  },
  {
    n: 4,
    q: "Which renowned painting, titled using the model’s married name is famously known as La Gioconda in Italian?",
    a: "Mona Lisa",
  },
  {
    n: 5,
    q: "The book ‘Unbreakable’ tells the true story of a person who rose from a tough life in a village to become a world-famous boxer. Whose life story is shared in this inspiring autobiography?",
    a: "Mary Kom",
  },
  {
    n: 6,
    q: "What is the name of the United States’ current human spaceflight program, designed to reestablish human presence on the Moon for the first time since Apollo 17 in 1972, and named after Apollo’s mythological twin?",
    a: "Artemis",
  },
  {
    n: 7,
    q: "Which term, chosen as Oxford’s Word of the Year for 2024, refers to the mental fatigue caused by excessive digital content consumption?",
    a: "Brainrot",
  },
  {
    n: 8,
    q: "Which American inventor & businessman (1847-1931) was known as “The Wizard of Menlo Park”.",
    a: "Thomas Alva Edison",
  },
  {
    n: 9,
    q: "What is the name of Saudi Arabia’s futuristic city project, launched in 2017 as part of Vision 2030, designed to run entirely on renewable energy and redefine urban living?",
    a: "NEOM",
  },
  {
    n: 10,
    q: "Which nation sold Alaska to the United States in 1867 under the Alaska Treaty for $7.2 million?",
    a: "Russia",
  },
  {
    n: 11,
    q: "Which edible product, designed by Fred Baur, features a distinctive hyperbolic paraboloid shape for structural efficiency and aesthetic appeal?",
    a: "Pringles",
  },
  {
    n: 12,
    q: "What is the lethargic state that many reptiles, assume during cold conditions,partly analogous to hibernation, but physiological differences include that it does not depend on stored fat, but rather on reduced metabolic activity?",
    a: "Brumation",
  },
  {
    n: 13,
    q: "Chinese explorer Admiral Zheng He led seven maritime expeditions between 1405 and 1433 to regions across Asia and East Africa. What did he famously present to the Ming emperor interpreted as a qilin, a mythical creature symbolizing good fortune.",
    a: "Giraffe",
  },
  {
    n: 15,
    q: "In the 1939 Tripuri session of the Indian national Congress, who was re-elected as President? He defeated Pattabhi Siddharamaiah who had the open support of Mahatma Gandhi.",
    a: "Subash Chandra Bose / Netaji",
  },
  {
    n: 17,
    q: "Known for its role in creating litmus dye, Roccella tinctoria is an example of which symbiotic life form?",
    a: "Lichens",
  },
  {
    n: 18,
    q: "Which renowned Indian mathematician (CE 1114-1185) made significant contributions to the development of the decimal system through his works “Leelavati” and Beejaganitha”, with the former being named after his daughter.",
    a: "Bhaskara II / Bhaskaracharya",
  },
  {
    n: 19,
    q: "The ancient Indian game Pachisi, often played with cowrie shells as dice, was adapted by the British in the late 19th century into a simplified version that became a global classic. By what name do we know this modern game?",
    a: "Ludo",
  },
  {
    n: 21,
    q: "Scheduled for 10–21 November 2025, the 30th UN Climate Change Conference (COP30) will convene in a city nestled at the edge of the Amazon rainforest—marking a symbolic shift toward environmental urgency. Which Brazilian city is set to host COP30 in 2025?",
    a: "Belém",
  },
  {
    n: 22,
    q: "What specific fear is ‘Venustraphobia’.",
    a: "Fear of beautiful women",
  },
  {
    n: 24,
    q: "Which upcoming open-world action-adventure video game, developed by Rockstar Games and set in the fictional state of Leonida, features a female protagonist named Lucia and is scheduled for release in May 2026?",
    a: "Grand Theft Auto VI / GTA VI",
  },
  {
    n: 25,
    q: "Which chemical solution is named for its ability to dissolve the \"royal metals\" gold and platinum?",
    a: "Aqua regia",
  },
  {
    n: 26,
    q: "Which country became the newest member of NATO on 7th March 2024?",
    a: "Sweden",
  },
  {
    n: 27,
    q: "Created in 1887, what is the world’s most widely spoken constructed international auxiliary language?",
    a: "Esperanto",
  },
  {
    n: 29,
    q: "Which Asian country has had the same head of state since it became independent?",
    a: "Brunei",
  },
];

// Flash card: the question is on the front; flipping shows the answer.
const quizCard = document.getElementById("quizCard");
if (quizCard) {
  const qNum = document.getElementById("qNum");
  const qText = document.getElementById("qText");
  const qAnswerText = document.getElementById("qAnswerText");
  const qFlip = document.getElementById("qFlip");
  const qLive = document.getElementById("qLive");
  const qFront = qFlip.querySelector(".flashcard-front");
  const qBack = document.getElementById("qBack");
  let current = 0;

  // The answer is only written into the page while the card is flipped
  const setFlipped = (flipped) => {
    const item = warmupQuestions[current];
    qAnswerText.textContent = flipped ? item.a : "";
    qFlip.classList.toggle("flipped", flipped);
    qFront.setAttribute("aria-hidden", String(flipped));
    qBack.setAttribute("aria-hidden", String(!flipped));
    qFlip.setAttribute("aria-expanded", String(flipped));
    qLive.textContent = flipped ? `Answer: ${item.a}` : "";
  };

  const show = (index) => {
    current = (index + warmupQuestions.length) % warmupQuestions.length;
    const item = warmupQuestions[current];
    qNum.textContent = item.n;
    qText.textContent = item.q;
    setFlipped(false);
  };

  qFlip.addEventListener("click", () => {
    const flipped = !qFlip.classList.contains("flipped");
    setFlipped(flipped);
    if (flipped && typeof window.gtag === "function") {
      window.gtag("event", "warmup_reveal", {
        question: warmupQuestions[current].n,
      });
    }
  });
  document.getElementById("qNext").addEventListener("click", () => show(current + 1));
  document.getElementById("qPrev").addEventListener("click", () => show(current - 1));

  show(0);
}

// Google Apps Script endpoint shared by the contact and "Get notified" forms.
// It is called with mode "no-cors", so the response is opaque: only a network
// failure can be detected, not a rejection by the script.
const formEndpoint =
  "https://script.google.com/macros/s/AKfycbwDldZ2ZJGRvpFkuNC1hUQ22qTc4x8GG8gn9eSjnX29FQYWg_2E_v8xWwoARj8Lxvw0/exec";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sendingLabel =
  '<svg class="icon icon-spin" aria-hidden="true"><use href="#icon-loader"></use></svg> Sending…';

// "Get notified" sign-up. Sent through the contact endpoint in the same shape
// as a contact message (name, email, subject, message), so it needs no change
// to the deployed script; the subject marks it as a sign-up.
const notifyForm = document.getElementById("notifyForm");
if (notifyForm) {
  const emailInput = document.getElementById("notifyEmail");
  const emailError = document.getElementById("notifyEmailError");
  const notifyStatus = document.getElementById("notifyStatus");
  const submitBtn = notifyForm.querySelector('button[type="submit"]');
  const mailto = notifyForm.getAttribute("action");
  const successMessage = "Thanks! We’ll email you when registration opens.";
  let sending = false;

  const setNotifyStatus = (type, html) => {
    notifyStatus.className = "form-status" + (type ? " " + type : "");
    notifyStatus.innerHTML = html;
  };

  const validateEmail = () => {
    const value = emailInput.value.trim();
    let message = "";
    if (!value) message = "Email is required.";
    else if (!emailPattern.test(value))
      message = "Please enter a valid email address.";
    const group = emailInput.closest(".form-group");
    group.classList.toggle("error", !!message);
    group.classList.toggle("valid", !message);
    emailInput.setAttribute("aria-invalid", String(!!message));
    emailError.textContent = message;
    emailError.style.display = message ? "block" : "none";
    return !message;
  };

  emailInput.addEventListener("blur", () => {
    if (emailInput.value.trim()) validateEmail();
  });

  notifyForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    setNotifyStatus("", "");

    if (!validateEmail()) {
      setNotifyStatus("error", "Please fix the email address and try again.");
      emailInput.focus();
      return;
    }
    // Honeypot: people never see this field, so a value means a bot
    if (notifyForm.elements.website.value) {
      setNotifyStatus("success", successMessage);
      notifyForm.reset();
      return;
    }

    const name = notifyForm.elements.name.value.trim();
    const school = notifyForm.elements.school.value.trim();
    const payload = {
      name: name || "Not given",
      email: emailInput.value.trim(),
      subject: "Notify me — MindQuest 2.0 registration",
      message:
        "Please notify me when MindQuest 2.0 registration opens." +
        (school ? ` School: ${school}` : ""),
    };

    sending = true;
    const originalContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = sendingLabel;

    try {
      await fetch(formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        mode: "no-cors",
      });
      setNotifyStatus("success", successMessage);
      notifyForm.reset();
      emailInput.closest(".form-group").classList.remove("valid");
      if (readConsent() === "accepted") {
        trackCTAClick("Notify sign-up", "Register");
      }
    } catch (err) {
      setNotifyStatus(
        "error",
        `We could not sign you up just now. Please <a href="${mailto}">email us instead</a>.`
      );
    } finally {
      sending = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }
  });
}

// Contact form
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const endpoint = formEndpoint;
  const statusContainer = document.getElementById("contactStatus");
  const fieldIds = ["contactName", "contactEmail", "subject", "message"];

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
    submitBtn.innerHTML = sendingLabel;

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
