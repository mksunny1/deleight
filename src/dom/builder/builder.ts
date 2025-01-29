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

import { IComponent } from "../dom";


export type IConstructor<T> = { new (): T; prototype: T; };
export type IBuilder = Builder<string, typeof Element>;
export type IElementChild = IBuilder|(() => string)|string|number|Element;

/**
 * This will escape all input strings so it is safe by 
 * default. Pass a function that returns a string to explicitly 
 * indicate that you want the string treated as innerHTML.
 */
export class Builder<T extends string, U extends typeof Element> {
    tag: T
    attrs: object = {};
    nsAttrs: object = {};
    props: object = {};
    children: IElementChild[] = []
    components: IComponent[] = [];
    parents?: Set<IBuilder> = new Set();

    constructor(tag: T, ...children: IElementChild[]) {
        this.tag = tag;
        this.append(...children);
    }
    set(attrs: { [key: string]: any }) {
        Object.assign(this.attrs, attrs);
        return this;
    }
    setNs(namespace: string, attrs: { [key: string]: any }) {
        if (!this.nsAttrs.hasOwnProperty(namespace)) this.nsAttrs[namespace] = {};
        Object.assign(this.nsAttrs[namespace], attrs);
        return this;
    }
    assign(props: object) {
        Object.assign(this.props, props);
        return this;
    }
    prepend(...children: IElementChild[]) {
        for (let child of children) {
            this.children.unshift(child);
            if (child instanceof Builder) child.parents.add(this);
        }
        return this;
    }
    append(...children: IElementChild[]) {
        for (let child of children) {
            this.children.push(child);
            if (child instanceof Builder) child.parents.add(this);
        }
        return this;
    }
    replaceChildren(...children: IElementChild[]) {
        this.children.length = 0;
        this.append(...children);
        return this;
    }
    apply(...components: IComponent[]) {
        this.components.push(...components);
        return this;
    }
    replaceComponents(...components: IComponent[]) {
        this.components.length = 0;
        this.apply(...components);
        return this;
    }
    render(indent = 0): string {
        const attrs = Object.entries(this.attrs);
        const nsAttrs = Object.entries(this.nsAttrs);
        const pad = new Array(indent).fill(' ').join('');

        return `${pad}<${this.tag}${attrs.length? ` ${attrs.map(([k, v]) => `${k}="${v.replaceAll('"', '&quot;')}"`).join(' ')}`: ``}${nsAttrs.length? ` ${nsAttrs.map(([ns, attrs]) => attrs.map(([k, v]) => `${ns}:${k}="${v.replaceAll('"', '&quot;')}"`).join(' ')).join(' ')}`: ``}>
${this.children.map(c => c instanceof Builder? c.render(indent + 4): `${pad}    ${c}`.replaceAll('<', '&lt;').replaceAll('>', '&gt;')).join(`\n${pad}`)}
${pad}</${this.tag}>`;
    }
    build(): InstanceType<U> {
        return this.setup(this.create());
    }
    create(): InstanceType<U> {
        throw new Error('You must implement `build` in a subclass');
    }
    setup(element: InstanceType<U>) {
        // attributes
        for (let [k, v] of Object.entries(this.attrs)) {
            element.setAttribute(k, v);
        }

        // namespaced attributes
        let qualifiedName: string, value: string;
        for (let [namespace, attrs] of Object.entries(this.nsAttrs)) {
            for ([qualifiedName, value] of attrs) {
                element.setAttributeNS(namespace, qualifiedName, value)
            }
        }

        // properties
        Object.assign(element, this.props);

        // children
        element.append(...this.children.map(c => typeof c === 'number'? `${c}`: c instanceof Builder? c.build(): c instanceof Function? c(): c));

        // components
        for (let component of this.components) component(element);

        return element;
    }
    appendTo(...targets: (Element|IBuilder)[]) {
        for (let target of targets)
            if (target instanceof Builder) {
                target.append(this);
                this.parents.add(target);
            }
            else target.append(this.build())
        return this;
    }
    prependTo(...targets: (Element|IBuilder)[]) {
        for (let target of targets)
            if (target instanceof Builder) {
                target.prepend(this);
                this.parents.add(target);
            }
            else target.insertBefore(this.build(), target.firstChild);
        return this;
    }
    insertBefore(...targets: (Element|IBuilder)[]) {
        let parent: IBuilder, children: IElementChild[];
        for (let target of targets)
            if (target instanceof Builder) {
                for (parent of target.parents) {
                    children = parent.children;
                    children.splice(children.indexOf(target), 0, this);
                }
            } else target.parentNode.insertBefore(this.build(), target);
        return this;
    }
    insertAfter(...targets: (Element|IBuilder)[]) {
        let parent: IBuilder, children: IElementChild[];
        for (let target of targets)
            if (target instanceof Builder) {
                for (parent of target.parents) {
                    children = parent.children;
                    children.splice(children.indexOf(target) + 1, 0, this);
                }
            } else target.parentNode.insertBefore(this.build(), target);
        return this;
    }
    replace(...targets: (Element|IBuilder)[]) {
        let parent: IBuilder, children: IElementChild[];
        for (let target of targets)
            if (target instanceof Builder) {
                for (parent of target.parents) {
                    children = parent.children;
                    children[children.indexOf(target)] = this;
                }
            } else target.replaceWith(this.build());
        return this;
    }
}

