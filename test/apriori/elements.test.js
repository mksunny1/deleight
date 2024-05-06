import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { elements } from "../../src/apriori.js";
import { JSDOM } from "jsdom";


describe("apriori.createFragment", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;

    global.document = document;
  
    it("Should create the specified elements", async (t) => {
        const els = [...elements('div p span')];
        const cls = [window.HTMLDivElement, window.HTMLParagraphElement, window.HTMLSpanElement];
        for (let i = 0; i < 3; i++) assert.equal(els[i] instanceof cls[i], true); 
    });

});

