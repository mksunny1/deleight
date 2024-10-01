"use strict";
/**
 * Functions for using objects to perform different tasks. Here
 * objects contain actions to run or things to interpret.
 *
 * API Table of Contents
 *
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.process = void 0;
const own_js_1 = require("../member/own/own.js");
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
 * import { process } from 'deleight/object/actions'
 * let count = 0;
 * process({ a: 1, b: 2, c: 3 }, (obj, key) => count += (obj[key] * obj[key]));
 * console.log(count)    // 14
 *
 * @param object
 * @param action
 * @param args
 */
function process(object, action, ...args) {
    let nextObject;
    for (let key of (0, own_js_1.ownKeys)(object)) {
        nextObject = action(object, key, ...args);
        if (typeof nextObject === 'object')
            process(nextObject, action, ...args);
    }
    return object;
}
exports.process = process;
