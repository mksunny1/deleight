import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType, IterRefType } from "../../../src/reftype.js";


describe('IterRefType.constructor', (t) => {
    it('Constructs a valid IterRefType instance', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ], options = {
            
        };
        const reftype = new IterRefType(refs, options);
        assert.deepEqual(reftype.refs, refs);
        assert.deepEqual(reftype.options, options);
    });
});

