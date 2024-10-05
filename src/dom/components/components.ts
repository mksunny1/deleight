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
 * @module
 */

import { assign } from "../../object/operations/operations.js";
import { IKey } from "../../types.js";

export interface IComponent {
    (elements: Element | Iterable<Element>, matcher?: IKey | Attr, ...args: any[]): any
}

/**
 * Creates a function to be called with listener functions to return `apply
 * @param event 
 * @param options 
 * @returns 
 */
export function listener(event: keyof HTMLElementEventMap, options?: AddEventListenerOptions) {
    return (listener: EventListener) => (elements: Element | Iterable<Element>, key: IKey) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) element.addEventListener(event, listener, options);
    }
}

export function setter(prop: keyof Element) {
    return (value: any) => (elements: Element | Iterable<Element>, key: IKey) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) element[prop as IKey] = value;
    }
}

/**
 * Returns a component for setting multiple element properties or 
 * nested properties (such as properties within Element.style
 * 
 * @example
 * )
 * @param value 
 * @returns 
 */
export function assigner(value: object) {
    return (elements: Element | Iterable<Element>, key: IKey) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) assign(element, [value]);
    }
}

/**
 * Returns a component for setting single element attributes.
 * 
 * @example
 * 
 * @param name 
 * @returns 
 */
export function attrSetter(name: string) {
    return (value: any) => (elements: Element | Iterable<Element>, key: IKey) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) element.setAttribute(name, value);
    }
}

/**
 * Returns a component for setting multiple element attributes.
 * 
 * @example
 * 
 * @param values 
 * @returns 
 */
export function attrsSetter<T extends object>(values: T) {
    return (elements: Element | Iterable<Element>, key: IKey) => {
        if (elements instanceof Element) elements = [elements];
        for (let element of elements) for (let [k, v] of Object.entries(values)) element.setAttribute(k, v);
    }
}

// implement these later:

/**
 * Sets attributes on 1 or more elements.
 * 
 * @param elements 
 */
function setAttrs(elements: Element | Iterable<Element>) {

}