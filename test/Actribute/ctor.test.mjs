import { test, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Actribute } from "../../src/actribute.js";

describe("actribute.constructor", () => {
  it("Should create default instance without args", (t) => {
    const act = new Actribute();
    assert.deepEqual(act.props, {});
    assert.equal(act.attrPrefix, "c-");
    assert.deepEqual(act.registry, {});
  });
  it("Should set only props with one arg", (t) => {
    const props = { a: 1, b: 2, c: 3 };
    const act = new Actribute(props);
    assert.deepEqual(act.props, props);
    assert.equal(act.attrPrefix, "c-");
    assert.deepEqual(act.registry, {});
  });
  it("Should set only props and attrPrefix with 2 args", (t) => {
    const props = { a: 1, b: 2, c: 3 };
    const pref = "o-";
    const act = new Actribute(props, pref);
    assert.deepEqual(act.props, props);
    assert.equal(act.attrPrefix, pref);
    assert.deepEqual(act.registry, {});
  });
});
