"use strict";
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
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetStep = exports.Getr = exports.G = exports.getr = exports.g = exports.GetStep = exports.One = exports.O = exports.one = exports.o = exports.OneStep = exports.Many = exports.M = exports.many = exports.m = exports.ManyStep = exports.Args = exports.A = exports.args = exports.a = exports.ArgsStep = exports.f = exports.func = exports.F = exports.Func = exports.FuncStep = exports.Pipe = exports.P = exports.pipe = exports.p = exports.PipeStep = exports.Withr = exports.W = exports.withr = exports.w = exports.WithStep = exports.fn = exports.FunctionValue = exports.Run = exports.R = exports.run = exports.r = exports.defineSteps = exports.Step = exports.$ = exports.Closer = exports.process = exports.Process = exports.isAsyncGenerator = exports.isGenerator = void 0;
exports.template = exports.StepTemplate = exports.e = exports.est = exports.E = exports.Est = exports.EarlyStep = exports.Nullr = exports.N = exports.nullr = exports.n = exports.NullStep = exports.Delr = exports.D = exports.delr = exports.d = exports.DeleteStep = exports.Callr = exports.C = exports.callr = exports.c = exports.CallStep = exports.Setr = exports.S = exports.setr = exports.s = void 0;
const deep_js_1 = require("../object/member/deep/deep.js");
function isGenerator(value) {
    return value && value[Symbol.iterator]?.() === value;
}
exports.isGenerator = isGenerator;
function isAsyncGenerator(value) {
    return value && value[Symbol.asyncIterator]?.() === value;
}
exports.isAsyncGenerator = isAsyncGenerator;
class Process {
    constructor(values, arrayScope) {
        this.values = values;
        if (arrayScope)
            this.arrayScope = arrayScope;
    }
    getStatements(scope, ...args) {
        return Reflect.has(this.values, Symbol.iterator) ? this.values[Symbol.iterator]() : Object.values(this.values);
    }
    getScope(...args) {
        return (this.arrayScope ? [] : {});
    }
    start(scope, ...args) {
        const env = {
            values: this.getStatements(scope, ...args),
            scope, args
        };
        // nb: First item must be a runner.
        return { index: 0, runner: env.values.next().value, env };
    }
    *genWith(scope, ...args) {
        const run = this.start(scope, ...args);
        if (run) {
            yield* run.runner.run(run.env);
        }
    }
    *gen(...args) {
        return this.genWith(this.getScope(...args), ...args);
    }
    callWith(scope, ...args) {
        for (let value of this.genWith(scope, ...args)) {
            return value;
        }
    }
    call(...args) {
        return this.callWith(this.getScope(...args), ...args);
    }
}
exports.Process = Process;
function process(code) {
    return new Process(code);
}
exports.process = process;
class Closer {
    constructor(runner) {
        this.runner = runner;
    }
}
exports.Closer = Closer;
/**
 * Used directly to end the last step or called with a step to
 * end that step.
 *
 * @example
 *
 */
