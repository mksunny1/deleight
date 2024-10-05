import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { createFragment, loadFragment } from "./html.js";
import { JSDOM } from "jsdom";

describe("createFragment", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLStyleElement = window.HTMLStyleElement;
    global.Element = window.Element;
    global.DocumentFragment = window.DocumentFragment;
    global.CSSRule = window.CSSRule;

    it("Should create a DocumentFragment from markup", async (t) => {
        assert.equal(createFragment(`
        <section>Section 1</section>
        <section>Section 2</section>
        `) instanceof window.DocumentFragment, true); 
    });

    it("Should produce correct content", async (t) => {
        assert.equal(createFragment(`
        <div>I am the only div!</div>
        `).children[0].textContent.trim(), 'I am the only div!'); 
    });
    
});

