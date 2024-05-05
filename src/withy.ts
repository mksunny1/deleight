/**
 * This module exports With function for creating more concise and structured code.
 */

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

//  extends object

export interface AnyFunction {
    (...args: any): any;
}

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
 * Creates recursive references around properties of a given object.
 */
export type RecursiveProp<T> = {
    [key in keyof T]?: (arg: Recursive<T[key]>) => any;
};

/**
 * Sets existing properties on object.
 */
export type RecursiveSetProp<T> = {
    [key in keyof T]?: any;
};

/**
 * An object whose methods returns itself
 */
export type Recursive<T> = {
    [key in keyof T]: T[key] extends AnyFunction
    ? (...args: Parameters<T[key]>) => Recursive<T>
    : T[key];
    // to call methods and return itself (or simply return the prop is it is not a method)
} & {
    [WITH]: (arg: RecursiveProp<T>) => Recursive<T>;
    // to wrap properties automatically

    [SET]: (arg: RecursiveSetProp<T>) => Recursive<T>;
    // to set preexisting properties

    [ASSIGN]: (...objs: any[]) => Recursive<T>;
    // to assign any properties

    (arg: any, ...args: any): Recursive<T>;
    // to perform unrelated operations (or functions which will be called with the wrapped object) inside the chain

    (): T;
    // to return the wrapped object.
};

/**
 * Behaves like the 'with' construct in many langusges. All method calls
 * with return the same object and we can also access the special [assign]
 * method to set properties without breaking the chain. Used for more
 * concise syntax in some scenarios.
 *
 * @example
 * const el = With(document.createElement('div')).append().append()[ASSIGN]().append()().append();
 *
 * @param obj
 * @returns
 */
export function With<T>(obj: T): Recursive<T> {
    const target: any = Object.assign(
        (...args: any) => {
            if (!args.length) return obj;
            for (let arg of args) if (arg instanceof Function) arg(proxy);
            return proxy;
        },
        { obj },
    );
    const proxy = new Proxy<Recursive<T>>(target as any, trap);
    target.proxy = proxy;
    return proxy;
}

const trap = {
    get(target: any, p: string | number | symbol) {
        if (p === ASSIGN) {
            return (...objs: any[]) => {
                Object.assign(target.obj, ...objs);
                return target.proxy;
            };
        } else if (p === SET) {
            return <T extends object>(arg: T) => {
                for (let [k, v] of Object.entries(arg)) {
                    if (target.obj.hasOwnProperty(k)) target.obj[k] = v;
                    else throw new Error(`You cannot assign a new property (${k}) with this method.`)
                }
                return target.proxy;
            };
        } else if (p === WITH) {
            return <T extends object>(arg: T) => {
                for (let [k, v] of Object.entries(arg)) v(With(target.obj[k]));
                return target.proxy;
            };
        } else {
            const res = target.obj[p];
            if (!(res instanceof Function)) return res;
            return (...args: any[]) => {
                target.obj[p](...args);
                return target.proxy;
            };
        }
    },
};

// const el1 = With(document.createElement('div')).append('').append()[SET]({className: 'cls1', textContent: 'Wow!'}).append('abc').append()();
// const el2 = With(document.createElement('div')).append().append()[WITH]({style: st => st[SET]({})});
