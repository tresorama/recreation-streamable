import "./two-marquee.style.css";

class TwoMarquee extends HTMLElement {

  get options() {
    return {
      pauseOnHover: this.hasAttribute('data-pause-on-hover'),
    };
  }

  // public API

  pauseAnimation() {
    this.style.setProperty('--animation-play-state', 'paused');
  }
  resumeAnimation() {
    this.style.setProperty('--animation-play-state', 'running');
  }

  // on mount

  connectedCallback() {
    this.initDOM();
    this.initListeners();
  }
  initDOM() {
    // duplicate slides
    const originalSlides = [...this.children];
    const clonedSlides = originalSlides.map(slide => {
      const clone = /** @type {HTMLElement} */(slide.cloneNode(true));
      clone.setAttribute('data-two-marquee', 'clone-slide');
      return clone;
    });

    // create track
    const track = document.createElement('two-marquee-track');

    // add to DOM
    [...originalSlides, ...clonedSlides].forEach(s => track.append(s));
    this.append(track);

    // add CSS variables (for animation)
    this.style.setProperty('--items-count', originalSlides.length);
  }
  initListeners() {
    const { pauseOnHover } = this.options;

    if (pauseOnHover) {
      this.addEventListener('mouseenter', () => this.pauseAnimation());
      this.addEventListener('mouseleave', () => this.resumeAnimation());
    }
  }

}
customElements.define('two-marquee', TwoMarquee);
window.TwoMarquee = TwoMarquee;

customElements.define('two-marquee-track', class extends HTMLElement { });