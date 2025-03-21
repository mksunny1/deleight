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
 * @param {*} object 
 */
export function escObject<T extends object>(object: T): T {
    return new Proxy(object, new EscTrap()) as T;
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

 /**
  * Unified form of {@link escString} and {@link escObject}. 
  * 
  * @param value 
  * @returns 
  */
 export function esc<T extends string | object>(value: T): T {
    if (typeof value === 'string') return escString(value) as T;
    else return escObject(value) as T;
 }

 /**
  * The reverse process to escString. This can be important to 
  * get back a value that was previously escaped to allow transport 
  * within markup, for example as data attributes.
  * 
  * @param unsafe 
  * @returns 
  */
 export function unEsc(unsafe: string) {
    return unsafe
         .replace(/&amp;/g, "&")
         .replace(/&lt;/g, "<")
         .replace(/&gt;/g, ">")
         .replace(/&quot;/g, '"')
         .replace(/&#039;/g, "'");
 }

 