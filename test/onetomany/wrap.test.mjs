import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { One, wrap } from "../../src/onetomany.js";

describe("onetomany.wrap", async () => {
    const first = {}, second = {}, third = {}, fourth = {};
    const many = [first, second, third];

    const o1 = new One(many);
    const w1 = wrap(o1);

    const o2 = new One(many);
    const w2 = wrap(o2, 1);

    const ctx1 = {a: 1, b: 2}

    const ctx = [ctx1];
    const o3 = new One(many, false, ctx);
    const w3 = wrap(o3);
    
    await it("Should set properties at the correct index", async (t) => {
        // repeat last value when they 'finish'
        w1.p1 = 78;     
        w1.p2 = [56, 12];
        w1.p3 = [84, 67, 33];
        assert.deepEqual(first, {p1: 78, p2: 56, p3: 84});
        assert.deepEqual(second, {p1: 78, p2: 12, p3: 67});
        assert.deepEqual(third, {p1: 78, p2: 12, p3: 33});
    });

    await it("Should get the correct properties", async (t) => {
        assert.deepEqual(w1.p3, [84, 67, 33]);
        assert.deepEqual(w2.p3, 67);
        assert.deepEqual(w3.p3, [84, 67, 33]);
    });

    const arr1 = [], arr2 = [], arr3 = [];
    const o4 = new One([arr1, arr2, arr3]);
    const mainItem = 0;
    const w4 = wrap(o4, mainItem);
    assert.equal(o4.mainItem, 0);


    await it("Should behave like the main item in external code", async (t) => {
        // Methods and properties are used the same as when dealing with 
        // just the main item but the operations are run on all items
        
        w4.push( 78 );     
        w4.push( [56, 57], [12] );
        w4.push( 7, 84, [67, 33, 8] );
        const expected = [78, [56, 57], [12], 7, 84, [67, 33, 8]];

        assert.deepEqual(arr1, expected);
        assert.deepEqual(arr2, expected);
        assert.deepEqual(arr3, expected);

        assert.deepEqual(w4[1], [56, 57]);

    });

    await it("Should be able to call methods with no args", async (t) => {
        // repeat last value when they 'finish'

        w4.pop();     
        let expected = [78, [56, 57], [12], 7, 84];
        assert.deepEqual(arr1, expected);
        assert.deepEqual(arr2, expected);
        assert.deepEqual(arr3, expected);

        w4.pop();     
        expected = [78, [56, 57], [12], 7];
        assert.deepEqual(arr1, expected);
        assert.deepEqual(arr2, expected);
        assert.deepEqual(arr3, expected);

        w4.pop();     
        expected = [78, [56, 57], [12]];
        assert.deepEqual(arr1, expected);
        assert.deepEqual(arr2, expected);
        assert.deepEqual(arr3, expected);

    });

});
