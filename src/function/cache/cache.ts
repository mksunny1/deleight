/**
 * Contains functions for caching function results. Pending tests. 
 * Please report bugs.
 * 
 * @module
 */

import { ICallable } from "../../types";

/**
 * Caches the return value of calling a function. Repeat calls 
 * will simply return the cached value. Pending tests. 
 * Please report bugs.
 * 
 * @example
 * 
 */
export function cache<T extends ICallable>(func: T): T {
    let result: any, called = false;
    return Object.assign((...args: any[]) => {
        if (called) return result;
        result = func(...args);
        called = true;
    }, { reset: () => { called = false } }) as any as T;
}


/**
 * Caches the return value of calling a function. using the arguments as keys. 
 * This is also called memoization. Please don't abuse this function to avoid 
 * memory inefficiencies. Pending tests. Please report bugs.
 * 
 * @example
 * 
 */
export function cacheWith<T extends ICallable>(func: T): T {
    let results: any[][] = [];
    return Object.assign((...args: any[]) => {
        let count: number, i: number, arg: any;
        for (let result of results) {
            count = 0;
            for ([i, arg] of args.entries()) {
                if (result[i] === arg) count++;
                else break;
            }
            if (count === args.length) return result[i + 1];
        }
        const result = func(...args);
        results.push([...args, result]);
        return result;
    }, { reset: () => { results = [] } }) as any as T;
}

