import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { eventListener } from "../../src/eutility.js";
import { JSDOM } from "jsdom";
import { compare } from "../comparer.js";

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

describe("eutility.eventListener", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLCollection = window.HTMLCollection;
    global.NodeList = window.NodeList;
    global.Element = window.Element;

    it("Should create a valid listener", async (t) => {
        body.innerHTML = bodyMarkup;
        const runContext = {a: 1, b: 99};
        let a, b, btnText, running;
        const listener = eventListener((e, runContext) => {
            btnText = e.target.textContent;
            a = runContext.a;
            b = runContext.b;
            running = runContext.running;
        }, runContext);
        const btn = body.querySelector('#b2')
        btn.addEventListener('click', listener);
        btn.click();

        await it("Should listen to the correct button", (t) => {
            assert.equal(btnText, btn.textContent);
        });
        await it("Should receive the correct runContext", (t) => {
            assert.equal(a, runContext.a);
            assert.equal(b, runContext.b);
        });
        await it("Should see the correct value of 'running' in runContext", (t) => {
            assert.equal(running, true);
            assert.equal(runContext.running, false);
        });

    });

    it("Should correctly call all functions in the 'ops' argument", async (t) => {
        let c1 = 0, c2 = 0, c3 = 0;
        const f1 = () => c1++;
        const f2 = () => c2++;
        const f3 = () => c3++;

        const runContext = {a: 1, b: 99};
        const listener = eventListener([f1, f1, f2, f1, f3], runContext);
        await listener();       // listener is async. so we need to wait for completion.

        assert.equal(c1, 3);
        assert.equal(c2, 1);
        assert.equal(c3, 1);

    });


    it("Should await a returned promise", async (t) => {
        body.innerHTML = bodyMarkup;
        const btn1 = body.querySelector('#b1')
        const btn2 = body.querySelector('#b2')
        const btn3 = body.querySelector('#b3')
        
        let c1 = 0, c2 = 0, c3 = 0;
        const f1 = () => c1++;
        const f2 = () => c2++;
        const f3 = () => ++c3 && Promise.resolve(1) ;

        const runContext = {a: 1, b: 99};
        const listener1 = eventListener(f1, runContext);
        const listener3 = eventListener(f3, runContext);
        const listener2 = eventListener(f2, runContext);

        btn1.addEventListener('click', listener1);
        btn2.addEventListener('click', listener2);
        btn3.addEventListener('click', listener3);

        btn1.click();
        btn3.click();
        btn2.click();          // should fail to count because handler 3 returns a promise that must be awaited.

        assert.equal(c1, 1);
        assert.equal(c2, 0);
        assert.equal(c3, 1);

    });
    
});
