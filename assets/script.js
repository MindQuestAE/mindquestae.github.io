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

// It is called with mode "no-cors", so the response is opaque: only a network
// failure can be detected, not a rejection by the script.
const formEndpoint =
  "https://script.google.com/macros/s/AKfycbwg-LGn1et_VcZDOcvVT4jBDeH97XeVluAsaxawfNChfvcBI7cuuoeVdxsUOImv_j8j/exec";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalizeUaePhone = (raw) => {
  if (!/^\+?[\d\s().-]+$/.test(raw)) return { value: "", error: "Phone numbers can only contain digits, spaces, dashes and a leading +." };
  let digits = raw.replace(/[\s().-]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00971")) digits = digits.slice(5);
  else if (digits.startsWith("971")) digits = digits.slice(3);
  else if (digits.startsWith("0")) digits = digits.slice(1);
  const value = "+971" + digits;
  const mobile = /^\+971(50|52|54|55|56|58)\d{7}$/.test(value);
  const landline = /^\+971[234679]\d{7}$/.test(value);
  if (mobile || landline) return { value, error: "" };
  if (/^(?:\+?971|0)/.test(raw.replace(/[\s().-]/g, ""))) {
    const count = digits.length;
    const needed = /^\+971[234679]/.test(value) ? 8 : 9;
    return { value, error: `Enter a UAE number such as 050 123 4567 or +971 50 123 4567. You entered ${count} digits after the country code; this number needs ${needed}.` };
  }
  return { value, error: "Enter a UAE number such as 050 123 4567 or +971 50 123 4567." };
};
const normalizeEmiratesId = (raw) => raw.replace(/[\s-]/g, "");
const formatUaePhone = (value) => value.replace(/^\+971(\d{2})(\d{3})(\d{4})$/, "+971 $1 $2 $3").replace(/^\+971([234679])(\d{3})(\d{4})$/, "+971 $1 $2 $3");
const formatEmiratesId = (value) => value.replace(/^(\d{3})(\d{4})(\d{7})(\d)$/, "$1-$2-$3-$4");
const ageOn = (iso, now = new Date()) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (date.getUTCFullYear() !== Number(y) || date.getUTCMonth() !== Number(m) - 1 || date.getUTCDate() !== Number(d)) return null;
  return now.getFullYear() - Number(y) - (now.getMonth() + 1 < Number(m) || (now.getMonth() + 1 === Number(m) && now.getDate() < Number(d)) ? 1 : 0);
};
const parseDob = (raw) => {
  const trimmed = raw.trim();
  const localized = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  const iso = localized ? `${localized[3]}-${String(localized[2]).padStart(2, "0")}-${String(localized[1]).padStart(2, "0")}` : trimmed;
  return ageOn(iso) === null ? null : iso;
};
const isoDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const sendingLabel =
  '<svg class="icon icon-spin" aria-hidden="true"><use href="#icon-loader"></use></svg> Sending…';

