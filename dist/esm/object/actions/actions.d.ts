/**
 * Functions for using objects to perform different tasks. Here
 * objects contain actions to run or things to interpret.
 *
 * API Table of Contents
 *
 *
 * @module
 */
import { ICallable, IKey, IReturns } from "../../types";
import { IObjectCallable } from "../types";
/**
 * An object mapping member keys to iterables of objects which can can be used as the `actions` argument
 * to {@link call}, {@link set} or {@link del}.
 * It may also be an {@link F} object which returns an iterable of objects.
 *
 */
export type IMembers<T = any> = {
    [key: IKey]: Iterable<T> | IReturns<Iterable<T>>;
};
export type IAction = IActions | ICallable;
export type IActions = {
    [key: IKey]: IAction | Iterable<IAction>;
};
/**
 * Optional arguments to {@link apply}
 */
export interface IApplyOptions<T extends any[] = any[]> {
    /**
     * Optional function to obtain a property from a target
     */
    getter?: (target: any, key: IKey) => any;
    /**
     * Optional extra args to the apply actions.
     */
    args?: T;
}
/**
 * Used to transform property keys and existing values to replacement
 * values in the {@link set} function.
 */
declare class Mapper<T = any, U = any> {
    value: IObjectCallable<T, U>;
    constructor(value: IObjectCallable<T, U>);
}
/**
 * Returns a value that is interpreted as a mapper
 * (from the key, old value and object to the new value) in the
 * {@link set} function.
 *
 * @example
 * import { set, M } from 'deleight/object/actions'
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
 * Performs the specified action with all object keys.
 *
 * If the action returns an object type, Process will be
 * called again with it.
 *
 * Extra arguments to be passed to the action (after the object and key)
 * can be specified with extra optional arguments to Process.
 *
 *
 * @example
 * import { process } from 'deleight/object/actions'
 * let count = 0;
 * process({ a: 1, b: 2, c: 3 }, (obj, key) => count += (obj[key] * obj[key]));
 * console.log(count)    // 14
 *
 * @param object
 * @param action
 * @param args
 */
export declare function process<T extends object, U = any>(object: T, action: IObjectCallable<T, U>, ...args: any[]): T;
/**
 * Performs the actions given as object property values with the specified target and
 * the corresponding property key. If an action returns a value, the value will
 * be used as target for a recursive call with the same actions.
 *
 * If an action (property value) is an object
 * instead of a function then Apply is called again with the action as the !st
 * argument (actions) and the property of the target bearing the same key as the
 * 2nd argument (target).
 *
 * A getter may be supplied (as the `get` property of the `options` argument) to
 * obtain properties from the target. This may be
 * necessary when the property to obtain is not a simple property of the
 * target object, or the target is not even an object in the first place. The
 * getter will be called with the target and the property key to return a
 * value which Apply assumes to be the target's property with that key.
 *
 * Extra arguments to the actions may also be supplied (as the `args` property
 * of the `options` argument). This can help to reuse the same functions needed
 * when implementing other functions that use Apply in their operations.
 *
 * @example
 * import { apply } from 'deleight/object/actions'
 * const object = { a: 1, b: 2, c: { d: 4, e: 5 } };
 * const f1 = (obj, key) => obj[key] *= 2;
 * const f2 = (obj, key) => obj[key] *= 3;
 * const f3 = (obj, key) => console.log(key, obj[key]);
 *
 * apply({ a: f1, c: { d: f3, e: f2 } }, object);
 * // object === { a: 2, b: 2, c: { d: 4, e: 15 } };
 *
 * @param object
 * @param target
 * @param options
 *
 * @returns
 */
export declare function apply<T, U extends any[] = any[]>(actions: IActions, target: T, options?: IApplyOptions<U>): T;
/**
 * Gets specified properties from different objects.
 *
 * The `map` argument maps property keys to iterables of objects (or {@link F objects}).
 *
 * @example
 * import { get } from 'deleight/object/actions'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * const vals = get(objects);  // { a: [1], b: [2], c: [3] }
 *
 * @param object
 * @param value
 */
export declare function get<T extends IMembers>(object: T): { [key in keyof T]: Iterable<any>; };
/**
 * Sets specified properties in different objects.
 *
 *
 * @example
 * import { set } from 'deleight/object/actions'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * set(objects, 20);
 * console.log(obj1);    // { a: 20, b: 2, c: 20}
 * console.log(obj2);    // { a: 1, b: 20, c: 3}
 *
 * @param object
 * @param value
 */
export declare function set<T>(object: IMembers, value: T): T;
/**
 * Calls specified methods in multiple objects.
 *
 * @example
 * import { call } from 'deleight/object/actions'
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
export declare function call(object: IMembers, ...args: any[]): any;
/**
 * Deletes specified properties from different objects.
 *
 * @example
 * import { del } from 'deleight/object/actions'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * del({ a: [obj1], b: [obj2], c: [obj1] });
 * console.log(obj1);    // { b: 2 }
 * console.log(obj2);    // { a: 1, c: 3}
 *
 * @param object
 */
export declare function del(object: IMembers): void;
export {};
