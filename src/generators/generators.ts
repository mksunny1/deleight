/**
 * This module exports many useful generators for JS applications. 
 * There are generators for most array methods like `map` and `filter`, 
 * along many others drawn from  other languages that make heavy use 
 * of generators, like Python. 
 * 
 * Generators are very useful for improving performance as they help to 
 * avoid wasteful computations and storage. They were important factors 
 * in the speed and memory efficiency of some of the best performing 
 * libraries in the 
 * [JS framework benchmarks](https://github.com/krausest/js-frameworks-benchmark)
 * 
 * API Table of Contents
 * 
 * {@link range}
 * {@link forceIterator}
 * {@link forEach}
 * {@link forAsyncEach}
 * {@link forNext}
 * {@link next}
 * {@link items}
 * {@link random}
 * {@link repeat}
 * {@link map}
 * {@link filter}
 * {@link reduce}
 * {@link chain}
 * {@link zipFlat}
 * {@link zip}
 * (product: Still buggy. Not yet exported)
 * 
 * 
 * @module
 */

/**
 * Perform the given action for all items of the iterable.
 * 
 * @example
 * 
 * 
 * @param iter 
 * @param action 
 */
export function forEach<T>(iter: Iterable<any>, action: (item: any, i?: number) => T) {
    let i = 0;
    for (let item of iter) action(item, i++);
}

/**
 * Perform the given action for all items of the async iterable.
 * 
 * @example
 * 
 * 
 * @param iter 
 * @param action 
 */
export async function forAsyncEach<T>(iter: AsyncIterable<any>, action: (item: any, i?: number) => T) {
    let i = 0;
    for await (let item of iter) action(item, i++);
}

/**
 * Maps the values of the iterable to other values using the given mapper.
 * 
 * @example
 * 
 * 
 * @param iter 
 * @param mapper 
 */
export function* map<T>(iter: Iterable<any>, mapper: (item: any, i?: number) => T): Iterable<T> {
    let i = 0;
    for (let item of iter) yield mapper(item, i++);
}

/**
 * Filters the values of the iterable using the given test function.
 * 
 * @example
 * 
 * 
 * @param iter 
 * @param test 
 */
export function* filter<T>(iter: Iterable<any>, test: (item: any, i?: number) => boolean): Iterable<T> {
    let i = 0;
    for (let item of iter) if (test(item, i++)) yield item;
}

/**
 * Reduces the the iterable using the given reducer function.
 * 
 * @example
 * 
 * 
 * @param iter 
 * @param reducer 
 */
export function reduce<T>(iter: Iterable<any>, reducer: (value: any, item: any, i?: number) => boolean, value?: any): T {
    let i = 0;
    for (let item of iter) value = reducer(value, item, i++);
    return value
}

/**
 * Chain multiple iterables...
 *
 * @example
 * import { chain } from 'deleight/generators';
 * for (let i of chain(range(10, range(15)))) {
 *      console.log(i);    // 0, 1, 2, 3,...9, 0, 1, 2, ..., 14
 * }
 *
 * @param  {...any[]} args
 */
export function* chain<T>(...args: Iterable<any>[]): Iterable<T> {
    let item: T;
    for (let arg of args) {
        for (item of arg) yield item;
    }
}

/**
 * All combinations of items from each input iterable.
 * 
 * @example
 * 
 * 
 * @param args 
 */
function* product<T extends any[]>(...args: (Iterable<any> | (() => Iterable<any>))[]): Iterator<T, void, unknown> {
    const breaker = Symbol();
    const its = args.map(arg => repeat(arg, -1, breaker));

    let c2 = args.length - 1, c1: number;
    let it: Iterator<any, void, unknown>, value: any;
    
    let item = its.map(it => it.next().value) as T;
    for (let value of item) if (value === breaker) return;    // empty.
    while (true) {
        yield item;
        it = its[c2];
        while ((value = it.next().value) !== breaker) {
            item[c2] = value; 
            yield item;
        }
        c1 = c2;
        do {
            it = its[--c1];
            value = it.next().value;
        } while (value === breaker && c1 > 0)
        if (c1 >= 0 && value !== breaker) item[c1] = value;
        else break;
    }
}


/**
 * Forcs any iterable to become an iterator. Will throw 
 * if this is not possible.
 * 
 * @example
 * import { iter } from 'deleight/generators';
 * const it = iter([1, 2, 3, 4, 5]);
 * 
 * @param { any } it 
 */
export function forceIterator(it: any): Iterator<any> {
    return (Reflect.get(it, 'next') instanceof Function) ? it : it[Symbol.iterator]()
}

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
export function* range(start: number, end?: number, step?: number){
    if (!step) step = 1;
    if ((end === undefined || end === null) && start) {
        end = start;
        start = 0;
    }
    for (let i = start; i < (end as number); i += step) yield i;
}

