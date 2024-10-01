import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { process } from "./process.js";
import { JSDOM } from "jsdom";

describe("processElement", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    // console.log(Reflect.ownKeys(body))

    global.Element = window.Element;
    global.DocumentFragment = window.DocumentFragment;

    it("Should correctly process an element without component args", (t) => {
        body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp>I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, {comp});

        assert.equal(comps.length, 1);
        assert.equal(comps[0], "P");
    });

    it("Should correctly process an element with component args", (t) => {
        body.innerHTML = `
    <div>I am not a component</div>
    <p>I am now not a component</p>
    <section c-comp="b e">I am now a component with args</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const aProps = { a: 1, b: { c: 1, d: 2 }, e: 3 };
        const comp = ([node], attr) => comps.push([node.textContent.trim(), ...attr.value.split(' ').map(v => aProps[v])]);
        process(body, { comp });

        assert.equal(comps.length, 1);
        assert.equal(comps[0][0], "I am now a component with args");
        assert.deepEqual(comps[0][1], aProps.b);
        assert.equal(comps[0][2], aProps.e);
    });

    it("Should find components deeper in the tree", (t) => {
        body.innerHTML = `
    <div>I am not a component</div>
    <main><p c-comp>I am a deeper component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, {comp});

        assert.equal(comps.length, 1);
        assert.equal(comps[0], "P");
    });

    it("Should prioritise closed over open", (t) => {
        body.innerHTML = `
    <div>I am not a component</div>
    <main o-comp>
      <div o-comp><span c-comp>I will get processed</span></div>
      <div o-comp ope-n close-d><mark c-comp>I will not be processed</mark></div>
    </main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, {comp});

        assert.equal(comps.length, 4);
        assert.equal(comps.includes('SPAN'), true);
        assert.equal(comps.includes('MARK'), false);
    });

    it("Should not find nested components", (t) => {
        // nested components must be processed in their parent component functions
        body.innerHTML = `
    <div>I am not a component</div>
    <main c-comp><p c-comp>I am a nested component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, {comp});

        assert.equal(comps.length, 1);
        assert.equal(comps[0], "MAIN");
    });

    it("Should find nested components if their parent has the 'o-pen' attribute", (t) => {
        // nested components would otherwise be processed in their parent component functions
        body.innerHTML = `
    <div>I am not a component</div>
    <main c-comp ope-n><p c-comp>I am a nested component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, {comp});

        assert.equal(comps.length, 2);
        assert.equal(comps[1], "P");
    });

    it("Should use correct prefix", (t) => {
        body.innerHTML = `
    <div a-comp>I am the correct component</div>
    <p c-comp>I am the wrong component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, {comp}, { prefix: "a-" });

        assert.equal(comps.length, 1);
        assert.equal(comps[0], "DIV");
    });

    it("Should also accept functions in place of components", (t) => {
        body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp>I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;
        const comps = [];
        const comp = ([node]) => comps.push(node.tagName);
        process(body, comp);
        assert.equal(comps.length, 4);
        assert.equal(comps[0], 'DIV');
    });

});

