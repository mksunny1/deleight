import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { Selector, selector, member, attr, method } from './selector.js'
import { JSDOM } from "jsdom";

const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
const document = window.document;
const body = document.body;

global.document = document;
global.HTMLStyleElement = window.HTMLStyleElement;
global.Element = window.Element;
global.CSSRule = window.CSSRule;

describe("selector.Selector", () => {
    it("Should select the correct element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    <main>
        <p>P in MAIN</p>
    </main>
    `;
        const slct = new Selector(body);
        assert.equal(slct.get('div').textContent, 'I am a div')
        assert.equal(slct.get('p').textContent, 'I am a paragraph')
        assert.equal(slct.get('article').textContent, 'I am an article')
        assert.equal(slct.get('main & p').textContent, 'P in MAIN')
        assert.equal(slct.get('section').textContent, 'I am a section')
        assert.equal(slct.get(1).textContent, 'I am a paragraph')
        assert.equal(slct.get(-2).textContent, 'I am an article')
    });

    it("Should set the correct element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = new Selector(body);
        const span = document.createElement('span');
        span.textContent = 'I am a span';
        slct.set('div', span)
        assert.equal(slct.get('div'), null)
        assert.equal(slct.get('span').textContent, 'I am a span')
        assert.equal(slct.get('p').textContent, 'I am a paragraph')
        assert.equal(slct.get('article').textContent, 'I am an article')
        assert.equal(slct.get('section').textContent, 'I am a section')
    });

    it("Should delete the correct element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = new Selector(body);
        slct.delete('div')
        assert.equal(slct.get('div'), null)
        assert.equal(slct.get('span'), null)
        assert.equal(slct.get('p').textContent, 'I am a paragraph')
        assert.equal(slct.get('article').textContent, 'I am an article')
        assert.equal(slct.get('section').textContent, 'I am a section')
    });

});

describe("selector.selector", () => {
    it("Should select the correct element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = selector(body);
        assert.equal(slct.div.textContent, 'I am a div')
        assert.equal(slct.p.textContent, 'I am a paragraph')
        assert.equal(slct.article.textContent, 'I am an article')
        assert.equal(slct.section.textContent, 'I am a section')
    });

    it("Should set the correct element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = selector(body);
        const span = document.createElement('span');
        span.textContent = 'I am a span';
        slct.div = span;
        assert.equal(slct.div, null)
        assert.equal(slct.span.textContent, 'I am a span')
        assert.equal(slct.p.textContent, 'I am a paragraph')
        assert.equal(slct.article.textContent, 'I am an article')
        assert.equal(slct.section.textContent, 'I am a section')
    });

    it("Should delete the correct element", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = selector(body);
        delete slct.div;
        assert.equal(slct.div, null)
        assert.equal(slct.span, null)
        assert.equal(slct.p.textContent, 'I am a paragraph')
        assert.equal(slct.article.textContent, 'I am an article')
        assert.equal(slct.section.textContent, 'I am a section')
    });

});


describe("selector.member", () => {
    it("Should select the correct element member (property)", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = member('textContent', body);
        assert.equal(slct.div, 'I am a div')
        assert.equal(slct.p, 'I am a paragraph')
        assert.equal(slct.article, 'I am an article')
        assert.equal(slct.section, 'I am a section')
    });

    it("Should set the correct element member", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        const slct = member('textContent', body);
        slct.div = 'I am a span';
        assert.equal(slct.div, 'I am a span')
        assert.equal(slct.p, 'I am a paragraph')
        assert.equal(slct.article, 'I am an article')
        assert.equal(slct.section, 'I am a section')
    });

    it("Should delete the correct element member", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        // NB: textContent cannot be deleted; so work with something else...
        const slct = member('prop', body);
        for (let element of body.children) element.prop = element.textContent;
        delete slct.div;
        assert.equal(slct.div, undefined);
        assert.equal(slct.p, 'I am a paragraph');
        assert.equal(slct.article, 'I am an article');
        assert.equal(slct.section, 'I am a section');
    });

});

describe("selector.attr", () => {
    it("Should select the correct element attribute", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        for (let element of body.children) element.setAttribute('class', element.textContent);

        const slct = attr('class', body);
        assert.equal(slct.div, 'I am a div')
        assert.equal(slct.p, 'I am a paragraph')
        assert.equal(slct.article, 'I am an article')
        assert.equal(slct.section, 'I am a section')
    });

    it("Should set the correct element member", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        for (let element of body.children) element.setAttribute('class', element.textContent);
        const slct = attr('class', body);
        slct.div = 'I am a span';
        assert.equal(slct.div, 'I am a span')
        assert.equal(slct.p, 'I am a paragraph')
        assert.equal(slct.article, 'I am an article')
        assert.equal(slct.section, 'I am a section')
    });

    it("Should delete the correct element member", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        
        for (let element of body.children) element.setAttribute('class', element.textContent);
        const slct = attr('class', body);
        delete slct.div;
        assert.equal(slct.div, null);
        assert.equal(slct.p, 'I am a paragraph');
        assert.equal(slct.article, 'I am an article');
        assert.equal(slct.section, 'I am a section');
    });

});

describe("selector.method", () => {
    it("Should call the correct element method", (t) => {
        body.innerHTML = `
    <div>I am a div</div>
    <p>I am a paragraph</p>
    <section>I am a section</section>
    <article>I am an article</article>
    `;
        
        const slct = method('remove', body);
        assert.equal(body.children[1].textContent, 'I am a paragraph')
        slct.p();
        assert.equal(body.children[1].textContent, 'I am a section')
    });

});
