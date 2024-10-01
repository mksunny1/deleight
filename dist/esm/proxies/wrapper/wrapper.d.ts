/**
 * A base implementation of a wrapper around another object.
 * Simply extend this class to implement custom behavior for
 * specific types in your applications. For example to implement
 * conditional property and/or method access, value transformations
 * before and/or after object actions or performing arbitrary
 * operations before and/or after object member access.
 *
 * @example
 *
 *
 */
import { IKey } from "../../types.js";
export interface IObject<T = any> {
    value: T;
    get(p: IKey): any;
    set(p: IKey, value: any): any;
    call(...args: any[]): any;
    delete(p: IKey): any;
}
export declare const Target: unique symbol;
/**
 * Extend this class to create custom handlers if necessary.
 *
 * @example
 */
export declare class Handler<T = any> {
    get(target: {
        [Target]: IObject<T>;
    }, p: IKey): any;
    set(target: {
        [Target]: IObject<T>;
    }, p: IKey, value: any): boolean;
    deleteProperty(target: {
        [Target]: IObject<T>;
    }, p: IKey): boolean;
}
/**
 * Use this to create a standard Proxy object, often with a subclass ow Wrapper.
 *
 */
export declare const handler: Handler<any>;
/**
 * Extend this class to quickly implement wrapper functions like aliasing and so on.
 */
export declare class Wrapper<T extends object | Function> {
    #private;
    static handler: Handler;
    value: T;
    constructor(value: T, ...args: any[]);
    recursiveArgs(result: any, key?: IKey): any;
    bindFunctions(key?: IKey): boolean;
    get(key: IKey): any;
    set(key: IKey, value: any): void;
    call(...args: any[]): any;
    delete(key: IKey): void;
    get proxy(): T;
}
