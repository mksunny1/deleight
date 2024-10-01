/**
 * Exports the {@link Process} type along with many useful {@link Step}
 * types which are used to create 'live' functions
 * which are both very expressive, more controllable and mutable almost
 * without a performance penalty. The flow is easier to track as it is
 * declarative. You can create new step types which interpret your code
 * at speed.
 *
 * Processes can be used for:
 *
 * 1. declarative programming - You can use Process for simple things
 * like a piping and passing the same arguments to different functions.
 *
 * 2. reactivity - You can manipulate many objects at the same time with a
 * concise syntax.
 *
 * 3. implementing other libraries that will generate code on the fly - You can
 * create and modify processes easily, unlike regular functions.
 *
 * 4. custom DSLs - You can write your own steps to interpret code however you
 * like. for example your own markup language
 *
 * 5. etc - You can use Process for many other use cases we havent yet
 * mentioned or envisaged
 *
 * Process can be used in any JavaScript environment as it has no
 * platform dependencies. It is also performant and lightweight.
 *
 * API Table of Contents
 *
 *
 *
 * @module
 *
 */
import { IKey } from "../types.js";
export interface IEnvironment {
    values: Iterator<any>;
    scope?: any;
    args?: Iterable<any>;
}
export type IPriority = 0 | 1;
export type IInterpreter = (values: Iterable<any>, env: IEnvironment) => (Iterable<any> | undefined);
export declare function isGenerator(value: any): boolean;
export declare function isAsyncGenerator(value: any): boolean;
export declare class Process<T = any, U extends any[] = any> {
    values: Iterable<any> | {
        IKey: any;
    };
    arrayScope?: boolean;
    constructor(values: Iterable<any> | {
        IKey: any;
    }, arrayScope?: boolean);
    getStatements(scope: T, ...args: any[]): any;
    getScope(...args: any[]): T;
    start(scope: T, ...args: U): {
        index: number;
        runner: any;
        env: IEnvironment;
    };
    genWith(scope: T, ...args: U): Generator<any, void, any>;
    gen(...args: U): Generator<never, Generator<any, void, any>, unknown>;
    callWith(scope: T, ...args: U): any;
    call(...args: U): any;
}
export declare function process(code: Iterable<any>): Process<any, any>;
export declare class Closer {
    runner: Step;
    constructor(runner: Step);
}
/**
 * Used directly to end the last step or called with a step to
 * end that step.
 *
 * @example
 *
 */
export declare function $(runner: Step): Closer;
/**
 * Interpretes values and returns replacement values.
 *
 * A process is simply an array of different values. Steps are some
 * of these values that provide interpretations for the values following
 * them (up until the next termination step or the end of the process).
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
export declare class Step {
    priority: IPriority;
    endBy?: Step | Closer;
    constructor(priority?: IPriority);
    /**
     * Collect all the values used in the step and pass to
     * {@link Step#runWith}. Then replace the collected values
     * with those returned by {@link Step#runWith}.
     *
     * This method concludes by starting the next step, if there is
     * one. Not starting the next step can cause the process to end
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
    run(env: IEnvironment, parent?: Step): any;
    getValue(value: any, env: IEnvironment): any;
    getValues(env: IEnvironment): any;
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
    runWith(env: IEnvironment, values: Iterable<any>): Iterable<any>;
}
export declare function defineSteps(type: typeof Step): [Step, Step, Step, Step];
export declare const r: Step, run: Step, R: Step, Run: Step;
export declare class FunctionValue {
    value: Function;
}
/**
 * Call to wrap functions to use them as literal arguments in WithStep
 * and PipeStep which interpret functions specially.
 *
 * @param f
 * @returns
 */
export declare function fn(f: Function): FunctionValue;
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
 * and all its input values in the list of values used in the rest of the process
 *
 * All other values are used to build the args for
 * the next function encountered.
 *
 * @example
 *
 *
 */
