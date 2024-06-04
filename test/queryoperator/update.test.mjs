import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { update } from "../../src/queryoperator.js";
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

const elementMarkup = `
<p>Now adding content to article 1</p>
<p>Now adding content to article 2</p>
<p>Now adding content to article 3</p>
`;

describe("queryoperator.update", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLCollection = window.HTMLCollection;
    global.NodeList = window.NodeList;
    global.Element = window.Element;

    it("Should replace multiple targets correctly", (t) => {
        body.innerHTML = bodyMarkup;
        const element = document.createElement('template');
        element.innerHTML = elementMarkup;
        update(body.children, element.content.cloneNode(true).children);
        for (let i = 0; i < body.children.length; i++) {
            compare(body.children[i], element.content.children[i]);
        }
    });

    it("Should insert correctly when using arrays", (t) => {
        body.innerHTML = bodyMarkup;
        const element = document.createElement('template');
        element.innerHTML = elementMarkup;
        update(Array.from(body.children), Array.from(element.content.cloneNode(true).children));
        for (let i = 0; i < body.children.length; i++) {
            compare(body.children[i], element.content.children[i]);
        }
    });

    it("Should insert correctly when using generator", (t) => {
        function* gen(iter) { for (let item of iter) yield item; }
        body.innerHTML = bodyMarkup;
        const element = document.createElement('template');
        element.innerHTML = elementMarkup;
        update(gen(body.children), gen(element.content.cloneNode(true).children));
        for (let i = 0; i < body.children.length; i++) {
            compare(body.children[i], element.content.children[i]);
        }
    });

});
