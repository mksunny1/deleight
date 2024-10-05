/**
 * Caches the return value of calling a function. Repeat calls
 * will simply return the cached value.
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
