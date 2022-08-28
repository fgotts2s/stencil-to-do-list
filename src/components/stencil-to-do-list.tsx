/**
 * Import Stencil modules.
 */
import { Component, Element, Prop, h } from '@stencil/core';

/**
 * Decorator to specify the component's basic adjustments.
 */
@Component({
  // The custom element's tag name.
  tag: 'stencil-to-do-list',
  // The CSS file's location.
  styleUrl: './css/stencil-to-do-list.css',
  // The assets' directories.
  assetsDirs: ['css', 'img', 'js'],
  // Enable shadow DOM.
  shadow: true
})

/**
 * Class representing a custom element to insert a to-do list to the document.
 */
export class StencilToDoList {
  // Decorator to make the host element including it's shadow DOM accessible.
  @Element() host;
  // The to-do list ID property, explicitly mutable from inside the component's logic.
  @Prop({ attribute: 'id', mutable: true }) toDoListId: number;
  // The to-do list property, explicitly mutable from inside the component's logic.
  @Prop({ mutable: true }) toDoList: any;
  // The to-do lists property, explicitly mutable from inside the component's logic.
  @Prop({ mutable: true }) toDoLists: any;
  /**
   * Method to handle the window hash change event.
   */
  handleHashChange = () => {
    this.toDoList = {...this.toDoList};
  };
  /**
   * Retrieve a to-do list object from local storage if available.
   */
  connectedCallback() {
    this.toDoList = {};
    // Retrieve a to-do lists array from local storage if available or create an empty one.
    this.toDoLists = JSON.parse(localStorage.getItem('toDoLists')) || [];
    if (this.toDoLists.length > 0) {
      // Within the to-do lists array find the to-do list associated with the passed ID.
      this.toDoList = this.toDoLists.find(toDoList => {
        return toDoList.id === this.toDoListId;
      }) || {};
    }
    // In case there are no to-do list items assign an empty array.
    this.toDoList.items = this.toDoList.items || [];
    // Bind an event handler for when the window hash changed.
    window.addEventListener('hashchange', this.handleHashChange);
  }
  disconnectedCallback() {
    // Remove event handler from window object.
    window.removeEventListener('hashchange', this.handleHashChange);
  }
  /**
   * Make the create to-do list input field available from inside the shadow DOM.
   */
  get input() {
    return this.host.shadowRoot.querySelector('#create') ?? null;
  }
  /**
   * Private method to store changed to-do list to local storage.
   * @param {object} toDoListChanged - The changed to-do list to store.
   */
  #store(toDoListChanged) {
    this.toDoLists = this.toDoLists.map(toDoList => {
      if (toDoList.id === this.toDoListId) {
        const toDoListDateLastUpdated = new Date();
        toDoList.lastUpdated = toDoListDateLastUpdated.toJSON();
        toDoList.items = toDoListChanged.items;
      }
      return toDoList;
    });
    localStorage.setItem('toDoLists', JSON.stringify(this.toDoLists));
  }
  /**
   * Private method to create a new to-do list item.
   * @param {object} event - The event that triggered this method.
   */
  #createToDoListItem(event) {
    if (event.key === 'Enter') {
      if (!event.target.value.match(/^\s*$/)) {
        const toDoListItemDateCreated = new Date();
        const toDoListItem = {
          id: toDoListItemDateCreated.getTime(),
          created: toDoListItemDateCreated.toJSON(),
          lastUpdated: null,
          text: this.input.value,
          done: false
        };
        this.toDoList.items.push(toDoListItem);
        this.#store(this.toDoList);
        this.input.value = '';
        this.input.focus();
      }
    }
  }
  /**
   * Private method to handle the update of a to-do list item.
   * @param {object} nodeToDoListItemText - The current to-do list item's text node.
   * @param {object} nodeInputUpdateToDoListItem - The new to-do list item's text node.
   */
  #handleToDoListItemUpdate(nodeToDoListItemText, nodeInputUpdateToDoListItem) {
    // Only accept input that isn't all whitespace.
    if (!nodeInputUpdateToDoListItem.value.match(/^\s*$/)) {
      if (nodeInputUpdateToDoListItem.value !== nodeToDoListItemText.textContent) {
        this.toDoList.items = this.toDoList.items.map(toDoListItem => {
          if (toDoListItem.id === +nodeInputUpdateToDoListItem.parentNode.id) {
            const toDoListItemDateLastUpdated = new Date();
            toDoListItem.lastUpdated = toDoListItemDateLastUpdated.toJSON();
            toDoListItem.text = nodeInputUpdateToDoListItem.value;
          }
          return toDoListItem;
        });
      }
      nodeInputUpdateToDoListItem.remove();
      nodeToDoListItemText.classList.remove('hidden');
      this.#store(this.toDoList);
      this.input.focus();
    }
  }
  /**
   * Private method to update a to-do list item.
   * @param {object} event - The event that triggered this method.
   */
  #updateToDoListItem(event) {
    const nodeToDoListItemText = event.target;
    const nodeInputUpdateToDoListItem = document.createElement('input');
    nodeInputUpdateToDoListItem.type = 'text';
    nodeInputUpdateToDoListItem.value = nodeToDoListItemText.textContent;
    nodeToDoListItemText.parentNode.appendChild(nodeInputUpdateToDoListItem);
    nodeToDoListItemText.classList.add('hidden');
    nodeInputUpdateToDoListItem.focus();
    nodeInputUpdateToDoListItem.addEventListener('blur', () => {
      this.#handleToDoListItemUpdate(nodeToDoListItemText, nodeInputUpdateToDoListItem);
    });
    nodeInputUpdateToDoListItem.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.#handleToDoListItemUpdate(nodeToDoListItemText, nodeInputUpdateToDoListItem);
      } else if (event.key === 'Escape') {
        nodeInputUpdateToDoListItem.remove();
        nodeToDoListItemText.classList.remove('hidden');
      }
    });
  }
  /**
   * Private method to delete a to-do list item.
   * @param {number} id - The to-do list item's ID.
   */
  #deleteToDoListItem(id) {
    this.toDoList.items = this.toDoList.items.filter(toDoListItem => {
      return toDoListItem.id !== id;
    });
    this.#store(this.toDoList);
  }
  /**
   * Private method to toggle a to-do list item.
   * @param {number} id - The to-do list item's ID.
   */
  #toggleToDoListItem(id) {
    this.toDoList.items = this.toDoList.items.map(toDoListItem => {
      if (toDoListItem.id === id) {
        toDoListItem.done = !toDoListItem.done;
      }
      return toDoListItem;
    });
    this.#store(this.toDoList);
  }
  /**
   * Private method to toggle all to-do list items.
   */
  #toggleAllToDoListItems() {
    this.toDoList.items = this.toDoList.items.map(toDoListItem => {
      toDoListItem.done = !toDoListItem.done;
      return toDoListItem;
    });
    this.#store(this.toDoList);
  }
  /**
   * Private method to clear (delete all done) to-do list (items).
   * @param {object} event - The event that triggered this method.
   */
  #clearToDoList(event) {
    event.target.classList.add('hidden');
    event.target.nextElementSibling.classList.remove('hidden');
  }
  /**
   * Private method to confirm the clearance (the deletion of all done) of the to-do list (items).
   * @param {object} event - The event that triggered this method.
   */
  #clearToDoListYes(event) {
    event.target.parentNode.classList.add('hidden');
    this.toDoList.items = this.toDoList.items.filter(toDoListItem => {
      return toDoListItem.done === false;
    });
    this.#store(this.toDoList);
    this.input.focus();
  }
  /**
   * Private method to reject the clearance (the deletion of all done) of the to-do list (items).
   * @param {object} event - The event that triggered this method.
   */
  #clearToDoListNo(event) {
    event.target.parentNode.classList.add('hidden');
    event.target.parentNode.previousElementSibling.classList.remove('hidden');
  }
  /**
   * Method called once after the component did load and first render was executed to initially focus the input field.
   */
  componentDidLoad() {
    this.input.focus();
  }
  /**
   * Method to render the to-do list.
   */
  render() {
    const windowLocationHash = window.location.hash === '' ? '#all' : window.location.hash;
    const countToDoListItemsAll = this.toDoList.items.length;
    let countToDoListItemsPending;
    let countToDoListItemsDone;
    if (this.toDoList.items.length > 0) {
      const toDoListItemsPending = this.toDoList.items.filter(toDoListItem => {
        return toDoListItem.done !== true;
      });
      const toDoListItemsDone = this.toDoList.items.filter(toDoListItem => {
        return toDoListItem.done !== false;
      });
      countToDoListItemsPending = toDoListItemsPending.length;
      countToDoListItemsDone = toDoListItemsDone.length;
    }
    return (
      <section class="container">
        <header>
          <h1>t<span id="first-o">o</span>-d<span id="second-o">o</span> list</h1>
          {this.toDoList.name !== undefined && this.toDoList.done !== undefined ? <h2 class={this.toDoList.done === false ? 'pending' : 'done'}>{this.toDoList.name}</h2> : ''}
          <button onClick={this.#toggleAllToDoListItems.bind(this)} id="toggle-all" class={countToDoListItemsAll > 0 ? '' : 'hide'} title="Click to toggle all"></button>
          <input onKeyDown={this.#createToDoListItem.bind(this)} id="create" class={countToDoListItemsAll > 0 ? 'shrink' : ''} type="text" placeholder="What do you have to do?" />
        </header>
        <section class="to-do-list">
          {countToDoListItemsAll > 0 ?
            <ul class="to-do-list">
              {this.toDoList.items.map(
                (toDoListItem) => (windowLocationHash === '#all') || (windowLocationHash === '#pending' && !toDoListItem.done) || (windowLocationHash === '#done' && toDoListItem.done) ?
                  <li id={toDoListItem.id} class={toDoListItem.done ? 'done' : 'pending'}>
                    <input onClick={() => this.#toggleToDoListItem(toDoListItem.id)} class="select" type="checkbox" title={'Click to mark as ' + (toDoListItem.done === false ? 'done' : 'pending')} checked={toDoListItem.done} />
                    <label onClick={this.#updateToDoListItem.bind(this)} data-created="" data-last-modified="" class="text" title="Click to edit">{toDoListItem.text}</label>
                    <button onClick={() => this.#deleteToDoListItem(toDoListItem.id)} class="delete" title="Click to delete"></button>
                  </li> : ''
              )}
            </ul> :
            this.toDoList.id !== undefined ?
            <p>Good for you: There's nothing to do!</p> :
            <p>Invalid ID! Your entries won't be stored!</p>
          }
        </section>
        <hr class={countToDoListItemsAll > 0 ? '' : 'hidden'} />
        <footer class={countToDoListItemsAll > 0 ? '' : 'hidden'}>
          <span id="count" class={countToDoListItemsAll > 0 ? '' : 'hide hidden'}>{countToDoListItemsAll} ({countToDoListItemsPending}/{countToDoListItemsDone})</span>
          <ul class="filters">
            <li><a id="all" class={windowLocationHash === '#all' ? 'selected' : ''} href="#all">All</a></li>&nbsp;
            <li><a id="pending" class={windowLocationHash === '#pending' ? 'selected' : ''} href="#pending">Pending</a></li>&nbsp;
            <li><a id="done" class={windowLocationHash === '#done' ? 'selected' : ''} href="#done">Done</a></li>
          </ul>
          <button onClick={this.#clearToDoList} id="clear" class={countToDoListItemsDone > 0 ? '' : 'hide hidden'} title="Click to delete done">Clear</button>
          <span id="confirmation" class="hidden">
            Sure?&nbsp;
            <button onClick={this.#clearToDoListYes.bind(this)} id="yes" title="Click to confirm">Yes</button>&nbsp;
            <button onClick={this.#clearToDoListNo} id="no" title="Click to reject">No</button>
          </span>
        </footer>
      </section>
    );
  }
}