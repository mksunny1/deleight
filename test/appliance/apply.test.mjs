import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { apply } from "../../src/appliance.js";
import { JSDOM } from "jsdom";

describe("Appliance.apply", () => {
  
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
    apply({
        div: div => assert.equal(div.textContent, 'I am a div')
    });
  });

  it("Should call all specified functions", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    `;
    let f1 = 0, f2 = 0;
    apply({
        div: [div => f1++, div => f2++]
    });
    assert.equal(f1, 1);
    assert.equal(f2, 1);
  });

  it("Should match the correct selectors", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;

    apply({
        div: div => assert.equal(div.textContent, 'I am a div'),
        p: p => assert.equal(p.textContent, 'I am a paragraph'),
        article: article => assert.equal(article.textContent, 'I am an article'),
        section: section => assert.equal(section.textContent, 'I am a section')
    });
  });

  it("Should match the correct number of items", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <section>I am a section</section>
    <section>I am a section</section>
    <section>I am a section</section>
    `;

    apply({
        div: (...divs) => assert.equal(divs.length, 2),
        p: (...ps) => assert.equal(ps.length, 1),
        article: (...articles) => assert.equal(articles.length, 0),
        section: (...sections) => assert.equal(sections.length, 4)
    });
  });


  it("Should apply only to the container element", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    <div>I am a div</div>
    <main>
        <p>I am a paragraph</p>
        <section>I am a section</section>
        <section>I am a section</section>
        <section>I am a section</section>
    </main>
    <section>I am a section</section>
    `;

    const main = body.querySelector('main');
    apply({
        div: (...divs) => assert.equal(divs.length, 0),
        p: (...ps) => assert.equal(ps.length, 1),
        article: (...articles) => assert.equal(articles.length, 0),
        section: (...sections) => assert.equal(sections.length, 3)
    }, main);
  });


  it("Should call the function for each item when asComponent is true", (t) => {
    body.innerHTML = `
    <div>I am a div</div>
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <section>I am a section</section>
    <section>I am a section</section>
    <section>I am a section</section>
    `;

    let divCount = 0, pCount = 0, articleCount = 0, sectionCount = 0;
    apply({
        div: (...divs) => divCount += divs.length,
        p: (...ps) => pCount += ps.length,
        article: (...articles) => articleCount += articles.length,
        section: (...sections) => sectionCount += sections.length
    }, body, true);

    assert.equal(divCount, 2);
    assert.equal(pCount, 1);
    assert.equal(articleCount, 0);
    assert.equal(sectionCount, 4);

  });

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
        section {color: yellow}
    </style>
    <section>I am a section</section>
    `;

    const style = body.querySelector('style');
    apply({
        div: (div) => assert.equal(div instanceof window.CSSRule, true),
        p: (...ps) => assert.equal(ps.length, 0),
        article: (...articles) => assert.equal(articles.length, 0),
        section: (...sections) => assert.equal(sections.length, 1)
    }, style);
  });

});

