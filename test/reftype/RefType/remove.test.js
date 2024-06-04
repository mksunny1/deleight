import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType, RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.remove', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;
    
    global.document = document;
    global.Element = window.Element;
    global.HTMLTemplateElement = window.HTMLTemplateElement;
    global.DocumentFragment = window.DocumentFragment;

    const refs = {
        mercury: 'Planet mercury',
        venus: 'The second planet',
        earth: 'Our planet!',
        mars: 'Nearest planetary neighbor',
        mainPlanets: {
            earth: 'Our awesome planet',
            mars: 'Our nearest neighbor'
        },
        mainStars: [
            {name: 'Sun', age: 9999999},
            {name: 'Moon', age: 555},
        ],
        color: 'red'
    };

    it('Should correctly remove all linkages', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">earth</section>
        <article t>mars</article>
        `;
        reftype.add(body)
        assert.deepEqual([...Object.keys(reftype.props)].sort(), 'mercury venus earth mars'.split(' ').sort());
        assert.deepEqual([...Object.keys(reftype.attrs)], ['color']);

        reftype.remove();
        assert.equal(reftype.props || reftype.attrs || reftype.children, undefined)
    });

    it('Should remove only specified ref linkages', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <main re-f="mainPlanets">
            <section t class-a="color">earth</section>
            <article t>mars</article>
        </main>
        <footer>No bindings here</footer>
        `;
        reftype.add(body)
        assert.deepEqual([...Object.keys(reftype.props)].sort(), 'mercury venus'.split(' '));
        assert.deepEqual([...Object.keys(reftype.children)].sort(), ['mainPlanets']);
        assert.deepEqual([...Object.keys(reftype.children.mainPlanets.props)].sort(), 'earth mars'.split(' '));
        assert.deepEqual([...Object.keys(reftype.children.mainPlanets.attrs)], ['color']);   

        reftype.remove('mainPlanets');
        assert.deepEqual([...Object.keys(reftype.props)].sort(), 'mercury venus'.split(' '));
        assert.deepEqual([...Object.keys(reftype.children)].length, 0);
    });
    
});

