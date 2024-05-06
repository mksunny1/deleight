import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { Sophistry } from "../../../src/sophistry.js";
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
<style>${styles2}</style>
<div>
<link rel="stylesheet" href="./styles.css" s-ophistry="link1">
</div>
<style>${styles2}</style>
<div>
<link rel="stylesheet" href="./styles.css" s-ophistry="link1">
<div>
<link rel="stylesheet" href="./styles.css">
</div>
</div>
</div>`;

const hash = (str) => {
    let newHash = 0,
      chr;
    for (let i = 0, len = str.length; i < len; i++) {
      chr = str.charCodeAt(i);
      newHash = (newHash << 5) - newHash + chr;
      newHash |= 0; // convert to 32 bit int.
    }
    return newHash;
  };


describe("sophistry.Sophistry", { only: true }, async () => {
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
    global.HTMLStyleElement = window.HTMLStyleElement;
    global.HTMLLinkElement = window.HTMLLinkElement;
    global.Element = window.Element;
    global.CSSRule = window.CSSRule;

    
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(styles);

    async function mFetch(url, options) {
        if (url === './styles.css') return new Response(styles);
        else throw new Error('Could not fetch the resource at ' + url);
    }

    global.fetch = mFetch;

    const soph = new Sophistry();

    const [iStyles, promise] = soph.import('./styles.css', 'newStyles');
    await promise;

    await it("Should fetch styles from a given link", async (t) => {
        assert.deepEqual(soph.styles.newStyles, iStyles);
        assert.deepEqual(iStyles.css.cssText, styleSheet.cssText);
        // assert.deepEqual(iStyles.css.cssRules.map(rule => rule.cssText), styleSheet.cssRules.map(rule => rule.cssText));
    });

    const styleSheet2 = new CSSStyleSheet();
    styleSheet2.replaceSync(styles2);

    await it('Should correctly replace styles', (t) => {
        soph.set('newStyles', styles2);
        assert.deepEqual(iStyles.css.cssText, styleSheet2.cssText);
    });

    const tree = document.createElement('div');
    tree.innerHTML = markup;
    const styleElement = tree.querySelector('style')   // used to verify hashes.
    const styleElementHash = hash(styleElement.outerHTML);
    const initialLength = Array.from(tree.querySelectorAll('style, link')).length;
    console.log(styleElement.outerHTML);
    console.log(styleElementHash);
    console.log(initialLength);

    await it('Should have the correct styles to begin with', async (t) => {
        assert.equal(initialLength, 5);
    });

    const initialStyleCount = [...Object.keys(soph.styles)].length;
    console.log(initialStyleCount)

    const [pStyles, pPromises] = soph.process(tree);
    await Promise.all(pPromises);

    const finalStyleCount = [...Object.keys(soph.styles)].length;
    console.log(finalStyleCount)

    await it('Should process correctly without duplication', async (t) => {
        assert.equal(finalStyleCount - initialStyleCount, 3);
    });

    await it('Should understand the "s-ophistry" attribute used for naming', async (t) => {
        assert.equal(soph.styles.link1.css.cssText.trim(), styleSheet.cssText.trim());
    });

    await it('Should use correct default names without the "s-ophistry" attribute', async (t) => {
        assert.equal(soph.styles.hasOwnProperty(styleElementHash), true);
    });

    const finalLength = Array.from(tree.querySelectorAll('style, link')).length;

    await it('Should pop all the styles during processing', async (t) => {
        assert.equal(finalLength, 0);
    });
    
});

