/**
 * @module deleight/generational
 *
 * This module exports many useful generators like `range` and `repeat`.
 */
/**
 * Forcs any iterable to become an iterator. Will throw
 * if not possible.
 *
 * @example
 * import { iter } from 'deleight/generational';
 * const it = iter([1, 2, 3, 4, 5]);
 *
 * @param { any } it
 */
export function iter(it) {
    return (it.next) ? it : it[Symbol.iterator]();
}
/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 * import { range } from 'deleight/generational';
 * const arr1000 = [...range(0, 1000)];
 * // creates an array with 1000 items counting from 0 to 999.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 */
export function* range(start, end, step) {
    if (!step)
        step = 1;
    if ((end === undefined || end === null) && start) {
        end = start;
        start = 0;
    }
    for (let i = start; i < end; i += step)
        yield i;
}
/**
 * Returns a generator which iterates over the subset of the
 * 'arrayLike' object that matches the provided index.
 *
 * @example
 * import { items, range } from 'deleight/generational';
 * const tenth = []...items(range(1000), range(0, 1000, 10))];
 * // selects every 10th item in the array.
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
export function* items(arrayLike, index) {
    for (let i of index)
        yield arrayLike[i];
}
/**
 * Returns a generator that yields first argument (`what`) the number of
 * times specified by the second argument (`times`). If `times` is not
 * given, `what` is repeated indefinitely.
 *
 * @example
 * import { repeat } from 'deleight/generational';
 * const repeated = [...repeat([1, 2, 3], 4)];
 * // [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]
 *
 * @param {Iterable<any>} what
 * @param {number} [times]
 */
export function* repeat(what, times) {
    let item;
    if (times === undefined) {
        const what2 = [];
        for (let item of what) {
            what2.push(item);
            yield item;
        }
        while (true)
            for (item of what2)
                yield item;
    }
    else
        for (let i = 0; i < times; i++)
            for (item of what)
                yield item;
}
/**
 * Returns an iterator over the next 'count' items of the iterator.
 *
 * Note that, for performance reasons, this only accepts an
 * iterator as the 'it' argument. All the other module functions accept
 * iterables.
 *
 * You can convert any iterable to an iterator using the `iter` funtion
 * as shown in the following example.
 *
 * If a firstValue is specified, it will be yielded first.
 *
 * @example
 * import { nextItems, iter } from 'deleight/generational';
 * const it = iter([1, 'a', 2, 'b', 3, 'c', 4, 'd']);
 * const [num, let] = next(it, 2);
 *
 * @param {Iterator<any>} it
 * @param {number} count
 * @param { any } [firstValue]
 */
export function* next(it, count, firstValue) {
    let count2 = count;
    if (firstValue) {
        yield firstValue;
        count2--;
    }
    while (count2-- > 0)
        yield it.next().value;
}
/**
 * Returns an iterator of iterators over the next 'count' items of
 * the given iterable
 *
 * @example
 * import { next } from 'deleight/generational';
 * const o1 = [1, 2, 3, 4];
 * const o2 = ['a', 'b', 'c', 'd'];
 * const zip = group(flat(o1, o2), 2);
 *
 * @param { Iterable<any> } it
 * @param { number } count
 */
export function* group(it, count) {
    const it2 = iter(it);
    let nextItem = it2.next();
    while (!nextItem.done) {
        yield [...next(it2, count, nextItem.value)];
        nextItem = it2.next();
    }
}
/**
 * Returns an iterator over the items of all the input iterators, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the multiple of the length of thr smallest
 * iterator and the number of iterators (number of args).
 *
 * Can be used to join arrays in a way no supported by `concat`, `push`, etc.
 * To pass an array as an iterator, call array.values().
 *
 * @example
 * import { flat } from 'deleight/generational';
 * for (let i of flat(range(10, range(15)))) {
 *      console.log(i);    // 0, 0, 1, 1, 2, 2, .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...any[]} args
 */
export function* flat(...args) {
    const count = args.length;
    args = args.map(arg => iter(arg));
    let i, nextItem;
    while (true) {
        for (i = 0; i < count; i++) {
            nextItem = args[i].next();
            if (nextItem.done)
                return;
            else
                yield nextItem.value;
        }
    }
}
/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 * import { uItems } from 'deleight/generational';
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param {Iterable<any>} it
 */
export function* uItems(it) {
    const arr = [...it];
    for (let i = arr.length - 1; i >= 0; i--) {
        yield arr.splice(Math.round(Math.random() * i), 1)[0];
    }
}
/**
 * Call to get the length of an object. The object must either
 * have a length property of be previously passed in a call to`setLength`.
 *
 * @example
 * import { getLength, setLength } from 'deleight/generational';
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} it
 */
export function getLength(it) {
    return iterLengths.get(it) || it.length;
}
/**
 * Stores the 'fake' lenghts of iterables passed in calls to `setLength`.
 * Can also be modified manually.
 */
export const iterLengths = new WeakMap();
/**
 * Attaches a 'fake' length to an object (likely iterable or iterator)
 * which does not have a length property, so that it can work well with
 * functions that use `getLength`.
 *
 * @example
 * import { getLength, setLength } from 'deleight/generational';
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} it
 */
export function setLength(it, length) {
    iterLengths.set(it, length);
    return it;
}
