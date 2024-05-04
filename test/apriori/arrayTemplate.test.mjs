import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { arrayTemplate } from "../../src/apriori.js";

const markup = `<article>This \${arg} is my \${it} blog post</article>`;

const renderedMarkup = `<article>This thing is my first blog post</article><article>This thing is my second blog post</article>`;

const renderedMarkup2 = `<article>This thing is my first blog post</article>&<article>This thing is my second blog post</article>`;

describe("apriori.template", () => {
  
    it("Should render correctly", (t) => {
        const templateFunction = arrayTemplate(markup, ['arg'], 'it');
        assert.equal(templateFunction(['first', 'second'], 'thing').trim(), renderedMarkup); 
    });

    it("Should rnot ender correctly", (t) => {
        const templateFunction = arrayTemplate(markup, ['arg'], 'it');
        assert.notEqual(templateFunction(['first', Promise.resolve('second')], 'thing').trim(), renderedMarkup); 
    });

    it("Should use the correct item separator", (t) => {
        const templateFunction = arrayTemplate(markup, ['arg'], 'it', '&');
        assert.equal(templateFunction(['first', 'second'], 'thing').trim(), renderedMarkup2); 
    });

});

