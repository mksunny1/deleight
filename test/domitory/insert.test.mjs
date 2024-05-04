import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { insert } from "../../src/domitory.js";
import { JSDOM } from "jsdom";

describe("domitory.insert", () => {
  const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
  const document = window.document;
  const body = document.body;

  global.document = document;
  global.HTMLCollection = window.HTMLCollection;
  global.NodeList = window.NodeList;
  global.Element = window.Element;

  it("Should insert correctly into a single target", (t) => {
    body.innerHTML = ``;

    let element = document.createElement('template');
    element.innerHTML = `
    <h1>Title</h1>
    <main>[[Nothing yet]]</main>
    <footer>Cheers</footer>
    `
    element = element.content;
    insert([body], [element]);
    assert.equal(body.innerHTML.trim(), `
    <h1>Title</h1>
    <main>[[Nothing yet]]</main>
    <footer>Cheers</footer>
    `.trim());
  });

  it("Should insert correctly into multiple targets", (t) => {
    body.innerHTML = ``;

    let element = document.createElement('template');
    element.innerHTML = `
    <h1>Title</h1>
    <main>[[Nothing yet]]</main>
    <footer>Cheers</footer>
    `
    element = element.content;
    insert([body], [element]);
    assert.equal(body.innerHTML.trim(), `
    <h1>Title</h1>
    <main>[[Nothing yet]]</main>
    <footer>Cheers</footer>
    `.trim());
  });

});

