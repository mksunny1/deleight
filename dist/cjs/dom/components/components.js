"use strict";
/**
 * A few important functions for expressively and efficiently
 * working with elements on a web page.
 *
 * The functions here include:
 *
 * 5. {@link listener} an {@link apply} component (function) used to declaratively
 * attach listeners to specified elements within a tree.
 *
 * 6. {@link setter} an {@link apply} component (function) used to declaratively
 * set the values of element properties within a tree.
 *
 * 7. {@link assigner} an {@link apply} component (function) used to declaratively
 * set element sub-properties within a tree.
 *
 * 8. {@link attrSetter} an {@link apply} component (function) used to declaratively
 * set the values of element attributes within a tree.
 *
 *
 * @module
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.attrSetter = exports.assigner = exports.setter = exports.listener = void 0;
const operations_js_1 = require("../../object/operations/operations.js");
/**
 * Creates a function to be called with listener functions to return `apply
 * @param event
 * @param options
 * @returns
 */
function listener(event, options) {
    return (listener) => (elements, key) => {
        for (let element of elements)
            element.addEventListener(event, listener, options);
    };
}
exports.listener = listener;
function setter(prop) {
    return (value) => (elements, key) => {
        for (let element of elements)
            element[prop] = value;
    };
}
exports.setter = setter;
function assigner(value) {
    return (elements, key) => {
        for (let element of elements)
            (0, operations_js_1.assign)(element, [value]);
    };
}
exports.assigner = assigner;
function attrSetter(name) {
    return (value) => (elements, key) => {
        for (let element of elements)
            element.setAttribute(name, value);
    };
}
exports.attrSetter = attrSetter;
