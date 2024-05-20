/**
 * Actributes lets you attach components to HTML elements within markup. 2 
 * use cases we have found include implementing reactivity (Actribution) and 
 * 'extending' built-in elements.
 * 
 * The attributes here name the components and any values
 * are passed to the components along with the element. Components can use the 
 * values in any appropriate to their operations. Simple components will typically 
 * call the props function on them to extract properties from objects which they 
 * then use for their operation. More complex components could interprete the values 
 * as code.
 *
 * @example
 * import { Actribute, props } from 'deleight/actribute';
 * // initialize:
 * const fallbackProps = {
 *    prop1: 'Fallback', prop4: 'Last resort', 
 *    sig: '$2b$20$o7DWuroOjbA/4LDWIstjueW9Hi6unv4fI0xAit7UQfLw/PI8iPl1y'
 * };
 * const act = new Actribute();
 *
 * // register components:
 * act.register('comp1', (element, attr, ...context) => element.textContent = props(attr.value, context)[0]);
 * act.register('comp2', (element, attr) => element.style.left = attr.value);
 *
 * // use in markup:
 * // &lt;section c-comp1="prop1"  c-comp2="100px" &gt;
 * //       First section
 * // &lt;/section&gt;
 *
 * / process components:
 * act.process({el: document.body, ctx: [{prop1: 2, prop3: 2}, fallbackProps]});
 *
 * // unregister a component:
 * delete act.registry.comp2;
 */

/**
 * Represents a component function. The function takes an element 
 * as its first argument and the attribute as its second argument. It may 
 * optionally receive further context arguments. It can return anything.
 */
export interface IComponent {
    (element: Element, attr: Attr, ...context: any[]): any
}

/**
 * Represents an object that is used to register multiple components 
 * at once. The object keys become component names and the values become 
 * component functions.
 */
export interface IRegisterMap {
    [key: string|number]: IComponent
}

export interface IActributeInit {
    open?: string,
    closed?: string
}

export type IProcessOptions = {
    el?: Element,
    attr?: string,
    ctx?: any[]
} | Element | string | any[]

/**
 * An Actribute class. This is almost like a custom elements registry 'class'.
 */
export class Actribute {
    /**
     * The object that holds all registered components. The keys are the
     * component names and the values are the component functions.
     */
    registry: { [key: string | number]: Function } = {};

    /**
     * The attribute used to specify that the tree of an element with 
     * components is open to nested processing.
     */
    openAttr: string;

    /**
     * The attribute used to specify that the tree of an element with 
     * components is not open to nested processing.
     */
    closedAttr: string;

