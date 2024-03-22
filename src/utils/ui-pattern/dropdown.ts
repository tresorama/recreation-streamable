import { AnimationCollapse } from '@/utils/animations/collapse';

export class Dropdown {
  elements: { trigger: HTMLElement; content: HTMLElement; };
  constructor(elTrigger: HTMLElement, elContent: HTMLElement) {
    this.elements = {
      trigger: elTrigger,
      content: elContent,
    };
    this.initInitialState();
    this.initListeners();
  }
  initInitialState() {
    if (this.isOpen()) this.open(0);
    else this.close(0);
  }
  initListeners() {
    const { trigger } = this.elements;
    trigger.addEventListener('click', () => this.toggle());
  }

  // actions
  isOpen() {
    return this.elements.content.getAttribute('aria-hidden') !== 'true';
  }
  async close(animationDuration?: number) {
    const { trigger, content } = this.elements;
    const a = new AnimationCollapse(content, animationDuration);
    await a.close();
    content.setAttribute('aria-hidden', 'true');
    trigger.setAttribute('aria-expanded', 'false');
  };
  async open(animationDuration?: number) {
    const { trigger, content } = this.elements;
    const a = new AnimationCollapse(content, animationDuration);
    await a.open();
    content.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
  };
  async toggle() {
    if (this.isOpen()) return this.close();
    return this.open();
  }
}