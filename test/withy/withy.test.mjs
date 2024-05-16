import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { With, WITH, SET, ASSIGN  } from "../../src/withy.js";

describe("withy.With", () => {
    const obj = {
        count: 0,
        inc() {this.count++},
        o1: {c: 1},
        o2: {c: 2}
    };

    it('Should be recursive, call methods and return non-methods', (t) => {
        assert.equal(With(obj).inc().inc().inc().count, 3)
    })
    
    it('Should assign new properties', (t) => {
        assert.equal(With(obj)[ASSIGN]({prop1: 5, prop2: 6}).inc().prop2, 6)
    })

    it('Should throw if we set a new property', (t) => {
        assert.throws(() => With(obj)[SET]({prop3: 5, prop4: 6}).inc().prop2)
    })

    it('Should not throw if we set an existing property', (t) => {
        assert.equal(With(obj)[SET]({prop1: 51, prop2: 66}).prop1, 51)
    })

    it('Should be nestable', (t) => {
        With(obj)[WITH]({o1: o1 => {
            assert.equal(o1.c, 1);
        }, o2: o2 => {
            assert.equal(o2.c, 2);
        }})
    })
    
});
