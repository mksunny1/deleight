/**
 * This module supports CSS loading, caching and 'localised' reuse.
 * The article at https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM#applying_styles_inside_the_shadow_dom
   * stated that programmatically creating stylesheets facilitates
   * selective reuse (as we would like when working with web components). Considering that CSS is
   * traditionally written declaratively, it is worthwile to try to reduce the
   * programming involved to use CSS with web components.
 *
 * The main export here is {@link Sophistry}.
 *
 *
 * @module
 */
/**
 * An instance of Sophistry can be used to obtain and cache CSS Stylesheets
 * which can be shared by multiple DOM elements. It can typically be very useful within
 * web components.
 *
 *
 */
declare class Sophistry {
    /**
     * An cache for created SophistryStyleSheets.
     */
    styles: {};
    /**
     * Processes and 'pops' all style tags within the root.
     * Ensures that the same CSSStyleSheet can be reused across document trees (maindocument
     * and shadow roots) instead of duplicated even when they have been
     * created declaratively.
     *
     * If `replace` is truthy, any cached stylesheets with the same name (or hash) as a
     * styleshhet within the root will be replaced (reactively).
     *
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * import { createFragment } from 'deleight/apriori';
     * const mySophistry = new Sophistry();
     * const element = createFragment(apriori.get('markup.html'));
     * const [styles, promises] = mySophistry.process(element);
     * document.body.append(element);
     * for (let style of styles) style.style(element, document.body.firstElementChild);
     *
     * @param {Element} root
     * @param {boolean} [replace]
     * @returns {[StyleSheet[], Promise<any>[]]}
     */
    process(root: Element | DocumentFragment, replace?: boolean): [StyleSheet[], Promise<any>[]];
    /**
     * Import a stylesheet defined in an external CSS file. Optionally
     * specify a name for the imported style in the Sophystry cach ({@link Sophistry#styles}).
     * The name will default to the portion of the link before the first
     * apostrophe...
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * const mySophistry = new Sophistry();
     * const [style, onImport] = mySophistry.import('style.css');
     *
     * @param {string} link
     * @param {string} [name]
     * @returns {[StyleSheet, Promise<any>]}
     */
    import(link: string, name?: string): [StyleSheet, Promise<any>];
    /**
     * Replaces the text of an existing stylesheet in the cach. This is reactive.
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * const mySophistry = new Sophistry();
     * mySophistry.set('style.css', await apriori.get('new-style.css'));  // override everything.
     *
     * @param {string} name
     * @param {string} css
     * @returns
     */
    set(name: string, css: string): void;
}
/**
 * This is used to wrap a CSSStyleSheet to provide convenient methods
 * for styling and 'unstyling' elements.
 *
 * @example
 * import { StyleSheet } from 'deleight/sophistry';
 * const sss = new StyleSheet(css);
 *
 */
declare class StyleSheet {
    /**
     * The wrapped CSS stylesheet.
     */
    css: CSSStyleSheet;
    /**
     * Creates a new Sophistry stylesheet.
     *
     * @param {CSSStyleSheet} cssStyleSheet
     * @constructor
     */
    constructor(cssStyleSheet: CSSStyleSheet);
    /**
     * Styles the elements with the wrapped CSSStylesheets.
     * If an element is not the document or a shadow root, an open shadow
     * root is created for it and then the rrot is styled.
     *
     * @example
     * sss.style(...Array.from(document.body.children))
     *
     * @param  {...T} elements
     */
    style<T extends Element | DocumentFragment>(...elements: T[]): void;
    /**
     * Removes the wrapped stylesheet from the elements (or their shadow roots).
     *
     * @example
     * sss.remove(...Array.from(document.body.children))
     *
     *
     * @param {...T} elements
     */
    remove<T extends Element | DocumentFragment>(...elements: T[]): void;
}

export { Sophistry, StyleSheet };
