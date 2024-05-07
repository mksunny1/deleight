/**
 * This module has been designed to be a drop-in replacement for extending built-in elements. It is supposed to be
 * 1. More widely supported. Safari does not support 'is' attribute.
 * 2. More concise and flexible. You can register and unregister components and you can attach multiple components to the same element..
 * 3. Easier to pass down props in markup without creating ugly markup.
 *
 * The attributes here name the components and the values
 * are the names of props to pass to them along with the element.
 *
 * @example
 * import { Actribute } from 'deleight/actribute';
 * // initialize:
 * const fallbackProps = {
 *    prop1: 'Fallback', prop4: 'Last resort',
 *    sig: '$2b$20$o7DWuroOjbA/4LDWIstjueW9Hi6unv4fI0xAit7UQfLw/PI8iPl1y'
 * };
 * const act = new Actribute(fallbackProps);
 *
 * // register components:
 * act.register('comp1', (node, prop1) => node.textContent = prop1);
 * act.register('comp2', (node, prop2) => node.style.left = prop2);
 *
 * // use in markup:
 * // &lt;section c-comp1="prop1"  c-comp2="prop2" &gt;
 * //       First section
 * // &lt;/section&gt;
 *
 * / process components:
 * act.process(document.body, {prop2: 1, prop3: 2});
 *
 * // unregister a component:
 * delete act.registry.comp2;
 */
/**
 * An Actribute class. Similar to a custom elements registry 'class'.
 */
declare class Actribute {
    /**
     * The object that holds all registered components. The keys are the
     * component names and the values are the component functions.
     */
    registry: {
        [key: string | number]: Function;
    };
    /**
     * This object holds any fallback props which can be referenced
     * in the markup, in the values of component attributes. Property names
     * can be referenced similarly to CSS classes.
     */
    props: any;
    /**
     * This is the attribute prefix that denotes component specifiers in
     * markup. A component specifier is an attribute where the name (after
     * the prefix) refers to a component name (in the registery) and the
     * optional value is a space-separated list of property names.
     */
    attrPrefix: string;
    /**
     * Construct a new Actribute instance with the fallback props and
     * attribute prefix.
     *
     * It is similar to a Custom Element registry. When used to process
     * markup, attributes with names starting with `attrPrefix` are treated
     * as component specifiers.
     *
     * A component specifier is of the form [attrPrefix][componentName]="[propertyName] [propertyName] ..."
     *
     * When a component specifier is encountered, the component's function will be
     * invoked with the element and any specified properties as arguments.
     *
     * The attribute can be string (where at least 1 property name is specified),
     * or boolean (where no property is specified).
     *
     * The props object passed to this initializer behaves like a global
     * from which component props may be obtained if they are not found in
     * the props object passed to the `process` method.
     *
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     *
     * @param {any} props The value to assign to the props member.
     * @param {string} attrPrefix The value to assign to attrPrefix. Defaults to 'c-'
     * @constructor
     */
    constructor(props: any, attrPrefix: string);
    /**
     * Registers a function as a component bearing the given name.
     * The component can be referenced in processed markup using
     * the name.
     *
     * Returns the same actribute to support chaining.
     *
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     * act.register('comp1', (node, prop1) => node.textContent = prop1);
     * act.register('comp2', (node, prop2) => node.style.left = prop2);
     *
     * @param {string} name The component name
     * @param {Function} component The component function
     * @returns {Actribute}
     */
    register(name: string, component: Function): Actribute;
    /**
     * Recursively processes the node to identify and apply components.
     *
     * At elements where any components are encountered, the components
     * are called with the element and any specified props. The decendants
     * are not processed.
     *
     * At elements without a component, the descendants are processed
     * recursively.
     *
     * Returns the same actribute to support call chaining.
     *
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     * act.register('comp1', (node, prop1) => node.textContent = prop1);
     * act.register('comp2', (node, prop2) => node.style.left = prop2);
     * act.process(document.body, {prop2: 1, prop3: 2});
     *
     * @param {HTMLElement} element
     * @param {any} [props]
     * @param {string} [propSep]
     * @returns {Actribute}
     */
    process(element: Element, props?: any, propSep?: string): Actribute;
}

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
interface IApplyMap {
    [key: string]: Function | Function[];
}
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
declare function ruleSelectorAll(selectors: string, styleElement: HTMLStyleElement, firstOnly?: boolean): Array<CSSRule>;
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
declare function ruleSelector(selectors: string, styleElement: HTMLStyleElement): CSSRule;
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
declare function parentSelector(node: Node, selector: string): Element | null;
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
declare function apply(applyMap: IApplyMap, containerElement?: Element, asComponent?: boolean | number, firstOnly?: boolean | number): void;
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
declare function applyTo(elements: (Element | CSSRule)[] | (Element | CSSRule), functions: Function | Function[], asComponent?: boolean | number | undefined): void;

