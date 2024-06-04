import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { RefType } from "../../../src/reftype.js";
import { JSDOM } from "jsdom";

describe('RefType.get', (t) => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    
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

    it('Should get correct refs', (t) => {
        const reftype = new RefType(refs);
        assert.deepEqual(reftype.get('mainPlanets'), refs.mainPlanets);
    });

    it('Should get correct nested refs', (t) => {
        const reftype = new RefType(refs);
        assert.deepEqual(reftype.get('mainPlanets.earth'), refs.mainPlanets.earth);
    });

});

