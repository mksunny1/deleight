/**
 * Compares 2 elements and throws an error if there is a difference between any of their 
 * attributes or text content. Preferable for testing DOM things (than using string).
 * 
 * @param {*} element1 
 * @param {*} element2 
 */
export function compare(element1, element2, compareAttrs) {
    if (compareAttrs === undefined) compareAttrs = true;
    
    if (compareAttrs) {
        if (element1.attributes.length !== element2.attributes.length) {
            throw new Error(`E1 has ${element1.attributes.length} attributes but E2 has ${element2.attributes.length} attributes`)
        }
        for (let {name, value} of element1.attributes) {
            if (element2.getAttribute(name) !== value) {
                throw new Error(`E1["${name}"] is "${value}" but E2["${name}"] is "${element2.getAttribute(name)}"`)
            }
        }
    }
    
    if (element1.children.length !== element2.children.length) {
        throw new Error(`E1 has ${element1.children.length} children but E2 has ${element2.children.length} children`)
    }
    
    for (let i = 0; i < element1.children.length; i++) compare(element1.children[i], element2.children[i]);
}