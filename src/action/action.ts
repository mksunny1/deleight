/**
 * Exports the {@link Action} type along with many useful {@link Step} 
 * types which are used to create 'live' functions. 
 * 
 * Actions are very expressive, more controllable and mutable almost 
 * without any performance penalty. The flow is easy to track as it is 
 * declarative. You can create new step types which interpret your code 
 * at speed.
 * 
 * Actions can be used for:
 * 
 * 1. regular code - You can use Actions to implement common patterns 
 * like function chaining and passing the same arguments to multiple functions.
 * 
 * 2. declarative programming - You can build up code for the same action in 
 * multiple places, allowing you to be more declarative in how you write code. 
 * This is a powerful feature for reactivity.
 * 
 * 3. implementing other libraries that will generate code on the fly - You can 
 * create and modify actions easily without parsing and compiling from 
 * string (unlike Function constructor). This allows you to maintain a consistently 
 * good performance throughout your code.
 * 
 * 4. custom DSLs - You can write your own steps to interpret code however you 
 * like. for example your own markup language
 * 
 * 5. etc - You can probably do other cool things with Actions that we havent yet 
 * to mention or envisage.
 * 
 * Actions can be used in any JavaScript environment as it has no 
 * platform dependencies. It is of course performant and lightweight.
 * 
 * Currently this module has not been fully tested.
 * 
 * @module
 * 
 */

import { call, del, get, set } from "../object/member/deep/deep.js";
import { IDeepKey, IKey } from "../types.js";

export interface IEnvironment {
    values: Iterator<any>;
    scope?: any;
    args?: Iterable<any>;
}

export type IPriority = 0 | 1;
export type IInterpreter = (values: Iterable<any>, env: IEnvironment) => (Iterable<any> | undefined);

export function isGenerator(value: any) {
    return value && value[Symbol.iterator]?.() === value;
}

export function isAsyncGenerator(value: any) {
    return value && value[Symbol.asyncIterator]?.() === value;
}

export class Action<T = any, U extends any[] = any> {
    values: Iterable<any> | { IKey: any; };
    arrayScope?: boolean;
    constructor(values: Iterable<any> | { IKey: any; }, arrayScope?: boolean) {
        this.values = values;
        if (arrayScope) this.arrayScope = arrayScope;
    }
    getValues(scope: T, ...args: any[]) {
        return Reflect.has(this.values, Symbol.iterator) ? this.values[Symbol.iterator](): Object.values(this.values);
    }
    getScope(...args: any[]): T {
        return (this.arrayScope? []: {}) as T
    }
    start(scope: T, ...args: U) {
        const env: IEnvironment = { 
            values: this.getValues(scope, ...args),
            scope, args
        }
        // nb: First item must be a runner.
        return {index: 0, runner: env.values.next().value, env};
    }
    *genWith(scope: T, ...args: U) {
        const run = this.start(scope, ...args);
        if (run) {
            yield* (run.runner as Step).run(run.env)
        }
    }
    *gen(...args: U) {
        return this.genWith(this.getScope(...args), ...args);
    }
    callWith(scope: T, ...args: U) {
        for (let value of this.genWith(scope, ...args)) {
            return value;
        }
    }
    call(...args: U) {
        return this.callWith(this.getScope(...args), ...args);
    }
}

export function action(code: Iterable<any>) {
    return new Action(code);
}

export class Closer {
    runner: Step;
    constructor(runner: Step) {
        this.runner = runner;
    }
}

/**
 * Used directly to end the last step or called with a step to 
 * end that step.
 * 
 * @example
 * 
 */
export function $(runner: Step) {
    return new Closer(runner);
}

/**
 * Interpretes values and returns replacement values. 
 * 
 * An action is simply an array of different values. Steps are some 
 * of these values that provide interpretations for the values following 
 * them (up until the next termination step or the end of the action).
 * 
 * A simple policy is adopted to resolve situations when a step encounters 
 * another while collecting the values it runs with:
 * 
 * 1. If the next step has a `priority` of `0`, the current step, along with any others it is nested 
 * within, finish immediately. 
 * 
 * 2. If instead the next step has a priority of `1`, it will be started and any values 
 * it `yield`s will be collected by the preceding step as part of the values it 
 * uses to run.
 * 
 * To force a step to stop collecting values, esplicitly terminate with the `$` 
 * function value. If the step we want to stop has nested steps which are still 
 * collecting values, simply call the `$` function with the step.
 * 
 * @example
 * 
 *    
 */
