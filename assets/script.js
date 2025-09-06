// Enhanced Mobile Navigation
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");
const navbar = document.getElementById("navbar");
// Make schoolsList globally available
window.schoolsList = [
  "Repton School - DUBAI",
  "South View School (SVS) - DUBAI",
  "Repton Al Barsha - DUBAI",
  "Emirates International School (EIS) Meadows - DUBAI",
  "Emirates International School (EIS) Jumeirah - DUBAI",
  "The English College Dubai - DUBAI",
  "Sunmarke School - DUBAI",
  "Dwight School Dubai - DUBAI",
  "The Aquila School - DUBAI",
  "Al Nibras International Private School - DUBAI",
  "Dubai Heights Academy (DHA) - DUBAI",
  "Regent International Private School - DUBAI",
  "Dove Green Private School - DUBAI",
  "Star International School Al Twar - DUBAI",
  "Brighton College Dubai - Dubai",
  "Horizon International School (HIS) - DUBAI",
  "Star International School Mirdif - DUBAI",
  "Safa Community School (SCS) - DUBAI",
  "School of Modern Skills (SMS) - DUBAI",
  "Al Salam Community School - DUBAI",
  "Royal Grammar School Guildford Dubai (RGS) - DUBAI",
  "Bloom World Academy - DUBAI",
  "Dubai Scholars Private School - DUBAI",
  "Durham School - DUBAI",
  "Safa British School (SBS) - DUBAI",
  "Hartland International School - Dubai",
  "Uptown International School - DUBAI",
  "Swiss International Scientific School Dubai (SISD) - DUBAI",
  "Al Salam Private School - DUBAI",
  "American Academy for Girls - DUBAI",
  "Bright Learners Private School - DUBAI",
  "Scholars International Academy - Sharjah",
  "Smart Vision School - DUBAI",
  "Clarion School - DUBAI",
  "iCademy - Dubai",
  "North London Collegiate School Dubai (NLCS) - Dubai",
  "The Arbor School - DUBAI",
  "Ajyal International School - MBZ - Abu Dhabi",
  "Horizon Private School (HPS) - American Branch - Abu Dhabi",
  "School Y - Dubai",
  "Ambassador International Academy - DUBAI",
  "American School of Creative Science - DUBAI",
  "Capital School - DUBAI",
  "Dubai British School (DBS) - DUBAI",
  "GEMS World Academy (GWA) - DUBAI",
  "Ignite School - Dubai",
  "International School of Creative Science - DUBAI",
  "Kent College Dubai - DUBAI",
  "Kings School Al Barsha - DUBAI",
  "Raffles International School - DUBAI",
  "Al Arqam Private School - DUBAI",
  "Al Diyafah High School - DUBAI",
  "Al Eman Private School - DUBAI",
  "Al Ittihad Private School Al Mamzar - DUBAI",
  "Al Ittihad Private School Jumeira - DUBAI",
  "Al Maaref Private School - DUBAI",
  "Al Mawakeb School Al Barsha - DUBAI",
  "Al Mawakeb School Al Garhoud - DUBAI",
  "Al Mawakeb School Al Khawaneej - DUBAI",
  "Al Rashid Al Saleh Private School - DUBAI",
  "Al Sadiq Islamic English School - DUBAI",
  "Al Shurooq Private School - DUBAI",
  "Ambassador School - DUBAI",
  "American International School - DUBAI",
  "American School of Dubai (ASD) - DUBAI",
  "Apple International School - DUBAI",
  "Arab Unity School - DUBAI",
  "Bright Riders School - DUBAI",
  "Buds Public School - DUBAI",
  "Cambridge International School - DUBAI",
  "Collegiate International School - DUBAI",
  "Credence High School - DUBAI",
  "Crescent English School - DUBAI",
  "Deira International School (DIS) - DUBAI",
  "Delhi Private School - DUBAI",
  "Dubai British School (DBS) Jumeirah Park - DUBAI",
  "Dubai Carmel School - DUBAI",
  "Dubai College (DC) - DUBAI",
  "Dubai English Speaking College (DESC) - DUBAI",
  "Dubai Gem Private School - DUBAI",
  "Dubai International Academy (DIA) - DUBAI",
  "Dubai International Academy (DIA) Al Barsha - DUBAI",
  "Dubai International School Al Garhoud - DUBAI",
  "Dubai International School Al Quoz - DUBAI",
  "Dubai National School Al Barsha - DUBAI",
  "Dubai National School Al Twar - DUBAI",
  "Dunecrest American School - DUBAI",
  "Elite English School - DUBAI",
  "English Language Private School - DUBAI",
  "Fairgreen International School - DUBAI",
  "GEMS Al Barsha National School - DUBAI",
  "GEMS Al Khaleej National School - DUBAI",
  "GEMS Dubai American Academy (DAA) - DUBAI",
  "GEMS FirstPoint School (FPS) - DUBAI",
  "GEMS Founders School (GFS) Al Mizhar - DUBAI",
  "GEMS Founders School (GFS) Dubai - DUBAI",
  "GEMS International School Al Khail - DUBAI",
  "GEMS Jumeirah College (JC) - DUBAI",
  "GEMS Legacy School Dubai - DUBAI",
  "GEMS Metropole School - DUBAI",
  "GEMS Modern Academy - DUBAI",
  "GEMS New Millennium School - DUBAI",
  "GEMS Our Own English High School - DUBAI",
  "GEMS Our Own Indian School - DUBAI",
  "GEMS Wellington Academy Al Khail (WEK) - DUBAI",
  "GEMS Wellington Academy DSO - DUBAI",
  "GEMS Wellington International School (WIS) - DUBAI",
  "GEMS Winchester School - DUBAI",
  "Global Indian International School (GIIS) - DUBAI",
  "Grammar School - DUBAI",
  "GreenField International School - DUBAI",
  "Greenwood International School - DUBAI",
  "Gulf Indian High School - DUBAI",
  "Gulf Model School - DUBAI",
  "International Academic School - DUBAI",
  "Iranian Towheed Boys School - DUBAI",
  "Islamic School for Training & Education - DUBAI",
  "Jebel Ali School - DUBAI",
  "JSS International School - DUBAI",
  "JSS Private School - DUBAI",
  "Jumeira Baccalaureate School (JBS) - DUBAI",
  "Jumeirah English Speaking School (JESS) Arabian Ranches - DUBAI",
  "Mirdif American School - DUBAI",
  "MSB Private School - DUBAI",
  "New Academy School - DUBAI",
  "New Indian Model School - DUBAI",
  "Newlands School - DUBAI",
  "Next Generation School - DUBAI",
  "North American International School - DUBAI",
  "Our Own High School - DUBAI",
  "Oxford School - DUBAI",
  "Philadelphia Private School - DUBAI",
  "Primus Private School - DUBAI",
  "Pristine Private School - DUBAI",
  "Queen International School - DUBAI",
  "Raffles World Academy - DUBAI",
  "Sabari Indian School - DUBAI",
  "School of Research Science US High School - DUBAI",
  "Sharjah American International Private School - DUBAI",
  "Sheikh Rashid Bin Saeed Islamic Institute - DUBAI",
  "Springdales School - DUBAI",
  "St. Mary Catholic High School Dubai - DUBAI",
  "St. Mary Catholic High School Muhaisnah - DUBAI",
  "The Apple International Community School - DUBAI",
  "The Central School - DUBAI",
  "The City School International - DUBAI",
  "The Indian Academy - DUBAI",
  "The Indian High School - DUBAI",
  "The Indian International School DSO - DUBAI",
  "The International School of Choueifat - DUBAI",
  "The International School of Choueifat Dubai Investment Park - DUBAI",
  "The Millenium School (TMS) - DUBAI",
  "The School of Research Science - DUBAI",
  "The Sheffield Private School - DUBAI",
  "The Westminster School - DUBAI",
  "The Winchester School - DUBAI",
  "Universal American School - DUBAI",
];

