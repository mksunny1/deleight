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
 * A component can also declare itself open by returning this symbol
 */
export const open = Symbol('Open component');
/**
 * A component can also declare itself closed by returning this symbol
 */
export const closed = Symbol('Closed component');
/**
 * An Actribute class. This is almost like a custom elements registry 'class'.
 */
export class Actribute {
    /**
     * The object that holds all registered components. The keys are the
     * component names and the values are the component functions.
     */
    registry = {};
    /**
     * The attribute used to specify that the tree of an element with
     * components is open to nested processing.
     */
    openAttr;
    /**
     * The attribute used to specify that the tree of an element with
     * components is not open to nested processing.
     */
    closedAttr;
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
    constructor(init) {
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
    register(registerMap) {
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
    process(options, recursiveComps) {
        let element, attrPrefix, rattrPrefix, context;
        if (typeof options === 'string')
            attrPrefix = options;
        else if (options instanceof Element)
            element = options;
        else if (options instanceof Array)
            context = options;
        else if (typeof options === "object") {
            element = options.el;
            attrPrefix = options.attr;
            rattrPrefix = options.rattr;
            context = options.ctx;
        }
        if (!element)
            element = document.body;
        if (!attrPrefix)
            attrPrefix = 'c-';
        if (!rattrPrefix)
            rattrPrefix = 'r-';
        if (!context)
            context = [];
        if (!recursiveComps)
            recursiveComps = new Map();
        const attrs = element.attributes, length = attrs.length;
        let attr, i, comp, compF, processed = false, localOpen = element.hasAttribute(this.openAttr), localClosed = element.hasAttribute(this.closedAttr), compResult;
        for ([compF, attr] of recursiveComps.entries()) {
            compF(element, attr, ...context);
        }
        for (i = 0; i < length; i++) {
            attr = attrs[i];
            if (!attr)
                continue; // attr can get deleted by a component!
            if ((attr.name.startsWith(attrPrefix) || attr.name.startsWith(rattrPrefix)) &&
                attr.name !== this.openAttr && attr.name !== this.closedAttr) {
                processed = true;
                comp = attr.name.substring(attrPrefix.length);
                if (this.registry.hasOwnProperty(comp)) {
                    compF = this.registry[comp];
                    if (attr.name.startsWith(rattrPrefix) && !(recursiveComps.has(compF))) {
                        recursiveComps.set(compF, attr);
                    }
                    compResult = compF(element, attr, ...context);
                }
                else if (this.registry.hasOwnProperty('*')) {
                    compResult = this.registry['*'](element, attr, ...context);
                }
                else {
                    throw new Error(`The component  "${comp}" was not found in the registry.`);
                }
                if (compResult === open)
                    localOpen = true;
                else if (compResult === closed)
                    localClosed = true;
            }
        }
        if ((!processed || recursiveComps.size || localOpen) && !localClosed) {
            // local closed takes precedence over local open if they are both specified.
            let child = element.firstElementChild;
            const args = [];
            if (recursiveComps.size)
                args.push(recursiveComps);
            while (child) {
                this.process({
                    el: child, attr: attrPrefix, rattr: rattrPrefix, ctx: context
                }, ...args);
                child = child.nextElementSibling;
            }
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
function get(obj, prop, propSep = '.') {
    const props = prop.split(propSep);
    let result = obj[props[0].trim()];
    for (let i = 1; i < props.length &&
        (typeof result === "object" || typeof result === "function"); i++) {
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
 * @param scopes
 * @param sep
 * @returns
 */
export function props(names, scopes, sep) {
    if (typeof names !== 'string')
        names = names.toString();
    const results = [], length = scopes.length;
    names = names.trim();
    let name, val, i;
    for (name of names.split(sep || ' ')) {
        name = name.trim();
        if (name === "")
            continue; // just too much space between prop names/keys.
        val = undefined;
        i = -1;
        while (val === undefined && ++i < length)
            val = get(scopes[i], name);
        if (val !== undefined)
            results.push(val);
        else {
            throw new TypeError(`The property "${name}" was not found in any of the sources.`);
        }
    }
    return results;
}
/**
 * Join multiple components, so that they can be applied as one component.
 * Can reduce repetitive markup in many cases. If you specify a returnValue
 * the new component will return it, else it will return the return value of
 * the last component.
 *
 * @param components
 * @param returnValue
 * @returns
 */
export function join(components, returnValue) {
    return (element, attr, ...context) => {
        let lastValue;
        for (let comp of components)
            lastValue = comp(element, attr, ...context);
        return returnValue || lastValue;
    };
}