export type IBuilderMethods = IMethods<IBuilder>

export type IBuilders = {
    builders: Iterable<IBuilder>;
    self?: IBuilders;
} & {
    [key in keyof IBuilderMethods]: (...args: Parameters<IBuilderMethods[key]>) => ReturnType<IBuilderMethods[key]> extends IBuilder? IBuilders: ReturnType<IBuilderMethods[key]>[]
}

export type ICallable = (...args: any[]) => any;

export type IMethods<T> = {
    [key in keyof T]: T[key] extends ICallable? T[key]: never;
}

const IBuildersProxy = {
    get(target: IBuilders, p: keyof Builder<string, typeof Element>) {
        return ((...args: any[]) => {
            const result: any[] = [];
            for (let builder of target.builders) result.push((builder[p] as any)(...args));
            if (result.length && !(result[0] instanceof Builder)) return result;
            else return target.self || (target.self = new Proxy(target, IBuildersProxy));
        })
    }
}

export function builders(...builders: Builder<string, typeof Element>[]) {
    return new Proxy({ builders } as any as IBuilders, IBuildersProxy);
}
export const b = builders;

export class HTMLElementBuilder<T extends string & keyof HTMLElementTagNameMap> extends Builder<T, IConstructor<HTMLElementTagNameMap[T]>> {
    create(): HTMLElementTagNameMap[T] {
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
export function html<T extends string & keyof HTMLElementTagNameMap>(tag: T, ...children: IElementChild[]) {
    return new HTMLElementBuilder(tag, ...children);
}

export type IHtml = typeof html & { [key in keyof HTMLElementTagNameMap]: HTMLElementBuilder<key> };

export const h: IHtml = new Proxy(html, {
    get(target: IHtml, p: keyof HTMLElementTagNameMap) {
        return html(p);
    }
}) as any;

export type IHtml2 = typeof html & { [key in keyof HTMLElementTagNameMap]: (...children: IElementChild[]) => HTMLElementBuilder<key> };

export const hh: IHtml2 = new Proxy(html, {
    get(target: IHtml2, p: keyof HTMLElementTagNameMap) {
        return (...children: IElementChild[]) => html(p, ...children);
    }
}) as any;

export class SVGElementBuilder<T extends string & keyof SVGElementTagNameMap> extends Builder<T, IConstructor<SVGElementTagNameMap[T]>> {
    create(): SVGElementTagNameMap[T] {
        return document.createElementNS<T>('http://www.w3.org/2000/svg', this.tag);
    }
}

/**
 * Similar to {@link html} but for SVG elements.
 * 
 * @param tag 
 * @returns 
 */
export function svg<T extends string & keyof SVGElementTagNameMap>(tag: T, ...children: IElementChild[]) {
    return new SVGElementBuilder(tag, ...children);
}

export type ISvg = typeof svg & { [key in keyof SVGElementTagNameMap]: SVGElementBuilder<key> };

export const s: ISvg = new Proxy(svg, {
    get(target: ISvg, p: keyof SVGElementTagNameMap) {
        return svg(p);
    }
}) as any;


export type ISvg2 = typeof svg & { [key in keyof SVGElementTagNameMap]: (...children: IElementChild[]) => SVGElementBuilder<key> };

export const ss: ISvg2 = new Proxy(svg, {
    get(target: ISvg2, p: keyof SVGElementTagNameMap) {
        return (...children: IElementChild[]) => svg(p, ...children);
    }
}) as any;

export class MathMLElementBuilder<T extends string & keyof MathMLElementTagNameMap> extends Builder<T, IConstructor<MathMLElementTagNameMap[T]>> {
    create(): MathMLElementTagNameMap[T] {
        return document.createElementNS<T>('http://www.w3.org/1998/Math/MathML', this.tag);
    }
}

/**
 * Similar to {@link html} but for MathML elements.
 * 
 * @param tag 
 * @returns 
 */
export function math<T extends string & keyof MathMLElementTagNameMap>(tag: T, ...children: IElementChild[]) {
    return new MathMLElementBuilder(tag, ...children);
}

export type IMath = typeof math & { [key in keyof MathMLElementTagNameMap]: MathMLElementBuilder<key> };

export const m: IMath = new Proxy(math, {
    get(target: IMath, p: keyof MathMLElementTagNameMap) {
        return math(p);
    }
}) as any;

export type IMath2 = typeof math & { [key in keyof MathMLElementTagNameMap]: (...children: IElementChild[]) => MathMLElementBuilder<key> };

export const mm: IMath2 = new Proxy(math, {
    get(target: IMath2, p: keyof MathMLElementTagNameMap) {
        return (...children: IElementChild[]) => math(p, ...children);
    }
}) as any;