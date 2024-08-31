/**
 * This module exports {@link With} function for creating more concise and structured code.
 *
 * @module
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
interface IAnyFunction {
    (...args: any): any;
}
/**
 * Used to obtain a context (Recursive object) around a property of
 * the currently wrapped object. This is to continue the chain inwards
 * to increase the concision even further.
 *
 * @example
 *With(obj)[WITH]({o1: o1 => {assert.equal(o1.c, 1);}, o2: o2 => {assert.equal(o2.c, 2);}})
 */
declare const WITH: unique symbol;
/**
 * Used to set existing properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj).set({knownA:1, knownB:2}).method1().method2('...')()  // final call unwraps the object.
 */
declare const SET: unique symbol;
/**
 * Used to set any properties on the wrapped object and return the same object.
 *
 * @example
 * With(obj)[SET]({prop3: 5, prop4: 6}).inc().prop2
 */
declare const ASSIGN: unique symbol;
/**
 * Creates recursive references around properties of a given object.
 * @example
 * With(obj)[ASSIGN]({prop1: 5, prop2: 6}).inc().prop2
 */
type IRecursiveProp<T> = {
    [key in keyof T]?: (arg: IRecursive<T[key]>) => any;
};
/**
 * Sets existing properties on object.
 */
type IRecursiveSetProp<T> = {
    [key in keyof T]?: any;
};
/**
 * An object whose methods returns itself
 */
type IRecursive<T> = {
    [key in keyof T]: T[key] extends IAnyFunction ? (...args: Parameters<T[key]>) => IRecursive<T> : T[key];
} & {
    [WITH]: (arg: IRecursiveProp<T>) => IRecursive<T>;
    [SET]: (arg: IRecursiveSetProp<T>) => IRecursive<T>;
    [ASSIGN]: (...objs: any[]) => IRecursive<T>;
    (arg: any, ...args: any): IRecursive<T>;
    (): T;
};
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
declare function With<T>(obj: T): IRecursive<T>;

export { ASSIGN, type IAnyFunction, type IRecursive, type IRecursiveProp, type IRecursiveSetProp, SET, WITH, With };