const registrationEndpoint =
  "https://script.google.com/macros/s/AKfycbz0dCZwiRDXEtQoiEgSKZyPW5uMcWM62mkJInbvX1dxfx27Fn0-Ob6ksFnH3NpesggK/exec";
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
  const status = document.getElementById("registrationStatus");
  const submit = registrationForm.querySelector('button[type="submit"]');
  const fields = [...registrationForm.querySelectorAll("[required], [name^=curriculumOther]")];
  const todayDate = new Date();
  const today = isoDate(todayDate);
  const oldestDate = new Date(todayDate.getFullYear() - 25, todayDate.getMonth(), todayDate.getDate());
  const youngestDate = new Date(todayDate.getFullYear() - 8, todayDate.getMonth(), todayDate.getDate());
  let sending = false;
  let schoolsLoading = false;
  let summaryFields = [];

  const setStatus = (type, message) => {
    status.className = "form-status" + (type ? " " + type : "");
    status.textContent = message;
  };
  const updateSummary = () => {
    if (!summaryFields.length) {
      setStatus("", "");
      return;
    }
    const labels = summaryFields.map((field) => {
      const participant = field.closest("fieldset")?.querySelector("legend")?.textContent;
      const label = field.name === "consent" ? "Parent/guardian permission" : field.labels?.[0]?.textContent?.trim() || "Field";
      return `${participant ? participant + " — " : ""}${label}`;
    });
    const count = summaryFields.length;
    const duplicate = summaryFields.some((field) => field.name === "emiratesId2" && document.getElementById(field.id + "Error").textContent.startsWith("Participant 2 has the same Emirates ID"));
    const suffix = duplicate ? " Please enter two different participants." : "";
    setStatus("error", `${count} ${count === 1 ? "problem" : "problems"} to fix: ${labels.join(", ")}.${suffix}`);
  };
  const removeFromSummaryWhenValid = (field) => {
    const candidate = field.name === "emiratesId1" && summaryFields.includes(registrationForm.elements.emiratesId2)
      ? registrationForm.elements.emiratesId2
      : field;
    if (summaryFields.includes(candidate) && validateField(candidate)) {
      summaryFields = summaryFields.filter((item) => item !== candidate);
      updateSummary();
    }
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let message = "";
    if (!field.disabled) {
      if (field.type === "checkbox") {
        if (!field.checked) message = "Tick the box to confirm a parent or guardian has given permission.";
      } else if (field.type === "email") {
        if (!value) message = "Enter an email address.";
        else if (!emailPattern.test(value)) message = "That doesn't look like an email address — check for a missing @ or domain.";
      } else if (/^(firstName|lastName)/.test(field.name)) {
        const first = field.name.startsWith("firstName");
        if (!value) message = first ? "Enter the student's first name." : "Enter the student's last name.";
        else if (value.length > 50 || !/^[\p{L}\p{M} .'-]+$/u.test(value)) message = "Names can only contain letters, spaces, hyphens and apostrophes.";
      } else if (field.type === "tel") {
        message = value ? normalizeUaePhone(value).error : "Enter a phone number we can reach you on.";
      } else if (field.name.startsWith("emiratesId")) {
        if (!value) message = "Enter the Emirates ID number printed on the card.";
        else if (!/^[\d\s-]+$/.test(value)) message = "Use digits only; dashes and spaces are fine.";
        else {
          const digits = normalizeEmiratesId(value);
          if (digits.length !== 15) message = `An Emirates ID has 15 digits (784-YYYY-NNNNNNN-C). You entered ${digits.length}.`;
          else if (!digits.startsWith("784")) message = "UAE Emirates IDs start with 784.";
          else if (field.name === "emiratesId2" && digits === normalizeEmiratesId(registrationForm.elements.emiratesId1.value)) message = "Participant 2 has the same Emirates ID as participant 1. Each student needs their own.";
        }
      } else if (field.name.startsWith("dob")) {
        const dobValue = parseDob(value);
        const age = dobValue ? ageOn(dobValue, todayDate) : null;
        if (!value) message = "Enter the student's date of birth.";
        else if (age === null) message = "Enter a valid date of birth.";
        else if (dobValue > today) message = "Date of birth can't be in the future.";
        else if (age < 8 || age > 25) message = `Please check the year — that date gives an age of ${age}.`;
      } else if (field.name.startsWith("school")) {
        if (!value) message = "Enter or choose the student's school.";
      } else if (field.name.startsWith("curriculumOther")) {
        if (value.length < 2 || value.length > 60) message = "Tell us which curriculum.";
      } else if (field.name.startsWith("curriculum")) {
        if (!value) message = "Choose a curriculum.";
      } else if (field.name.startsWith("grade")) {
        if (!value) message = field.closest("fieldset").querySelector('[name^="curriculum"]').value === "British" ? "Choose a year." : "Choose a grade.";
      } else if (!value) message = "This field is required.";
    }
    field.closest(".form-group")?.classList.toggle("error", !!message);
    field.setAttribute("aria-invalid", String(!!message));
    const error = document.getElementById(field.id + "Error");
    error.textContent = message;
    error.style.display = message ? "block" : "none";
    return !message;
  };

  for (const field of fields) {
    field.addEventListener("blur", () => {
      const valid = validateField(field);
      const idOne = normalizeEmiratesId(registrationForm.elements.emiratesId1.value);
      const idTwo = normalizeEmiratesId(registrationForm.elements.emiratesId2.value);
      if (!valid && field.name === "emiratesId2" && idOne.length === 15 && idOne.startsWith("784") && idOne === idTwo) {
        summaryFields = [field];
        updateSummary();
      }
    });
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(field);
      removeFromSummaryWhenValid(field);
      if (field.name.startsWith("dob")) updateDobHint(field);
    });
    field.addEventListener("change", () => { if (field.getAttribute("aria-invalid") === "true") validateField(field); removeFromSummaryWhenValid(field); if (field.name.startsWith("dob")) updateDobHint(field); });
    field.addEventListener("blur", () => { if (field.type !== "checkbox") field.value = field.value.trim(); });
  }
  const updateDobHint = (dob) => {
    const suffix = dob.name.slice(-1);
    const parsed = parseDob(dob.value);
    const age = parsed ? ageOn(parsed, todayDate) : null;
    const grade = Number(document.getElementById("grade" + suffix).value);
    document.getElementById(dob.id + "Hint").textContent = age !== null && grade && (age < grade + 2 || age > grade + 10) ? "Double-check the date of birth or grade." : "";
  };
  for (const i of [1, 2]) {
    document.getElementById("dob" + i).max = today;
    document.getElementById("dob" + i).min = isoDate(oldestDate);
    document.getElementById("grade" + i).addEventListener("change", () => updateDobHint(document.getElementById("dob" + i)));
    document.getElementById("phone" + i).addEventListener("blur", (event) => {
      const parsed = normalizeUaePhone(event.target.value.trim());
      if (!parsed.error) event.target.value = formatUaePhone(parsed.value);
    });
    document.getElementById("emiratesId" + i).addEventListener("blur", (event) => {
      const digits = normalizeEmiratesId(event.target.value.trim());
      if (digits.length === 15 && digits.startsWith("784")) event.target.value = formatEmiratesId(digits);
    });
    const curriculum = document.getElementById("curriculum" + i);
    const other = document.getElementById("curriculumOther" + i);
    const syncCurriculum = () => {
      const show = curriculum.value === "Other";
      document.getElementById(other.id + "Group").hidden = !show;
      other.disabled = !show;
      other.required = show;
      if (!show) {
        other.value = "";
        validateField(other);
      }
      const british = curriculum.value === "British";
      [...document.getElementById("grade" + i).options].slice(1).forEach((option) => {
        option.textContent = british ? "Year " + (Number(option.value) + 1) : "Grade " + option.value;
      });
    };
    curriculum.addEventListener("change", syncCurriculum);
    registrationForm.addEventListener("reset", () => queueMicrotask(syncCurriculum));
    document.getElementById("school" + i).addEventListener("focus", async () => {
      if (schoolsLoading) return;
      schoolsLoading = true;
      try {
        const response = await fetch("./assets/schools.json", { signal: AbortSignal.timeout(10000) });
        if (!response.ok) {
          schoolsLoading = false;
          return;
        }
        const schools = await response.json();
        if (!Array.isArray(schools) || !schools.every((school) => typeof school === "string")) {
          schoolsLoading = false;
          return;
        }
        const options = schools.map((school) => {
          const option = document.createElement("option");
          option.value = school;
          return option;
        });
        document.getElementById("registrationSchools").replaceChildren(...options);
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        schoolsLoading = false;
      }
    });
  }

  registrationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (sending) return;
    summaryFields = [];
    setStatus("", "");
    if (registrationForm.elements.website.value) {
      setStatus("success", "Thanks. Please wait for confirmation from the organisers.");
      return;
    }
    const idOne = normalizeEmiratesId(registrationForm.elements.emiratesId1.value.trim());
    const idTwo = normalizeEmiratesId(registrationForm.elements.emiratesId2.value.trim());
    if (idOne.length === 15 && idOne.startsWith("784") && idOne === idTwo) {
      const duplicateId = registrationForm.elements.emiratesId2;
      validateField(duplicateId);
      summaryFields = [duplicateId];
      updateSummary();
      duplicateId.focus();
      duplicateId.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    const invalid = fields.filter((field) => !validateField(field));
    if (invalid.length) {
      summaryFields = invalid;
      updateSummary();
      invalid[0].focus();
      invalid[0].scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }

    const body = new FormData(registrationForm);
    for (const [key, value] of body) {
      if (typeof value === "string") body.set(key, value.trim());
    }
    for (const i of [1, 2]) {
      body.set("phone" + i, normalizeUaePhone(registrationForm.elements["phone" + i].value).value);
      body.set("emiratesId" + i, normalizeEmiratesId(registrationForm.elements["emiratesId" + i].value));
      body.set("dob" + i, parseDob(registrationForm.elements["dob" + i].value));
    }
    body.delete("website");
    body.set("edition", "MindQuest 2.0");
    body.set("school", body.get("school1") === body.get("school2")
      ? body.get("school1") : body.get("school1") + " / " + body.get("school2"));
    body.set("grade", body.get("grade1") === body.get("grade2")
      ? body.get("grade1") : body.get("grade1") + " / " + body.get("grade2"));

    sending = true;
    submit.disabled = true;
    submit.textContent = "Sending registration…";
    registrationForm.setAttribute("aria-busy", "true");
    try {
      await fetch(registrationEndpoint, {
        method: "POST",
        body,
        mode: "no-cors",
        signal: AbortSignal.timeout(30000),
      });
      setStatus("success", "Submission sent. Please wait for confirmation from the organisers. If you do not hear from us, email register.mindquest@gmail.com.");
      registrationForm.reset();
      fields.forEach((field) => {
        field.closest(".form-group").classList.remove("error");
        field.removeAttribute("aria-invalid");
        document.getElementById(field.id + "Error").style.display = "none";
      });
      if (readConsent() === "accepted") trackCTAClick("Registration submitted", "Register");
      status.focus();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setStatus("error", "We could not send your registration. Your details are still here. Please try again or email the organisers using the link below.");
      status.focus();
    } finally {
      sending = false;
      submit.disabled = false;
      submit.textContent = "Submit registration";
      registrationForm.removeAttribute("aria-busy");
    }
  });
}

