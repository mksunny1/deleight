import { test, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Actribute } from "../../src/actribute.js";

describe("actribute.register", () => {
  it("Should correctly register a funtion", (t) => {
    const act = new Actribute();
    const comp1 = (element, ...args) => {};
    act.register("comp1", comp1);
    assert.deepEqual(act.registry.comp1, comp1);
    
  });
});
