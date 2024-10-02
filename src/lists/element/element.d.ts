/**
 * An object which represents the `children` of an element as a list.
 * A list has a an array-like mutation API with a few extra methods.
 *
 * @example
 * import { ArrayList } from 'deleight/lists/array';
 * import { ElementList } from 'deleight/lists/element';
 * const array = [], tbody = document.querySelector('tbody');
 * const TBodyElementList = class extends ElementList {
 *     render(item) {
 *         const el = document.createElement('p');
 *         el.textContent = item;
 *     }
 * }, lists = [new ArrayList(array), new TBodyElementList(tbody)];
 * for (let list of lists) list.push(1, 2, 3, 4, 5);
 */
export declare class ElementList {
    element: Element;
    count: number;
    constructor(element: Element, count?: number);
    get length(): number;
    get(index: number): Generator<Element, void, unknown>;
    set(index: number, value: any): any;
    render(item: any): Element;
    push(...items: any[]): number;
    pop(): Element[];
    unshift(...items: any[]): number;
    shift(): Element[];
    splice(start: number, deleteCount?: number, ...items: any[]): Element[];
    swap(from: number, to: number): void;
    move(from: number, to: number): void;
    clear(): void;
    [Symbol.iterator](): Generator<Element, void, unknown>;
}
/**
 * Please note that results are flat, so the number of items
 * returned by an element list with a count of 2 during iteration will
 * be double that returned by, say, an array with the same 'length'. The
 * same thing applies for {@link ElementList#splice}.
 */
