import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { build, render } from "./element.js";
import { JSDOM } from "jsdom";
const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
const document = window.document;
const body = document.body;
globalThis.document = document;
globalThis.HTMLStyleElement = window.HTMLStyleElement;
globalThis.Element = window.Element;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.CSSRule = window.CSSRule;
describe("render", () => {
    it("Should render an element from an IElement", async (t) => {
        const rendered = render({
            main: [{ class: 'right bg' }, 9]
        });
        console.log(rendered);
        assert.equal(rendered.trim(), `<main class="right bg">
    9
</main>`);
    });
});

describe("build", () => {
    it("Should build an element from an IElement", async (t) => {
        const built = build({
            main: [{ class: 'right bg' }, 9]
        });
        assert.equal(built.tagName, "MAIN");
        assert.equal(built.getAttribute('class'), "right bg");
        assert.equal(built.textContent.trim(), "9");
    });
});
