import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('IterRefType.move', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    it('Should correctly move items down', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];

        const reftype = new IterRefType(refs);
        reftype.addIndex = true;
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

        const testRefs = refs.slice();
        testRefs.splice(3, 0, ...testRefs.splice(1, 1));
        
        reftype.move(1, 3);

        for (let i = 0; i < 5; i++) {
            assert.equal(refs[i].title, testRefs[i].title);
            assert.equal(reftype.refs[i].title, testRefs[i].title);
            assert.equal(reftype.items.get(main)[i].get('index'), i);
            assert.equal(reftype.items.get(main)[i].get('item.title'), testRefs[i].title);
            assert.equal(reftype.items.get(main)[i].elements[0] === main.children[i * 2], true);
            assert.equal(main.children[i * 2].querySelector('.title').textContent, testRefs[i].title);
            assert.equal(main.children[i * 2].querySelector('.index').textContent, `${i}`);
        }

    });

});