// Contact form
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  const endpoint = formEndpoint;
  const statusContainer = document.getElementById("contactStatus");
  const fieldIds = ["contactName", "contactEmail", "subject", "message"];
  let summaryFields = [];
  let summaryActive = false;

  const setStatus = (type, message) => {
    statusContainer.className = "form-status" + (type ? " " + type : "");
    statusContainer.textContent = message;
  };
  const updateSummary = () => {
    if (!summaryFields.length) {
      setStatus("", "");
      return;
    }
    const labels = summaryFields.map((input) => input.labels?.[0]?.textContent?.trim() || "Field");
    const count = summaryFields.length;
    setStatus("error", `${count} ${count === 1 ? "problem" : "problems"} to fix: ${labels.join(", ")}. Please fix the highlighted fields.`);
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
        if (!value) errorMessage = "Enter your name.";
        else if (value.length < 2 || value.length > 50) errorMessage = "Name must be between 2 and 50 characters.";
        break;
      case "contactEmail":
        if (!value) errorMessage = "Enter an email address.";
        else if (!emailPattern.test(value)) errorMessage = "That doesn't look like an email address — check for a missing @ or domain.";
        break;
      case "subject":
        if (!value) errorMessage = "Enter a subject.";
        else if (value.length < 3) errorMessage = `Subject must be at least 3 characters, you have ${value.length}.`;
        else if (value.length > 100) errorMessage = `Subject must be at most 100 characters, you have ${value.length - 100} too many.`;
        break;
      case "message":
        if (!value) errorMessage = "Enter a message.";
        else if (value.length < 10) errorMessage = `Message must be at least 10 characters, you have ${value.length}.`;
        else if (value.length > 1000) errorMessage = `Message must be at most 1000 characters, you have ${value.length - 1000} too many.`;
        break;
    }

    setFieldState(input, !errorMessage, errorMessage);
    return !errorMessage;
  };

  const inputs = fieldIds.map((id) => document.getElementById(id));
  const updateCount = (input) => {
    if (input.id !== "subject" && input.id !== "message") return;
    const limit = input.id === "subject" ? 100 : 1000;
    const remaining = limit - input.value.length;
    document.getElementById(input.id + "Count").textContent = remaining >= 0 ? `${remaining} characters remaining` : `${-remaining} characters over the limit`;
  };
  inputs.forEach((input) => {
    input.addEventListener("blur", () => { input.value = input.value.trim(); validateField(input); });
    input.addEventListener("input", () => {
      updateCount(input);
      if (summaryActive) {
        if (input.getAttribute("aria-invalid") === "true") validateField(input);
        summaryFields = inputs.filter((item) => item.getAttribute("aria-invalid") === "true");
        updateSummary();
      } else if (input.getAttribute("aria-invalid") === "true") {
        validateField(input);
      }
    });
  });
  inputs.forEach(updateCount);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    summaryFields = [];
    summaryActive = false;
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
      const invalid = inputs.filter((input) => input.getAttribute("aria-invalid") === "true");
      summaryFields = invalid;
      summaryActive = true;
      updateSummary();
      invalid[0]?.focus();
      invalid[0]?.scrollIntoView({ block: "center", behavior: "smooth" });
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
        redirect: "follow", // Apps Script answers through a redirect
        headers: { "Content-Type": "text/plain;charset=utf-8" }, // text/plain avoids the preflight OPTIONS request
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
