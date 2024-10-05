

import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { apply } from './apply.js'

describe('apply', async t1 => {
    await it('Should apply object actions to a target', async t2 => {
        let target = {};
        apply({ a: (t, k) => (t[k] = 1) && undefined, b: (t, k) => (t[k] = 2) && undefined, c: (t, k) => (t[k] = 3) && undefined}, target);
        assert.deepEqual(target, { a: 1, b: 2, c: 3 });
    })
});