/**
 * This module exports primitives for building DOM from text.
 */
/**
 * A template tag that will resolve only after all
 * interpolated promises have been resolved, finally returning the
 * intended string.
 *
 * @example
 * import { tag } from 'deleight/apriori';
 * const t = tag`I will wait for this ${Promise.resolve("promise")}!!!`
 * // t === 'I will wait for this promise!!!'
 *
 * @param {Array<string>} strings
 * @param  {...any} expressions
 * @returns {Promise<string>}
 */
declare function tag(strings: Array<string>, ...expressions: any[]): Promise<string>;
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function
 * which can be called multiple times to 'render' the template with the given arguments.
 *
 * @example
 * import { template } from 'deleight/apriori';
 * const t = template('I will render this ${"guy"} immediately!!!')();
 * // t === 'I will render this guy immediately!!!'
 *
 * @param {string} templateStr the template string
 * @param {string[]} argNames tThe names of the parameters of the returned function (which can be 'seen' inside the template string)
 * @returns {(...any): string}
 */
declare function template(templateStr: string, argNames?: string[]): (...args: any[]) => string;
/**
 * Similar to template but the built template is also 'promise-aware' and will allow them to resolve to string values
 * before interpolating them.
 *
 * @example
 * import { asyncTemplate } from 'deleight/apriori';
 * const t = await asyncTemplate('I will wait for this ${Promise.resolve("promise")}!!!')();
 * // t === 'I will wait for this promise!!!'
 *
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames The names of the parameters of the returned function (which can be 'seen' inside the template string)
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {(...any): Promise<string>}
 */
declare function asyncTemplate(templateStr: string, argNames: Array<string>, tagName: string): (...any: any[]) => Promise<string>;
/**
 * The return value of a call to arrayTemplate.
 */
interface ITemplates {
    (arr: Iterable<any>, ...args: any[]): Iterable<string>;
}
/**
 * The return value of a call to asyncArrayTemplate.
 */
interface IAsyncTemplates {
    (arr: Iterable<any>, ...args: any[]): Iterable<Promise<string>>;
}
/**
 * Similar to template, but will render an iterable (such as array) of items together instead
 * of rendering each item individually. It improves efficiency in these scenarios because only 1 rendering
 * function is called.
 *
 * @example
 * import { templates } from 'deleight/apriori';
 * const t = arrayTemplate('I will render this ${it}/${other} immediately!!!', ['other'], 'it')([1, 2, 3, 4, 5], '(shared)').join(' & ');
 * // t === 'I will render this 1/(shared) immediately!!! & I will render this 2/(shared) immediately!!! & I will render this 3/(shared) immediately!!! & I will render this 4/(shared) immediately!!! & I will render this 5/(shared) immediately!!!'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (after the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * Defaults to the empty string.
 * @returns {ITemplates}
 */
declare function templates(templateStr: string, argNames: Array<string>, itemName: string): ITemplates;
/**
 * Async equivalent of arrayTemplate. The async template tag ('T' by default)
 * is applied to the template string. Use this when there are promises
 * among the arguents that will be passed to the returned function.
 *
 * @example
 * import { asyncTemplates } from 'deleight/apriori';
 * let t = asyncTemplates('I will async render this ${item}')([1, 2, 3, 4, 5].map(i => Promise.resolve(i)));
 * console.log(t instanceof Promise);   // true
 * t = (await t).join(' ')
 * // t === 'I will async render this 1 I will async render this 2 I will async render this 3 I will async render this 4 I will async render this 5'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (after the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {IAsyncTemplates}
 */
declare function asyncTemplates(templateStr: string, argNames: Array<string>, itemName: string, tagName: string): IAsyncTemplates;
/**
 * Fetches text (typically markup) from the url. This is only a shorthand
 * for using `fetch`.
 *
 * @example
 * import { get } from 'deleight/apriori';
 * const markup = await get('./something.html')
 *
 *
 * @param {string} url  The url to pass to `fetch`
 * @param {boolean} [suppressErrors] Whether to return the empty string if an error occurs.
 * @param {RequestInit} [init]  The `init` argument for `fetch`
 * @returns {Promise<string>}
 */
declare function get(url: string, suppressErrors?: boolean, init?: RequestInit): Promise<string>;
/**
 * Shorthand for creating a DocumentFragment from markup. If the
 * fragment has only one child, the child is returned instead.
 * So this is also a shorthand for creating single elements.
 *
 * @example
 * import { createFragment } from 'deleight/apriori';
 * const frag1 = createFragment(`
 *    <p>Para 1</p>
 *    <p>Para 2</p>
 *`)
 * // <p>Para 1</p><p>Para 2</p>
 *
 * @param {string} markup The `outerHTML` of what to create
 * @returns {Node}
 */
