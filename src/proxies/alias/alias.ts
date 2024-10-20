/**
 * Exports tools for creating and manipulating virtual objects which draw 
 * properties from multiple objects.
 * 
 * @module
 */

import { IKey } from "../../types.js";

/**
 * Represents any function
 */
export interface ICallable {
    (...args: any[]): any;
}

export type ILike<T, U=any> = {
    [key in keyof T]: U
}

export type IOp<T> = {
    [key in keyof T]?: T[key]
}

const handler = {
    get(red: Alias<any>, p: IKey) {
        return red.get(p);
    },
    set(red: Alias<any>, p: IKey, value: any) {
        red.set(p, value);
        return true;
    },
    deleteProperty(red: Alias<any>, p: IKey) {
        red.delete(p);
        return true;
    }
}

/**
 * Creates an object which reroutes property and method accesses to other 
 * objects.
 * 
 * The keys in `Redirect.map` are the 'virtual' properties of the Redirect instance and 
 * the values are the source objects containing the real properties.
 * 
 * The optional `Redirect.remap` object may be used to map a virtual property to 
 * a property with a different key in the source object. Any virtual properties not in 
 * `Redirect.remap` will naturally have the same key in the source object.
 * 
 * @example
 * import { Alias } from 'deleight/proxies/alias'
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 3, b: 4 };
 * const red = new Alias({ c: obj1, d: obj2 }, {c: 'a', d: 'a'});
 * console.log(red.get('c'))     // 1
 * console.log(red.get('d'))     // 3
 * 
 * @param map 
 * @param remap
 */
export class Alias<T> {
    map: T;
    remap?: IOp<ILike<T, IKey>>;
    #proxy?: T;
    constructor(map: T, remap?: IOp<ILike<T, IKey>>) {
        this.map = map;
        if (remap) this.remap = remap;
    }
    get(p: IKey) {
        const {map, remap} = this;
        let q: IKey = (typeof p !== 'symbol')? remap?.[p]: undefined;
        if (q === undefined) q = p;
        const object = map[p]
        const result = object[q];
        if (result instanceof Function) return result.bind(object);  // method.
        return result;
    }
    set(p: IKey, value: any) {
        const {map, remap} = this;
        let q: IKey = (typeof p !== 'symbol')? remap?.[p]: undefined;
        if (q === undefined) q = p;
        const object = map[p]
        object[q] = value;
    }
    delete(p: IKey) {
        const {map, remap} = this;
        let q: IKey = (typeof p !== 'symbol')? remap?.[p]: undefined;
        if (q === undefined) q = p;
        const object = map[p]
        delete object[q];
    }
    get proxy(): T {
        if (!this.#proxy) this.#proxy = new Proxy(this, handler) as unknown as T;
        return this.#proxy;
    }
}

/**
 * Creates a proxy of an Alias instance so that we can use it like a normal object.
 * 
 * @example
 * import { alias } from 'deleight/proxies/alias'
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 3, b: 4 };
 * const al = alias({ c: obj1, d: obj2 }, {c: 'a', d: 'a'});
 * console.log(al.c)     // 1
 * console.log(al.d)     // 3
 * 
 * @param map 
 * @param remap
 */
export function alias<T>(map: T, remap?: IOp<ILike<T, string>>): ILike<T> {
    return new Alias(map, remap).proxy as ILike<T>;
}

/**
 * Alias for {@link alias}
 */
export const A = alias;
