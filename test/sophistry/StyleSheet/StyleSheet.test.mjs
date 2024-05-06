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
    global.HTMLStyleElement = window.HTMLStyleElement;
    global.HTMLLinkElement = window.HTMLLinkElement;
    global.Element = window.Element;
    global.CSSRule = window.CSSRule;

    
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(styles);
        
});

