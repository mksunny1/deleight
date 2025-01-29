import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { JSDOM } from "jsdom";
import { html, h, b, hh } from "./builder.js";
const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
const document = window.document;
globalThis.document = document;
globalThis.HTMLStyleElement = window.HTMLStyleElement;
globalThis.Element = window.Element;
globalThis.DocumentFragment = window.DocumentFragment;
globalThis.CSSRule = window.CSSRule;
describe("builder.render", () => {
    it("Should render an element", async (t) => {
        const rendered = html('main').set({ class: 'right bg' }).append(9).render();
        assert.equal(rendered.trim(), `<main class="right bg">
    9
</main>`);
    });
});

describe("builder.build", () => {
    it("Should build an element", async (t) => {
        // create a template:
        const items = (it) => it.map(num => html('li').append(num));
        const built1 = h.ul.set({ class: 'list1' }).append(...items([1,2,3,4,5,6,7,8,9])).build();
        const built2 = html('ol').set({ class: 'list2' }).append(...items([1,2,3,4,5,6,7,8,9,10])).build();

        assert.equal(built1.tagName, "UL");
        assert.equal(built2.tagName, "OL");
        assert.equal(built1.getAttribute('class'), "list1");
        assert.equal(built2.getAttribute('class'), "list2");
        assert.equal(built1.children.length, 9);
        assert.equal(built2.children.length, 10);
        assert.equal((built1.children[0] as any).textContent.trim(), '1');
        assert.equal((built2.children[9] as any).textContent.trim(), '10');
    });
});

describe("builder.render", () => {
    it("Should render an element correctly", async (t) => {

        const expected = `
<div>
    I am a div
</div>
<p>
    I am a paragraph
</p>
<section>
    I am a section 
    <button>
        Btn1
    </button>
</section>
<aside m-ember="aside">
    I am a section 
    <button>
        Btn1
    </button>
</aside>
<article>
    I am an article 
    <button>
        Btn2
    </button>
</article>
`;
        const component = ['I am a section ', hh.button('Btn1')];
        const rendered = b(
            hh.div('I am a div'),
            hh.p('I am a paragraph'),
            hh.section(...component),
            hh.aside(...component).set({'m-ember':'aside'}),
            hh.article('I am an article ', hh.button('Btn2'))
        ).render().join('\n');
        assert.equal(rendered.trim(), expected.trim());
    });
});