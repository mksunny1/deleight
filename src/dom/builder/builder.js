/**
 *
 * Functions (and classes) for creating elements with javascript.
 *
 * Can be used on the server or client. Provides a better DX
 * than manually creating and setting up elements by using
 * call chaining.
 *
 * Benefits:
 * 1. Easily reuse `templates` which are just JS variables here.
 * 2. More natural within js code. Variables can be interpolated naturally.
 * 3. Better intellisense during development.
 * 4. Leads to more confidence about code correctness.
 * 5. Elements can be built more dynamically.
 * 6. Elements can be composed from different places
 * 7. Use the same code to create elements on the client and server.
 * 8. Safe by default. You need to pass functions instead of text to
 * specify HTML text. All text supplied as children are escaped. All
 * attributes are also escaped. (Note this only applies to `render` methods
 * which output HTML text).
 *
 * Notes:
 *
 * 1. This module supersedes 'dom/element/element' but that one has
 * been retained (for now) to avoid new breaking changes with this
 * release. Use this one for new code, and if possible, port old code
 * using the other module to this one.
 *
 * 2. Although this module may seem more verbose, it is actually easier to write
 * because you get autocomplete from the editor/IDE. The explicitness also
 * makes the code easier to remember, understand and maintain.
 *
 */
/**
 * This will escape all input strings so it is safe by
 * default. Pass a function that returns a string to explicitly
 * indicate that you want the string treated as innerHTML.
 */
