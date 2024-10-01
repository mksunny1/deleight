import { IKey, IReturns } from "../../../types.js";
import { IObjectCallable } from "../../types.js";
import { ownKeys } from "../own/own.js";

/**
 * An object mapping member keys to iterables of objects which can can be used as the `object` argument 
 * to {@link gets}, {@link sets}, {@link calls} or {@link dels}. 
 * 
 */
export type IMembers<T = any> = { [key: IKey]: Iterable<T> | IReturns<Iterable<T>> };

/**
 * Used to transform property keys and existing values to replacement 
 * values in the {@link sets} function.
 */
export class Mapper<T = any, U = any> {
    value: IObjectCallable<T, U>;
    constructor(value: IObjectCallable<T, U>) {
        this.value = value
    }
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
export function M(value: IObjectCallable) {
    return new Mapper(value);
}

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
export function gets<T extends IMembers>(object: T) {
    const results: {[key in keyof typeof object]: Iterable<any>} = {} as any;
    let targets: IMembers[IKey];
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key);
        if (targets instanceof Array) {
            (results[key] as any) = targets.map(val => val[key]);
        } else {
            (results[key] as any) = getIter(key, targets);
        }
    }
    return results;
}
function* getIter(key: IKey, targets: Iterable<any>) {
    for (let target of targets) yield (target as any)[key];
}

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
export function sets<T>(object: IMembers, value: T) {
    let target: any, targets: IMembers[IKey];
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, value);
        for (target of targets) {
            if (value instanceof Mapper) (target as any)[key] = value.value(target, key);
            else (target as any)[key] = value; 
        }
    }
    return value;
}

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
export function calls(object: IMembers, ...args: any[]) {
    let target: any, targets: IMembers[IKey], result: any;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, ...args);
        for (target of targets) {
            result = (target as any)[key](...args);
        }
    }
    return result;
}

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
export function dels(object: IMembers) {
    let target: any, targets: IMembers[IKey];
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key);
        for (target of targets) delete (target as any)[key];
    }
}

