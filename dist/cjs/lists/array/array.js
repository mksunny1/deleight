"use strict";
/**
 * An object which represents an array as a list.
 * A list has a an array-like mutation API with a few extra methods.
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArrayList = void 0;
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
class ArrayList {
    constructor(array) {
        this.array = array;
    }
    ;
    get length() {
        return this.array.length;
    }
    *get(index) {
        if (index < 0)
            index = this.length + index;
        return this.array[index];
    }
    set(index, value) {
        if (index >= this.array.length)
            return;
        this.array[index] = value;
        return value;
    }
    ;
    push(...items) {
        return this.array.push(...items);
    }
    ;
    pop() {
        return this.array.pop();
    }
    ;
    unshift(...items) {
        return this.array.unshift(...items);
    }
    ;
    shift() { return this.array.shift(); }
    ;
    splice(start, deleteCount, ...items) {
        if (deleteCount === undefined)
            deleteCount = this.array.length - start;
        if (start + deleteCount - 1 >= this.array.length)
            return this;
        return this.array.splice(start, deleteCount, ...items);
    }
    ;
    swap(from, to) {
        if (from >= this.array.length || to >= this.array.length)
            return;
        [this.array[from], this.array[to]] = [this.array[to], this.array[from]];
    }
    ;
    move(from, to) {
        if (from >= this.array.length || to >= this.array.length)
            return;
        this.array.splice(to, 0, ...this.array.splice(from, 1));
    }
    ;
    clear() {
        this.array.length = 0;
    }
    ;
    *[Symbol.iterator]() {
        for (let item of this.array)
            yield item;
    }
}
exports.ArrayList = ArrayList;
