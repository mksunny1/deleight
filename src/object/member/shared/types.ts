import { IKey, IReturns } from "../../../types";

/**
 * An object mapping member keys to iterables of objects which can can be used as the `object` argument 
 * to {@link gets}, {@link sets}, {@link calls} or {@link dels}. 
 * 
 */
export type IMembers<T = any> = { [key: IKey]: Iterable<T> | AsyncIterable<T> | {[key: IKey]: IMembers} | IReturns<Iterable<T> | AsyncIterable<T> | {[key: IKey]: IMembers}> };
