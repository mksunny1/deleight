/**
 * Functions form manipulating multiple objects at once.
 * 
 * @module
 */

import { map } from "../../../generators/generators.js";
import { IKey } from "../../../types.js";
import { mapValues } from "../../operations/operations.js";
import { forEach } from "../../process/process.js";
import { ownKeys } from "../own/own.js";
import { Mapper } from "./mapper.js";
import { IMembers } from "./types.js";

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
export function* gets<T extends IMembers>(object: T) {
    let targets: IMembers[IKey];
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            yield [key, map(targets as Iterable<any>, target => target[key])];
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            yield [key, getAllAsync(targets as AsyncIterable<any>, key)]
        } else {
            yield [key, mapValues(targets, (targets, subKey) => gets(targets[subKey]))];
        }
    }
}

/**
 * Gets the same property on multiple objects produced by the 
 * async iterable during iteration.
 * 
 * @param targets 
 * @param key 
 * @returns 
 */
async function* getAllAsync<T>(targets: AsyncIterable<any>, key: IKey) {
    for await (let target of targets) {
        yield (target as any)[key]; 
    }
}

/**
 * Sets specified properties in different objects.
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
export function sets<T>(object: IMembers, value: T) {
    let target: any, targets: IMembers[IKey], subKey: IKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, value);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) {
                if (value instanceof Mapper) (target as any)[key] = value.value(target, key);
                else (target as any)[key] = value; 
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            // async sets
            setAllAsync(targets as AsyncIterable<any>, key, value)
        } else { // nested `sets`
            forEach(targets, (targets, subKey) => sets(targets[subKey], value[subKey]));
        }
    }
    return value;
}

/**
 * Sets the same property on multiple objects produced by the 
 * async iterable during iteration.
 * 
 * @param targets 
 * @param key 
 * @param value 
 * @returns 
 */
async function setAllAsync<T>(targets: AsyncIterable<any>, key: IKey, value: T) {
    for await (let target of targets) {
        if (value instanceof Mapper) (target as any)[key] = value.value(target, key);
        else (target as any)[key] = value; 
    }
    return value;
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
export function calls(object: IMembers, ...args: any[]) {
    let targets: IMembers[IKey], target: any;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) target[key](...args);
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            callAllAsync(targets as AsyncIterable<any>, key, ...args)
        } else {
            forEach(targets, (targets, subKey) => calls(targets[subKey], ...args.map(arg => arg[subKey])));
        }
    }
}
/**
 * Calls the same method on multiple objects produced by the 
 * async iterable during iteration.
 * 
 * @param targets 
 * @param key 
 * @param args 
 * @returns 
 */
async function callAllAsync<T>(targets: AsyncIterable<any>, key: IKey, ...args: any[]) {
    for await (let target of targets) {
        (target as any)[key](...args); 
    }
}

/**
 * Calls specified methods in multiple objects to return results.
 * Pending tests
 * 
 * @example
 * 
 * @param object 
 * @param args 
 */
export function* callsFor(object: IMembers, ...args: any[]) {
    let targets: IMembers[IKey], subKey: IKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            yield [key, map(targets as Iterable<any>, target => (target as any)[key](...args))];
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            yield [key, callForAllAsync(targets as AsyncIterable<any>, key, ...args)]
        } else {
            yield [key, mapValues(targets, (targets, subKey) => callsFor(targets[subKey], ...args.map(arg => arg[subKey])))];
        }
    }
}
async function* callForAllAsync<T>(targets: AsyncIterable<any>, key: IKey, ...args: any[]) {
    for await (let target of targets) {
        yield (target as any)[key](...args); 
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
export function dels(object: IMembers) {
    let target: any, targets: IMembers[IKey], subKey: IKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) delete (target as any)[key];
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            delAllAsync(targets as AsyncIterable<any>, key)
        } else {
            forEach(targets, (targets, subKey) => dels(targets[subKey]));
        }
    }
}

/**
 * Deletes the same property on multiple objects produced by the 
 * async iterable during iteration.
 * 
 * @param targets 
 * @param key 
 * @returns 
 */
async function delAllAsync<T>(targets: AsyncIterable<any>, key: IKey) {
    for await (let target of targets) {
        delete (target as any)[key]; 
    }
}

