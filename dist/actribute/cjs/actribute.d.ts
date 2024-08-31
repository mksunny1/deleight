/**
 * This module exports the {@link Actribute} class which provides a structured way to attach behavior to HTML elements. The library
 * enables us to attach meaning to attributes in markup. The main motivation for its original
 * development was adding behavior to built-in elements without creating complexity and accessibility issues. However it can
 * be used more generally to implement a component and/or reactive system based on attributes. This has more flexibility and
 * composability than using tag names for components. It can also save a lot of typing when we use recursive components.
 * Bear in mind this can lead to messy code if too much complex behavior is embedded
 * in markup. Use with discretion.
 *
 * The attributes here name the components and are passed to them along with the element. Components can use the
 * element, attribute and context they receive in any way appropriate for their functions. Simple components may
 * use the attribute values literally or call {@link props()} with them to extract properties from objects (often context objects)
 * which they then use for their operation. More complex components could even interprete the values
 * as code (but this is not recommended).
 *
 * @example
 * import { Actribute, props } from 'deleight/actribute';
 *
 * // initialize actribute:
 * const act = new Actribute();
 *
 * // register components:
 * act.register({
 *  comp1: (element, attr, singleContext) => element.textContent = attr.value,
 *  comp2: (element, attr, singleContext) => element.style.left = props(attr.value, [singleContext])
 * });
 *
 *
 * // process an element:
 * document.body.innerHTML = `
 *     <header></header>
 *      <article c-comp1='I replace all the children here anyway' >  <!-- using a raw value -->
 *          <p>[comp1] is not applied to me</p>
 *          <p>[comp1] is not applied to me</p>
 *     </article>
 *     <article r-comp2='a'>   <!-- using a prop -->
 *          <p>[comp2] is applied to me!</p>
 *          <p>[comp2] is applied to me!/p>
 *          <p>[comp2] is not applied to me!</p>
 *     </article>
 * `;
 * const data = { a: '100px', b: 2, c: 3 };
 * act.process([{el: document.body, ctx: data}]);
 *
 * // unregister a component:
 * delete act.registry.comp2;
 *
 * @module
 */
/**
 * Represents a component function. The function takes an element
 * as its first argument and the attribute that matches it as its second argument. It may
 * optionally receive further context arguments. It can return anything.
 */
interface IComponent {
    (element: Element, attr: Attr, ...context: any[]): any;
}
/**
 * Represents an object that is used to register multiple components
 * at once. The object keys become component names and the values become
 * component functions.
 */
interface IRegisterMap {
    [key: string | number]: IComponent;
}
interface IActributeInit {
    open?: string;
    closed?: string;
}
type IProcessOptions = {
    el?: Element;
    attr?: string;
    rattr?: string;
    ctx?: any[];
} | Element | string | any[];
/**
 * A component can declare itself `open` by returning this symbol. This means
 * that { @link Actribute#process } will process its children after it.
 */
declare const open: unique symbol;
/**
 * A component can also declare itself closed by returning this symbol. This means
 * that { @link Actribute#process } will not process its children after it.
 */
declare const closed: unique symbol;
/**
 * An Actribute class. Instances can be used to register components and process
 * elements. This is almost like a custom elements registry.
 *
 * @example
 * import { Actribute, props } from 'deleight/actribute';
 * const act = new Actribute();
 *
 */
