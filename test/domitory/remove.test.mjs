import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { remove } from "../../src/domitory.js";
import { JSDOM } from "jsdom";
import { compare } from "../comparer.js";

const bodyMarkup = `
<article>
    <h2>Article 1</h2>
    <p>No body for now</p>
</article>
<article>
    <h2>Article 2</h2>
    <p>No body for now</p>
</article>
<article>
    <h2>Article 3</h2>
    <p>No body for now</p>
</article>
`;

describe("domitory.remove", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLCollection = window.HTMLCollection;
    global.NodeList = window.NodeList;
    global.Element = window.Element;

    it("Should remove multiple targets correctly", (t) => {
        body.innerHTML = bodyMarkup;
        assert.equal(body.children.length, 3);
        remove(body.children);
        assert.equal(body.children.length, 0);
    });

    it("Should remove correctly when using arrays", (t) => {
        body.innerHTML = bodyMarkup;
        assert.equal(body.children.length, 3);
        remove(Array.from(body.children));
        assert.equal(body.children.length, 0);
    });

    it("Should insert correctly when using generator", (t) => {
        function* gen(iter) { for (let item of iter) yield item; }
        body.innerHTML = bodyMarkup;
        assert.equal(body.children.length, 3);
        remove(gen(body.children));
        assert.equal(body.children.length, 0);
    });
    
});
