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
 * // create a template:
 * const items = it => it.map(num => ({li: [{}, num]}));
 *
 * // use a template:
 * const ul = render({
 *     ul: [{ class: 'list1' }, items([1,2,3,4,5,6,7,8,9])]
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
<${tag} ${Object.entries(content[ATTRS]).map(([name, val]) => `${name}="${val}"`).join(' ')}>
    ${(!((children = content[CHILDREN]) instanceof Array)) ? children : children.map(item => (typeof item === 'object') ? render(item) : item).join('')}
</${tag}>`).join('');
}
/**
 * Build an element from the IElement. Use in the browser.
 *
 * @example
 * import { build } from 'deleight/dom'
 *
 * // create a template:
 * const items = it => it.map(num => ({li: [{}, num]}));
 *
 * // use a template:
 * const ul = build({
 *     ul: [{ class: 'list1' }, items([1,2,3,4,5,6,7,8,9])]
 * });
 *
 * // reuse a template:
 * const ol = build({
 *     ol: [{ class: 'list2' }, items([1,2,3,4,5,6,7,8,9,10])]
 * });
 *
 *
 * @param iElement
 * @returns
 */
export function build(iElement) {
    for (let [tag, content] of Object.entries(iElement)) {
        const element = document.createElement(tag);
        for (let [name, value] of Object.entries(content[0])) {
            element.setAttribute(name, value);
        }
        const children = content[1];
        if (children instanceof Array)
            element.append(...children.map(child => typeof child === 'object' ? build(child) : child));
        else
            element.textContent = children;
        for (let i = 2; i < content.length; i++) {
            content[i](element);
        }
        return element;
    }
}
