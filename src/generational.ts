/**
 * This module exports many useful generators like `range` and `repeat`.
 */

/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @example
 * const arr1000 = [...range(0, 1000)];
 * // creates an array with 1000 items counting from 0 to 999.
 *
 * @param {number} start
 * @param {number} [end]
 * @param {number} [step]
 */
export function* range(start: number, end?: number, step?: number) {
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
 * const tenth = items(arr1000, range(0, 1000, 10));
 * // selects every 10th item in the array.
 *
 * @param {any} arrayLike
 * @param {Iterable<any>} index
 */
export function* items(arrayLike: any, index: Iterable<number>) {
  for (let i of index) yield arrayLike[i];
}

/**
 * Returns a generator that yields first argument (what) the number of 
 * times specified by the second argument (times).
 * 
 * @param {any} what 
 * @param {number} times 
 */
export function* repeat(what: any, times: number) {
  let item;
  for (let i = 0; i < times; i++) for (item of what) yield item;
}

/**
 * Call to get the length of an object. The object must either
 * have a length property of be previously passed in a call to`setLength`.
 *
 * @example
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} iter
 */
export function getLength(iter: any) {
  return iterLengths.get(iter) || (iter as any[]).length;
}

/**
 * Stores the 'fake' lenghts of iterables passed in calls to `setLength`.
 * Can also be modified manually.
 */
export const iterLengths = new WeakMap<any, number>();

/**
 * Attaches a 'fake' length to an object (likely iterable or iterator)
 * which does not have a length property, so that it can work well with
 * functions that use `getLength`.
 *
 * @example
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} iter
 */
export function setLength(iter: any, length: number) {
  iterLengths.set(iter, length);
  return iter;
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
 * for (let i of flat(range(10, range(15)))) {
 *      console.log(i);    // 0, 0, 1, 1, 2, 2, .... till smallest iterable (10) is exhausted.
 * }
 *
 * @param  {...Iterator<any>} args
 */
export function* flat(...args: any[]) {
  const count = getLength(args);
  const args2 = [];
  let minLength: number;
  for (let arg of args) {
    if (!(arg instanceof Array)) arg = Array.from(arg);
    args2.push(arg);
    if (!minLength || minLength > arg.length) minLength = arg.length;
  }
  let j = 0;
  while (j < minLength) {
    for (let i = 0; i < count; i++) {
      yield args2[i][j];
    }
    j++;
  }
}

/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param {any[]} iter
 */
export function* uItems(iter: any[]) {
  const arr = [...iter];
  for (let i = arr.length - 1; i >= 0; i--) {
    yield arr.splice(Math.round(Math.random() * i), 1)[0];
  }
}
