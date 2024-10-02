"use strict";
/**
 * This module exports many useful generators for JS applications.
 * There are generators for most array methods like `map` and `filter`,
 * along many those drawn from other languages that make heavy use
 * of generators, like Python.
 *
 * Generators are very useful for improving performance as they help to
 * avoid wasteful computations and storage. They were important factors
 * in the speed and memory efficiency of some of the best performing
 * libraries in the
 * [JS framework benchmarks](https://github.com/krausest/js-frameworks-benchmark)
 *
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.random = exports.zip = exports.zipFlat = exports.forNext = exports.next = exports.repeat = exports.items = exports.range = exports.forceIterator = exports.chain = exports.reduce = exports.filter = exports.map = exports.forEachAsync = exports.forEach = void 0;
/**
 * Performs the given action for all items of the iterable.
 *
 * @example
 * import { forEach } from 'deleight/generators';
 * forEach(range(10), ()=> console.log(i));
 *
 * @param it
 * @param action
 */
function forEach(it, action) {
    let i = 0;
    for (let item of it)
        action(item, i++);
}
exports.forEach = forEach;
/**
 * Performs the given action for all items of the async iterable.
 *
 * @example
 * import { forEachAsync } from 'deleight/generators';
 * async function* asyncGen() {
 *    for (let i of (range(10))) yield i;
 * }
 * forEachAsync(asyncGen(), ()=> console.log(i));
 *
 * @param it
 * @param action
 */
async function forEachAsync(it, action) {
    let i = 0;
    for await (let item of it)
        action(item, i++);
}
exports.forEachAsync = forEachAsync;
/**
 * Maps the values of the iterable to other values using the given mapper.
 *
 * @example
 * import { map } from 'deleight/generators';
 * map(range(10), i=> 2 * i);
 *
 * @param it
 * @param mapper
 */
function* map(it, mapper) {
    let i = 0;
    for (let item of it)
        yield mapper(item, i++);
}
exports.map = map;
/**
 * Filters the values of the iterable using the given test function.
 *
 * @example
 * import { filter } from 'deleight/generators';
 * filter(range(10), i=> 2 < i);
 *
 * @param it
 * @param test
 */
function* filter(it, test) {
    let i = 0;
    for (let item of it)
        if (test(item, i++))
            yield item;
}
exports.filter = filter;
/**
 * Reduces the iterable using the given reducer function.
 *
 * @example
 * import { reduce } from 'deleight/generators';
 * reduce(range(10), ((r, i) => r * i), 3);
 *
 * @param it
 * @param reducer
 */
function reduce(it, reducer, value) {
    let i = 0;
    for (let item of it)
        value = reducer(value, item, i++);
    return value;
}
exports.reduce = reduce;
/**
 * Chains multiple iterables...
 *
 * @example
 * import { chain } from 'deleight/generators';
 * for (let i of chain(range(10), range(15))) {
 *      console.log(i);    // 0, 1, 2, 3,...9, 0, 1, 2, ..., 14
 * }
 *
 * @param its
 */
function* chain(...its) {
    let item;
    for (let arg of its) {
        for (item of arg)
            yield item;
    }
}
exports.chain = chain;
/**
 * All combinations of items from each input iterable.
 *
 * @example
 *
 *
 * @param its
 */
function* product(...its) {
    const breaker = Symbol();
    const its2 = its.map(arg => repeat(arg, -1, breaker));
    let c2 = its.length - 1, c1;
    let it, value;
    let item = its2.map(it => it.next().value);
    for (let value of item)
        if (value === breaker)
            return; // empty.
    while (true) {
        yield item;
        it = its2[c2];
        while ((value = it.next().value) !== breaker) {
            item[c2] = value;
            yield item;
        }
        c1 = c2;
        do {
            it = its2[--c1];
            value = it.next().value;
        } while (value === breaker && c1 > 0);
        if (c1 >= 0 && value !== breaker)
            item[c1] = value;
        else
            break;
    }
}
/**
 * Forces any iterable or iterator to become an iterator. Will throw
 * if this is not possible.
 *
 * @example
 * import { forceIterator } from 'deleight/generators';
 * const it = forceIterator([1, 2, 3, 4, 5]);
 *
 * @param it
 */
function forceIterator(it) {
    return it[Symbol.iterator]?.() || it;
}
exports.forceIterator = forceIterator;
/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 * import { range } from 'deleight/generators';
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
exports.range = range;
/**
 * Returns a generator which iterates over the subset of the
 * 'arrayLike' object that matches the provided index.
 *
 * @example
 * import { items, range } from 'deleight/generators';
 * const tenth = []...items(range(1000), range(0, 1000, 10))];
 * // selects every 10th item in the array.
 *
 * @param {any} it
 * @param {Iterable<any>} index
 */
