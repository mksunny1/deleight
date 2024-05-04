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
 * const tenth = items(arr1000, range(0, 1000, 10));
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
 * @param {any} what
 * @param {number} times
 */
function* repeat(what, times) {
    for (let i = 0; i < times; i++)
        yield what;
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
function getLength(iter) {
    return iterLengths.get(iter) || iter.length;
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
 * const myRange = range(12);
 * setLength(myRange, 12);
 * getLength(myRange);   // returns 12.
 *
 * @param {any} iter
 */
function setLength(iter, length) {
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
function* flat(...args) {
    const count = getLength(args);
    while (true) {
        for (let i = 0; i < count; i++) {
            if (args[i].next().done)
                yield args[i].next().value;
            else
                return;
        }
    }
}
/**
 * Get an iterator over the next 'count' items of the given iterator.
 *
 * @example
 * next([1, 4, 3, 6, 7, 4, 5].values(), 3);  // 1, 4, 3
 *
 * @param iter
 * @param count
 */
function* next(iter, count) {
    while (count-- > 0)
        yield iter.next().value;
}
/**
 * Returns an unordered/random iterator over the input array..
 *
 * @example
 * const unOrdered = uItems([1, 2, 3, 4]);  // [4, 1, 3, 2]
 *
 * @param {any[]} array
 */
function* uItems(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i >= 0; i--) {
        yield arr.splice(Math.round(Math.random() * i), 1);
    }
}

export { flat, getLength, items, iterLengths, next, range, repeat, setLength, uItems };
