import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { tag } from "../../src/apriori.js";

const renderedMarkup = `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
`;

describe("apriori.asynTemplate", () => {
    it("Should not render correctly", async (t) => {
        const arg1 = 'first', arg2 = Promise.resolve('second');
        assert.notEqual(`
<article>This is my ${arg1} blog post</article>
<article>This is my ${arg2} blog post</article>
        `.trim(), renderedMarkup.trim()); 
    });

    it("Should render correctly", async (t) => {
        const arg1 = 'first', arg2 = Promise.resolve('second');
        assert.equal((await tag`
<article>This is my ${arg1} blog post</article>
<article>This is my ${arg2} blog post</article>
        `).trim(), renderedMarkup.trim()); 
    });

});