// Toggle mobile menu
hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  navMenu.classList.toggle("active");
  hamburger.classList.toggle("active");

  // Prevent scrolling when menu is open
  if (navMenu.classList.contains("active")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
});

// Close mobile menu when clicking on a link
document.querySelectorAll(".nav-menu a").forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
  });
});

// Close mobile menu when clicking outside
document.addEventListener("click", (e) => {
  if (
    navMenu.classList.contains("active") &&
    !navMenu.contains(e.target) &&
    !hamburger.contains(e.target)
  ) {
    closeMobileMenu();
  }
});

// Function to close mobile menu
function closeMobileMenu() {
  navMenu.classList.remove("active");
  hamburger.classList.remove("active");
  document.body.style.overflow = "";
}

// Close mobile menu on escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navMenu.classList.contains("active")) {
    closeMobileMenu();
  }
});

// Handle window resize
window.addEventListener("resize", () => {
  if (window.innerWidth > 768 && navMenu.classList.contains("active")) {
    closeMobileMenu();
  }
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
window.addEventListener("popstate", function (e) {
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
  document.querySelector(".scroll-progress-bar").style.width = scrolled + "%";

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
document.getElementById("contactForm").addEventListener("submit", function (e) {
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

// Enhanced Registration form handling with comprehensive validation
const registrationForm = document.getElementById("registrationForm");
if (registrationForm) {
  // Add error message container if it doesn't exist
  if (!document.getElementById("form-errors")) {
    const errorContainer = document.createElement("div");
    errorContainer.id = "form-errors";
    errorContainer.style.cssText = `
      background: #ff6b6b;
      color: white;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: none;
      border-left: 4px solid #d63031;
    `;
    registrationForm.insertBefore(errorContainer, registrationForm.firstChild);
  }

  // Enhanced email validation function
  function isValidEmail(email) {
    // Fixed regex pattern (the original had issues)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Enhanced phone validation function
  function isValidPhone(phone) {
    const phoneRegex = /^\+971[0-9]{9}$/;
    return phoneRegex.test(phone);
  }

  // Emirates ID validation function
  function isValidEmiratesId(id) {
    // Must be exactly 15 digits
    const emiratesIdRegex = /^[0-9]{15}$/;
    return emiratesIdRegex.test(id);
  }

  // Date of Birth validation function
  function isValidDateOfBirth(dateString) {
    if (!dateString) return false;

    const date = new Date(dateString);
    const minDate = new Date("2007-01-01");
    const maxDate = new Date("2012-12-31");

    // Check if date is valid
    if (isNaN(date.getTime())) return false;

    // Check if date is within the allowed range
    return date >= minDate && date <= maxDate;
  }

  // Get DOB validation error message
  function getDOBErrorMessage(dateString) {
    if (!dateString) return "Date of birth is required";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Please enter a valid date";

    const minDate = new Date("2007-01-01");
    const maxDate = new Date("2012-12-31");

    if (date < minDate) return "Date must be January 1, 2007 or later";
    if (date > maxDate) return "Date must be December 31, 2012 or earlier";

    return "Please enter a valid date between 2007-2012";
  }

  // Function to show field error
  function showFieldError(field, message) {
    // Remove existing error message
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }

    // Create error message element
    const errorElement = document.createElement("div");
    errorElement.className = "field-error";
    errorElement.style.cssText = `
      color: #ff6b6b;
      font-size: 12px;
      margin-top: 5px;
      font-weight: 500;
    `;
    errorElement.textContent = message;

    // Style the field
    field.style.borderColor = "#ff6b6b";
    field.style.boxShadow = "0 0 0 2px rgba(255, 107, 107, 0.2)";

    // Add error message after the field
    field.parentNode.appendChild(errorElement);
  }

  // Function to clear field error
  function clearFieldError(field) {
    const existingError = field.parentNode.querySelector(".field-error");
    if (existingError) {
      existingError.remove();
    }
    field.style.borderColor = "transparent";
    field.style.boxShadow = "none";
  }

  // Function to show form-level errors
  function showFormErrors(errors) {
    const errorContainer = document.getElementById("form-errors");
    if (errors.length > 0) {
      errorContainer.innerHTML = `
        <h4 style="margin: 0 0 10px 0; font-size: 16px;">Please fix the following errors:</h4>
        <ul style="margin: 0; padding-left: 20px;">
          ${errors.map(error => `<li>${error}</li>`).join('')}
        </ul>
      `;
      errorContainer.style.display = "block";
      errorContainer.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      errorContainer.style.display = "none";
    }
  }

  // Real-time validation for better UX
  function addRealTimeValidation() {
    // Email validation
    ["email1", "email2"].forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener("blur", () => {
          if (field.value.trim() && !isValidEmail(field.value.trim())) {
            showFieldError(field, "Please enter a valid email address");
          } else if (field.value.trim()) {
            clearFieldError(field);
          }
        });
      }
    });

    // Phone validation
    ["phone1", "phone2"].forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener("blur", () => {
          if (field.value.trim() && !isValidPhone(field.value.trim())) {
            showFieldError(field, "Phone must be in format +971XXXXXXXXX");
          } else if (field.value.trim()) {
            clearFieldError(field);
          }
        });
      }
    });

    // Emirates ID validation
    ["emiratesId1", "emiratesId2"].forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener("blur", () => {
          if (field.value.trim() && !isValidEmiratesId(field.value.trim())) {
            showFieldError(field, "Emirates ID must be exactly 15 digits");
          } else if (field.value.trim()) {
            clearFieldError(field);
          }
        });
      }
    });

    // Date of Birth validation
    ["dob1", "dob2"].forEach(id => {
      const field = document.getElementById(id);
      if (field) {
        field.addEventListener("blur", () => {
          if (field.value.trim() && !isValidDateOfBirth(field.value.trim())) {
            showFieldError(field, getDOBErrorMessage(field.value.trim()));
          } else if (field.value.trim()) {
            clearFieldError(field);
          }
        });

        // Also validate on change event for date inputs for immediate feedback
        field.addEventListener("change", () => {
          if (field.value.trim() && !isValidDateOfBirth(field.value.trim())) {
            showFieldError(field, getDOBErrorMessage(field.value.trim()));
          } else if (field.value.trim()) {
            clearFieldError(field);
          }
        });
      }
    });
  }

  // Initialize real-time validation
  addRealTimeValidation();

  // Enhanced form submission handler
  registrationForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const errors = [];
    let isValid = true;

    // Clear previous form errors
    showFormErrors([]);

    // Get all required fields
    const requiredFields = this.querySelectorAll("[required]");

    // Validate each field
    requiredFields.forEach((field) => {
      clearFieldError(field);

      if (!field.value.trim()) {
        isValid = false;
        showFieldError(field, "This field is required");

        // Add to form-level errors
        const label = field.previousElementSibling?.textContent || field.name;
        errors.push(`${label.replace('*', '').trim()} is required`);
      } else {
        // Field-specific validation
        if (field.type === "email") {
          if (!isValidEmail(field.value.trim())) {
            isValid = false;
            showFieldError(field, "Please enter a valid email address");
            errors.push(`Invalid email format for ${field.name}`);
          }
        } else if (field.type === "tel") {
          if (!isValidPhone(field.value.trim())) {
            isValid = false;
            showFieldError(field, "Phone must be in format +971XXXXXXXXX");
            errors.push(`Invalid phone format for ${field.name}`);
          }
        } else if (field.name.includes("emiratesId")) {
          if (!isValidEmiratesId(field.value.trim())) {
            isValid = false;
            showFieldError(field, "Emirates ID must be exactly 15 digits");
            errors.push(`Invalid Emirates ID format for ${field.name}`);
          }
        } else if (field.type === "date" && field.name.includes("dob")) {
          if (!isValidDateOfBirth(field.value.trim())) {
            isValid = false;
            const errorMessage = getDOBErrorMessage(field.value.trim());
            showFieldError(field, errorMessage);
            errors.push(`Invalid date of birth for ${field.name}: ${errorMessage}`);
          }
        }
      }
    });

    // Check if consent is checked
    const consentField = document.getElementById("consent");
    if (consentField && !consentField.checked) {
      isValid = false;
      showFieldError(consentField, "You must agree to the terms");
      errors.push("Consent is required to proceed");
    }

    if (isValid) {
      // Show success message with better UX
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = '<i class="fas fa-check"></i> Registration Submitted!';
      submitBtn.style.background = "#4CAF50";
      submitBtn.disabled = true;

      // Show success notification
      const successMessage = document.createElement("div");
      successMessage.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 15px;
        border-radius: 8px;
        margin-top: 15px;
        text-align: center;
        border-left: 4px solid #45a049;
      `;
      successMessage.innerHTML = `
        <h4 style="margin: 0 0 10px 0;">Registration Successful!</h4>
        <p style="margin: 0;">Thank you for registering for MindQuest 2025. You will receive a confirmation email shortly.</p>
      `;

      this.appendChild(successMessage);
      successMessage.scrollIntoView({ behavior: "smooth", block: "center" });

      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = "";
        submitBtn.disabled = false;
        successMessage.remove();
        this.reset();

        // Reset phone fields to +971
        document.getElementById("phone1").value = "+971";
        document.getElementById("phone2").value = "+971";
      }, 5000);
    } else {
      // Show form-level errors
      showFormErrors(errors);

      // Shake animation for invalid form
      this.style.animation = "shake 0.5s ease-in-out";
      setTimeout(() => {
        this.style.animation = "";
      }, 500);

      // Focus on first invalid field
      const firstInvalidField = this.querySelector(".field-error")?.parentNode?.querySelector("input, select, textarea");
      if (firstInvalidField) {
        firstInvalidField.focus();
      }
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

// Load schoolsList from external script
const schoolsList = window.schoolsList || [];

// Enhanced datalist population with error handling
function populateDatalist(datalistId, schools) {
  const datalist = document.getElementById(datalistId);
  if (!datalist) {
    console.warn(`Datalist with ID '${datalistId}' not found`);
    return;
  }

  datalist.innerHTML = ""; // Clear existing options

  schools.forEach((school) => {
    const option = document.createElement("option");
    option.value = school;
    datalist.appendChild(option);
  });
}

// Enhanced school input handling with validation and error handling
function addSchool(inputId, datalistId) {
  const input = document.getElementById(inputId);
  const datalist = document.getElementById(datalistId);

  // Validate elements exist
  if (!input) {
    console.warn(`Input element with ID '${inputId}' not found`);
    return;
  }
  if (!datalist) {
    console.warn(`Datalist element with ID '${datalistId}' not found`);
    return;
  }

  // Initially populate the datalist with all schools
  populateDatalist(datalistId, schoolsList);

  // Add input event listener for real-time filtering
  input.addEventListener("input", (e) => {
    const value = e.target.value.trim().toLowerCase();

    if (value === "") {
      // Show all schools when input is empty
      populateDatalist(datalistId, schoolsList);
      return;
    }

    // Filter schools based on input with improved matching
    const filteredSchools = schoolsList.filter((school) =>
      school.toLowerCase().includes(value)
    );

    populateDatalist(datalistId, filteredSchools);
  });

  // Add change event listener to handle new school addition
  input.addEventListener("change", (e) => {
    const value = e.target.value.trim();
    if (value === "") return;

    // Validate school name length
    if (value.length < 2) {
      console.warn("School name too short");
      return;
    }

    // Check if the school already exists in schoolsList
    const exists = schoolsList.some(
      (school) => school.toLowerCase() === value.toLowerCase()
    );

    // If not in the list, add it to schoolsList and update both datalists
    if (!exists) {
      schoolsList.push(value);
      populateDatalist("schools1", schoolsList);
      populateDatalist("schools2", schoolsList);
    }
  });
}

// Initialize school input functionality for both participants
document.addEventListener("DOMContentLoaded", () => {
  // Apply enhanced school input handling to both participants
  addSchool("school1", "schools1");
  addSchool("school2", "schools2");
});
