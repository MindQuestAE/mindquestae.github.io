# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static website for MindQuest, a 1st Annual General Knowledge Quiz Competition for Indian high school students in the UAE. The project consists of a single-page HTML application with separated CSS and JavaScript files for better maintainability.

## Architecture

**Modular File Structure:**
- `index.html` - Main HTML structure with semantic sections
- `assets/styles.css` - External CSS file with complete styling
- `assets/script.js` - External JavaScript file with all functionality
- `assets/` - Contains logo images, design assets, and favicon resources
  - `mindquest-logomark.png` - Primary navigation logo
  - `mindquestlogo-01.png`
  - `mindquestlogomark-01.png` 
  - `mindquestlogowithtag-01.png` - Hero section logo
  - `pattern-01.png` - Background pattern asset
  - `gecbta-loga.png` - GECBTA organizer logo
  - `ackaf-logo.png` - AKCAF organizer logo
  - `favicon/` - Complete favicon package for all devices

**Key Design System:**
- Brand colors: Oxford Blue (#0A2155), Minion Yellow (#F9D84B), Slate Gray (#4F4F4F), Sky Blue (#B3D4FC)
- Typography: Montserrat (headings), Lato (body text)
- Responsive design with mobile-first approach
- Logo styling: Logos surrounded by #F9D84B rounded squares for branding consistency

## Development Commands

This is a static HTML website with no build process or dependency management. Development can be done by:

1. **Local Development:** Open `index.html` directly in a browser
2. **Live Server:** Use any HTTP server like Python's built-in server:
   ```bash
   python -m http.server 8000
   ```
   or Node.js http-server:
   ```bash
   npx http-server
   ```

## Code Organization

**HTML Structure (index.html):**
- Semantic navigation with smooth scrolling links to all sections
- Hero section with event information and CTA buttons
- About section with feature highlights
- Event details section with comprehensive information cards
- Registration section with multi-field form and validation
- Schedule section with timeline layout
- Organizers section with GECBTA and AKCAF information
- Resources section with downloadable materials
- FAQ section with interactive accordion functionality
- Contact section with contact information and message form
- Footer with organized navigation links

**JavaScript Features (assets/script.js):**
- Mobile navigation hamburger toggle
- Smooth scrolling navigation with offset calculation
- Scroll progress indicator and navbar effects
- Intersection Observer animations for sections
- Form validation and submission handlers for both registration and contact forms
- FAQ accordion toggle functionality with exclusive opening
- Counter animations for statistics
- Parallax effects and enhanced interactions
- Error handling for images

**CSS Features (assets/styles.css):**
- CSS Grid and Flexbox layouts for responsive design
- CSS custom properties for consistent theming
- Responsive breakpoints at 768px
- Animation keyframes for morphing shapes and loading effects
- Backdrop filters for glass morphism effects
- Enhanced button hover effects and transitions
- Timeline styling for schedule section
- Card-based layouts for resources and FAQ sections
- Footer styling with organized link structure

## Content Management

**Event Information:**
- Event date: October 19, 2025
- Registration: June 30 - October 12, 2025
- Organizers: GECBTA in association with AKCAF
- Target audience: Indian high school students (Grades 9-12) in UAE
- Venue: Al Qusais, Dubai

**Sections Included:**
- Hero with event overview and quick actions
- About with competition benefits
- Event Details with format, eligibility, dates, and rules
- Registration form with required student information
- Schedule with detailed timeline from registration to finals
- Organizers with GECBTA and AKCAF information and links
- Resources with preparation materials
- FAQ with common questions and answers
- Contact with multiple contact methods and message form

**Form Handling:**
- Registration form with comprehensive student information collection
- Contact form for inquiries and support
- Client-side validation with visual feedback
- Success/error animations and messaging
- Required field validation before submission

## Styling Guidelines

- Uses CSS custom properties for consistent theming across all components
- Mobile-first responsive design with optimized layouts for all screen sizes
- Consistent spacing and typography scale throughout
- Card-based components with hover effects and shadows
- Smooth animations and transitions for enhanced user experience
- Logo branding with yellow rounded background styling
- Pattern backgrounds for visual depth
- Color-coded sections for visual hierarchy

## External Dependencies

- Google Fonts: Montserrat and Lato font families
- Font Awesome 6.0.0 for icons throughout the interface
- No JavaScript frameworks or build tools required
