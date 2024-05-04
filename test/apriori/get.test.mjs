import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { get } from "../../src/apriori.js";

const markup = `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
<aside>By the way I am Sun</aside>
<article>My third blog post</article>
`;

describe("apriori.get", () => {
    async function mFetch(url, options) {
        if (url === './get.html') return new Response(markup);
        else throw new Error('Could not fetch the resource at ' + url);
    }

    global.fetch = mFetch;
  
    it("Should fetch text from given link", async (t) => {
        assert.equal((await get('./get.html')), markup); 
    });

    it("Should throw if there is an error fetching", async (t) => {
        let errors = 0;
        await get('./throw.html').catch(err => errors++)
        assert.equal(errors, 1);
    });

    it("Should return empty if there is an error", async (t) => {
        let errors = 0;
        assert.equal((await get('./throw.html', true).catch(err => errors++)), '');
        assert.equal(errors, 0);
    });

});

