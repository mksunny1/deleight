import { test, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Actribute } from "../../src/actribute.js";

describe("Actribute.registry", () => {
  it("Should correctly unregister a funtion", (t) => {
    const act = new Actribute();
    const comp1 = (node, ...args) => {};
    act.register("comp1", comp1);
    assert.deepEqual(act.registry.comp1, comp1);
    delete act.registry.comp1;
    assert.deepEqual(act.registry.comp1, undefined);
  });
});
