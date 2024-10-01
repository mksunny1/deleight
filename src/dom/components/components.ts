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
 * 
 * @module
 */

import { assign } from "../../object/operations/operations.js";
import { IKey } from "../../types.js";

export interface IComponent {
    (elements: Iterable<Element>, matcher: IKey | Attr, ...args: any[]): any
}

/**
 * Creates a function to be called with listener functions to return `apply
 * @param event 
 * @param options 
 * @returns 
 */
export function listener(event: keyof HTMLElementEventMap, options?: AddEventListenerOptions) {
    return (listener: EventListener) => (elements: Iterable<Element>, key: IKey) => {
        for (let element of elements) element.addEventListener(event, listener, options);
    }
}

export function setter(prop: keyof Element) {
    return (value: any) => (elements: Iterable<Element>, key: IKey) => {
        for (let element of elements) element[prop as IKey] = value;
    }
}

export function assigner(value: object) {
    return (elements: Iterable<Element>, key: IKey) => {
        for (let element of elements) assign(element, [value]);
    }
}

export function attrSetter(name: string) {
    return (value: any) => (elements: Iterable<Element>, key: IKey) => {
        for (let element of elements) element.setAttribute(name, value);
    }
}