declare const createFragment: (markup: string) => DocumentFragment | Element;
/**
 * A generator for elements with the specified tag names.
 * The names are space-separated just like in a class attribute.
 * You can also separate with commma if you prefer.
 *
 * @example
 * import { elements } from 'deleight/apriori';
 * const [div, p, span] = elements('div p span');
 * const [div2, p2, span2] = elements('div, p, span');
 *
 * @param {string} tagNames
 */
declare function elements(tagNames: string): Generator<HTMLElement, void, unknown>;

/**
 * This module exports primitives for 'bulk' manipulating the DOM.
 */
/**
 * A function used to insert a new node using a target node.
 *
 * @example
 * myInserter = (node, target) => target.append(node);
 */
interface IInserter {
    (node: Node, target: Node): void;
}
/**
 * Insert the values using the elements as target. The way they are inserted
 * depend on the inserter. If not provided, the default inserter will append the values
 * to the corresponding elements.
 *
 * @example
 * // Insert a span into all the children of the first main element:
 * import { insert } from 'deleight/domitory';
 * const span = document.createElement('span');
 * const main = document.querySelector('main');
 * insert(main.children, main.children.map(() => span.cloneNode()))
 *
 *
 * @param {Iterable<Node>} elements The target nodes.
 * @param {Iterable<Node>} values The new nodes to insert.
 * @param {IInserter} [insertWith] The insertion function
 */
declare function insert(elements: Iterable<Node>, values: Iterable<Node>, insertWith?: IInserter): [Iterable<Node>, Iterable<Node>];
/**
 * Default inserters for use with `insert`
 */
declare const inserter: {
    /**
     * Inserts the node before the target using `insertBefore`
     * @param {Node} node
     * @param {Node} target
     */
    before(node: Node, target: Node): void;
    /**
     * Append the node to the target using `appendChild`
     * @param {Node} node
     * @param {Node} target
     */
    append(node: Node, target: Node): void;
};
/**
 * Map of string keys to any[] values. The keys name properties
 * (or attributes when they start with _) and the values are arrays
 * matched against selected or specified elements .
 *
 * As an example, we can target 3 buttons to set their
 * textContents to corresponding values using the following SetOnMap
 * (as the values object in a call to `setOn`):
 * @example
 * {
 *     textContent: ['btn 1', 'btn 2', 'btn 3']
 * },
 */
interface ISetMap {
    [key: string]: Iterable<any>;
}
/**
 * Set specified properties and/or attributes on the specified elements.
 * Please do not pass the same 'generator' multiple times in values. First
 * convert them to arrays.
 *
 * @example
 * // Shuffle the class attributes of all the children of the first main element:
 * import { set } from 'deleight/domitory';
 * import { uItems } from 'deleight/generational';
 * const main = document.querySelector('main');
 * const values = uItems(main.children.map(c => c.className));
 * set(main.children, {_class: values});
 *
 * @param {(Element|CSSStyleRule)[]} elements
 * @param {ISetMap} values
 */
declare function set(elements: Iterable<Element | CSSStyleRule>, values: ISetMap): [Iterable<Element | CSSStyleRule>, ISetMap];
/**
 * Correctly replace the specified nodes with corresponding values.
 *
 * This will materialize `elements` and `values` unless `lazy`
 * is supplied and its value is truthy.
 *
 * @example
 * // Safely shuffle all the children of the first main element:
 * import { update } from 'deleight/domitory';
 * import { uItems } from 'deleight/generational';
 * const main = document.querySelector('main');
 * update(main.children, uItems(main.children))
 *
 * @param {Iterable<Node>} elements The nodes to replace.
 * @param {Iterable<Node>} values The replacement nodes.
 * @param { boolean } [lazy]
 */
declare function update(elements: Iterable<Node>, values: Iterable<Node>, lazy?: boolean): [Iterable<Node>, Iterable<Node>];
/**
 * Remove the elements from their parent nodes.
 *
 * This will materialize `elements` unless `lazy`
 * is supplied and its value is truthy.
 *
 * @example
 * import { update } from 'deleight/domitory';
 * const main = document.querySelector('main');
 * remoove(main.children);
 *
 * @param {Iterable<Node>} elements
 * @param { boolean } [lazy]
 */
declare function remove(elements: Iterable<Node>, lazy?: boolean): Iterable<Node>;

/**
 * This module exports event handling helpers.
 */
