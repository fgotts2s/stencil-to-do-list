/**
 * Import Stencil modules.
 */
import { Component, Element, Prop, h } from '@stencil/core';

/**
 * Decorator to specify the component's basic adjustments.
 */
@Component({
  // The custom element's tag name.
  tag: 'stencil-to-do-lists',
  // The CSS file's location.
  styleUrl: './css/stencil-to-do-lists.css',
  // The assets' directories.
  assetsDirs: ['css', 'img', 'js'],
  // Enable shadow DOM.
  shadow: true
})

/**
 * Class representing a custom element to insert to-do lists to the document.
 */
export class StencilToDoLists {
  // Decorator to make the host element including it's shadow DOM accessible.
  @Element() host;
  // The to-do lists property, explicitly mutable from inside the component's logic.
  @Prop({ mutable: true }) toDoLists: any;
  /**
   * Retrieve a to-do lists array from local storage if available or create an empty one.
   */
  constructor() {
    this.toDoLists = JSON.parse(localStorage.getItem('toDoLists')) || [];
  }
  /**
   * Method to handle the window hash change event.
   */
  handleHashChange = () => {
    this.toDoLists = [...this.toDoLists];
  };
  /**
   * Method to handle the window mouse move event for when the to-do lists' links are hovered.
   */
  handleMouseMove = (event) => {
    const previewTooltips = this.host.shadowRoot.querySelectorAll('section.tooltip');
    previewTooltips.forEach(previewTooltip => {
      previewTooltip.style.top = (window.innerHeight - event.clientY < previewTooltip.offsetHeight ? event.clientY - previewTooltip.offsetHeight : event.clientY) + 'px';
      previewTooltip.style.left = event.clientX + 'px';
    });
  }
  connectedCallback() {
    // Add an event handler for when the window hash changed.
    window.addEventListener('hashchange', this.handleHashChange);
    // Add an event handler for when the window mouse moves (and to-do lists' links are hovered).
    window.addEventListener('mousemove', this.handleMouseMove);
  }
  disconnectedCallback() {
    // Remove the event handler for when the window hash changed.
    window.removeEventListener('hashchange', this.handleHashChange);
    // Remove the event handler for when the window mouse moves (and to-do lists' links are hovered).
    window.removeEventListener('mousemove', this.handleMouseMove);
  }
  /**
   * Method to make the create to-do list input field accessible from inside the shadow DOM.
   */
  get input() {
    return this.host.shadowRoot.querySelector('#create') ?? null;
  }
  /**
   * Private method to store to-do lists to local storage.
   * @param {object} toDoLists - The to-do lists to store.
   */
  #store(toDoLists) {
    localStorage.setItem('toDoLists', JSON.stringify(toDoLists));
  }
  /**
   * Private method to create a new to-do list.
   * @param {object} event - The event object containing the new to-do list's name.
   */
  #createToDoList(event) {
    if (event.key === 'Enter') {
      // Only accept input that isn't all whitespace.
      if (!event.target.value.match(/^\s*$/)) {
        const toDoListDateCreated = new Date();
        const toDoList = {
          // Use the number of milliseconds since the ECMAScript epoch until the to-do list's creation as the to-do list's ID.
          // As this number is unique (with a probability bordering on certainty) there is no need to determine the last assigned to-do list's ID in order to increment it.
          id: toDoListDateCreated.getTime(),
          created: toDoListDateCreated.toJSON(),
          lastRenamed: null,
          lastUpdated: null,
          name: this.input.value,
          done: false,
          items: []
        };
        this.toDoLists = [...this.toDoLists, toDoList];
        this.#store(this.toDoLists);
        this.input.value = '';
        this.input.focus();
      }
    }
  }
  /**
   * Private method to handle a to-do list update.
   * @param {object} nodeEditToDoList - The edit button element node.
   * @param {object} nodeToDoListName - The to-do list's name text node.
   * @param {object} nodeInputUpdateToDoList - The update input field element node.
   */
  #handleToDoListUpdate(nodeEditToDoList, nodeToDoListName, nodeInputUpdateToDoList) {
    // Only accept input that isn't all whitespace.
    if (!nodeInputUpdateToDoList.value.match(/^\s*$/)) {
      if (nodeInputUpdateToDoList.value !== nodeToDoListName.textContent) {
        this.toDoLists = this.toDoLists.map(toDoList => {
          if (toDoList.id === +nodeInputUpdateToDoList.parentNode.id) {
            const toDoListDateLastRenamed = new Date();
            toDoList.lastRenamed = toDoListDateLastRenamed.toJSON();
            toDoList.name = nodeInputUpdateToDoList.value;
          }
          return {...toDoList};
        });
      }
      nodeInputUpdateToDoList.remove();
      nodeEditToDoList.parentNode.querySelector('label.name').classList.remove('hidden');
      this.#store(this.toDoLists);
      this.input.focus();
    }
  }
  /**
   * Private method to update a to-do list.
   * @param {object} event - The event object containing the edit button element node.
   */
  #updateToDoList(event) {
    const nodeEditToDoList = event.target;
    const nodeToDoListName = nodeEditToDoList.parentNode.querySelector('label.name a');
    const nodeInputUpdateToDoList = document.createElement('input');
    nodeInputUpdateToDoList.type = 'text';
    nodeInputUpdateToDoList.value = nodeToDoListName.textContent;
    nodeEditToDoList.parentNode.appendChild(nodeInputUpdateToDoList);
    nodeEditToDoList.parentNode.querySelector('label.name').classList.add('hidden');
    nodeInputUpdateToDoList.focus();
    nodeInputUpdateToDoList.addEventListener('blur', () => {
      this.#handleToDoListUpdate(nodeEditToDoList, nodeToDoListName, nodeInputUpdateToDoList);
    });
    nodeInputUpdateToDoList.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        this.#handleToDoListUpdate(nodeEditToDoList, nodeToDoListName, nodeInputUpdateToDoList);
      } else if (event.key === 'Escape') {
        nodeInputUpdateToDoList.remove();
        nodeEditToDoList.parentNode.querySelector('label.name').classList.remove('hidden');
      }
    });
  }
  /**
   * Private method to delete a to-do list.
   * @param {number} id - The to-do list's ID.
   */
  #deleteToDoList(id) {
    this.toDoLists = this.toDoLists.filter(toDoList => {
      return toDoList.id !== id;
    });
    this.#store(this.toDoLists);
  }
  /**
   * Private method to toggle a to-do list.
   * @param {number} id - The to-do list's ID.
   */
  #toggleToDoList(id) {
    this.toDoLists = this.toDoLists.map(toDoList => {
      if (toDoList.id === id) {
        toDoList.done = !toDoList.done;
      }
      return {...toDoList};
    });
    this.#store(this.toDoLists);
  }
  /**
   * Private method to toggle all to-do lists.
   */
  #toggleAllToDoLists() {
    this.toDoLists = this.toDoLists.map(toDoList => {
      toDoList.done = !toDoList.done;
      return {...toDoList};
    });
    this.#store(this.toDoLists);
  }
  /**
   * Private method to clear (delete all done) to-do lists (to-do lists).
   */
  #clearToDoLists(event) {
    event.target.classList.add('hidden');
    event.target.nextElementSibling.classList.remove('hidden');
  }
  /**
   * Private method to confirm the clearance (deletion of all done) of the to-do lists (to-do lists).
   */
  #clearToDoListsYes(event) {
    event.target.parentNode.classList.add('hidden');
    this.toDoLists = this.toDoLists.filter(toDoList => {
      return toDoList.done === false;
    });
    this.#store(this.toDoLists);
    this.input.focus();
  }
  /**
   * Private method to reject the clearance (deletion of all done) of the to-do lists (to-do lists).
   */
  #clearToDoListsNo(event) {
    event.target.parentNode.classList.add('hidden');
    event.target.parentNode.previousElementSibling.classList.remove('hidden');
  }
  /**
   * Private method to route the to-do lists.
   */
  #routeToDoList(event) {
    // Prevent a page reload.
    event.preventDefault();
    // Assign the hyperlink's target URL to a pathname object.
    const {pathname: path} = new URL(event.target.href);
    // Add a new entry to the browser's session history stack.
    window.history.pushState({path}, '', path);
    // Assign a new popstate event including the previously assigned pathname object and trigger it manually.
    const popStateEvent = new PopStateEvent('popstate', {state: path});
    dispatchEvent(popStateEvent);
  }
  /**
   * Method called once after the component did load and first render was executed to initially focus the input field.
   */
  componentDidLoad() {
    this.input.focus();
  }
  /**
   * Method to render the to-do lists.
   */
  render() {
    const windowLocationHash = window.location.hash === '' ? '#all' : window.location.hash;
    const countToDoListsAll = this.toDoLists.length;
    let countToDoListsPending;
    let countToDoListsDone;
    if (this.toDoLists.length > 0) {
      const toDoListsPending = this.toDoLists.filter(toDoList => {
        return toDoList.done !== true;
      });
      const toDoListsDone = this.toDoLists.filter(toDoList => {
        return toDoList.done !== false;
      });
      countToDoListsPending = toDoListsPending.length;
      countToDoListsDone = toDoListsDone.length;
    }
    return (
      <section class="container">
        <header>
          <h1>t<span id="first-o">o</span>-d<span id="second-o">o</span> lists</h1>
          <h2>Overview of your to-do lists</h2>
          <button onClick={this.#toggleAllToDoLists.bind(this)} id="toggle-all" class={countToDoListsAll > 0 ? '' : 'hide'} title="Click to toggle all"></button>
          <input onKeyDown={this.#createToDoList.bind(this)} id="create" class={countToDoListsAll > 0 ? 'shrink' : ''} type="text" placeholder="What should the new to-do list be called?" />
        </header>
        <section class="to-do-lists">
          {countToDoListsAll > 0 ?
            <ul class="to-do-lists">
              {this.toDoLists.map(
                (toDoList) => (windowLocationHash === '#all') || (windowLocationHash === '#pending' && !toDoList.done) || (windowLocationHash === '#done' && toDoList.done) ?
                  <li id={toDoList.id} class={toDoList.done ? 'done' : 'pending'}>
                    <input onClick={() => this.#toggleToDoList(toDoList.id)} class="select" type="checkbox" title={`Click to mark as ${toDoList.done === false ? 'done' : 'pending'}`} checked={toDoList.done} />
                    <label data-created={toDoList.created} data-last-modified={toDoList.lastRenamed} class="name">
                      <a onClick={this.#routeToDoList} href={`/stencil-to-do-list/to-do-list/${toDoList.id}`}>{toDoList.name}</a>&nbsp;
                      <span class="count">({toDoList.items.length} {toDoList.items.length === 1 ? 'item' : 'items'}{toDoList.items.length > 0 ? ': ' + toDoList.items.filter(toDoListItem => {return toDoListItem.done !== true}).length + ' pending, ' + toDoList.items.filter(toDoListItem => {return toDoListItem.done !== false}).length + ' done' : ''})</span>
                      <section class="tooltip">
                        <stencil-to-do-list-preview id={toDoList.id} toDoList={toDoList}></stencil-to-do-list-preview>
                      </section>
                    </label>
                    <button onClick={this.#updateToDoList.bind(this)} class="edit" title="Click to edit"></button>
                    <button onClick={() => this.#deleteToDoList(toDoList.id)} class="delete" title="Click to delete"></button>
                  </li> : ''
              )}
            </ul> :
            <p>There are no to-do lists to show!</p>
          }
        </section>
        <hr class={countToDoListsAll > 0 ? '' : 'hidden'} />
        <footer class={countToDoListsAll > 0 ? '' : 'hidden'}>
          <span id="count" class={countToDoListsAll > 0 ? '' : 'hide hidden'}>{countToDoListsAll} ({countToDoListsPending}/{countToDoListsDone})</span>
          <ul class="filters">
            <li><a id="all" class={windowLocationHash === '#all' ? 'selected' : ''} href="#all">All</a></li>&nbsp;
            <li><a id="pending" class={windowLocationHash === '#pending' ? 'selected' : ''} href="#pending">Pending</a></li>&nbsp;
            <li><a id="done" class={windowLocationHash === '#done' ? 'selected' : ''} href="#done">Done</a></li>
          </ul>
          <button onClick={this.#clearToDoLists} id="clear" class={countToDoListsDone > 0 ? '' : 'hide hidden'} title="Click to delete done">Clear</button>
          <span id="confirmation" class="hidden">
            Sure?&nbsp;
            <button onClick={this.#clearToDoListsYes.bind(this)} id="yes" title="Click to confirm">Yes</button>&nbsp;
            <button onClick={this.#clearToDoListsNo} id="no" title="Click to reject">No</button>
          </span>
        </footer>
      </section>
    );
  }
}