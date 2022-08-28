/**
 * Import required Stencil modules.
 */
import { Component, Element, Prop, h } from '@stencil/core';

/**
 * Decorator to specify the component's basic adjustments.
 */
@Component({
  // The custom element's tag name.
  tag: 'stencil-to-do-list-preview',
  // The CSS file's location.
  styleUrl: './css/stencil-to-do-list-preview.css',
  // The assets' directories.
  assetsDirs: ['css', 'img', 'js'],
  // Enable shadow DOM.
  shadow: true
})

/**
 * Class representing a custom element to insert a to-do list preview to the document.
 */
export class StencilToDoListPreview {
  // Decorator to make the host element including it's shadow DOM accessible.
  @Element() host;
  // The to-do list ID property, explicitly mutable from inside the component's logic.
  @Prop({ attribute: 'id', mutable: true }) toDoListId: number;
  // The to-do list property, explicitly mutable from inside the component's logic.
  @Prop({ mutable: true }) toDoList: any;
  // The to-do lists property, explicitly mutable from inside the component's logic.
  @Prop({ mutable: true }) toDoLists: any;
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
  }
  /**
   * Method to render the to-do list.
   */
  render() {
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
        </header>
        <section class="to-do-list">
          {countToDoListItemsAll > 0 ?
            <ul class="to-do-list">
              {this.toDoList.items.map(
                (toDoListItem) => {
                  return (
                    <li id={toDoListItem.id} class={toDoListItem.done ? 'done' : 'pending'}>
                      <input class="select" type="checkbox" checked={toDoListItem.done} />
                      <label data-created={toDoListItem.created} data-last-modified={toDoListItem.lastUpdated} class="text">{toDoListItem.text}</label>
                    </li>
                  );
                }
              )}
            </ul> :
            this.toDoList.id !== undefined ?
              <p>Good for you: There's nothing to do!</p> :
              <p>Invalid ID!</p>
          }
        </section>
        <hr class={countToDoListItemsAll > 0 ? '' : 'hidden'} />
        <footer class={countToDoListItemsAll > 0 ? '' : 'hidden'}>
          <span id="count" class={countToDoListItemsAll > 0 ? '' : 'hide hidden'}>{countToDoListItemsAll} ({countToDoListItemsPending}/{countToDoListItemsDone})</span>
        </footer>
      </section>
    );
  }
}
