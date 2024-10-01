import { IDeepKey, IKey } from "../../../types.js";
export declare const deepKey: any;
export declare const dk: any;
export declare function destructure(object: any, key: IDeepKey): {
    parent: any;
    member: any[] | IKey;
};
export declare function destructureAsync(object: any, key: IDeepKey): Promise<{
    parent: any;
    member: any[] | IKey;
}>;
export declare function get(object: any, key: IDeepKey): any;
export declare function getAsync(object: any, key: IDeepKey): Promise<any>;
export declare function set(object: any, key: IDeepKey, value: any): any;
export declare function setAsync(object: any, key: IDeepKey, value: any): Promise<any>;
export declare function call(object: any, key: IDeepKey, ...args: any[]): any;
export declare function callAsync(object: any, key: IDeepKey, ...args: any[]): Promise<any>;
export declare function del(object: any, key: IDeepKey): void;
export declare function delAsync(object: any, key: IDeepKey): Promise<void>;
