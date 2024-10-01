/**
 * Functions for using objects to perform different tasks. Here
 * objects contain actions to run or things to interpret.
 *
 * API Table of Contents
 *
 *
 * @module
 */
import { IObjectCallable } from "../types.js";
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
export declare function process<T extends object, U = any>(object: T, action: IObjectCallable<T, U>, ...args: any[]): T;
