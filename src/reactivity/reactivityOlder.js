/**
 * This module aims to provide some standard actribute components to support
 * a declarative style of 'adding logic to markup' similar to Vue.js. This is
 * helpful because it can allow the HTML and the JavaScript to be developed
 * more independently.
 *
 * One can imagine many cases where a change to a single variable can lead to
 * several modifications across the DOM. Without a thing like actribution, the
 * JavaScript team must know all the places in the markup that will be affected
 * by the change in order to compose the modification logic. This is an extra
 * burden, especially if the markup is developed concurrently or after the
 * JavaScript.
 *
 * The components of actribution will provide the following:
 * 1. set attributes which are computed from the changed variable
 * 2. set properties which are computed from the changed variable
 * 3. show or hide markup whose visibility depend on the value of the changed variable
 * 4. add or remove markup depending on the value of the changed variable.
 * 5. recreate trees based on the changed variable. For example repeated elements based on array items.
 *
 * Actions 4 and 5 both trigger the render function which processes all the
 * attribute and property setting directives in the tree. They also trigger
 * similar nested actions which are o-pen. Nested actions which are c-losed
 * have to be triggered directly. This is designed to follow similar semantics
 * to shadow dom. Indeed the o-pen and c-losed functionality are provided by
 * the base actributes module. c-losed is the default, so there is no need to
 * specify it. Only specify o-pen when necessary.
 *
 * Note that these incure a small performance penalty early on when compiling
 * code from markup. This is not a problem in most practical scenarios. It is
 * only mentioned for the sake of full disclosure.
 *
 */
export class Reactivity {
    /**
     * Maps the comment nodes to the template and end node generated on them.
     * Comments self-contain their code.
     * The code in the opening comment should start with { and the one
     * in the final comment should end with }.
     * To prevent capture of elements in-between them, start a comment before
     * those elements with ! and end a comment after them with !.
     *
     * @example
     *
     */
    commentTemplates = new WeakMap();
    comments = [];
    /**
     * All compiled comment templates
     */
    compiledCommentTemplates = new WeakMap();
    /**
     * Maps the reactivity attributes to the nams of the real node attributes.
     * Attributes self-contain their templates.
     */
    attrTargets = new WeakMap();
    attrs = [];
    /**
     * All compiled attribute templates
     */
    compiledAttrTemplates = new WeakMap();
    /**
     * The reactivity props to the names of node properties they set.
     */
    propTargets = new WeakMap();
    props = [];
    /**
     * All compiled property templates
     */
    compiledPropTemplates = new WeakMap();
    /**
     * Initializes a reactivity instance on the given element with the given
     * context object. The context object is used as context for rendering templates.
     *
     * Only comments, attrs and properties with templates can respond to reactivity events.
     * The class also exposes an API (template properties) for attaching and detaching
     * templates.
     *
     * During initialization, the element tree is traversed
     * recursively to create and attach templates for all template-describing attributes and comments.
     *
     * When react is called on an attr, prop or comment, the value is created and used
     * to replace the existing one, no questions asked.
     *
     * @example
     *
     *
     * @param { IReactivityInit } init
     */
    init(init) {
        const context = init?.context || {}, element = init?.el || document.body;
        const attrPrefix = init?.prefix?.attr || 'a-', propPrefix = init?.prefix?.prop || 'p-';
        const attrPrefixL = attrPrefix.length, propPrefixL = propPrefix.length;
        const attrs = element.attributes, length = attrs.length;
        let attr;
        for (let i = 0; i < length; i++) {
            attr = attrs[i];
            if (attr.name.startsWith(attrPrefix)) {
                this.attrs.push(new WeakRef(attr));
                this.attrTargets.set(attr, attr.name.slice(attrPrefixL));
            }
            else if (attr.name.startsWith(propPrefix)) {
                this.props.push(new WeakRef(attr));
                this.attrTargets.set(attr, attr.name.slice(propPrefixL));
            }
        }
        let childInit = Object.assign({}, init);
        for (let child of element.childNodes) {
            if (child instanceof Element) {
                this.init(Object.assign(childInit, { el: child }));
            }
            else if (child instanceof Comment) {
                this.comments.push(new WeakRef(child));
            }
        }
        return this;
    }
    /**
     * Compile all templates (Comment, Attributes and Properties).
     *
     * @example
     *
     */
    compile() {
        return this;
    }
    /**
     * Compile only the specified attributes (or all attributes if none is
     * specified).
     *
     * @example
     *
     *
     * @param attrs
     * @returns
     */
    compileAttrTemplates(...attrs) {
        return this; // for chaining
    }
    /**
     * Compile only the specified props (or all props). We use Attr array
     * because we can only create attrs in HTML and not props directly. We
     * distinguish props from attrs using on the prefix.
     *
     * @example
     *
     * @param props
     * @returns
     */
    compilePropTemplates(...props) {
        return this; // for chaining
    }
    /**
     * Compile specified (or all) comment templates.
     *
     * @param comments
     * @returns
     */
    compileCommentTemplates(...comments) {
        return this; // for chaining
    }
    /**
     *
     * @param options
     */
    react(options) {
        return this;
    }
    /**
     * Returns the first comment starting with the specified string.
     * We can use this to grab a reference to its template, perhaps to
     * compile and render directly. The template has both code and text
     * portions. Code is used for matching in `react` calls.
     *
     * @example
     *
     *
     * @param str
     */
    selectComment(str) {
    }
}
