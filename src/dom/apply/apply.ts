/**
 * Exports {@link apply} used to apply functions to elements selected with 
 * a getter from an element tree.
 * 
 * 
 * @module
 */

import { apply as baseApply, IActions } from "../../object/apply/apply.js";
import { mapValues } from "../../object/operations/operations.js";
import { IKey } from "../../types.js";
import { IComponent } from "../components/components.js";

export type IApplyComponents<T> = {
    [key in keyof T]: IComponent | IApplyComponents<T[key]>
}

export interface IApplyOptions {
    args?: any[];
    getter?: typeof defaultGetter;
    mapper?: <T, U extends keyof T>(getter: typeof defaultGetter) => (comps: T, key: U) => IApplyComponents<T[U]>;
}

export interface ISelector {
    (element: Element | DocumentFragment, selectors: string): (Element | Iterable<Element>)
}

export const selectAll = (element: Element | DocumentFragment, selectors: string) => element.querySelectorAll(selectors);
export const selectFirst = (element: Element | DocumentFragment, selectors: string) => element.querySelector(selectors);

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
 * @example
 * 
 * 
 * @param target 
 * @param key 
 * @param selector 
 * @returns 
 */
export function get(target: Element | DocumentFragment, key: IKey, selector: ISelector = selectFirst): Element | Iterable<Element> {
    if (typeof key === 'number') {
        if (key < 0) key = target.children.length + key;
        return target.children[key];
    } else if (typeof key === 'string') {
        return selector(target, key);
    }
}
function getter(selector?: ISelector) {
    return (target: Element | DocumentFragment, key: IKey) => get(target, key, selector);
}
export const defaultGetter = getter();

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
 *     main: (main) => {
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
export function apply<T>(components: T, target?: Element | DocumentFragment, options?: IApplyOptions) {
    if (!target) target = document.body;
    const getter = options?.getter || defaultGetter;
    const mappedComponents = mapValues(components, (options?.mapper || applyMapper)(getter));
    return baseApply(mappedComponents as IActions, target, { args: options?.args, getter: getter });
}

/**
 * Similar to {@link apply} but uses {@link selectAll} (instead of 
 * the default {@link selectFirst}) to match elements.
 * 
 * import { applyAll } from 'deleight/dom/apply';
 * import { map, range, forEach, zip } from 'deleight/generators';
 * apply({
 *     applyAll: ([main]) => {
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
export function applyAll<T>(components: T, target?: Element | DocumentFragment, options?: IApplyOptions) {
    if (!options) options = {};
    options.getter = getter(selectAll);
    return apply(components, target, options);
}

function applyFunction<T>(components: IApplyComponents<T>, getter: typeof defaultGetter) {
    const innerApplyFunction = (elements: Element | DocumentFragment | Iterable<Element>, key: IKey, ...args: any[]) => {
        const component = components[key];
        if (typeof elements === 'object' && Reflect.has(elements, Symbol.iterator)) {
            let result: any;
            for (let element of elements as Iterable<Element>) {
                result = component(getter(element, key), key);
                if (result !== undefined) {
                    innerApplyFunction(result, key, ...args); 
                }
            }
        } else if (elements instanceof Element || elements instanceof DocumentFragment) {
            return component(getter(elements as (Element | DocumentFragment), key), key);
        }
    }
    return innerApplyFunction;
}
function applyMapper<T, U extends keyof T>(getter: typeof defaultGetter) {
    const innerMapper = (comps: IApplyComponents<T>, key: U) => {
        let comp: any = comps[key];
        return (comp instanceof Function)? applyFunction(comps, getter): mapValues(comp, innerMapper);
    };
    return innerMapper;
}