function $(runner) {
    return new Closer(runner);
}
exports.$ = $;
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
class Step {
    constructor(priority = 0) {
        this.priority = priority;
    }
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
    *run(env, parent) {
        yield* this.runWith(env, this.getValues(env));
        const endBy = this.endBy;
        delete this.endBy;
        if ((endBy instanceof Closer && endBy.runner !== this) || endBy instanceof Step) {
            if (parent)
                return endBy; // parent receives it like a normal value
            else if (endBy instanceof Step)
                yield* endBy.run(env);
        }
    }
    *getValue(value, env) {
        if (value instanceof Closer || (value instanceof Step && !value.priority)) {
            if (value instanceof Step || value.runner !== this)
                return value;
            else
                return $;
        }
        else if (value instanceof Step) {
            // run and yield this runner and every higher priority runners the run yields.
            // then return whatever finished the runner (except '$' which disappears);
            const newStatements = value.run(env, this);
            let newStatement, newResult;
            const newEnv = { values: newStatements, scope: env.scope, args: env.args };
            while (!(newStatement = newStatements.next()).done) {
                newResult = yield* this.getValue(newStatement.value, newEnv);
                if (newResult !== undefined)
                    newStatements.return(newResult);
            }
            if (newStatement.value !== undefined)
                return newStatement.value;
        }
        else if (value === $) {
            return $;
        }
        else {
            yield value;
        }
    }
    *getValues(env) {
        let item, endBy;
        while (!(item = env.values.next()).done) {
            endBy = yield* this.getValue(item.value, env);
            if (endBy !== undefined) {
                if (endBy !== $)
                    this.endBy = endBy;
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
    *runWith(env, values) {
        yield* values;
    }
}
exports.Step = Step;
function defineSteps(type) {
    const runner = new type(), // normal lower priority for next value
    runner1 = new type(1); // force higher priority
    return [runner1, runner1, runner, runner];
}
exports.defineSteps = defineSteps;
_a = defineSteps(Step), exports.r = _a[0], exports.run = _a[1], exports.R = _a[2], exports.Run = _a[3]; // literal runners
class FunctionValue {
}
exports.FunctionValue = FunctionValue;
/**
 * Call to wrap functions to use them as literal arguments in WithStep
 * and PipeStep which interpret functions specially.
 *
 * @param f
 * @returns
 */
function fn(f) {
    const f2 = new FunctionValue();
    f2.value = f;
    return f2;
}
exports.fn = fn;
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
class WithStep extends Step {
    *runWith(env, values) {
        let args = [], result;
        for (let value of values) {
            if (isGenerator(value))
                yield* value;
            else if (value instanceof Function) {
                result = value(env.scope, env.args, ...args);
                if (isGenerator(result))
                    result = yield* result;
                if (result !== undefined)
                    args.push(result);
            }
            else if (value !== undefined) {
                args.push(value instanceof FunctionValue ? value.value : value);
            }
        }
        if (result !== undefined)
            yield result;
    }
}
exports.WithStep = WithStep;
_b = defineSteps(WithStep), exports.w = _b[0], exports.withr = _b[1], exports.W = _b[2], exports.Withr = _b[3];
/**
 * The pipe step used to interprete values as part of a 'piping' process
 * where the return value of one function is used as the argument for the next.
 *
 * @example
 *
 */
class PipeStep extends Step {
    *runWith(env, values) {
        let args = env.args, result;
        for (let value of values) {
            if (value instanceof Function) {
                args = [result = value(...args)];
            }
            else if (value !== undefined && args instanceof Array) {
                args.push(value instanceof FunctionValue ? value.value : value);
            }
        }
        if (result)
            yield result;
    }
}
exports.PipeStep = PipeStep;
_c = defineSteps(PipeStep), exports.p = _c[0], exports.pipe = _c[1], exports.P = _c[2], exports.Pipe = _c[3];
/**
 * A special step which enables a user to create
 * on-the-fly steps by initializing with an interpreter
 * function.
 *
 * @example
 *
 *
 */
class FuncStep extends Step {
    constructor(interpreter, priority = 0) {
        super(priority);
        this.interpreter = interpreter;
    }
    *runWith(env, values) {
        const result = this.interpreter(values, env);
        if (result !== undefined) {
            for (let value of result)
                yield value;
        }
    }
}
exports.FuncStep = FuncStep;
function Func(interpreter) {
    return new FuncStep(interpreter, 0);
}
exports.Func = Func;
exports.F = Func;
function func(interpreter) {
    return new FuncStep(interpreter, 1);
}
exports.func = func;
exports.f = Func;
/**
 * Values are fetched from the process arguments during this step.
 *
 * @example
 *
 */
class ArgsStep extends Step {
    *runWith(env, values) {
        let count = 0;
        const args = Array.from(env.args);
        for (let value of values) {
            yield args[value];
            count++;
        }
        if (count === 0)
            for (let arg of env.args)
                yield arg;
    }
}
exports.ArgsStep = ArgsStep;
_d = defineSteps(ArgsStep), exports.a = _d[0], exports.args = _d[1], exports.A = _d[2], exports.Args = _d[3];
/**
 * A single process value (iterable) is spread into multiple process values
 * during this step.
 *
 * @example
 *
 */
class ManyStep extends Step {
    *runWith(env, values) {
        for (let value of values) {
            if (Reflect.has(value, Symbol.iterator))
                yield* value;
            else if (typeof value === 'object') {
                for (let key of Reflect.ownKeys(value)) {
                    yield [key, value[key]];
                }
            }
        }
    }
}
exports.ManyStep = ManyStep;
_e = defineSteps(ManyStep), exports.m = _e[0], exports.many = _e[1], exports.M = _e[2], exports.Many = _e[3];
/**
 * Multiple process values are collected into a single value (iterable)
 * during this step.
 *
 * @example
 */
class OneStep extends Step {
    *runWith(env, values) {
        yield values;
    }
}
exports.OneStep = OneStep;
_f = defineSteps(OneStep), exports.o = _f[0], exports.one = _f[1], exports.O = _f[2], exports.One = _f[3];
/**
 * Properties are fetched from the scope or specified objects during
 * this step. The step can fetch properties at any depth. Also the
 * scope itself can be returned.
 *
 * @example
 *
 */
class GetStep extends Step {
    *runWith(env, values) {
        let count = 0, key = '';
        for (let value of values) {
            if (count === 0)
                key = value; // set the key to get
            else
                yield (0, deep_js_1.get)(value, key); // get from value object
            count++;
        }
        if (count === 0)
            yield env.scope; // get the scope
        else if (count === 1)
            yield (0, deep_js_1.get)(env.scope, key); // get from the scope
    }
}
exports.GetStep = GetStep;
_g = defineSteps(GetStep), exports.g = _g[0], exports.getr = _g[1], exports.G = _g[2], exports.Getr = _g[3];
/**
 * Properties are set on the scope or specified objects during
 * this step. The step can set properties at any depth. Also the
 * scope itself can be set
 *
 * @example
 *
 */
class SetStep extends Step {
    *runWith(env, values) {
        let count = 0, key = '', valueToSet;
        let value;
        for (value of values) {
            if (count === 0)
                key = value; // set the key
            else if (count === 1)
                valueToSet = value; // set the value
            else
                yield (0, deep_js_1.set)(value, key, valueToSet); // set on value object
            count++;
        }
        if (count === 1)
            yield env.scope = key; // we just wanted to set the scope. the key is actually the object.
        else if (count === 2)
            yield (0, deep_js_1.set)(env.scope, key, valueToSet); // set on scope.
    }
}
exports.SetStep = SetStep;
_h = defineSteps(SetStep), exports.s = _h[0], exports.setr = _h[1], exports.S = _h[2], exports.Setr = _h[3];
/**
 * Methods are called on the scope or specified objects during
 * this step. The step can call methods at any depth.
 *
 * @example
 *
 */
class CallStep extends Step {
    *runWith(env, values) {
        let count = 0, key = '', args = [];
        let value;
        for (value of values) {
            if (count === 0)
                key = value; // set the key
            else if (count === 1)
                args = value; // set the args
            else
                yield (0, deep_js_1.call)(value, key, ...args); // call on value object
            count++;
        }
        if (count === 1)
            yield (0, deep_js_1.call)(env.scope, key); // call on scope with no args.
        else if (count === 2)
            yield (0, deep_js_1.call)(env.scope, key, ...args); // call on scope with args.
    }
}
exports.CallStep = CallStep;
_j = defineSteps(CallStep), exports.c = _j[0], exports.callr = _j[1], exports.C = _j[2], exports.Callr = _j[3];
/**
 * Properties are deleted from the scope or specified objects during
 * this step. The step can delete properties at any depth. Also the
 * scope itself can be deleted
 *
 * @example
 *
 */
class DeleteStep extends Step {
    *runWith(env, values) {
        let count = 0, key = '';
        for (let value of values) {
            if (count === 0)
                key = value; // set the key to delete
            else
                (0, deep_js_1.del)(value, key); // delete from value object
            count++;
        }
        if (count === 0)
            delete env.scope; // delete the scope
        else if (count === 1)
            (0, deep_js_1.del)(env.scope, key); // delete from the scope
    }
}
exports.DeleteStep = DeleteStep;
_k = defineSteps(DeleteStep), exports.d = _k[0], exports.delr = _k[1], exports.D = _k[2], exports.Delr = _k[3];
/**
 * Used to silence the values yielded by nested steps by simply doing
 * nothing. This allows us to perform 'side-effect' operations from
 * within another step which yield values we don't want to send back to the
 * previous step.
 *
 * @example
 *
 */
class NullStep extends Step {
    *runWith(env, values) {
    }
}
exports.NullStep = NullStep;
_l = defineSteps(NullStep), exports.n = _l[0], exports.nullr = _l[1], exports.N = _l[2], exports.Nullr = _l[3];
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
class EarlyStep extends Step {
    constructor(values, priority = 0) {
        super(priority);
        this.values = values;
    }
    *runWith(env, values) {
        const ef = process(chain(this.values, values));
        yield* ef.genWith(env.scope, ...env.args);
    }
}
exports.EarlyStep = EarlyStep;
function* chain(...args) {
    for (let it of args)
        yield* it;
}
function Est(values) {
    return new EarlyStep(values, 0);
}
exports.Est = Est;
exports.E = Est;
function est(values) {
    return new EarlyStep(values, 1);
}
exports.est = est;
exports.e = est;
/**
 * Allows more flexibility than EarlyStep in where new values
 * are placed. However this means we must use static arrays to hold the
 * values in the template. To use more transient iterables here,
 * please implement your own.
 *
 */
class StepTemplate {
    constructor(values, map) {
        this.values = values;
        this.map = map;
    }
    run(values, priority = 0) {
        const erStatements = [...this.values];
        let index;
        for (let key of Reflect.ownKeys(values)) {
            index = this.map[key];
            if (index === $) {
                erStatements.push(values[key]);
            }
            else {
                erStatements.splice(index, 0, values[key]);
            }
        }
        return new EarlyStep(erStatements, priority);
    }
}
exports.StepTemplate = StepTemplate;
function template(values, map) {
    return new StepTemplate(values, map);
}
exports.template = template;