/**
 * Base class for EventListener and MatchListener. This can be used to
 * wrap any listeners which will be shared by many elements. Call the
 * `listen` or `remove` method to add or remove the listener to/from
 * the given elements.
 *
 * @example
 * import { Listener } from 'deleight/eventivity';
 * listener = new Listener(() => login(input.value));
 * listener.listen('keyup', [window.input1, window.input2])
 *
 */
declare class Listener {
    listener: EventListenerOrEventListenerObject;
    constructor(listener: EventListenerOrEventListenerObject);
    listen(eventName: string, elements: EventTarget[], options?: boolean | AddEventListenerOptions): void;
    remove(eventName: string, ...elements: EventTarget[]): void;
}
/**
 * Object mapping element matching strings to event handler functions.
 * The matching strings (keys) are used to match event targets to trigger
 * the invocation of their associated handler functions.
 *
 */
interface IMatcher {
    [key: string]: Function | Function[];
}
/**
 * Composes a listener function from the functions in ops. ops may be
 * a single function or an array of functions.
 *
 * The functions are called in the same order when handling events. They
 * will receive as erguments the event object and a run context.
 *
 * The run context can be passed as the second argument to this function
 * (or it will default to the global runContext). The context can be used
 * for communication and it also maintains a running property which will
 * ensure that no 2 handlers using it will run concurrently (providing the
 * API is respected).
 *
 * The API is as follows:
 * If a handler function returns a promise, it is assumed to still be running
 * until the promise resolves or rejects. Neither the handler nor any other
 * handlers using the same run context can start until it stops running.
 *
 * Individual op functions can also terminate event handling by returning the
 * END symbol.
 *
 * @example
 * import { eventListener } from 'deleight/eventivity';
 * input.onkeyup = eventListener([onEnter, () => login(input.value), preventDefault]);
 * apply({
 *     '#loginButton': button => {
 *         button.onclick = eventListener(() => login(input.value));
 *     }
 * }, form);
 *
 *
 * @param {Function[] | Function} ops The function or functions making up the handler
 * @param {any} [runContext] The optional run context.
 * @returns
 */
declare function eventListener(ops: Function[] | Function, runContext?: any): (e: any) => any;
/**
 * Similar to eventListener function but has methods for attaching
 * and removing itself from multiple elements at the same time.
 *
 * This gives the listener a 'personality' and promotes its reuse
 * (good practice).
 *
 * @example
 * import { eventListener } from 'deleight/eventivity';
 * listener = new EventListener([onEnter, () => login(input.value), preventDefault]);
 * listener.listen('keyup', [window.input1, window.input2])
 */
declare class EventListener extends Listener {
    constructor(ops: Function[] | Function, runContext?: any);
}
/**
 * Symbol which will terminate event handling if returned by any of
 * the functions in the ops chain of an event handler created with
 * `eventHandler`.
 *
 * @example
 * import { END } from 'deleight/eventivity';
 * const keyEventBreaker = (e: KeyboardEvent) => (e.key !== key)? END: '';
 */
declare const END: unique symbol;
/**
 * Takes advantage of event bubbling to listen for events on descendant
 * elements to reduce the number of listeners to create.
 *
 * @example
 * import { matchListener } from 'deleight/eventivity';
 * window.mainTable.onclick = matchListener({
 *     'a.lbl': e => select(e.target.parentNode.parentNode),
 *     'span.remove': [removeListener, preventDefault, stopPropagation]
 * }, true);
 *
 * @param {IMatcher} matcher Map of event target matcher to associated handler function
 * @param {boolean} wrapListeners Whether to werap the matcher functions with `eventListener`.
 */
declare function matchListener(matcher: IMatcher, wrapListeners?: boolean): (e: {
    target: IMatchEventTarget;
}) => any;
/**
 * An event target which may have a 'matches' method. This includes most
 * standard HTML elements.
 */
interface IMatchEventTarget extends EventTarget {
    matches?: (arg0: string) => any;
}
/**
 * Similar to matchListener function but has methods for attaching
 * and removing itself from multiple elements at the same time.
 *
 * This gives the listener a 'personality' and promotes its reuse
 * (good practice).
 *
 * @example
 * import { MatchListener } from 'deleight/eventivity';
 * const listener = new MatchListener({
 *     'a.lbl': e => select(e.target.parentNode.parentNode),
 *     'span.remove': [removeListener, preventDefault, stopPropagation]
 * }, true);
 *
 * listener.listen('click', [window.table1, window.table2], eventOptions)
 */
