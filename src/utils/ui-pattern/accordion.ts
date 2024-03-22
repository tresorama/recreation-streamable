import { AnimationCollapse } from '@/utils/animations/collapse';

class AccordionItem {
  elements: { wrapper: HTMLElement; toggler: HTMLElement; content: HTMLElement; };
  events = {
    beforeOpen: () => new CustomEvent('before-open'),
    afterOpen: () => new CustomEvent('after-open'),
    beforeClose: () => new CustomEvent('before-close'),
    afterClose: () => new CustomEvent('after-close'),
  };
  constructor(elWrapper: HTMLElement) {
    const wrapper = elWrapper;
    const toggler = elWrapper.querySelector<HTMLElement>('[data-accordion-toggler]');
    const content = elWrapper.querySelector<HTMLElement>('[data-accordion-content]');
    if (!toggler) throw new Error('Missing toggler element.');
    if (!content) throw new Error('Missing toggler element.');
    this.elements = {
      wrapper,
      toggler,
      content,
    };

    this.initInitialState();
    this.initListeners();
  }
  initInitialState() {
    if (this.isOpen()) this.open(0);
    else this.close(0);
  }

  initListeners() {
    const { toggler } = this.elements;
    toggler.addEventListener('click', () => this.toggle());
  }

  // actions
  isOpen() {
    return this.elements.content.getAttribute('aria-hidden') != 'true';
  }
  async close(animationDuration?: number) {
    const { wrapper, toggler, content } = this.elements;

    wrapper.dispatchEvent(this.events.beforeClose());

    const a = new AnimationCollapse(content, animationDuration);
    await a.close();
    content.setAttribute('aria-hidden', 'true');
    toggler.setAttribute('aria-expanded', 'false');

    wrapper.dispatchEvent(this.events.afterClose());

  };
  async open(animationDuration?: number) {
    const { wrapper, toggler, content } = this.elements;

    wrapper.dispatchEvent(this.events.beforeOpen());

    const a = new AnimationCollapse(content, animationDuration);
    await a.open();
    content.setAttribute('aria-hidden', 'false');
    toggler.setAttribute('aria-expanded', 'true');

    wrapper.dispatchEvent(this.events.afterOpen());

  };
  async toggle() {
    if (this.isOpen()) return this.close();
    return this.open();
  }
}

export class Accordion {
  el: HTMLElement;
  instances: { el: HTMLElement; accordionItem: AccordionItem; }[];
  get options() {
    return {
      isExclusive: this.el.hasAttribute('data-is-exclusive'),
    };
  }
  constructor(elWrapper: HTMLElement) {
    this.el = elWrapper;
    const items = Array.from(elWrapper.children);
    this.instances = items.map(item => ({
      el: item as HTMLElement,
      accordionItem: new AccordionItem(item as HTMLElement)
    }));
    this.initListeners();
  }
  initListeners() {
    const { instances } = this;

    if (this.options.isExclusive) {
      // on open item => close others
      const handleBeforeOpenItem = (instance: Accordion['instances'][number]) => {
        instances
          .filter(x => x !== instance)
          .forEach(x => x.accordionItem.close());
      };
      instances.forEach(instance => {
        instance.el.addEventListener('before-open', () => handleBeforeOpenItem(instance));
      });
    }

  }
}