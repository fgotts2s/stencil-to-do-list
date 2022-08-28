/**
 * Class representing a custom element to attach the Flag of Ukraine to the document.
 * @extends HTMLElement
 */
class FlagOfUkraine extends HTMLElement {
  /**
   * Create the Flag of Ukraine and attach it to the shadow DOM.
   */
  constructor() {
    super();
    const style = document.createElement('style');
    style.innerHTML = `
      div#flag-of-ukraine::before,
      div#flag-of-ukraine::after {
        content: '';
        display: block;
        height: 0.5em;
      }
      div#flag-of-ukraine::before {
        background: #005bbb;
      }
      div#flag-of-ukraine::after {
        background: #ffd500;
      }
    `;
    const flagOfUkraine = document.createElement('div');
    flagOfUkraine.id = 'flag-of-ukraine';
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.append(style, flagOfUkraine);
  }
}

/**
 * Register a new custom element to eventually be able to attach the Flag of Ukraine to the document.
 */
customElements.define('flag-of-ukraine', FlagOfUkraine);