/**
 * The type of an object key
 */
export type IKey = string | number | symbol;
export type IDeepKey = IKey | (IKey|any[])[];

export type IMap<T> = {
    [key: IKey]: T;
}

/**
 * Represents any function
 */
export interface ICallable<T extends any[] = any, U = any> {
    (...args: T): U
}

/**
 * The type of the function that returns a specific type of value (<T>).
 */
export interface IReturns<T> {
    (...args: any[]): T
}
