import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { forceIterator, range, items, repeat, zipFlat, zip, next, forNext, random, map, filter, reduce, chain, forEach, forAsyncEach } from "./generators.js";  
// product

describe("map", () => {
    it("Should map the items", async (t) => {
        assert.deepEqual([...map(range(1, 9), (item) => item * 2)], [2, 4, 6, 8, 10, 12, 14, 16]);
    });
});

describe("filter", () => {
    it("Should filter the items", async (t) => {
        assert.deepEqual([...filter(range(1, 9), (item) => item > 5)], [6, 7, 8]);
    });
});

describe("reduce", () => {
    it("Should reduce the items", async (t) => {
        assert.deepEqual(reduce(range(1, 4), (val, item) => val + item, 3), 9);
    });
});

describe("chain", () => {
    it("Should chain the iterables", async (t) => {
        assert.deepEqual([...chain(range(1, 4), range(1, 4), range(2, 5))], [1, 2, 3, 1, 2, 3, 2, 3, 4]);
    });
});

/*
describe("product", () => {
    it("Should 'multiply' the iterables", async (t) => {
        assert.deepEqual([...product(range(1, 3), range(2, 4))].map(v => [...v]), [[1, 2], [1, 3], [2, 2], [2, 3]]);
    });
});
*/

describe("forEach", () => {
    it("Should iterate the generator", async (t) => {
        let val = 3;
        assert.deepEqual(forEach(range(1, 4), (item) => val += item) || val, 9);
    });
});


describe("forAsyncEach", async() => {
    async function* af(start, end) {
        yield* range(start, end);
    }

    it("Should iterate the async generator", async (t) => {
        let val = 3; 
        assert.deepEqual((await forAsyncEach(af(1, 4), (item) => val += item)) || val, 9);
    });
});

describe("range", () => {
    it("Should create a range with end (not inclusive) value", async (t) => {
        assert.deepEqual([...range(5)], [0, 1, 2, 3, 4]);
    });

    it("Should create a range with start (inclusive) and end (not inclusive) values", async (t) => {
        assert.deepEqual([...range(1, 5)], [1, 2, 3, 4]);
    });

    it("Should create a range with a step", async (t) => {
        assert.deepEqual([...range(1, 6, 2)], [1, 3, 5]);
    });
});

describe("items", () => {
    it("Should return the correct items", async (t) => {
        assert.deepEqual([...items([1, 2, 3, 4, 5, 6, 7, 8], [2, 5])], [3, 6]);
    });
});

describe("repeat", () => {
    it("Should correctly repeat the iterable", async (t) => {
        assert.deepEqual([...repeat([1, 2], 3)], [1,2,1,2,1,2]);
    });
});

describe("zipFlat", () => {
    it("Should return a flattened 'zip' of the iterables", async (t) => {
        assert.deepEqual([...zipFlat([1, 2, 3], ['a', 'b', 'c'])], [1,'a',2,'b',3,'c']);
    });
});

describe("zip", () => {
    it("Should return a 'zip' of the iterables", async (t) => {
        assert.deepEqual([...zip([1, 2, 3], ['a', 'b', 'c'])].map(v => [...v]), [[1,'a'],[2,'b'],[3,'c']]);
    });
});

describe("next", () => {
    it("Should return the next n items of any iterable", async (t) => {
        assert.deepEqual([...next(forceIterator([3, 4, 5, 6, 7, 8]), 3)], [3, 4, 5]);
        assert.deepEqual([...next(range(3, 30), 5)], [3, 4, 5, 6, 7]);
    });
});

describe("forNext", () => {
    it("Should return group consecutive items", async (t) => {
        assert.deepEqual([...forNext([3, 4, 5, 6, 7, 8], 3)].map(v => [...v]), [[3, 4, 5], [6, 7, 8]]);
        assert.deepEqual([...forNext(range(3, 9), 2)].map(v => [...v]), [[3, 4], [5, 6], [7, 8]]);
    });
});

describe("random", () => {
    it("Should return items in random order from the iterable", async (t) => {
        const initial = [1, 2, 3, 4, 5];
        const scrambled = [...random(initial)];
        assert.notDeepEqual(initial, scrambled);
        scrambled.sort();
        assert.deepEqual(initial, scrambled);
    });
});
