import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { template } from "../../src/apriori.js";

const markup = `
<article>This is my \${arg1} blog post</article>
<article>This is my \${arg2} blog post</article>
`;

const renderedMarkup = `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
`;

describe("apriori.template", () => {
  
    it("Should render correctly", (t) => {
        const templateFunction = template(markup, ['arg1', 'arg2']);
        assert.equal(templateFunction('first', 'second'), renderedMarkup); 
    });

    it("Should not render correctly", (t) => {
        const templateFunction = template(markup, ['arg1', 'arg2']);
        assert.notEqual(templateFunction('first', Promise.resolve('second')), renderedMarkup); 
    });

});

