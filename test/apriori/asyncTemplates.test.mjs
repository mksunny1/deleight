import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { asyncTemplates } from "../../src/apriori.js";

const markup = `<article>This \${arg} is my \${it} blog post</article>`;
const markup2 = `<article>This \${T} is my \${it} blog post</article>`;

const renderedMarkup = `<article>This thing is my first blog post</article><article>This thing is my second blog post</article>`;

const renderedMarkup2 = `<article>This thing is my first blog post</article>&<article>This thing is my second blog post</article>`;

describe("apriori.template", () => {
  
    it("Should render correctly", async (t) => {
        const templateFunction = asyncTemplates(markup, ['arg'], 'it');  
        // note: each returned item is a promise resolving to a string
        assert.equal((await Promise.all(templateFunction(['first', 'second'], 'thing'))).join('').trim(), renderedMarkup); 
    });

    it("Should also render correctly", async (t) => {
        const templateFunction = asyncTemplates(markup, ['arg'], 'it');
        assert.equal((await Promise.all(templateFunction(['first', Promise.resolve('second')], 'thing'))).join('').trim(), renderedMarkup); 
    });

    it("Should use the correct item separator", async (t) => {
        const templateFunction = asyncTemplates(markup, ['arg'], 'it');
        assert.equal((await Promise.all(templateFunction(['first', 'second'], 'thing'))).join('&').trim(), renderedMarkup2); 
    });

    it("Should throw if the tag name is present among the arg names",  (t) => {
        assert.throws(() => asyncTemplates(markup2, ['T'], 'it')); 
    });

    it("Should throw if the tag name is the same as the item name",  (t) => {
        assert.throws(() => asyncTemplates(markup, ['arg'], 'T')); 
    });

    it("Should not throw if the tag name is absent in the arg names", async (t) => {
        const templateFunction = asyncTemplates(markup2, ['T'], 'it', 'A');
        assert.equal((await Promise.all(templateFunction(['first', Promise.resolve('second')], 'thing'))).join('').trim(), renderedMarkup); 
    });

});

