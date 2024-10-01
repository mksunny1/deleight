"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = exports.ownKey = exports.ownKeys = exports.realKey = void 0;
/**
 * Converts string keys that contain only a single number into the
 * cumber before returning. Number and symbol keys are returned the same.
 *
 * @param value
 * @returns
 */
function realKey(value) {
    if (typeof value !== 'string')
        return value;
    const n = parseInt(value);
    if (!isNaN(n))
        return n;
    return value;
}
exports.realKey = realKey;
/**
 * Like `Reflect.ownKeys` but returns numbers as 'number' type instead
 * of 'string' type. Also please note that this method returns a generator
 * instead of an Array. Finally, the method will only return indices from 0 to
 * `object.length` when the object is an iterable with a `length` property
 * (such as an Array or NodeList)...
 *
 * @example
 *
 *
 * @param object
 */
function* ownKeys(object) {
    let key;
    if (Reflect.has(object, Symbol.iterator) && Reflect.has(object, 'length'))
        for (let i = 0; i < object.length; i++)
            yield i;
    else
        for (key of Reflect.ownKeys(object))
            yield realKey(key);
}
exports.ownKeys = ownKeys;
/**
 * Create strings from property accesses (so they appear like
 * variables in the code).
 */
exports.ownKey = new Proxy({}, {
    get(target, p) {
        return realKey(p);
    }
});
exports.ok = exports.ownKey;
