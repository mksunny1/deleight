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
export type ILike<T, U = any> = {
    [key in keyof T]: U;
};
export type IOp<T> = {
    [key in keyof T]?: T[key];
};
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
export declare class Alias<T> {
    #private;
    map: T;
    remap?: IOp<ILike<T, IKey>>;
    constructor(map: T, remap?: IOp<ILike<T, IKey>>);
    get(p: IKey): any;
    set(p: IKey, value: any): void;
    delete(p: IKey): void;
    get proxy(): T;
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
export declare function alias<T>(map: T, remap?: IOp<ILike<T, string>>): ILike<T>;
/**
 * Alias for {@link alias}
 */
export declare const A: typeof alias;
