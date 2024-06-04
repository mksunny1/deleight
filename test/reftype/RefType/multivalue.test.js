import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.multivalue', (t) => {
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

    const reftype = new RefType(refs);
    body.innerHTML = `
    <div t>mercury| & |venus</div>
    <div t> mercury | & | venus </div>
    <p t>mercury|&|venus</p>
    <p t> mercury |&| venus </p>
    <section t class-a="color| |color">earth</section>
    <article t class-a="color||color">earth</article>
    `;
    reftype.add(body)
    reftype.react();   // set everything.

    it('Should only keep whitespace in literal parts of multivalues', (t) => {
        for (let div of body.querySelectorAll('div')) {
            assert.equal(div.textContent, `${refs.mercury} & ${refs.venus}`); 
        }
        for (let p of body.querySelectorAll('p')) {
            assert.equal(p.textContent, `${refs.mercury}&${refs.venus}`); 
        }
    });
    
    it('Should be able to contain the same refs multiple times', (t) => {
        for (let section of body.querySelectorAll('section')) {
            assert.equal(section.getAttribute('class'), `${refs.color} ${refs.color}`); 
        }
        for (let article of body.querySelectorAll('article')) {
            assert.equal(article.getAttribute('class'), `${refs.color}${refs.color}`); 
        }
    });

});

