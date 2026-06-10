// assets/js/slides.js

class SlideDeck {
  constructor(wrapperElement) {
    this.wrapper = wrapperElement;
    this.deck = this.wrapper.querySelector('.deck');
    this.slides = Array.from(this.deck.querySelectorAll('.slide'));
    this.currentIndex = 0;

    // UI Elements (created dynamically if not present)
    this.controlsDiv = null;
    this.prevBtn = null;
    this.nextBtn = null;
    this.dotsContainer = null;
    this.fullscreenBtn = null;

    this.init();
  }

  init() {
    this.buildUI();
    this.updateScale();
    this.showSlide(this.currentIndex);

    // Event Listeners
    window.addEventListener('resize', () => this.updateScale());
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));

    // Touch support
    let touchStartX = 0;
    this.wrapper.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, {passive: true});
    this.wrapper.addEventListener('touchend', e => {
      const touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) this.next();
      if (touchEndX - touchStartX > 50) this.prev();
    }, {passive: true});
  }

  buildUI() {
    this.controlsDiv = document.createElement('div');
    this.controlsDiv.className = 'slides-controls';

    // Prev Button
    this.prevBtn = document.createElement('button');
    this.prevBtn.className = 'nav-btn prev-btn';
    this.prevBtn.innerHTML = '&#10094;'; // Left Arrow
    this.prevBtn.setAttribute('aria-label', 'Previous slide');
    this.prevBtn.addEventListener('click', () => this.prev());

    // Progress Dots
    this.dotsContainer = document.createElement('div');
    this.dotsContainer.className = 'progress-dots';
    this.slides.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      this.dotsContainer.appendChild(dot);
    });

    // Next Button
    this.nextBtn = document.createElement('button');
    this.nextBtn.className = 'nav-btn next-btn';
    this.nextBtn.innerHTML = '&#10095;'; // Right Arrow
    this.nextBtn.setAttribute('aria-label', 'Next slide');
    this.nextBtn.addEventListener('click', () => this.next());

    // Fullscreen Toggle
    this.fullscreenBtn = document.createElement('button');
    this.fullscreenBtn.className = 'fullscreen-btn';
    this.fullscreenBtn.innerHTML = '⛶';
    this.fullscreenBtn.setAttribute('aria-label', 'Toggle fullscreen');
    this.fullscreenBtn.addEventListener('click', () => this.toggleFullscreen());

    // Layout controls
    const leftGroup = document.createElement('div');
    leftGroup.style.display = 'flex';
    leftGroup.style.gap = '16px';
    leftGroup.style.alignItems = 'center';
    leftGroup.appendChild(this.prevBtn);
    leftGroup.appendChild(this.dotsContainer);
    leftGroup.appendChild(this.nextBtn);

    this.controlsDiv.appendChild(leftGroup);
    this.controlsDiv.appendChild(this.fullscreenBtn);
    this.wrapper.appendChild(this.controlsDiv);
  }

  // CRITICAL: Maintains 16:9 aspect ratio and prevents overflow by scaling the 1920x1080 stage
  updateScale() {
    const wrapperWidth = this.wrapper.clientWidth;
    const wrapperHeight = this.wrapper.clientHeight;

    // The base resolution of our slides
    const stageWidth = 1920;
    const stageHeight = 1080;

    const scaleX = wrapperWidth / stageWidth;
    const scaleY = wrapperHeight / stageHeight;

    // Use the smaller scale to ensure the whole stage fits within the wrapper
    const scale = Math.min(scaleX, scaleY);

    this.deck.style.transform = `scale(${scale})`;
  }

  showSlide(index) {
    if (index < 0) index = 0;
    if (index >= this.slides.length) index = this.slides.length - 1;
    this.currentIndex = index;

    this.slides.forEach((slide, i) => {
      if (i === this.currentIndex) {
        slide.classList.add('active');
        slide.setAttribute('aria-hidden', 'false');
      } else {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
      }
    });

    this.updateUI();
  }

  updateUI() {
    this.prevBtn.disabled = this.currentIndex === 0;
    this.nextBtn.disabled = this.currentIndex === this.slides.length - 1;

    const dots = this.dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.currentIndex);
    });
  }

  next() {
    if (this.currentIndex < this.slides.length - 1) {
      this.showSlide(this.currentIndex + 1);
    }
  }

  prev() {
    if (this.currentIndex > 0) {
      this.showSlide(this.currentIndex - 1);
    }
  }

  handleKeyDown(e) {
    // Only handle keys if the slide wrapper is somewhat in focus or visible
    if(e.key === 'ArrowRight' || e.key === 'Space' || e.key === ' ') {
        e.preventDefault();
        this.next();
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.prev();
    }
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      this.wrapper.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }
}

// Auto-initialize any element with class 'slides-wrapper'
document.addEventListener('DOMContentLoaded', () => {
  const wrappers = document.querySelectorAll('.slides-wrapper');
  wrappers.forEach(wrapper => new SlideDeck(wrapper));
});
