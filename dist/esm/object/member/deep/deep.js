import { realKey } from "../own/own.js";
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
export function get(object, key) {
    const { parent, member } = destructure(object, key);
    if (member instanceof Array)
        return parent(...member);
    else
        return parent[member];
}
export async function getAsync(object, key) {
    const { parent, member } = await destructureAsync(object, key);
    if (member instanceof Array)
        return parent(...member);
    else
        return parent[member];
}
export function set(object, key, value) {
    const { parent, member } = destructure(object, key);
    return finishSet(parent, member, value);
}
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
export function call(object, key, ...args) {
    const { parent, member } = destructure(object, key);
    if (member instanceof Array)
        return parent(member)(...args);
    else
        return parent[member](...args);
}
export async function callAsync(object, key, ...args) {
    const { parent, member } = await destructureAsync(object, key);
    if (member instanceof Array)
        return parent(member)(...args);
    else
        return parent[member](...args);
}
export function del(object, key) {
    const { parent, member } = destructure(object, key);
    finishDel(parent, member);
}
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