export class Step {
    priority: IPriority;
    endBy?: Step | Closer;

    constructor(priority: IPriority = 0) {
        this.priority = priority;
    }
    /**
     * Collect all the values used in the step and pass to 
     * {@link Step#runWith}. Then replace the collected values 
     * with those returned by {@link Step#runWith}.
     * 
     * This method concludes by starting the next step, if there is 
     * one. Not starting the next step can cause the action to end 
     * prematurely. This should be noted if overriding this method in 
     * a subclass. It is best to override {@link Step#runWith} if you 
     * just want to implement the step's own behaviour.
     * 
     * @example
     * 
     * 
     * @param env 
     * @param parent 
     */
    *run(env: IEnvironment, parent?: Step) {
        yield* this.runWith(env, this.getValues(env));
        const endBy = this.endBy;
        delete this.endBy;
        if ((endBy instanceof Closer && endBy.runner !== this) || endBy instanceof Step) {
            if (parent) return endBy;  // parent receives it like a normal value
            else if (endBy instanceof Step) yield* endBy.run(env);
        }
    }
    *getValue(value: any, env: IEnvironment) {
        if (value instanceof Closer || (value instanceof Step && !value.priority)) {
            if (value instanceof Step || value.runner !== this) return value;
            else return $;
        } else if (value instanceof Step) {
            // run and yield this runner and every higher priority runners the run yields.
            // then return whatever finished the runner (except '$' which disappears);
            const newStatements = value.run(env, this);
            let newStatement: any, newResult: any;
            const newEnv = {values: newStatements, scope: env.scope, args: env.args};
            while (!(newStatement = newStatements.next()).done) {
                newResult = yield* this.getValue(newStatement.value, newEnv);
                if (newResult !== undefined) newStatements.return(newResult);
            }
            if (newStatement.value !== undefined) return newStatement.value;
        } else if (value === $) {
            return $;
        } else {
            yield value;
        }
    }
    *getValues(env: IEnvironment) {
        let item: IteratorResult<any>, endBy: any;
        while (!(item = env.values.next()).done) {
            endBy = yield* this.getValue(item.value, env);
            if (endBy !== undefined) {
                if (endBy !== $) this.endBy = endBy;
                return;
            }
        }
    }
    /**
     * Default execution is to call all function values in parallel and/or 
     * yield any generators. The final result from calling the functions will 
     * also be yield*ed if it is not undefined. All other values, along with 
     * non-generator function return values are used to build the args for 
     * the next function encountered. Will also yield* generators returned by 
     * fuctions.
     * 
     * @example
     * 
     * 
     * @param env 
     * @param values 
     */
    *runWith(env: IEnvironment, values: Iterable<any>): Iterable<any> {
        yield* values;
    }
}
export function defineSteps(type: typeof Step): [Step, Step, Step, Step] {
    const runner = new type(),         // normal lower priority for next value
    runner1 = new type(1);             // force higher priority
    return [ runner1, runner1, runner, runner ]
}
export const [r, run, R, Run] = defineSteps(Step);   // literal runners

export class FunctionValue {
    value: Function;
}
/**
 * Call to wrap functions to use them as literal arguments in WithStep
 * and PipeStep which interpret functions specially.
 * 
 * @param f 
 * @returns 
 */
export function fn(f: Function) {
    const f2 = new FunctionValue(); f2.value = f; return f2;
}

/**
 * WithStep executes by calling any function values with the 
 * scope and main args as the first 2 arguments followed by any 
 * further arguments built within the step. 
 * 
 * Where a generator is encountered, either among the values or as a function 
 * return value, it will immediately be yielded and 'forgotten'.
 * 
 * The final result from calling the functions will be yield*ed 
 * if it is not undefined. 
 * 
 * All yielded values effectively replace the step 
 * and all its input values in the list of values used in the rest of the action
 * 
 * All other values are used to build the args for 
 * the next function encountered. 
 * 
 * @example
 * 
 * 
 */
