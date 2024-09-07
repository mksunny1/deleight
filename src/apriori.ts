/**
 * This module exports primitives for building DOM from text.
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
export async function tag(
    strings: Array<string>,
    ...expressions: any[]
): Promise<string> {
    const promiseExpressions: unknown[] = [];

    for (let [i, exp] of Array.from(expressions.entries())) {
        if (exp instanceof Promise) promiseExpressions.push(exp);
        else promiseExpressions.push(Promise.resolve(exp));
    }

    const resolvedExpressions = await Promise.all(promiseExpressions);
    return (
        resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join("") +
        strings[resolvedExpressions.length]
    );
}

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
export function template(
    templateStr: string,
    argNames?: string[],
): (...args: any[]) => string {
    if (!argNames) argNames = ['arg'];
    return Function(...argNames, `return \`${templateStr}\`;`) as (...args: any[]) => string;
}
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
export function asyncTemplate(
    templateStr: string,
    argNames?: Array<string>,
    tagName?: string,
): (...any) => Promise<string> {
    if (!argNames) argNames = ['arg'];
    if (!tagName) tagName = "T";
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }
    const f = Function(
        tagName,
        ...argNames,
        `return ${tagName}\`${templateStr}\`;`,
    );
    return (...args) => f(tag, ...args);
}

/**
 * The return value of a call to arrayTemplate.
 */
export interface ITemplates {
    (arr: Iterable<any>, ...args: any[]): Iterable<string>;
}

/**
 * The return value of a call to asyncArrayTemplate.
 */
export interface IAsyncTemplates {
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
export function templates(
    templateStr: string,
    argNames: Array<string>,
    itemName: string
): ITemplates {
    if (!argNames) argNames = [];
    if (!itemName) itemName = "item";

    return (Function(`
        function* gen(arr, ${argNames.join(', ')}) {
            for (let ${itemName} of arr) yield \`${templateStr}\`;
        }
        return gen;`,
    ))();
}

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
export function asyncTemplates(
    templateStr: string,
    argNames: Array<string>,
    itemName: string,
    tagName: string,
): IAsyncTemplates {
    if (!argNames) argNames = [];
    if (!itemName) itemName = "item";
    if (!tagName) tagName = "T";

    if (itemName === tagName) {
        throw new Error(`The tag name ${tagName} is the same as the item name. 
        Please change the tag name or the item name to resolve this.`);
    }
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }

    const f = (Function(`
        function* gen(${tagName}, arr, ${argNames.join(', ')}) {
            for (let ${itemName} of arr) yield ${tagName}\`${templateStr}\`;
        }
        return gen;`,
    ))()

    return (arr, ...args) => f(tag, arr, ...args);
}

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
export async function get(
    url: string,
    suppressErrors?: boolean,
    init?: RequestInit,
): Promise<string> {
    let result = fetch(url, init).then((r) => r.text());
    if (suppressErrors) result = result.catch((r) => "");
    return result;
}

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
export const createFragment = function (
    markup: string,
): DocumentFragment | Element {
    const temp = document.createElement("template");
    temp.innerHTML = markup;
    let result = temp.content;
    if (result.children.length === 1) return result.children[0] as Element;
    return result as DocumentFragment;
};


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
export function* elements(tagNames: string) {
    for (let tagName of tagNames.replace(',', '').split(' ')) yield document.createElement(tagName.trim());
}

const eTrap = {
    get(target: any, p: string) {
        const element = document.createElement(p);
        return (...args: any[]) => {
            for (let arg of args) {
                if (arg instanceof Node) element.appendChild(arg);              // append node
                else if (typeof arg === 'string') element.append(arg);          // append text node
                else if (arg instanceof Function) arg(element);                 // arbitrary setup
                else if (typeof arg === 'object') Object.assign(element, arg);  // set properties
            }
            return element;
        }
    }
}

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
export const e = new Proxy({}, eTrap);

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
export function escObject(rawObject: any) {
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
export function escString(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

class EscTrap {
    children = {};
    get(target, p) {
        if (this.children.hasOwnProperty(p)) return this.children[p];
        const result = target[p];
        if (typeof result === 'string') return this.children[p] = escString(result);
        else if (typeof result === 'object') return this.children[p] = escObject(result);
        else return this.children[p] = result;
    }
}
