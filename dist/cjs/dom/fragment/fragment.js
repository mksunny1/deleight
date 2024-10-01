"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFragment = exports.createFragment = void 0;
/**
 * Shorthand for creating a DocumentFragment from markup.
 *
 * @example
 * import { createFragment } from 'inherent';
 * const frag1 = createFragment(`
 *    <p>Para 1</p>
 *    <p>Para 2</p>
 *`)
 * // <p>Para 1</p><p>Para 2</p>
 *
 * @param markup The `outerHTML` of what to create
 * @returns
 */
function createFragment(markup) {
    const temp = document.createElement('template');
    temp.innerHTML = markup;
    return temp.content;
}
exports.createFragment = createFragment;
/**
 * Fetches markup from a remote link and creates a document fragment out of it.
 *
 * @example
 * import { loadFragment } from 'inherent';
 * const frag1 = await loadFragment(`./my/fragment.html`)
 * // <p>Para 1</p><p>Para 2</p>
 *
 * @param href The link to load the markup from
 * @param init The request init used with `fetch`
 * @returns A promise that resolves to the document fragment.
 */
async function loadFragment(href, init) {
    return fetch(href, init).then(r => r.text()).then(t => createFragment(t));
}
exports.loadFragment = loadFragment;
