/**
 * Functions for using objects to perform different tasks. Here  
 * objects contain actions to run or things to interpret.
 * 
 * API Table of Contents
 * 
 * 
 * @module
 */

import { ICallable, IKey } from "../../types.js";
import { ownKeys } from "../member/own/own.js";

export type IAction = IActions | ICallable
export type IActions = {
    [key: IKey]: IAction | Iterable<IAction>;
}

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
 * import { apply } from 'deleight/object/apply'
 * const object = { a: 1, b: 2, c: { d: 4, e: 5 } };
 * const f1 = (obj, key) => obj[key] *= 2;
 * const f2 = (obj, key) => obj[key] *= 3;
 * const f3 = (obj, key) => console.log(key, obj[key]);
 * 
 * apply({ a: f1, c: { d: f3, e: f2 } }, object);
 * // object === { a: 2, b: 2, c: { d: 4, e: 15 } };
 * 
 * @param actions 
 * @param target 
 * @param options
 * 
 * @returns 
 */
export function apply<T, U extends any[] = any[]>(actions: IActions, target: T, options?: IApplyOptions<U>) {
    let nextTarget: any, keyActions: IAction | Iterable<IAction>, 
    keyActionsIt: Iterable<IAction>, action: IAction;

    const args = options?.args || [] as U;
    const getter = options?.getter;
    for (let key of ownKeys(actions)) {
        keyActions = actions[key];
        if (!(Reflect.has(keyActions, Symbol.iterator))) keyActionsIt = [keyActions as IAction];
        else keyActionsIt = keyActions as Iterable<IAction>;
        for (action of keyActionsIt) {
            if (action instanceof Function) {
                nextTarget = action(target, key, ...args);
                if (nextTarget !== undefined) apply(actions, nextTarget, options);
            } else if (typeof action === 'object') {
                if (getter instanceof Function) {
                    nextTarget = getter(target, key);
                } else if (typeof target === 'object') {
                    nextTarget = target[key];
                } else{
                    nextTarget = undefined;
                }
                if (nextTarget !== undefined) apply(action, nextTarget, options);
            } else {
    
            }
        }
    }
    return target;
}