function* items(it, index) {
    for (let i of index)
        yield it[i];
}
exports.items = items;
/**
 * Returns a generator that yields first argument (`what`) the number of
 * times specified by the second argument (`times`). If `times` is not
 * given, `what` is repeated indefinitely.
 *
 * @example
 * import { repeat } from 'deleight/generators';
 * const repeated = [...repeat([1, 2, 3], 4)];
 * // [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3]
 *
 * @param {Iterable<any>} it
 * @param {number} [times]
 */
function* repeat(it, times = -1, ...extras) {
    let item;
    if (times !== 1 && !(it instanceof Array) && !(it instanceof Function)) {
        it = [...it];
    }
    let what2;
    if (times < 0) {
        while (true) {
            what2 = (it instanceof Function) ? it() : it;
            for (item of what2)
                yield item;
        }
    }
    else
        for (let i = 0; i < times; i++) {
            what2 = (it instanceof Function) ? it() : it;
            for (item of what2)
                yield item;
            for (item of extras)
                yield item;
        }
}
exports.repeat = repeat;
/**
 * Returns a Generator over the next 'count' items of the iterable or iterator.
 * In most cases you will call this function with an iterator.
 *
 * If a firstValue is specified, it will be yielded first.
 *
 * @example
 * import { next, forceIterator } from 'deleight/generators';
 * const it = forceIterator([1, 'a', 2, 'b', 3, 'c', 4, 'd']);
 * const [num1, let1] = next(it, 2);  // (1, 'a')
 * const [num2, let2] = next(it, 2);  // (2, 'b')
 *
 * @param it
 * @param count
 * @param firstValue
 */
function* next(it, count, firstValue) {
    it = forceIterator(it);
    let count2 = count;
    if (firstValue) {
        yield firstValue;
        count2--;
    }
    while (count2-- > 0)
        yield it.next().value;
}
exports.next = next;
/**
 * Returns a generator of generators over the next 'count' items of
 * the given iterable. In other words, this function will partition the
 * input iterable with each partition containing `count` items.
 *
 * @example
 * import { forNext } from 'deleight/generators';
 * const it = [1, 'a', 2, 'b', 3, 'c', 4, 'd'];
 * const it2 = forNext(it, 2); // (1, 'a'), (2, 'b'), ...
 *
 * @param { Iterable<any> } it
 * @param { number } count
 */
function* forNext(it, count) {
    const it2 = forceIterator(it);
    let nextItem = it2.next();
    while (!nextItem.done) {
        yield next(it2, count, nextItem.value);
        nextItem = it2.next();
    }
}
exports.forNext = forNext;
/**
 * Returns a generator over the items of all the input args (iterables), starting from
 * the zero index to the maximum index of the smallest arg.
 *
 * The effective length of the generator is the multiple of the length of the smallest
 * arg and the number of args.
 *
 * @example
 * import { zipFlat } from 'deleight/generators';
 * for (let i of zipFlat(range(10), range(15))) {
 *      console.log(i);    // (0, 0, 1, 1, 2, 2, .... till range(10) is exhausted.
 * }
 *
 * @param its
 */
function* zipFlat(...its) {
    const count = its.length;
    const itArgs = its.map(arg => forceIterator(arg));
    let i, nextItem;
    while (true) {
        for (i = 0; i < count; i++) {
            nextItem = itArgs[i].next();
            if (nextItem.done)
                return;
            else
                yield nextItem.value;
        }
    }
}
exports.zipFlat = zipFlat;
/**
 * Returns a generator over the combined items of all the input args (iterables),
 * starting from the zero index to the maximum index of the smallest arg.
 *
 * The effective length of the generator is the length of the smallest input
 * iterable.
 *
 * @example
 * import { zip } from 'deleight/generators';
 * for (let i of zip(range(10), range(15))) {
 *      console.log(i);    // (0, 0), (1, 1), (2, 2), .... till range(10) is exhausted.
 * }
 *
 * @param its
 */
function* zip(...its) {
    yield* forNext(zipFlat(...its), its.length);
}
exports.zip = zip;
/**
 * Returns an unordered/random generator over the input itrable.
 * Note that this is forced to materialize the input before running.
 *
 *
 * @example
 * import { random } from 'deleight/generators';
 * const unOrdered = random([1, 2, 3, 4]);  // probably [4, 1, 3, 2]
 *
 * @param it The iterable to get items from
 * @param count The number of items to return. All items are returned if
 * count < 0. Default is -1
 */
function* random(it, count = -1) {
    if (count === 0)
        return;
    const arr = [...it];
    for (let i = arr.length - 1; i >= 0; i--) {
        yield arr.splice(Math.round(Math.random() * i), 1)[0];
        if (--count === 0)
            return;
    }
}
exports.random = random;
