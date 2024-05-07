'use strict';

/**
 * This module supports CSS loading, caching and 'localised' reuse.
 */
/**
 * An instance of Sophistrory can be used to obtain and cache CSS Stylesheets
 * which can be shared by multiple DOM elements.
 *
 *
 */
class Sophistry {
    /**
     * An cache for created SophistryStyleSheets.
     */
    styles = {};
    /**
     * Processes and 'pops' all style tags within the root.
     * Ensures that the same CSSStyleSheet can be reused across document trees (maindocument
     * and shadow roots) instead of duplicated even when they have been
     * created declaratively.
     *
     * If replace is truthy, any cached stylesheets with the same name (or hash) as a
     * styleshhet within the root will be replaced (reactively).
     *
     * This resolves the stated issue with declaratively adding encapsulated
     * styles to elements when using shadow DOM as described here;
     * https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM.
     *
     * @example
     * import { Sophistry } from 'deleight/sophistry';
     * const mySophistry = new Sophistry();
     * const element = apriori.createFragment(apriori.get('markup.html'));
     * const [styles, promises] = mySophistry.process(element);
     * document.body.append(element);
     * for (let style of styles) style.style(element, document.body.firstElementChild);
     *
     * @param {Element} root
     * @param {boolean} [replace]
     * @returns {[StyleSheet[], Promise<any>[]]}
     */
    process(root, replace) {
        const styleSheets = [];
        const promises = [];
        if ((root instanceof HTMLLinkElement &&
            root.getAttribute("rel") === "stylesheet") ||
            root instanceof HTMLStyleElement) {
            const name = root.getAttribute("s-ophistry") ||
                root.getAttribute("href")?.split('.')[0] ||
                hash(root.outerHTML);
            if (this.styles.hasOwnProperty(name) && !replace)
                styleSheets.push(this.styles[name]);
            else {
                let st, st2;
                if (this.styles.hasOwnProperty(name)) {
                    st2 = this.styles[name];
                    st = st2.css;
                }
                else {
                    if (root instanceof HTMLLinkElement &&
                        root.getAttribute("rel") === "stylesheet") {
                        st = new CSSStyleSheet();
                        promises.push(fetch(root.getAttribute("href"))
                            .then((r) => r.text())
                            .then((t) => st.replaceSync(t)));
                    }
                    else if (root instanceof HTMLStyleElement) {
                        st = new CSSStyleSheet(); // root.sheet will not work if style has not been added to DOM!!!
                        st.replaceSync(root.textContent);
                    }
                    st2 = new StyleSheet(st);
                    this.styles[name] = st2;
                }
                styleSheets.push(st2);
            }
            root.parentNode?.removeChild(root);
        }
        else {
            let node = root.children[0], node2;
            let nodeStyleSheets, nodePromises;
            while (node) {
                node2 = node.nextElementSibling;
                [nodeStyleSheets, nodePromises] = this.process(node, replace);
                styleSheets.push(...nodeStyleSheets);
                promises.push(...nodePromises);
                node = node2;
            }
        }
        return [styleSheets, promises];
    }
    /**
     * Import a stylesheet defined in an external CSS file. Optionally
     * specify a name for the imported style in the Scophystry context (cache).
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
    import(link, name) {
        const st = new CSSStyleSheet();
        const st2 = new StyleSheet(st);
        this.styles[name || link.split(".")[0]] = st2;
        const promise = fetch(link)
            .then((r) => r.text())
            .then((t) => st.replaceSync(t));
        return [st2, promise];
    }
    /**
     * Replaces the text of an existing stylesheet. This is reactive.
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
    set(name, css) {
        if (this.styles.hasOwnProperty(name))
            this.styles[name].css.replaceSync(css);
        else {
            const st = new CSSStyleSheet();
            st.replaceSync(css);
            this.styles[name] = new StyleSheet(st);
        }
    }
}
const hash = (str) => {
    let newHash = 0, chr;
    for (let i = 0, len = str.length; i < len; i++) {
        chr = str.charCodeAt(i);
        newHash = (newHash << 5) - newHash + chr;
        newHash |= 0; // convert to 32 bit int.
    }
    return newHash;
};
/**
 * This is used to wrap a CSSStyleSheet to provide convenient methods
 * for styling and 'unstyling' elements.
 *
 * @example
 * import { StyleSheet } from 'deleight/sophistry';
 * const sss = new StyleSheet(css);
 *
 */
class StyleSheet {
    /**
     * The wrapped CSS stylesheet.
     */
    css;
    /**
     * Creates a new Sophistry stylesheet.
     *
     * @param {CSSStyleSheet} cssStyleSheet
     * @constructor
     */
    constructor(cssStyleSheet) {
        this.css = cssStyleSheet;
    }
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
    style(...elements) {
        let root;
        const allElements = [];
        for (let element of elements) {
            if (!(element instanceof ShadowRoot) && element instanceof DocumentFragment)
                allElements.push(...Array.from(element.children));
            else
                allElements.push(element);
        }
        for (let element of allElements) {
            if (!(element instanceof Document) && !(element instanceof ShadowRoot)) {
                const childNodes = Array.from(element.childNodes);
                root = element.shadowRoot || element.attachShadow({ mode: "open" });
                element.innerHTML = "";
                root.append(...childNodes);
            }
            else
                root = element;
            if (!root.adoptedStyleSheets?.includes(this.css))
                root.adoptedStyleSheets = [
                    ...(root.adoptedStyleSheets || []),
                    this.css,
                ];
        }
    }
    /**
     * Removes the wrapped stylesheet from the elements (or their shadow roots).
     *
     * @example
     * sss.remove(...Array.from(document.body.children))
     *
     *
     * @param {...T} elements
     */
    remove(...elements) {
        let root;
        const allElements = [];
        for (let element of elements) {
            if (!(element instanceof ShadowRoot) && element instanceof DocumentFragment)
                allElements.push(...Array.from(element.children));
            else
                allElements.push(element);
        }
        for (let element of allElements) {
            root = element.shadowRoot || element;
            if (root instanceof ShadowRoot || root instanceof Document) {
                if (root.adoptedStyleSheets.includes(this.css))
                    root.adoptedStyleSheets.splice(root.adoptedStyleSheets.indexOf(this.css));
            }
        }
    }
}

exports.Sophistry = Sophistry;
exports.StyleSheet = StyleSheet;
