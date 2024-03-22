export class AnimationCollapse {
  el: HTMLElement;
  duration: number;
  constructor(el: HTMLElement, duration: number = 150) {
    this.el = el;
    this.duration = duration;
  }
  async open() {
    const { el } = this;
    return new Promise<void>(resolve => {
      const currentHeight = el.getBoundingClientRect().height + 'px';
      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.height = '';
      const finalHeight = el.scrollHeight + 'px';
      el.animate([
        { height: currentHeight },
        { height: finalHeight },
      ], { duration: this.duration })
        .finished.then(() => {
          el.style.height = 'auto';
          resolve();
        });
    });
  }
  async close() {
    const { el } = this;
    return new Promise<void>(resolve => {
      const currentHeight = el.getBoundingClientRect().height + 'px';

      el.style.display = 'block';
      el.style.overflow = 'hidden';
      el.style.height = '';
      const finalHeight = '0px';
      el.animate([
        { height: currentHeight },
        { height: finalHeight },
      ], { duration: this.duration })
        .finished.then(() => {
          el.style.display = 'none';
          el.style.overflow = '';
          el.style.height = 'auto';
          resolve();
        });
    });
  }
}

