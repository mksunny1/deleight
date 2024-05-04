import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { createFragment } from "../../src/apriori.js";
import { JSDOM } from "jsdom";


describe("apriori.createFragment", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
  
    it("Should create a DocumentFragment from markup", async (t) => {
        assert.equal(createFragment(`
        <section>Section 1</section>
        <section>Section 2</section>
        `) instanceof window.DocumentFragment, true); 
    });

    it("Should return the child if a fragment has only one", async (t) => {
        assert.equal(createFragment(`
        <div>I am the only div!</div>
        `) instanceof window.HTMLDivElement, true); 
    });

    it("Should produce correct content", async (t) => {
        assert.equal(createFragment(`
        <div>I am the only div!</div>
        `).textContent.trim(), 'I am the only div!'); 
    });

});

