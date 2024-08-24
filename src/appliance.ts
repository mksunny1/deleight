/**
 * This module exports the {@link apply}, {@link applyTo}, {@link parentSelector} {@link ruleSelector}, 
 * {@link ruleSelectorAll} and {@link querySelectors} for succinctly selecting and operating on DOM elements and CSSOM rules. 
 * 
 * @module
 */

/**
 * An object mapping string keys to values of type function or function[].
 * When used as the `applySec` in a call to `apply`, the keys are used as
 * selectors in calls to `element.querySelectorAll` (or
 * `ruleSelectorAll` if the element is an instance of HTMLStyleElement).
 * The functions will be mathced against the selected elements (or CSS rules)
 * at the same index.
 *
 * @example
 * myApplyMap = {
 *     span: (...spans) => doSomethingWith(spans);
 *     .btn: (...classedButtons) => doAnotherThingWith(classedButtons)
 * }
 */
export interface IApplyMap { [key: string | number]: IComponents; }

/**
 * A function, IApplyMap or an array of function and/or IRapplyMaps.
 */
export type IComponents = Function | IApplyMap | (Function | IApplyMap)[];

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
export function ruleSelectorAll(
    selectors: string,
    styleElement: HTMLStyleElement,
    firstOnly?: boolean,
): Array<CSSRule> {
    const arrSelectors = selectors.split(",").map((item) => item.trim());
    const result: any[] = [];
    let selector: string;
    for (let rule of Array.from(styleElement.sheet?.cssRules || [])) {
        for (selector of arrSelectors) {
            if (rule.cssText.startsWith(selector)) {
                result.push(rule);
                if (firstOnly) return result;
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
export function ruleSelector(
    selectors: string,
    styleElement: HTMLStyleElement,
): CSSRule {
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
export function parentSelector(node: Node, selector: string): Element | null {
    let parent = node.parentElement;
    while (parent && !parent.matches(selector)) parent = parent.parentElement;
    return parent;
}

/**
 * Selects the first elements corresponding to each of the selector args.
 * This calls qcontainingElement.uerySelector on each of the selectors, 
 * so that only first elements are selected. It is different from 
 * querySelectorAll which will select *all* elements.
 * 
 * The containing element defaults to document.body.
 * 
 * @example
 * import { select } from 'deleight/appliance'
 * const [firstDiv, firstP, firstSpan] = select('div, p, span');
 * 
 * 
 * @param { string[] } selectors 
 * @param { Element } [containingElement]
 * 
 */
export function querySelectors(selectors: string[] | string, containingElement?: Element) {
    if (!containingElement) containingElement = document.body;
    if (typeof selectors === 'string') selectors = selectors.split(',');
    return selectors.map(s => containingElement.querySelector(s.trim()));
}

/**
 * Select the elements matching the keys in applyMap and run the functions given by the values over them.
 * This eliminates the many calls to querySelectorAll, which is quite verbose. 
 * 
 * If a key is a number instead of 
 * a string, the child element at the index is selected instead. Negative indices can also be used to count from 
 * the end backwards.
 * 
 * If a value in `applyMap` is an object but not an array, apply is called recursively on all selected 
 * elements for it with the object used as the applyMap. 
 *
 * Without the third argument (`atomic`), all selected elements are
 * passed to the functions at once. With the argument given as a truthy value,
 * the elements are passed one by one, so that the behavior is almost like that
 * of web components.
 * 
 * A 4th argument (`selectFirst`) may also be specified to limit each selection to only the first matching 
 * elements. In this case (and in all cases where there is only 1 match), the value of `atomic` will be irrelevant.
 * 
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
 * @param {boolean|number} [atomic]
 * @param {boolean|number} [selectFirst]
 */
export function apply(
    applyMap: IApplyMap,
    containerElement?: Element,
    atomic?: boolean | number,
    selectFirst?: boolean | number
) {
    if (!containerElement) containerElement = document.body;
    let selectorAll;
    if (!selectFirst) {
        selectorAll =
            containerElement instanceof HTMLStyleElement
                ? (selectors: string) => ruleSelectorAll(selectors, containerElement)
                : containerElement.querySelectorAll.bind(containerElement);
    } else {
        selectorAll =
            containerElement instanceof HTMLStyleElement
                ? (selectors: string) => ruleSelector(selectors, containerElement)
                : containerElement.querySelector.bind(containerElement);
    }
    const children = containerElement instanceof HTMLStyleElement? containerElement.sheet?.cssRules: containerElement.children;
    let index: number;
    for (let [selectors, functions] of Object.entries(applyMap)) {
        index = parseInt(selectors);
        if (isNaN(index)) applyTo(selectorAll(selectors), functions, atomic);
        else applyTo(children[index >= 0? index: children.length + index], functions, atomic);
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
 * @param {IComponents} components
 * @param {boolean|undefined} [atomic]
 */
export function applyTo(
    elements: (Element | CSSRule)[] | (Element | CSSRule),
    components: IComponents,
    atomic?: boolean | number | undefined,
    selectFirst?: boolean | number
) {
    let element: Element | CSSRule, comp: Function | IApplyMap;
    if (elements instanceof Element || elements instanceof CSSRule)
        elements = [elements];

    if (!(components instanceof Array)) components = [components];

    for (comp of (components as Function[])) {
        if (comp instanceof Function) {
            if (atomic) for (element of elements) comp(element);
            else comp(...elements);
        } else {
            for (element of elements) apply(comp, element as Element, atomic, selectFirst);
        }
    }
    
}
