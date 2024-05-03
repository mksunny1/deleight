import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { parentSelector } from "../../src/appliance.js";
import { JSDOM } from "jsdom";

describe("Appliance.parentSelector", () => {
  
  const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
  const document = window.document;
  const body = document.body;

  global.document = document;
  global.HTMLStyleElement = window.HTMLStyleElement;
  global.Element = window.Element;
  global.CSSRule = window.CSSRule;

  it("Should find the correct parent", (t) => {
    body.innerHTML = `
    <main>
        <div>I am a div</div>
        <div>
            <p>I am a paragraph</p>
        </div>
        <section>I am a section</section>
        <article>I am an article</article>
    <main>
    `;

    const p = body.querySelector('p');
    assert.equal(parentSelector(p, 'div').tagName, 'DIV'); 
    assert.equal(parentSelector(p, 'main').tagName, 'MAIN');

  });

});

