import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { one, unWrap } from "../../src/onetomany.js";

describe("onetomany.One", () => {
    const first = {}, second = {}, third = {}, fourth = {};
    const many = [first, second, third];

    const o1 = one(many);

    const o2 = one(many, true);

    const ctx1 = {a: 1, b: 2}

    const ctx = [ctx1];
    const o3 = one(many, false, ctx);
    
    it("Should set properties at the correct index", async (t) => {
        // repeat last value when they 'finish'
        o1.p1 = [78];     
        o1.p2 = [56, 12];
        o1.p3 = [84, 67, 33];
        assert.deepEqual(first, {p1: 78, p2: 56, p3: 84});
        assert.deepEqual(second, {p1: 78, p2: 12, p3: 67});
        assert.deepEqual(third, {p1: 78, p2: 12, p3: 33});
    });

    it("Should get the correct properties", async (t) => {
        assert.deepEqual(o1.p3, [84, 67, 33]);
        assert.deepEqual(unWrap(o2.p3).many, [84, 67, 33]);
        assert.deepEqual(o3.p3, [84, 67, 33]);
    });

    const arr1 = [], arr2 = [], arr3 = [];
    const o4 = one([arr1, arr2, arr3]);

    it("Should call methods at the correct index", async (t) => {
        // repeat last value when they 'finish'
        o4.push([78]);     
        o4.push( [56, 57], [12]);
        o4.push([7], [84, 67, 33], [8]);
        assert.deepEqual(arr1, [78, 56, 57, 7]);
        assert.deepEqual(arr2, [78, 12, 84, 67, 33]);
        assert.deepEqual(arr3, [78, 12, 8]);
    });

    it("Should be able to call methods with no args", async (t) => {
        // repeat last value when they 'finish'
        o4.pop();     
        assert.deepEqual(arr1, [78, 56, 57]);
        assert.deepEqual(arr2, [78, 12, 84, 67]);
        assert.deepEqual(arr3, [78, 12]);

        o4.pop();     
        assert.deepEqual(arr1, [78, 56]);
        assert.deepEqual(arr2, [78, 12, 84]);
        assert.deepEqual(arr3, [78]);

        o4.pop();     
        assert.deepEqual(arr1, [78]);
        assert.deepEqual(arr2, [78, 12]);
        assert.deepEqual(arr3, []);
    });

});
