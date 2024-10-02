"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.template = exports.Proxy = exports.process = exports.object = exports.List = exports.Generator = exports.function = exports.dom = exports.css = void 0;
exports.css = require("./css/css.js");
exports.dom = require("./dom/dom.js");
exports.function = require("./function/function.js");
exports.Generator = require("./generators/generators.js");
exports.List = require("./lists/lists.js");
exports.object = require("./object/object.js");
exports.process = require("./process/process.js");
exports.Proxy = require("./proxies/proxies.js");
exports.template = require("./template/template.js");
