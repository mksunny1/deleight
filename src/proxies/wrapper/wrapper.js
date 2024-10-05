/**
 * A base implementation of a wrapper around another object.
 * Simply extend this class to implement custom behavior for
 * specific types in your applications. For example to implement
 * conditional property and/or method access, value transformations
 * before and/or after object actions or performing arbitrary
 * operations before and/or after object member access.
 *
 * Pending tests. Please report bugs.
 *
 * @example
 *
 *
 */
import { realKey } from "../../object/member/own/own.js";
export const Target = Symbol();
/**
 * Extend this class to create custom handlers if necessary.
 *
 * @example
 */
export class Handler {
    get(target, p) {
        if (typeof p === 'string')
            p = realKey(p);
        const mainTarget = target[Target];
        return mainTarget.get(p);
    }
    ;
    set(target, p, value) {
        if (typeof p === 'string')
            p = realKey(p);
        const mainTarget = target[Target];
        mainTarget.set(p, value);
        return true;
    }
    ;
    deleteProperty(target, p) {
        if (typeof p === 'string')
            p = realKey(p);
        const mainTarget = target[Target];
        mainTarget.delete(p);
        return true;
    }
    ;
}
/**
 * Use this to create a standard Proxy object, often with a subclass ow Wrapper.
 *
 */
export const handler = new Handler();
/**
 * Extend this class to quickly implement wrapper functions like aliasing and so on.
 */
export class Wrapper {
    static { this.handler = handler; }
    #proxy;
    constructor(value, ...args) {
        this.value = value;
    }
    recursiveArgs(result, key) {
        return [];
    }
    bindFunctions(key) {
        return true;
    }
    get(key) {
        let result = this.value[key];
        if (result instanceof Function && this.bindFunctions(key))
            result = result.bind(this.value);
        let args;
        if (args = this.recursiveArgs(result, key)) {
            result = new this.constructor(result, ...args);
        }
        return result;
    }
    set(key, value) {
        this.value[key] = value;
    }
    call(...args) {
        return this.value(...args);
    }
    delete(key) {
        delete this.value[key];
    }
    get proxy() {
        const handler = this.constructor.handler;
        if (!this.#proxy) {
            this.#proxy = new Proxy(Object.assign((...args) => this.call(...args), { [Target]: this }), handler instanceof Function ? new handler(this) : handler);
        }
        return this.#proxy;
    }
}
