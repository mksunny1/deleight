/**
 *
 * Functions for creating views (elements) with javascript objects (instead of text).
 * Can be used on the server or client. Straightforward object
 * structure and interpretation, almost like using templates.
 *
 * Benefits:
 * 1. easily reuse `templates` (simple functions that return appropriate objects).
 * 2. more natural within js code.
 * 3. IElement objects can be created more dynamically.
 */
const ATTRS = 0;
const CHILDREN = 1;
const COMPS = 2;
/**
 * Render the IElement to text. Use on the server.
 *
 * @example
 * import { render } from 'deleight/dom'
 * // create a template 1:
 * const items = it => it.map(num => ({ li: num }));
 *
 * // create a template 2:
 * const footer = year => `<footer>&copy; ${year}</footer>`;
 *
 * // use templates:
 * const ul = render({
 *     main: [
 *         // object form:
 *         { ul: { 0: { class: 'list1' }, 1: items([1,2,3,4,5,6,7,8,9]) } },
 *
 *         // text form:
 *         footer(1991)
 *     ]
 *
 * });
 *
 * // reuse a template:
 * const ol = render({
 *     ol: { 0: { class: 'list2' }, 1: items([1,2,3,4,5,6,7,8,9,10]) }
 * });
 *
 * @param iElement
 * @returns
 */
export function render(iElement) {
    let attrs, children;
    const [tag, content] = Object.entries(iElement)[0];
    if (typeof content !== 'object') {
        attrs = {};
        children = [content];
    }
    else if (!(content instanceof Array)) {
        attrs = content[ATTRS] || {};
        children = content[CHILDREN] || [];
        if (!(children instanceof Array))
            children = [children];
    }
    else {
        attrs = {};
        children = content;
        if (!(children instanceof Array))
            children = [children];
    }
    return `
<${tag} ${Object.entries(attrs).map(([name, val]) => `${name}="${val}"`).join(' ')}>
    ${children.map(item => (typeof item === 'object') ? render(item) : `${item}`).join('')}
</${tag}>`;
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
 *         // object form:
 *         { ul: { 0: { class: 'list1' }, 1: items([1,2,3,4,5,6,7,8,9]) } },
 *
 *         // text form:
 *         footer(1991)
 *     ]
 *
 * });
 *
 * // reuse a template:
 * const ol = build({
 *     ol: {
 *         0: { class: 'list2' },                              // attributes
 *         1: items([1,2,3,4,5,6,7,8,9,10]),                   // children
 *         2: [ol => ol.onclick = console.log.bind(console)]   // components
 *     }
 * });
 *
 *
 * @param iElement
 * @returns
 */
export function build(iElement) {
    for (let [tag, content] of Object.entries(iElement)) {
        const element = document.createElement(tag);
        let children, comp, comps;
        if (typeof content !== 'object') {
            element.textContent = content;
        }
        else if (!(content instanceof Array)) {
            for (let [name, value] of Object.entries(content[ATTRS] || {})) {
                element.setAttribute(name, `${value}`);
            }
            children = content[CHILDREN] || [];
            if (!(children instanceof Array))
                children = [children];
            element.append(...children.map(child => typeof child === 'object' ? build(child) : child));
            comps = content[COMPS] || [];
            if (!(comps instanceof Array))
                comps = [comps];
            for (comp of comps) {
                if (comp instanceof Element)
                    (comp.shadowRoot || comp).appendChild(element);
                else if (comp instanceof Function)
                    comp(element);
                else
                    Object.assign(element, comp);
            }
        }
        else {
            element.append(...content.map(child => typeof child === 'object' ? build(child) : child));
        }
        return element;
    }
}
