import { realKey } from "../own/own.js";
/**
 * A proxy for creating deep keys using member access syntax
 *
 * @example
 *
 */
export const deepKey = new Proxy((...args) => {
    const dk = Object.assign(() => { }, { key: [args] });
    return dk.proxy = new Proxy(dk, deepKeyHandler);
}, {
    get(target, p) {
        p = realKey(p);
        const dk = Object.assign(() => { }, { key: [p] });
        return dk.proxy = new Proxy(dk, deepKeyHandler);
    }
});
/**
 * Alias for {@link deepKey}
 */
export const dk = deepKey;
const deepKeyHandler = {
    get(target, p) {
        p = realKey(p);
        target.key.push(p);
        return target.proxy;
    },
    apply(target, thisArg, args) {
        if (args.length) {
            target.key.push(args);
            return target.proxy;
        }
        else {
            return target.key;
        }
    }
};
/**
 * Given an object and a key or deepkey, returns the object that directly
 * holds the member being referred to (.parent) and the member key in
 * it (.member).
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @returns
 */
export function destructure(object, key) {
    const keys = (key instanceof Array) ? key : [key];
    if (!keys.length)
        throw new Error(`No keys to destructure`);
    let parent = object, member;
    let prevParent = parent;
    for (let i = 0; i < keys.length - 1; i++) {
        member = keys[i];
        if (member instanceof Array)
            parent = parent(...member);
        else
            parent = parent[member];
        if (parent instanceof Function && prevParent)
            parent = parent.bind(prevParent);
        prevParent = parent;
    }
    member = keys[keys.length - 1];
    return { parent, member };
}
/**
 * Async equivalent of {@link destructure}. This will resolve
 * any promises in the member path, so it returns a Promise that resolves
 * to the same type of object as the one returned by {@link destructure}.
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @returns
 */
export async function destructureAsync(object, key) {
    const keys = (key instanceof Array) ? key : [key];
    if (!keys.length)
        throw new Error(`No keys to destructure`);
    let parent = object, member;
    let prevParent = parent;
    for (let i = 0; i < keys.length - 1; i++) {
        member = keys[i];
        if (member instanceof Array)
            parent = parent(...member);
        else
            parent = parent[member];
        if (parent instanceof Promise)
            parent = await parent;
        if (parent instanceof Function && prevParent)
            parent = parent.bind(prevParent);
        prevParent = parent;
    }
    member = keys[keys.length - 1];
    return { parent, member };
}
/**
 * Gets the member referred to by the object and key/deepkey
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @returns
 */
export function get(object, key) {
    const { parent, member } = destructure(object, key);
    if (member instanceof Array)
        return parent(...member);
    else
        return parent[member];
}
/**
 * Async equivalent of {@link get}
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @returns
 */
export async function getAsync(object, key) {
    const { parent, member } = await destructureAsync(object, key);
    if (member instanceof Array)
        return parent(...member);
    else
        return parent[member];
}
/**
 * Sets the member referred to by the object and key/deepkey
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @param value
 * @returns
 */
export function set(object, key, value) {
    const { parent, member } = destructure(object, key);
    return finishSet(parent, member, value);
}
/**
 * Async equivalent of {@link set}
 *
 * @example
 *
 * @param object
 * @param key
 * @param value
 * @returns
 */
export async function setAsync(object, key, value) {
    const { parent, member } = await destructureAsync(object, key);
    return finishSet(parent, member, value);
}
function finishSet(parent, member, value) {
    if (member instanceof Array) {
        for (let item of member)
            set(parent, item, value);
    }
    else
        parent[member] = value;
    return value;
}
/**
 * Calls the method referred to by the object and key/deepkey
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @param args
 * @returns
 */
export function call(object, key, ...args) {
    const { parent, member } = destructure(object, key);
    if (member instanceof Array)
        return parent(member)(...args);
    else
        return parent[member](...args);
}
/**
 * Async equivalent of {@link call}
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @param args
 * @returns
 */
export async function callAsync(object, key, ...args) {
    const { parent, member } = await destructureAsync(object, key);
    if (member instanceof Array)
        return parent(member)(...args);
    else
        return parent[member](...args);
}
/**
 * Deletes the member referred to by the object and key/deepkey
 *
 * @example
 *
 *
 * @param object
 * @param key
 * @returns
 */
export function del(object, key) {
    const { parent, member } = destructure(object, key);
    finishDel(parent, member);
}
/**
 * Async equivalent of {@link del}
 *
 * @example
 *
 *
 * @param object
 * @param key
 */
export async function delAsync(object, key) {
    const { parent, member } = await destructureAsync(object, key);
    finishDel(parent, member);
}
function finishDel(parent, member) {
    if (member instanceof Array) {
        const result = [];
        for (let item of member) {
            result.push(del(parent, item));
        }
        return result;
    }
    else {
        const result = parent[member];
        delete parent[member];
        return result;
    }
}
