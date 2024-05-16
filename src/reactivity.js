export class Reactivity {
    element;
    state = {};
    compiled = new WeakMap();
    constructor(element) {
        this.element = element;
        // compile reactive props and attrs
    }
    /**
     * Adda an object to the state.
     *
     * @param name
     * @param object
     * @param recursive
     * @returns
     */
    add(name, object, recursive) {
        this.state[name] = object;
        if (typeof object === 'object' || typeof object === 'function') {
            let target = { name, object, recursive, reactivity: this };
            if (typeof object === 'function') {
                target = Object.assign((...args) => react(this, name, object, args), target);
            }
            return new Proxy(target, trap);
        }
    }
}
const trap = {
    get(target, p) {
        let object = target.object[p];
        if (typeof object !== 'object' && typeof object !== 'function')
            return;
        let name = target.name;
        if (typeof p === 'number')
            name += `[${p}]`;
        else if (typeof p === 'string')
            name += '.' + p; // !!!!!!!!!!! NB: still check for special strings wrapped as ["..."]
        else
            throw new TypeError('Cannot return a reactivity proxy for a property with a key of type "symbol"');
        let pTarget = { name, object, recursive: target.recursive, reactivity: target.reactivity };
        if (typeof object !== 'function') {
            object = object.bind(target.object);
            object.object = target.object;
            object.method = p;
            pTarget = Object.assign((...args) => react(target.reactivity, name, object, args), pTarget);
            pTarget.object = object;
        }
        return new Proxy(pTarget, trap);
    },
    set(target, p, value) {
        const oldValue = target.object[p];
        target.object[p] = value;
        // react here:
        return true;
    }
};
const react = (reactivity, name, fn, args) => {
    const result = fn(...args);
    // react here:
    return result;
};
export const calcs = {
    add(...args) {
    },
    sub(...args) {
    },
    // ...
    render(template, context) {
    }
};
export const reactions = {
    setAttr(context) {
    },
    setProp(context) {
    },
};
/**
 * 1. Attributes are placed on the target(s) of the DOM operation
 * 2. Attributes specify:
 * a. the type of operation
 * b. the args of the DOM operation (/ is current node) (with offset numbers, variables or selectors).
 *    args can be explicitly denoted as array so that the operation is repeated for each
 * c. attributes can also specify priority used for ordering the reactivity. higher priority
 * reactions are run first.
 * d. attributes can specify whether their operations can be triggered again during the same
 * reactivity round. By default, they only run once.
 * e. attributes can also defer to other targets, with offset numbers, variables ($) or selectors.
 * f. the same type of operation can be repeated multiple times on the same element.
 *    use semi-colon to separate them.
 *
 *
 * Based on these, a suitable scheme for attributes may look like this:
 * 1. calcprefix-calcname-tempvarname-[priority]="arg1, arg2; arg1, arg2, arg3; ..."
 * 2. attrprefix-a-attrName="val"
 * 3. propprefix-p-propName="val"
 * 4. reactionprefix-operation-[priority]="arg1 $.tempvar $.statevar;  [arg1] _deferredtargetSelector arg3; $new $ _selector; ..."
 *
 *
 * 1. Note that temps are always searched before state!
 * 2. Temps are scoped to the elements on which they are created (and their descendants).
 * 3. Temps are therefore like local vars while state is like the global scope.
 * 4. Where more than 1 val is provided for an attr or prop, the join calc is assumed implicitly.
 * 5. Use _ for entering space; ($_ for the literal _)
 * 6. [token] means we should interpret token as array (token must be an array). Arrays not
 * wrapped like this are interpreted as single tokens.
 *
 *
 *
 *
 */ 
