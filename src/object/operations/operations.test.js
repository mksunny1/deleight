

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { zip, map, mapKeys, mapValues, reduce, object, repeat, assign } from './operations.js'

describe('object.object', async t1 => {
    await it('Should combine an array of key value pairs', async t2 => {
        assert.deepEqual(object([['a', 1], ['b', 2], ['c', 3]]), { a: 1, b: 2, c: 3 });
    })
});

describe('object.zip', async t1 => {
    await it('Should combine arrays of keys and values', async t2 => {
        assert.deepEqual(zip(['a', 'b', 'c'], [1, 2, 3]), { a: 1, b: 2, c: 3 });
    })
});


describe('object.mapKeys', async t1 => {
    await it('Should correctly map object keys', async t2 => {
        assert.deepEqual(mapKeys({ a: 1, b: 2, c: 3 }, (obj, k) => `${k}1`), { a1: 1, b1: 2, c1: 3 });
    })
});


describe('object.mapValues', async t1 => {
    await it('Should correctly map object values', async t2 => {
        assert.deepEqual(mapValues({ a: 1, b: 2, c: 3 }, (obj, k) => obj[k] * 3), { a: 3, b: 6, c: 9 });
    })
});

describe('object.map', async t1 => {
    await it('Should correctly map object keys and values', async t2 => {
        assert.deepEqual(map({ a: 1, b: 2, c: 3 }, (obj, k) => [`${k}1`, obj[k] * 3]), { a1: 3, b1: 6, c1: 9 });
    })
});

describe('object.reduce', async t1 => {
    await it('Should correctly map object keys and values', async t2 => {
        assert.equal(reduce({ a: 1, b: 2, c: 3 }, (obj, k, r) => r + (obj[k] * obj[k]), 0), 14);
    })
});

describe('object.assign', async t1 => {
    await it('Should replace non-object properties', async t2 => {
        assert.deepEqual(assign({ a: 1, b: 2, c: 3 }, [{c: 5, b: 6 }]), { a: 1, b: 6, c: 5 });
    })
    await it('Should assign object properties', async t2 => {
        const a = {a: 1, b: 2};
        const obj = { a, b: 2, c: 3 };
        assign(obj, [{a: { b: 9 }, c: 5, b: 6 }]);
        assert.equal(obj.a, a);
        assert.deepEqual(obj.a, { a: 1, b: 9 });
    })
});


