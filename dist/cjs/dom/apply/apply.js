"use strict";
/**
 * Exports {@link apply} used to apply functions to elements selected with
 * a getter from an element tree.
 *
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apply = exports.defaultGetter = exports.get = exports.selectFirst = exports.selectAll = void 0;
const apply_js_1 = require("../../object/apply/apply.js");
const operations_js_1 = require("../../object/operations/operations.js");
const selectAll = (element, selectors) => element.querySelectorAll(selectors);
exports.selectAll = selectAll;
const selectFirst = (element, selectors) => element.querySelector(selectors);
exports.selectFirst = selectFirst;
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
function get(target, key, selector = exports.selectAll) {
    if (typeof key === 'number') {
        if (key < 0)
            key = target.children.length + key;
        return [target.children[key]];
    }
    else if (typeof key === 'string') {
        const result = selector(target, key);
        if (Reflect.has(result, Symbol.iterator))
            return result;
        else if (result instanceof Element)
            return [result];
        else
            return [];
    }
    else
        return [];
}
exports.get = get;
function getter(selector) {
    return (target, key) => get(target, key, selector);
}
exports.defaultGetter = getter();
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
function apply(components, target, options) {
    if (!target)
        target = document.body;
    const getter = options?.getter || exports.defaultGetter;
    const mappedComponents = (0, operations_js_1.mapValues)(components, (options?.mapper || applyMapper)(getter));
    return (0, apply_js_1.apply)(mappedComponents, target, { args: options?.args, getter: getter });
}
exports.apply = apply;
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
        return (comp instanceof Function) ? applyFunction(comps, getter) : (0, operations_js_1.mapValues)(comp, innerMapper);
    };
    return innerMapper;
}
