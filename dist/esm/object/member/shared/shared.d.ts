import { IKey, IReturns } from "../../../types.js";
import { IObjectCallable } from "../../types.js";
/**
 * An object mapping member keys to iterables of objects which can can be used as the `object` argument
 * to {@link gets}, {@link sets}, {@link calls} or {@link dels}.
 *
 */
export type IMembers<T = any> = {
    [key: IKey]: Iterable<T> | IReturns<Iterable<T>>;
};
/**
 * Used to transform property keys and existing values to replacement
 * values in the {@link sets} function.
 */
export declare class Mapper<T = any, U = any> {
    value: IObjectCallable<T, U>;
    constructor(value: IObjectCallable<T, U>);
}
/**
 * Returns a value that is interpreted as a mapper
 * (from the key, old value and object to the new value) in the
 * {@link sets} function.
 *
 * @example
 * import { set, M } from 'deleight/object/members/shared'
 * let obj1 = { a: 20, b: 2, c: 20}, obj2 = { a: 1, b: 20, c: 3};
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 *
 * set(objects, M((obj, key) => obj[key] * 2));
 * console.log(obj1);    // { a: 40, b: 2, c: 40}
 * console.log(obj2);    // { a: 1, b: 40, c: 3}
 *
 * @param value
 * @returns
 */
export declare function M(value: IObjectCallable): Mapper<object, any>;
/**
 * Gets specified properties from different objects.
 *
 * The `map` argument maps property keys to iterables of objects (or functions that return such iterables).
 *
 * @example
 * import { get } from 'deleight/object/members/shared'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * const vals = get(objects);  // { a: [1], b: [2], c: [3] }
 *
 * @param object
 */
export declare function gets<T extends IMembers>(object: T): { [key in keyof T]: Iterable<any>; };
/**
 * Sets specified properties in different objects.
 *
 *
 * @example
 * import { set } from 'deleight/object/members/shared'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * set(objects, 20);
 * console.log(obj1);    // { a: 20, b: 2, c: 20}
 * console.log(obj2);    // { a: 1, b: 20, c: 3}
 *
 * @param object
 * @param value
 */
export declare function sets<T>(object: IMembers, value: T): T;
/**
 * Calls specified methods in multiple objects.
 *
 * @example
 * import { call } from 'deleight/object/members/shared'
 * let arr1 = [1, 2, 3], arr2 = [1, 2, 3], arr3 = [1, 2, 3];
 * const objects = { push: [arr1, arr3], unshift: [arr2] };
 * call(objects, 20, 21);
 * console.log(arr1)   // [1, 2, 3, 20, 21]
 * console.log(arr2)   // [20, 21, 1, 2, 3]
 * console.log(arr3)   // [1, 2, 3, 20, 21]
 *
 * @param object
 * @param args
 */
export declare function calls(object: IMembers, ...args: any[]): any;
/**
 * Deletes specified properties from different objects.
 *
 * @example
 * import { del } from 'deleight/object/members/shared'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * del({ a: [obj1], b: [obj2], c: [obj1] });
 * console.log(obj1);    // { b: 2 }
 * console.log(obj2);    // { a: 1, c: 3}
 *
 * @param object
 */
export declare function dels(object: IMembers): void;
