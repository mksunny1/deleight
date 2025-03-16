/**
 * A few important functions for expressively and efficiently 
 * working with elements on a web page. 
 * 
 * The functions here include:
 * 
 * 5. {@link listener} an {@link apply} component (function) used to declaratively 
 * attach listeners to specified elements within a tree.
 * 
 * 6. {@link setter} an {@link apply} component (function) used to declaratively 
 * set the values of element properties within a tree.
 * 
 * 7. {@link assigner} an {@link apply} component (function) used to declaratively 
 * set element sub-properties within a tree.
 * 
 * 8. {@link attrSetter} an {@link apply} component (function) used to declaratively 
 * set the values of element attributes within a tree.
 * 
 * 9. Many more including {@link addTo}, {@link attr}, {@link prop} and 
 * {@link selectorSetter}...
 * 
 * The functions are used to build components which can be used with {@link apply}, 
 * {@link process} or {@link Dom}.
 * 
 * Pending tests. Please report bugs.
 * 
 * @module
 */

import { assign } from "../../object/operations/operations.js";
import { IKey } from "../../types.js";

export interface IComponent {
    (elements: Element | Iterable<Element>, matcher?: IKey | Attr, ...args: any[]): any
}

/**
 * Creates a function to be called with listener functions to return `apply
 * 
 * @example
 * import { listener } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * const componentFactory = listener('click', { once: true })
 * 
 * const btns = [];
 * const component = componentFactory(e => btns.push(e.target.textContent));
 * 
 * const subComponents = { button: component }
 * apply({ section: subComponents, article: subComponents });
 * 
 * @param event 
 * @param options 
 * @returns 
 */
export function listener(event: keyof HTMLElementEventMap, options?: AddEventListenerOptions) {
    return (listener: EventListener) => (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) element.addEventListener(event, listener, options);
    }
}

/**
 * Sets a property on 1 or more elements. 
 * 
 * @example
 * import { setter } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * const val = setter('propKey');
 * apply({ section: { button: val(20) }, article: { button: val(33) } });
 * 
 * @param key 
 * @returns 
 */
export function setter(key: IKey) {
    return (value: any) => (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) element[key] = value;
    }
}

/**
 * Returns a component for setting multiple element properties or 
 * nested properties (such as properties within Element.style.
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
 * import { setters } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * apply({ 
 *     section: { button: setters({ a: 1, b: 2 }) }, 
 *     article: { button: setters({ a: 5, b: 6 })  } 
 * });
 * 
 * @param value 
 * @returns 
 */
export function setters(value: object) {
    return (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) assign(element, [value]);
    }
}

/**
 * Alias (older name) for {@link setters}
 */
export const assigner = setters;

/**
 * Returns a component for setting single element attributes.
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
 * import { attrSetter } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * const val = attrSetter('attr')
 * apply({ section: { button: val(20) }, article: { button: val(33) } });
 * 
 * @param name 
 * @returns 
 */
export function attrSetter(name: string) {
    return (value: any) => (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) element.setAttribute(name, value);
    }
}

/**
 * Returns a component for setting multiple element attributes.
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
 * import { attrsSetter } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * apply({ 
 *     section: { button: attrsSetter({ a: '1', b: '2' }) }, 
 *     article: { button: attrsSetter({ a: '5', b: '6' })  } 
 * });
 * 
 * @param values 
 * @returns 
 */
export function attrsSetter<T extends object>(values: T) {
    return (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) for (let [k, v] of Object.entries(values)) element.setAttribute(k, v);
    }
}

/**
 * Returns a component that sets the selected members as properties on the element using the keys 
 * associated with the `selectorAttr`.
 * 
 * @example
 * import { listener } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p m-ember="about">I am a paragraph</p>
 * <section>I am a section <button m-ember="b1">Btn1</button></section>
 * <article>I am an article <button m-ember="b2">Btn2</button></article>
 * `;
 * 
 * const comp = selectorSetter()
 * comp(body);
 * document.body.about;
 * document.body.b1;
 * document.body.b2;
 * 
 * @param selectorAttr 
 * @returns 
 */
