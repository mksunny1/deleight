import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { get } from "../../src/apriori.js";

describe("Apriori.get", () => {
  
  it("Should fetch text from given link", async (t) => {
    
    assert.equal((await get('get/markup.html')).trim(), `
<article>This is my first blog post</article>
<article>This is my second blog post</article>
<aside>By the way I am Sun</aside>
<article>My third blog post</article>
    `.trim()); 
  });
});

