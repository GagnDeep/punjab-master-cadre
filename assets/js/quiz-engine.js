// assets/js/quiz-engine.js

class QuizEngine {
  constructor(containerId, quizDataUrl) {
    this.container = document.getElementById(containerId);
    this.quizDataUrl = quizDataUrl;
    this.quizData = null;

    // State
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = []; // Array of selected option indices
    this.timeLeft = 0;
    this.timerInterval = null;
    this.hasFinished = false;

    // DOM Elements
    this.uiContainer = null;
    this.announcer = null;

    this.init();
  }

  async init() {
    this.renderLoading();
    try {
      const response = await fetch(this.quizDataUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      this.quizData = await response.json();

      this.setupAriaAnnouncer();
      this.renderStartScreen();
    } catch (error) {
      console.error("Failed to load quiz data:", error);
      this.container.innerHTML = `<div class="callout callout-warning"><div class="callout-title">Error</div><p>Failed to load quiz data. Please try again later.</p></div>`;
    }
  }

  setupAriaAnnouncer() {
    this.announcer = document.createElement('div');
    this.announcer.setAttribute('aria-live', 'polite');
    this.announcer.className = 'sr-only'; // Assuming sr-only utility class exists or is visually hidden
    this.announcer.style.position = 'absolute';
    this.announcer.style.width = '1px';
    this.announcer.style.height = '1px';
    this.announcer.style.padding = '0';
    this.announcer.style.margin = '-1px';
    this.announcer.style.overflow = 'hidden';
    this.announcer.style.clip = 'rect(0, 0, 0, 0)';
    this.announcer.style.whiteSpace = 'nowrap';
    this.announcer.style.border = '0';
    document.body.appendChild(this.announcer);
  }

  announce(message) {
    if(this.announcer) {
        this.announcer.textContent = message;
    }
  }

  renderLoading() {
    this.container.innerHTML = `<div class="text-center p-4">Loading quiz...</div>`;
  }

  renderStartScreen() {
    const timeInfo = this.quizData.timeLimitMinutes
      ? `<p class="mb-4">⏱️ Time Limit: <strong>${this.quizData.timeLimitMinutes} minutes</strong></p>`
      : '';

    // Check for previous best score
    const bestScoreKey = `quiz_best_${this.quizData.id}`;
    const bestScore = localStorage.getItem(bestScoreKey);
    const bestScoreHtml = bestScore ? `<p class="mb-4 text-success">🏆 Your Best Score: ${bestScore}%</p>` : '';

    this.container.innerHTML = `
      <div class="card text-center">
        <h2>${this.quizData.title}</h2>
        <p class="mb-4">${this.quizData.questions.length} Questions</p>
        ${timeInfo}
        ${bestScoreHtml}
        <button class="btn btn-primary btn-lg" id="start-quiz-btn">Start Quiz</button>
      </div>
    `;

    document.getElementById('start-quiz-btn').addEventListener('click', () => this.startQuiz());
  }

  startQuiz() {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.userAnswers = new Array(this.quizData.questions.length).fill(null);
    this.hasFinished = false;

    if (this.quizData.timeLimitMinutes) {
      this.timeLeft = this.quizData.timeLimitMinutes * 60;
      this.startTimer();
    }

    this.container.innerHTML = `
      <div class="quiz-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>Question <span id="q-current">1</span> of ${this.quizData.questions.length}</div>
        <div id="quiz-timer" style="font-weight: bold; color: var(--color-danger); ${this.quizData.timeLimitMinutes ? '' : 'display:none;'}"></div>
      </div>
      <div class="progress-container mb-4">
        <div class="progress-bar" id="quiz-progress" style="width: 0%"></div>
      </div>
      <div id="quiz-body"></div>
      <div id="quiz-feedback" class="mt-4" style="display:none;"></div>
      <div class="quiz-footer mt-4" style="display: flex; justify-content: flex-end;">
         <button class="btn btn-primary" id="next-btn" style="display:none;">Next Question</button>
      </div>
    `;

    this.renderQuestion();

    // Keyboard support (1-4 keys)
    document.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleKeydown(e) {
      // Don't handle if finished or if focus is in an input
      if(this.hasFinished || ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

      const key = parseInt(e.key);
      if (key >= 1 && key <= 4) {
          const index = key - 1;
          const buttons = this.container.querySelectorAll('.option-btn');
          if(buttons[index] && !buttons[index].disabled) {
              this.handleAnswer(index);
          }
      }
  }

  startTimer() {
    this.updateTimerDisplay();
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateTimerDisplay();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.finishQuiz();
      }
    }, 1000);
  }