/**
 * Returns a generator which iterates over the subset of the
 * 'arrayLike' object that matches the provided index.
 *
 * @example
 * import { items, range } from 'deleight/generators';
 * const tenth = []...items(range(1000), range(0, 1000, 10))];
 * // selects every 10th item in the array.
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
export function* items(arrayLike: any, index: Iterable<number>) {
    for (let i of index) yield arrayLike[i];
}

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
 * @param {Iterable<any>} what 
 * @param {number} [times] 
 */
export function* repeat<T>(what: Iterable<T> | (() => Iterable<T>), times: number = -1, ...extras: any[]) {
    let item: any;
    if (times !== 1 && !(what instanceof Array) && !(what instanceof Function)) {
        what = [...what];
    }
    let what2: Iterable<T>;
    if (times < 0) {
        while (true) {
            what2 = (what instanceof Function)? what(): what;
            for (item of what2) yield item;
        }
    } else for (let i = 0; i < times; i++) {
        what2 = (what instanceof Function)? what(): what;
        for (item of what2) yield item;
        for (item of extras) yield item;
    }
}

/**
 * Returns an iterator over the next 'count' items of the iterator. 
 * 
 * Note that, for performance reasons, this only accepts an 
 * iterator as the 'it' argument. You can convert any iterable to an 
 * iterator using the {@link forceIterator} function as shown in the following 
 * example.
 * 
 * If a firstValue is specified, it will be yielded first.
 * 
 * @example
 * import { next, iter } from 'deleight/generators';
 * const it = iter([1, 'a', 2, 'b', 3, 'c', 4, 'd']);
 * const [num1, let1] = next(it, 2);  // (1, 'a')
 * const [num2, let2] = next(it, 2);  // (2, 'b')
 * 
 * @param {Iterator<any>} it 
 * @param {number} count 
 * @param { any } [firstValue]
 */
export function* next(it: Iterator<any>, count: number, firstValue?: any) {
    let count2 = count;
    if (firstValue) {
        yield firstValue;
        count2--;
    }
    while (count2-- > 0) yield it.next().value;
}

/**
 * Returns an iterator of iterators over the next 'count' items of 
 * the given iterable
 * 
 * @example
 * import { forNext } from 'deleight/generators';
 * const it = [1, 'a', 2, 'b', 3, 'c', 4, 'd'];
 * const it2 = forNext(it, 2); // (1, 'a'), (2, 'b'), ...
 * 
 * @param { Iterable<any> } it 
 * @param { number } count 
 */
export function* forNext(it: Iterable<any>, count: number) {
    const it2 = forceIterator(it);
    let nextItem: IteratorResult<any, any> = it2.next();
    while (!nextItem.done) {
        yield [...next(it2, count, nextItem.value)]
        nextItem = it2.next();
    }
}

/**
 * Returns an iterator over the items of all the input iterators, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the multiple of the length of thr smallest
 * iterator and the number of iterators (number of args).
 *
 * Can be used to join arrays in a way not supported by `concat`, `push`, etc.
 * To pass an array as an iterator, call array.values().
 *
 * @example
 * import { zipFlat } from 'deleight/generators';
 * for (let i of zip(range(10, range(15)))) {
 *      console.log(i);    // (0, 0, 1, 1, 2, 2, .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...any[]} args
 */
export function* zipFlat(...args: any[]) {
    const count = args.length;
    args = args.map(arg => forceIterator(arg));

    let i: number, nextItem: IteratorResult<any, any>;
    while (true) {
        for (i = 0; i < count; i++) {
            nextItem = args[i].next();
            if (nextItem.done) return;
            else yield nextItem.value;
        }
    }
}

/**
 * Returns an iterator over the items of all the input iterators, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the multiple of the length of thr smallest
 * iterator and the number of iterators (number of args).
 *
 * Can be used to join arrays in a way not supported by `concat`, `push`, etc.
 *
 * @example
 * import { zip } from 'deleight/generators';
 * for (let i of zip(range(10, range(15)))) {
 *      console.log(i);    // (0, 0), (1, 1), (2, 2), .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...any[]} args
 */
export function* zip(...args: any[]) {
    yield* forNext(zipFlat(...args), args.length);
}

/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 * import { uItems } from 'deleight/generators';
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param it The iterable to get items from
 * @param count The number of items to return. All items are returned if 
 * count < 0. Default is -1
 */
export function* random(it: Iterable<any>, count=-1) {
    if (count === 0) return;

    const arr = [...it];
    for (let i = arr.length - 1; i >= 0; i--) {
        yield arr.splice(Math.round(Math.random() * i), 1)[0];
        if (--count === 0) return;
    }
}
