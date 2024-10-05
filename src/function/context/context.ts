
export interface IContext {
    running: boolean;
}
/**
 * Wraps a function to ensure that it does not start running if the value of 
 * `running` in the provided lock is truthy. This is relevant for functions that 
 * use promises such as network requests and for mutually exclusive long-running 
 * operations which should not run at the same time. 
 * 
 * If the function returns a promise, 
 * the promise will be awaited before the context will be reset to allow any 
 * function using the lock to run again. 
 * 
 * The function will simply ignore calls before it is ready to run 
 * again, returning `undefined`. 
 * 
 * Pending tests. Please report bugs.
 * 
 * @example
 * 
 * 
 * @param fn 
 * @returns 
 */
export function setContext<T extends any[], U>(fn: (...args: T) => U, context: IContext) {
    return (...args: T) => {
        if (context.running) return;
        context.running = true;
        const result = fn(...args);
        if (result instanceof Promise) {
            result.then(() => context.running = false);
        } else context.running = false;
        return result;
    }
}
