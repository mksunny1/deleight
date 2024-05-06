import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { StyleSheet } from "../../../src/sophistry.js";
import { JSDOM } from "jsdom";

const styles = 
`p {
    color: red;
    border: 1px solid green;
}
section {
    border: 2px solid yellow;
}`;

const styles2 = 
`.p {
    color: red;
    border: 1px solid green;
}
.section {
    border: 2px solid yellow;
}`;

const markup = 
`<div>
    <div>
    </div>
    <div>
    <div>
    </div>
    </div>
</div>`;

describe("sophistry.StyleSheet", { only: true }, async () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    /**
     * Extend CSSStyleSheet obtained here to add the `replaceSync` method.
     * This is a bad hack to be sure, since it cannot be used when there is a 'real' 
     * document. Only good for our testing purposes.
     */
    class CSSStyleSheet extends window.CSSStyleSheet {
        replaceSync(text) {
            this.cssText = text;               // bonus property to simmplify our testing
            /**
            const styleElement = document.createElement()
            styleElement.textContent = text;
            body.appendChild(styleElement);    // let the browser deal with this.
            this.cssRules.length = 0;
            this.cssRules.push(...styleElement.sheet.cssRules);
             */
        };
        replace(text) {
            return this.replaceSync(text);
        }
    }

    global.document = document;
    global.CSSStyleSheet = CSSStyleSheet;
    global.ShadowRoot = window.ShadowRoot;
    global.Document = window.Document;
    global.DocumentFragment = window.DocumentFragment;
    global.HTMLStyleElement = window.HTMLStyleElement;
    global.HTMLLinkElement = window.HTMLLinkElement;
    global.Element = window.Element;
    global.CSSRule = window.CSSRule;

    const css = new CSSStyleSheet();
    css.replaceSync(styles);
    const soph = new StyleSheet(css);

    await it('Should correctly initialize the StyleSheet', (t) => {
        assert.equal(soph.css.cssText, css.cssText);
    });

    await it('Should correctly style and un-style shadow roots', (t) => {
        const e1 = document.createElement('div');
        const s1 = e1.attachShadow({mode: 'open'});

        const e2 = document.createElement('div');
        const s2 = e2.attachShadow({mode: 'open'});

        const e3 = document.createElement('div');
        const s3 = e3.attachShadow({mode: 'open'});

        body.append(e1, e2, e3);

        soph.style(s1, s2, s3);

        assert.equal(s1.adoptedStyleSheets.includes(css), true);
        assert.equal(s2.adoptedStyleSheets.includes(css), true);
        assert.equal(s3.adoptedStyleSheets.includes(css), true);

        soph.remove(s1, s3);

        assert.equal(s1.adoptedStyleSheets.includes(css), false);
        assert.equal(s2.adoptedStyleSheets.includes(css), true);
        assert.equal(s3.adoptedStyleSheets.includes(css), false);
    });

    await it('Should correctly style and un-style elements', (t) => {
        const e1 = document.createElement('div');
        const e2 = document.createElement('div');
        const e3 = document.createElement('div');
        body.append(e1, e2, e3);
        soph.style(e1, e2, e3);

        assert.equal(e1.shadowRoot.adoptedStyleSheets.includes(css), true);
        assert.equal(e2.shadowRoot.adoptedStyleSheets.includes(css), true);
        assert.equal(e3.shadowRoot.adoptedStyleSheets.includes(css), true);

        soph.remove(e1, e2);

        assert.equal(e1.shadowRoot.adoptedStyleSheets.includes(css), false);
        assert.equal(e2.shadowRoot.adoptedStyleSheets.includes(css), false);
        assert.equal(e3.shadowRoot.adoptedStyleSheets.includes(css), true);
    });

});

