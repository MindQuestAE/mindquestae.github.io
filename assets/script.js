// Enhanced Mobile Navigation
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const navbar = document.getElementById("navbar");

hamburger.addEventListener("click", () => {
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("active");
    hamburger.classList.remove("active");
  });
});

// Enhanced smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);
    if (target) {
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.offsetTop - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });

      // Update URL without triggering page reload
      history.pushState(null, null, targetId);
    }
  });
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.offsetTop - navHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  } else {
    // If no hash, scroll to top
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
});

// Enhanced scroll progress and navbar effects
window.addEventListener("scroll", () => {
  const scrolled =
    (window.scrollY /
      (document.documentElement.scrollHeight - window.innerHeight)) *
    100;
  document.querySelector(".scroll-progress-bar").style.width =
    scrolled + "%";

  // Navbar background effect
  if (window.scrollY > 100) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Enhanced Intersection Observer for animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -20px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");

      // Add staggered animation for cards
      if (entry.target.classList.contains("detail-card")) {
        const cards = document.querySelectorAll(".detail-card");
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add("visible");
          }, index * 200);
        });
      }
    }
  });
}, observerOptions);

// Observe all animated elements
document
  .querySelectorAll(
    ".fade-in, .slide-in-left, .slide-in-right, .scale-in, .detail-card"
  )
  .forEach((el) => {
    observer.observe(el);
  });

// Enhanced counter animation
function animateCounter(element, target) {
  let count = 0;
  const increment = target / 60;
  const timer = setInterval(() => {
    count += increment;
    if (count >= target) {
      count = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(count);
  }, 30);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll(".stat-number");
        counters.forEach((counter, index) => {
          setTimeout(() => {
            const target = parseInt(counter.getAttribute("data-target"));
            animateCounter(counter, target);
          }, index * 200);
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const statsSection = document.querySelector(".stats-grid");
if (statsSection) {
  statsObserver.observe(statsSection);
}

// Enhanced form handling
document
  .getElementById("contactForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();

    const requiredFields = this.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = "#ff6b6b";
        field.style.boxShadow = "0 0 0 2px rgba(255, 107, 107, 0.2)";
      } else {
        field.style.borderColor = "var(--minion-yellow)";
        field.style.boxShadow = "0 0 0 2px rgba(249, 216, 75, 0.2)";
      }
    });

    if (isValid) {
      // Show success message with better UX
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';
      submitBtn.style.background = "#4CAF50";

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = "";
        this.reset();
      }, 3000);
    } else {
      // Shake animation for invalid form
      this.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        this.style.animation = "";
      }, 500);
    }
  });

// Add shake animation
const style = document.createElement("style");
style.textContent = `
      @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
      }
  `;
document.head.appendChild(style);

// Enhanced parallax effect
window.addEventListener("scroll", () => {
  const scrolled = window.scrollY;
  const heroSection = document.querySelector(".hero");
  const heroContent = document.querySelector(".hero-content");
  const heroVisual = document.querySelector(".hero-visual");

  if (heroSection && scrolled <= heroSection.offsetHeight) {
    const speed = scrolled * 0.5;
    heroContent.style.transform = `translateY(${speed * 0.3}px)`;
    heroVisual.style.transform = `translateY(${speed * 0.2}px)`;
  }
});

// Enhanced loading animation
document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    document.body.classList.remove("loading");
  }, 100);
});

// Enhanced button effects
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("mouseenter", function () {
    this.style.transform = "translateY(-3px) scale(1.02)";
  });

  btn.addEventListener("mouseleave", function () {
    this.style.transform = "translateY(0) scale(1)";
  });
});

// Enhanced feature list interactions
document.querySelectorAll(".features-list li").forEach((item) => {
  item.addEventListener("mouseenter", function () {
    this.style.background = "rgba(249, 216, 75, 0.1)";
    this.style.borderRadius = "8px";
    this.style.padding = "0.5rem 1rem";
  });

  item.addEventListener("mouseleave", function () {
    this.style.background = "";
    this.style.padding = "0.5rem 0";
  });
});

// Add performance optimization
let ticking = false;
function updateScrollEffects() {
  // Scroll-based animations here
  ticking = false;
}

function requestScrollUpdate() {
  if (!ticking) {
    requestAnimationFrame(updateScrollEffects);
    ticking = true;
  }
}

window.addEventListener("scroll", requestScrollUpdate);

// FAQ Toggle
function toggleFAQ(element) {
  const answer = element.nextElementSibling;
  const icon = element.querySelector("i");

  // Close all other FAQs
  document.querySelectorAll(".faq-answer").forEach((ans) => {
    if (ans !== answer) {
      ans.classList.remove("active");
    }
  });

  document.querySelectorAll(".faq-question i").forEach((ico) => {
    if (ico !== icon) {
      ico.classList.remove("fa-chevron-up");
      ico.classList.add("fa-chevron-down");
    }
  });

  // Toggle current FAQ
  answer.classList.toggle("active");
  icon.classList.toggle("fa-chevron-down");
  icon.classList.toggle("fa-chevron-up");
}

// Registration form handling
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const requiredFields = this.querySelectorAll("[required]");
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = "#ff6b6b";
        field.style.boxShadow = "0 0 0 2px rgba(255, 107, 107, 0.2)";
      } else {
        field.style.borderColor = "transparent";
        field.style.boxShadow = "none";
      }
    });

    if (isValid) {
      // Show success message with better UX
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-check"></i> Registration Submitted!';
      submitBtn.style.background = "#4CAF50";

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = "";
        this.reset();
      }, 3000);
    } else {
      // Shake animation for invalid form
      this.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        this.style.animation = "";
      }, 500);
    }
  });
}

// Enhanced error handling for images
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("error", function () {
    this.style.display = "none";
    console.warn("Image failed to load:", this.src);
  });
});

// Make toggleFAQ function globally available
window.toggleFAQ = toggleFAQ;