import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { applyTo } from "../../src/appliance.js";
import { JSDOM } from "jsdom";

describe("appliance.applyTo", () => {
  const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
  const document = window.document;
  const body = document.body;

  global.document = document;
  global.HTMLStyleElement = window.HTMLStyleElement;
  global.Element = window.Element;
  global.CSSRule = window.CSSRule;

  it("Should work with only an apply map usinf body as container element", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    `;
    const divs = body.querySelectorAll('div');
    applyTo(divs, div => assert.equal(div.textContent, 'I am a div'));
  });

  it("Should call all specified functions", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    `;
    let f1 = 0, f2 = 0;
    const divs = body.querySelectorAll('div');
    applyTo(divs, [div => f1++, div => f2++]);
    assert.equal(f1, 1);
    assert.equal(f2, 1);
  });

});

