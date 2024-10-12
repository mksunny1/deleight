/**
 * Used to transform property keys and existing values to replacement
 * values in the {@link sets} function.
 */
export class Mapper {
    constructor(value) {
        this.value = value;
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
export function M(value) {
    return new Mapper(value);
}
