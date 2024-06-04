import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";


describe('RefType.constructor', (t) => {
    it('Constructs a valid RefType instance', (t) => {
        const refs = {
            mercury: 1,
            venus: 2,
            earch: 3,
            mars: 4
        }, options = {
            
        };
        const reftype = new RefType(refs, options);
        assert.deepEqual(reftype.refs, refs);
        assert.deepEqual(reftype.options, options);
    });
});

