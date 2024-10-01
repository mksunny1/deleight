import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { asyncTag, template, templates, asyncTemplate, asyncTemplates } from "./template.js";

describe("asynTag", () => {
const renderedMarkup = `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
`;

    it("Should not render correctly", async (t) => {
        const arg1 = 'first', arg2 = Promise.resolve('second');
        assert.notEqual(`
<article>This is my ${arg1} blog post</article>
<article>This is my ${arg2} blog post</article>
        `.trim(), renderedMarkup.trim()); 
    });

    it("Should render correctly", async (t) => {
        const arg1 = 'first', arg2 = Promise.resolve('second');
        assert.equal((await asyncTag`
<article>This is my ${arg1} blog post</article>
<article>This is my ${arg2} blog post</article>
        `).trim(), renderedMarkup.trim()); 
    });

});

describe("template", () => {
  
const markup = `
<article>This is my \${arg1} blog post</article>
<article>This is my \${arg2} blog post</article>
`;

const renderedMarkup = `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
`;

    it("Should render correctly", (t) => {
        const templateFunction = template(markup, ['arg1', 'arg2']);
        assert.equal(templateFunction('first', 'second'), renderedMarkup); 
    });

    it("Should not render correctly", (t) => {
        const templateFunction = template(markup, ['arg1', 'arg2']);
        assert.notEqual(templateFunction('first', Promise.resolve('second')), renderedMarkup); 
    });

});

describe("templates", () => {
const markup = `<article>This \${arg} is my \${it} blog post</article>`;
const renderedMarkup = `<article>This thing is my first blog post</article><article>This thing is my second blog post</article>`;
const renderedMarkup2 = `<article>This thing is my first blog post</article>&<article>This thing is my second blog post</article>`;
    
    it("Should render correctly", (t) => {
        const templateFunction = templates(markup, ['items', 'arg'], 'it');
        assert.equal([...templateFunction(['first', 'second'], 'thing')].join('').trim(), renderedMarkup); 
    });

    it("Should rnot ender correctly", (t) => {
        const templateFunction = templates(markup, ['items', 'arg'], 'it');
        assert.notEqual([...templateFunction(['first', Promise.resolve('second')], 'thing')].join('').trim(), renderedMarkup); 
    });

    it("Should use the correct item separator", (t) => {
        const templateFunction = templates(markup, ['items', 'arg'], 'it');
        assert.equal([...templateFunction(['first', 'second'], 'thing')].join('&').trim(), renderedMarkup2); 
    });

});


describe("asynTemplate", () => {
const markup = `
<article>This is my \${arg1} blog post</article>
<article>This is my \${arg2} blog post</article>
`;

const markup2 = `
<article>This is my \${T} blog post</article>
<article>This is my \${arg2} blog post</article>
`;

const renderedMarkup = `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
`;
    
    it("Should render correctly", async (t) => {
        const templateFunction = asyncTemplate(markup, ['arg1', 'arg2']);
        assert.equal(await templateFunction('first', Promise.resolve('second')), renderedMarkup); 
    });

    it("Should throw if the tag name is present among the arg names",  (t) => {
        assert.throws(() => asyncTemplate(markup2, ['T', 'arg2'])); 
    });

    it("Should not throw if the tag name is absent in the arg names", async (t) => {
        const templateFunction = asyncTemplate(markup2, ['T', 'arg2'], 'A');
        assert.equal(await templateFunction('first', Promise.resolve('second')), renderedMarkup); 
    });
});

describe("asyncTemplates", () => {
const markup = `<article>This \${arg} is my \${it} blog post</article>`;
const markup2 = `<article>This \${T} is my \${it} blog post</article>`;

const renderedMarkup = `<article>This thing is my first blog post</article><article>This thing is my second blog post</article>`;

const renderedMarkup2 = `<article>This thing is my first blog post</article>&<article>This thing is my second blog post</article>`;

    it("Should render correctly", async (t) => {
        const templateFunction = asyncTemplates(markup, ['items', 'arg'], 'it');  
        // note: each returned item is a promise resolving to a string
        assert.equal((await Promise.all(templateFunction(['first', 'second'], 'thing'))).join('').trim(), renderedMarkup); 
    });

    it("Should also render correctly", async (t) => {
        const templateFunction = asyncTemplates(markup, ['items', 'arg'], 'it');
        assert.equal((await Promise.all(templateFunction(['first', Promise.resolve('second')], 'thing'))).join('').trim(), renderedMarkup); 
    });

    it("Should use the correct item separator", async (t) => {
        const templateFunction = asyncTemplates(markup, ['items', 'arg'], 'it');
        assert.equal((await Promise.all(templateFunction(['first', 'second'], 'thing'))).join('&').trim(), renderedMarkup2); 
    });

    it("Should throw if the tag name is present among the arg names",  (t) => {
        assert.throws(() => asyncTemplates(markup2, ['items', 'T'], 'it')); 
    });

    it("Should throw if the tag name is the same as the item name",  (t) => {
        assert.throws(() => asyncTemplates(markup, ['items', 'arg'], 'T')); 
    });

    it("Should not throw if the tag name is absent in the arg names", async (t) => {
        const templateFunction = asyncTemplates(markup2, ['items', 'T'], 'it', 'A');
        assert.equal((await Promise.all(templateFunction(['first', Promise.resolve('second')], 'thing'))).join('').trim(), renderedMarkup); 
    });

});