declare class MatchListener extends Listener {
    constructor(matcher: IMatcher, wrapListeners?: boolean);
}
/**
 * Simply calls `stopPropagation` on the event. Useful for creating one-liner
 * event handlers.
 *
 * @example
 * import { eventListener, stopPropagation } from 'deleight/eventivity';
 * window.firstButton.onclick = eventListener([stopPropagation, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 * @param e The event object
 * @returns
 */
declare const stopPropagation: (e: {
    stopPropagation: () => any;
}) => any;
/**
 * Simply calls `preventDefault` on the event. Useful for creating one-liner
 * event handlers.
 *
 * @example
 * import { eventListener, preventDefault } from 'deleight/eventivity';
 * window.firstButton.onclick = eventListener([preventDefault, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 * @param e The event object
 * @returns
 */
declare const preventDefault: (e: {
    preventDefault: () => any;
}) => any;
/**
 * This returns a function which will stop an event handler run (typically for keyup,
 * keydown etc) from continuing if it has not been triggered by the specified key.
 * The returned functions are to be placed before the main handler functions in the `ops`
 * array passed to `eventListener`.
 *
 * @example
 * import { eventListener, onKey } from 'deleight/eventivity';
 * const aKeyGuard = onKey('a');
 * window.firstInput.keyup = eventListener([aKeyGuard, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 * @returns {Function}
 */
declare const onKey: (key: string) => (e: KeyboardEvent) => "" | typeof END;
declare const keys: {
    enter: string;
};
/**
 * This will stop a key(up or down...) event handler run from continuing if
 * it has not been triggered by the enter key.
 *
 * @example
 * import { eventListener, onEnter } from 'deleight/eventivity';
 * window.firstInput.keyup = eventListener([onEnter, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 */
declare const onEnter: (e: KeyboardEvent) => "" | typeof END;

/**
 * This module exports many useful generators like `range` and `repeat`.
 */
/**
 * Forcs any iterable to become an iterator. Will throw
 * if not possible.
 *
 * @example
 * import { iter } from 'deleight/generationsl';
 * const it = iter([1, 2, 3, 4, 5]);
 *
 * @param { any } it
 */
declare function iter(it: any): Iterator<any>;
/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 * import { range } from 'deleight/generationsl';
 * const arr1000 = [...range(0, 1000)];
 * // creates an array with 1000 items counting from 0 to 999.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 */
declare function range(start: number, end?: number, step?: number): Generator<number, void, unknown>;
/**
 * Returns a generator which iterates over the subset of the
 * 'arrayLike' object that matches the provided index.
 *
 * @example
 * import { items, range } from 'deleight/generationsl';
 * const tenth = []...items(range(1000), range(0, 1000, 10))];
 * // selects every 10th item in the array.
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
declare function items(arrayLike: any, index: Iterable<number>): Generator<any, void, unknown>;
/**
 * Returns a generator that yields first argument (what) the number of
 * times specified by the second argument (times).
 *
 * @example
 * import { repeat } from 'deleight/generationsl';
 * const repeated = [...repeat([1, 2, 3], 4)];
 * // [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]
 *
 * @param {Iterable<any>} what
 * @param {number} times
 */
declare function repeat(what: Iterable<any>, times: number): Generator<any, void, unknown>;
/**
 * Returns an iterator over the next 'count' items of the iterator.
 *
 * Note that, for performance reasons, this only accepts an
 * iterator as the 'it' argument. All the other module functions accept
 * iterables.
 *
 * You can convert any iterable to an iterator using the `iter` funtion
 * as shown in the following example.
 *
 * If a firstValue is specified, it will be yielded first.
 *
 * @example
 * import { nextItems, iter } from 'deleight/generationsl';
 * const it = iter([1, 'a', 2, 'b', 3, 'c', 4, 'd']);
 * const [num, let] = next(it, 2);
 *
 * @param {Iterator<any>} it
 * @param {number} count
 * @param { any } [firstValue]
 */
declare function next(it: Iterator<any>, count: number, firstValue?: any): Generator<any, void, unknown>;
/**
 * Returns an iterator of iterators over the next 'count' items of
 * the given iterable
 *
 * @example
 * import { next } from 'deleight/generationsl';
 * const o1 = [1, 2, 3, 4];
 * const o2 = ['a', 'b', 'c', 'd'];
 * const zip = group(flat(o1, o2), 2);
 *
 * @param { Iterable<any> } it
 * @param { number } count
 */
declare function group(it: Iterable<any>, count: number): Generator<any[], void, unknown>;
/**
 * Returns an iterator over the items of all the input iterators, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the multiple of the length of thr smallest
 * iterator and the number of iterators (number of args).
 *
 * Can be used to join arrays in a way no supported by `concat`, `push`, etc.
 * To pass an array as an iterator, call array.values().
 *
 * @example
 * import { flat } from 'deleight/generationsl';
 * for (let i of flat(range(10, range(15)))) {
 *      console.log(i);    // 0, 0, 1, 1, 2, 2, .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...any[]} args
 */
