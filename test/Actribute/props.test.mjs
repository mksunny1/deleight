import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { props } from "../../src/actribute.js";


describe("actribute.props", () => {

    it("Should prioritise main props", (t) => {
        const fbProps = { f: 20, g: 7 };
        const mainProps = { a: 1, b: { c: 1, d: 2 }, e: 3, f: 100 };
        assert.equal(props('f', [mainProps, fbProps])[0], mainProps.f);
    });

    it("Should find fallback props", (t) => {
        const fbProps = { f: 20, g: 7 };
        const mainProps = { a: 1, b: { c: 1, d: 2 }, e: 3 };
        assert.equal(props('g', [mainProps, fbProps])[0], fbProps.g);
    });

    it("Should use correct sep", (t) => {
        const names = "b, e, big name, another big name";
        const vals = {
            a: 1,
            b: { c: 1, d: 2 },
            e: 3,
            "big name": 100,
            "another big name": 200,
        };

        const result = props(names, [vals], ',');
        assert.equal(result.length, 4);
        assert.deepEqual(result[0], vals.b);
        assert.deepEqual(result[1], vals.e);
        assert.deepEqual(result[2], 100);
        assert.deepEqual(result[3], 200);
    });

    it("Should find nested props", (t) => {
        const names = "b, e, big.name";
        const vals = { a: 1, b: { c: 1, d: 2 }, e: 3, big: { name: 100 } }

        const result = props(names, [vals], ',');
        assert.equal(result.length, 3);
        assert.deepEqual(result[0], vals.b);
        assert.deepEqual(result[1], vals.e);
        assert.deepEqual(result[2], vals.big.name);
    });

});
