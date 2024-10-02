/**
 * This is an alternative interface for CSS rules which can be used to
 * create, extract or load CSS stylesheets. It can also be used for
 * `select`ing style rules and creating a wrapper around a CSSStyleSheet
 * for applying stylesheets locally and modifying them more expressively.
 *
 * @module
 */
/**
 * Creates a CSSStyleSheet from markup text.
 *
 * @example
 * import { createStyle } from 'deleight/css'
 * const css = `
 *        .hd {
 *           background-color: navy;
 *           color: white;
 *         }
 * `;
 * const cssStyleSheet = createStyle(css);
 *
 * @param style The CSS text
 * @returns The CSSStyleSheet instance
 */
export declare function createStyle(style: string): CSSStyleSheet;
/**
 * Fetches CSS from a remote link and creates a CSSStyleSheet out of it
 * using {@link createStyle}.
 *
 * @example
 * import { loadStyle } from 'deleight/css'
 * const cssStyleSheet = await loadStyle('component1.css');
 *
 * @param href The link to load the CSS from
 * @param init The request init used with `fetch`
 * @returns A promise that resolves to a CSSStyleSheet.
 */
export declare function loadStyle(href: string, init?: RequestInit): Promise<CSSStyleSheet>;
/**
 * Contains the attribute names interpreted specially by {@link popStyles}
 */
export declare const popAttrs: {
    skip: string;
    keep: string;
};
/**
 * Extracts and removes normal stylesheets from the trees of the given elements.
 * `style` or `link` elements with 'ski-p' attributes, will be
 * ignored in the processing. Also those with `kee-p` attributes will be processed
 * but they will not be removed from the tree.
 *
 * Use the exported {@link popAttrs}
 * object to configure the attribute names for `skip` and `keep` if the
 * afore-mentioned defaults will not suffice for your use case.
 *
 * @example
 * import { popStyles } from 'deleight/css'
 * const markup =
 *  `<div>
 *     <style>${css}</style>
 *      <div>
 *          <link rel="stylesheet" href="page.css">
 *      </div>
 *      <style>${css}</style>
 *      <div><div><link rel="stylesheet" href="page.css"></div></div>
 *  </div>`;
 * const tree = document.createElement('div');
 * const styles = [...popStyles(tree)];
 * // styles the contains: [CSSStyleSheet, Promise<CSSStyleSheet>,
 *                          CSSStyleSheet, Promise<CSSStyleSheet>]
 *
 * @param elements The elements at the top of all trees to process
 */
export declare function popStyles(...elements: Element[]): any;
/**
 * Selects all the style rules in the stylesheet whose cssText begin with
 * any of the specified selectors.
 *
 * @example
 * import { selectAll } from 'deleight/css';
 * const cssStyleSheet = await loadStyle('component1.css');
 * const spanRules = [...selectAll('span', cssStyleSheet)];
 * // `selectAll` returns a generator!
 *
 * @param selectors The starting text of the style rules to return
 * @param styleSheet The CSSStyleSheet containing the rules to select
 * @returns The selected style rules
 */
export declare function selectAll(selectors: string, styleSheet: CSSStyleSheet): Iterable<CSSRule>;
/**
 * Selects the first style rule in the stylesheet whose cssText begins with
 * any of the specified selectors.
 *
 * @example
 * import { selectFirst } from 'deleight/css';
 * const cssStyleSheet = await loadStyle('component1.css');
 * const firstSpanRule = selectFirst('span', cssStyleSheet)
 *
 * @param selectors The starting text of the style rules to return
 * @param styleSheet The CSSStyleSheet containing the rules to select
 * @returns The selected style rule
 */
export declare function selectFirst(selectors: string, styleSheet: CSSStyleSheet): CSSRule | undefined;
/**
 * Wraps a CSSStyleSheet to provide convenient methods
 * for styling and 'unstyling' elements and manipulating the
 * CSSStyleSheet.
 *
 * @example
 * import { StyleSheet } from 'deleight/css';
 * const style = new StyleSheet(css);
 *
 */
