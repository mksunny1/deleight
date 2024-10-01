/**
 * Deleight is an assembly of mostly independent primitives grouped by
 * functionality or type. The goal is to create high-level tools to
 * accelerate web development without sacrificing simplicity, flexibility,
 * code comprehension or performance.
 *
 * All the tools provided by Deleight are thin wrappers around regular JavaScript.
 * With Deleight, you write regular JavaScript (or TypeScript) apps and reach for
 * the tools when you need them. Deleight does not enforce a way to build apps, but
 * instead help you to build well structured and easy-to-maintain apps naturally.
 *
 * There is no mental overhead to using Deleight and there is no learning curve.
 * You can learn and use any part of Deleight entirely on their own. Therefore
 * you can immediately see gains in expressiveness from the moment you bring the
 * library into your project. Deleight is a library but has all the usefulness of
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
 * - Your projects will be very comprehensibe and fun to maintain
 * - Deleight itself is easy to maintain because of the architecture. It will likely
 * be relevant for a very long time.
 *
 * Module Guide.
 *
 * 1. css (Deleight.css) (deleight/css)
 *
 * 2. dom (Deleight.dom) (deleight/dom)
 * 2.1. apply (Deleight.dom) (deleight/dom/apply)
 * 2.2. components (Deleight.dom) (deleight/dom/components)
 * 2.3. fragment (Deleight.dom) (deleight/dom/fragment)
 * 2.4. process (Deleight.dom) (deleight/dom/process)
 *
 * 3. function (Deleight.function) (deleight/function)
 * 3.1. Context (Deleight.function) (deleight/function/context)
 * 3.2. Return (Deleight.function) (deleight/function/return)
 *
 * 4. generators (Deleight.Generator) (deleight/generators)
 *
 * 5. lists (Deleight.List) (deleight/lists)
 * 5.1. Array (Deleight.List) (deleight/lists/array)
 * 5.2. Element (Deleight.List) (deleight/lists/element)
 *
 * 6. object (Deleight.object) (deleight/object)
 * 6.1. apply (Deleight.object) (deleight/object/apply)
 * 6.2. deepMember (Deleight.object) (deleight/object/deepmember)
 * 6.3. member (Deleight.object) (deleight/object/member)
 * 6.4. operations (Deleight.object) (deleight/object/operations)
 * 6.5. process (Deleight.object) (deleight/object/process)
 * 6.6. sharedMember (Deleight.object) (deleight/object/sharedmember)
 *
 * 7. Process (Deleight.process)  (deleight/process)
 *
 * 8. proxies (Deleight.Proxy)  (deleight/proxy)
 * 8.1. Alias (Deleight.Proxy)  (deleight/proxy/alias)
 * 8.2. Scope (Deleight.Proxy)  (deleight/proxy/scope)
 * 8.3. Selector (Deleight.Proxy)  (deleight/proxy/selector)
 * 8.4. Wrapper (Deleight.Proxy)  (deleight/proxy/wrapper)
 *
 * 9. template (Deleight.template)  (deleight/template)
 *
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
export * as process from './process/process.js';
export * as Proxy from './proxies/proxies.js';
export * as template from './template/template.js';
