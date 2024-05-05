'use strict';

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
 * import {apply} from 'appliance'
 * import {insert} from 'domitory'
 * const span = document.createElement('span');
 * apply({main: main => insert(main.children, main.children.map(() => span.cloneNode())))})
 *
 *
 * @param {Iterable<Node>} elements The target nodes.
 * @param {Iterable<Node>} values The new nodes to insert.
 * @param {Inserter} [insertWith] The insertion function
 */
function insert(elements, values, insertWith) {
    if (!(values instanceof Array))
        values = Array.from(values);
    if (elements instanceof HTMLCollection || elements instanceof NodeList)
        elements = Array.from(elements);
    if (elements instanceof Array)
        elements = elements.values();
    if (!insertWith)
        insertWith = inserter.append; // the default inserter
    for (let value of values)
        insertWith(value, elements.next().value);
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
 * import {apply} from 'appliance'
 * import {set} from 'domitory'
 * import {uItems} from 'generational'
 * apply({main: main => set(main.children, {_class: uItems(main.children.map(c => c.className))})})
 *
 *
 * @param {(Element|CSSStyleRule)[]} elements
 * @param {SetMap} values
 */
function set(elements, values) {
    const localMemberValues = {};
    for (let [key, memberValues] of Object.entries(values)) {
        if (!(memberValues instanceof Array))
            memberValues = Array.from(memberValues);
        localMemberValues[key] = memberValues;
    }
    if (!(elements instanceof Array))
        elements = Array.from(elements);
    // we must materialize this first.
    let i = 0, memberValue;
    for (let [member, memberValues] of Object.entries(localMemberValues)) {
        i = 0;
        if (member.startsWith("_")) {
            member = member.slice(1);
            for (memberValue of memberValues) {
                elements[i++].setAttribute(member, memberValue);
            }
        }
        else {
            for (memberValue of memberValues) {
                elements[i++][member] = memberValue;
            }
        }
        i++;
    }
}
/**
 * Correctly replace the specified nodes with corresponding values.
 *
 * @example
 * // Safely shuffle all the children of the first main element:
 * import {apply} from 'appliance'
 * import {update} from 'domitory'
 * import {uItems} from 'generational'
 * apply({main: main => update(main.children, uItems(main.children))})
 *
 * @param {Iterable<Node>} elements The nodes to replace.
 * @param {Iterable<Node>} values The replacement nodes.
 */
function update(elements, values) {
    let parentNode, tempNode;
    const template = document.createComment(""); // document.createElement('template');
    const temps = [];
    if (!(elements instanceof Array))
        elements = Array.from(elements);
    if (!(values instanceof Array))
        values = Array.from(values);
    for (let element of elements) {
        parentNode = element.parentNode;
        tempNode = template.cloneNode(false);
        parentNode?.replaceChild(tempNode, element);
        temps.push([tempNode, parentNode]);
    }
    /* at this point we have replaced what we want to replace with temporary values */
    let i = 0;
    for (let value of values) {
        [tempNode, parentNode] = temps[i++];
        parentNode?.replaceChild(value, tempNode);
    }
}
/**
 * Remove the elements from their parent nodes.
 *
 * @example
 * // Remove all elements with the 'rem' class
 * apply({'.rem': (...elements) => remove(elements)});
 *
 * @param {Iterable<Node>} elements
 */
function remove(elements) {
    if (!(elements instanceof Array))
        elements = Array.from(elements);
    for (let element of elements)
        element.parentNode?.removeChild(element);
}

exports.insert = insert;
exports.inserter = inserter;
exports.remove = remove;
exports.set = set;
exports.update = update;
