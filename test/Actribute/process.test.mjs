import { test, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Actribute, closed, join, open, props } from "../../src/actribute.js";
import { JSDOM } from "jsdom";

describe("actribute.process", () => {
  const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
  const document = window.document;
  const body = document.body;

  global.Element = window.Element;

  it("Should correctly process a component without args", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp>I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "P");
  });

  it("Should correctly process a component with args", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p>I am now not a component</p>
    <section c-comp="b e">I am now a component with args</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const aProps = { a: 1, b: { c: 1, d: 2 }, e: 3 };
    const comp = (node, attr) => comps.push([node.textContent.trim(), ...props(attr.value, [aProps])]);
    act.register({ comp });

    act.process(body);

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

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "P");
  });

  it("Should correctly handle recursive components", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <main r-comp><p>I am a recursive component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    console.log(comps);
    assert.equal(comps.length, 2);
    assert.equal(comps[0], "MAIN");
    assert.equal(comps[1], "P");
  });

  it("Should stop recursion at components closed with attribute", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <main r-comp>
      <div><span>I will get processed</span></div>
      <div c-losed><mark>I will not be processed</mark></div>
    </main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 4);
    assert.equal(comps.includes('SPAN'), true);
    assert.equal(comps.includes('MARK'), false);
  });

  it("Should stop recursion at components closed witth symbol", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <main r-comp>
      <div><span>I will get processed</span></div>
      <div c-c2><mark>I will not be processed</mark></div>
    </main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    const c2 = () => closed;
    act.register({ comp, c2 });

    act.process(body);

    assert.equal(comps.length, 4);
    assert.equal(comps.includes('SPAN'), true);
    assert.equal(comps.includes('MARK'), false);
  });

  it("Should prioritise closed over open", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <main r-comp>
      <div><span>I will get processed</span></div>
      <div o-pen c-losed><mark>I will not be processed</mark></div>
    </main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 4);
    assert.equal(comps.includes('SPAN'), true);
    assert.equal(comps.includes('MARK'), false);
  });

  it("Should correctly handle joined components", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <main c-comp><p>I am inside a joined component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const baseComp = (node) => comps.push(node.tagName);
    const comp = join([baseComp, baseComp, baseComp]);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 3);
    assert.equal(comps[0], "MAIN");
    assert.equal(comps[1], "MAIN");
    assert.equal(comps[2], "MAIN");
  });

  it("Should not find nested components", (t) => {
    // nested components must be processed in their parent component functions
    body.innerHTML = `
    <div>I am not a component</div>
    <main c-comp><p c-comp>I am a nested component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "MAIN");
  });

  it("Should find nested components if their parent has the 'o-pen' attribute", (t) => {
    // nested components must be processed in their parent component functions
    body.innerHTML = `
    <div>I am not a component</div>
    <main c-comp o-pen><p c-comp>I am a nested component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 2);
    assert.equal(comps[1], "P");
  });

  it("Should also find nested components if their parent returns the open symbol", (t) => {
    // nested components must be processed in their parent component functions
    body.innerHTML = `
    <div>I am not a component</div>
    <main c-comp ><p c-comp>I am a nested component</p></main>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName) && open;
    act.register({ comp });

    act.process(body);

    assert.equal(comps.length, 2);
    assert.equal(comps[1], "P");
  });

  it("Should use correct attrPrefix", (t) => {
    body.innerHTML = `
    <div a-comp>I am the correct component</div>
    <p c-comp>I am the wrong component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute({});
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ comp });

    act.process({el: body, attr: "a-"});

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "DIV");
  });

  it("Should throw if a component is not found", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp>I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    assert.throws(() => act.process(body));
  });

  it("Should use wildcard components", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp>I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register({ '*': comp });
    act.process(body);
    assert.equal(comps.length, 1);
    assert.equal(comps[0], 'P');
  });

});

