
/**
 * A base implementation of a wrapper around another object. 
 * Simply extend this class to implement custom behavior for 
 * specific types in your applications. For example to implement 
 * conditional property and/or method access, value transformations 
 * before and/or after object actions or performing arbitrary 
 * operations before and/or after object member access.
 * 
 * @example
 * 
 * 
 */

import { realKey } from "../../object/member/own/own.js";
import { IKey } from "../../types.js";

export interface IObject<T=any> {
    value: T
    get(p: IKey): any;
    set(p: IKey, value: any): any;
    call(...args: any[]): any;
    delete(p: IKey): any;
}

export const Target = Symbol();

/**
 * Extend this class to create custom handlers if necessary.
 * 
 * @example
 */
export class Handler<T=any> {
    get(target: { [Target]: IObject<T> }, p: IKey) {
        if (typeof p === 'string') p = realKey(p);
        const mainTarget = target[Target];
        return mainTarget.get(p);
    };

    set(target: { [Target]: IObject<T> }, p: IKey, value: any) {
        if (typeof p === 'string') p = realKey(p);
        const mainTarget = target[Target];
        mainTarget.set(p, value);
        return true
    };
    
    deleteProperty(target: { [Target]: IObject<T> }, p: IKey) {
        if (typeof p === 'string') p = realKey(p);
        const mainTarget = target[Target];
        mainTarget.delete(p);
        return true;
    };
    

}

/**
 * Use this to create a standard Proxy object, often with a subclass ow Wrapper.
 * 
 */
export const handler = new Handler();

/**
 * Extend this class to quickly implement wrapper functions like aliasing and so on.
 */
export class Wrapper<T extends object | Function> {
    static handler: Handler = handler;

    value: T;
    #proxy: T;
    constructor(value: T, ...args: any[]) {
        this.value = value;
    }
    recursiveArgs(result: any, key?: IKey): any {
        return [];
    }
    bindFunctions(key?: IKey) {
        return true;
    }
    get(key: IKey) {
        let result = this.value[key];
        if (result instanceof Function && this.bindFunctions(key)) result = result.bind(this.value);
        let args: any[];
        if (args = this.recursiveArgs(result, key)) {
            result = new (<typeof Wrapper>this.constructor)(result, ...args)
        }
        return result;
    }

    set(key: IKey, value: any) {
        this.value[key] = value
    }

    call(...args: any[]) {
        return (this.value as Function)(...args)
    }

    delete(key: IKey) {
        delete this.value[key];
    }

    get proxy(): T {
        const handler = (<typeof Wrapper>this.constructor).handler;
        if (!this.#proxy) {
            this.#proxy = new Proxy(Object.assign((...args: any[]) => this.call(...args), { [Target]: this }), handler instanceof Function? new (handler as any)(this): handler) as any
        }
        return this.#proxy;
    }
}

