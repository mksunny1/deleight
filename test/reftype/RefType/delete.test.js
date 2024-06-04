import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.delete', (t) => {
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

    it('Should remove correct element attribute', (t) => {
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

        reftype.delete('color');
        assert.equal(section.hasAttribute('class'), false); 
    });
    
    it('Should delete correct element property', (t) => {
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

        reftype.delete('earth')
        assert.equal(section.textContent, '');  
        // browser does not set textContent to undefined
    });

    it('Should delete nested reftype when ref is deleted', (t) => {
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
        
        reftype.delete('mainPlanets');
        assert.equal(reftype.refs.hasOwnProperty('mainPlanets'), false);
        assert.equal(reftype.children.hasOwnProperty('mainPlanets'), false);
        assert.equal([...body.querySelectorAll('main')].length, 0);

    });

});

