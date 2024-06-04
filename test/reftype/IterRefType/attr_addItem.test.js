import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('IterRefType.addItemWithAttr', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    it('Should wrap items with an object containing the index when array is wrapped with braces', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];
        const parentRefs = { arr: refs }
        const reftype2 = new RefType(parentRefs);

        body.innerHTML = `
        <main ite-r="{arr}">
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
        const articleTemplate = main.firstElementChild;

        reftype2.add(body)    
        // must add the parent element dirctly. dont add body for example.

        const reftype = reftype2.children.arr;
        assert.equal(reftype.addIndex, true);
        assert.equal(main.children.length, 5);
        assert.equal(reftype.items.get(main).length, 5);
        assert.equal(reftype.templates.get(main) === articleTemplate, true);

        for (let i = 0; i < 5; i++) {
            assert.equal(main.children[i].querySelector('.index').textContent, `${i}`);
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i].title);
        }
    });
    
    it('Should not wrap items when array is not wrapped with braces', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];
        const parentRefs = { arr: refs }
        const reftype2 = new RefType(parentRefs);
        
        body.innerHTML = `
        <main ite-r="arr">
            <article>
                <header>
                    <p t class="title">title</p>
                </header>
                <p>
                    In this chapter...
                </p>
            </article>
        </main>
        `;
        const main = body.querySelector('main');
        const articleTemplate = main.firstElementChild;

        reftype2.add(body)    
        // must add the parent element dirctly. dont add body for example.

        const reftype = reftype2.children.arr;
        assert.equal(reftype.addIndex, undefined);
        assert.equal(main.children.length, 5);
        assert.equal(reftype.items.get(main).length, 5);
        assert.equal(reftype.templates.get(main) === articleTemplate, true);

        for (let i = 0; i < 5; i++) {
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i].title);
        }
    });

});
