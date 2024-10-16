import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { listener, setter, setters, attrSetter, 
    attrsSetter, selectorSetter, addTo, attr, all, 
    text} from "./components.js";
import { JSDOM } from "jsdom";
import { apply } from "../apply/apply.js";
import { sets } from "../../object/member/shared/shared.js";

const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
const document = window.document;
const body = document.body;

global.document = document;
global.HTMLStyleElement = window.HTMLStyleElement;
global.Element = window.Element;
global.DocumentFragment = window.DocumentFragment;
global.CSSRule = window.CSSRule;

describe("listener", () => {
    it("Should add event listeners", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const componentFactory = listener('click', { once: true })

        const btns = [];
        const component = componentFactory(e => btns.push(e.target.textContent));

        const subComponents = { button: component }
        apply({ section: subComponents, article: subComponents });

        for (let btn of body.querySelectorAll('button')) btn.click();
        assert.deepEqual(btns, ['Btn1', 'Btn2'])
    });

});

describe("setter", () => {
    it("Should set an element property", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const val = setter('propKey')
        apply({ section: { button: val(20) }, article: { button: val(33) } });

        const btns = [];
        for (let btn of body.querySelectorAll('button')) btns.push(btn.propKey);
        assert.deepEqual(btns, [20, 33]);
    });

});

describe("setters", () => {
    it("Should set the element properties", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        apply({ 
            section: { button: setters({ a: 1, b: 2 }) }, 
            article: { button: setters({ a: 5, b: 6 })  } 
        });

        const btns = [];
        for (let btn of body.querySelectorAll('button')) btns.push([btn.a, btn.b]);
        assert.deepEqual(btns, [[1, 2], [5, 6]]);
    });
});


describe("attrSetter", () => {
    it("Should set an element attribute", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const val = attrSetter('attr')
        apply({ section: { button: val(20) }, article: { button: val(33) } });

        const btns = [];
        for (let btn of body.querySelectorAll('button')) btns.push(btn.getAttribute('attr'));
        assert.deepEqual(btns, ['20', '33']);
    });

});

describe("attrsSetter", () => {
    it("Should set the element attributes", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        apply({ 
            section: { button: attrsSetter({ a: '1', b: '2' }) }, 
            article: { button: attrsSetter({ a: '5', b: '6' })  } 
        });

        const btns = [];
        for (let btn of body.querySelectorAll('button')) btns.push([btn.getAttribute('a'), btn.getAttribute('b')]);
        assert.deepEqual(btns, [['1', '2'], ['5', '6']]);
    });
});

describe("selectorSetter", () => {
    it("Should set the selected elements as members", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button m-ember="b1">Btn1</button></section>
        <article>I am an article <button m-ember="b2">Btn2</button></article>
        `;

        const comp = selectorSetter()
        comp(body);

        assert.equal(body.b1.textContent, 'Btn1');
        assert.equal(body.b2.textContent, 'Btn2');
    });

});

describe("as", () => {
    it("Should set the element as property of the specified object", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const obj = { };    // a reactive object

        apply({ 
            section: { button: addTo(obj, text) }, 
            article: { button: addTo(obj, text) } 
        });

        const arr = obj[text]

        assert.equal(arr[0].textContent, 'Btn1');
        assert.equal(arr[1].textContent, 'Btn2');
    });
});

describe("attr", () => {
    it("Should create an attribute-setting wrapper around the element", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const obj = { };    // a reactive object

        apply({ 
            section: { button: addTo(obj, 'a', attr) }, 
            article: { button: addTo(obj, 'b', attr) } 
        });
        sets(obj, 'wow');

        assert.equal(obj.a[0].getAttribute('a'), 'wow');
        assert.equal(obj.b[0].getAttribute('b'), 'wow');

    });
});

describe("addTo (with string wrapper)", () => {
    it("Should create a sub-prop-setting wrapper around the element", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const obj = { };    // a reactive object

        apply({ 
            section: { button: addTo(obj, 'color', 'style') }, 
            article: { button: addTo(obj, 'background-color', 'style') } 
        });
        sets(obj, 'yellow');

        assert.equal(obj.color[0].color, 'yellow');
        assert.equal(obj['background-color'][0]['background-color'], 'yellow');
    });
});

describe("all", () => {
    it("Should apply all the components", (t) => {
        body.innerHTML = `
        <div>I am a div</div>
        <p>I am a paragraph</p>
        <section>I am a section <button>Btn1</button></section>
        <article>I am an article <button>Btn2</button></article>
        `;

        const a = setter('a');
        const b = setter('b');
        apply({ section: { button: all(a(2), b(3)) }, article: { button: all(a(62), b(53)) } });

        const btns = [];
        for (let btn of body.querySelectorAll('button')) btns.push([btn.a, btn.b]);
        assert.deepEqual(btns, [[2, 3], [62, 53]]);
    });

});