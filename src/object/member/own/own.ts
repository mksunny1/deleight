import { IKey } from "../../../types.js";

/**
 * Converts string keys that contain only a single number into the 
 * cumber before returning. Number and symbol keys are returned the same.
 * 
 * @param value 
 * @returns 
 */
export function realKey(value: string | number | symbol) {
    if (typeof value !== 'string') return value;
    const n = parseInt(value as string);
    if (!isNaN(n)) return n;
    return value;
}

/**
 * Like `Reflect.ownKeys` but returns numbers as 'number' type instead 
 * of 'string' type. Also please note that this method returns a generator 
 * instead of an Array. Finally, the method will only return indices from 0 to 
 * `object.length` when the object is an iterable with a `length` property 
 * (such as an Array or NodeList)...
 * 
 * @example
 * 
 * 
 * @param object 
 */
export function* ownKeys(object: object) {
    let key: IKey;
    if (Reflect.has(object, Symbol.iterator) && Reflect.has(object, 'length')) for (let i = 0; i < (object as any).length; i++) yield i;
    else for (key of Reflect.ownKeys(object)) yield realKey(key);
}

/**
 * Create strings from property accesses (so they appear like 
 * variables in the code).
 */
export const ownKey = new Proxy({}, {
    get(target: any, p: IKey) {
        return realKey(p);
    }
})
export const ok = ownKey;

