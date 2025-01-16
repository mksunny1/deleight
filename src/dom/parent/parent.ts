/**
 * Utility functions for getting ancestor elements.
 * These can be used for selecting ancestors whether or not 
 * there are shadow roots in-between.
 * 
 * @module
 */

/**
 * Returns the parent node of a given element or shadow root.
 * This function is necessary because shadow roots have no 
 * parents but instead have hosts which may have them.
 * 
 * @example
 * 
 * @param node 
 * @returns 
 */
export function parent(node: Element | ShadowRoot) {
    return node instanceof Element? node.parentElement: node.host
}

/**
 * Returns the first ancestor that matches the specified selector.
 * This function treates the host of a shadow root as its parent.
 * 
 * @example
 * 
 * 
 * @param element 
 * @param selector 
 */
export function selectParent(element: Element, selector: string) {
    let eParent = parent(element);
    while (eParent && !eParent.matches(selector)) eParent = parent(eParent);
    return eParent;
}