export class WithStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let args: any[] = [], result: any;
        for (let value of values) {
            if (isGenerator(value)) yield* value
            else if (value instanceof Function) {
                result = value(env.scope, env.args, ...args);
                if (isGenerator(result)) result = yield* result
                if (result !== undefined) args.push(result);
            } else if (value !== undefined) {
                args.push(value instanceof FunctionValue? value.value: value);
            }
        }
        if (result !== undefined) yield result;
    }
}
export const [w, withr, W, Withr] = defineSteps(WithStep);

/**
 * The pipe step used to interprete values as chained functions (or extra 
 * arguments to them).
 * 
 * @example
 * 
 */
export class PipeStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let args: Iterable<any> = env.args, result: any;
        for (let value of values) {
            if (value instanceof Function) {
                args = [result = value(...args)];
            } else if (value !== undefined && args instanceof Array) {
                args.push(value instanceof FunctionValue? value.value: value);
            }
        }
        if (result) yield result;
    }
}
export const [p, pipe, P, Pipe] = defineSteps(PipeStep);

/**
 * A special step which enables a user to create 
 * on-the-fly steps by initializing with an interpreter 
 * function.
 * 
 * @example
 * 
 * 
 */
export class FuncStep extends Step {
    interpreter: IInterpreter;
    constructor(interpreter: IInterpreter, priority: IPriority = 0) {
        super(priority);
        this.interpreter = interpreter
    }
    *runWith(env: IEnvironment, values: Iterable<any>) {
        const result = this.interpreter(values, env);
        if (result !== undefined) {
            for (let value of result) yield value;
        }
    }
}
export function Func(interpreter: IInterpreter) {
    return new FuncStep(interpreter, 0);
}
export const F = Func;
export function func(interpreter: IInterpreter) {
    return new FuncStep(interpreter, 1);
}
export const f = Func;

/**
 * Values are fetched from the action arguments during this step.
 * 
 * @example
 * 
 */
export class ArgsStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let count = 0;
        const args = Array.from(env.args);
        for (let value of values) {
            yield args[value];
            count++;
        }
        if (count === 0) for (let arg of env.args) yield arg;
    }
}
export const [a, args, A, Args] = defineSteps(ArgsStep);

/**
 * A single action value (iterable) is spread into multiple action values 
 * during this step.
 * 
 * @example
 * 
 */
export class ManyStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        for (let value of values) {
            if (Reflect.has(value, Symbol.iterator)) yield* value; 
            else if (typeof value === 'object') {
                for (let key of Reflect.ownKeys(value)) {
                    yield [key, value[key]];
                } 
            }
        }
    }
}
export const [m, many, M, Many] = defineSteps(ManyStep);

/**
 * Multiple action values are collected into a single value (iterable) 
 * during this step.
 * 
 * @example
 */
export class OneStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        yield values;
    }
}
export const [o, one, O, One] = defineSteps(OneStep);

/**
 * Properties are fetched from the scope or specified objects during 
 * this step. The step can fetch properties at any depth. Also the 
 * scope itself can be returned.
 * 
 * @example
 * 
 */
export class GetStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let count = 0, key: IDeepKey = '';
        for (let value of values) {
            if (count === 0) key = value;              // set the key to get
            else yield get(value, key);                // get from value object
            count++;
        }
        if (count === 0) yield env.scope;                  // get the scope
        else if (count === 1) yield get(env.scope, key)    // get from the scope
    }
}
export const [g, getr, G, Getr] = defineSteps(GetStep);    


/**
 * Properties are set on the scope or specified objects during 
 * this step. The step can set properties at any depth. Also the 
 * scope itself can be set
 * 
 * @example
 * 
 */
