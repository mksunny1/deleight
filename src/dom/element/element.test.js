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
        assert.equal(rendered.trim(), `<main class="right bg">
    9
</main>`);
    });
});

describe("build", () => {
    it("Should build an element from an IElement", async (t) => {
        // create a component:
        const items = it => it.map(num => ({li: [{}, num]}));

        // use a component (1):
        const built1 = build({
            ul: [{ class: 'list1' }, items([1,2,3,4,5,6,7,8,9])]
        });

        // use a component (2):
        const built2 = build({
            ol: [{ class: 'list2' }, items([1,2,3,4,5,6,7,8,9,10])]
        });
        assert.equal(built1.tagName, "UL");
        assert.equal(built2.tagName, "OL");
        assert.equal(built1.getAttribute('class'), "list1");
        assert.equal(built2.getAttribute('class'), "list2");
        assert.equal(built1.children.length, 9);
        assert.equal(built2.children.length, 10);
        assert.equal(built1.children[0].textContent.trim(), '1');
        assert.equal(built2.children[9].textContent.trim(), '10');
    });
});
