import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { One, map, args, one, wrap, unwrap } from "../../src/onetomany.js";

describe("onetomany.One", async () => {
    const first = {}, second = {}, third = {}, fourth = {};
    const many = { first, second, third };

    const o1 = new One(many);
    const complex = { first: 56, second: 12, third: 12 };

    // set the same value on all objects
    o1.set({ p1: 78 });

    // set different values
    o1.set({ p2: { [map]: complex } });

    // set the same property as a complex object.
    o1.set({ p3: complex });

    await it("Should construct a correct instance", (t) => {
        assert.deepEqual(o1.many, many);
    });

    await it("Should set correct properties on the different objects", (t) => {
        assert.deepEqual(first, { p1: 78, p2: 56, p3: complex });
        assert.deepEqual(second, { p1: 78, p2: 12, p3: complex });
        assert.deepEqual(third, { p1: 78, p2: 12, p3: complex });
    });

    await it("Should get the correct properties", async (t) => {
        assert.deepEqual(o1.get('p3'), { first: complex, second: complex, third: complex });
        assert.deepEqual(o1.get({ first: 'p2', second: 'p1' }), { first: 56, second: 78 });
    });

    await it("Should delete the correct properties", async (t) => {
        o1.delete('p3')
        o1.delete({ first: 'p2', second: 'p1' })
        assert.deepEqual(o1.get('p3'), { first: undefined, second: undefined, third: undefined });
        assert.deepEqual(o1.get({ first: 'p2', second: 'p1' }), { first: undefined, second: undefined });
    });

    const arr1 = [], arr2 = [], arr3 = [];
    const o4 = new One({ arr1, arr2, arr3 });

    await it("Should call methods in the correct objects", async (t) => {
        // call with the same args:
        o4.call({ push: 78 });
        o4.call({ push: { [args]: [56, 57] } });

        // call with different args:
        o4.call({ push: { [map]: { arr1: 66, arr2: { [args]: [77, 88] }, arr3: 99 } } });

        assert.deepEqual(arr1, [78, 56, 57, 66]);
        assert.deepEqual(arr2, [78, 56, 57, 77, 88]);
        assert.deepEqual(arr3, [78, 56, 57, 99]);
    });

    await it("Should be able to call methods with no args", async (t) => {
        // repeat last value when they 'finish'
        o4.call('pop');
        assert.deepEqual(arr1, [78, 56, 57]);
        assert.deepEqual(arr2, [78, 56, 57, 77]);
        assert.deepEqual(arr3, [78, 56, 57]);

        o4.call( ['pop', 'pop'] );
        assert.deepEqual(arr1, [78]);
        assert.deepEqual(arr2, [78, 56]);
        assert.deepEqual(arr3, [78]);
    });

    await describe("onetomany.One.extend", async () => {
        await it("Should extend a One", async (t) => {
            o1.extend({ fourth })
            assert.deepEqual(o1.many, { first, second, third, fourth });
        });
        await it("Should replace Non-One objects with the same key", async (t) => {
            o1.extend({ third: {} })
            assert.deepEqual(o1.many, { first, second, third: {}, fourth });
        });
        await it("Should update One objects with the same key", async (t) => {
            const o2 = new One({ first, fourth });
            o1.extend({ fifth: o2 });
            assert.deepEqual(o1.many, { first, second, third: {}, fourth, fifth: o2 });

            o1.extend({ fifth: {sixth: {}} })
            assert.deepEqual(o2.many, { first, fourth, sixth: {} });
        });
    });
    await describe("onetomany.One.contract", async () => {
        await it("Should contract a One", async (t) => {
            o1.contract('third', 'fifth')
            assert.deepEqual(o1.many, { first, second, fourth });
        });
    });
    await describe("onetomany.One.slice", async () => {
        await it("Should slice a One", async (t) => {
            const o3 = o1.slice('first', 'second')
            assert.deepEqual(o3.many, { first, second });
        });
    });
    await describe("onetomany.One.view", async () => {
        const view = o1.view({first: 'p1', second: 'p2'});
        await it("Should create a correct View instance", async (t) => {
            assert.deepEqual(view.get(), { first: 78, second: 12 });
        });
        await it("Should set the correct properties", async (t) => {
            view.set(44);
            assert.equal(first.p1, 44);
            assert.equal(second.p2, 44);
            const complex = {first: 0, second: 1};
            view.set(complex);
            assert.equal(first.p1, complex);
            assert.equal(second.p2, complex);
            view.set({[map]: complex});
            assert.equal(first.p1, 0);
            assert.equal(second.p2, 1);
        });
        await it("Should delete the correct properties", async (t) => {
            view.delete();
            assert.equal(first.p1, undefined);
            assert.equal(second.p2, undefined);
        });
    });

});

describe("onetomany.one", async () => {
    const first = {}, second = {}, third = {}, fourth = {};
    const many = { first, second, third };

    const o1 = one(many);
    const uo1 = unwrap(o1);
    const complex = { first: 56, second: 12, third: 12 };

    // set the same value on all objects
    o1.p1 = 78;

    // set different values
    o1.p2 = { [map]: complex };

    // set the same property as a complex object.
    o1.p3 = complex;

    await it("Should construct a correct instance", (t) => {
        assert.deepEqual(uo1.many, many);
    });

    await it("Should set correct properties on the different objects", (t) => {
        assert.deepEqual(first, { p1: 78, p2: 56, p3: complex });
        assert.deepEqual(second, { p1: 78, p2: 12, p3: complex });
        assert.deepEqual(third, { p1: 78, p2: 12, p3: complex });
    });

    await it("Should get the correct properties", async (t) => {
        assert.deepEqual(o1.p3.value, { first: complex, second: complex, third: complex });
        assert.deepEqual(o1.p2.value.first, 56);
        assert.deepEqual(o1.p1.value.second, 78);
    });

    await it("Should delete the correct properties", async (t) => {
        delete o1.p3; 
        assert.deepEqual(o1.p3.value, { first: undefined, second: undefined, third: undefined });

        // we cannot use the proxy for this.
        uo1.delete({ first: 'p2', second: 'p1' })
        assert.deepEqual(uo1.get({ first: 'p2', second: 'p1' }), { first: undefined, second: undefined });
    });

    const arr1 = [], arr2 = [], arr3 = [];
    const o4 = one({ arr1, arr2, arr3 });

    await it("Should call methods in the correct objects", async (t) => {
        // call with the same args:
        o4.push(78);
        o4.push(56, 57);

        // call with different args:
        o4.push({ [map]: { arr1: 66, arr2: { [args]: [77, 88] }, arr3: 99 } });

        assert.deepEqual(arr1, [78, 56, 57, 66]);
        assert.deepEqual(arr2, [78, 56, 57, 77, 88]);
        assert.deepEqual(arr3, [78, 56, 57, 99]);
    });

    await it("Should be able to call methods with no args", async (t) => {
        // repeat last value when they 'finish'
        o4.pop();
        assert.deepEqual(arr1, [78, 56, 57]);
        assert.deepEqual(arr2, [78, 56, 57, 77]);
        assert.deepEqual(arr3, [78, 56, 57]);

        o4.pop(); o4.pop();
        assert.deepEqual(arr1, [78]);
        assert.deepEqual(arr2, [78, 56]);
        assert.deepEqual(arr3, [78]);
    });

});
