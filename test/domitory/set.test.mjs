import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { set } from "../../src/domitory.js";
import { JSDOM } from "jsdom";
import { compare } from "../comparer.js";

const bodyMarkup = `
<article>
    <h2>Article 1</h2>
    <p>Now adding content to article 1</p>
</article>
<article>
    <h2>Article 2</h2>
    <p>Now adding content to article 2</p>
</article>
<article>
    <h2>Article 3</h2>
    <p>Now adding content to article 3</p>
</article>
`;


describe("domitory.set", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLCollection = window.HTMLCollection;
    global.NodeList = window.NodeList;
    global.Element = window.Element;

    it("Should set multiple properties correctly", (t) => {
        body.innerHTML = bodyMarkup;
        const pElements = body.querySelectorAll('p');
        const classNames = ['p1', 'p2', 'p3'];
        const textContents = ['Content 1', 'Amazing 2', 'Awesome 3'];
        set(pElements, {
            className: classNames,
            textContent: textContents
        });
        for (let i = 0; i < pElements.length; i++) {
            assert.equal(pElements[i].className, classNames[i]);
            assert.equal(pElements[i].textContent, textContents[i]);
        }
    });

    it("Should set correctly when using arrays", (t) => {
        body.innerHTML = bodyMarkup;
        const pElements = Array.from(body.querySelectorAll('p'));
        const classNames = ['p1', 'p2', 'p3'];
        const textContents = ['Content 1', 'Amazing 2', 'Awesome 3'];
        set(pElements, {
            className: classNames,
            textContent: textContents
        });
        for (let i = 0; i < pElements.length; i++) {
            assert.equal(pElements[i].className, classNames[i]);
            assert.equal(pElements[i].textContent, textContents[i]);
        }
    });

    it("Should set correctly when using generator", (t) => {
        function* gen(iter) { for (let item of iter) yield item; }
        const pElements = gen(body.querySelectorAll('p'));
        const classNames = ['p1', 'p2', 'p3'];
        const textContents = ['Content 1', 'Amazing 2', 'Awesome 3'];
        set(pElements, {
            className: classNames,
            textContent: textContents
        });
        for (let i = 0; i < pElements.length; i++) {
            assert.equal(pElements[i].className, classNames[i]);
            assert.equal(pElements[i].textContent, textContents[i]);
        }
    });

    it("Should set multiple attributes correctly", (t) => {
        body.innerHTML = bodyMarkup;
        const pElements = body.querySelectorAll('p');
        const classNames = ['p1', 'p2', 'p3'];
        const textContents = ['Content 1', 'Amazing 2', 'Awesome 3'];
        set(pElements, {
            _class: classNames,
            _title: textContents
        });
        for (let i = 0; i < pElements.length; i++) {
            assert.equal(pElements[i].getAttribute('class'), classNames[i]);
            assert.equal(pElements[i].getAttribute('title'), textContents[i]);
        }
    });

});

