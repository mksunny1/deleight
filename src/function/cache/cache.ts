/**
 * Contains functions for caching function results. Pending tests. 
 * Please report bugs.
 * 
 * @module
 */

import { ICallable } from "../../types";

/**
 * Caches the return value of calling a function. Repeat calls 
 * will simply return the cached value. 
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
 * 
 */
export function cache<T extends ICallable>(func: T): T {
    let result: any, called = false;
    return Object.assign(function(...args: any[]) {
        if (called) return result;
        result = func.call(this, ...args);
        called = true;
    }, { reset: () => { called = false } }) as any as T;
}

const hashes = new WeakMap();
function identityHash(object: any) {
    if (hashes.has(object)) return hashes.get(object);
    else {
        const randomHash = `${Math.random()}`;
        hashes.set(object, randomHash);
        return randomHash;
    }
}

/**
 * Caches the return value of calling a function. using the arguments as keys. 
 * This is also called memoization. 
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
 * 
 */
export function cacheWith<T extends ICallable>(func: T, hash=identityHash): T {
    let results: any = {};
    return Object.assign(function(...args: any[]) {
        const argsHash = args.map(arg => hash(arg)).join('-|-');
        if (!results.hasOwnProperty(argsHash)) {
            results[argsHash] = func.call(this, ...args);
        }
        return results[argsHash];
    }, { reset: () => { results = {} } }) as any as T;
}
