/**
 * A proxy object that represents the return value of a function.
 *
 * WHen a property is accessed (get, set, method call, delete),
 * the function is first called to get the object before performing the
 * operation on it.
 *
 * When called, the function is called with the given argument and the
 * result is returned. In other words, the Return object is effectively
 * the same function it wraps artificially enriched with the properties
 * of the object(s) it returns when called.
 *
 * Pending tests. Please report bugs.
 *
 * @module
 */
import { realKey } from "../../object/member/own/own.js";
/**
 * Represents the return value of a function as an object. It is often useful
 * for 'holding' objects deeply nested within other objects.
 *
 * @example
 * import { gets } from 'deleight/object/shared'
 * import { object } from 'deleight/object/operations'
 * import { R } from 'deleight/proxies/return'
 *
 * const obj1 = { a: 1, b: 2, c: 3 };
 * const obj2 = { some: { path: { a: 1, b: 2, c: 3 } } };
 * const obj3 = R(() => obj2.some.path);
 *
 * const objects = { a: [obj1], b: [obj3], c: [obj1] };
 * const vals = object(gets(objects));  // { a: (1), b: (2), c: (3) }
 *
 */
export function Return(fn) {
    return new Proxy(fn, fHandler);
}
/**
 * Alias for {@link Return}
 */
export const R = Return;
const fHandler = {
    get(target, p) {
        const object = target();
        const result = object[realKey(p)];
        if (result instanceof Function)
            return result.bind(object);
        else
            return result;
    },
    set(target, p, value) {
        const object = target();
        object[realKey(p)] = value;
        return true;
    },
    deleteProperty(target, p) {
        const object = target();
        delete object[realKey(p)];
        return true;
    },
    ownKeys(target) {
        const object = target();
        return Reflect.ownKeys(object);
    }
};
