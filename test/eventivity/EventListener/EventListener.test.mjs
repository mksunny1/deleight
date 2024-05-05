import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { EventListener } from "../../../src/eventivity.js";
import { JSDOM } from "jsdom";

const bodyMarkup = `
<article>
    <h2>Article 1</h2>
    <p>No body for now</p>
    <button id="b1">Btn1</button>
</article>
<article>
    <h2>Article 2</h2>
    <p>No body for now</p>
    <button id="b2">Btn2</button>
</article>
<article>
    <h2>Article 3</h2>
    <p>No body for now</p>
    <button id="b3">Btn3</button>
</article>
`;

describe("eventivity.EventListener", async () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLCollection = window.HTMLCollection;
    global.NodeList = window.NodeList;
    global.Element = window.Element;

    body.innerHTML = bodyMarkup;
    let counter = 0;
    const listener = new EventListener(() => {
        counter++;
    });

    await it("Should create a valid listener", (t) => {
        listener.listener();
        assert.equal(counter, 1);
    });

    const btn1 = body.querySelector('#b1')
    const btn2 = body.querySelector('#b2')
    
    await it("Should register the event with .listen", (t) => {
        listener.listen('click', [btn1, btn2]);
        btn1.click();
        assert.equal(counter, 2);
        btn2.click(); 
        assert.equal(counter, 3);
    });

    await it("Should remove the event with .remove", (t) => {
        listener.remove('click', btn1);
        btn1.click();
        assert.equal(counter, 3);
        btn2.click(); 
        assert.equal(counter, 4);
    });
    
})

