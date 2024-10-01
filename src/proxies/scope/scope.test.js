import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { scope } from './scope.js'

describe('scope', async t1 => {
    await it('Should correctly return properties from all the objects', async t2 => {
        const object1 = {a: 1, b: 2};
        const object2 = {b: 5, c: 9};
        const sc = scope([object1, object2]);

        assert.equal(sc.a, object1.a);
        assert.equal(sc.b, object1.b);
        assert.equal(sc.c, object2.c);
        assert.deepEqual(Reflect.ownKeys(sc), ['a', 'b', 'c']);
    });

});
