/**
 * This creates 'template literal' functions from pre-existing text.
 */
/**
 * A template tag that will resolve only after all
 * interpolated promises have been resolved, finally returning the
 * intended string.
 *
 * @example
 * import { asyncTag } from 'deleight/template';
 * const t = await asyncTag`I will wait for this ${Promise.resolve("promise")}!!!`
 * // t === 'I will wait for this promise!!!'
 *
 * @param {Array<string>} strings
 * @param  {...any} expressions
 * @returns {Promise<string>}
 */
export async function asyncTag(strings, ...expressions) {
    const promiseExpressions = [];
    for (let [i, exp] of Array.from(expressions.entries())) {
        if (exp instanceof Promise)
            promiseExpressions.push(exp);
        else
            promiseExpressions.push(Promise.resolve(exp));
    }
    const resolvedExpressions = await Promise.all(promiseExpressions);
    return (resolvedExpressions.map((exp, i) => `${strings[i]}${exp}`).join("") +
        strings[resolvedExpressions.length]);
}
/**
 * Effectively creates a template literal out of an existing template string and wraps it in a function
 * which can be called multiple times to 'render' the template with the given arguments.
 *
 * @example
 * import { template } from 'deleight/template';
 * const t = template('I will render this ${arg} immediately!!!')('guy');
 * // t === 'I will render this guy immediately!!!'
 *
 * @param {string} templateStr the template string
 * @param {string[]} argNames The names of the parameters of the returned function (which can be 'seen' inside the template string).
 * Defaults to: ['arg'].
 * @returns {(...any): string}
 */
export function template(templateStr, argNames) {
    if (!argNames)
        argNames = ['arg'];
    return Function(...argNames, `return \`${templateStr}\`;`);
}
/**
 * Similar to {@link template} but the built template is also 'promise-aware' and will allow them to
 * resolve to string values before interpolating them.
 *
 * @example
 * import { asyncTemplate } from 'deleight/template';
 * const promise = Promise.resolve("async thing");
 * const template = asyncTemplate('I will wait for this ${arg}!!!');
 * const t = await template(promise);
 * // t === 'I will wait for this async thing!!!'
 *
 *
 * @param {string} templateStr the template string
 * @param {Array<string>} argNames The names of the parameters of the returned function (which can be 'seen' inside the template string).
 * Defaults to: ['arg'].
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {(...any): Promise<string>}
 */
export function asyncTemplate(templateStr, argNames, tagName) {
    if (!argNames)
        argNames = ['arg'];
    if (!tagName)
        tagName = "T";
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }
    const f = Function(tagName, ...argNames, `return ${tagName}\`${templateStr}\`;`);
    return (...args) => f(asyncTag, ...args);
}
/**
 * Similar to template, but will render an iterable (such as array) of items together instead
 * of rendering each item individually. It improves efficiency in these scenarios because only 1 rendering
 * function is called.
 *
 * @example
 * import { templates } from 'deleight/template';
 * const t = templates('I will render this ${it}/${other} immediately!!!', ['iter', 'other'], 'it')([1, 2, 3, 4, 5], '(shared)').join(' & ');
 * // t === 'I will render this 1/(shared) immediately!!! & I will render this 2/(shared) immediately!!! & I will render this 3/(shared) immediately!!! & I will render this 4/(shared) immediately!!! & I will render this 5/(shared) immediately!!!'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (starting with the iterable) of the returned function (which can be 'seen'
 * inside the template string). Defauts to ['iter']
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * @returns {ITemplates}
 */
export function templates(templateStr, argNames = ['iter'], itemName = 'item') {
    return (Function(`
        function* gen(${argNames.join(', ')}) {
            for (let ${itemName} of ${argNames[0]}) yield \`${templateStr}\`;
        }
        return gen;`))();
}
/**
 * Async equivalent of {@link templates}. The async template tag ('T' by default)
 * is applied to the template string. Use this when there are promises
 * among the arguents that will be passed to the returned function.
 *
 * @example
 * import { asyncTemplates } from 'deleight/apriori';
 * let t = asyncTemplates('I will async render this ${item}')([1, 2, 3, 4, 5].map(i => Promise.resolve(i)));
 * console.log(t instanceof Promise);   // true
 * t = (await Promise.all(t)).join(' ')
 * // t === 'I will async render this 1 I will async render this 2 I will async render this 3 I will async render this 4 I will async render this 5'
 *
 * @param {string} templateStr The template string
 * @param {Array<string>} argNames The names of the parameters (starting with the iterable) of the returned function (which can be 'seen' inside the template string)
 * @param {string} itemName The name of the current item of the iterable as seen inside the template string. Defaults
 * to 'item'
 * @param {string} tagName Supply a tagName argument to change the name of the tag function inside the template string if
 * the default name (T) is present in  argNames.
 * @returns {IAsyncTemplates}
 */
export function asyncTemplates(templateStr, argNames = ['iter'], itemName = 'item', tagName = 'T') {
    if (itemName === tagName) {
        throw new Error(`The tag name ${tagName} is the same as the item name. 
        Please change the tag name or the item name to resolve this.`);
    }
    if (argNames.includes(tagName)) {
        throw new Error(`The tag name ${tagName} clashes with the name of one of the arguments. 
        Please change the tag name or the argument name to resolve this.`);
    }
    const f = (Function(`
        function* gen(${tagName}, ${argNames.join(', ')}) {
            for (let ${itemName} of ${argNames[0]}) yield ${tagName}\`${templateStr}\`;
        }
        return gen;`))();
    return (arr, ...args) => f(asyncTag, arr, ...args);
}
