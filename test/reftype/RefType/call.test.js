import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.call', (t) => {
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
        header: () => `${refs.mercury} & ${refs.venus}`,
        footer: () => `${refs.earth} & ${refs.mars}`,
        color: 'red'
    };

    it('Should update correct element property', (t) => {
        const reftype = new RefType(refs);
        body.innerHTML = `
        <header t>header</footer>
        <div t>mercury</div>
        <p t>venus</p>
        <section t class-a="color">
            <p>earth</p>
        </section>
        <article t>mars</article>
        <footer t>footer</footer>
        `;
        const header = body.querySelector('header');
        const footer = body.querySelector('footer');
        reftype.add(body)

        reftype.call('header');
        assert.equal(header.textContent, `${refs.mercury} & ${refs.venus}`); 
        assert.equal(footer.textContent, 'footer')

        reftype.call('footer');
        assert.equal(header.textContent, `${refs.mercury} & ${refs.venus}`); 
        assert.equal(footer.textContent, `${refs.earth} & ${refs.mars}`)
    });
    
});

