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
 * Pending tests. Please report bugs.
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
 * Pending tests. Please report bugs.
 * 
 * @example
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
 * )
 * @param value 
 * @returns 
 */
export function assigner(value: object) {
    return (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) assign(element, [value]);
    }
}

/**
 * Returns a component for setting single element attributes.
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
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
 * 
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
 * 
 * 
 * @param selectorAttr 
 * @returns 
 */
export function selectMembers<T extends object>(element: Element, selectorAttr = 'm-ember') {
    const selected = element.querySelectorAll(`*[${selectorAttr}]`);
    for (let item of selected) element[item.getAttribute(selectorAttr)] = item;
    return element as Element & T;
}


/**
 * Components for setting up reactivity
 */

/**
 * A component that simply adds the element (or a wrapper around it) to an object used with primitives from 
 * the object/sharedmember module
 * 
 * @example
 * 
 * @param to 
 * @param key 
 * @param wrapper
 * @returns 
 */
export function bind<T extends object, U = any>(to: T, key: IKey, wrapper?: (element: Element) => U) {
    return (elements: Element | Iterable<Element>) => {
        if (elements instanceof Element) elements = [elements];
        if (!to.hasOwnProperty(key)) to[key] = []
        if (wrapper) elements = Array.prototype.map.call(elements, wrapper) as any[];
        to[key].push(...elements);
    }
}

const attrHandler = {
    set(target: Element, key: IKey, value: any) {
        if (typeof key === 'string') target.setAttribute(key, value);
        return true;
    }
}

/**
 * A wrapper used with {@link bind} to make the binding set attributes 
 * instead of properties on the bound element.
 * 
 * @example
 * 
 * @param element 
 */
export function attr(element: Element) {
    return new Proxy(element, attrHandler);
}

/**
 * A wrapper used with {@link bind} to bind an element 
 * property (such as style) instead of the element itself
 * 
 * @example
 * 
 * @param element 
 */
export function prop(element: Element, key: keyof Element) {
    return element[key];
}

