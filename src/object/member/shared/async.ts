/**
 * Async versions of the functions in shared module. Pending tests
 * 
 * @module
 */

import { map } from "../../../generators/generators.js";
import { IKey } from "../../../types.js";
import { ownKeys } from "../own/own.js";
import { Mapper } from "./mapper.js";
import { IMembers } from "./types.js";

/**
 * Async equivalent of {@link gets}. This function returns an AsyncGenerator 
 * that yields key-value pairs for all retrieved properties. 
 * 
 * The same key will be returned multiple times with the different values 
 * obtained from each of the values of the iterable or async iterable it 
 * was mapped to in the input object.
 * 
 * Nested gets will have multiple keys preceding the value.
 * 
 * @example
 * 
 * 
 * @param object 
 */
export async function* getsAsync<T extends IMembers>(object: T) {
    let targets: IMembers[IKey], subKey: IKey, value: any[];
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            yield [key, map(targets as Iterable<any>, target => target[key])];
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                yield [key, target[key]]; 
            }
        } else {
            for (subKey of ownKeys(targets)) {
                for await (value of getsAsync(targets[subKey])) {
                    yield [key, ...value]
                }
            }
        }
    }
}

/**
 * Async equivalent of {@link sets}. This function returns a promise 
 * that only resolves after all sets (including async ones) have been 
 * done.
 * 
 * @example
 * 
 * @param object 
 * @param value 
 */
export async function setsAsync<T>(object: IMembers, value: T) {
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
            for await (let target of targets as AsyncIterable<any>) {
                if (value instanceof Mapper) (target as any)[key] = value.value(target, key);
                else (target as any)[key] = value; 
            }
        } else {
            for (subKey of ownKeys(targets)) {
                await setsAsync(targets[subKey], value[subKey]);
            }
        }
    }
    return value;
}

/**
 * Async equivalent of {@link calls} which returns a promise that 
 * only resolves after all methods (including async ones) have been 
 * called.
 * 
 * @example
 * 
 * 
 * @param object 
 * @param args 
 */
export async function callsAsync(object: IMembers, ...args: any[]) {
    let targets: IMembers[IKey], target: any, subKey: IKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) {
                target[key](...args); 
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                target[key](...args); 
            }
        } else {
            for (subKey of ownKeys(targets)) {
                await callsAsync(targets[subKey], ...args.map(arg => arg[subKey]));
            }
        }
    }
}

/**
 * Async equivalent of {@link callsFor}.
 * 
 * Calls specified methods in multiple objects to return results.
 * This returns an async generator similar to the one returned by 
 * {@link getsAsync}
 * 
 * @example
 * 
 * @param object 
 * @param args 
 */
export async function* callsForAsync(object: IMembers, ...args: any[]) {
    let targets: IMembers[IKey], subKey: IKey, value: any;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (let target of targets as Iterable<any>) {
                yield [key, target[key](...args)]; 
            }
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                yield [key, target[key](...args)]; 
            }
        } else {
            for (subKey of ownKeys(targets)) {
                for await (value of callsForAsync(targets[subKey])) {
                    yield [key, ...value]
                }
            }
        }
    }
}

/**
 * Async equivalent of {@link dels}. This function returns a promise 
 * that only resolves after all deletes (including async ones) have been 
 * done.
 * 
 * @example
 * 
 * @param object 
 */
export async function delsAsync(object: IMembers) {
    let target: any, targets: IMembers[IKey], subKey: IKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function) targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets as Iterable<any>) delete (target as any)[key];
        } else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets as AsyncIterable<any>) {
                delete (target as any)[key]; 
            }
        } else {
            for (subKey of ownKeys(targets)) {
                await delsAsync(targets[subKey]);
            }
        }
    }
}

