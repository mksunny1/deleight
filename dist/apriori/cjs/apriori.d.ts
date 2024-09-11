/**
 * This module exports primitives for building and/or setting up DOM in various ways.
 *
 * @module
 */
/**
 * A template tag that will resolve only after all
 * interpolated promises have been resolved, finally returning the
 * intended string.
 *
 * @example
 * import { tag } from 'deleight/apriori';
 * const t = tag`I will wait for this ${Promise.resolve("promise")}!!!`
 * // t === 'I will wait for this promise!!!'
 *
 * @param {Array<string>} strings
 * @param  {...any} expressions
 * @returns {Promise<string>}
 */
declare function tag(strings: Array<string>, ...expressions: any[]): Promise<string>;
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function
 * which can be called multiple times to 'render' the template with the given arguments.
 *
 * @example
 * import { template } from 'deleight/apriori';
 * const t = template('I will render this ${"guy"} immediately!!!')();
 * // t === 'I will render this guy immediately!!!'
 *
 * @param {string} templateStr the template string
 * @param {string[]} argNames The names of the parameters of the returned function (which can be 'seen' inside the template string).
 * Defaults to: ['arg'].
 * @returns {(...any): string}
 */
declare function template(templateStr: string, argNames?: string[]): (...args: any[]) => string;
/**
 * Similar to template but the built template is also 'promise-aware' and will allow them to resolve to string values
 * before interpolating them.
 *
 * @example
 * import { asyncTemplate } from 'deleight/apriori';
 * const t = await asyncTemplate('I will wait for this ${Promise.resolve("promise")}!!!')();
 * // t === 'I will wait for this promise!!!'
 *
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames The names of the parameters of the returned function (which can be 'seen' inside the template string).
 * Defaults to: ['arg'].
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {(...any): Promise<string>}
 */
declare function asyncTemplate(templateStr: string, argNames?: Array<string>, tagName?: string): (...any: any[]) => Promise<string>;
/**
 * The return value of a call to arrayTemplate.
 */
interface ITemplates {
    (arr: Iterable<any>, ...args: any[]): Iterable<string>;
}
/**
 * The return value of a call to asyncArrayTemplate.
 */
interface IAsyncTemplates {
    (arr: Iterable<any>, ...args: any[]): Iterable<Promise<string>>;
}
/**
 * Similar to template, but will render an iterable (such as array) of items together instead
 * of rendering each item individually. It improves efficiency in these scenarios because only 1 rendering
 * function is called.
 *
 * @example
 * import { templates } from 'deleight/apriori';
 * const t = arrayTemplate('I will render this ${it}/${other} immediately!!!', ['other'], 'it')([1, 2, 3, 4, 5], '(shared)').join(' & ');
 * // t === 'I will render this 1/(shared) immediately!!! & I will render this 2/(shared) immediately!!! & I will render this 3/(shared) immediately!!! & I will render this 4/(shared) immediately!!! & I will render this 5/(shared) immediately!!!'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (after the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * Defaults to the empty string.
 * @returns {ITemplates}
 */
declare function templates(templateStr: string, argNames: Array<string>, itemName: string): ITemplates;
/**
 * Async equivalent of arrayTemplate. The async template tag ('T' by default)
 * is applied to the template string. Use this when there are promises
 * among the arguents that will be passed to the returned function.
 *
 * @example
 * import { asyncTemplates } from 'deleight/apriori';
 * let t = asyncTemplates('I will async render this ${item}')([1, 2, 3, 4, 5].map(i => Promise.resolve(i)));
 * console.log(t instanceof Promise);   // true
 * t = (await t).join(' ')
 * // t === 'I will async render this 1 I will async render this 2 I will async render this 3 I will async render this 4 I will async render this 5'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (after the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {IAsyncTemplates}
 */
