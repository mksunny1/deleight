'use strict';

/**
 * This module exports the `apply` function for selecting and operating on DOM elements. It also exports
 * new selector functions,
 */
/**
 * Functions similarly to querySelectorAll, but for selecting style rules in
 * a CSS stylesheet object. All rules that start with any of the selectors are
 * selected.
 * @example
 * import { ruleSelectorAll } from 'deleight/appliance';
 * const firstSpanRule = ruleSelectorAll('span', document.getElementsByTagName('style')[0], true)[0];
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @param {boolean} [firstOnly]
 * @returns {Array<CSSRule>}
 */
function ruleSelectorAll(selectors, styleElement, firstOnly) {
    const arrSelectors = selectors.split(",").map((item) => item.trim());
    const result = [];
    let selector;
    for (let rule of Array.from(styleElement.sheet?.cssRules || [])) {
        for (selector of arrSelectors) {
            if (rule.cssText.startsWith(selector)) {
                result.push(rule);
                if (firstOnly)
                    return result;
            }
        }
    }
    return result;
}
/**
 * Similar to querySelector in the same way ruleSelectorAll is similar to
 * querySelectorAll.
 * @example
 * import { ruleSelector } from 'deleight/appliance';
 * const firstSpanRule = ruleSelector('span', document.getElementsByTagName('style')[0])
 *
 *
 * @param {string} selectors
 * @param {HTMLStyleElement} styleElement
 * @returns {CSSRule}
 */
function ruleSelector(selectors, styleElement) {
    return ruleSelectorAll(selectors, styleElement, true)[0];
}
/**
 * Return the first ancestor that matches the selector.
 * @example
 * import { parentSelector } from 'deleight/appliance';
 * const removeListener = (e) => {
 *     table.removeChild(component.beforeRemove(parentSelector(e.target, 'tr')));
 * };
 *
 * @param {Node} node
 * @param {string} selector
 * @returns {Element}
 */
function parentSelector(node, selector) {
    let parent = node.parentElement;
    while (parent && !parent.matches(selector))
        parent = parent.parentElement;
    return parent;
}
/**
 * Select the elements matching the keys in applyMap and run the functions given by the values over them.
 * This eliminates the many calls to querySelectorAll, which is quite verbose.
 *
 * Without the third argument (asComponents), all selected elements are
 * passed to the functions at once. With the argument given as a truthy value,
 * the elements are passed one by one, so that the behavior is almost like that
 * of web components.
 * @example
 * import { apply } from 'deleight/appliance';
 * apply({
 *     main: main => {
 *         const newContent = [...range(101, 120)].map(i => `My index is  now ${i}`);
 *         const lastChildren = Array.from(main.children).map(c => c.lastElementChild);
 *         set(lastChildren,  {textContent: newContent});
 *     }
 * });
 *
 * @param {IApplyMap } applyMap
 * @param {HTMLElement} [containerElement]
 * @param {boolean|number} [asComponent]
 * @param {boolean|number} [firstOnly]
 */
function apply(applyMap, containerElement, asComponent, firstOnly) {
    if (!containerElement)
        containerElement = document.body;
    let selectorAll;
    if (!firstOnly) {
        selectorAll =
            containerElement instanceof HTMLStyleElement
                ? (selectors) => ruleSelectorAll(selectors, containerElement)
                : containerElement.querySelectorAll.bind(containerElement);
    }
    else {
        selectorAll =
            containerElement instanceof HTMLStyleElement
                ? (selectors) => ruleSelector(selectors, containerElement)
                : containerElement.querySelector.bind(containerElement);
    }
    for (let [selectors, functions] of Object.entries(applyMap)) {
        applyTo(selectorAll(selectors), functions, asComponent);
    }
}
/**
 * Applies the given functions to the specified elements (or CSS rules).
 *
 * asComponent specifies whether the functions should be applied to each
 * element. If falsy/not specified, all the elements are passed to the functions
 * at once.
 * @example
 * import { applyTo } from 'deleight/appliance';
 * applyTo(Array.from(document.body.children), (...bodyChildren) => console.log(bodyChildren.length));
 *
 * @param {(Element|CSSRule)[]} elements
 * @param {Function|Function[]} functions
 * @param {boolean|undefined} [asComponent]
 */
function applyTo(elements, functions, asComponent) {
    let element, fn;
    if (elements instanceof Element || elements instanceof CSSRule)
        elements = [elements];
    if (!(functions instanceof Array))
        functions = [functions];
    if (asComponent)
        for (element of elements)
            for (fn of functions)
                fn(element);
    else
        for (fn of functions)
            fn(...elements);
}

exports.apply = apply;
exports.applyTo = applyTo;
exports.parentSelector = parentSelector;
exports.ruleSelector = ruleSelector;
exports.ruleSelectorAll = ruleSelectorAll;
