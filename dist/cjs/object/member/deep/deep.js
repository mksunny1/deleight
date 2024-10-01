"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delAsync = exports.del = exports.callAsync = exports.call = exports.setAsync = exports.set = exports.getAsync = exports.get = exports.destructureAsync = exports.destructure = exports.dk = exports.deepKey = void 0;
const own_js_1 = require("../own/own.js");
exports.deepKey = new Proxy((...args) => {
    const dk = Object.assign(() => { }, { key: [args] });
    return dk.proxy = new Proxy(dk, deepKeyHandler);
}, {
    get(target, p) {
        p = (0, own_js_1.realKey)(p);
        const dk = Object.assign(() => { }, { key: [p] });
        return dk.proxy = new Proxy(dk, deepKeyHandler);
    }
});
exports.dk = exports.deepKey;
const deepKeyHandler = {
    get(target, p) {
        p = (0, own_js_1.realKey)(p);
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
function destructure(object, key) {
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
exports.destructure = destructure;
async function destructureAsync(object, key) {
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
exports.destructureAsync = destructureAsync;
function get(object, key) {
    const { parent, member } = destructure(object, key);
    if (member instanceof Array)
        return parent(...member);
    else
        return parent[member];
}
exports.get = get;
async function getAsync(object, key) {
    const { parent, member } = await destructureAsync(object, key);
    if (member instanceof Array)
        return parent(...member);
    else
        return parent[member];
}
exports.getAsync = getAsync;
function set(object, key, value) {
    const { parent, member } = destructure(object, key);
    return finishSet(parent, member, value);
}
exports.set = set;
async function setAsync(object, key, value) {
    const { parent, member } = await destructureAsync(object, key);
    return finishSet(parent, member, value);
}
exports.setAsync = setAsync;
function finishSet(parent, member, value) {
    if (member instanceof Array) {
        for (let item of member)
            set(parent, item, value);
    }
    else
        parent[member] = value;
    return value;
}
function call(object, key, ...args) {
    const { parent, member } = destructure(object, key);
    if (member instanceof Array)
        return parent(member)(...args);
    else
        return parent[member](...args);
}
exports.call = call;
async function callAsync(object, key, ...args) {
    const { parent, member } = await destructureAsync(object, key);
    if (member instanceof Array)
        return parent(member)(...args);
    else
        return parent[member](...args);
}
exports.callAsync = callAsync;
function del(object, key) {
    const { parent, member } = destructure(object, key);
    finishDel(parent, member);
}
exports.del = del;
async function delAsync(object, key) {
    const { parent, member } = await destructureAsync(object, key);
    finishDel(parent, member);
}
exports.delAsync = delAsync;
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