    /**
     * Construct a new Actribute instance.
     * 
     * A component specifier is of the form [attrPrefix][componentName]="[propertyName] [propertyName] ..."
     *
     * When a component specifier is encountered, the component's function will be
     * invoked with the element and any specified properties as arguments.
     *
     * The attribute can be string (where at least 1 property name is specified),
     * or boolean (where no property is specified).
     *
     * The props object passed to this initializer behaves like a global
     * from which component props may be obtained if they are not found in
     * the props object passed to the `process` method.
     * 
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     *
     * @param {IActributeInit} init The value to assign to attrPrefix. Defaults to 'c-'
     * @constructor
     */
    constructor(init?: IActributeInit) {
        this.openAttr = init?.open || 'o-pen';
        this.closedAttr = init?.closed || 'c-losed';
    }
    /**
     * Registers multiple components at once using an object that maps 
     * component names to component functions.
     * 
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     * act.register({
     *  comp1: (element, prop1) => element.textContent = prop1,
     *  comp2: (element, prop2) => element.style.left = prop2
     * });
     *  
     * @param registerMap 
     * @returns 
     */
    register(registerMap: IRegisterMap) {
        return Object.assign(this.registry, registerMap) && this;
    }
    /**
     * Recursively processes `options.el` (or `document.body` by default) to 
     * identify and apply components. Attributes with names starting with 
     * `options.attr` (or `c-` by default) are treated as component specifiers.
     *
     * At elements where any components are encountered, the components
     * are called with the element, the attribute value and any specified 
     * context objects (`...(options.context || [])`). 
     * 
     * Where a component is encountered, decendants are not processed unless `this.open` 
     * attribute is present on the element. At elements without a component, the descendants 
     * are processed recursively, except `this.closed` boolean attribute is 
     * specified. These are supposed to echo the semantics of the Shadow DOM API.
     *  
     * If a component is not found and a wild-card component is registered (with '*'), 
     * the widcard component is called instead with the whole attribute passed as the second 
     * argument.
     * 
     * Returns the same actribute to support call chaining.
     * 
     * @example
     * import { Actribute, props } from 'deleight/actribute';
     * const act = new Actribute();
     * act.register({
     *  comp1: (element, attr, singleContext) => element.textContent = attr.value,
     *  comp2: (element, attr, singleContext) => element.style.left = props(attr.value, [singleContext])
     * });
     * act.process([{prop2: 1, prop3: 2}]);
     *
     * @param {IProcessOptions} [options]
     * @returns {Actribute}
     */
    process(options?: IProcessOptions): Actribute {
        let element: Element, attrPrefix: string, context: any[];
        if (typeof options === 'string') attrPrefix = options;
        else if (options instanceof Element) element = options;
        else if (options instanceof Array) context = options;
        else if (typeof options === "object") {
            element = options.el;
            attrPrefix = options.attr;
            context = options.ctx
        }
        if (!element) element = document.body;
        if (!attrPrefix) attrPrefix = 'c-';
        if (!context) context = [];

        const attrs = element.attributes, length = attrs.length;

        let attr: Attr, i: number, comp: string, processed = false, open = element.hasAttribute(this.openAttr);
        for (i = 0; i < length; i++) {
            attr = attrs[i];
            if (attr.name.startsWith(attrPrefix)) {
                processed = true;
                comp = attr.name.substring(attrPrefix.length);
                if (this.registry.hasOwnProperty(comp)) {
                    this.registry[comp](element, attr, ...context);
                } else if (this.registry.hasOwnProperty('*')) {
                    this.registry['*'](element, attr, ...context);
                } else {
                    throw new Error(
                        `The component  "${comp}" was not found in the registry.`,
                    );
                }
            }
        }
        if (!processed || open) {
            for (let child of Array.from(element.children)) if (!child.hasAttribute(this.closedAttr)) this.process({el: child, attr: attrPrefix, ctx: context});
        }
        return this;
    }
}

/**
 * Searches the object for the given prop.
 * prop can be specified as a dot-separated string so that
 * the lookup scheme is similar to a nested property access.
 * prop may contain any character except the propSep (space by default)
 * passed to the `process` method.
 * 
 * @param {T} obj
 * @param {string} prop
 */
function get<T extends object>(obj: T, prop: string) {
    const props = prop.split(".");
    let result = obj[props[0].trim()];
    for (
        let i = 1;
        i < props.length &&
        (typeof result === "object" || typeof result === "function");
        i++
    ) {
        obj = result;
        result = obj[props[i].trim()];
    }
    return result;
}

/**
 * Obtain properties from the specified sources. Specify the property names 
 * separated by a separator (`" "` by default).
 * @example
 * 
 * @param names 
 * @param sources 
 * @param sep 
 * @returns 
 */
export function props(names: string, sources: any[], sep?: string): any[] {
    const results = [], length = sources.length;
    names = names.trim();
    
    let name: string, val: any, i: number;
    for (name of names.split(sep || ' ')) {
        name = name.trim();
        if (name === "") continue; // just too much space between prop names/keys.
        val = undefined; i = -1;
        while (val === undefined && ++i < length) val = get(sources[i], name);
        if (val !== undefined) results.push(val);
        else {
            throw new TypeError(
                `The property "${name}" was not found in any of the sources.`,
            );
        }
    }
    return results;
}
