

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { ruleSelectorAll } from "../../src/appliance.js";
import { JSDOM } from "jsdom";

describe("Appliance.ruleSelectorAll", () => {
  const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
  const document = window.document;
  const body = document.body;

  global.document = document;
  global.HTMLStyleElement = window.HTMLStyleElement;
  global.Element = window.Element;
  global.CSSRule = window.CSSRule;

  it("Should match CSS rules", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    <div>I am a div</div>
    <main>
        <p>I am a paragraph</p>
        <section>I am a section</section>
        <section>I am a section</section>
        <section>I am a section</section>
    </main>
    <style>
        div {color: blue}
        section {color: yellow;}
    </style>
    <section>I am a section</section>
    `;

    const style = body.querySelector('style');
    const rules = ruleSelectorAll('section', style);
    assert.equal(rules.length, 1);
    assert.equal(rules[0].cssText.trim(), 'section {color: yellow;}');
  });

});

