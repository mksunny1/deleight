

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { process } from './process.js'

describe('process', async t1 => {
    await it('Should process all the object properties', async t2 => {
        let val = 0;
        process({ a: 1, b: 2, c: 3}, (obj, key) => val += obj[key])
        assert.equal(val, 6);
    })
    await it('Should also process nested object properties', async t2 => {
        let val = 0;
        process({ a: 1, b: { d: 2}, c: 3,}, (obj, key) => (typeof obj[key] === 'object')? obj[key]: val += obj[key])
        assert.equal(val, 6);
    })
});