export function selectorSetter(selectorAttr = 'm-ember') {
    return (element: Element) => {
        selectMembers(element, selectorAttr);
    }
}

/**
 * Sets the selected members as properties on the element using the keys 
 * associated with the `selectorAttr`.
 * 
 * @example
 * import { selectMembers } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button m-ember="b1">Btn1</button></section>
 * <article>I am an article <button m-ember="b2">Btn2</button></article>
 * `;
 * 
 * selectMembers();
 * document.body.b1;
 * document.body.b2;
 * 
 * 
 * @param selectorAttr 
 * @returns 
 */
export function selectMembers<T extends object>(element?: Element, selectorAttr = 'm-ember') {
    if (!element) element = document.body;
    const selected = element.querySelectorAll(`*[${selectorAttr}]`);
    for (let item of selected) element[item.getAttribute(selectorAttr)] = item;
    return element as Element & T;
}

/**
 * Components for setting up reactivity
 */

/**
 * A component that adds the element (or a value derived from it) 
 * to an object used with primitives from the object/shared module. 
 * 
 * The optional wrapper is a function or key used to derive another 
 * value from the element. If a function, it takes the element, 
 * optional matcher and optional extra args as arg 
 * and returns the derived value. If a key, fetches the element's 
 * property with the key.
 * 
 * @example
 * import { addTo } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * const obj = { };    // a reactive object
 * apply({ 
 *     section: { button: addTo(obj, text) }, 
 *     article: { button: addTo(obj, text) } 
 * });
 * 
 * @param object 
 * @param key 
 * @param wrapper
 * @returns 
 */
export function addTo<T extends object, U = any>(object: T, key: IKey, wrapper?: IKey | ((element: Element, matcher?: IKey | Attr, ...args: any[]) => U)) {
    if (!key) key = 'textContent';
    return (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        if (wrapper && !(wrapper instanceof Function)) {
            const key = wrapper;
            wrapper = (el) => el[key];
        }
        if (wrapper) elements = Array.prototype.map.call(elements, wrapper) as any[];
        if (!Reflect.has(object, key)) object[key] = [];
        object[key].push(...elements);
    }
}

/**
 * Alias (older name) for {@link addTo}
 */
export const bind = addTo;

const attrHandler = {
    set(target: Element, key: IKey, value: any) {
        if (typeof key === 'string') target.setAttribute(key, value);
        return true;
    }
}

/**
 * A wrapper used with {@link addTo} to make the binding set attributes 
 * instead of properties on the bound element.
 * 
 * @example
 * import { addTo, attr } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * import { sets } from 'deleight/object/shared'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * const obj = { };    // a reactive object
 * 
 * apply({ 
 *     section: { button: addTo(obj, 'a', attr) }, 
 *     article: { button: addTo(obj, 'color', 'styles') } 
 * });
 * 
 * sets(obj, 'yellow');
 * // document.querySelector('button').getAttribute('a');   // yellow
 * // document.body.lastElementChild.lastElementChild.style.color;  // yellow
 * 
 * sets(obj, 'green');
 * // document.querySelector('button').getAttribute('a');   // green
 * // document.body.lastElementChild.lastElementChild.style.color;  // green
 * 
 * @param element 
 */
export function attr(element: Element) {
    return new Proxy(element, attrHandler);
}

/**
 * Returns a component that applies all the specified components 
 * to the matched element(s):
 * 
 * @example
 * import { listener } from 'deleight/dom/components'
 * import { apply } from 'deleight/dom/apply'
 * 
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section <button>Btn1</button></section>
 * <article>I am an article <button>Btn2</button></article>
 * `;
 * 
 * const a = setter('a');
 * const b = setter('b');
 * apply({ section: { button: all(a(2), b(3)) }, article: { button: all(a(62), b(53)) } });
 * 
 * @param components 
 * @returns 
 */
export function all(...components: IComponent[]) {
    return (elements: Element | Iterable<Element>, matcher?: IKey | Attr, ...args: any[]) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) for (let comp of components) comp(element, matcher, ...args);
    }
}

/**
 * Just an alias for the longish 'textContent' string.
 * 
 */
export const text = 'textContent';