declare function flat(...args: any[]): Generator<any, void, unknown>;
/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 * import { uItems } from 'deleight/generationsl';
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param {Iterable<any>} it
 */
declare function uItems(it: Iterable<any>): Generator<any, void, unknown>;
/**
 * Call to get the length of an object. The object must either
 * have a length property of be previously passed in a call to`setLength`.
 *
 * @example
 * import { getLength, setLength } from 'deleight/generationsl';
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} it
 */
declare function getLength(it: any): number;
/**
 * Stores the 'fake' lenghts of iterables passed in calls to `setLength`.
 * Can also be modified manually.
 */
declare const iterLengths: WeakMap<any, number>;
/**
 * Attaches a 'fake' length to an object (likely iterable or iterator)
 * which does not have a length property, so that it can work well with
 * functions that use `getLength`.
 *
 * @example
 * import { getLength, setLength } from 'deleight/generationsl';
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} it
 */
declare function setLength(it: any, length: number): any;

/**
 * This module enables reactivity  by exporting primitives for multiplying the effects of single operations.
 */
/**
 * Creates a One object which transmits a call, method dispatch, property
 * get or set applied to the 'one' object to the 'many' objects.
 *
 * The recursive arg is used to ensure that getting properties always
 * wraps the array results with `one` also.
 *
 * Items in the context arg will be passed to all delegated calls as the
 * final arguments. An empty array is created if not specified.
 *
 * Sometimes, you may want to pass an array of 1 or more objects to provide a shared
 * context for the items in many. Other times you may prefer no context because
 * it may affect the behavior of the calls, since the functions or methods may
 * be accepting optional arguments there. Passing your own arrays enable you to
 * set the behavior however you like (by emptying or populating the array).
 *
 * @example
 * import { one } from 'deleight/onetomany';
 * const component = one([data(), view(table)], false, [{}]);
 * component.create([10000]);
 *
 * @param {any[]} many An array of objects to delegat actios to
 * @param {boolean} [recursive] Whether to return One instances in `get` calls
 * @param {any[]} [context] Shared context for the 'many' functions or object methods
 * @returns
 */
declare function one(many: any[], recursive?: boolean, context?: any[]): One;
/**
 * Return a 'pure' One from a proxied One.
 *
 * @example
 * import { one, unWrap } from 'deleight/onetomany';
 * const o = one([{a: 1}, {a: 2}])
 * o.a = [4, 7];
 * const many = unWrap(o).many
 *
 * @param one
 * @returns
 */
declare function unWrap(one: One): any;
/**
 * A recursive One constructor. Used internally for recursive 'One's.
 */
interface IOneConstructor {
    (many: any[], recursive?: boolean, context?: any[], ctor?: IOneConstructor): One;
}
/**
 * An object which delegates actions on it to other objects
 *
 * @example
 * import { One } from 'deleight/onetomany';
 * const o = new One([{a: 1}, {a: 2}])
 * o.set('a', [4, 7]);
 *
 */
