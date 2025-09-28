# MindQuest - Quiz Competition Website

A modern, responsive website for the MindQuest General Knowledge Quiz Competition, designed for Indian high school students in the UAE.

## 🎯 Project Overview

MindQuest is the 1st Annual General Knowledge Quiz Competition organized by GECBTA in association with AKCAF. This website serves as the primary platform for event information, student registration, and competition details.

### Event Details

- **Date**: October 19, 2025
- **Registration Period**: June 30 - October 12, 2025
- **Target Audience**: Indian high school students (Grades 9-12) in UAE
- **Venue**: Al Qusais, Dubai
- **Organizers**: GECBTA & AKCAF

## 🏗️ Architecture

### Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Modern CSS with custom properties, Grid, and Flexbox
- **Icons**: Font Awesome 6.0.0
- **Fonts**: Google Fonts (Montserrat, Lato)
- **Architecture**: Static Single Page Application

### File Structure

```
├── index.html              # Main HTML structure
├── assets/
│   ├── styles.css         # Complete CSS styling
│   ├── script.js          # JavaScript functionality
│   ├── favicon/           # Favicon package for all devices
│   ├── mindquest-logomark.png     # Navigation logo
│   ├── mindquestlogowithtag-01.png # Hero logo
│   ├── pattern-01.png     # Background pattern
│   ├── gecbta-loga.png    # GECBTA organizer logo
│   └── ackaf-logo.png     # AKCAF organizer logo
├── CLAUDE.md              # Development documentation
└── README.md              # Project documentation
```

## 🎨 Design System

### Brand Colors

- **Oxford Blue**: `#0A2155` - Primary brand color
- **Minion Yellow**: `#F9D84B` - Accent and highlight color
- **Sky Blue**: `#B3D4FC` - Secondary accent
- **Slate Gray**: `#4F4F4F` - Text color
- **White**: `#FFFFFF` - Background and contrast

### Typography

- **Headings**: Montserrat (400, 500, 600, 700, 800)
- **Body Text**: Lato (300, 400, 500, 600, 700)
- **Responsive**: clamp() functions for fluid typography

### Logo Styling

All logos are surrounded by #F9D84B rounded squares for consistent branding.

## 🌟 Features

### 📱 Responsive Design

- Mobile-first approach with 768px breakpoint
- Optimized layouts for all screen sizes
- Touch-friendly navigation and interactions

### 🎭 Interactive Elements

- **Navigation**: Smooth scrolling with hamburger menu for mobile
- **Animations**: Intersection Observer-based scroll animations
- **Forms**: Client-side validation with visual feedback
- **FAQ**: Accordion functionality with exclusive opening
- **Scroll Progress**: Visual progress indicator

### 📋 Content Sections

1. **Hero**: Event overview with key information and CTAs
2. **About**: Competition benefits and features
3. **Event Details**: Format, eligibility, dates, and rules
4. **Registration**: Multi-field form with validation
5. **Schedule**: Timeline from registration to finals
6. **Organizers**: GECBTA and AKCAF information with links
7. **Resources**: Preparation materials and downloads
8. **FAQ**: Common questions with interactive answers
9. **Contact**: Multiple contact methods and message form
10. **Footer**: Organized navigation and links

### 🛠️ JavaScript Features

- Mobile navigation toggle
- Smooth scrolling with navbar offset
- Scroll progress and navbar effects
- Intersection Observer animations
- Form validation and submission handlers
- FAQ accordion functionality
- Counter animations for statistics
- Parallax effects and hover interactions
- Image error handling

### 🎨 CSS Features

- CSS Grid and Flexbox layouts
- CSS custom properties for theming
- Animation keyframes for morphing shapes
- Backdrop filters for glass morphism
- Utility classes for common patterns
- Responsive breakpoints
- Enhanced button and card hover effects

## 🚀 Development

### Local Development

Since this is a static website, you can simply:

1. **Direct Browser**: Open `index.html` in any modern browser
2. **Python Server**:

   ```bash
   python -m http.server 8000
   ```

3. **Node.js Server**:

   ```bash
   npx http-server
   ```

### No Build Process

- No bundlers or transpilation required
- No package.json or dependencies
- Direct browser compatibility
- Pure HTML, CSS, and JavaScript

## 🧪 Testing

### Quick Test Commands

```bash
# Run all tests with auto-server management
make test-full

# Run specific test suites
make test-success      # Success scenarios
make test-validation   # Validation & edge cases
make test-performance  # Performance tests

# Development mode
make test-watch        # Auto-reload on changes
make test-headless     # Headless browser mode
```

### Test Coverage

- **72 automated tests** covering form validation, success scenarios, and performance
- **Selenium WebDriver** with headless Chrome for CI/CD
- **Real-time validation** testing for all form fields
- **Edge cases** including invalid inputs and boundary conditions

For detailed testing documentation, see [`tests/README.md`](tests/README.md).

## 📁 Code Organization

### HTML Structure

- Semantic HTML5 elements
- Accessible navigation and forms
- SEO-optimized meta tags
- External CSS and JavaScript references

### CSS Architecture

- Modular CSS with clear section organization
- CSS custom properties for consistent theming
- Utility classes for common patterns
- Mobile-first responsive design
- Clean, maintainable code structure

### JavaScript Modules

- Modern ES6+ syntax
- Event-driven architecture
- Intersection Observer API for performance
- Form validation and error handling
- Smooth animations and transitions

## 🎯 Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Features Used**: CSS Grid, Flexbox, Custom Properties, Intersection Observer
- **Fallbacks**: Graceful degradation for older browsers

## 🤝 Contributing

### Code Style

- Use semantic HTML elements
- Follow CSS custom property naming conventions
- Maintain responsive design patterns
- Keep JavaScript modular and well-commented

### Design Guidelines

- Maintain brand color consistency
- Use established typography scale
- Follow spacing and layout patterns
- Ensure accessibility compliance

## 📞 Contact & Support

- **Email**: <info@mindquestquiz.com>
- **Phone**: +971 52 480 3447 / +971 50 295 3685
- **Facebook**: [GECBTA](https://www.facebook.com/gecbta/)
- **Website**: [AKCAF](https://akcafuae.com/)

## 📜 License

© 2025 MindQuest. All rights reserved. Organized by GECBTA in association with AKCAF.

---

*Built with ❤️ for the Indian student community in UAE*
