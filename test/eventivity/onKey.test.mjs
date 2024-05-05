import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { onKey, END } from "../../src/eventivity.js";

describe("eventivity.onKey", () => {
    
    it("Should match the correct key", async (t) => {
        
        function keyEvent(key, event) {
            const guard = onKey(key);
            return guard(event);
        }

        await it("Should not terminate the run if the key is correct", (t) => {
            assert.notEqual(keyEvent('d', {key: 'd'}), END);
        });
        await it("Should terminate the run if the key is wrong", (t) => {
            assert.equal(keyEvent('d', {key: 't'}), END);
        });
        await it("Should work for enter key", (t) => {
            assert.notEqual(keyEvent('enter', {key: 'enter'}), END);
            assert.equal(keyEvent('enter', {key: 'space'}), END);
            assert.equal(keyEvent('space', {key: 'enter'}), END);
        });

    });

});
