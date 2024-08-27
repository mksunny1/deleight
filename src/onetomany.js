/**
 * This module enables reactivity by exporting primitives for multiplying the effects of single operations.
 *
 * @module
 */
export const map = Symbol(), args = Symbol();
export class View {
    one;
    map;
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
    constructor(one, map) { this.one = one; this.map = map; }
    #oneWhat(what) {
        const oneWhat = {};
        if (what.hasOwnProperty(map)) {
            let prop;
            for (let [key, val] of Object.entries(what[map])) {
                prop = this.map[key];
                if (!oneWhat.hasOwnProperty(prop))
                    oneWhat[prop] = { [map]: {} };
                oneWhat[prop][map][key] = val;
            }
        }
        else {
            for (let [key, prop] of Object.entries(this.map))
                oneWhat[prop] = { [map]: { [key]: what } };
        }
        return oneWhat;
    }
    get() { return this.one.get(this.map); }
    set(what) { return this.one.set(this.#oneWhat(what)); }
    delete() { return this.one.delete(this.map); }
    call(what) { return this.one.call(this.#oneWhat(what)); }
}
export class One {
    many;
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
    constructor(many) { this.many = many; }
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
    extend(many) {
        let currentVal;
        for (let [key, value] of Object.entries(many)) {
            if (this.many.hasOwnProperty(key)) {
                currentVal = this.many[key];
                if (currentVal instanceof One) {
                    currentVal.extend(value);
                }
                else
                    this.many[key] = value;
            }
            else
                this.many[key] = value;
        }
        return this;
    }
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
    contract(...keys) {
        for (let k of keys)
            delete this.many[k];
        return this;
    }
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
    slice(...names) {
        const many = {};
        for (let name of names)
            many[name] = this.many[name] || {};
        return new One(many);
    }
    ;
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
    view(map) { return new View(this, map); }
    ;
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
    get(what, valueKey) {
        const result = {};
        let val, key, item, obj, subVal;
        if (typeof what === 'string') {
            for ([key, obj] of Object.entries(this.many)) {
                if (obj instanceof One)
                    result[key] = obj.get(what, valueKey);
                else {
                    val = obj[what];
                    if (valueKey && val instanceof One)
                        val = val.many[valueKey];
                    result[key] = val;
                }
            }
        }
        else if (what instanceof Array) {
            for ([key, obj] of Object.entries(this.many)) {
                if (obj instanceof One)
                    result[key] = obj.get(what, valueKey);
                else {
                    result[key] = val = {};
                    for (item of what) {
                        subVal = obj[item];
                        if (valueKey && subVal instanceof One)
                            subVal = subVal.many[valueKey];
                        val[item] = subVal;
                    }
                }
            }
        }
        else if (typeof what === 'object') {
            for (let [key, props] of Object.entries(what)) {
                obj = this.many[key];
                if (obj instanceof One)
                    result[key] = obj.get(props, valueKey);
                else {
                    if (props instanceof Array) {
                        result[key] = val = {};
                        for (item of props) {
                            subVal = obj[item];
                            if (valueKey && subVal instanceof One)
                                subVal = subVal.many[valueKey];
                            val[item] = subVal;
                        }
                    }
                    else {
                        val = obj[props];
                        if (valueKey && val instanceof One)
                            val = val.many[valueKey];
                        result[key] = val;
                    }
                }
            }
        }
        return result;
    }
    ;
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
    set(what, valueKey) {
        let key, obj, subValue, propVal;
        for (let [prop, value] of Object.entries(what)) {
            if (value.hasOwnProperty(map)) {
                for ([key, subValue] of Object.entries(value[map])) {
                    obj = this.many[key];
                    if (obj instanceof One)
                        obj.set({ prop: subValue }, valueKey);
                    else {
                        if (valueKey) {
                            propVal = obj[prop];
                            if (propVal instanceof One && propVal.many.hasOwnProperty(valueKey)) {
                                propVal.many[valueKey] = subValue;
                            }
                        }
                        else
                            obj[prop] = subValue;
                    }
                }
            }
            else {
                for ([key, obj] of Object.entries(this.many)) {
                    if (obj instanceof One)
                        obj.set({ prop: value }, valueKey);
                    else {
                        if (valueKey) {
                            propVal = obj[prop];
                            if (propVal instanceof One && propVal.many.hasOwnProperty(valueKey)) {
                                propVal.many[valueKey] = value;
                            }
                        }
                        else
                            obj[prop] = value;
                    }
                }
            }
        }
        return this;
    }
    ;
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
    delete(what) {
        let key, item, obj;
        if (typeof what === 'string') {
            for ([key, obj] of Object.entries(this.many)) {
                if (obj instanceof One)
                    obj.delete(what);
                else
                    delete obj[what];
            }
        }
        else if (what instanceof Array) {
            for ([key, obj] of Object.entries(this.many)) {
                if (obj instanceof One)
                    obj.delete(what);
                else
                    for (item of what)
                        delete obj[item];
            }
        }
        else if (typeof what === 'object') {
            for (let [key, props] of Object.entries(what)) {
                obj = this.many[key];
                if (obj instanceof One)
                    obj.delete(props);
                else {
                    if (props instanceof Array)
                        for (item of props)
                            delete obj[item];
                    else
                        delete obj[props];
                }
            }
        }
        return this;
    }
    ;
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
    call(what) {
        let key, obj, subValue;
        const result = {};
        let propResult;
        if (typeof what === 'string')
            what = [what];
        if (what instanceof Array) {
            for (let prop of what) {
                for ([key, obj] of Object.entries(this.many)) {
                    result[key] = obj[prop]?.();
                }
            }
        }
        else {
            for (let [prop, value] of Object.entries(what)) {
                result[prop] = propResult = {};
                if (value.hasOwnProperty(map)) {
                    for ([key, subValue] of Object.entries(value[map])) {
                        obj = this.many[key];
                        if (obj instanceof One)
                            propResult[key] = obj.call({ prop: subValue });
                        else {
                            if (subValue.hasOwnProperty(args))
                                propResult[key] = obj[prop]?.(...subValue[args]);
                            else
                                propResult[key] = obj[prop]?.(subValue);
                        }
                    }
                }
                else {
                    for ([key, obj] of Object.entries(this.many)) {
                        if (obj instanceof One)
                            propResult[key] = obj.call({ prop: value });
                        else {
                            if (value.hasOwnProperty(args))
                                propResult[key] = obj[prop]?.(...value[args]);
                            else
                                propResult[key] = obj[prop]?.(value);
                        }
                    }
                }
            }
        }
        return result;
    }
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
export function one(many) { return wrap(new One(many)); }
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
export function wrap(one) {
    return new Proxy(one, oneTrap);
}
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
export function unwrap(wrapped) { return wrapped[self]; }
const self = Symbol();
const oneTrap = {
    get(target, p) {
        if (p === self)
            return target;
        return Object.assign((...methodArgs) => {
            let arg1;
            if (methodArgs.length === 1 && typeof (arg1 = methodArgs[0]) === 'object' &&
                arg1.hasOwnProperty(map)) {
                return target.call({ [p]: arg1 });
            }
            else
                return target.call({ [p]: { [args]: methodArgs } });
        }, {
            get value() { return target.get(p); }
        });
    },
    set(target, p, value) {
        target.set({ [p]: value });
        return true;
    },
    deleteProperty(target, p) {
        target.delete(p);
        return true;
    }
};
