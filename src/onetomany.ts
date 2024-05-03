/**
 * Creates a One object which transmits a call, method dispatch, property
 * get or set applied to the 'one' object to the 'many' objects.
 *
 * The recursive arg is used to ensure that getting properties always
 * wraps the array results with `one` also.
 *
 * Items in the context arg will be passed to all delegated calls as the
 * final arguments. An empty array is created if not specified.
 *
 * Sometimes, you may want to pass an array of 1 or more objects to provide a shared
 * context for the items in many. Other times you may prefer no context because
 * it may affect the behavior of the calls, since the functions or methods may
 * be accepting optional arguments there. Passing your own arrays enable you to
 * set the behavior however you like (by emptying or populating the array).
 *
 * @example
 * const component = one([data(), view(table)], false, [{}]);
 * component.create([10000]);
 *
 * @param {any[]} many An array of objects to delegat actios to
 * @param {boolean} [recursive] Whether to return One instances in `get` calls
 * @param {any[]} [context] Shared context for the 'many' functions or object methods
 * @returns
 */
export function one(many: any[], recursive?: boolean, context?: any[]) {
  return new Proxy(new One(many, recursive, context, one), oneTrap);
}

const PURE = Symbol();

/**
 * Return a 'pure' One from a proxied One.
 *
 * @param one
 * @returns
 */
export function unWrap(one: One) {
  return one[PURE] || one;
}

const oneTrap = {
  get(target: One, p: typeof PURE) {
    if (p === PURE) return target;
    let result = target.get(p, true) as any[];
    if (result.length && typeof result[0] === "function") {
      return (...args: any[]) => target.call(args, p);
    } else if (target.recursive) {
      if (target.ctor)
        return target.ctor(result, true, target.context, target.ctor);
      else return new One(result, true, target.context);
    }
    return result;
  },
  set(target: One, p: any, value: any) {
    target.set(p, value);
    return true;
  },
};

/**
 * A recursive One constructor. Used internally for recursive 'One's.
 */
export interface OneConstructor {
  (
    many: any[],
    recursive?: boolean,
    context?: any[],
    ctor?: OneConstructor,
  ): One;
}

/**
 * An object which delegates actions on it to other objects
 *
 * @example
 *
 *
 */
export class One {
  /**
   * The many objects this One delegates to.
   */
  many: any[];

  /**
   * Whether this One will return other 'One's in calls to `get`.
   */
  recursive?: boolean;

  /**
   * The constructor function used for creating new 'One's in calls to `get`.
   */
  ctor?: OneConstructor;

  /**
   * The context shared by the many functions or methods of the objects in many.
   * They all receive its items as their last set of arguments.
   */
  context?: any[];

  /**
   * Creates a new One instance for propagating operations to all the items
   * in many.
   *
   * @param {any[]} many The many objects or functions this One will delegate to.
   * @param {boolean} [recursive] Whether to wrap the arrays returned by `get` with another One.
   * @param {any[]} context An optional shared context to be passed to all propagated method or function calls.
   * This is an array of objects passed as the final arguments in calls. Empty array by default.
   * @param {OneConstructor} [ctor] The constructor used to create the `get` Ones. This parameter is used internally;
   * no need to supply an argument.
   *
   * @example
   * const loginYes = new One([username => profileView(username)]);
   * loginYes.call([[username]]);
   *
   * @constructor
   */
  constructor(
    many: any[],
    recursive?: boolean,
    context?: any[],
    ctor?: OneConstructor,
  ) {
    this.many = many;
    (this.recursive = recursive), (this.ctor = ctor);
    this.context = context || [];
  }
  /**
   * Gets corresponding properties from all the objects in many. If this is
   * a recursive One and forceArray is falsy, the array result will be
   * used as the 'many' argument in a call to this.ctor and the created One
   * is returned instead of the array.
   *
   * @example
   * const o = new One([{a: 1}, {a: 2}])
   * o.get('a');  // [1, 2]
   *
   * @param {string | number | symbol | null} [prop]
   * @param {boolean} [forceArray]
   * @returns {any[]|One}
   */
  get(
    prop?: string | number | symbol | null,
    forceArray?: boolean,
  ): any[] | One {
    const results: unknown[] = [];
    const length = this.many.length;
    if (prop !== undefined && prop !== null) {
      for (let i = 0; i < length; i++) results.push(this.many[i][prop]);
    } else {
      for (let i = 0; i < length; i++) results.push(this.many[i]);
    }
    const args: [any[], boolean | undefined, any | undefined] = [
      results,
      this.recursive,
      this.context,
    ];
    return this.recursive && !forceArray
      ? this.ctor
        ? this.ctor(...args, this.ctor)
        : new One(...args)
      : results;
  }

