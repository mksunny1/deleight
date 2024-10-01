import { IDeepKey, IKey } from "../../../types.js";
import { realKey } from "../own/own.js";

export const deepKey = new Proxy((...args: any[]) => {
    const dk: any = Object.assign(() => {}, { key: [args] });
    return dk.proxy = new Proxy(dk, deepKeyHandler);
}, {
    get(target: any, p: IKey) {
        p = realKey(p);
        const dk: any = Object.assign(() => {}, { key: [p] });
        return dk.proxy = new Proxy(dk, deepKeyHandler);
    }
});

export const dk = deepKey;

const deepKeyHandler = {
    get(target: { key: (IKey | any[])[], proxy: any }, p: IKey) {
        p = realKey(p);
        target.key.push(p);
        return target.proxy;
    },
    apply(target: { key: (IKey | any[])[], proxy: any }, thisArg: any, args: any[]) {
        if (args.length) {
            target.key.push(args);
            return target.proxy;
        } else {
            return target.key;
        }
    }
}

export function destructure(object: any, key: IDeepKey) {
    const keys = (key instanceof Array)? key: [key];
    if (!keys.length) throw new Error(`No keys to destructure`);

    let parent = object, member: IKey | any[];
    let prevParent = parent;
    for (let i = 0; i < keys.length - 1; i++) {
        member = keys[i];
        
        if (member instanceof Array) parent = parent(...member);
        else parent = parent[member];
        if (parent instanceof Function && prevParent) parent = parent.bind(prevParent);
        
        prevParent = parent;
    }
    member = keys[keys.length - 1];
    return {parent, member};
}

export async function destructureAsync(object: any, key: IDeepKey) {
    const keys = (key instanceof Array)? key: [key];
    if (!keys.length) throw new Error(`No keys to destructure`);

    let parent = object, member: IKey | any[];
    let prevParent = parent;
    for (let i = 0; i < keys.length - 1; i++) {
        member = keys[i];
        
        if (member instanceof Array) parent = parent(...member);
        else parent = parent[member];

        if (parent instanceof Promise) parent = await parent;
        if (parent instanceof Function && prevParent) parent = parent.bind(prevParent);
        
        prevParent = parent;
    }
    member = keys[keys.length - 1];
    return {parent, member};
}

export function get(object: any, key: IDeepKey) {
    const {parent, member} = destructure(object, key);
    if (member instanceof Array) return parent(...member);
    else return parent[member];
}

export async function getAsync(object: any, key: IDeepKey) {
    const {parent, member} = await destructureAsync(object, key);
    if (member instanceof Array) return parent(...member);
    else return parent[member];
}

export function set(object: any, key: IDeepKey, value: any) {
    const {parent, member} = destructure(object, key);
    return finishSet(parent, member, value);
}

export async function setAsync(object: any, key: IDeepKey, value: any) {
    const {parent, member} = await destructureAsync(object, key);
    return finishSet(parent, member, value);
}

function finishSet(parent: any, member: any[] | IKey, value: any) {
    if (member instanceof Array) {
        for (let item of member) set(parent, item, value);
    } else parent[member] = value;
    return value;
}

export function call(object: any, key: IDeepKey, ...args: any[]) {
    const {parent, member} = destructure(object, key);
    if (member instanceof Array) return parent(member)(...args);
    else return parent[member](...args);
}

export async function callAsync(object: any, key: IDeepKey, ...args: any[]) {
    const {parent, member} = await destructureAsync(object, key);
    if (member instanceof Array) return parent(member)(...args);
    else return parent[member](...args);
}

export function del(object: any, key: IDeepKey) {
    const {parent, member} = destructure(object, key);
    finishDel(parent, member);
}

export async function delAsync(object: any, key: IDeepKey) {
    const {parent, member} = await destructureAsync(object, key);
    finishDel(parent, member);
}

function finishDel(parent: any, member: any[] | IKey) {
    if (member instanceof Array) {
        const result: any[] = [];
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
