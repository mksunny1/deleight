/**
 * Exports {@link process} used to apply functions to elements which specify them
 * as components using special attributes.
 *
 *
 * @module
 */
import { IMap } from "../../types.js";
import { IComponent } from "../components/components.js";
export type IProcessComponents = IMap<IComponent>;
export interface IProcessOptions {
    prefix?: string;
    openPrefix?: string;
    open?: string;
    closed?: string;
    args?: any[];
    /**
     * Process only elements that match this query.
     */
    only?: string;
    /**
     * Component run on all component elements
     */
    default?: IComponent;
}
/**
 * Recursively process the element tree to apply a single component or an
 * object of components with
 * names specified by component attributes within the element tree.
 *
 * This function uses {@link baseProcess} under the hood so similar notes
 * apply. Here the element is the object to traverse and the components
 * and options are used to create the action passed to the underlying
 * function.
 *
 * A single component action (function) will simply run over the element and all
 * non-closed descendants. An object of components will match property names
 * against attribute names to run.
 *
 * A component attribute is an attribute with a name starting with the
 * compronent prefix (given as the `options.prefix` argument or `c-` by default).
 *
 * When a component is matched, it is called with the matching element and attribute
 * as its first 2 arguments. The element is placed in a 1-item array for consistency
 * with {@link apply} so that the same components work with both functions (in most cases).
 * If `options.args` is provided, its items will form the
 * remaining arguments passed to the component.
 *
 * Two other options (options.open and options.closed) are available to overide the
 * default attributes (ope-n and close-d) used to encapsulate components in the
 * markup.
 *
 * By default if an element is matched against a component, its descendants
 * will not be traversed by Process. You need to add the `ope-n` attribute here to
 * force further traversal of the element's tree (or use options.openPrefix instead of
 * options.prefix).
 *
 * Conversely, unmatched elements will always be traversed unless you include the
 * `close-d` attribute (or whatever you override it with in `options.open`).
 *
 * We can also supply `options.only` to process only elements that match a query.
 * This will usually improve performance.
 *
 * @example
 * import { process } from 'deleight/dom/process';
 * const comps = {
 *  comp1: ([element], attr, singleContext) => element.textContent = attr.value,
 *  comp2: ([element], attr, singleContext) => element.style.left = singleContext[attr.value])
 * };
 * document.body.innerHTML = `
 *     <header></header>
 *      <article c-comp1='I replace all the children here anyway' >  <!-- using a raw value -->
 *          <p>[comp1] is not applied to me</p>
 *          <p>[comp1] is not applied to me</p>
 *     </article>
 *     <article o-comp2='a'>   <!-- using a prop -->
 *          <p c-comp2>[comp2] is applied to me!</p>
 *          <p c-comp2>[comp2] is applied to me!/p>
 *          <p c-comp2>[comp2] is not applied to me!</p>
 *     </article>
 * `;
 * const data = { a: '100px', b: 2, c: 3 };
 * process(document.body, comps, { args: [data] });
 *
 *
 * @param element
 * @param action
 * @param options
 * @returns
 */
export declare function process(element: Element | DocumentFragment, action: IComponent | IProcessComponents, options?: IProcessOptions): HTMLCollection;
