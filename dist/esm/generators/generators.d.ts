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
export declare function forEach<T>(it: Iterable<any>, action: (item: any, i?: number) => T): void;
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
export declare function forEachAsync<T>(it: AsyncIterable<any>, action: (item: any, i?: number) => T): Promise<void>;
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
export declare function map<T>(it: Iterable<any>, mapper: (item: any, i?: number) => T): Iterable<T>;
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
export declare function filter<T>(it: Iterable<any>, test: (item: any, i?: number) => boolean): Iterable<T>;
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
export declare function reduce<T>(it: Iterable<any>, reducer: (value: any, item: any, i?: number) => boolean, value?: any): T;
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
export declare function chain<T>(...its: Iterable<any>[]): Iterable<T>;
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
export declare function forceIterator(it: Iterable<any> | Iterator<any>): Iterator<any>;
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
export declare function range(start: number, end?: number, step?: number): Generator<number, void, unknown>;
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
export declare function items(it: any, index: Iterable<number>): Generator<any, void, unknown>;
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
export declare function repeat<T>(it: Iterable<T> | (() => Iterable<T>), times?: number, ...extras: any[]): Generator<any, void, unknown>;
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
export declare function next(it: Iterable<any> | Iterator<any>, count: number, firstValue?: any): Generator<any, void, unknown>;
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
export declare function forNext(it: Iterable<any>, count: number): Generator<Generator<any, void, unknown>, void, unknown>;
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
export declare function zipFlat(...its: Iterable<any>[]): Generator<any, void, unknown>;
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
export declare function zip(...its: Iterable<any>[]): Generator<Generator<any, void, unknown>, void, unknown>;
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
export declare function random(it: Iterable<any>, count?: number): Generator<any, void, unknown>;
