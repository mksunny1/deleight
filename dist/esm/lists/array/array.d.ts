/**
 * An object which represents an array as a list.
 * A list has a an array-like mutation API with a few extra methods.
 *
 * @module
 */
/**
 * Wraps an array exposing the same mutation API (`push`, `pop`, `unshift`, `shift`, `splice`)
 * and adds a few extra methods namely: `set`, `move`, `swap` and `clear`.
 *
 * @example
 * import { ArrayList } from 'deleight/lists/array';
 * const array = [];
 * const list = new ArrayList(array);
 * list.push(1, 2, 3);
 * console.log(array.length);   // 3
 * list.swap(0, 2);
 * console.log(array);   // [3, 2, 1]
 *
 */
export declare class ArrayList<T> {
    array: T[];
    constructor(array: T[]);
    get length(): number;
    get(index: number): Generator<never, T, unknown>;
    set(index: number, value: T): T;
    push(...items: T[]): number;
    pop(): T;
    unshift(...items: T[]): number;
    shift(): T;
    splice(start: number, deleteCount?: number, ...items: T[]): this | T[];
    swap(from: number, to: number): void;
    move(from: number, to: number): void;
    clear(): void;
    [Symbol.iterator](): Generator<T, void, unknown>;
}
