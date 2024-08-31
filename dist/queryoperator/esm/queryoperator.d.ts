/**
 * This module exports primitives for 'bulk' manipulation of the DOM.
 *
 * @module
 */
/**
 * A function used to insert a new node using a target node.
 *
 * @example
 * myInserter = (node, target) => target.append(node);
 */
interface IInserter {
    (node: Node, target: Node): void;
}
/**
 * Insert the values using the elements as target. The way they are inserted
 * depend on the inserter. If not provided, the default inserter will append the values
 * to the corresponding elements.
 *
 * @example
 * // Insert a span into all the children of the first main element:
 * import { insert } from 'deleight/queryoperator';
 * const span = document.createElement('span');
 * const main = document.querySelector('main');
 * insert(main.children, main.children.map(() => span.cloneNode()))
 *
 *
 * @param {Iterable<Node>} elements The target nodes.
 * @param {Iterable<Node>} values The new nodes to insert.
 * @param {IInserter} [insertWith] The insertion function
 */
declare function insert(elements: Iterable<Node>, values: Iterable<Node>, insertWith?: IInserter): [Iterable<Node>, Iterable<Node>];
/**
 * Default inserters for use with `insert`
 */
declare const inserter: {
    /**
     * Inserts the node before the target using `insertBefore`
     * @param {Node} node
     * @param {Node} target
     */
    before(node: Node, target: Node): void;
    /**
     * Append the node to the target using `appendChild`
     * @param {Node} node
     * @param {Node} target
     */
    append(node: Node, target: Node): void;
};
/**
 * Map of string keys to any[] values. The keys name properties
 * (or attributes when they start with _) and the values are arrays
 * matched against selected or specified elements .
 *
 * As an example, we can target 3 buttons to set their
 * textContents to corresponding values using the following SetOnMap
 * (as the values object in a call to `setOn`):
 * @example
 * {
 *     textContent: ['btn 1', 'btn 2', 'btn 3']
 * },
 */
interface ISetMap {
    [key: string]: Iterable<any>;
}
/**
 * Set specified properties and/or attributes on the specified elements
 * (or their children). Pass an iterable of elements (often an array) as the
 * first arg and an object mapping property names to value iterables to be matched against
 * the elenments at corresponding indices.
 *
 * If a key in `values` starts with the underscore (`_`), the attribute with
 * the name following the underscore will be set.
 *
 *
 * @example
 * // Shuffle the class attributes of all the children of the first main element:
 * import { set } from 'deleight/queryoperator';
 * import { uItems } from 'deleight/generational';
 * const main = document.querySelector('main');
 * const values = uItems(main.children.map(c => c.className));
 * set(main.children, {_class: values});
 *
 * @param {(Element|CSSStyleRule)[]} elements
 * @param {ISetMap} values
 * @param { boolean } undefinedIsEmpty
 */
declare function set(elements: Iterable<Element | CSSStyleRule>, values: ISetMap, undefinedIsEmpty?: boolean): [Iterable<Element | CSSStyleRule>, ISetMap];
/**
 * Correctly replace the specified nodes with corresponding values.
 *
 * This will materialize `elements` and `values` unless `lazy`
 * is supplied as a truthy value.
 *
 * @example
 * // Safely shuffle all the children of the first main element:
 * import { update } from 'deleight/queryoperator';
 * import { uItems } from 'deleight/generational';
 * const main = document.querySelector('main');
 * update(main.children, uItems(main.children))
 *
 * @param {Iterable<Node>} elements The nodes to replace.
 * @param {Iterable<Node>} values The replacement nodes.
 * @param { boolean } [lazy]
 */
declare function update(elements: Iterable<Node>, values: Iterable<Node>, lazy?: boolean): [Iterable<Node>, Iterable<Node>];
/**
 * Remove the elements from their parent nodes.
 *
 * This will materialize `elements` unless `lazy`
 * is supplied and its value is truthy.
 *
 * @example
 * import { update } from 'deleight/queryoperator';
 * const main = document.querySelector('main');
 * remoove(main.children);
 *
 * @param {Iterable<Node>} elements
 * @param { boolean } [lazy]
 */
declare function remove(elements: Iterable<Node>, lazy?: boolean): Iterable<Node>;

export { type IInserter, type ISetMap, insert, inserter, remove, set, update };
