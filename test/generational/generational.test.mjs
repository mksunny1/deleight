import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { range, items, repeat, flat, getLength, setLength, uItems } from "../../src/generational.js";

describe("generational.range", () => {
    
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

describe("generational.items", () => {
    
    it("Should return the correct items", async (t) => {
        assert.deepEqual([...items([1, 2, 3, 4, 5, 6, 7, 8], [2, 5])], [3, 6]);
    });

});

describe("generational.repeat", () => {
    
    it("Should correctly repeat the iterable", async (t) => {
        assert.deepEqual([...repeat([1, 2], 3)], [1,2,1,2,1,2]);
    });

});

describe("generational.flat", () => {
    
    it("Should correctly flatten the 'zip' of the iterables", async (t) => {
        assert.deepEqual([...flat([1, 2, 3], ['a', 'b', 'c'])], [1,'a',2,'b',3,'c']);
    });

});

describe("generational.uItems", () => {
    
    it("Should correctly flatten the 'zip' of the iterables", async (t) => {
        const initial = [1, 2, 3, 4, 5];
        const scrambled = [...uItems(initial)];
        assert.notDeepEqual(initial, scrambled);
        scrambled.sort();
        assert.deepEqual(initial, scrambled);
    });

});


describe("generational.length", () => {
    const iter = repeat([1, 2], 3);
    setLength(iter, 20);
    assert.equal(getLength(iter), 20);
});