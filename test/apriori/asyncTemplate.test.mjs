import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { asyncTemplate } from "../../src/apriori.js";

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

describe("apriori.asynTemplate", () => {
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

