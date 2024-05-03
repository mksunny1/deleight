import { test, describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Actribute } from "../../src/actribute.js";
import { JSDOM } from "jsdom";

describe("Actribute.process", () => {
  const document = new JSDOM(`<!DOCTYPE html><body></body>`).window.document;
  const body = document.body;

  it("Should correctly process a component without props", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp>I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register("comp", comp);

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "P");
  });

  it("Should correctly process a component with props", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p>I am now not a component</p>
    <section c-comp="b e">I am now a component with props</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const props = { a: 1, b: { c: 1, d: 2 }, e: 3 };
    const comp = (node, b, e) => comps.push([node.textContent.trim(), b, e]);
    act.register("comp", comp);

    act.process(body, props);

    assert.equal(comps.length, 1);
    assert.equal(comps[0][0], "I am now a component with props");
    assert.deepEqual(comps[0][1], props.b);
    assert.equal(comps[0][2], props.e);
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
    act.register("comp", comp);

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "P");
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
    act.register("comp", comp);

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "MAIN");
  });

  it("Should use fallback props", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p>I am now not a component</p>
    <section c-comp="b e f">I am now a component</section>
    <article>I am not a component</article>
    `;

    const fbProps = { f: 20, g: 7 };
    const act = new Actribute(fbProps);
    const comps = [];
    const props = { a: 1, b: { c: 1, d: 2 }, e: 3 };
    const comp = (node, b, e, f) =>
      comps.push([node.textContent.trim(), b, e, f]);
    act.register("comp", comp);

    act.process(body, props);

    assert.equal(comps.length, 1);
    assert.equal(comps[0][0], "I am now a component");
    assert.deepEqual(comps[0][1], props.b);
    assert.equal(comps[0][2], props.e);
    assert.equal(comps[0][3], fbProps.f);
  });

  it("Should use correct attrPrefix", (t) => {
    body.innerHTML = `
    <div a-comp>I am the correct component</div>
    <p c-comp>I am the wrong component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute({}, "a-");
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register("comp", comp);

    act.process(body);

    assert.equal(comps.length, 1);
    assert.equal(comps[0], "DIV");
  });

  it("Should use correct propSep", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p>I am now not a component</p>
    <section c-comp="b, e, big name, another big name">I am now a component with comma propSep and big names!</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const props = {
      a: 1,
      b: { c: 1, d: 2 },
      e: 3,
      "big name": 100,
      "another big name": 200,
    };
    const comp = (node, b, e, bn, abn) =>
      comps.push([node.tagName, b, e, bn, abn]);
    act.register("comp", comp);
    const propSep = ', ';

    act.process(body, props, propSep);

    assert.equal(comps.length, 1);
    assert.equal(comps[0][0], "SECTION");
    assert.deepEqual(comps[0][1], props.b);
    assert.equal(comps[0][2], props.e);
    assert.equal(comps[0][3], 100);
    assert.equal(comps[0][4], 200);
  });

  it("Should find nested props", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p>I am now not a component</p>
    <section c-comp="b, e, big.name">I am now a component with comma propSep and big names!</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const props = { a: 1, b: { c: 1, d: 2 }, e: 3, big: { name: 100 } };
    const comp = (node, b, e, bn) => comps.push([node.tagName, b, e, bn]);
    act.register("comp", comp);

    act.process(body, props, ",");

    assert.equal(comps.length, 1);
    assert.equal(comps[0][0], "SECTION");
    assert.deepEqual(comps[0][1], props.b);
    assert.equal(comps[0][2], props.e);
    assert.equal(comps[0][3], 100);
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

  it("Should throw if a prop is not found", (t) => {
    body.innerHTML = `
    <div>I am not a component</div>
    <p c-comp="unknownProp">I am a component</p>
    <section>I am not a component</section>
    <article>I am not a component</article>
    `;

    const act = new Actribute();
    const comps = [];
    const comp = (node) => comps.push(node.tagName);
    act.register("comp", comp);
    assert.throws(() => act.process(body));
  });
});
