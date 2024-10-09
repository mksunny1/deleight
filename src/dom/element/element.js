/**
 *
 * Functions for creating views (elements) with javascript objects (instead of text).
 * Can be used on the server or client. Straightforward object
 * structure and interpretation, almost like using templates.
 *
 * Benefits:
 * 1. easily reuse `templates` (simple functions that return appropriate objects).
 * 2. more natural within js code.
 * 3. ITree objects can be created more dynamically.
 */
const ATTRS = 0;
const CHILDREN = 1;
/**
 * Render the IElement to text. Use on the server.
 *
 * @example
 * import { render } from 'deleight/dom'
 * // create a template 1:
 * const items = it => it.map(num => ({li: [{}, num]}));
 *
 * // create a template 2:
 * const footer = year => `<footer>&copy; ${year}</footer>`;
 *
 * // use templates:
 * const ul = render({
 *     main: [
 *         {},              // attributes
 *         [                // children
 *             // object form:
 *             { ul: [{ class: 'list1' }, items([1,2,3,4,5,6,7,8,9])] },
 *
 *             // text form:
 *             footer(1991)
 *         ]
 *     ]
 *
 * });
 *
 * // reuse a template:
 * const ol = render({
 *     ol: [{ class: 'list2' }, items([1,2,3,4,5,6,7,8,9,10])]
 * });
 *
 * @param iElement
 * @returns
 */
export function render(iElement) {
    let children;
    return Object.entries(iElement).map(([tag, content]) => `
<${tag} ${content instanceof Array ? Object.entries(content[ATTRS]).map(([name, val]) => `${name}="${val}"`).join(' ') : ''}>
    ${content instanceof Array ? (!((children = content[CHILDREN]) instanceof Array)) ? children : children.map(item => (typeof item === 'object') ? render(item) : item).join('') : content}
</${tag}>`)[0] || '';
}
/**
 * Build an element from the IElement. Use in the browser.
 *
 * @example
 * import { build } from 'deleight/dom'
 * // create a template 1:
 * const items = it => it.map(num => ({li: num}));   // you can abbreviate simple elements
 *
 * // create a template 2:
 * const footer = year => `<footer>&copy; ${year}</footer>`;
 *
 * // use templates:
 * const ul = build({
 *     main: [
 *         {},              // attributes
 *         [                // children
 *             // object form:
 *             { ul: [{ class: 'list1' }, items([1,2,3,4,5,6,7,8,9])] },
 *
 *             // text form:
 *             footer(1991)
 *         ]
 *     ]
 *
 * });
 *
 * // reuse a template:
 * const ol = build({
 *     ol: [
 *             { class: 'list2' },                              // attributes
 *             items([1,2,3,4,5,6,7,8,9,10]),                   // children
 *             ol => ol.onclick = console.log.bind(console),    // component
 *             // further components separated by comma...
 *     ]
 * });
 *
 *
 * @param iElement
 * @returns
 */
export function build(iElement) {
    for (let [tag, content] of Object.entries(iElement)) {
        const element = document.createElement(tag);
        let comp;
        if (typeof content !== 'object') {
            element.textContent = content;
        }
        else {
            for (let [name, value] of Object.entries(content[ATTRS])) {
                element.setAttribute(name, value);
            }
            const children = content[CHILDREN];
            if (children instanceof Array)
                element.append(...children.map(child => typeof child === 'object' ? build(child) : child));
            else
                element.textContent = children;
            for (let i = 2; i < content.length; i++) {
                comp = content[i];
                if (comp instanceof Function)
                    comp(element);
                else
                    Object.assign(element, comp);
            }
        }
        return element;
    }
}
/**
 * Returns an object which escapes properties sourced from it. Escaping markup is a key component of template rendering,
 * so this is an important function to have here.
 *
 * NB: there are no tests yet. Please report any bugs.
 *
 * @example
 * import { esc } from 'deleight/apriori'
 * const obj = { a: 1, b: 'no special chars', c: '<p>But I am a paragraph</p>', d: { e: '<p>"esc" will still work here</p>' } }
 * const escObj = esc(obj);
 * console.log(escObj.c);     // &lt;p&gt;But I am a paragraph&lt;/p&gt;
 * console.log(escObj.d.e);     // &lt;p&gt;&quot;esc&quot; will still work here&lt;/p&gt;
 *
 *
 * @param {*} rawObject
 */
export function escapeObject(rawObject) {
    return new Proxy(rawObject, new EscTrap());
}
/**
 * Escapes special HTML characters in the input (unsafe) string.
 *
 * Credits 'bjornd' (https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript)
 *
 * @param {*} unsafe
 * @returns
 */
export function escapeString(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
class EscTrap {
    constructor() {
        this.children = {};
    }
    get(target, p) {
        if (this.children.hasOwnProperty(p))
            return this.children[p];
        const result = target[p];
        if (typeof result === 'string')
            return this.children[p] = escapeString(result);
        else if (typeof result === 'object')
            return this.children[p] = escapeObject(result);
        else
            return this.children[p] = result;
    }
}
