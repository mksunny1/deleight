/**
 * Contains functions for caching function results. Pending tests.
 * Please report bugs.
 *
 * @module
 */
/**
 * Caches the return value of calling a function. Repeat calls
 * will simply return the cached value. Pending tests.
 * Please report bugs.
 *
 * @example
 *
 */
export function cache(func) {
    let result, called = false;
    return Object.assign((...args) => {
        if (called)
            return result;
        result = func(...args);
        called = true;
    }, { reset: () => { called = false; } });
}
/**
 * Caches the return value of calling a function. using the arguments as keys.
 * This is also called memoization. Please don't abuse this function to avoid
 * memory inefficiencies. Pending tests. Please report bugs.
 *
 * @example
 *
 */
export function cacheWith(func) {
    let results = [];
    return Object.assign((...args) => {
        let count, i, arg;
        for (let result of results) {
            count = 0;
            for ([i, arg] of args.entries()) {
                if (result[i] === arg)
                    count++;
                else
                    break;
            }
            if (count === args.length)
                return result[i + 1];
        }
        const result = func(...args);
        results.push([...args, result]);
        return result;
    }, { reset: () => { results = []; } });
}
