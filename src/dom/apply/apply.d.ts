/**
 * Exports {@link apply} used to apply functions to elements selected with
 * a getter from an element tree.
 *
 *
 * @module
 */
import { IKey } from "../../types.js";
import { IComponent } from "../components/components.js";
export type IApplyComponents<T> = {
    [key in keyof T]: IComponent | IApplyComponents<T[key]>;
};
export interface IApplyOptions {
    args?: any[];
    getter?: typeof defaultGetter;
    mapper?: <T, U extends keyof T>(getter: typeof defaultGetter) => (comps: T, key: U) => IApplyComponents<T[U]>;
}
export interface ISelector {
    (element: Element | DocumentFragment, selectors: string): (Element | Iterable<Element>);
}
export declare const selectAll: (element: Element | DocumentFragment, selectors: string) => NodeListOf<Element>;
export declare const selectFirst: (element: Element | DocumentFragment, selectors: string) => Element;
/**
 * Get the element pointed to by the key from the target. The value
 * returned is determined as follows:
 *
 * 1. If the key is a number then the value is the child element
 * of the target at that index.
 *
 * 2. If the key is a string, the given selector (or `querySelectorAll` fallback)
 * is used to retrieve the value(s).
 *
 * 3. Whatever is obtained from either 1 or 2 is coerced into an `Interable<Element>`
 * (if it was no already one) to ensure consistency of the result type.
 *
 * @example
 *
 *
 * @param target
 * @param key
 * @param selector
 * @returns
 */
export declare function get(target: Element | DocumentFragment, key: IKey, selector?: ISelector): Iterable<Element>;
export declare const defaultGetter: (target: Element | DocumentFragment, key: IKey) => Iterable<Element>;
/**
 * Invoke functions with elements within the input element's tree that
 * match the provided selection criteria. {@link baseApply} is used
 * under the hood so the notes about the behavior of that function also
 * apply here.
 *
 * For this function, the target is an element or document fragment. This
 * function uses {@link get} to obtain the 'properties' of the target
 * (by supplying a `getter` option to the underlying function ). This function
 * also pre-fetches the target's property (also using {@link get}) before
 * invoking the component functions by using a mapper option.
 *
 * @example
 * import { apply } from 'deleight/dom/apply';
 * import { map, range, forEach, zip } from 'deleight/generators';
 * apply({
 *     main: ([main]) => {
 *         const newContent = map(range(101, 120), i => `My index is  now ${i}`);
 *         const lastChildren = map(main.children, c => c.lastElementChild);
 *         forEach(zip(lastChildren, newContent), ([el, c]) => el.textContent = c);
 *         // set(lastChildren,  {textContent: newContent});
 *     }
 * });
 *
 * @param components
 * @param target
 * @param options
 * @returns
 */
export declare function apply<T>(components: T, target?: Element | DocumentFragment, options?: IApplyOptions): Element | DocumentFragment;