export declare class WithStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, any>;
}
export declare const w: Step, withr: Step, W: Step, Withr: Step;
/**
 * The pipe step used to interprete values as part of a 'piping' process
 * where the return value of one function is used as the argument for the next.
 *
 * @example
 *
 */
export declare class PipeStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, unknown>;
}
export declare const p: Step, pipe: Step, P: Step, Pipe: Step;
/**
 * A special step which enables a user to create
 * on-the-fly steps by initializing with an interpreter
 * function.
 *
 * @example
 *
 *
 */
export declare class FuncStep extends Step {
    interpreter: IInterpreter;
    constructor(interpreter: IInterpreter, priority?: IPriority);
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, unknown>;
}
export declare function Func(interpreter: IInterpreter): FuncStep;
export declare const F: typeof Func;
export declare function func(interpreter: IInterpreter): FuncStep;
export declare const f: typeof Func;
/**
 * Values are fetched from the process arguments during this step.
 *
 * @example
 *
 */
export declare class ArgsStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, unknown>;
}
export declare const a: Step, args: Step, A: Step, Args: Step;
/**
 * A single process value (iterable) is spread into multiple process values
 * during this step.
 *
 * @example
 *
 */
export declare class ManyStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, any>;
}
export declare const m: Step, many: Step, M: Step, Many: Step;
/**
 * Multiple process values are collected into a single value (iterable)
 * during this step.
 *
 * @example
 */
export declare class OneStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<Iterable<any>, void, unknown>;
}
export declare const o: Step, one: Step, O: Step, One: Step;
/**
 * Properties are fetched from the scope or specified objects during
 * this step. The step can fetch properties at any depth. Also the
 * scope itself can be returned.
 *
 * @example
 *
 */
export declare class GetStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, unknown>;
}
export declare const g: Step, getr: Step, G: Step, Getr: Step;
/**
 * Properties are set on the scope or specified objects during
 * this step. The step can set properties at any depth. Also the
 * scope itself can be set
 *
 * @example
 *
 */
export declare class SetStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, unknown>;
}
export declare const s: Step, setr: Step, S: Step, Setr: Step;
/**
 * Methods are called on the scope or specified objects during
 * this step. The step can call methods at any depth.
 *
 * @example
 *
 */
export declare class CallStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, unknown>;
}
export declare const c: Step, callr: Step, C: Step, Callr: Step;
/**
 * Properties are deleted from the scope or specified objects during
 * this step. The step can delete properties at any depth. Also the
 * scope itself can be deleted
 *
 * @example
 *
 */
export declare class DeleteStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<never, void, unknown>;
}
export declare const d: Step, delr: Step, D: Step, Delr: Step;
/**
 * Used to silence the values yielded by nested steps by simply doing
 * nothing. This allows us to perform 'side-effect' operations from
 * within another step which yield values we don't want to send back to the
 * previous step.
 *
 * @example
 *
 */
export declare class NullStep extends Step {
    runWith(env: IEnvironment, values: Iterable<any>): Generator<never, void, unknown>;
}
export declare const n: Step, nullr: Step, N: Step, Nullr: Step;
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
export declare class EarlyStep extends Step {
    values: Iterable<any>;
    constructor(values: Iterable<any>, priority?: IPriority);
    runWith(env: IEnvironment, values: Iterable<any>): Generator<any, void, any>;
}
export declare function Est(values: Iterable<any>): EarlyStep;
export declare const E: typeof Est;
export declare function est(values: Iterable<any>): EarlyStep;
export declare const e: typeof est;
/**
 * Allows more flexibility than EarlyStep in where new values
 * are placed. However this means we must use static arrays to hold the
 * values in the template. To use more transient iterables here,
 * please implement your own.
 *
 */
export declare class StepTemplate {
    values: any[];
    map: ITemplateMap;
    constructor(values: any[], map: ITemplateMap);
    run(values: {
        [key: IKey]: any;
    }, priority?: IPriority): EarlyStep;
}
export type ITemplateMap = {
    [key: IKey]: number | typeof $;
};
export declare function template(values: any[], map: ITemplateMap): StepTemplate;
