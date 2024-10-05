import { ICallable } from "../../types";

/**
 * Caches the return value of calling a function. Repeat calls 
 * will simply return the cached value.
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
