/**
 * Functions for creating and manipulating objects. Objects here are
 * the targets of the operations performed by the functions in this module.
 *
 * API Table of Contents
 *
 *
 *
 * @module
 */
import { ICallable, IKey } from "../../types.js";
import { IObjectCallable } from "../types.js";
export interface IAssignOptions {
    getter?: IObjectCallable;
    setter?: IObjectCallable;
}
/**
 * Converts an iterable of key-value pairs into an object. This is
 * the inverse of `Object.entries`. it is a bit similar to {@link zip}
 * but the object is created by joining in the other axis.
 *
 * @example
 * import { object } from 'deleight/object/operations'
 * const obj = object([['a', 1], ['b', 2], ['c', 3]]);
 * console.log(obj)   // { a: 1, b: 2, c: 3 }
 *
 * @param pairs
 * @returns
 */
export declare function object<T>(pairs: Iterable<[IKey, any]>): T;
/**
 * Combine `keys` with corresponding items in `values` to form and return an object.
 * `values` could be `undefined` may not have items corresponding to some keys but
 * all keys must be provided.
 *
 * @example
 * import { zip } from 'deleight/object/operations'
 * const obj = zip(['a', 'b', 'c'], [1, 2, 3]);
 * console.log(obj)   // { a: 1, b: 2, c: 3 }
 *
 * @param keys
 * @param values
 * @returns
 */
export declare function zip<T>(keys: IKey[], values?: any[]): T;
/**
 * Transform the values of the input object using the mapper and return the mapped object.
 * The returned object will be the same as the input if `inPlace` is truthy.
 *
 * @example
 * import { mapValues } from 'deleight/object/operations'
 * const obj = mapValues({ a: 1, b: 2, c: 3 }, (obj, key) => obj[key] * 3);
 * console.log(obj)   // { a: 3, b: 6, c: 9 }
 *
 * @param object
 * @param mapper
 * @param inPlace
 * @returns
 */
export declare function mapValues<T>(object: any, mapper: IObjectCallable, inPlace?: boolean): T;
/**
 * Transform the keys of the input object using the mapper and return the mapped object.
 * The returned object will be the same as the input if `inPlace` is truthy.
 *
 * @example
 * import { mapKeys } from 'deleight/object/operations'
 * const obj = mapKeys({ a: 1, b: 2, c: 3 }, (obj, key) => `${key}1`);
 * console.log(obj)   // { a1: 1, b1: 2, c1: 3 }
 *
 * @param object
 * @param mapper
 * @param inPlace
 * @returns
 */
export declare function mapKeys<T>(object: any, mapper: IObjectCallable, inPlace?: boolean): T;
/**
 * Transform the keys and values of the input object using the mapper and return the mapped object.
 * The returned object will be the same as the input if `inPlace` is truthy.
 *
 * @example
 * import { map } from 'deleight/object/operations'
 * const obj = map({ a: 1, b: 2, c: 3 }, (obj, key) => [`${key}1`, obj[key] * 3]);
 * console.log(obj)   // { a1: 3, b1: 6, c1: 9 }
 *
 * @param object
 * @param mapper
 * @param inPlace
 * @returns
 */
export declare function map<T>(object: any, mapper: IObjectCallable, inPlace?: boolean): T;
/**
 * Filters the input object using the test function
 * and returns the filtered object.
 *
 *
 * @example
 * import { filter } from 'deleight/object/operations'
 * const r = filter({ a: 1, b: 2, c: 3 }, (obj, key) => obj[key] > 1);
 * console.log(r)   // { b: 2, c: 3 }
 *
 * @param object
 * @param test
 * @returns
 */
export declare function filter<T>(object: any, test: IObjectCallable): T;
/**
 * Reduces the input object using the reducer (and optional initial value)
 * and return the reduced value.
 *
 *
 * @example
 * import { reduce } from 'deleight/object/operations'
 * const r = reduce({ a: 1, b: 2, c: 3 }, (r, k, v) => r + (v * v), 0);
 * console.log(r)   // 14
 *
 * @param object
 * @param reducer
 * @param result
 * @returns
 */
export declare function reduce<T>(object: any, reducer: IObjectCallable, result?: any): T;
/**
 * Similar to `Object.assign` but will avoid replacing existing values
 * of `object` type. Only primitives and nested primitives are assigned.
 *
 * A getter function may be used to retrieve existing target properties
 * in cases where we want some indirection.
 *
 * @example
 *
 *
 * @param target
 * @param sources
 * @param options
 */
export declare function assign(target: any, sources: any[], options?: IAssignOptions): any;
/**
 * Recursively fetches the same property from the object until the fetched
 * value matches the `until` condition or there is nothing left to fetch.
 *
 * @param object
 * @param key
 * @param until
 * @returns
 */
export declare function getUntil(object: object, key: IKey, until: ICallable): any;
