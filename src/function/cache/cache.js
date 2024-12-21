/**
 * Contains functions for caching function results. Pending tests.
 * Please report bugs.
 *
 * @module
 */
/**
 * Caches the return value of calling a function. Repeat calls
 * will simply return the cached value.
 *
 * Pending tests. Please report bugs.
 *
 * @example
 *
 */
export function cache(func) {
    let result, called = false;
    return Object.assign(function (...args) {
        if (called)
            return result;
        result = func.call(this, ...args);
        called = true;
    }, { reset: () => { called = false; } });
}
const hashes = new WeakMap();
function identityHash(object) {
    if (hashes.has(object))
        return hashes.get(object);
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
export function cacheWith(func, hash = identityHash) {
    let results = {};
    return Object.assign(function (...args) {
        const argsHash = args.map(arg => hash(arg)).join('-|-');
        if (!results.hasOwnProperty(argsHash)) {
            results[argsHash] = func.call(this, ...args);
        }
        return results[argsHash];
    }, { reset: () => { results = {}; } });
}
