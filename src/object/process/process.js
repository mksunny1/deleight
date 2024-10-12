/**
 * Functions for using objects to perform different tasks. Here
 * objects contain actions to run or things to interpret.
 *
 * API Table of Contents
 *
 *
 * @module
 */
import { ownKeys } from "../member/own/own.js";
/**
 * Performs the specified action with all object keys.
 *
 * If the action returns an object type, Process will be
 * called again with it.
 *
 * Extra arguments to be passed to the action (after the object and key)
 * can be specified with extra optional arguments to Process.
 *
 *
 * @example
 * import { process } from 'deleight/object/process'
 * let count = 0;
 * process({ a: 1, b: 2, c: 3 }, (obj, key) => count += (obj[key] * obj[key]));
 * console.log(count)    // 14
 *
 * @param object
 * @param action
 * @param args
 */
export function process(object, action, ...args) {
    let nextObject;
    for (let key of ownKeys(object)) {
        nextObject = action(object, key, ...args);
        if (typeof nextObject === 'object')
            process(nextObject, action, ...args);
    }
    return object;
}
/**
 * Run the action over all the property keys of the object, optionally
 * including further args in the call. This is effectively {@link process}
 * without the recursion.
 *
 * @example
 *
 *
 * @param object
 * @param action
 * @param args
 * @returns
 */
export function forEach(object, action, ...args) {
    for (let key of ownKeys(object)) {
        action(object, key, ...args);
    }
    return object;
}
