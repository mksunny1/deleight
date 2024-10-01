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
import { IKey } from "../../types.js";
export interface IComponent {
    (elements: Iterable<Element>, matcher: IKey | Attr, ...args: any[]): any;
}
/**
 * Creates a function to be called with listener functions to return `apply
 * @param event
 * @param options
 * @returns
 */
export declare function listener(event: keyof HTMLElementEventMap, options?: AddEventListenerOptions): (listener: EventListener) => (elements: Iterable<Element>, key: IKey) => void;
export declare function setter(prop: keyof Element): (value: any) => (elements: Iterable<Element>, key: IKey) => void;
export declare function assigner(value: object): (elements: Iterable<Element>, key: IKey) => void;
export declare function attrSetter(name: string): (value: any) => (elements: Iterable<Element>, key: IKey) => void;
