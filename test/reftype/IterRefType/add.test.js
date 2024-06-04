import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('IterRefType.add', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    it('Should correctly add elements for an array', (t) => {
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
            assert.equal(main.children[i].querySelector('.index').textContent, `${i}`);
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i].title);
        }
    });

    it('Should correctly add elements for a generator', (t) => {
        const refs = [
            { chapter: 1, title: 'Introduction' },
            { chapter: 2, title: 'History' },
            { chapter: 3, title: 'Machine Learning in action' },
            { chapter: 4, title: 'Machine Learning in practice' },
            { chapter: 5, title: 'Machine Learning in JavaScript' }
        ];
        const gRefs = (function*() {
            for (let i = 0; i < 5; i++) yield refs[i];
        })();
        
        const reftype = new IterRefType(gRefs);
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
        <nav ite-r>
            <a href-a="|./|item.title|.html" t>item.chapter</a>
        </nav>
        `;
        const main = body.querySelector('main');
        const articleTemplate = main.firstElementChild;

        reftype.add(main)    
        // must add the parent element dirctly. dont add body for example.

        assert.equal(main.children.length, 5);
        assert.equal(reftype.items.get(main).length, 5);
        assert.equal(reftype.templates.get(main) === articleTemplate, true);

        for (let i = 0; i < 5; i++) {
            assert.equal(main.children[i].querySelector('.index').textContent, `${i}`);
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i].title);
        }
    });

    it('Should move the reftype to the last added element', (t) => {
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
        </main>
        <nav ite-r>
            <a href-a="|./|item.title|.html" t>item.chapter</a>
        </nav>
        `;
        const main = body.querySelector('main');
        const nav = body.querySelector('nav');
        const articleTemplate = main.firstElementChild;
        const aTemplate = nav.firstElementChild;

        reftype.add(main)    
        // must add the parent element dirctly. dont add body for example.

        assert.deepEqual(reftype.elements, [main]);
        assert.equal(main.children.length, 5);
        assert.equal(reftype.items.get(main).length, 5);
        assert.equal(reftype.templates.get(main) === articleTemplate, true);

        for (let i = 0; i < 5; i++) {
            assert.equal(main.children[i].querySelector('.index').textContent, `${i}`);
            assert.equal(main.children[i].querySelector('.title').textContent, refs[i].title);
        }

        reftype.add(nav);

        assert.deepEqual(reftype.elements, [main, nav]);
        assert.equal(nav.children.length, 5);
        assert.equal(reftype.items.get(nav).length, 5);
        assert.equal(reftype.templates.get(nav) === aTemplate, true);

        for (let i = 0; i < 5; i++) {
            assert.equal(nav.children[i].textContent, `${refs[i].chapter}`);
            assert.equal(nav.children[i].getAttribute('href'), `./${refs[i].title}.html`);
        }

    });
    
});
