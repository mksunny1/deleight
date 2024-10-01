/**
 * Converts string keys that contain only a single number into the
 * cumber before returning. Number and symbol keys are returned the same.
 *
 * @param value
 * @returns
 */
export declare function realKey(value: string | number | symbol): string | number | symbol;
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
export declare function ownKeys(object: object): Generator<string | number | symbol, void, unknown>;
/**
 * Create strings from property accesses (so they appear like
 * variables in the code).
 */
export declare const ownKey: any;
export declare const ok: any;
