/**
 * Exports {@link apply} used to apply functions to elements selected with
 * a getter from an element tree.
 *
 *
 * @module
 */
import { apply as baseApply } from "../../object/apply/apply.js";
import { mapValues } from "../../object/operations/operations.js";
export const selectAll = (element, selectors) => element.querySelectorAll(selectors);
export const selectFirst = (element, selectors) => element.querySelector(selectors);
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
export function get(target, key, selector = selectFirst) {
    if (typeof key === 'number') {
        if (key < 0)
            key = target.children.length + key;
        return target.children[key];
    }
    else if (typeof key === 'string') {
        return selector(target, key);
    }
}
function getter(selector) {
    return (target, key) => get(target, key, selector);
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
export function apply(components, target, options) {
    if (!target)
        target = document.body;
    const getter = options?.getter || defaultGetter;
    const mappedComponents = mapValues(components, (options?.mapper || applyMapper)(getter));
    return baseApply(mappedComponents, target, { args: options?.args, getter: getter });
}
/**
 * Similar to {@link apply} but uses {@link selectAll} (instead of
 * the default {@link selectFirst}) to match elements.
 *
 * @example
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
export function applyAll(components, target, options) {
    if (!options)
        options = {};
    options.getter = getter(selectAll);
    return apply(components, target, options);
}
function applyFunction(components, getter) {
    const innerApplyFunction = (elements, key, ...args) => {
        const component = components[key];
        if (typeof elements === 'object' && Reflect.has(elements, Symbol.iterator)) {
            let result;
            for (let element of elements) {
                result = component(getter(element, key), key);
                if (result !== undefined) {
                    innerApplyFunction(result, key, ...args);
                }
            }
        }
        else if (elements instanceof Element || elements instanceof DocumentFragment) {
            return component(getter(elements, key), key);
        }
    };
    return innerApplyFunction;
}
function applyMapper(getter) {
    const innerMapper = (comps, key) => {
        let comp = comps[key];
        return (comp instanceof Function) ? applyFunction(comps, getter) : mapValues(comp, innerMapper);
    };
    return innerMapper;
}
