/**
 * Returns an object which escapes properties sourced from it. Escaping markup is a key component of template rendering, 
 * so this is an important function to have here.
 * 
 * NB: there are no tests yet. Please report any bugs.
 * 
 * @example
 * import { esc } from 'deleight/apriori'
 * const obj = { a: 1, b: 'no special chars', c: '<p>But I am a paragraph</p>', d: { e: '<p>"esc" will still work here</p>' } }
 * const escObj = esc(obj);
 * console.log(escObj.c);     // &lt;p&gt;But I am a paragraph&lt;/p&gt;
 * console.log(escObj.d.e);     // &lt;p&gt;&quot;esc&quot; will still work here&lt;/p&gt;
 * 
 * 
 * @param {*} rawObject 
 */
export function escObject(rawObject: any) {
    return new Proxy(rawObject, new EscTrap());
}

/**
 * Escapes special HTML characters in the input (unsafe) string.
 * 
 * Credits 'bjornd' (https://stackoverflow.com/questions/6234773/can-i-escape-html-special-chars-in-javascript)
 * 
 * @param {*} unsafe 
 * @returns 
 */
export function escString(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

class EscTrap {
    children = {};
    get(target, p) {
        if (this.children.hasOwnProperty(p)) return this.children[p];
        const result = target[p];
        if (typeof result === 'string') return this.children[p] = escString(result);
        else if (typeof result === 'object') return this.children[p] = escObject(result);
        else return this.children[p] = result;
    }
}
