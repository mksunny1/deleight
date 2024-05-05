import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { stopPropagation } from "../../src/eventivity.js";

describe("eventivity.stopPropagation", () => {
    
    it("Should call stopPropagation", async (t) => {
        
        let counter = 0;
        const event = {
            stopPropagation() {
                counter++;
            }
        }
        stopPropagation(event);
        stopPropagation(event);
        stopPropagation(event);
        assert.equal(counter, 3);

    });

});
