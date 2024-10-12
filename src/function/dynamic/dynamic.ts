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
import { IKey } from "../../types.js";

export interface IDynamic {
    (key: IKey, ...args: any[]): any
}

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
export function Dynamic(fn: IDynamic) {
    return new Proxy(fn, fHandler);
}

/**
 * Alias for {@link Dynamic}
 */
export const dyn = Dynamic;

const fHandler = {
    get(target: IDynamic, p: IKey) {
        return target(realKey(p));
    },
    set(target: IDynamic, p: IKey, value: any) {
        target(realKey(p), value);
        return true;
    },
    deleteProperty(target: IDynamic, p: IKey) {
        target(realKey(p));
        return true;
    }
}
