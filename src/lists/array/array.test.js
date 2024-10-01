import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { ArrayList } from '../array.js'

describe("ArrayList", () => {
    const array = [];
    const list = new ArrayList(array);

    it("Should correctly push the array", (t) => {
        assert.equal(array.length, 0);
        list.push(1, 2, 3);
        assert.deepEqual(array, [1, 2, 3]);
    });

    it("Should correctly pop the array", (t) => {
        assert.equal(array.length, 3);
        list.pop();
        assert.deepEqual(array, [1, 2]);
    });

    it("Should correctly unshift the array", (t) => {
        assert.equal(array.length, 2);
        list.unshift(1, 2, 3);
        assert.deepEqual(array, [1, 2, 3, 1, 2]);
    });

    it("Should correctly shift the array", (t) => {
        assert.equal(array.length, 5);
        list.shift();
        assert.deepEqual(array, [2, 3, 1, 2]);
    });

    it("Should correctly set the array", (t) => {
        list.set(1, 7);
        assert.deepEqual(array, [2, 7, 1, 2]);
    });

    it("Should correctly splice the array", (t) => {
        list.splice(2, 1, 8, 9, 0);
        assert.deepEqual(array, [2, 7, 8, 9, 0, 2]);
    });

    it("Should correctly swap array items", (t) => {
        list.swap(2, 3);
        assert.deepEqual(array, [2, 7, 9, 8, 0, 2]);
        list.swap(1, 5);
        assert.deepEqual(array, [2, 2, 9, 8, 0, 7]);
    });

    it("Should correctly move array items", (t) => {
        list.move(2, 3);
        assert.deepEqual(array, [2, 2, 8, 9, 0, 7]);
        list.move(1, 5);
        assert.deepEqual(array, [2, 8, 9, 0, 7, 2]);
    });


    it("Should correctly iterate the array", (t) => {
        assert.deepEqual([...list], [...array]);
    });

    it("Should correctly clear the array", (t) => {
        list.clear();
        assert.deepEqual(array, []);
    });

})