declare class One {
    /**
     * The many objects this One delegates to.
     */
    many: any[];
    /**
     * Whether this One will return other 'One's in calls to `get`.
     */
    recursive?: boolean;
    /**
     * The constructor function used for creating new 'One's in calls to `get`.
     */
    ctor?: IOneConstructor;
    /**
     * The context shared by the many functions or methods of the objects in many.
     * They all receive its items as their last set of arguments.
     */
    context?: any[];
    /**
     * Creates a new One instance for propagating operations to all the items
     * in many.
     *
     * @param {any[]} many The many objects or functions this One will delegate to.
     * @param {boolean} [recursive] Whether to wrap the arrays returned by `get` with another One.
     * @param {any[]} context An optional shared context to be passed to all propagated method or function calls.
     * This is an array of objects passed as the final arguments in calls. Empty array by default.
     * @param {IOneConstructor} [ctor] The constructor used to create the `get` Ones. This parameter is used internally;
     * no need to supply an argument.
     *
     * @example
     * import { One } from 'deleight/onetomany';
     * const loginYes = new One([username => profileView(username)]);
     * loginYes.call([[username]]);
     *
     * @constructor
     */
    constructor(many: any[], recursive?: boolean, context?: any[], ctor?: IOneConstructor);
    /**
     * Gets corresponding properties from all the objects in many. If this is
     * a recursive One and forceArray is falsy, the array result will be
     * used as the 'many' argument in a call to this.ctor and the created One
     * is returned instead of the array.
     *
     * @example
     * import { One } from 'deleight/onetomany';
     * const o = new One([{a: 1}, {a: 2}])
     * o.get('a');  // [1, 2]
     *
     * @param {string | number | symbol | null} [prop]
     * @param {boolean} [forceArray]
     * @returns {any[]|One}
     */
    get(prop?: string | number | symbol | null, forceArray?: boolean): any[] | One;
    /**
     * Sets corresponding property values in the objects in many.
     * 'values' are treated similarly to 'args' in the call method.
     *
     * @example
     * import { One } from 'deleight/onetomany';
     * const o = new One([{a: 1}, {a: 2}])
     * o.set('a', [4, 7]);
     *
     * @param {string | number | symbol | null} [prop]
     * @param {any[]} [values]
     */
    set(prop?: string | number | symbol | null, values?: any[]): any;
    /**
     * Delete the property from all objects in many.
     *
     * @example
     * import { One } from 'deleight/onetomany';
     * const o = new One([{a: 1}, {a: 2}])
     * o.delete('a');
     *
     * @param {string | number | symbol} prop
     */
    delete(prop: string | number | symbol): void;
    /**
     * Calls all the items in many (if method is not specified) or their
     * corresponding methods (if  method is specified). All the calls will
     * receive any items in `this.context` as their final arguments to
     * enable communication.
     *
     * args can be specified as follows:
     * `[[a1, a2], [a1, a2], [a1, a2]]`
     *
     * If `this.many` has 3 items, they will receive their own args. If there
     * are more items in `this.many`, they will all get the last provided args array
     * (here the one passed to the third item).
     *
     * The `one` function wraps created 'One's with a proxy to allow methods
     * to be called directly on them. Assuming we want to pass the same args
     * as above to such a method, the call will look like:
     *
     * `object.method([a1, a2], [a1, a2], [a1, a2])`.
     *
     * There is no need to wrap with the outer array in such cases.
     *
     * Call returns an array containing the return values of the individual
     * calls to many items.
     *
     * @example
     * import { One } from 'deleight/onetomany';
     * const loginYes = new One([username => profileView(username)]);
     * loginYes.call([[username]]);
     *
     * @param {any[]} args The function or method arguments
     * @param {string | number | symbol} [method] The name of a method to call.
     * A function call is assumed if not specified.
     *
     * @returns {any[]}
     */
    call(args?: any[], method?: string | number | symbol): any[];
}

/**
 * This module supports CSS loading, caching and 'localised' reuse.
 */
/**
 * An instance of Sophistrory can be used to obtain and cache CSS Stylesheets
 * which can be shared by multiple DOM elements.
 *
 *
 */
declare class Sophistry {
    /**
     * An cache for created SophistryStyleSheets.
     */
    styles: {};
    /**
     * Processes and 'pops' all style tags within the root.
     * Ensures that the same CSSStyleSheet can be reused across document trees (maindocument
     * and shadow roots) instead of duplicated even when they have been
     * created declaratively.
     *
     * If replace is truthy, any cached stylesheets with the same name (or hash) as a
     * styleshhet within the root will be replaced (reactively).
     *
     * This resolves the stated issue with declaratively adding encapsulated
     * styles to elements when using shadow DOM as described here;
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * const mySophistry = new Sophistry();
     * const element = apriori.createFragment(apriori.get('markup.html'));
     * const [styles, promises] = mySophistry.process(element);
     * document.body.append(element);
     * for (let style of styles) style.style(element, document.body.firstElementChild);
     *
     * @param {Element} root
     * @param {boolean} [replace]
     * @returns {[StyleSheet[], Promise<any>[]]}
     */
    process(root: Element | DocumentFragment, replace?: boolean): [StyleSheet[], Promise<any>[]];
    /**
     * Import a stylesheet defined in an external CSS file. Optionally
     * specify a name for the imported style in the Scophystry context (cache).
     * The name will default to the portion of the link before the first
     * apostrophe...
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * const mySophistry = new Sophistry();
     * const [style, onImport] = mySophistry.import('style.css');
     *
     * @param {string} link
     * @param {string} [name]
     * @returns {[StyleSheet, Promise<any>]}
     */
    import(link: string, name?: string): [StyleSheet, Promise<any>];
    /**
     * Replaces the text of an existing stylesheet. This is reactive.
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * const mySophistry = new Sophistry();
     * mySophistry.set('style.css', await apriori.get('new-style.css'));  // override everything.
     *
     * @param {string} name
     * @param {string} css
     * @returns
     */
    set(name: string, css: string): void;
}
/**
 * This is used to wrap a CSSStyleSheet to provide convenient methods
 * for styling and 'unstyling' elements.
 *
 * @example
 * import { StyleSheet } from 'deleight/sophistry';
 * const sss = new StyleSheet(css);
 *
 */
