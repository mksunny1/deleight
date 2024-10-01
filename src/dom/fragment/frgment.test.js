import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { createFragment, loadFragment } from "./fragment.js";

describe("fragment", () => {
    const window = new JSDOM(`<!DOCTYPE html><body></body>`).window;
    const document = window.document;
    const body = document.body;

    global.document = document;
    global.HTMLStyleElement = window.HTMLStyleElement;
    global.Element = window.Element;
    global.DocumentFragment = window.DocumentFragment;
    global.CSSRule = window.CSSRule;

    
});

