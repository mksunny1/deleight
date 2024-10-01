import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert'
import { deepKey as dk, destructure, get, set, call, del } from './deep.js'

// deepKey
describe('deepKey', async (t) => {
    await it('should create valid deepkeys: (IKey | (IKey | any[])[])', async (t2) => {
        assert.deepEqual(dk.a.b.c(), ['a', 'b', 'c']);
        assert.deepEqual(dk.a[1].d[2].c(), ['a', 1, 'd', 2, 'c']);
        assert.deepEqual(dk.a[1](1, 2, 3).d[2].c(3, 2, 1)(), ['a', 1, [1, 2, 3], 'd', 2, 'c', [3, 2, 1]]);
    });
})

// destructure
describe('destructure', async (t) => {
    await it('should correctly destructure an object and deepkey', async (t2) => {
        const object = { a: { b: { c: 9 } } };
        const dKey = dk.a.b.c()
        const dest = destructure(object, dKey)
        assert.deepEqual(dest, { parent: { c: 9 }, member: 'c' });
        const object2 = { a: [0, { d: [0, 0, { c: 9 }] }] };
        const dKey2 = dk.a[1].d[2].c()
        const dest2 = destructure(object2, dKey2)
        assert.deepEqual(dest2, { parent: { c: 9 }, member: 'c' });
        const object3 = { a: [0, (a, b, c) => ({ d: [0, 0, { c: (...args) => args }] })] };
        const dKey3 = dk.a[1](1, 2, 3).d[2].c(3, 2, 1)()
        const dest3 = destructure(object3, dKey3);
        assert.equal(dest3.parent instanceof Function, true);
        assert.deepEqual(dest3.member, [3, 2, 1]);
    });
})

// get
describe('get', async (t) => {
    await it('should correctly get a value given an object and a deepkey', async (t2) => {
        
    });
})

// set


// call


// del

