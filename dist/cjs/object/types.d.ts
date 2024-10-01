import { IKey } from "../types.js";
/**
 * Signature of most functions passed to the primitives in deleight/object
 */
export type IObjectCallable<T extends any = object, U extends any = any> = (object: T, key: IKey, ...args: any[]) => U;