export declare class StyleSheet {
    /**
     * The wrapped CSS stylesheet.
     */
    css: CSSStyleSheet;
    /**
     * Creates a new instance of `StyleSheet` to wrap the given CSSStyleSheet.
     *
     * @param cssStyleSheet The wrapped CSSStyleSheet
     * @constructor
     */
    constructor(cssStyleSheet: CSSStyleSheet);
    /**
     * Styles the elements with the wrapped CSSStylesheet using the
     * `adoptedStyleSheets` property of `Document` and `ShadowRoot` objects.
     *
     * If an element is neither a document nor a shadow root, an open shadow
     * root is created for it and then the root is styled.
     *
     * @example
     * import { StyleSheet } from 'deleight/css';
     * const style = new StyleSheet(css);
     * style.add(...document.body.children)
     *
     * @param  elements The elements, document fragments, shadow roots or documents to add style
     */
    add<T extends Element | DocumentFragment | ShadowRoot | Document>(...elements: T[]): void;
    /**
     * Removes the wrapped stylesheet from the given documents, shadow roots
     * or elements. For elements, the stylesheet is removed from their
     * shadowRoot property.
     *
     * @example
     * import { StyleSheet } from 'deleight/css';
     * const style = new StyleSheet(css);
     * style.add(...document.body.children)
     * style.remove(document.body.children[0], document.body.children[5])
     *
     * @param elements The elements, document fragments, shadow roots or documents to add unstyle
     */
    remove<T extends Element | DocumentFragment | ShadowRoot | Document>(...elements: T[]): void;
    /**
     * Returns the first style rule matching the given query (or undefined
     * if there is none). This uses the {@link selectFirst} function.
     *
     * @example
     * import { StyleSheet } from 'deleight/css';
     * const style = new StyleSheet(cssStyleSheet);
     * style.get('div');
     * // CSSRule{...}
     *
     * @param p The starting text of the style rule to get
     * @returns The selected style rule
     */
    get(p: string): CSSRule;
    /**
     * Replaces the `cssText` of the first style rule matching the
     * given query with the given value. This uses the
     * {@link selectFirst} function.
     *
     * @example
     * import { StyleSheet } from 'deleight/css';
     * const style = new StyleSheet(cssStyleSheet);
     * style.set('div', 'div {border: none;}');
     *
     * @param p The starting text of the style rule to update.
     * @param value The new value to overwrite existing CSS text with
     */
    set(p: string, value: string | CSSRule): string;
    /**
     * Deletes the first style rule matching the given query. This uses
     * the {@link selectFirst} function.
     *
     * @example
     * import { StyleSheet } from 'deleight/css';
     * const style = new StyleSheet(cssStyleSheet);
     * style.delete('div');
     *
     * @param p The starting text of the style rule to delete.
     */
    delete(p: string): void;
    /**
     * Returns all the style rules matching the specified query using the
     * {@link selectAll} function.
     *
     * @example
     * import { StyleSheet } from 'deleight/css';
     * const style = new StyleSheet(cssStyleSheet);
     * [...style.getAll('p')];
     *
     * @param p The starting text of the style rules to get.
     * @returns The selected dtyle rules
     */
    getAll(p: string): Iterable<CSSRule>;
    /**
     * Assigns the given values to the css rules matching the query
     * (in the order they are specified in the query).
     *
     * @example
     * import { StyleSheet, createStyle } from 'deleight/css'
     * const css = 'p {border: none;}, a {text-decoration: none;}'
     * const sheet = new StyleSheet(createStyle(css));
     * sheet.setAll('a, p', 'a {color: white;}', 'p {color: black}');
     * // sheet.css.cssRules.map(r => r.cssText) === ['p {color: black}', 'a {color: white;}''];
     *
     * @param p The starting text of the style rules to update.
     * @param values The values to replace matching rules with.
     */
    setAll(p: string, ...values: (string | CSSRule)[]): void;
    /**
     * Deletes all css rules matching the given query.
     *
     * @example
     * import { StyleSheet, createStyle } from 'deleight/css'
     * const css = 'p {border: none;}, a {text-decoration: none;}'
     * const sheet = new StyleSheet(createStyle(css));
     * sheet.deleteAll('a, p');  // sheet.css.cssRules === [];
     *
     * @param p The starting text of the style rules to delete.
     */
    deleteAll(p: string): void;
}
/**
 * Wraps a regular `CSSStyleSheet` with an instance of {@link StyleSheet}.
 * This is simply an alia for `new StyleSheet(cssStyleSheet)`.
 *
 * @example
 * import { wrap, createStyle } from 'deleight/css'
 * const css = 'p {border: none;}, a {text-decoration: none;}'
 * const sheet = wrap(createStyle(css))
 *
 * @param css The CSSStyleSheet instance to wrap.
 * @returns An instance of {@link StyleSheet} which holds the given CSSStyleSheet
 * in its `css` property.
 */
export declare function wrap(css: CSSStyleSheet): StyleSheet;
/**
 * NB: Still add tests for `wrap` and `popAttrs`.
 */
