import { ownKeys } from "../own/own.js";
/**
 * Used to transform property keys and existing values to replacement
 * values in the {@link sets} function.
 */
export class Mapper {
    constructor(value) {
        this.value = value;
    }
}
/**
 * Returns a value that is interpreted as a mapper
 * (from the key, old value and object to the new value) in the
 * {@link sets} function.
 *
 * @example
 * import { set, M } from 'deleight/object/sharedmember'
 * let obj1 = { a: 20, b: 2, c: 20}, obj2 = { a: 1, b: 20, c: 3};
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 *
 * set(objects, M((obj, key) => obj[key] * 2));
 * console.log(obj1);    // { a: 40, b: 2, c: 40}
 * console.log(obj2);    // { a: 1, b: 40, c: 3}
 *
 * @param value
 * @returns
 */
export function M(value) {
    return new Mapper(value);
}
/**
 * Gets specified properties from different objects.
 *
 * The `map` argument maps property keys to iterables of objects (or functions that return such iterables).
 *
 * @example
 * import { get } from 'deleight/object/sharedmember'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * const vals = get(objects);  // { a: [1], b: [2], c: [3] }
 *
 * @param object
 */
export function gets(object) {
    const results = {};
    let targets;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key);
        if (targets instanceof Array) {
            results[key] = targets.map(val => val[key]);
        }
        else {
            results[key] = getIter(key, targets);
        }
    }
    return results;
}
function* getIter(key, targets) {
    for (let target of targets)
        yield target[key];
}
/**
 * Sets specified properties in different objects.
 *
 *
 * @example
 * import { set } from 'deleight/object/sharedmember'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * set(objects, 20);
 * console.log(obj1);    // { a: 20, b: 2, c: 20}
 * console.log(obj2);    // { a: 1, b: 20, c: 3}
 *
 * @param object
 * @param value
 */
export function sets(object, value) {
    let target, targets;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key, value);
        for (target of targets) {
            if (value instanceof Mapper)
                target[key] = value.value(target, key);
            else
                target[key] = value;
        }
    }
    return value;
}
/**
 * Calls specified methods in multiple objects.
 *
 * @example
 * import { call } from 'deleight/object/sharedmember'
 * let arr1 = [1, 2, 3], arr2 = [1, 2, 3], arr3 = [1, 2, 3];
 * const objects = { push: [arr1, arr3], unshift: [arr2] };
 * call(objects, 20, 21);
 * console.log(arr1)   // [1, 2, 3, 20, 21]
 * console.log(arr2)   // [20, 21, 1, 2, 3]
 * console.log(arr3)   // [1, 2, 3, 20, 21]
 *
 * @param object
 * @param args
 */
export function calls(object, ...args) {
    let target, targets, result;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key, ...args);
        for (target of targets) {
            result = target[key](...args);
        }
    }
    return result;
}
/**
 * Deletes specified properties from different objects.
 *
 * @example
 * import { del } from 'deleight/object/sharedmember'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * del({ a: [obj1], b: [obj2], c: [obj1] });
 * console.log(obj1);    // { b: 2 }
 * console.log(obj2);    // { a: 1, c: 3}
 *
 * @param object
 */
export function dels(object) {
    let target, targets;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key);
        for (target of targets)
            delete target[key];
    }
}