  updateTimerDisplay() {
    const timerEl = document.getElementById('quiz-timer');
    if (!timerEl) return;
    const m = Math.floor(this.timeLeft / 60);
    const s = this.timeLeft % 60;
    timerEl.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  renderQuestion() {
    const q = this.quizData.questions[this.currentQuestionIndex];
    document.getElementById('q-current').textContent = this.currentQuestionIndex + 1;
    document.getElementById('quiz-progress').style.width = `${((this.currentQuestionIndex) / this.quizData.questions.length) * 100}%`;
    document.getElementById('quiz-feedback').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';

    const pyqBadge = q.pyq ? `<span class="badge badge-accent mb-2" style="display:inline-block">${q.pyq}</span>` : '';
    const paText = q.qPa ? `<p class="pa mt-2 text-neutral-600">${q.qPa}</p>` : '';

    let optionsHtml = '';
    q.options.forEach((opt, idx) => {
      optionsHtml += `
        <button class="btn btn-ghost btn-block option-btn mb-2" data-index="${idx}" style="justify-content: flex-start; text-align: left; white-space: normal; height: auto;">
          <span style="margin-right: 12px; font-weight: bold; color: var(--color-neutral-500);">${idx + 1}.</span> ${opt}
        </button>
      `;
    });

    const bodyEl = document.getElementById('quiz-body');
    bodyEl.innerHTML = `
      <div class="card">
        ${pyqBadge}
        <h3 class="mb-2">${q.q}</h3>
        ${paText}
        <div class="options-container mt-4">
          ${optionsHtml}
        </div>
      </div>
    `;

    this.announce(`Question ${this.currentQuestionIndex + 1}: ${q.q}`);

    const buttons = bodyEl.querySelectorAll('.option-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(e.currentTarget.getAttribute('data-index'));
        this.handleAnswer(idx);
      });
    });
  }

  handleAnswer(selectedIndex) {
    const q = this.quizData.questions[this.currentQuestionIndex];
    this.userAnswers[this.currentQuestionIndex] = selectedIndex;
    const isCorrect = selectedIndex === q.answerIndex;

    if (isCorrect) this.score++;

    // Disable buttons and show styling
    const buttons = this.container.querySelectorAll('.option-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      if (idx === q.answerIndex) {
        btn.style.backgroundColor = 'var(--color-success-bg)';
        btn.style.borderColor = 'var(--color-success)';
        btn.style.color = 'var(--color-success)';
      } else if (idx === selectedIndex && !isCorrect) {
        btn.style.backgroundColor = 'var(--color-danger-bg)';
        btn.style.borderColor = 'var(--color-danger)';
        btn.style.color = 'var(--color-danger)';
      }
    });

    // Show feedback
    const feedbackEl = document.getElementById('quiz-feedback');
    feedbackEl.style.display = 'block';

    const statusText = isCorrect ? 'Correct!' : 'Incorrect.';
    const statusClass = isCorrect ? 'callout-tip' : 'callout-warning';

    feedbackEl.innerHTML = `
      <div class="callout ${statusClass}">
        <div class="callout-title">${statusText}</div>
        <p>${q.explanation}</p>
      </div>
    `;

    this.announce(`${statusText} ${q.explanation}`);

    // Show Next or Finish button
    const nextBtn = document.getElementById('next-btn');
    nextBtn.style.display = 'inline-flex';
    if (this.currentQuestionIndex === this.quizData.questions.length - 1) {
      nextBtn.textContent = 'Finish Quiz';
      nextBtn.onclick = () => this.finishQuiz();
    } else {
      nextBtn.textContent = 'Next Question';
      nextBtn.onclick = () => {
        this.currentQuestionIndex++;
        this.renderQuestion();
      };
    }
    nextBtn.focus();
  }

  finishQuiz() {
    this.hasFinished = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    document.removeEventListener('keydown', this.handleKeydown);

    const percentage = Math.round((this.score / this.quizData.questions.length) * 100);

    // Save to LocalStorage
    const bestScoreKey = `quiz_best_${this.quizData.id}`;
    const previousBest = parseInt(localStorage.getItem(bestScoreKey) || '0');
    if (percentage > previousBest) {
      localStorage.setItem(bestScoreKey, percentage);
    }

    // Topic breakdown
    const topicStats = {};
    this.quizData.questions.forEach((q, idx) => {
      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
      topicStats[q.topic].total++;
      if (this.userAnswers[idx] === q.answerIndex) topicStats[q.topic].correct++;
    });

    let breakdownHtml = '<ul style="list-style: none; padding:0; margin-left:0;">';
    for (const [topic, stats] of Object.entries(topicStats)) {
      breakdownHtml += `<li class="mb-2"><strong>${topic}:</strong> ${stats.correct}/${stats.total}</li>`;
    }
    breakdownHtml += '</ul>';

    this.container.innerHTML = `
      <div class="card text-center">
        <h2>Quiz Completed!</h2>
        <div class="stat-box mt-4 mb-4" style="background: ${percentage >= 60 ? 'var(--color-success-bg)' : 'var(--color-warning-bg)'}">
           <span class="stat-number" style="color: ${percentage >= 60 ? 'var(--color-success)' : 'var(--color-warning)'}">${percentage}%</span>
           <span class="stat-label">Score: ${this.score} out of ${this.quizData.questions.length}</span>
        </div>

        <div style="text-align: left; padding: var(--space-4); background: var(--color-neutral-50); border-radius: var(--radius-md);" class="mb-4">
           <h4 class="mb-2">Topic Breakdown</h4>
           ${breakdownHtml}
        </div>

        <button class="btn btn-primary" id="retry-btn">Retry Quiz</button>
      </div>
    `;

    document.getElementById('retry-btn').addEventListener('click', () => this.startQuiz());
    this.announce(`Quiz finished. Your score is ${percentage} percent.`);
  }
}

// Make globally available
window.QuizEngine = QuizEngine;
