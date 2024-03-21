import "./two-mega-menu.style.css";
import { Utils } from "@/utils/global-utils";

const { traverseDOMTree, createOnClickOutside } = Utils;


class TwoMegaMenu extends HTMLElement {
  events = {
    mobileToggle: () => new CustomEvent('mobile-toggle'),
  };

  get state() {
    return {
      mobileIsOpen: this.hasAttribute('data-is-opened-mobile'),
    };
  }

  get options() {
    return {
      desktopMinWidth: this.getAttribute("data-desktop-min-width") ?? "0px",
      desktopOpenOnHover: this.hasAttribute('data-desktop-open-on-hover'),
      desktopOpenOnClick: this.hasAttribute('data-desktop-open-on-click'),
      mobileCloseOnClickOutside: this.hasAttribute('data-mobile-close-on-click-outside'),
    };
  }

  get elements() {
    /** @type{HTMLElement} */
    const menu = this.querySelector('[data-mega-menu-3b="menu"]');
    /** @type{HTMLElement[]} */
    const menuItems = [...this.querySelectorAll('[data-mega-menu-3b="menu-item"]')];
    /** @type{HTMLElement[]} */
    const menuItemsL1 = [...this.querySelectorAll('[data-mega-menu-3b="menu-item"][data-level="1"]')];
    /** @type{HTMLElement[]} */
    const menuItemsWithChildren = [...this.querySelectorAll('[data-mega-menu-3b="menu-item"][data-has-children]')];
    /** @type{HTMLElement[]} */
    const submenus = [...this.querySelectorAll('[data-mega-menu-3b="submenu"]')];

    return {
      menu,
      menuItems,
      menuItemsL1,
      menuItemsWithChildren,
      submenus,
    };
  }

  /**
   * Reducer like state updater
   * @param {{
   *   name: "open-mobile-menu" | "close-mobile-menu"
   * }} action 
   */
  setState(action) {
    if (action.name === 'open-mobile-menu') {
      // update state
      this.setAttribute('data-is-opened-mobile', '');
      // trigger event
      this.dispatchEvent(this.events.mobileToggle());
      return;
    }

    if (action.name === 'close-mobile-menu') {
      // update state
      this.removeAttribute('data-is-opened-mobile');
      // trigger event
      this.dispatchEvent(this.events.mobileToggle());
      return;
    }
  }

  // public API

  mobileOpenMenu() {
    this.setState({ name: 'open-mobile-menu' });
  }
  mobileCloseMenu() {
    this.setState({ name: 'close-mobile-menu' });
  }
  mobileToggleMenu() {
    if (this.state.mobileIsOpen) this.mobileCloseMenu();
    else this.mobileOpenMenu();
  }

  // on mount

  connectedCallback() {
    this.initDOM();
    this.initMobileAndDesktop();
  }
  initDOM() {

    // add "data-attributes" attribute to items
    traverseDOMTree({
      rootElement: this,
      filter: (el) => el.getAttribute('data-mega-menu-3b') === 'menu-item',
      callback: ({ element, level }) => {
        element.setAttribute("data-level", level + 1);
        const submenu = element.querySelector('[data-mega-menu-3b="submenu"]');
        if (submenu) element.setAttribute("data-has-children", "");
      },
    });

  }
  initMobileAndDesktop() {
    const mobile = this.initMobile();
    const desktop = this.initDesktop();

    // on media query change...
    const mq = window.matchMedia(`(min-width: ${this.options.desktopMinWidth})`);
    const handleChange = () => {
      if (/* isDesktop */ mq.matches) {
        mobile.disable();
        desktop.enable();
      }
      else {
        mobile.enable();
        desktop.disable();
      }
    };
    mq.addEventListener('change', handleChange);
    handleChange();
  }

  /**
  * @typedef {{
  *   enable: () => void,
  *   disable: () => void,
  * }} Runner
  */

