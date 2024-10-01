/**
 * Functions for using objects to perform different tasks. Here
 * objects contain actions to run or things to interpret.
 *
 * API Table of Contents
 *
 *
 * @module
 */
/**
 * Used to transform property keys and existing values to replacement
 * values in the {@link set} function.
 */
class Mapper {
    constructor(value) {
        this.value = value;
    }
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
export function M(value) {
    return new Mapper(value);
}
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
export function process(object, action, ...args) {
    let nextObject;
    for (let key of Reflect.ownKeys(object)) {
        nextObject = action(object, key, ...args);
        if (typeof nextObject === 'object')
            process(nextObject, action, ...args);
    }
    return object;
}
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
export function apply(actions, target, options) {
    let nextTarget, keyActions, keyActionsIt, action;
    const args = options?.args || [];
    const getter = options?.getter;
    for (let key of Reflect.ownKeys(actions)) {
        keyActions = actions[key];
        if (!(Reflect.has(keyActions, Symbol.iterator)))
            keyActionsIt = [keyActions];
        else
            keyActionsIt = keyActions;
        for (action of keyActionsIt) {
            if (action instanceof Function) {
                nextTarget = action(target, key, ...args);
                if (typeof nextTarget !== undefined)
                    apply(actions, nextTarget, options);
            }
            else if (typeof action === 'object') {
                if (getter instanceof Function) {
                    nextTarget = getter(target, key);
                }
                else if (typeof target === 'object') {
                    nextTarget = target[key];
                }
                else {
                    nextTarget = undefined;
                }
                if (nextTarget !== undefined)
                    apply(action, nextTarget, options);
            }
            else {
            }
        }
    }
    return target;
}
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
export function get(object) {
    const results = {};
    let targets;
    for (let key of Reflect.ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(key);
        if (targets instanceof Array) {
            results[key] = targets.map(val => val[key]);
        }
        else {
            results[key] = getIter(key, targets);
        }
    }
    return results;
}
function* getIter(key, targets) {
    for (let target of targets)
        yield target[key];
}
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
export function set(object, value) {
    let target, targets;
    for (let key of Reflect.ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(key);
        for (target of targets) {
            if (value instanceof Mapper)
                target[key] = value.value(target, key);
            else
                target[key] = value;
        }
    }
    return value;
}
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
export function call(object, ...args) {
    let target, targets, result;
    for (let key of Reflect.ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(key, ...args);
        for (target of targets) {
            result = target[key](...args);
        }
    }
    return result;
}
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
export function del(object) {
    let target, targets;
    for (let key of Reflect.ownKeys(object)) {
        targets = object[key];
        if (targets instanceof Function)
            targets = targets(key);
        for (target of targets)
            delete target[key];
    }
}
