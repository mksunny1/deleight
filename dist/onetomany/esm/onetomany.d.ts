/**
 * This module enables reactivity by exporting primitives for multiplying the effects of single operations.
 *
 * @module
 */
type IExtend<T, U> = Omit<T, keyof U> & {
    [key in (keyof T) & (keyof U)]: T[key] extends One<T> ? IExtend<T[key], U[key]> : U[key];
} & Omit<U, keyof T>;
type IKey = string | number | symbol;
type IObject = {
    [key: IKey]: any;
};
type IKeyObject<T> = {
    [key in keyof T]: IKey | IKey[];
};
type IViewMap<T> = {
    [key in keyof T]: IKey;
};
type ILike<T> = {
    [key in keyof T]: any;
};
declare const map: unique symbol;
declare const args: unique symbol;
declare class View<T> {
    #private;
    one: One<T>;
    map: IViewMap<T>;
    /**
     * Represents a single view of a `One` instance. A view can be described as an
     * object comprising one property each from the different objects that are part of
     * the `One` object. We can perform actions on a view without explicitly specifying
     * the properties.
     *
     * @example
     * import { One, View, args } from "deleight/onetomany";
     * const one = new One({ a1: [], a2: [1, 2, 3, 4, 5] });
     *
     * const view = new View(one, { a1: 'push', a2: 'shift' })
     * // push one array and simultaneously shift the other
     * // to transfer content...
     *
     * view.call({ [args]: one.many.a2 })
     *
     * @param one
     * @param map
     *
     * @constructor
     */
    constructor(one: One<T>, map: IViewMap<T>);
    get(): {};
    set(what: any): One<T>;
    delete(): One<T>;
    call(what: any): {};
}
declare class One<T extends IObject> {
    many: T;
    /**
     * Creates a single object that propagates actions on it to multiple objects.
     *
     * @example
     * import { One } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     *
     * // set the same value on all objects
     * o1.set({ p1: 78 });
     *
     * @param many
     */
    constructor(many: T);
    /**
     * Joins `many` with `this.many` and returns `this`. The benefit of
     * using this function instead of something like `Object.assign`  is to handle some
     * special cases and ensure that the updated `One` is (almost) correctly typed during
     * development.
     *
     * If the same key exists in the joined objects, the new one will overwrite the
     * current one, except if the current value is a `One` instance when `extend` will
     * be called on it instead.
     *
     * @example
     * import { One } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * const o2 = o1.extend({ fourth });
     * // One({ first, second, third, fourth })
     *
     * @param many
     */
    extend<U extends object>(many: U): One<IExtend<T, U>>;
    /**
     * The opposite of extend. Removes the specified keys from `this.many` and
     * returns `this` typed differently.
     *
     * @example
     * import { One } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * const o2 = o1.contract('first', 'third');
     * // One({ second })
     *
     * @param keys
     * @returns
     */
    contract<U extends keyof T>(...keys: U[]): One<Omit<T, U>>;
    /**
     * Creates and returns another instance of `One` containing only the
     * objects with these names. If a name is not present in `this.many`,
     * a new object is created for it in the returned `One`.
     *
     * @example
     * import { One } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * const o2 = o1.slice('first', 'second')
     * // One({ first, second })
     *
     * @param names
     */
    slice(...names: (keyof T)[]): One<IObject>;
    /**
     * Creates and returns an instance of `View` for only the
     * specified properties. `what` is an object mapping object keys (in `this.many`)
     * to the property names.
     *
     * @example
     * import { One, map } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * o1.set({ p1: 78 });
     * const complex = { first: 56, second: 12, third: 12 };
     * o1.set({ p2: { [map]: complex } });
     * o1.view({first: 'p1', second: 'p2'});
     * view.get();     // { first: 78, second: 12 }
     *
     * @param map
     */
    view(map: IViewMap<T>): View<T>;
    /**
     * Gets the property (or properties) with the specified name(s) from all the
     * objects in `this.many`.
     *
     * 1. if `what` is a string, returns only the property specified (as an object mapping
     * object key to property value).
     * 2. if `what` is an array of strings, returns 'sub-objects' of all the objects
     * consisting of the specified property names (also mapped like 1).
     * 3. if what is an object, it is treated as a map of object names to property
     * name(s) to return.
     * 4. if an object in `this.many` is a `One` instance, its `get` method is
     * called for its property value(s).
     *
     * @example
     * import { One, map } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * o1.set({ p1: 78 });
     * const complex = { first: 56, second: 12, third: 12 };
     * o1.set({ p2: { [map]: complex } });
     *
     * o1.get('p1');
     * // { first: 78, second: 78, third: 78 }
     *
     * o1.get('p1', 'p2');
     * // { first: { p1: 78, p2: 56 }, second: { p1: 78, p2: 12 }, third: { p1: 78, p2: 12 } }
     *
     * o1.get({ first: 'p2', second: 'p1' });
     * // { first: 56, second: 78 }
     *
     * @param what
     */
    get(what: (IKey) | IKey[] | IKeyObject<T>, valueKey?: IKey): {};
    /**
     * Sets one or more properties on all the objects in this instance.
     * `what` is an object mapping property names to property values.
     *
     * Each value in `what` is set on all the objects in this `One`.
     * The same value will be set unless the value is an object containing the `[map]` property.
     * In such a case, the value of the property is treated as a map of object key (in `this.many`)
     * to object property value. That is, the objects with corresponding
     * keys will have their property values set to the corresponding values.
     *
     * This will call `set` on any nested `One` objects accordingly.
     *
     * @example
     * import { One, map } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * o1.set({ p1: 78 });
     * const complex = { first: 56, second: 12, third: 12 };
     * o1.set({ p2: { [map]: complex }, p3: complex });
     *
     * o1.get('p2', 'p3');
     * // { first: { p2: 56, p3: complex }, second: { p2: 12, p3: complex }, third: { p2: 12, p3: complex } }
     *
     * @param what
     */
    set(what: IObject, valueKey?: IKey): this;
    /**
     * Performs `delete` on the objects in this `One`. The argument is
     * treated the same way as in `get`.
     *
     * @example
     * import { One, map } from "deleight/onetomany";
     * const first = {}, second = {}, third = {}, fourth = {};
     * const many = { first, second, third };
     * const o1 = new One(many);
     * o1.set({ p1: 78 });
     * const complex = { first: 56, second: 12, third: 12 };
     * o1.set({ p2: { [map]: complex }, p3: complex });
     *
     * o1.delete('p1', 'p2');
     * // One({ first: { p3: complex }, second: { p3: complex }, third: { p3: complex } })
     *
     * @param what
     */
    delete(what: (IKey) | IKey[] | IKeyObject<T>): this;
    /**
     * Calls corresponding methods in a similar way to set. In this
     * case, call arguments are interpreted instead of property values.
     *
     * Multiple arguments should be provided as an object with the `[arg]` property whose value
     * should be an array containing the arguments. A regular array is considered a single argument.
     *
     * Nested one objects will have their call method invoked correspondingly.
     *
     * @example
     * import { One, map, args } from "deleight/onetomany";
     * const arr1 = [], arr2 = [], arr3 = [];
     * const o4 = new One({ arr1, arr2, arr3 });
     * o4.call({ push: 78 });
     * o4.call({ push: { [args]: [56, 57] } });
     * // arr1 = arr2 = arr3 = [78, 56, 57]
     *
     * @param what
     */
    call(what: string | string[] | IObject): {};
}
/**
 * A simple wrapper around `One` for a more concise syntax.
 *
 * @example
 * import { one, map, args } from "deleight/onetomany";
 * const arr1 = [], arr2 = [], arr3 = [];
 * const o4 = one({ arr1, arr2, arr3 });
 * o4.push(78, 56, 57);
 * o4.push({ [map]: { arr1: 66, arr2: { [args]: [77, 88] }, arr3: 99 } });
 * // arr1 === [78, 56, 57, 66]
 * // arr2 === [78, 56, 57, 77, 88]
 * // arr3 === [78, 56, 57, 99]
 *
 * @param many
 * @returns
 */
declare function one<T extends object>(many: T): T[keyof T];
/**
 * Wraps a pre-existing `One`
 *
 * @example
 * import { One, wrap } from "deleight/onetomany";
 * const arr1 = [], arr2 = [], arr3 = [];
 * const o4 = new One({ arr1, arr2, arr3 });
 * const wo4 = wrap(o4);
 *
 * @param one
 * @returns
 */
declare function wrap<T>(one: One<T>): T[keyof T];
/**
 * The opposite of `wrap`
 *
 * @example
 * import { one, unwrap } from "deleight/onetomany";
 * const arr1 = [], arr2 = [], arr3 = [];
 * const wo4 = one({ arr1, arr2, arr3 });
 * const o4 = unwrap(wo4);
 *
 * @param wrapped
 * @returns
 */
declare function unwrap<T>(wrapped: any): One<T>;

export { type IExtend, type IKey, type IKeyObject, type ILike, type IObject, type IViewMap, One, View, args, map, one, unwrap, wrap };
