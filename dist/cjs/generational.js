'use strict';

/**
 * This module exports many useful generators like `range` and `repeat`.
 */
/**
 * Forcs any iterable to become an iterator. Will throw
 * if not possible.
 *
 * @example
 * import { iter } from 'deleight/generationsl';
 * const it = iter([1, 2, 3, 4, 5]);
 *
 * @param { any } it
 */
function iter(it) {
    return (it.next) ? it : it[Symbol.iterator]();
}
/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 * import { range } from 'deleight/generationsl';
 * const arr1000 = [...range(0, 1000)];
 * // creates an array with 1000 items counting from 0 to 999.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 */
function* range(start, end, step) {
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
 * import { items, range } from 'deleight/generationsl';
 * const tenth = []...items(range(1000), range(0, 1000, 10))];
 * // selects every 10th item in the array.
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
function* items(arrayLike, index) {
    for (let i of index)
        yield arrayLike[i];
}
/**
 * Returns a generator that yields first argument (what) the number of
 * times specified by the second argument (times).
 *
 * @example
 * import { repeat } from 'deleight/generationsl';
 * const repeated = [...repeat([1, 2, 3], 4)];
 * // [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]
 *
 * @param {Iterable<any>} what
 * @param {number} times
 */
function* repeat(what, times) {
    let item;
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
 * import { nextItems, iter } from 'deleight/generationsl';
 * const it = iter([1, 'a', 2, 'b', 3, 'c', 4, 'd']);
 * const [num, let] = next(it, 2);
 *
 * @param {Iterator<any>} it
 * @param {number} count
 * @param { any } [firstValue]
 */
function* next(it, count, firstValue) {
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
 * import { next } from 'deleight/generationsl';
 * const o1 = [1, 2, 3, 4];
 * const o2 = ['a', 'b', 'c', 'd'];
 * const zip = group(flat(o1, o2), 2);
 *
 * @param { Iterable<any> } it
 * @param { number } count
 */
function* group(it, count) {
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
 * import { flat } from 'deleight/generationsl';
 * for (let i of flat(range(10, range(15)))) {
 *      console.log(i);    // 0, 0, 1, 1, 2, 2, .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...any[]} args
 */
function* flat(...args) {
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
 * import { uItems } from 'deleight/generationsl';
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param {Iterable<any>} it
 */
function* uItems(it) {
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
 * import { getLength, setLength } from 'deleight/generationsl';
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} it
 */
function getLength(it) {
    return iterLengths.get(it) || it.length;
}
/**
 * Stores the 'fake' lenghts of iterables passed in calls to `setLength`.
 * Can also be modified manually.
 */
const iterLengths = new WeakMap();
/**
 * Attaches a 'fake' length to an object (likely iterable or iterator)
 * which does not have a length property, so that it can work well with
 * functions that use `getLength`.
 *
 * @example
 * import { getLength, setLength } from 'deleight/generationsl';
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} it
 */
function setLength(it, length) {
    iterLengths.set(it, length);
    return it;
}

exports.flat = flat;
exports.getLength = getLength;
exports.group = group;
exports.items = items;
exports.iter = iter;
exports.iterLengths = iterLengths;
exports.next = next;
exports.range = range;
exports.repeat = repeat;
exports.setLength = setLength;
exports.uItems = uItems;