  /**
   * Sets corresponding property values in the objects in many.
   * 'values' are treated similarly to 'args' in the call method.
   *
   * @example
   * const o = new One([{a: 1}, {a: 2}])
   * o.set('a', [4, 7]);
   *
   * @param {string | number | symbol | null} [prop]
   * @param {any[]} [values]
   */
  set(prop?: string | number | symbol | null, values?: any[]) {
    if (values === undefined)
      return this.set(prop, this.get(prop, true) as any[]);
    // simply reset existing values, probably to trigger proxy handlers or setters

    const length = this.many.length;
    const j = values.length;
    if (prop !== undefined && prop !== null) {
      for (let i = 0; i < length; i++)
        this.many[i][prop] = values[Math.min(i, j - 1)];
    } else {
      for (let i = 0; i < length; i++)
        this.many[i] = values[Math.min(i, j - 1)];
    }
  }
  /**
   * Delete the property from all objects in many.
   *
   * @example
   * const o = new One([{a: 1}, {a: 2}])
   * o.delete('a');
   *
   * @param {string | number | symbol} prop
   */
  delete(prop: string | number | symbol) {
    for (let many of this.many) delete many[prop];
  }
  /**
   * Calls all the items in many (if method is not specified) or their
   * corresponding methods (if  method is specified). All the calls will
   * receive any items in `this.context` as their final arguments to
   * enable communication.
   *
   * args can be specified as follows:
   * `[[a1, a2], [a1, a2], [a1, a2]]`
   *
   * If `this.many` has 3 items, they will receive their own args. If there
   * are more items in `this.many`, they will all get the last provided args array
   * (here the one passed to the third item).
   *
   * The `one` function wraps created 'One's with a proxy to allow methods
   * to be called directly on them. Assuming we want to pass the same args
   * as above to such a method, the call will look like:
   *
   * `object.method([a1, a2], [a1, a2], [a1, a2])`.
   *
   * There is no need to wrap with the outer array in such cases.
   *
   * Call returns an array containing the return values of the individual
   * calls to many items.
   *
   * @example
   * const loginYes = new One([username => profileView(username)]);
   * loginYes.call([[username]]);
   *
   * @param {any[]} args The function or method arguments
   * @param {string | number | symbol} [method] The name of a method to call.
   * A function call is assumed if not specified.
   * @param {boolean} [ignoreContext] Set this to a truthy value to prevent the
   * shared context from getting passed in this call.
   *
   * @returns {any[]}
   */
  call(
    args?: any[],
    method?: string | number | symbol,
    ignoreContext?: boolean,
  ): any[] {
    if (args === undefined) args = [[]];
    const results: unknown[] = [];
    const length = this.many.length;
    const j = args.length;
    let iArgs: any, result: any;

    if (method !== undefined) {
      for (let i = 0; i < length; i++) {
        iArgs = args[Math.min(i, j - 1)] || [];
        result = this.many[i][method](...iArgs, ...this.context);
        results.push(result);
      }
    } else {
      for (let i = 0; i < length; i++) {
        iArgs = args[Math.min(i, j - 1)] || [];
        result = this.many[i](...iArgs, ...this.context);
        results.push(result);
      }
    }
    return results;
  }
}

/**
 * Pass this as the first arg in a One call to prevent it from injecting
 * a context. This is an alternative to passing a third argument to the
 * `call` function
 */
export const ignoreContext = Symbol();
