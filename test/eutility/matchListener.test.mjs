import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { matchListener } from "../../src/eutility.js";

describe("eutility.matchListener", () => {
    const events = (str1) => ({target: {matches(str2){return str1 === str2}}});
    
    it("Should create a valid match listener", async (t) => {
        let c1 = 0, c2 = 0, c3 = 0;
        const listener = matchListener({
            m1: (e) => {c1++},
            m2: (e) => {c2++},
            m3: (e) => {c3++}
        });

        await listener(events('m2'));
        await listener(events('m2'));
        await listener(events('m2'));
        await listener(events('m1'));
        
        assert.equal(c1, 1);
        assert.equal(c2, 3);
        assert.equal(c3, 0);

    });

    it("Should correctly wrap with eventListener when wrapListeners argument is truthy", async (t) => {
        const runs = [];
        const listener = matchListener({
            m1: (e, ctx) => {runs.push(ctx.running)},
            m2: (e, ctx) => {runs.push(ctx.running)},
            m3: (e, ctx) => {runs.push(ctx.running)}
        }, true);

        await listener(events('m2'));
        await listener(events('m3'));
        await listener(events('m2'));
        await listener(events('m1'));
        
        assert.equal(runs.length, 4);
        assert.deepEqual(runs, [true, true, true, true]);

    });

    it("Should implicitly wrap with eventListener when an array value is encountered in the matcher", async (t) => {
        const runs = [];
        const listener = matchListener({
            m1: (e, ctx) => {if (ctx) runs.push(ctx.running)},
            m2: [(e, ctx) => {if (ctx) runs.push(ctx.running)}],
            m3: (e, ctx) => {if (ctx) runs.push(ctx.running)}
        });

        await listener(events('m2'));
        await listener(events('m3'));
        await listener(events('m2'));
        await listener(events('m1'));
        
        assert.equal(runs.length, 2);
        assert.deepEqual(runs, [true, true]);

    });
    
});
