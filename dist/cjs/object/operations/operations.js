"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUntil = exports.assign = exports.reduce = exports.filter = exports.map = exports.mapKeys = exports.mapValues = exports.zip = exports.object = void 0;
const own_js_1 = require("../member/own/own.js");
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
function object(pairs) {
    const result = {};
    for (let pair of pairs)
        result[pair[0]] = pair[1];
    return result;
}
exports.object = object;
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
function zip(keys, values) {
    const result = {};
    for (let i = 0; i < keys.length; i++)
        result[keys[i]] = values?.[i];
    return result;
}
exports.zip = zip;
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
function mapValues(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let key of (0, own_js_1.ownKeys)(object))
        result[key] = mapper(object, key);
    return result;
}
exports.mapValues = mapValues;
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
function mapKeys(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let key of (0, own_js_1.ownKeys)(object))
        result[mapper(object, key)] = object[key];
    return result;
}
exports.mapKeys = mapKeys;
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
function map(object, mapper, inPlace) {
    const result = inPlace ? object : object instanceof Array ? [] : {};
    let value;
    for (let key of (0, own_js_1.ownKeys)(object)) {
        [key, value] = mapper(object, key);
        result[key] = value;
    }
    return result;
}
exports.map = map;
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
function filter(object, test) {
    const result = (object instanceof Array ? [] : {});
    for (let key of (0, own_js_1.ownKeys)(object))
        if (test(object, key))
            result[key] = object[key];
    return result;
}
exports.filter = filter;
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
function reduce(object, reducer, result = null) {
    for (let key of (0, own_js_1.ownKeys)(object))
        result = reducer(object, key, result);
    return result;
}
exports.reduce = reduce;
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
function assign(target, sources, options) {
    const getter = options?.getter, setter = options?.setter;
    let oldValue, value;
    for (let source of sources) {
        for (let key of (0, own_js_1.ownKeys)(source)) {
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
exports.assign = assign;
/**
 * Recursively fetches the same property from the object until the fetched
 * value matches the `until` condition or there is nothing left to fetch.
 *
 * @param object
 * @param key
 * @param until
 * @returns
 */
function getUntil(object, key, until) {
    const value = object[key];
    if (until(value))
        return value;
    else if (typeof value === 'object')
        return getUntil(value, key, until);
}
exports.getUntil = getUntil;