declare class StyleSheet {
    /**
     * The wrapped CSS stylesheet.
     */
    css: CSSStyleSheet;
    /**
     * Creates a new Sophistry stylesheet.
     *
     * @param {CSSStyleSheet} cssStyleSheet
     * @constructor
     */
    constructor(cssStyleSheet: CSSStyleSheet);
    /**
     * Styles the elements with the wrapped CSSStylesheets.
     * If an element is not the document or a shadow root, an open shadow
     * root is created for it and then the rrot is styled.
     *
     * @example
     * sss.style(...Array.from(document.body.children))
     *
     * @param  {...T} elements
     */
    style<T extends Element | DocumentFragment>(...elements: T[]): void;
    /**
     * Removes the wrapped stylesheet from the elements (or their shadow roots).
     *
     * @example
     * sss.remove(...Array.from(document.body.children))
     *
     *
     * @param {...T} elements
     */
    remove<T extends Element | DocumentFragment>(...elements: T[]): void;
}

/**
 * This module exports With function for creating more concise and structured code.
 */
/**
 * 'with' statement on steroids! This module exports a With function
 * which makes code succint without any of the limitations that led to
 * 'with' getting dropped from the JavaScript standard. In fact it
 * leads to much more concision than the original 'with' and does not
 * degrade performance, readability or code comprehension. It is based on Proxy.
 *
 * @example
 * With(document.createElement('button'))[SET]({className: 'main', textContent: 'Wow'}).addEventListener('click', () => console.log('Wow!!'))(btn => document.body.append(btn))()
 *
 */
interface IAnyFunction {
    (...args: any): any;
}
/**
 * Used to obtain a context (Recursive object) around a property of
 * the currently wrapped object. This is to continue the chain inwards
 * to increase the concision even further.
 *
 * @example
 *With(obj)[WITH]({o1: o1 => {assert.equal(o1.c, 1);}, o2: o2 => {assert.equal(o2.c, 2);}})
 */
declare const WITH: unique symbol;
/**
 * Used to set existing properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj).set({knownA:1, knownB:2}).method1().method2('...')()  // final call unwraps the object.
 */
declare const SET: unique symbol;
/**
 * Used to set any properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj)[SET]({prop3: 5, prop4: 6}).inc().prop2
 */
declare const ASSIGN: unique symbol;
/**
 * Creates recursive references around properties of a given object.
 * @example
 * With(obj)[ASSIGN]({prop1: 5, prop2: 6}).inc().prop2
 */
type IRecursiveProp<T> = {
    [key in keyof T]?: (arg: IRecursive<T[key]>) => any;
};
/**
 * Sets existing properties on object.
 */
type IRecursiveSetProp<T> = {
    [key in keyof T]?: any;
};
/**
 * An object whose methods returns itself
 */
type IRecursive<T> = {
    [key in keyof T]: T[key] extends IAnyFunction ? (...args: Parameters<T[key]>) => IRecursive<T> : T[key];
} & {
    [WITH]: (arg: IRecursiveProp<T>) => IRecursive<T>;
    [SET]: (arg: IRecursiveSetProp<T>) => IRecursive<T>;
    [ASSIGN]: (...objs: any[]) => IRecursive<T>;
    (arg: any, ...args: any): IRecursive<T>;
    (): T;
};
/**
 * Behaves like the 'with' construct in many langusges. All method calls
 * with return the same object and we can also access the special [assign]
 * method to set properties without breaking the chain. Used for more
 * concise syntax in some scenarios.
 *
 * @example
 * import { With, ASSIGN } from 'deleight/withy';
 * const el = With(document.createElement('div')).append().append()[ASSIGN]().append()().append();
 *
 * @param obj
 * @returns
 */
declare function With<T>(obj: T): IRecursive<T>;

export { ASSIGN, Actribute, END, EventListener, type IAnyFunction, type IApplyMap, type IAsyncTemplates, type IInserter, type IMatchEventTarget, type IMatcher, type IOneConstructor, type IRecursive, type IRecursiveProp, type IRecursiveSetProp, type ISetMap, type ITemplates, Listener, MatchListener, One, SET, Sophistry, StyleSheet, WITH, With, apply, applyTo, asyncTemplate, asyncTemplates, createFragment, elements, eventListener, flat, get, getLength, group, insert, inserter, items, iter, iterLengths, keys, matchListener, next, onEnter, onKey, one, parentSelector, preventDefault, range, remove, repeat, ruleSelector, ruleSelectorAll, set, setLength, stopPropagation, tag, template, templates, uItems, unWrap, update };
