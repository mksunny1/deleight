/**
 * A few important functions for expressively and efficiently
 * working with elements on a web page. The library assumes that
 * the elements already exist in the DOM or can be loaded as markup
 * from a remote link.
 *
 * The functions here include:
 *
 * 1. {@link createFragment} used to more succinctly create document fragments
 * from markup text.
 *
 * 2. {@link loadFragment} used to load markup from a remote link and build
 * a document fragment from it.
 *
 * 3. {@link processElement} used to apply functions to elements which specify them
 * as components using special attributes.
 *
 * 4. {@link apply} used to map elements within a tree to components (functions)
 * that will be called with them.
 *
 * 5. {@link listen} an {@link apply} component (function) used to declaratively
 * attach listeners to specified elements within a tree.
 *
 * 6. {@link set} an {@link apply} component (function) used to declaratively
 * set the values of element properties within a tree.
 *
 * 7. {@link assign} an {@link apply} component (function) used to declaratively
 * set element sub-properties within a tree.
 *
 * 8. {@link attr} an {@link apply} component (function) used to declaratively
 * set the values of element attributes within a tree.
 *
 * 9. {@link setContext} used to enforce 'single-run' behavior of functions to
 * prevent unintended repeat operations.
 *
 *
 * @module
 */
import { process } from "../../object/process/process.js";
function processAction(action, options) {
    return (elements, key) => {
        const currentElement = elements[key];
        const prefix = options?.prefix || 'c-', openPrefix = options?.openPrefix || 'o-';
        const length = prefix.length;
        let name, value, isOpen = true;
        if (action instanceof Function) {
            action([currentElement], '*');
        }
        else {
            for (let attr of currentElement.attributes) {
                if (attr.name.startsWith(prefix) || attr.name.startsWith(openPrefix)) {
                    name = attr.name.slice(length);
                    if (attr.name.startsWith(prefix))
                        isOpen = false;
                    if (action instanceof Function) { // a catch-all component. 
                        value = action;
                    }
                    else if (Reflect.has(action, name)) {
                        value = action[name];
                    }
                    else {
                        console.error(`The component: ${name} could not be found in the process map.`);
                        continue;
                    }
                    if (value instanceof Function)
                        value([currentElement], attr);
                    else
                        processElement(currentElement, value, options); // process with nested components
                }
            }
        }
        // process element children:
        if (!currentElement.hasAttribute(options?.closed || 'close-d') &&
            (isOpen || currentElement.hasAttribute(options?.open || 'ope-n'))) {
            if (options?.only) {
                return currentElement.querySelectorAll(`:scope>${options.only}`);
            }
            else
                return currentElement.children;
        }
    };
}
/**
 * Recursively process the element tree to apply a single component or an
 * object of components with
 * names specified by component attributes within the element tree.
 *
 * This function uses {@link baseProcess} under the hood so similar notes
 * apply. Here the element is the object to traverse and the components
 * and options are used to create the action passed to the underlying
 * function.
 *
 * A single component action (function) will simply run over the element and all
 * non-closed descendants. An object of components will match property names
 * against attribute names to run.
 *
 * A component attribute is an attribute with a name starting with the
 * compronent prefix (given as the `options.prefix` argument or `c-` by default).
 *
 * When a component is matched, it is called with the matching element and attribute
 * as its first 2 arguments. The element is placed in a 1-item array for consistency
 * with {@link apply} so that the same components work with both functions (in most cases).
 * If `options.args` is provided, its items will form the
 * remaining arguments passed to the component.
 *
 * Two other options (options.open and options.closed) are available to overide the
 * default attributes (ope-n and close-d) used to encapsulate components in the
 * markup.
 *
 * By default if an element is matched against a component, its descendants
 * will not be traversed by Process. You need to add the `ope-n` attribute here to
 * force further traversal of the element's tree (or use options.openPrefix instead of
 * options.prefix).
 *
 * Conversely, unmatched elements will always be traversed unless you include the
 * `close-d` attribute (or whatever you override it with in `options.open`).
 *
 * We can also supply `options.only` to process only elements that match a query.
 * This will usually improve performance.
 *
 * @example
 *
 *
 * @param element
 * @param action
 * @param options
 * @returns
 */
export function processElement(element, action, options) {
    if (element instanceof DocumentFragment) {
        for (let child of element.children)
            processElement(child, action, options);
    }
    return process(element.children, processAction(action, options), ...(options?.args || []));
}
