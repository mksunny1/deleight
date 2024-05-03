

import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { ruleSelector } from "../../src/appliance.js";
import { JSDOM } from "jsdom";

describe("Appliance.ruleSelector", () => {
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
        div {color: blue;}
        section {color: yellow;}
    </style>
    <section>I am a section</section>
    `;

    const style = body.querySelector('style');
    const rule = ruleSelector('div', style);
    assert.equal(rule.cssText.trim(), 'div {color: blue;}');
  });

});

