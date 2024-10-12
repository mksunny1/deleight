/**
 * Async versions of the functions in shared module. Pending tests
 *
 * @module
 */
import { map } from "../../../generators/generators.js";
import { ownKeys } from "../own/own.js";
import { Mapper } from "./mapper.js";
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
export async function* getsAsync(object) {
    let targets, subKey, value;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            yield [key, map(targets, target => target[key])];
        }
        else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets) {
                yield [key, target[key]];
            }
        }
        else {
            for (subKey of ownKeys(targets)) {
                for await (value of getsAsync(targets[subKey])) {
                    yield [key, ...value];
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
export async function setsAsync(object, value) {
    let target, targets, subKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key, value);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets) {
                if (value instanceof Mapper)
                    target[key] = value.value(target, key);
                else
                    target[key] = value;
            }
        }
        else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets) {
                if (value instanceof Mapper)
                    target[key] = value.value(target, key);
                else
                    target[key] = value;
            }
        }
        else {
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
export async function callsAsync(object, ...args) {
    let targets, target, subKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets) {
                target[key](...args);
            }
        }
        else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets) {
                target[key](...args);
            }
        }
        else {
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
export async function* callsForAsync(object, ...args) {
    let targets, subKey, value;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key, ...args);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (let target of targets) {
                yield [key, target[key](...args)];
            }
        }
        else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets) {
                yield [key, target[key](...args)];
            }
        }
        else {
            for (subKey of ownKeys(targets)) {
                for await (value of callsForAsync(targets[subKey])) {
                    yield [key, ...value];
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
export async function delsAsync(object) {
    let target, targets, subKey;
    for (let key of ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(object, key);
        if (Reflect.has(targets, Symbol.iterator)) {
            for (target of targets)
                delete target[key];
        }
        else if (Reflect.has(targets, Symbol.asyncIterator)) {
            for await (let target of targets) {
                delete target[key];
            }
        }
        else {
            for (subKey of ownKeys(targets)) {
                await delsAsync(targets[subKey]);
            }
        }
    }
}
