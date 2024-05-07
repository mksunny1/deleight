/**
 * This module exports primitives for 'bulk' manipulating the DOM.
 */


/**
 * A function used to insert a new node using a target node.
 *
 * @example
 * myInserter = (node, target) => target.append(node);
 */
export interface IInserter {
    (node: Node, target: Node): void;
}

/**
 * Insert the values using the elements as target. The way they are inserted 
 * depend on the inserter. If not provided, the default inserter will append the values 
 * to the corresponding elements.
 *
 * @example
 * // Insert a span into all the children of the first main element:
 * import { insert } from 'deleight/domitory';
 * const span = document.createElement('span');
 * const main = document.querySelector('main');
 * insert(main.children, main.children.map(() => span.cloneNode()))
 *
 *
 * @param {Iterable<Node>} elements The target nodes.
 * @param {Iterable<Node>} values The new nodes to insert.
 * @param {IInserter} [insertWith] The insertion function
 */
export function insert(
    elements: Iterable<Node> ,
    values: Iterable<Node>,
    insertWith?: IInserter,
): [Iterable<Node>, Iterable<Node>] {
    if (!insertWith) insertWith = inserter.append; // the default inserter
    let elements2 = elements as any as Iterator<Node>;
    if (!elements2.next) elements2 = elements[Symbol.iterator]();
    for (let value of values) {
        insertWith(value, elements2.next().value);
    }
    return [elements, values];
}

/**
 * Default inserters for use with `insert`
 */
export const inserter = {
    /**
     * Inserts the node before the target using `insertBefore`
     * @param {Node} node
     * @param {Node} target
     */
    before(node: Node, target: Node) {
        target.parentNode?.insertBefore(node, target);
    },
    /**
     * Append the node to the target using `appendChild`
     * @param {Node} node
     * @param {Node} target
     */
    append(node: Node, target: Node) {
        target.appendChild(node);
    },
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
export interface ISetMap {
    [key: string]: Iterable<any>;
}

/**
 * Set specified properties and/or attributes on the specified elements.
 * Please do not pass the same 'generator' multiple times in values. First
 * convert them to arrays.
 *
 * @example
 * // Shuffle the class attributes of all the children of the first main element:
 * import { set } from 'deleight/domitory';
 * import { uItems } from 'deleight/generational';
 * const main = document.querySelector('main');
 * const values = uItems(main.children.map(c => c.className));
 * set(main.children, {_class: values});
 * 
 * @param {(Element|CSSStyleRule)[]} elements
 * @param {ISetMap} values
 */
export function set(
    elements: Iterable<Element | CSSStyleRule>,
    values: ISetMap,
): [Iterable<Element | CSSStyleRule>, ISetMap] {
    const localMemberValues: {
        [key: string]: Iterator<any>
    } = {};
    const deps: {[key: string]: string} = {};
    let memberValues2: Iterator<any>;
    let allValues = new Map();
    for (let [key, memberValues] of Object.entries(values)) {
        if (allValues.has(memberValues)) deps[key] = allValues.get(memberValues);
        else {
            memberValues2 = memberValues as any as Iterator<any>;
            if (!(memberValues2.next)) memberValues2 = memberValues[Symbol.iterator]();
            localMemberValues[key] = memberValues2;
            allValues.set(memberValues, key);
        }
    }

    // if (!(elements instanceof Array)) elements = Array.from(elements);
    // we must materialize this first.

    let member: string, memberValues: Iterator<any>, memberValue: any;
    let currentValues: any = {}, dep: string;
    for (let element of elements) {
        for ([member, memberValues] of Object.entries(localMemberValues)) {
            memberValue = memberValues.next().value;
            currentValues[member] = memberValue;
            if (member.startsWith("_")) {
                member = member.slice(1);
                (element as Element).setAttribute(member, memberValue as string);
            } else {
                element[member] = memberValue;
            }
        }
        for ([member, dep] of Object.entries(deps)) {
            if (member.startsWith("_")) {
                member = member.slice(1);
                (element as Element).setAttribute(member, currentValues[dep]);
            } else {
                element[member] = currentValues[dep];
            }
        }
    }

    return [elements, values];
}

/**
 * Correctly replace the specified nodes with corresponding values.
 * 
 * This will materialize `elements` and `values` unless `lazy` 
 * is supplied and its value is truthy.
 *
 * @example
 * // Safely shuffle all the children of the first main element:
 * import { update } from 'deleight/domitory';
 * import { uItems } from 'deleight/generational';
 * const main = document.querySelector('main');
 * update(main.children, uItems(main.children))
 *
 * @param {Iterable<Node>} elements The nodes to replace.
 * @param {Iterable<Node>} values The replacement nodes.
 * @param { boolean } [lazy]
 */
export function update(elements: Iterable<Node>, values: Iterable<Node>, lazy?: boolean): [Iterable<Node>, Iterable<Node>] {
    let parentNode: Node | null, tempNode: Node;
    const template = document.createComment(""); // document.createElement('template');
    const temps: [Node, Node | null][] = [];

    if (!lazy) {
        elements = Array.from(elements);
        values = Array.from(values);
    }

    for (let element of elements) {
        parentNode = element.parentNode;
        tempNode = template.cloneNode(false);
        parentNode?.replaceChild(tempNode, element);
        temps.push([tempNode, parentNode]);
    }

    /* at this point we have replaced what we want to replace with temporary values */
    const temps2 = temps.values();
    for (let value of values) {
        [tempNode, parentNode] = temps2.next().value;
        parentNode?.replaceChild(value, tempNode);
    }
    return [elements, values];   // we can, eg run cleanups or inits on either of these.
}

/**
 * Remove the elements from their parent nodes. 
 * 
 * This will materialize `elements` unless `lazy` 
 * is supplied and its value is truthy.
 *
 * @example
 * import { update } from 'deleight/domitory';
 * const main = document.querySelector('main');
 * remoove(main.children);
 *
 * @param {Iterable<Node>} elements
 * @param { boolean } [lazy]
 */
export function remove(elements: Iterable<Node>, lazy?: boolean): Iterable<Node> {
    if (!lazy) elements = [...elements];
    for (let element of elements) element.parentNode?.removeChild(element);
    return elements;   // we can, eg run cleanups on these.
}
