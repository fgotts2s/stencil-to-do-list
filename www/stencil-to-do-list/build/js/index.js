/**
 * The division element containing the single page application.
 */
const nodeSinglePageApplication = document.getElementById('single-page-application');
/**
 * An object containing the single page application's routes.
 */
const singlePageApplicationRoutes = {
  '/': 'stencil-to-do-lists',
  '/to-do-list': 'stencil-to-do-list'
};
/**
 * A function to handle a window load or popstate event.
 */
const eventHandler = () => {
  // Split the pathname into slug and ID.
  const pathParts = window.location.pathname.replace('/stencil-to-do-list', '').split('/');
  const slug = pathParts[1];
  const id = pathParts[2];
  // Determine which web component to display.
  const webComponent = singlePageApplicationRoutes[`/${slug}`];
  // Using the innerHTML property along with a template string rather than creating and appending the respective custom element
  // to make the ID attribute present in the first place and therefore avoiding the need of an attribute changed callback.
  nodeSinglePageApplication.innerHTML = `<${webComponent}${id ? ' id="' + id + '"' : ''}></${webComponent}>`;
  // Show or hide the navigation bar depending on the currently displayed web component.
  const navigation = document.querySelector('nav');
  if (slug === 'to-do-list') {
    navigation.classList.remove('hide');
  } else {
    navigation.classList.add('hide');
  }
};
/**
 * Add an event listener triggered when the whole document is loaded.
 */
window.addEventListener('load', () => {
  // Execute the previously defined event handler.
  eventHandler();
  // Add an event listener triggered when the navigation bar is clicked.
  const navigationLink = document.querySelector('nav a');
  navigationLink.addEventListener('click', event => {
    // Prevent a page reload.
    event.preventDefault();
    // Assign the navigation bar anchor's href attribute's value, i. e. the hyperlink's target URL, to a pathname object.
    const {pathname: path} = new URL(event.target.href);
    // Add a new entry to the browser's session history stack.
    window.history.pushState({path}, '', path);
    // Assign a new popstate event including the previously assigned pathname object and trigger it manually.
    const popStateEvent = new PopStateEvent('popstate', {pathname: path});
    dispatchEvent(popStateEvent);
  });
});
/**
 * Add an event listener triggered when the browser's active history entry changes.
 */
window.addEventListener('popstate', () => {
  // Execute the previously defined event handler.
  eventHandler();
});