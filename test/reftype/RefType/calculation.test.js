import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.calc', (t) => {
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
        color: 'red',
        age1: 29, age2: 33, age3: 34
    };

    const reftype = new RefType(refs);
    body.innerHTML = `
    <div t>add:=age1|2|age3</div>
    <p t>add:=age1||age2</p>
    `;
    reftype.add(body)
    reftype.react();   // set everything.

    it('Should call the specified function', (t) => {
        assert.equal(body.querySelector('div').textContent, `${refs.age1 + 2 + refs.age3}`);       
        assert.equal(body.querySelector('p').textContent, `${refs.age1 + refs.age2}`);   
    });
    
});
