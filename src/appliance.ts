/**
 * This module exports the `apply` function for selecting and operating on DOM elements. It also exports 
 * new selector functions,
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
export interface ApplyMap {
  [key: string]: Function | Function[];
}

/**
 * Functions similarly to querySelectorAll, but for selecting style rules in
 * a CSS stylesheet object. All rules that start with any of the selectors are
 * selected.
 * @example
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
 * Select the elements matching the keys in applyMap and run the functions given by the values over them.
 * This eliminates the many calls to querySelectorAll, which is quite verbose.
 *
 * Without the third argument (asComponents), all selected elements are
 * passed to the functions at once. With the argument given as a truthy value,
 * the elements are passed one by one, so that the behavior is almost like that
 * of web components.
 * @example
 * apply({
 *     main: main => {
 *         const newContent = [...range(101, 120)].map(i => `My index is  now ${i}`);
 *         const lastChildren = Array.from(main.children).map(c => c.lastElementChild);
 *         set(lastChildren,  {textContent: newContent});
 *     }
 * });
 *
 * @param {ApplyMap } applyMap
 * @param {HTMLElement} [containerElement]
 * @param {boolean|number} [asComponent]
 * @param {boolean|number} [firstOnly]
 */
export function apply(
  applyMap: ApplyMap,
  containerElement?: Element,
  asComponent?: boolean | number,
  firstOnly?: boolean | number,
) {
  if (!containerElement) containerElement = document.body;
  let selectorAll;
  if (!firstOnly) {
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
 * applyTo(Array.from(document.body.children), (...bodyChildren) => console.log(bodyChildren.length));
 *
 * @param {(Element|CSSRule)[]} elements
 * @param {Function|Function[]} functions
 * @param {boolean|undefined} [asComponent]
 */
export function applyTo(
  elements: (Element | CSSRule)[] | (Element | CSSRule),
  functions: Function | Function[],
  asComponent?: boolean | number | undefined,
) {
  let element: Element | CSSRule, fn: Function;
  if (elements instanceof Element || elements instanceof CSSRule)
    elements = [elements];
  if (!(functions instanceof Array)) functions = [functions];
  if (asComponent) for (element of elements) for (fn of functions) fn(element);
  else for (fn of functions) fn(...elements);
}
