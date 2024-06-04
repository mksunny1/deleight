import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('IterRefType.delete', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    it('Should synchronously delete (splice) items', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];

        const reftype = new IterRefType(refs);
        body.innerHTML = `
        <main ite-r>
            <article>
                <header>
                    <p t class="index">index</p>
                    <p t class="title">item.title</p>
                </header>
                <p>
                    In this chapter...
                </p>
            </article>
            <footer>End of item</footer>
        </main>
        `;
        const main = body.querySelector('main');

        reftype.add(main)    
        // must add the parent element dirctly. dont add body for example.

        assert.equal(refs.length, 5);
        assert.equal(main.children.length, 10);
        assert.equal(reftype.items.get(main).length, 5);

        reftype.delete(3);

        assert.equal(reftype.items.get(main)[3].get('item.title'), 'Machine Learning in JavaScript');
        assert.equal(refs[3].title, 'Machine Learning in JavaScript');
        assert.equal(main.children[6].querySelector('.title').textContent, refs[3].title);
    });

});
