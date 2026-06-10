# Documentation & Schemas

## 1. Course Catalog JSON Schema (`assets/data/course.json`)

The central manifest for the platform, defining tracks, subjects, and modules.

```typescript
type CourseCatalog = {
  tracks: string[]; // e.g., ["A", "B", "C", "D"]
  subjects: Subject[];
}

type Subject = {
  slug: string; // e.g., "punjabi", "english", "science"
  name: string; // e.g., "Punjabi"
  namePa: string; // Gurmukhi translation
  paperInfo: string;
  modules: Module[];
}

type Module = {
  id: string; // e.g., "pbi-01"
  title: string;
  estVideos: number;
  status: "available" | "coming-soon";
}
```

## 2. Quiz JSON Schema (`assets/data/*.json`)

Used to render interactive quizzes via `quiz-engine.js`.

```typescript
type Quiz = {
  id: string;
  title: string;
  timeLimitMinutes?: number; // For timed mock tests
  questions: Question[];
}

type Question = {
  id: string;
  topic: string;
  q: string; // Question text (English)
  qPa?: string; // Optional Punjabi translation (rendered with .pa class)
  options: string[]; // Exactly 4 options
  answerIndex: number; // 0-3 corresponding to the correct option
  explanation: string;
  pyq?: string; // e.g. "ERB 2022" (Previous Year Question tag)
}
```

## 3. The 7-Beat Lesson Format

Every lesson page (`templates/lesson-template.html`) must canonicaly follow these 7 structural sections:

1.  **Hook:** A PYQ (Previous Year Question) callout to establish relevance.
2.  **Objectives:** Clear, bulleted list of what the student will learn.
3.  **Concept Sections:** Core material broken down logically.
4.  **Worked Examples:** Step-by-step demonstrations.
5.  **"How ERB Asks It" Box:** specific analysis of exam-setter patterns with PYQs.
6.  **Recap Bullets:** Quick summary points.
7.  **Recall Quiz:** An embedded interactive quiz based on the Quiz Engine.
*(Plus an optional collapsible Punjabi voiceover transcript section at the end and link to the slide deck).*

## 4. Slide Design Rules (`assets/js/slides.js`, `assets/css/slides.css`)

*   **Strict 16:9 Aspect Ratio:** Slides must never overflow. They exist within a fixed 16:9 stage that scales up or down via CSS transforms (`transform: scale()`) to fit the viewport.
*   **Typography:** Text must use `clamp()` for fluid sizing relative to the container, ensuring readability on desktop and preventing wrap-overflow on mobile.
*   **Layout:**
    *   Lists that get too long must automatically flow into a second column.
    *   Avoid dense paragraphs. Use bullet points or multiple smaller slides.
*   **Required Slide Types:** Title, Bullet, Two-Column, Big-Stat, Diagram, Quote, Recap, and MCQ Recall.
*   **Accessibility:** Support keyboard navigation (Arrow keys, Space) and touch swipes.
