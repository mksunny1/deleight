/**
 * This module should provide a richer API for making elements look more like
 * simple objects in JavaScript code. It should supercede the Selectors module
 * once it has been properly tested. The main benefit is these objects improve
 * composability with other aspects of deleight so we can write less code.
 *
 * Using this library we can do things like:
 *
 * `assign(wrap(element), { href: './item/link', first: { section: {textContent: 'First section text'} } })`
 *
 * more straightforwardly. Combining with Aliad module will also enable us to
 * shorten long names like `textContent`.
 *
 * @module
 */
export type IKey = string | number | symbol;
declare class SelectorObject {
    #private;
    element: Element;
    constructor(element: Element);
    get(p: IKey): any;
    set(p: IKey, value: any): boolean;
    delete(p: IKey): boolean;
    get proxy(): typeof this;
    get [$$](): Element;
}
/**
 * A selector that holds all the other EOM objects as properties and also behaves like a `list` of
 * the children wlements of the wrapped element.
 *
 * @example
 *
 */
export declare class Selector extends SelectorObject {
    #private;
    static Attrs: typeof Attrs;
    static First: typeof First;
    static All: typeof All;
    get attrs(): Attrs;
    get first(): First;
    get all(): All;
}
export declare const $: unique symbol;
export declare const $$: unique symbol;
/**
 * Wraps a regular element with an instance of ELOMElement
 *
 * @example
 *
 *
 * @param element
 * @returns
 */
export declare function wrap(element: Element): Selector;
/**
 * Returns the element wrapped by any instance of SelectorObject.
 *
 * @example
 *
 *
 * @param selectorObject
 * @returns
 */
export declare function unwrap(selectorObject: SelectorObject): Element;
/**
 * A selector object that effectively holds all element attributes as properties.
 *
 * @example
 *
 */
export declare class Attrs extends SelectorObject {
    get(p: string): string;
    set(p: string, value: any): boolean;
    delete(p: string): boolean;
}
/**
 * A selector object that effectively holds the first objects that match specified queries as properties.
 *
 * @example
 *
 */
export declare class First extends SelectorObject {
    static selector: Function;
    get(p: string): Selector;
    set(p: string, ...values: Element[]): boolean;
    delete(p: string): boolean;
}
/**
 * A selector object that effectively holds all objects that match specified queries as properties.
 *
 * @example
 *
 */
export declare class All extends SelectorObject {
    static selector: Function;
    get(p: string): unknown[];
    set(p: string, ...values: Element[]): boolean;
    delete(p: string): boolean;
}
/**
 * The same as `element.querySelector`
 *
 * @param element
 * @param selector
 * @returns
 */
export declare function selectFirst(element: Element, selector: string): Element;
/**
 * The same as `element.querySelectorAll`
 *
 * @param element
 * @param selector
 * @returns
 */
export declare function selectAll(element: Element, selector: string): NodeListOf<Element>;
export {};