  /** @returns {Runner} */
  initMobile() {
    const { menu, menuItems, menuItemsL1, menuItemsWithChildren } = this.elements;

    // =======================
    // Init DOM
    // =======================

    // add "--item-index" CSS var (for animation stagger)
    [menu].forEach((el) => {
      let i = 0;
      traverseDOMTree({
        strategy: 'breadth-first-search',
        rootElement: el,
        filter: (el) => el.getAttribute('data-mega-menu-3b') === "menu-item",
        callback: ({ element, index }) => {
          element.style.setProperty("--item-index--mobile", i);
          i++;
        },
      });
    });

    // =======================
    // Actions
    // =======================

    const itemIsOpen = (el) => el.hasAttribute('open');

    const openItem = async (/** @type {HTMLElement} */menuItem) => {
      if (itemIsOpen(menuItem)) return;
      const submenu = this.elements.submenus.find(submenu => menuItem.contains(submenu));
      if (!submenu) return;
      menuItem.setAttribute("open", "");
      // await this.runAnimation.mobileOpenSubmenu(submenu);
    };

    const closeItem = async (/** @type {HTMLElement} */menuItem) => {
      if (!itemIsOpen(menuItem)) return;
      const submenu = this.elements.submenus.find(submenu => menuItem.contains(submenu));
      if (!submenu) return;
      menuItem.removeAttribute("open");
      // await this.runAnimation.mobileCloseSubmenu(submenu);
    };

    // =======================
    // Listeners
    // =======================

    // on item click => open me and close sibilings
    const handleItemClick = (/** @type{Event}*/ e) => {
      /** @type{HTMLElement} */
      const menuItem = e.currentTarget;

      // prevent bubble
      e.preventDefault();
      e.stopPropagation();

      // if trigger is not a menu item with children do nothing
      if (!menuItemsWithChildren.includes(menuItem)) return;

      // if is open => close
      if (itemIsOpen(menuItem)) {
        closeItem(menuItem);
        return;
      }

      // if is close => open me + close sibiling
      openItem(menuItem);
      const menuItemsSibiling = [...menuItem.parentElement.children].filter((x) => x !== menuItem);
      menuItemsSibiling.forEach(closeItem);
    };

    // on click outside => close the menu
    const handleClickOutside = createOnClickOutside(this, (e) => {
      // if menu is closed abort...
      if (!this.state.mobileIsOpen) return;

      // if the click is on the mobile toggler abort...
      const trigger = /** @type {HTMLElement?} */ (e.target);
      if (!trigger) return;
      const isMobileToggler = Boolean(trigger.closest("two-mega-menu-mobile-toggler"));
      if (isMobileToggler) return;

      // otherwise
      e.stopPropagation();
      e.preventDefault();
      this.mobileCloseMenu();
    });

    // =======================
    // API
    // =======================
    return {
      enable: () => {
        this.setAttribute("data-is-mobile", "");

        // add listeners
        menuItems.forEach((el) => {
          el.addEventListener("click", handleItemClick);
        });

        if (this.options.mobileCloseOnClickOutside) {
          handleClickOutside.enable();
        }
      },
      disable: () => {
        this.removeAttribute("data-is-mobile");

        // remove listeners
        menuItems.forEach((el) => {
          el.removeEventListener("click", handleItemClick);
        });

        if (this.options.mobileCloseOnClickOutside) {
          handleClickOutside.disable();
        }
      },
    };

  }

  /** @returns {Runner} */
  initDesktop() {
    const { menu, menuItems, menuItemsL1, menuItemsWithChildren } = this.elements;

    // =======================
    // Init DOM
    // =======================

    // add "--item-index" CSS var (for animation stagger)
    menuItemsL1.forEach((el) => {
      let i = 0;
      traverseDOMTree({
        rootElement: el,
        callback: ({ element }) => {
          element.style.setProperty("--item-index--desktop", i);
          i++;
        },
      });
    });

    // =======================
    // Actions
    // =======================

    const isOpenItem = (el) => el.hasAttribute("open");
    const openItem = (el) => el.setAttribute("open", "");
    const closeItem = (el) => el.removeAttribute("open");

    // =======================
    // Listeners
    // =======================

    // on item click => open me and close sibilings
    const handleItemShow = (/** @type {Event} */e) => {
      const menuItem = /** @type {HTMLElement} */(e.currentTarget);
      menuItemsL1.forEach((item) => {
        if (item === menuItem) openItem(item);
        else closeItem(item);
      });
    };
    const handleItemHide = (/** @type {Event} */e) => {
      const menuItem = /** @type {HTMLElement} */(e.currentTarget);
      closeItem(menuItem);
    };
    const handleItemToggle = (/** @type {Event} */e) => {
      const menuItem = /** @type {HTMLElement} */(e.currentTarget);
      if (isOpenItem(menuItem)) handleItemHide(e);
      else handleItemShow(e);
    };


    // on click outside => close all menu items level 1
    const handleClickOutside = createOnClickOutside(this, (e) => {
      // if no item is opened abort ...
      if (!menuItemsL1.some(isOpenItem)) return;
      // otherwise
      e.preventDefault();
      e.stopPropagation();
      menuItemsL1.forEach(closeItem);
    });

    // =======================
    // API
    // =======================
    return {
      enable: () => {
        this.setAttribute("data-is-desktop", "");

        if (this.options.desktopOpenOnClick) {
          menuItemsL1.forEach((el) => {
            el.addEventListener("click", handleItemToggle);
          });
          handleClickOutside.enable();
        }

        if (this.options.desktopOpenOnHover) {
          menuItemsL1.forEach((el) => {
            el.addEventListener("mouseenter", handleItemShow);
            el.addEventListener("mouseleave", handleItemHide);
          });
        }
      },
      disable: () => {
        this.removeAttribute("data-is-desktop");

        if (this.options.desktopOpenOnClick) {
          menuItemsL1.forEach(el => {
            el.removeEventListener("click", handleItemToggle);
          });
          handleClickOutside.enable();
        }

        if (this.options.desktopOpenOnHover) {
          menuItemsL1.forEach((el) => {
            el.removeEventListener("mouseenter", handleItemShow);
            el.removeEventListener("mouseleave", handleItemHide);
          });
        }
      },
    };

  }

}
customElements.define('two-mega-menu', TwoMegaMenu);
window.TwoMegaMenu = TwoMegaMenu;


class TwoMegaMenuMobileToggler extends HTMLElement {
  get elements() {
    /** @type {TwoMegaMenu?} */
    const megamenu = document.querySelector(this.getAttribute('target-selector'));
    if (!megamenu) throw new Error('Impossible to find the two-mega-menu DOM element');

    return {
      megamenu,
    };
  }

  // on mount
  connectedCallback() {
    this.initListeners();
  }

  initListeners() {
    this.addEventListener('click', () => this.elements.megamenu.mobileToggleMenu());
  }

}
customElements.define('two-mega-menu-mobile-toggler', TwoMegaMenuMobileToggler);
window.TwoMegaMenuMobileToggler = TwoMegaMenuMobileToggler;