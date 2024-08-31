'use strict';

/**
 * This module exports {@link With} function for creating more concise and structured code.
 *
 * @module
 */
/**
 * Used to obtain a context (Recursive object) around a property of
 * the currently wrapped object. This is to continue the chain inwards
 * to increase the concision even further.
 *
 * @example
 *With(obj)[WITH]({o1: o1 => {assert.equal(o1.c, 1);}, o2: o2 => {assert.equal(o2.c, 2);}})
 */
const WITH = Symbol();
/**
 * Used to set existing properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj).set({knownA:1, knownB:2}).method1().method2('...')()  // final call unwraps the object.
 */
const SET = Symbol();
/**
 * Used to set any properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj)[SET]({prop3: 5, prop4: 6}).inc().prop2
 */
const ASSIGN = Symbol();
/**
 * Behaves like the 'with' construct in many langusges. All method calls
 * with return the same object and we can also access the special [assign]
 * method to set properties without breaking the chain. Used for more
 * concise syntax in some scenarios.
 *
 * @example
 * import { With, ASSIGN } from 'deleight/withly';
 * const el = With(document.createElement('div')).append().append()[ASSIGN]().append()().append();
 *
 * @param obj
 * @returns
 */
function With(obj) {
    const target = Object.assign((...args) => {
        if (!args.length)
            return obj;
        for (let arg of args)
            if (arg instanceof Function)
                arg(proxy);
        return proxy;
    }, { obj });
    const proxy = new Proxy(target, trap);
    target.proxy = proxy;
    return proxy;
}
const trap = {
    get(target, p) {
        if (p === ASSIGN) {
            return (...objs) => {
                Object.assign(target.obj, ...objs);
                return target.proxy;
            };
        }
        else if (p === SET) {
            return (arg) => {
                for (let [k, v] of Object.entries(arg)) {
                    if (target.obj.hasOwnProperty(k))
                        target.obj[k] = v;
                    else
                        throw new Error(`You cannot assign a new property (${k}) with this method.`);
                }
                return target.proxy;
            };
        }
        else if (p === WITH) {
            return (arg) => {
                for (let [k, v] of Object.entries(arg))
                    v(With(target.obj[k]));
                return target.proxy;
            };
        }
        else {
            const res = target.obj[p];
            if (!(res instanceof Function))
                return res;
            return (...args) => {
                target.obj[p](...args);
                return target.proxy;
            };
        }
    },
};
// const el1 = With(document.createElement('div')).append('').append()[SET]({className: 'cls1', textContent: 'Wow!'}).append('abc').append()();
// const el2 = With(document.createElement('div')).append().append()[WITH]({style: st => st[SET]({})});

exports.ASSIGN = ASSIGN;
exports.SET = SET;
exports.WITH = WITH;
exports.With = With;