declare function asyncTemplates(templateStr: string, argNames: Array<string>, itemName: string, tagName: string): IAsyncTemplates;
/**
 * Fetches text (typically markup) from the url. This is only a shorthand
 * for using `fetch`.
 *
 * @example
 * import { get } from 'deleight/apriori';
 * const markup = await get('./something.html')
 *
 *
 * @param {string} url  The url to pass to `fetch`
 * @param {boolean} [suppressErrors] Whether to return the empty string if an error occurs.
 * @param {RequestInit} [init]  The `init` argument for `fetch`
 * @returns {Promise<string>}
 */
declare function get(url: string, suppressErrors?: boolean, init?: RequestInit): Promise<string>;
/**
 * Shorthand for creating a DocumentFragment from markup. If the
 * fragment has only one child, the child is returned instead.
 * So this is also a shorthand for creating single elements.
 *
 * @example
 * import { createFragment } from 'deleight/apriori';
 * const frag1 = createFragment(`
 *    <p>Para 1</p>
 *    <p>Para 2</p>
 *`)
 * // <p>Para 1</p><p>Para 2</p>
 *
 * @param {string} markup The `outerHTML` of what to create
 * @returns {Node}
 */
declare const createFragment: (markup: string) => DocumentFragment | Element;
/**
 * A generator for elements with the specified tag names.
 * The names are space-separated just like in a class attribute.
 * You can also separate with commma if you prefer.
 *
 * @example
 * import { elements } from 'deleight/apriori';
 * const [div, p, span] = elements('div p span');
 * const [div2, p2, span2] = elements('div, p, span');
 *
 * @param {string} tagNames
 */
declare function elements(tagNames: string): Generator<HTMLElement, void, unknown>;
/**
 * Sets up the specified element(s) with the given arguments.
 *
 * The values in `args` are interpreted as follows:
 * 1. string, number and Node values are appended to the element
 * 2. functions values are called with the element as the sole argument
 * 3. object values are used to assign properties using `Object.assign`
 *
 * This function is also used internally to set up new elements created with
 * {@link e}.
 *
 * Note that because of how Node appends work, any nodes `args` will end up
 * appended only to the last element in `elements` (if they are more than one).
 * Conversely, any fragments in `args` will have their nodes only
 * appended to the first element in `elements`.
 *
 * @example
 * import { setup, e } from 'deleight/apriori';
 * const tree = document.querySelector('main');
 * setup(
 *     main,
 *     e.h1('Title',
 *          h1 => console.log(h1, ' created')
 *     ),
 *     e.section(
 *         e.h2('Section 1'),
 *         e.p(
 *             'This is the first section',
 *             { className: 'text-centre' }
 *         )
 *     )
 * );
 *
 * @param elements the element(s) to setup
 * @param args the setup arguments
 * @returns this same function to support chaining multiple setup calls.
 */
declare function setup(elements: Element | Iterable<Element>, ...args: any[]): typeof setup;
/**
 * A simple proxy object for creating and 'setting up' a new element in one go.
 * Can be nested to create and setup entire DOM trees. This is much more
 * powerful than the simple `elements` function which simply creates and returns
 * 1 or more elements.
 *
 * @example
 * import { e } from 'deleight/apriori';
 * const tree = e.main(e.h1('Title',                               // stringd are appended
 *                          h1 => console.log(h1, ' created')),    // functions are called with the new element
 *                     e.section(e.h2('Section 1'),
 *                               e.p('This is the first section',
 *                                   { className: 'text-centre' }  // objects are used to assign properties.
 *                                  )
 *                              )                                  // nodes are appended
 *                    );
 * document.appendChild(tree);
 *
 */
declare const e: any;
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
declare function escObject(rawObject: any): any;
/**
 * Escapes special HTML characters in the input (unsafe) string.
 *
 * Credits 'bjornd' (https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript)
 *
 * @param {*} unsafe
 * @returns
 */
declare function escString(unsafe: string): string;

export { type IAsyncTemplates, type ITemplates, asyncTemplate, asyncTemplates, createFragment, e, elements, escObject, escString, get, setup, tag, template, templates };
