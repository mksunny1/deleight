/**
 * This module exports primitives for 'bulk' manipulating the DOM.
 */
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
function insert(elements, values, insertWith) {
    if (!insertWith)
        insertWith = inserter.append; // the default inserter
    let elements2 = elements;
    if (!elements2.next)
        elements2 = elements[Symbol.iterator]();
    for (let value of values) {
        insertWith(value, elements2.next().value);
    }
    return [elements, values];
}
/**
 * Default inserters for use with `insert`
 */
const inserter = {
    /**
     * Inserts the node before the target using `insertBefore`
     * @param {Node} node
     * @param {Node} target
     */
    before(node, target) {
        target.parentNode?.insertBefore(node, target);
    },
    /**
     * Append the node to the target using `appendChild`
     * @param {Node} node
     * @param {Node} target
     */
    append(node, target) {
        target.appendChild(node);
    },
};
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
function set(elements, values) {
    const localMemberValues = {};
    const deps = {};
    let memberValues2;
    let allValues = new Map();
    for (let [key, memberValues] of Object.entries(values)) {
        if (allValues.has(memberValues))
            deps[key] = allValues.get(memberValues);
        else {
            memberValues2 = memberValues;
            if (!(memberValues2.next))
                memberValues2 = memberValues[Symbol.iterator]();
            localMemberValues[key] = memberValues2;
            allValues.set(memberValues, key);
        }
    }
    // if (!(elements instanceof Array)) elements = Array.from(elements);
    // we must materialize this first.
    let member, memberValues, memberValue;
    let currentValues = {}, dep;
    for (let element of elements) {
        for ([member, memberValues] of Object.entries(localMemberValues)) {
            memberValue = memberValues.next().value;
            currentValues[member] = memberValue;
            if (member.startsWith("_")) {
                member = member.slice(1);
                element.setAttribute(member, memberValue);
            }
            else {
                element[member] = memberValue;
            }
        }
        for ([member, dep] of Object.entries(deps)) {
            if (member.startsWith("_")) {
                member = member.slice(1);
                element.setAttribute(member, currentValues[dep]);
            }
            else {
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
function update(elements, values, lazy) {
    let parentNode, tempNode;
    const template = document.createComment(""); // document.createElement('template');
    const temps = [];
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
    return [elements, values]; // we can, eg run cleanups or inits on either of these.
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
function remove(elements, lazy) {
    if (!lazy)
        elements = [...elements];
    for (let element of elements)
        element.parentNode?.removeChild(element);
    return elements; // we can, eg run cleanups on these.
}

export { insert, inserter, remove, set, update };
