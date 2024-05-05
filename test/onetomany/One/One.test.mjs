import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { One } from "../../../src/onetomany.js";

describe("onetomany.One", () => {
    const first = {}, second = {}, third = {}, fourth = {};
    const many = [first, second, third];

    const o1 = new One(many);

    const o2 = new One(many, true);

    const ctx1 = {a: 1, b: 2}
    const ctx2 = {a: 10, b: 12}

    const ctx = [ctx1];
    const o3 = new One(many, false, ctx);
    
    it("Should construct a correct instance", async (t) => {
        assert.deepEqual(o1.many, many);
        assert.deepEqual(o2.many, many);
        assert.deepEqual(o3.many, many);
        assert.equal(o1.recursive, undefined);
        assert.equal(o2.recursive, true);
        assert.equal(o3.recursive, false);
        assert.deepEqual(o1.context, []);
        assert.deepEqual(o2.context, []);
        assert.deepEqual(o3.context, ctx);
    });

    it("Should set properties at the correct index", async (t) => {
        // repeat last value when they 'finish'
        o1.set('p1', [78]);     
        o1.set('p2', [56, 12]);
        o1.set('p3', [84, 67, 33]);
        assert.deepEqual(first, {p1: 78, p2: 56, p3: 84});
        assert.deepEqual(second, {p1: 78, p2: 12, p3: 67});
        assert.deepEqual(third, {p1: 78, p2: 12, p3: 33});
    });

    it("Should get the correct properties", async (t) => {
        assert.deepEqual(o1.get('p3'), [84, 67, 33]);
        assert.deepEqual(o2.get('p3').many, [84, 67, 33]);
        assert.deepEqual(o3.get('p3'), [84, 67, 33]);
    });

    const arr1 = [], arr2 = [], arr3 = [];
    const o4 = new One([arr1, arr2, arr3]);

    it("Should call methods at the correct index", async (t) => {
        // repeat last value when they 'finish'
        o4.call([[78]], 'push');     
        o4.call( [[56, 57], [12]], 'push');
        o4.call([[7], [84, 67, 33], [8]], 'push');
        assert.deepEqual(arr1, [78, 56, 57, 7]);
        assert.deepEqual(arr2, [78, 12, 84, 67, 33]);
        assert.deepEqual(arr3, [78, 12, 8]);
    });

    it("Should be able to call methods with no args", async (t) => {
        // repeat last value when they 'finish'
        o4.call([], 'pop');     
        assert.deepEqual(arr1, [78, 56, 57]);
        assert.deepEqual(arr2, [78, 12, 84, 67]);
        assert.deepEqual(arr3, [78, 12]);

        o4.call([], 'pop');     
        assert.deepEqual(arr1, [78, 56]);
        assert.deepEqual(arr2, [78, 12, 84]);
        assert.deepEqual(arr3, [78]);

        o4.call([], 'pop');     
        assert.deepEqual(arr1, [78]);
        assert.deepEqual(arr2, [78, 12]);
        assert.deepEqual(arr3, []);
    });

    const f1 = (arg, ctx1, ctx2) => {ctx1.a++; ctx2? ctx2.a++: ''}
    const f2 = (arg, ctx1, ctx2) => {ctx1.b++; ctx2? ctx2.b++: ''}
    const o5 = new One([f1, f2], false, ctx);

    if('Should use the context', (t) => {
        o5.call(0);
        assert.equal(ctx1.a, 2);
        assert.equal(ctx2.a, 10);
        assert.equal(ctx1.b, 3);
        assert.equal(ctx2.b, 12);
    });

    it('Should have a hackable context', (t) => {
        ctx.push(ctx2);
        o5.call('ignoredArg');
        assert.equal(ctx1.a, 2);
        assert.equal(ctx2.a, 11);
        assert.equal(ctx1.b, 3);
        assert.equal(ctx2.b, 13);
    });

});
