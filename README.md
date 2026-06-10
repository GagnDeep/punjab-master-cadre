# Punjab Master Cadre 2026 - Platform Scaffold

This is the production-grade static platform for the Punjab Master Cadre 2026 exam-prep course. It consists of a vanilla HTML/CSS/JS frontend with no build steps, deployable via GitHub Pages.

## Architecture

*   **No build step:** Pure HTML/CSS/JS. Avoids complex tooling overhead and ensures long-term maintainability.
*   **Design System:** CSS custom properties (`assets/css/design-system.css`) acting as the single source of truth for colors, typography, spacing, etc.
*   **Data Driven:** Course catalog and quizzes are powered by JSON files (`assets/data/course.json`, etc.).
*   **Component Logic:**
    *   Quiz Engine (`assets/js/quiz-engine.js`): Parses quiz JSON and creates interactive UIs.
    *   Slides Framework (`assets/js/slides.js`, `assets/css/slides.css`): A lightweight, 16:9 responsive presentation layer.

## File Ownership Rules

*   **Core Assets (`assets/`, `templates/`, `docs/`, `demo/`, `index.html`, `courses.html`):** Modified by platform and core structural changes.
*   **Subjects (`subjects/<slug>/`):** **CRITICAL:** When adding or editing content for a specific subject, parallel sessions or contributors *must only touch files within their respective subject's directory*. Do not modify the design system, schemas, or shell files while working on subject content.

## Local Preview Instructions

Since the application fetches JSON data locally, you need a local web server to avoid CORS issues.

1.  Open your terminal and navigate to the project root.
2.  Run a local Python HTTP server:
    ```bash
    python3 -m http.server 8000
    ```
    *(Alternatively, use `npx serve` or any other static file server).*
3.  Open `http://localhost:8000` in your web browser.

## Schemas & Documentation
See `docs/schemas.md` for JSON structures, the 7-beat lesson format, and slide design rules.
