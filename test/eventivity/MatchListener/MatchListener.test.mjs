import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { MatchListener } from "../../../src/eventivity.js";

describe("eventivity.MatchListener.constructor", () => {
    const events = (str1) => ({target: {matches(str2){return str1 === str2}}});
    
    it("Should create a valid match listener", async (t) => {
        let c1 = 0, c2 = 0, c3 = 0;
        const listener = new MatchListener({
            m1: (e) => {c1++},
            m2: (e) => {c2++},
            m3: (e) => {c3++}
        });

        await listener.listener(events('m2'));
        await listener.listener(events('m2'));
        await listener.listener(events('m2'));
        await listener.listener(events('m1'));
        
        assert.equal(c1, 1);
        assert.equal(c2, 3);
        assert.equal(c3, 0);

    });
    
})
