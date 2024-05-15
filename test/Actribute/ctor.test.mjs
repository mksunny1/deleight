import { test, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Actribute } from "../../src/actribute.js";

describe("actribute.constructor", () => {
  it("Should create default instance without args", (t) => {
    const act = new Actribute();
    assert.equal(act.openAttr, "o-pen");
    assert.equal(act.closedAttr, "c-losed");
    assert.deepEqual(act.registry, {});
  });
  it("Should initialize with the correct constructor args", (t) => {
    const act = new Actribute({open: 'o-pened', closed: 'c-lose'});
    assert.equal(act.openAttr, "o-pened");
    assert.equal(act.closedAttr, "c-lose");
    assert.deepEqual(act.registry, {});
  });
});
