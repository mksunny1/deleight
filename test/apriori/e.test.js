import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { e } from "../../src/apriori.js";
import { JSDOM } from "jsdom";


describe("apriori.createFragment", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;

    global.document = document;
    globalThis.Node = window.Node

    it("Should create and setup the specified elements", async (t) => {
        let tagName = '';
        const tree = e.main(
            e.h1(
                'Title',                               // stringd are appended
                h1 => tagName = h1.tagName),    // functions are called with the new element
            e.section(
                e.h2('Section 1'),
                e.p(
                    'This is the first section',
                    { className: 'text-centre' }  // objects are used to assign properties.
                )
            )                                  // nodes are appended
        );
        assert.equal(tree.tagName, 'MAIN');
        assert.equal(tree.children.length, 2);
        assert.equal(tree.firstChild.tagName, 'H1');
        assert.equal(tree.firstChild.textContent, 'Title');
        assert.equal(tree.lastChild.tagName, 'SECTION');
        assert.equal(tree.lastChild.children.length, 2);
        assert.equal(tree.lastChild.lastChild.className, 'text-centre');
        assert.equal(tagName, 'H1');
    });

});

