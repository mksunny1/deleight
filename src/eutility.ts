/**
 * This module exports event handling helpers.
 * 
 * @module
 */

/**
 * Base class for EventListener and MatchListener. This can be used to 
 * wrap any listeners which will be shared by many elements. Call the 
 * `listen` or `remove` method to add or remove the listener to/from 
 * the given elements.
 * 
 * @example
 * import { Listener } from 'deleight/eutility';
 * listener = new Listener(() => login(input.value));
 * listener.listen('keyup', [window.input1, window.input2])
 * 
 */
export class Listener {
    listener: EventListenerOrEventListenerObject;
    constructor(listener: EventListenerOrEventListenerObject) {
        this.listener = listener;
    };
    listen(
        eventName: string,
        elements: EventTarget[],
        options?: boolean | AddEventListenerOptions,
    ) {
        for (let element of elements)
            element.addEventListener(eventName, this.listener, options);
    }
    remove(eventName: string, ...elements: EventTarget[]) {
        for (let element of elements)
            element.removeEventListener(eventName, this.listener);
    }
}

/**
 * Object mapping element matching strings to event handler functions.
 * The matching strings (keys) are used to match event targets to trigger
 * the invocation of their associated handler functions.
 *
 */
export interface IMatcher {
    [key: string]: Function | Function[];
}

const defaultRunContext = { running: false };

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
 * import { eventListener, onEnter } from 'deleight/eutility';
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
export function eventListener(ops: Function[] | Function, runContext?: any) {
    if (!runContext) runContext = defaultRunContext;
    if (!(ops instanceof Array)) ops = [ops];
    let op: Function;
    function listener(e: any) {
        if (runContext.running) return;
        runContext.running = true;
        let result: any;
        for (op of ops as Function[]) {
            result = op(e, runContext);      // might be a promise. up to the next op whether or not to await it.
            runContext.result = result;
            if (result === END) break;
        }
        // we only await a final promise:
        if (result instanceof Promise) result.then(() => runContext.running = false, err => { throw err });
        else runContext.running = false;
        return result;
    }
    return listener;
}

/**
 * Similar to eventListener function but has methods for attaching
 * and removing itself from multiple elements at the same time.
 *
 * This gives the listener a 'personality' and promotes its reuse
 * (good practice).
 * 
 * @example
 * import { eventListener } from 'deleight/eutility';
 * listener = new EventListener([onEnter, () => login(input.value), preventDefault]);
 * listener.listen('keyup', [window.input1, window.input2])
 */
export class EventListener extends Listener {
    constructor(ops: Function[] | Function, runContext?: any) {
        super(eventListener(ops, runContext));
    }
}

/**
 * Symbol which will terminate event handling if returned by any of
 * the functions in the ops chain of an event handler created with
 * `eventHandler`.
 *
 * @example
 * import { END } from 'deleight/eutility';
 * const keyEventBreaker = (e: KeyboardEvent) => (e.key !== key)? END: '';
 */
export const END = Symbol();

/**
 * Takes advantage of event bubbling to listen for events on descendant
 * elements to reduce the number of listeners to create.
 *
 * @example
 * import { matchListener } from 'deleight/eutility';
 * window.mainTable.onclick = matchListener({
 *     'a.lbl': e => select(e.target.parentNode.parentNode),
 *     'span.remove': [removeListener, preventDefault, stopPropagation]
 * }, true);
 *
 * @param {IMatcher} matcher Map of event target matcher to associated handler function
 * @param {boolean} wrapListeners Whether to werap the matcher functions with `eventListener`.
 */
export function matchListener(matcher: IMatcher, wrapListeners?: boolean) {
    const listenerMap: { [key: string]: Function } = {};
    for (let [selector, args] of Object.entries(matcher)) {
        if (wrapListeners || args instanceof Array) {
            let args2: [Function | Function[], any];
            if (!(args instanceof Array) || typeof args.at(-1) === "function") {
                args2 = [args, null];
            }
            listenerMap[selector] = args2
                ? eventListener(args2[0], args2[1])
                : eventListener(args[0], args[1]);
        } else listenerMap[selector] = args;
    }
    function listener(e: { target: IMatchEventTarget }) {
        for (let [selector, fn] of Object.entries(listenerMap)) {
            if (e.target.matches && e.target.matches(selector)) return fn(e);
        }
    }
    return listener;
}

/**
 * An event target which may have a 'matches' method. This includes most 
 * standard HTML elements.
 */
export interface IMatchEventTarget extends EventTarget {
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
 * import { MatchListener } from 'deleight/eutility';
 * const listener = new MatchListener({
 *     'a.lbl': e => select(e.target.parentNode.parentNode),
 *     'span.remove': [removeListener, preventDefault, stopPropagation]
 * }, true);
 * 
 * listener.listen('click', [window.table1, window.table2], eventOptions)
 */
export class MatchListener extends Listener {
    constructor(matcher: IMatcher, wrapListeners?: boolean) {
        super(matchListener(matcher, wrapListeners));
    }
}

/**
 * Simply calls `stopPropagation` on the event. Useful for creating one-liner
 * event handlers.
 * 
 * @example
 * import { eventListener, stopPropagation } from 'deleight/eutility';
 * window.firstButton.onclick = eventListener([stopPropagation, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 * @param e The event object
 * @returns
 */
export const stopPropagation = (e: { stopPropagation: () => any }) =>
    e.stopPropagation();

/**
 * Simply calls `preventDefault` on the event. Useful for creating one-liner
 * event handlers.
 * 
 * @example
 * import { eventListener, preventDefault } from 'deleight/eutility';
 * window.firstButton.onclick = eventListener([preventDefault, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 * @param e The event object
 * @returns
 */
export const preventDefault = (e: { preventDefault: () => any }) =>
    e.preventDefault();

/**
 * This returns a function which will stop an event handler run (typically for keyup,
 * keydown etc) from continuing if it has not been triggered by the specified key.
 * The returned functions are to be placed before the main handler functions in the `ops`
 * array passed to `eventListener`.
 *
 * @example
 * import { eventListener, onKey } from 'deleight/eutility';
 * const aKeyGuard = onKey('a');
 * window.firstInput.keyup = eventListener([aKeyGuard, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 * @returns {Function}
 */
export const onKey = (key: string) => (e: KeyboardEvent) =>
    e.key !== key ? END : "";
export const keys = { enter: "Enter" };

/**
 * This will stop a key(up or down...) event handler run from continuing if
 * it has not been triggered by the enter key.
 * 
 * @example
 * import { eventListener, onEnter } from 'deleight/eutility';
 * window.firstInput.keyup = eventListener([onEnter, (e, runContext) => {
 *  // handle event here.
 * }]);
 *
 */
export const onEnter = onKey(keys.enter);
