import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { IterRefType, RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.react', (t) => {
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

    it('Should update element attribute', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">earth</section>
        <article t>mars</article>
        `;
        const section = body.querySelector('section');
        reftype.add(body)

        reftype.react()
        assert.equal(section.getAttribute('class'), 'red');

        refs.color = 'blue';
        reftype.react()
        assert.equal(section.getAttribute('class'), 'blue'); 
    });

    it('Should update correct element attribute', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">earth</section>
        <article t>mars</article>
        `;
        refs.color = 'red';
        const section = body.querySelector('section');
        reftype.add(body)

        reftype.react({earth: refs.earth})
        assert.equal(section.getAttribute('class'), null);

        reftype.react({color: 'brown'})   // explicit values
        assert.equal(section.getAttribute('class'), 'brown');

        reftype.react('color')            // get values from this.refs
        assert.equal(section.getAttribute('class'), 'red');

        refs.color = 'blue';
        reftype.react('color')
        assert.equal(section.getAttribute('class'), 'blue'); 
    });
    
    it('Should update element property', (t) => {
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
        
        reftype.react()
        assert.equal(section.textContent, 'Our planet!');

        refs.earth = 'Their planet!!!';
        reftype.react()
        assert.equal(section.textContent, 'Their planet!!!');
    });

    it('Should update correct element property', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">earth</section>
        <article t>mars</article>
        `;
        refs.earth = 'Our planet!';
        const section = body.querySelector('section');
        reftype.add(body)

        reftype.react({color: 'brown'})
        assert.equal(section.textContent, 'earth');

        reftype.react({earth: 'A great planet'})   // explicit values
        assert.equal(section.textContent, 'A great planet');

        reftype.react('earth')            // get values from this.refs
        assert.equal(section.textContent, 'Our planet!');

        refs.earth = 'Their planet!!!';
        reftype.react('earth')
        assert.equal(section.textContent, 'Their planet!!!');
    });

    it('Should remove nested reftype when ref is undefined', (t) => {
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
        
        delete refs.mainPlanets;
        reftype.react('mainPlanets');
        assert.equal([...body.querySelectorAll('main')].length, 0);
        assert.equal([...Object.keys(reftype.children)].length, 0);

    });

});

