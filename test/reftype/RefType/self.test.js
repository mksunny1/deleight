import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('IterRefType.options.self', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    it('Should correctly add elements for an array', (t) => {
        const refs = [
            'Introduction' , 'History' ,
            'Machine Learning in action',
            'Machine Learning in practice',
            'Machine Learning in JavaScript'
        ];

        const reftype = new IterRefType(refs);
        body.innerHTML = `
        <main ite-r>
            <article>
                <header>
                    <p t class="title">.</p>
                </header>
                <p>
                    In this chapter...
                </p>
            </article>
        </main>
        `;
        const main = body.querySelector('main');
        const articleTemplate = main.firstElementChild;

        reftype.add(main)    
        // must add the parent element dirctly. dont add body for example.

        assert.equal(main.children.length, 5);
        assert.equal(reftype.items.get(main).length, 5);
        assert.equal(reftype.templates.get(main) === articleTemplate, true);

        for (let i = 0; i < 5; i++) {
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i]);
        }
    });
    
});
