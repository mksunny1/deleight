import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { apply } from "./apply.js";
import { JSDOM } from "jsdom";

describe("apply", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLStyleElement = window.HTMLStyleElement;
    global.Element = window.Element;
    global.DocumentFragment = window.DocumentFragment;
    global.CSSRule = window.CSSRule;

    it("Should work with only an apply map using body as container element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    `;
    apply({
            div: divs => assert.equal(divs[0].textContent, 'I am a div')
        });
    });

    it("Should call all specified functions", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    `;
        let f1 = 0, f2 = 0;
        apply({
            div: [divs => f1++, divs => f2++]
        });
        assert.equal(f1, 1);
        assert.equal(f2, 1);
    });

    it("Should match the correct string selectors", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;

    apply({
            div: divs => assert.equal(divs[0].textContent, 'I am a div'),
            p: ps => assert.equal(ps[0].textContent, 'I am a paragraph'),
            article: articles => assert.equal(articles[0].textContent, 'I am an article'),
            section: sections => assert.equal(sections[0].textContent, 'I am a section')
        });
    });


    it("Should match the correct number selectors", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;

    apply({
            div: divs => assert.equal(divs[0].textContent, 'I am a div'),
            p: ps => assert.equal(ps[0].textContent, 'I am a paragraph'),
            [-1]: articles => assert.equal(articles[0].textContent, 'I am an article'),
            2: sections => assert.equal(sections[0].textContent, 'I am a section')
        }, body);
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
            div: (divs) => assert.equal(divs.length, 2),
            p: (ps) => assert.equal(ps.length, 1),
            article: (articles) => assert.equal(articles.length, 0),
            section: (sections) => assert.equal(sections.length, 4)
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
            div: (divs) => assert.equal(divs.length, 0),
            p: (ps) => assert.equal(ps.length, 1),
            article: (articles) => assert.equal(articles.length, 0),
            section: (sections) => assert.equal(sections.length, 3)
        }, main);
    });

    it("Should call nested apply", (t) => {
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

    apply({
            main: {
                div: (divs) => assert.equal(divs.length, 0),
                p: (ps) => assert.equal(ps.length, 1),
                article: (articles) => assert.equal(articles.length, 0),
                section: (sections) => assert.equal(sections.length, 3)
            }
        }, body);
    });


    it("Should match support new getters", (t) => {
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

        function* cssRuleGetter(target, key) {
            for (let rule of target.sheet.cssRules) {
                if (rule.cssText.startsWith(key)) yield rule;
            }
        }

        const style = body.querySelector('style');
        apply({
            div: ([...divs]) => assert.equal(divs[0] instanceof window.CSSRule, true),
            p: ([...ps]) => assert.equal(ps.length, 0),
            article: ([...articles]) => assert.equal(articles.length, 0),
            section: ([...sections]) => assert.equal(sections.length, 1)
        }, style, { getter: cssRuleGetter });

    });

});