export class SetStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let count = 0, key: IDeepKey = '', valueToSet: any;
        let value: any;
        for (value of values) {
            if (count === 0) key = value;                   // set the key
            else if (count === 1) valueToSet = value;            // set the value
            else yield set(value, key, valueToSet);              // set on value object
            count++;
        }
        if (count === 1) yield env.scope = key;                 // we just wanted to set the scope. the key is actually the object.
        else if (count === 2) yield set(env.scope, key, valueToSet)  // set on scope.
    }
}
export const [s, setr, S, Setr] = defineSteps(SetStep);     

/**
 * Methods are called on the scope or specified objects during 
 * this step. The step can call methods at any depth.
 * 
 * @example
 * 
 */
export class CallStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let count = 0, key: IDeepKey = '', args: any[] = [];
        let value: any;
        for (value of values) {
            if (count === 0) key = value;                        // set the key
            else if (count === 1) args = value;                  // set the args
            else yield call(value, key, ...args);                // call on value object
            count++;
        }
        if (count === 1) yield call(env.scope, key);                 // call on scope with no args.
        else if (count === 2) yield call(env.scope, key, ...args)    // call on scope with args.
    }
}
export const [c, callr, C, Callr] = defineSteps(CallStep);

/**
 * Properties are deleted from the scope or specified objects during 
 * this step. The step can delete properties at any depth. Also the 
 * scope itself can be deleted
 * 
 * @example
 * 
 */
export class DeleteStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        let count = 0, key: IDeepKey = '';
        for (let value of values) {
            if (count === 0) key = value;               // set the key to delete
            else del(value, key);                       // delete from value object
            count++;
        }
        if (count === 0) delete env.scope;                  // delete the scope
        else if (count === 1) del(env.scope, key)           // delete from the scope
    }
}
export const [d, delr, D, Delr] = defineSteps(DeleteStep);


/**
 * Used to silence the values yielded by nested steps by simply doing 
 * nothing. This allows us to perform 'side-effect' operations from 
 * within another step which yield values we don't want to send back to the 
 * previous step.
 * 
 * @example
 * 
 */
export class NullStep extends Step {
    *runWith(env: IEnvironment, values: Iterable<any>) {
        
    }
}
export const [n, nullr, N, Nullr] = defineSteps(NullStep);

/**
 * A special step which joins multiple steps so that the values 
 * of earlier steps are built from the values from the subsequent ones.
 * 
 * It is used to alias a chain of steps that would have had to be 
 * written out every time.
 * 
 * @example
 * 
 * 
 */
export class EarlyStep extends Step {
    values: Iterable<any>;
    constructor(values: Iterable<any>, priority: IPriority = 0) {
        super(priority);
        this.values = values;
    }
    *runWith(env: IEnvironment, values: Iterable<any>) {
        const ef = action(chain(this.values, values));
        yield* ef.genWith(env.scope, ...env.args);
    }
}
function* chain(...args: Iterable<any>[])  {
    for (let it of args) yield* it;
}
export function Est(values: Iterable<any>) {
    return new EarlyStep(values, 0);
}
export const E = Est;
export function est(values: Iterable<any>) {
    return new EarlyStep(values, 1);
}
export const e = est;

/**
 * Allows more flexibility than EarlyStep in where new values 
 * are placed. However this means we must use static arrays to hold the 
 * values in the template. To use more transient iterables here, 
 * please implement your own.
 * 
 */
export class StepTemplate {
    values: any[];
    map: ITemplateMap;

    constructor(values: any[], map: ITemplateMap) {
        this.values = values;
        this.map = map;
    }

    run(values: {[key: IKey]: any}, priority: IPriority = 0) {
        const erStatements: any[] = [...this.values];
        let index: number | typeof $;
        for (let key of Reflect.ownKeys(values)) {
            index = this.map[key];
            if (index === $) {
                erStatements.push(values[key]);
            } else {
                erStatements.splice(index as number, 0, values[key]);
            }
        }
        return new EarlyStep(erStatements, priority);
    }
}

export type ITemplateMap = {[key: IKey]: number | typeof $};

export function template(values: any[], map: ITemplateMap) {
    return new StepTemplate(values, map);
}

