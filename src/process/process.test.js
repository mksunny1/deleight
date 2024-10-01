import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert'
import { process, Process, Step, R, r, W, w, F, f, G, g, S, s, C, c, D, d, A, a, M, m, O, o, P, p, $ } from './process.js'

// isgenerator


// isAsyncGenerator


// Process (constructor)


// .getScope


// .start


// .generateWith


// .generate


// .callWith


// .call



// Closer / $



// Step (constructor)



// .run



// .getValue

describe('Step.getValue', async (t) => {
    await it('should correctly yield all the items in a simple iterable', async (t) => {
        const array = [1, 2, R, 3, 4, 5]
        const env = {values: array[Symbol.iterator]()};
        let result;
        function* handler() {
            return result = yield* R.getValue(env.values.next().value, env);
        }
        assert.deepEqual([...handler()], [1]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [2]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], []);
        assert.equal(result, R);
        assert.deepEqual([...handler()], [3]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [4]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [5]);
        assert.equal(result, undefined);
    });

    await it('should correctly yield all the items in a simple iterable 2', async (t) => {
        const array = [1, 2, g, 'a', {a: 4}, {a: 5}, $, 6, 7]
        const env = {values: array[Symbol.iterator]()};
        let result;
        function* handler() {
            return result = yield* R.getValue(env.values.next().value, env);
        }
        assert.deepEqual([...handler()], [1]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [2]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [4, 5]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [6]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [7]);
        assert.equal(result, undefined);
    });

    await it('should correctly yield all the items in a simple iterable 3', async (t) => {
        const array = [
            1, 
            2, 
            g, 'a', {a: 4}, {a: 5}, $, 
            r, 6, 7
        ]
        const env = {values: array[Symbol.iterator]()};
        let result;
        function* handler() {
            return result = yield* R.getValue(env.values.next().value, env);
        }
        assert.deepEqual([...handler()], [1]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [2]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [4, 5]);
        assert.equal(result, undefined);
        assert.deepEqual([...handler()], [6, 7]);
        assert.equal(result, undefined);
    });
});


// .getValues



// .runWith



// createStep



// FuncStep



// PipeStep



// ArgsStep



// ManyStep



// OneStep


// GetStep


// SetStep


// CallStep



// DelStep



// EarlyStep



// Step Template




