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
import { ownKeys } from "../member/own/own.js";
/**
 * Converts an iterable of key-value pairs into an object. This is
 * the inverse of `Object.entries`. it is a bit similar to {@link zip}
 * but the object is created by joining in the other axis.
 *
 * Values that map to the same keys are combined into an array. The check
 * for this incurs a performance penalty. If you are sure there are
 * no repetitions, pass the `noRepeat` flag (as a truthy value)
 * to skip the checks.
 *
 * @example
 * import { object } from 'deleight/object/operations'
 * const obj = object([['a', 1], ['b', 2], ['c', 3]]);
 * console.log(obj)   // { a: 1, b: 2, c: 3 }
 *
 * @param pairs
 * @param noRepeat
 * @returns the created object
 */
export function object(pairs, noRepeat = false) {
    const result = {};
    const repeated = new Set();
    if (noRepeat) {
        for (let [key, value] of pairs)
            result[key] = value;
    }
    else {
        for (let [key, value] of pairs) {
            if (result.hasOwnProperty(key)) {
                if (!repeated.has(key)) {
                    repeated.add(key);
                    result[key] = [result[key]];
                }
                result[key].push(value);
            }
            else
                result[key] = value;
        }
    }
    return result;
}
/**
 * Combine `keys` with corresponding items in `values` to form and return an object.
 * `values` could be `undefined` may not have items corresponding to some keys but
 * all keys must be provided.
 *
 * Values that map to the same keys are combined into an array. The check
 * for this incurs a performance penalty. If you are sure there are
 * no repetitions, pass the `noRepeat` flag (as a truthy value)
 * to skip the checks.
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
export function zip(keys, values, noRepeat = false) {
    if (!values)
        values = [];
    const result = {};
    const repeated = new Set();
    const keysIt = keys[Symbol.iterator]();
    const valuesIt = values[Symbol.iterator]();
    let key, keyValue;
    let value;
    if (noRepeat) {
        while (!(key = keysIt.next()).done) {
            result[key.value] = valuesIt.next().value;
        }
    }
    else {
        while (!(key = keysIt.next()).done) {
            keyValue = key.value;
            value = valuesIt.next().value;
            if (result.hasOwnProperty(keyValue)) {
                if (!repeated.has(key)) {
                    repeated.add(key);
                    result[keyValue] = [result[keyValue]];
                }
                result[keyValue].push(value);
            }
            else
                result[keyValue] = value;
        }
    }
    return result;
}
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
export function mapValues(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let key of ownKeys(object))
        result[key] = mapper(object, key);
    return result;
}
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
export function mapKeys(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let key of ownKeys(object))
        result[mapper(object, key)] = object[key];
    return result;
}
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
export function map(object, mapper, inPlace) {
    const result = inPlace ? object : object instanceof Array ? [] : {};
    let value;
    for (let key of ownKeys(object)) {
        [key, value] = mapper(object, key);
        result[key] = value;
    }
    return result;
}
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
export function filter(object, test) {
    const result = (object instanceof Array ? [] : {});
    for (let key of ownKeys(object))
        if (test(object, key))
            result[key] = object[key];
    return result;
}
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
export function reduce(object, reducer, result = null) {
    for (let key of ownKeys(object))
        result = reducer(object, key, result);
    return result;
}
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
export function assign(target, sources, options) {
    const getter = options?.getter, setter = options?.setter;
    let oldValue, value;
    for (let source of sources) {
        for (let key of ownKeys(source)) {
            value = source[key];
            if (typeof value === 'object' && typeof (oldValue = getter?.(target, key) || target[key]) === 'object') {
                assign(oldValue, [value], options);
            }
            else {
                if (setter)
                    setter(target, key, value);
                else
                    target[key] = value;
            }
        }
    }
    return target;
}
/**
 * Recursively fetches the same property from the object until the fetched
 * value matches the `test` condition or there is nothing left to fetch.
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @param test
 * @returns
 */
export function getUntil(object, key, test) {
    const value = object[key];
    if (test(value))
        return value;
    else if (typeof value === 'object')
        return getUntil(value, key, test);
}
/**
 * Recursively fetches the same property from the object while the fetched
 * value passes the test or there is nothing left to fetch.
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @param test
 * @returns
 */
export function getWhile(object, key, test) {
    const value = object[key];
    if (!test(value))
        return value;
    else if (typeof value === 'object')
        return getWhile(value, key, test);
}