declare class Actribute {
    /**
     * The object that holds all registered components. The keys are the
     * component names and the values are the component functions.
     */
    registry: {
        [key: string | number]: IComponent;
    };
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
     *
     * Construct a new Actribute instance.
     *
     * A component specifier is of the form [attrPrefix][componentName]="..."
     *
     * When a component specifier is encountered, the component's function will be
     * invoked with the element and the matching attribute as arguments.
     *
     * The attribute can be string (where at least 1 property name is specified),
     * or boolean (where no property is specified).
     *
     * An 'open' element means its children are processed after it and a `closed`
     * element means they are not. Elements are 'open' by default when there are no
     * matching components on them and 'closed' otherwise. The optional `init` object
     * can be used to set the attribute names that are used to override this behavior.
     * The default open attribute is `o-pen` and the one for closed is `c-losed`.
     *
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const init = {open: 'o-pen', closed: 'c-losed'};
     * const act = new Actribute(init);
     *
     * document.body.innerHTML = `
     *     <header></header>
     *      <article >
     *          <p>I am processed</p>
     *          <p>I am processed</p>
     *     </article>
     *     <article c-losed>
     *          <p>I am not processed</p>
     *          <p>I am not processed</p>
     *          <p>I am not processed</p>
     *     </article>
     * `;
     *
     * act.process(document.body)
     *
     * @param {IActributeInit} init The value to assign to attrPrefix. Defaults to 'c-'
     * @constructor
     */
    constructor(init?: IActributeInit);
    /**
     * Registers multiple components at once using an object that maps
     * component names to component functions.
     *
     * @example
     * import { Actribute } from 'deleight/actribute';
     * const act = new Actribute();
     * act.register({
     *  comp1: (element, attr, singleContext) => element.textContent = attr.value,
     *  comp2: (element, attr, singleContext) => element.style.left = props(attr.value, [singleContext])
     * });
     *
     * @param registerMap
     * @returns
     */
    register(registerMap: IRegisterMap): this;
    /**
     * Recursively processes `options.el` (or `document.body` by default) to
     * identify and apply components. Attributes with names starting with
     * `options.attr` (or `c-` by default) or `options.rattr` (or `r-` by default)
     * are treated as component specifiers.
     *
     * At elements where any components are encountered, the components
     * are called with the element, the attribute and any specified
     * context objects (`...(options.context || [])`).
     *
     * Where a component is encountered, decendants are not processed unless `this.open`
     * attribute is present on the element. At elements without a component, the descendants
     * are processed recursively, except `this.closed` boolean attribute is
     * specified. These are supposed to echo the semantics of the Shadow DOM API.
     *
     * If a component is not found and a wild-card component is registered (with '*'),
     * the widcard component is called instead.
     *
     * `options.attr` prefixes a component that is applied once while `options.rattr`
     * prefixes one that is applied recursively on all descendant elements which are not
     * within `closed` elements. Recursive attributes can save a lot of typing.
     *
     * Returns the same actribute to support call chaining.
     *
     * @example
     * import { Actribute, props } from 'deleight/actribute';
     * const act = new Actribute();
     * act.register({
     *  comp1: (element, attr, singleContext) => element.textContent = attr.value,
     *  comp2: (element, attr, singleContext) => element.style.left = props(attr.value, [singleContext][0])
     * });
     * document.body.innerHTML = `
     *     <header></header>
     *      <article c-comp1='I replace all the children here anyway' >  <!-- using a raw value -->
     *          <p>[comp1] is not applied to me</p>
     *          <p>[comp1] is not applied to me</p>
     *     </article>
     *     <article r-comp2='a'>   <!-- using a prop -->
     *          <p>[comp2] is applied to me!</p>
     *          <p>[comp2] is applied to me!/p>
     *          <p>[comp2] is not applied to me!</p>
     *     </article>
     * `;
     * const data = { a: '100px', b: 2, c: 3 };
     * act.process([{el: document.body, ctx: data}]);
     *
     * @param {IProcessOptions} [options]
     * @returns {Actribute}
     */
    process(options?: IProcessOptions, recursiveComps?: Map<IComponent, Attr>): Actribute;
}
/**
 * Obtain 1 or more properties from the specified sources. Specify the property names
 * separated by a separator (`" "` by default). Returns an array of values for
 * each specified property in the names. Each property is returned from the
 * first object containing it.
 *
 * @example
 * const fbProps = { f: 20, g: 7 };
 * const mainProps = { a: 1, b: { c: 1, d: 2 }, e: 3, f: 100 };
 * console.log(props('e f g', [mainProps, fbProps]));  // [3, 100, 7]
 *
 * @param names
 * @param scopes
 * @param sep
 * @returns
 */
declare function props(names: string, scopes: any[], sep?: string): any[];
/**
 * Join multiple components, so that they can be applied as one component.
 * Can reduce repetitive markup in many cases. If you specify a returnValue
 * the new component will return it, else it will return the return value of
 * the last joined component.
 *
 * @example
 *
 * import ( join, Actribute ) from 'deleight/actribute';
 *
 * document.body.innerHTML = `
 * <div>I am not a component</div>
 * <main c-comp><p>I am inside a joined component</p></main>
 * <section>I am not a component</section>
 *  <article>I am not a component</article>
 *  `;
 *
 *  const act = new Actribute();
 *  const comps = [];
 *  const baseComp = (node) => comps.push(node.tagName);
 *  const comp = join([baseComp, baseComp, baseComp]);
 *  act.register({ comp });
 *
 * act.process(document.body);
 *
 *  console.log(comps.length);  // 3
 *  console.log(comps[0]);      // "MAIN"
 *  console.log(comps[1]);      // "MAIN"
 *  console.log(comps[2]);      // "MAIN"
 *
 * @param components
 * @param returnValue
 * @returns
 */
declare function join(components: IComponent[], returnValue?: any): (element: Element, attr: Attr, ...context: any[]) => any;

export { Actribute, type IActributeInit, type IComponent, type IProcessOptions, type IRegisterMap, closed, join, open, props };
