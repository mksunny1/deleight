/**
 * This module exports useful primitives based on Proxy.
 */
/**
 * Used to obtain a context (Recursive object) around a property of
 * the current one, to continue the chain inwards to increase the
 * concision even further.
 */
export const I = Symbol();
/**
 * Behaves like the 'with' construct in many langusges. All method calls
 * with return the same object and we can also access the special [assign]
 * method to set properties without breaking the chain. Used for more
 * concise syntax in some scenarios.
 *
 * @example
 * const el = With(document.createElement('div')).append().append()[assign]().append()().append();
 *
 * @param obj
 * @returns
 */
export function With(obj) {
    const target = Object.assign(() => obj, { obj });
    const proxy = new Proxy(target, trap);
    target.proxy = proxy;
    return proxy;
}
const trap = {
    get(target, p) {
        if (p === assign) {
            return (...objs) => {
                Object.assign(target.obj, ...objs);
                return target.proxy;
            };
        }
        else if (p === I) {
            return new Proxy(target.obj, propTrap);
        }
        else {
            return (...args) => {
                target.obj[p](...args);
                return target.proxy;
            };
        }
    },
};
const propTrap = {
    get(target, p) {
        return With(target[p]);
    },
};
/**
 * Used to set properties when using `With`:
 * With({}).a
 */
export const assign = Symbol();
const el1 = With(document.createElement("div"))
    .append()
    .append()[assign]({ a: 1, b: 2 })
    .append("abc")
    .append()()
    .append();
const el2 = With(document.createElement("div"))
    .append()
    .append()[I].style[assign]({ left: "24px" })()
    .animationDelay()
    .charAt(3);
