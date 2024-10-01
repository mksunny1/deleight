"use strict";
/**
 * This module should provide a richer API for making elements look more like
 * simple objects in JavaScript code. It should supercede the Selectors module
 * once it has been properly tested. The main benefit is these objects improve
 * composability with other aspects of deleight so we can write less code.
 *
 * Using this library we can do things like:
 *
 * `assign(wrap(element), { href: './item/link', first: { section: {textContent: 'First section text'} } })`
 *
 * more straightforwardly. Combining with Aliad module will also enable us to
 * shorten long names like `textContent`.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectAll = exports.selectFirst = exports.All = exports.First = exports.Attrs = exports.unwrap = exports.wrap = exports.$$ = exports.$ = exports.Selector = void 0;
const own_js_1 = require("../../object/member/own/own.js");
class SelectorObject {
    #proxy;
    constructor(element) {
        this.element = element;
    }
    get(p) {
    }
    ;
    set(p, value) {
        return true;
    }
    ;
    delete(p) {
        return true;
    }
    ;
    get proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this, handler);
        return this.#proxy;
    }
    get [exports.$$]() {
        return this.element;
    }
}
/**
 * A selector that holds all the other EOM objects as properties and also behaves like a `list` of
 * the children wlements of the wrapped element.
 *
 * @example
 *
 */
class Selector extends SelectorObject {
    #attrs;
    #first;
    #all;
    get attrs() {
        if (!this.#attrs)
            this.#attrs = new (this.constructor.Attrs)(this.element).proxy;
        return this.#attrs;
    }
    get first() {
        if (!this.#first)
            this.#first = new (this.constructor.First)(this.element).proxy;
        return this.#first;
    }
    get all() {
        if (!this.#all)
            this.#all = new (this.constructor.All)(this.element).proxy;
        return this.#all;
    }
}
exports.Selector = Selector;
exports.$ = Symbol();
exports.$$ = Symbol();
/**
 * Wraps a regular element with an instance of ELOMElement
 *
 * @example
 *
 *
 * @param element
 * @returns
 */
function wrap(element) {
    return new Selector(element).proxy;
}
exports.wrap = wrap;
/**
 * Returns the element wrapped by any instance of SelectorObject.
 *
 * @example
 *
 *
 * @param selectorObject
 * @returns
 */
function unwrap(selectorObject) {
    return selectorObject[exports.$$];
}
exports.unwrap = unwrap;
const handler = {
    get(target, p) {
        if (p === exports.$$)
            return target.element;
        if (p === exports.$)
            return target;
        if (target instanceof Selector && Reflect.has(target, p)) {
            let result = target[p];
            if (result instanceof Function)
                result = result.bind(target);
            return result;
        }
        return target.get(p);
    },
    set(target, p, value) {
        return target.set(p, value);
    },
    deleteProperty(target, p) {
        return target.delete(p);
    },
    ownKeys(target) {
        if (target instanceof Selector) {
            const result = [];
            const len = target.element.children.length;
            for (let i = 0; i < len; i++)
                result.push(`${i}`);
            return result;
        }
        else
            return Reflect.ownKeys(target);
    }
};
/**
 * A selector object that effectively holds all element attributes as properties.
 *
 * @example
 *
 */
class Attrs extends SelectorObject {
    get(p) {
        return this.element.getAttribute(p);
    }
    set(p, value) {
        this.element.setAttribute(p, value);
        return true;
    }
    ;
    delete(p) {
        this.element.removeAttribute(p);
        return true;
    }
}
exports.Attrs = Attrs;
/**
 * A selector object that effectively holds the first objects that match specified queries as properties.
 *
 * @example
 *
 */
class First extends SelectorObject {
    static { this.selector = selectFirst; }
    get(p) {
        const element = this.constructor.selector(this.element, p);
        if (element)
            return new Selector(element);
    }
    set(p, ...values) {
        const element = this.constructor.selector(this.element, p);
        if (element)
            element.replaceWith(...values);
        return true;
    }
    ;
    delete(p) {
        const element = this.constructor.selector(this.element, p);
        if (element)
            element.remove();
        return true;
    }
}
exports.First = First;
/**
 * Wrapper to ensure we keep returning Selector element instances.
 */
const arrayHandler = {
    get(target, p) {
        p = (0, own_js_1.realKey)(p);
        if (typeof p === "number") {
            return new Selector(target[p]);
        }
        return target[p];
    }
};
/**
 * A selector object that effectively holds all objects that match specified queries as properties.
 *
 * @example
 *
 */
class All extends SelectorObject {
    static { this.selector = selectAll; }
    get(p) {
        const elements = this.constructor.selector(this.element, p);
        if (elements)
            return new Proxy(Array.from(elements), arrayHandler);
    }
    set(p, ...values) {
        const elements = this.constructor.selector(this.element, p) || [];
        let i = 0;
        for (let element of elements)
            element.replaceWith(values[i++]);
        return true;
    }
    ;
    delete(p) {
        const elements = this.constructor.selector(this.element, p) || [];
        for (let element of elements)
            element.remove();
        return true;
    }
}
exports.All = All;
/**
 * The same as `element.querySelector`
 *
 * @param element
 * @param selector
 * @returns
 */
function selectFirst(element, selector) {
    return element.querySelector(selector);
}
exports.selectFirst = selectFirst;
/**
 * The same as `element.querySelectorAll`
 *
 * @param element
 * @param selector
 * @returns
 */
function selectAll(element, selector) {
    return element.querySelectorAll(selector);
}
exports.selectAll = selectAll;
