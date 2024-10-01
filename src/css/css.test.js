import { describe, it } from 'node:test'
import { strict as assert } from 'node:assert'
import { JSDOM } from "jsdom";
import { createStyle, loadStyle, popStyles, selectAll, selectFirst, StyleSheet } from '../src/sophistry.js'

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
        return this.cssText = text;             // bonus property to simmplify our testing
        // return super.replaceSync(text);
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
global.ShadowRoot = window.ShadowRoot;
global.DocumentFragment = window.DocumentFragment;
global.Document = window.Document;

const css = `
    .hd {
        background-color: navy;
        color: white;
    }
`;

async function mFetch(url, options) {
    if (url === 'page.css') return new Response(css);
    else throw new Error('Could not fetch the resource at ' + url);
}
global.fetch = mFetch;

describe('createStyle', async (t) => {
    const st = createStyle(css);

    await it('should correctly create a CSSStyleSheet', async (u) => {
        assert.equal(st instanceof CSSStyleSheet, true);
        assert.equal(st.cssText, css);
    });

});

describe('loadStyle', async (t) => {
    const st = await loadStyle('page.css');

    await it('should correctly load a CSSStyleSheet', async (u) => {
        assert.equal(st instanceof CSSStyleSheet, true);
        assert.equal(st.cssText, css);
    });

});

describe('popStyles', async (t) => {
    const markup = 
    `<div>
        <style>${css}</style>
        <div>
            <link rel="stylesheet" href="page.css">
        </div>
        <style>${css}</style>
        <div><div><link rel="stylesheet" href="page.css"></div></div>
    </div>`;

    const tree = document.createElement('div');
    tree.innerHTML = markup;
    const count1 = Array.from(tree.querySelectorAll('style, link')).length;
    
    await it('Should have the correct styles to begin with', async (t) => {
        assert.equal(count1, 4);
    });

    const extractedStyles = [...popStyles(tree)];

    await it('should extract the correct styles', async (t) => {
        const count2 = extractedStyles.length;
        assert.equal(count2, count1);
        for (let st of extractedStyles) {
            if (st instanceof CSSStyleSheet) {  // style elements
                assert.equal(st.cssText, css);
            } else {    // link elements
                assert.equal((await st).cssText, css);
            }
        }
    });

    await it('should remove extracted styles from the tree', async (t) => {
        const count3 = Array.from(tree.querySelectorAll('style, link')).length;
        assert.equal(count3, 0);
    });

});

describe('selectAll', async (t) => {
    const style = {
        cssRules: [
            {
                cssText: 'div {color: blue}'
            },
            {
                cssText: 'section {color: yellow;}'
            }
        ]
    };
    const rules = [...selectAll('section', style)];

    await it('should correctly select all styles matching the given query', async (u) => {
        assert.equal(rules.length, 1);
        assert.equal(rules[0].cssText.trim(), 'section {color: yellow;}');
    });

});

describe('selectFirst', async (t) => {
    const style = {
        cssRules: [
            {
                cssText: 'div {color: blue}'
            },
            {
                cssText: 'section {color: yellow;}'
            }
        ]
    };
    const rule = selectFirst('div', style);

    await it('should correctly select the first style matching the given query', async (u) => {
        assert.equal(rule.cssText.trim(), 'div {color: blue}');
    });

});

describe('StyleSheet.constructor', async (t) => {
    const stylesheet = new StyleSheet(createStyle(css));

    await it('should correctly initialize a new StyleSheet instance', async (u) => {
        assert.equal(stylesheet.css.cssText, css);
    });

});

describe('StyleSheet', async (t) => {
    await describe('StyleSheet.add', async (t) => {
        const stylesheet = new StyleSheet(createStyle(css));
        stylesheet.add(document, body);
        
        await it('should correctly add the stylesheet (as an adopted stylesheet) to the specified elements and documents', async (u) => {
            assert.equal(document.adoptedStyleSheets.includes(stylesheet.css), true);
        });

        await it('should automatically attach shadow roots where necessary', async (u) => {
            assert.equal(body.shadowRoot.adoptedStyleSheets.includes(stylesheet.css), true);
        });

    });

    await describe('StyleSheet.remove', async (t) => {
        const stylesheet = new StyleSheet(createStyle(css));
        stylesheet.add(document, body);
        stylesheet.remove(document);

        await it('should correctly remove the stylesheet from the specified elements and documents', async (u) => {
            assert.equal(document.adoptedStyleSheets.includes(stylesheet.css), false);
            assert.equal(body.shadowRoot.adoptedStyleSheets.includes(stylesheet.css), true);
        });

    });

    const style = {
        cssRules: [
            {
                cssText: 'div {color: blue}'
            },
            {
                cssText: 'article {color: yellow;}'
            },
            {
                cssText: 'section {color: yellow;}'
            }
        ]
    };
    const sheet = new StyleSheet(style);

    await describe('StyleSheet.get', async (t) => {
        await it('should return the first rule matching the given query', async (u) => {
            assert.equal(sheet.get('div').cssText.trim(), 'div {color: blue}');
        });
    });

    await describe('StyleSheet.getAll', async (t) => {
        await it('should return all the rules matching the given query', async (u) => {
            const all = [...sheet.getAll('div, section')];
            assert.equal(all[0].cssText.trim(), 'div {color: blue}');
            assert.equal(all[1].cssText.trim(), 'section {color: yellow;}');
        });
    });

    function createSheet() {
        const style = {
            cssRules: [
                {
                    cssText: 'div {color: blue}'
                },
                {
                    cssText: 'article {color: yellow;}'
                },
                {
                    cssText: 'section {color: yellow;}'
                }
            ],
            deleteRule(index) {
                style.cssRules.splice(index, 1);
            }
        };
        return new StyleSheet(style);
    }

    await describe('StyleSheet.set', async (t) => {
        const sheet = createSheet();

        await it('should set the first rule matching the given query', async (u) => {
            assert.equal(sheet.get('article').cssText.trim(), 'article {color: yellow;}');
            sheet.set('article', 'article { font-size: 16px; }');
            assert.equal(sheet.get('article').cssText.trim(), 'article { font-size: 16px; }');
        });

    });

    await describe('StyleSheet.setAll', async (t) => {
        const sheet = createSheet();

        await it('should set all the rules matching the given query', async (u) => {
            assert.equal(sheet.get('article').cssText.trim(), 'article {color: yellow;}');
            assert.equal(sheet.get('div').cssText.trim(), 'div {color: blue}');
            sheet.setAll('article, div', 'article { font-size: 16px; }', 'div { font-size: 12px; }');
            assert.equal(sheet.get('article').cssText.trim(), 'article { font-size: 16px; }');
            assert.equal(sheet.get('div').cssText.trim(), 'div { font-size: 12px; }');
        });

    });

    await describe('StyleSheet.delete', async (t) => {
        const sheet = createSheet();

        await it('should delete the first rule matching the given query', async (u) => {
            assert.equal(sheet.get('article').cssText.trim(), 'article {color: yellow;}');
            sheet.delete('article');
            assert.equal(sheet.get('article'), undefined);
        });

    });

    await describe('StyleSheet.deleteAll', async (t) => {
        const sheet = createSheet();

        await it('should delete all the rules matching the given query', async (u) => {
            assert.equal(sheet.get('article').cssText.trim(), 'article {color: yellow;}');
            assert.equal(sheet.get('div').cssText.trim(), 'div {color: blue}');
            sheet.deleteAll('article, div');
            assert.equal(sheet.get('article'), undefined);
            assert.equal(sheet.get('div'), undefined);
            assert.equal(sheet.get('section') === undefined, false);
        });

    });

});