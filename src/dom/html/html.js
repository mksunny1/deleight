/**
 * htmldom
 * Functions for building DOM from HTML text or file.
 */
/**
 * Shorthand for creating a DocumentFragment from HTML text.
 *
 * @example
 * import { createFragment } from 'inherent';
 * const frag1 = createFragment(`
 *    <p>Para 1</p>
 *    <p>Para 2</p>
 *`)
 * // <p>Para 1</p><p>Para 2</p>
 *
 * @param html The `outerHTML` of what to create
 * @returns
 */
export function createFragment(html) {
    const temp = document.createElement('template');
    temp.innerHTML = html;
    return temp.content;
}
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
export async function loadFragment(href, init) {
    return fetch(href, init).then(r => r.text()).then(t => createFragment(t));
}
