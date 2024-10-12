/**
 * A proxy object which calls a wrapped function when object operations
 * (like get, set and delete) are done on it, using the specified
 * key as the first parameter.
 *
 * Pending tests. Please report bugs.
 *
 * @module
 */
import { realKey } from "../../object/member/own/own.js";
/**
 * A proxy object which calls a wrapped function when object operations
 * (like get, set and delete) are done on it, using the specified
 * key as the first parameter.
 *
 * This can be used to create 'dynamic' getters, setters and 'deleters'.
 *
 * Pending tests. Please report bugs.
 *
 * @example
 *
 *
 */
export function Dynamic(fn) {
    return new Proxy(fn, fHandler);
}
/**
 * Alias for {@link Dynamic}
 */
export const dyn = Dynamic;
const fHandler = {
    get(target, p) {
        return target(realKey(p));
    },
    set(target, p, value) {
        target(realKey(p), value);
        return true;
    },
    deleteProperty(target, p) {
        target(realKey(p));
        return true;
    }
};
