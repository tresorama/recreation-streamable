export const Utils = {
  // BASIC
  /**
   * @param {() => void} callback
   */
  onDomReady(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  },
  /**
   * Create a <style> and inject in DOM.
   * You can pass an `id` to avoid inserting more than one time.
   * @param {string} css
   * @param {string?} id
   */
  injectCss: (css, id) => {
    // if consumer pass an id, he want to have only one <style> tag
    if (id && document.querySelector(`style#${id}`)) return;
    //
    const style = document.createElement("style");
    style.textContent = css;
    style.id =
      id ?? "random-id-" + Number(Math.random() * 200).toFixed(0) + Date.now();
    document.head.append(style);
  },
  // DEBOUNCE + THROTTLE
  /**
   * @param {() => void} callback
   * @param {number} delay - Milliseconds
   */
  debounce: function (callback, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  },
  /**
   * @param {() => void} callback
   * @param {number} delay - Milliseconds
   * @param {"leading" | "trailing"} [strategy="leading"]
   */
  throttle: function (callback, delay, strategy) {
    let lastExecTime = 0;
    let timer;
    const leading = strategy === "leading";
    const trailing = strategy === "trailing";

    return function (...args) {
      const currentTime = Date.now();

      if (leading && currentTime - lastExecTime >= delay) {
        callback(...args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timer);

        if (trailing) {
          timer = setTimeout(() => {
            callback(...args);
            lastExecTime = Date.now();
          }, delay);
        }
      }
    };
  },
  /**
   * @param {() => void} callback
   * @param {number} delay - Milliseconds
   */
  throttleTrailing: function (callback, delay) {
    return Utils.throttle(callback, delay, "trailing");
  },
  /**
   * @param {() => void} callback
   * @param {number} delay - Milliseconds
   */
  throttleLeading: function (callback, delay) {
    return Utils.throttle(callback, delay, "leading");
  },
  // DOM
  /**
   * @param {object} params
   * @param {HTMLElement} params.rootElement
   * @param {(params: {element:HTMLElement, level:number, index:number}) => void} params.callback - function invoked on every traversed node. If `filter` is defined, `callback` is invoked only on item whose`filter` returned true
   * @param {(el:HTMLElement) => boolean} params.filter - Let you restric the traverse to specific HTMLElement
   * @param {"depth-first-search" | "breadth-first-search"} params.strategy - default to`depth-first-search`
   * 
   */
  traverseDOMTree: function ({ rootElement, callback, filter = () => true, strategy = "depth-first-search" }) {

    if (strategy === 'depth-first-search') {
      /**
       * @param {HTMLElement} element
       * @param {number} [level=0]
       */
      function traverseTree(element, level = -1) {
        // get direct children of current node
        const children = element.children;

        // create a incrememter function that can run once per children list
        let incrementLevel = () => {
          level++;
          incrementLevel = () => { };
        };

        // iterate over each child
        for (let i = 0; i < children.length; i++) {
          // get current child
          const currentElement = children[i];

          // check if this is a "kind" of item that consumer want :
          // - to base the "level" on
          // - to do operation on
          // if filter return false the callback is not invoked
          // i.e. filter: (el) => el.classList.contains('my-fancy-item');
          const isValid = filter(currentElement);
          if (isValid) {
            incrementLevel();
            // do side effect on current child
            callback({ element: currentElement, level, index: i });
          }

          // if this child has children traverse it
          if (currentElement.children.length > 0) {
            traverseTree(currentElement, level);
          }
        }
      }
      traverseTree(rootElement);
    }

    if (strategy === 'breadth-first-search') {
      /**
       * @param {HTMLElement} element
       * @param {number} [level=0]
       */
      function traverseTree(element, level = -1) {
        // get direct children of current node
        const children = element.children;

        // create a incrememter function that can run once per children list
        let incrementLevel = () => {
          level++;
          incrementLevel = () => { };
        };

        // iterate over each child
        for (let i = 0; i < children.length; i++) {
          // get current child
          const currentElement = children[i];

          // check if this is a "kind" of item that consumer want :
          // - to base the "level" on
          // - to do operation on
          // if filter return false the callback is not invoked
          // i.e. filter: (el) => el.classList.contains('my-fancy-item');
          const isValid = filter(currentElement);
          if (isValid) {
            incrementLevel();
            // do side effect on current child
            callback({ element: currentElement, level, index: i });
          }
        }

        // iterate over each child again
        for (let i = 0; i < children.length; i++) {
          // get current child
          const currentElement = children[i];

          // if this child has children traverse it
          if (currentElement.children.length > 0) {
            traverseTree(currentElement, level);
          }
        }
      }
      traverseTree(rootElement);
    }
  },
  /**
   * Save position in DOM of element and return a fuction that restore the position.
   * Usually used before "moving" an element in a different DOM position and be able to revert.
   * @param {HTMLElement} el
   */
  createRestoreDOMPosition: function (el) {
    if (el.nextElementSibling) {
      const ref = el.nextElementSibling;
      return () => ref.parentElement.insertBefore(el, ref);
    }
    if (el.previousElementSibling) {
      const ref = el.previousElementSibling;
      return () => ref.parentElement.insertBefore(el, ref.nextSibling);
    }
    const parent = el.parentElement;
    return () => parent.append(el);
  },
  /**
   * @param {HTMLElement} el
   * @param {Event['type']} eventType
   * @param {EventListenerOrEventListenerObject} handler
   * @param {boolean | EventListenerOptions | undefined} options
   * @returns {() => void} unsubscribe function
   */
  createListener: function (el, eventType, handler, options) {
    el.addEventListener(eventType, handler, options);
    return () => el.removeEventListener(eventType, handler, options);
  },
  /**
 * Given a js object like `{ color: "red", opacity: 0}` add the to element.style
 * @param {HTMLElement} el 
 * @param {CSSStyleDeclaration} properties
 */
  setElementStyle: function (el, properties) {
    for (const propKey in properties) {
      el.style.setProperty(propKey, String(properties[propKey]));
    }
  },
  /**
   * 
   * @param {HTMLElement} el 
   * @returns 
   */
  isInViewport: function (el) {
    const { left, right, top, bottom } = el.getBoundingClientRect();
    const isInsideHorizontal = left >= 0 && right <= window.innerWidth;
    const isInsideVertical = top >= 0 && bottom <= window.innerHeight;
    return isInsideHorizontal && isInsideVertical;
  },
  // PORTAL
  /**
   * Create a DOM element to be used as portal
   */
  createPortal: function () {
    const portalWrapper = document.createElement("div");
    portalWrapper.classList.add("portal-wrapper");

    return {
      portalWrapper,
      putElementInsidePortal: (
        /** @type{HTMLElement} */
        el,
        /** @type{("replace"|"append"|"prepend")?} [strategy="replace"] */
        strategy = "replace",
      ) => {
        if (strategy === "replace") {
          [...portalWrapper.children].forEach((child) => child.remove());
          portalWrapper.append(el);
          return;
        }
        if (strategy === "append") {
          portalWrapper.append(el);
          return;
        }
        if (strategy === "prepend") {
          portalWrapper.prepend(el);
          return;
        }
      },
    };
  },
  // UX + A11Y
  /**
   * @param {HTMLElement} el
   */
  createTrapFocus: function (el) {
    var focusableEls = el.querySelectorAll(
      'a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled])',
    );
    let previousFocusedEl = null;
    var firstFocusableEl = focusableEls[0];
    var lastFocusableEl = focusableEls[focusableEls.length - 1];
    var KEYCODE_TAB = 9;

    const handler = function (e) {
      var isTabPressed = e.key === "Tab" || e.keyCode === KEYCODE_TAB;
      if (!isTabPressed) return;

      /* shift + tab */
      if (e.shiftKey) {
        if (document.activeElement === firstFocusableEl) {
          lastFocusableEl.focus();
          e.preventDefault();
        }
      } else {
        /* tab */
        if (document.activeElement === lastFocusableEl) {
          firstFocusableEl.focus();
          e.preventDefault();
        }
      }
    };

    return {
      enable: () => {
        previousFocusedEl = document.activeElement;
        el.addEventListener("keydown", handler);
      },
      disable: () => {
        el.removeEventListener("keydown", handler);
      },
      focusFirstChild: () => {
        setTimeout(() => {
          if (firstFocusableEl) firstFocusableEl.focus();
        }, 1);
      },
      /** Restore focus to element focused before  */
      restoreFocus: () => {
        if (previousFocusedEl) previousFocusedEl.focus();
      },
      /** Focus next focusable element */
      focusNextChild: () => {
        setTimeout(() => {
          const currentFocusedEl = document.activeElement;
          const i = [...focusableEls].findIndex((x) => x === currentFocusedEl);
          if (i === -1) return;
          const nextElIndex = (i + 1) % focusableEls.length;
          const nextFocusableEl = focusableEls[nextElIndex];
          nextFocusableEl.focus();
        }, 1);
      },
      /** Focus prev focusable element */
      focusPrevChild: () => {
        setTimeout(() => {
          const currentFocusedEl = document.activeElement;
          const i = [...focusableEls].findIndex((x) => x === currentFocusedEl);
          if (i === -1) return;
          const prevElIndex =
            i === 0 ? focusableEls.length - 1 : (i - 1) % focusableEls.length;
          const prevFocusableEl = focusableEls[prevElIndex];
          prevFocusableEl.focus();
        }, 1);
      },
    };
  },
  /**
   * @param {HTMLElement} el
   * @param {() => void} callback
   */
  createOnClickOutside: function (el, callback) {
    const handler = (event) => {
      const isOutside = !el.contains(event.target);
      if (isOutside) callback();
    };
    return {
      enable: () => {
        document.addEventListener("click", handler);
      },
      disable: () => {
        document.removeEventListener("click", handler);
      },
    };
  },
  /**
   * @param {HTMLElement | null} el
   * @param {(event: KeyboardEvent) => void} callback
   */
  createOnKeyPress: function (el, callback) {
    const handler = (event) => {
      callback(event);
    };

    return {
      enable: () => {
        (el ?? document).addEventListener("keydown", handler);
      },
      disable: () => {
        (el ?? document).removeEventListener("keydown", handler);
      },
    };
  },
  // ANIMATION
  /**
   * Utility for creating FLIP animation with any animation library.
   *
   *
   * @template T
   * @template R extends unknown
   * @param {{
   *   savePreAndPost: () => T,
   *   mutateDOM: () => void,
   *   animate: (pre:T,post:T) => R,
   * }} options
   * @returns R
   */
  animeFlip: function ({ savePreAndPost, mutateDOM, animate }) {
    // save pre
    const pre = savePreAndPost();
    // mutate DOM
    mutateDOM();
    // save post
    const post = savePreAndPost();
    // animate
    return animate(pre, post);
  },
  // NUMBER
  /**
   * @param {Number} value 
   * @param {Number} min 
   * @param {Number} max 
   */
  wrap: function (value, min, max) {
    if (value > max) return min;
    if (value < min) return max;
    return value;
  },
  /**
   * @param  {...Number} nums 
   */
  sum: function (...nums) {
    return nums.reduce((acc, curr) => acc + curr, 0);
  },
  /**
   * Clamp function, constraints a value to be in a range.
   * Outliers will be clamped to the relevant extreme of the range.
   * @param {Number} value Vlue you want to clamp
   * @param {Number} min Minimin possibile value.
   * @param {Number} max Maximinum possible value.
   */
  clamp: function (value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  },
  /**
 * Lerp function, used to get a value in range based on a percentage.
 * @param {Number} min Lower part of the `min-max` range. Minumum value passibile.
 * @param {Number} max Upper part of the `min-max` range. Maximum value possible.
 * @param {Number} t Decimal between `0` and `1`, which rapresent where value lives in min-max range.
 */
  lerp: function (min, max, t) {
    const value = (max - min) * t + min;
    return value;
  },
  /**
   * Lerp Inversed function, used to get the percentage of a value in a range.
   * Return value is a decimal between `0` and `1`
   * @param {Number} min Lower part of the `min-max` range. Minumum value passibile.
   * @param {Number} max Upper part of the `min-max` range. Maximum value possible.
   * @param {Number} value Number that must be in range min-max, rapresent the value that you want to know where it sits in -b range.
   */
  lerpInverse: function (min, max, value) {
    const t = (value - min) / (max - min);
    return t;
  }
};
