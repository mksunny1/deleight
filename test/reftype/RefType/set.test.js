import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.set', (t) => {
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

    it('Should update correct element attribute', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">earth</section>
        <article t>mars</article>
        `;
        const section = body.querySelector('section');
        reftype.add(body)

        reftype.set({color: 'blue'});
        assert.equal(section.getAttribute('class'), 'blue'); 

        reftype.set({color: 'yellow'});
        assert.equal(section.getAttribute('class'), 'yellow'); 
    });
    
    it('Should update correct element property', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">earth</section>
        <article t>mars</article>
        `;
        const section = body.querySelector('section');
        reftype.add(body)

        assert.equal(section.textContent, 'earth');
        
        reftype.set({earth: 'Our planet!!!'})
        assert.equal(section.textContent, 'Our planet!!!');

        reftype.set({earth: 'Their planet!!!'})
        assert.equal(section.textContent, 'Their planet!!!');
    });

    it('Should update nested reftype when ref is updated', (t) => {
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
        
        reftype.set({ mainPlanets: {
            earth: 'Amazing planet!',
            mars: 'Coolest planet!',
            color: 'purple'
        }} );
        assert.deepEqual(reftype.children.mainPlanets.refs, reftype.refs.mainPlanets);
        assert.equal(body.querySelector('section').getAttribute('class'), 'purple');
        assert.equal(body.querySelector('section').textContent, 'Amazing planet!');
        assert.equal(body.querySelector('article').textContent, 'Coolest planet!');

    });

});

