

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { M, gets, sets, calls, dels } from './shared.js'

describe('gets', async t1 => {
    await it('Should correctly get a simple map of properties', async t2 => {
        let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 18, b: 77, c: 83 };
        assert.deepEqual(gets({
            a: [obj1], b: [obj2], c: [obj1]
        }), { a: [1], b: [77], c: [3] });
    });

    await it('Should resolve lazy (function) values', async t2 => {
        let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 18, b: 77, c: 83 };
        assert.deepEqual(gets({
            a: [obj1], b: [obj2], c: () => [obj1]
        }), { a: [1], b: [77], c: [3] });
    });
});

describe('sets', async t1 => {
    await it('Should correctly set a simple map of properties', async t2 => {
        let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
        const actions = {
            a: [obj1], b: [obj2], c: [obj1]
        };
        sets(actions, 20);
        assert.deepEqual(obj1, { a: 20, b: 2, c: 20});
        assert.deepEqual(obj2, { a: 1, b: 20, c: 3});

    });
    await it('Should correctly update a simple map of properties', async t2 => {
        let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
        const actions = {
            a: [obj1], b: [obj2], c: [obj1]
        };
        sets(actions, M((obj, key) => obj[key] * 2));
        assert.deepEqual(obj1, { a: 2, b: 2, c: 6});
        assert.deepEqual(obj2, { a: 1, b: 4, c: 3});
    });
});

describe('calls', async t1 => {
    await it('Should correctly invoke a simple map of methods', async t2 => {
        let arr1 = [1, 2, 3], arr2 = [1, 2, 3];
        calls({
            push: [arr1], unshift: [arr2]
        }, 20, 21);
        assert.deepEqual(arr1, [1, 2, 3, 20, 21]);
        assert.deepEqual(arr2, [20, 21, 1, 2, 3]);
    });
});

describe('dels', async t1 => {
    await it('Should correctly delete a simple map of properties', async t2 => {
        let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
        dels({
            a: [obj1], b: [obj2], c: [obj1]
        });
        assert.deepEqual(obj1, { b: 2 });
        assert.deepEqual(obj2, { a: 1, c: 3});
    });

    await it('Should resolve lazy (function) values', async t2 => {
        let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
        dels({
            a: () => [obj1], b: [obj2], c: [obj1]
        });
        assert.deepEqual(obj1, { b: 2 });
        assert.deepEqual(obj2, { a: 1, c: 3});
    });
});
