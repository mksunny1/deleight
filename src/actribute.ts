/**
 * This module has been designed to be a drop-in replacement for extending built-in elements. It is supposed to be
 * 1. More widely supported. Safari does not support 'is' attribute.
 * 2. More concise and flexible. You can register and unregister components and you can attach multiple components to the same element..
 * 3. Easier to pass down props in markup without creating ugly markup.
 *
 * The attributes here name the components and the values
 * are the names of props to pass to them along with the element.
 *
 * @example
 * import { Actribute } from 'deleight/actribute';
 * // initialize:
 * const fallbackProps = {
 *    prop1: 'Fallback', prop4: 'Last resort', 
 *    sig: '$2b$20$o7DWuroOjbA/4LDWIstjueW9Hi6unv4fI0xAit7UQfLw/PI8iPl1y'
 * };
 * const act = new Actribute(fallbackProps);
 *
 * // register components:
 * act.register('comp1', (node, prop1) => node.textContent = prop1);
 * act.register('comp2', (node, prop2) => node.style.left = prop2);
 *
 * // use in markup:
 * // &lt;section c-comp1="prop1"  c-comp2="prop2" &gt;
 * //       First section
 * // &lt;/section&gt;
 *
 * / process components:
 * act.process(document.body, {prop2: 1, prop3: 2});
 *
 * // unregister a component:
 * delete act.registry.comp2;
 */

/**
 * Represents a component function. The function takes an element 
 * as its first argument. It may optionally receive further props 
 * arguments. It can return anything.
 */
interface IComponent {
    (element: Element, ...props: any[]): any
}

/**
 * Represents an object that is used to register multiple components 
 * at once. The object keys become component names and the values become 
 * component functions.
 */
export interface IRegisterMap {
    [key: string|number]: IComponent
}

/**
 * An Actribute class. Similar to a custom elements registry 'class'.
 */
export class Actribute {
    /**
     * The object that holds all registered components. The keys are the
     * component names and the values are the component functions.
     */
    registry: { [key: string | number]: Function } = {};

    /**
     * This object holds any fallback props which can be referenced
     * in the markup, in the values of component attributes. Property names
     * can be referenced similarly to CSS classes.
     */
    props: any;

    /**
     * This is the attribute prefix that denotes component specifiers in
     * markup. A component specifier is an attribute where the name (after
     * the prefix) refers to a component name (in the registery) and the
     * optional value is a space-separated list of property names.
     */
    attrPrefix: string;

    /**
     * Construct a new Actribute instance with the fallback props and
     * attribute prefix.
     *
     * It is similar to a Custom Element registry. When used to process 
     * markup, attributes with names starting with `attrPrefix` are treated 
     * as component specifiers.
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
     * @param {any} props The value to assign to the props member.
     * @param {string} attrPrefix The value to assign to attrPrefix. Defaults to 'c-'
     * @constructor
     */
    constructor(props: any, attrPrefix: string) {
        this.props = props || {};
        this.attrPrefix = attrPrefix || "c-";
    }
    /**
     * Registers a function as a component bearing the given name.
     * The component can be referenced in processed markup using
     * the name.
     *
     * Returns the same actribute to support chaining.
     * 
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     * act.register('comp1', (element, prop1) => element.textContent = prop1);
     * act.register('comp2', (element, prop2) => element.style.left = prop2);
     *
     * @param {string} name The component name
     * @param {Function} component The component function
     * @returns {Actribute}
     */
    register(name: string, component: IComponent): Actribute {
        return ( this.registry[name] = component ) && this;
    }
    /**
     * Registers multiple components at once using an object that maps 
     * component names to component functions. This is more succint than 
     * repeated calls to `this.register()`.
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     * act.registerAll({
     *  comp1: (element, prop1) => element.textContent = prop1,
     *  comp2: (element, prop2) => element.style.left = prop2
     * });
     *  
     * @param registerMap 
     * @returns 
     */
    registerAll(registerMap: IRegisterMap) {
        return Object.assign(this.registry, registerMap) && this;
    }
    /**
     * Recursively processes the node to identify and apply components.
     *
     * At elements where any components are encountered, the components
     * are called with the element and any specified props. The decendants
     * are not processed.
     *
     * At elements without a component, the descendants are processed
     * recursively.
     *
     * Returns the same actribute to support call chaining.
     * 
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const fallbackProps = {
     *    prop1: 'Fallback', prop4: 'Last resort'
     * };
     * const act = new Actribute(fallbackProps);
     * act.register('comp1', (node, prop1) => node.textContent = prop1);
     * act.register('comp2', (node, prop2) => node.style.left = prop2);
     * act.process(document.body, {prop2: 1, prop3: 2});
     *
     * @param {HTMLElement} element
     * @param {any} [props]
     * @param {string} [propSep]
     * @returns {Actribute}
     */
    process(element: Element, props?: any, propSep?: string): Actribute {
        if (!props) props = {};
        if (propSep === undefined) {
            propSep = " ";
        }

        let compProps: any[] = [],
            comp: string,
            propKey: string,
            propVal: any,
            processed = false;

        for (let { name, value } of Array.from(element.attributes)) {
            if (name.startsWith(this.attrPrefix)) {
                processed = true;
                comp = name.substring(this.attrPrefix.length);
                if (this.registry.hasOwnProperty(comp)) {
                    compProps = [];
                    value = value.trim();
                    if (value) {
                        for (propKey of value.split(propSep)) {
                            propKey = propKey.trim();
                            if (propKey === "") continue; // just too much space between prop names/keys.
                            propVal = get(props, propKey) || get(this.props, propKey);
                            if (propVal !== undefined) compProps.push(propVal);
                            else {
                                throw new Error(
                                    `The property "${propKey}" was not found for the component "${comp}" in the element "${element.toString()}"."`,
                                );
                            }
                        }
                    }
                    this.registry[comp](element, ...compProps);
                } else {
                    throw new Error(
                        `The component  "${comp}" was not found in the registry.`,
                    );
                }
            }
        }

        if (!processed) {
            for (let child of Array.from(element.children)) {
                this.process(child, props, propSep);
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
 * @example
 * import { Actribute } from 'deleight/actribute';
 * const fallbackProps = {
 *    prop1: 'Fallback', prop4: 'Last resort'
 * };
 * const act = new Actribute(fallbackProps);
 * const prop = act.get(fallbackProps, 'prop1');
 * // Fallback
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