export class Builder {
    constructor(tag, ...children) {
        this.attrs = {};
        this.nsAttrs = {};
        this.props = {};
        this.children = [];
        this.components = [];
        this.parents = new Set();
        this.tag = tag;
        this.append(...children);
    }
    set(attrs) {
        Object.assign(this.attrs, attrs);
        return this;
    }
    setNs(namespace, attrs) {
        if (!this.nsAttrs.hasOwnProperty(namespace))
            this.nsAttrs[namespace] = {};
        Object.assign(this.nsAttrs[namespace], attrs);
        return this;
    }
    assign(props) {
        Object.assign(this.props, props);
        return this;
    }
    prepend(...children) {
        for (let child of children) {
            this.children.unshift(child);
            if (child instanceof Builder)
                child.parents.add(this);
        }
        return this;
    }
    append(...children) {
        for (let child of children) {
            this.children.push(child);
            if (child instanceof Builder)
                child.parents.add(this);
        }
        return this;
    }
    replaceChildren(...children) {
        this.children.length = 0;
        this.append(...children);
        return this;
    }
    apply(...components) {
        this.components.push(...components);
        return this;
    }
    replaceComponents(...components) {
        this.components.length = 0;
        this.apply(...components);
        return this;
    }
    render(indent = 0) {
        const attrs = Object.entries(this.attrs);
        const nsAttrs = Object.entries(this.nsAttrs);
        const pad = new Array(indent).fill(' ').join('');
        return `${pad}<${this.tag}${attrs.length ? ` ${attrs.map(([k, v]) => `${k}="${v.replaceAll('"', '&quot;')}"`).join(' ')}` : ``}${nsAttrs.length ? ` ${nsAttrs.map(([ns, attrs]) => attrs.map(([k, v]) => `${ns}:${k}="${v.replaceAll('"', '&quot;')}"`).join(' ')).join(' ')}` : ``}>
${this.children.map(c => c instanceof Builder ? c.render(indent + 4) : `${pad}    ${c}`.replaceAll('<', '&lt;').replaceAll('>', '&gt;')).join(`\n${pad}`)}
${pad}</${this.tag}>`;
    }
    build() {
        return this.setup(this.create());
    }
    create() {
        throw new Error('You must implement `build` in a subclass');
    }
    setup(element) {
        // attributes
        for (let [k, v] of Object.entries(this.attrs)) {
            element.setAttribute(k, v);
        }
        // namespaced attributes
        let qualifiedName, value;
        for (let [namespace, attrs] of Object.entries(this.nsAttrs)) {
            for ([qualifiedName, value] of attrs) {
                element.setAttributeNS(namespace, qualifiedName, value);
            }
        }
        // properties
        Object.assign(element, this.props);
        // children
        element.append(...this.children.map(c => typeof c === 'number' ? `${c}` : c instanceof Builder ? c.build() : c instanceof Function ? c() : c));
        // components
        for (let component of this.components)
            component(element);
        return element;
    }
    appendTo(...targets) {
        for (let target of targets)
            if (target instanceof Builder) {
                target.append(this);
                this.parents.add(target);
            }
            else
                target.append(this.build());
        return this;
    }
    prependTo(...targets) {
        for (let target of targets)
            if (target instanceof Builder) {
                target.prepend(this);
                this.parents.add(target);
            }
            else
                target.insertBefore(this.build(), target.firstChild);
        return this;
    }
    insertBefore(...targets) {
        let parent, children;
        for (let target of targets)
            if (target instanceof Builder) {
                for (parent of target.parents) {
                    children = parent.children;
                    children.splice(children.indexOf(target), 0, this);
                }
            }
            else
                target.parentNode.insertBefore(this.build(), target);
        return this;
    }
    insertAfter(...targets) {
        let parent, children;
        for (let target of targets)
            if (target instanceof Builder) {
                for (parent of target.parents) {
                    children = parent.children;
                    children.splice(children.indexOf(target) + 1, 0, this);
                }
            }
            else
                target.parentNode.insertBefore(this.build(), target);
        return this;
    }
    replace(...targets) {
        let parent, children;
        for (let target of targets)
            if (target instanceof Builder) {
                for (parent of target.parents) {
                    children = parent.children;
                    children[children.indexOf(target)] = this;
                }
            }
            else
                target.replaceWith(this.build());
        return this;
    }
}
const IBuildersProxy = {
    get(target, p) {
        return ((...args) => {
            const result = [];
            for (let builder of target.builders)
                result.push(builder[p](...args));
            if (result.length && !(result[0] instanceof Builder))
                return result;
            else
                return target.self || (target.self = new Proxy(target, IBuildersProxy));
        });
    }
};
export function builders(...builders) {
    return new Proxy({ builders }, IBuildersProxy);
}
export const b = builders;
export class HTMLElementBuilder extends Builder {
    create() {
        return document.createElement(this.tag);
    }
}
/**
 *
 * Returns an HTML builder which can be used to create HTMLElement instances
 * (with `build` method) or their text representations (with `render` method).
 *
 * @example
 * import { html, h } from 'deleight/dom/builder'
 * // const verboseBuilder = html('main').set({ class: 'right bg' }).append(9);
 * const builder = h.main.set({ class: 'right bg' }).append(9);
 *
 * const markup = builder.render();
 * console.log(markup === `
 * <main class="right bg">
 *    9
 * </main>
 * `);      // true
 *
 * const element = builder.build();
 * console.log(element.tagName);     // MAIN
 *
 * @param tag
 * @returns
 */
export function html(tag, ...children) {
    return new HTMLElementBuilder(tag, ...children);
}
export const h = new Proxy(html, {
    get(target, p) {
        return html(p);
    }
});
export const hh = new Proxy(html, {
    get(target, p) {
        return (...children) => html(p, ...children);
    }
});
export class SVGElementBuilder extends Builder {
    create() {
        return document.createElementNS('http://www.w3.org/2000/svg', this.tag);
    }
}
/**
 * Similar to {@link html} but for SVG elements.
 *
 * @param tag
 * @returns
 */
export function svg(tag, ...children) {
    return new SVGElementBuilder(tag, ...children);
}
export const s = new Proxy(svg, {
    get(target, p) {
        return svg(p);
    }
});
export const ss = new Proxy(svg, {
    get(target, p) {
        return (...children) => svg(p, ...children);
    }
});
export class MathMLElementBuilder extends Builder {
    create() {
        return document.createElementNS('http://www.w3.org/1998/Math/MathML', this.tag);
    }
}
/**
 * Similar to {@link html} but for MathML elements.
 *
 * @param tag
 * @returns
 */
export function math(tag, ...children) {
    return new MathMLElementBuilder(tag, ...children);
}
export const m = new Proxy(math, {
    get(target, p) {
        return math(p);
    }
});
export const mm = new Proxy(math, {
    get(target, p) {
        return (...children) => math(p, ...children);
    }
});
