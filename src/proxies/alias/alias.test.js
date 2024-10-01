import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { Alias, alias } from './alias.js'

describe('alias', async t1 => {
    await it('Should correctly redirect get', async t2 => {
        const object = {a: 1, b: 2};
        const red1 = alias({a: object, b: object})
        const red2 = alias({a: object, b: object}, {a: 'b', b: 'a'})
        assert.equal(red1.a, object.a);
        assert.equal(red1.b, object.b);
        assert.equal(red2.b, object.a);
        assert.equal(red2.a, object.b);
    });
    await it('Should correctly redirect set', async t2 => {
        const object = {a: 1, b: 2};
        const red1 = alias({a: object, b: object})
        const red2 = alias({a: object, b: object}, {a: 'b', b: 'a'})
        red1.a = 5;
        assert.deepEqual(object, {a: 5, b: 2});
        red1.b = 10
        assert.deepEqual(object, {a: 5, b: 10});
        red2.b = 17
        assert.deepEqual(object, {a: 17, b: 10});
        red2.a = 44
        assert.deepEqual(object, {a: 17, b: 44});
    });
    await it('Should correctly redirect delete', async t2 => {
        const object = {a: 1, b: 2, c: 3, d: 4};
        const red1 = alias({a: object, b: object})
        const red2 = alias({a: object, b: object}, {a: 'c', b: 'd'})
        delete red1.a;
        assert.deepEqual(object, {b: 2, c: 3, d: 4});
        delete red1.b;
        assert.deepEqual(object, {c: 3, d: 4});
        delete red2.b;
        assert.deepEqual(object, {c: 3});
        delete red2.a;
        assert.deepEqual(object, {});
    });
    await it('Should correctly redirect call', async t2 => {
        const object = [];
        const red1 = alias({push: object, pop: object})
        const red2 = alias({push: object, pop: object}, {push: 'pop', pop: 'push'})
        red1.push(1,2,3);
        assert.deepEqual(object, [1,2,3]);
        red1.pop()
        assert.deepEqual(object, [1,2]);
        red2.push()
        assert.deepEqual(object, [1]);
        red2.pop('a')
        assert.deepEqual(object, [1, 'a']);
    });
});
