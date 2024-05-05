import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { preventDefault } from "../../src/eventivity.js";

describe("eventivity.preventDefault", () => {
    
    it("Should call preventDefault", async (t) => {
        
        let counter = 0;
        const event = {
            preventDefault() {
                counter++;
            }
        }
        preventDefault(event);
        preventDefault(event);
        assert.equal(counter, 2);

    });

});
