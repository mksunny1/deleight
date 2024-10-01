import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { ElementList } from './element.js'
import { JSDOM } from "jsdom";

const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
const document = window.document;
const body = document.body;

global.document = document;
global.HTMLStyleElement = window.HTMLStyleElement;
global.Element = window.Element;
global.Node = window.Node;
global.CSSRule = window.CSSRule;

describe("ElementList", () => {
    body.innerHTML = ``
    class AppElementList extends ElementList {
        render(val) {
            const child = document.createElement('span');
            child.textContent = val;
            return child;
        }
    }
    const list = new AppElementList(body);
    const array = body.children;

    function toArray() {
        return [...array].map(item => parseInt(item.textContent))
    }

    it("Should correctly push the element's children", (t) => {
        assert.equal(array.length, 0);
        list.push(1, 2, 3);
        assert.deepEqual(toArray(), [1, 2, 3]);
    });

    it("Should correctly pop the element's children", (t) => {
        assert.equal(array.length, 3);
        [...list.pop()];
        assert.deepEqual(toArray(), [1, 2]);
    });

    it("Should correctly unshift the element's children", (t) => {
        assert.equal(array.length, 2);
        list.unshift(1, 2, 3);
        assert.deepEqual(toArray(), [1, 2, 3, 1, 2]);
    });

    it("Should correctly shift the element's children", (t) => {
        assert.equal(array.length, 5);
        list.shift();
        assert.deepEqual(toArray(), [2, 3, 1, 2]);
    });

    it("Should correctly set the element's children", (t) => {
        list.set(1, 7);
        assert.deepEqual(toArray(), [2, 7, 1, 2]);
    });

    it("Should correctly splice the element's children", (t) => {
        list.splice(2, 1, 8, 9, 0);
        assert.deepEqual(toArray(), [2, 7, 8, 9, 0, 2]);
    });

    it("Should correctly swap array element's children", (t) => {
        list.swap(2, 3);
        assert.deepEqual(toArray(), [2, 7, 9, 8, 0, 2]);
        list.swap(1, 5);
        assert.deepEqual(toArray(), [2, 2, 9, 8, 0, 7]);
    });

    it("Should correctly move array element's children", (t) => {
        list.move(2, 3);
        assert.deepEqual(toArray(), [2, 2, 8, 9, 0, 7]);
        list.move(1, 5);
        assert.deepEqual(toArray(), [2, 8, 9, 0, 7, 2]);
    });

    it("Should correctly iterate the element's children", (t) => {
        assert.deepEqual([...list], [...array]);
    });

    it("Should correctly clear the element's children", (t) => {
        list.clear();
        assert.deepEqual(toArray(), []);
    });
})

