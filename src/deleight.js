/**
 * Deleight is an assembly of mostly independent primitives grouped by
 * functionality or type. The goal is to create high-level tools to
 * accelerate web development without sacrificing simplicity, flexibility,
 * code comprehension or performance.
 *
 * All the tools provided by Deleight are lightweight so that you can mix freely
 * with regular JavaScript.
 * With Deleight, you write regular JavaScript (or TypeScript) apps and reach for
 * the tools when you need them. Deleight does not enforce a way to build apps, but
 * instead helps you to build well structured and easy-to-maintain apps naturally.
 *
 * There is no mental overhead to using Deleight and there is no learning curve.
 * You can learn and use any part of Deleight entirely on its own. Therefore
 * you can immediately see gains in expressiveness from the moment you bring the
 * library into your project. Deleight is a library but has all the benefits of
 * a framework.
 *
 * The decoupling of the different components of deleight also means that you never
 * need to pay the size overhead of parts you don't use in your projects. There is
 * rarely a need for tree-shaking or minification to get tiny file sizes.
 *
 * Using Deleight can future-proof your projects in many ways.
 * - You can finish your projects earlier gaining an advantage in the market
 * - You can easily upgrade or replace individual components, with other components or
 * with plain JavaScript
 * - Your projects will be comprehensible and fun to maintain
 * - Deleight itself is easy to maintain because of the architecture. It will likely
 * be relevant for a long time.
 *
 *
 * @module
 *
 */
export * as css from './css/css.js';
export * as dom from './dom/dom.js';
export * as function from './function/function.js';
export * as Generator from './generators/generators.js';
export * as List from './lists/lists.js';
export * as object from './object/object.js';
export * as action from './action/action.js';
export * as Proxy from './proxies/proxies.js';
export * as template from './template/template.js';
