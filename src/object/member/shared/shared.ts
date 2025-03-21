/**
 * Functions form manipulating multiple objects at once.
 * The functions let you perform object operations like `get`, `set`,
 * `call method` and `delete` in bulk. 
 * 
 * They all support nested operations so that complex reactivity patterns 
 * can be implemented.
 * 
 * Additionally, functions can be supplied in place of any objects (placed 
 * inside the object arg) to perform more arbitrary operations.
 * 
 * The functions are async so we can pass in an iterable or async iterable 
 * (or a function that returns either) as values in the object arg. Awaiting 
 * the promise returned will ensure all the operations complete before  
 * calling code continues.
 * 
 * @module
 */

import { ownKeys } from "../own/own.js";
import { IKey, IReturns } from "../../../types";
import { IObjectCallable } from "../../types";

export type IMember = object | Function;

/**
 * An object mapping member keys to iterables of objects which can can be used as the `object` argument 
 * to {@link gets}, {@link sets}, {@link calls}, {@link callsFor} or {@link dels}. 
 * 
 */
export type IMembers = { [key: IKey]: Iterable<IMember> | AsyncIterable<IMember> | {[key: IKey]: IMembers} | IReturns<Iterable<IMember> | AsyncIterable<IMember> | {[key: IKey]: IMembers}> };

export const I = Symbol();

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
 * import { set, M } from 'deleight/object/sharedmember'
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
 * import { get } from 'deleight/object/shared'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * const vals = get(objects);  // { a: [1], b: [2], c: [3] }
 * 
 * @param object 
 */
export async function* gets<T extends IMembers>(object: T) {
    let targets: IMembers[IKey], subKey: IKey, vals: any[];
    for (let key of ownKeys(object)) {
        targets = object[key];

        if (key === I) {
            for await (let value of gets(targets as IMembers)) yield value;
            continue;
        }

        if (targets instanceof Function) targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (let target of targets as Iterable<any>) {
                if (target instanceof Function) {
                    yield [key, target(key)]; 
                } else yield [key, target[key]]; 
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                if (target instanceof Function) {
                    yield [key, target(key)]; 
                } else yield [key, target[key]]; 
            }
        } else {
            for await (vals of gets(targets as IMembers)) {
                yield [key, ...vals];
            }
        }
    }
}

/**
 * Sets specified properties in different objects. 
 * 
 * Both simple and complex values can be set to implement any form of 
 * reactivity we want. 
 * 
 * 
 * @example
 * import { set } from 'deleight/object/shared'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const objects = { a: [obj1], b: [obj2], c: [obj1] };
 * set(objects, 20);
 * console.log(obj1);    // { a: 20, b: 2, c: 20}
 * console.log(obj2);    // { a: 1, b: 20, c: 3}
 * 
 * @param object 
 * @param value 
 */
export async function sets<T>(object: IMembers, value: T) {
    let target: any, targets: IMembers[IKey], subKey: IKey;
    const promises: Promise<any>[] = [];

    for (let key of ownKeys(object)) {
        targets = object[key];

        if (key === I) {
            promises.push(sets(targets as IMembers, value));
            continue;
        }

        if (targets instanceof Function) targets = targets(object, key, value);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) {
                if (target instanceof Function) {
                    target(key, value); 
                } else {
                    if (value instanceof Mapper) target[key] = value.value(target, key);
                    else target[key] = value; 
                }
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            // async sets
            for await (let target of targets as AsyncIterable<any>) {
                if (target instanceof Function) {
                    target(key, value); 
                } else {
                    if (value instanceof Mapper) target[key] = value.value(target, key);
                    else target[key] = value; 
                }
            }
        } else {  // nested `sets`
            promises.push(sets(targets as IMembers, value[key]));
        }

    }
    await Promise.all(promises);
}

/**
 * Calls specified methods in multiple objects.
 * 
 * @example
 * import { call } from 'deleight/object/shared'
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
export async function calls(object: IMembers, ...args: any[]) {
    let targets: IMembers[IKey], target: any, subKey: IKey;
    const promises: Promise<any>[] = [];

    for (let key of ownKeys(object)) {
        targets = object[key];

        if (key === I) {
            promises.push(calls(targets as IMembers, ...args));
            continue;
        }

        if (targets instanceof Function) targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) {
                if (target instanceof Function) target(...args);
                else target[key](...args);
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                if (target instanceof Function) target(...args);
                else target[key](...args); 
            }
        } else {
            const subArgs = args.map(arg => arg[subKey]);
            promises.push(calls(targets as IMembers, ...subArgs));
        }
    }
    await Promise.all(promises);
}

/**
 * Calls specified methods in multiple objects to return results.
 * Returns an async iterable of key-result pairs where each key 
 * can be paired with multiple results, depending on the input map.
 * 
 * Nested calls will have multiple keys before their results.
 * 
 * @example
 * 
 * @param object 
 * @param args 
 */
export async function* callsFor(object: IMembers, ...args: any[]) {
    let targets: IMembers[IKey], subKey: IKey, vals: any[];
    for (let key of ownKeys(object)) {
        targets = object[key];

        if (key === I) {
            for await (let value of callsFor(targets as IMembers, ...args)) yield value;
            continue;
        }

        if (targets instanceof Function) targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (let target of targets as Iterable<any>) {
                if (target instanceof Function) yield [key, target(...args)];
                else yield [key, target[key](...args)]; 
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                if (target instanceof Function) yield [key, target(...args)];
                else yield [key, (target as any)[key](...args)]; 
            }
        } else {
            const subArgs = args.map(arg => arg[subKey]);
            for await (vals of callsFor(targets as IMembers, ...subArgs)) {
                yield [key, ...vals];
            }
        }
    }
}

/**
 * Deletes specified properties from different objects.
 * 
 * @example
 * import { del } from 'deleight/object/shared'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * del({ a: [obj1], b: [obj2], c: [obj1] });
 * console.log(obj1);    // { b: 2 }
 * console.log(obj2);    // { a: 1, c: 3}
 * 
 * @param object 
 */
export async function dels(object: IMembers) {
    let target: any, targets: IMembers[IKey], subKey: IKey;
    const promises: Promise<any>[] = [];
    for (let key of ownKeys(object)) {
        targets = object[key];

        if (key === I) {
            promises.push(dels(targets as IMembers));
            continue;
        }

        if (targets instanceof Function) targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) {
                if (target instanceof Function) target(key);
                else delete target[key];
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                if (target instanceof Function) target(key);
                else delete (target as any)[key]; 
            }
        } else {
            promises.push(dels(targets as IMembers));
        }
    }
    await Promise.all(promises);
}
