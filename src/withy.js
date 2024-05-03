/**
 * 'with' statement on steroids! This module exports a With function
 * which makes code succint without any of the limitations that led to
 * 'with' getting dropped from the JavaScript standard. In fact it
 * leads to much more concision than the original 'with' and does not
 * degrade performance, readability or code comprehension. It is based on Proxy.
 *
 * @example
 * With(document.createElement('button'))[SET]({className: 'main', textContent: 'Wow'}).addEventListener('click', () => console.log('Wow!!'))(btn => document.body.append(btn))()
 *
 */
/**
 * Used to obtain a context (Recursive object) around a property of
 * the currently wrapped object. This is to continue the chain inwards
 * to increase the concision even further.
 *
 * @example
 *
 */
export const WITH = Symbol();
/**
 * Used to set existing properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj).set({knownA:1, knownB:2}).method1().method2('...')()  // final call unwraps the object.
 */
export const SET = Symbol();
/**
 * Used to set any properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj).set({a:1, b:2}).method1().method2('...')()  // final call unwraps the object.
 */
export const ASSIGN = Symbol();
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
  const target = Object.assign(
    (...args) => {
      if (!args.length) return obj;
      for (let arg of args) if (arg instanceof Function) arg(obj);
      return proxy;
    },
    { obj },
  );
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
    } else if (p === SET) {
      return (arg) => {
        for (let [k, v] of Object.entries(arg)) target.obj[k] = v;
      };
    } else if (p === WITH) {
      return (arg) => {
        for (let [k, v] of Object.entries(arg)) v(target.obj[k]);
      };
    } else {
      return (...args) => {
        target.obj[p](...args);
        return target.proxy;
      };
    }
  },
};
// const el1 = With(document.createElement('div')).append('').append()[SET]({className: 'cls1', textContent: 'Wow!'}).append('abc').append()();
// const el2 = With(document.createElement('div')).append().append()[WITH]({style: st => st[SET]({})});
