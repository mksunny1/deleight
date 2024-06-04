import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('IterRefType.pop', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    it('Should correctly pop items', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];

        const newItems = [
            { chapter: 6, title: 'Utility' },
            { chapter: 7, title: 'Performance' }
        ]

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
        </main>
        `;
        const main = body.querySelector('main');

        reftype.add(main)    
        // must add the parent element dirctly. dont add body for example.

        reftype.push(...newItems);
        reftype.pop();

        assert.equal(refs.length, 6);
        assert.equal(main.children.length, 6);
        assert.equal(reftype.items.get(main).length, 6);

        for (let i = 0; i < 6; i++) {
            assert.equal(main.children[i].querySelector('.index').textContent, `${i}`);
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i].title);
        }
    });

    it('Should work for multi-item templates', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];

        const newItems = [
            { chapter: 6, title: 'Utility' },
            { chapter: 7, title: 'Performance' }
        ]

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

        reftype.push(...newItems);
        reftype.pop()

        assert.equal(refs.length, 6);
        assert.equal(main.children.length, 12);
        assert.equal(reftype.items.get(main).length, 6);

        for (let i = 0; i < 6; i++) {
            assert.equal(main.children[i * 2].querySelector('.index').textContent, `${i}`);
            assert.equal(main.children[i * 2].querySelector('.title').textContent, refs[i].title);
        }
    });

});
