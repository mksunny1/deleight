/**
 * This module provides a high-level reactivity API for manipulating the
 * DOM with HTML attributes. It is somewhat similar to Angular and Vue but
 * the API is much smaller and has much fewer moving parts. There are only
 * a few attributes which trigger DOM reactions for object property set and
 * delete and arrsy item push, pop, set and slice. Everything else is pure
 * JavaScript.
 *
 */
const NAME = Symbol('name');
const VALUE = Symbol('value');
const arrayMethods = new Set(['push', 'pop', 'splice']);
function getArrayMethod(target, method, context) {
    if (method === 'push') {
        return (...items) => {
            target.push(...items);
            context.refType.react({ [context.name]: { type: 'push', val: items } });
        };
    }
    else if (method === 'pop') {
        return (count = 1) => {
            const old = [];
            while (count-- > 0)
                old.unshift(target.pop());
            context.refType.react({ [context.name]: { type: 'pop', old } });
        };
    }
    else if (method === 'splice') {
        return (start, deleteCount, ...items) => {
            target.splice(start, ...((deleteCount !== undefined) ? [deleteCount] : []), ...items);
            const count = (deleteCount === undefined) ? target.length - start : deleteCount;
            context.refType.react({ [context.name]: { type: 'splice', index: start, count, vals: items } });
        };
    }
}
const refTrap = (context) => ({
    // name and previously accessed props are stored in context.
    get(target, p) {
        // return other refs for object and function props.
        // remember to bind function props (methods).
        // also special processing for NAME and VALUE.
        // to avoid complexity only match names for .strprop and [numprop]
        if (p === NAME)
            return context.name || '';
        if (p === VALUE)
            return target;
        if (!context.hasOwnProperty('props'))
            context.props = {};
        else if (context.props.hasOwnProperty(p))
            return context.props[p];
        if (target instanceof Array && arrayMethods.has(p)) {
            return getArrayMethod(target, p, context);
        }
        const prop = target[p];
        if (prop === undefined)
            return;
        let name = context.name || '';
        if (typeof p === 'string' || typeof p === 'number')
            name += ' ' + p.toString().replaceAll(' ', '__');
        else
            return prop; // for symbols we cannot wrap because we 
        // cannot use a name.
        let refProp;
        if (prop instanceof Function) {
            refProp = context.props[p] = new Proxy(prop.bind(target), refTrap({ name, refType: context.refType }));
        }
        else if (typeof prop === "object") {
            refProp = context.props[p] = new Proxy(prop, refTrap({ name, refType: context.refType }));
        }
        else
            refProp = { [NAME]: name, [VALUE]: prop };
        return refProp;
    },
    set(target, p, value) {
        let refProp;
        const old = target[p];
        const val = target[p] = value;
        if (target instanceof Array && (typeof p === 'number') || (typeof p === 'string' && !isNaN(parseInt(p)))) {
            const index = (typeof p === 'number') ? p : parseInt(p);
            context.refType.react({ [context.name]: { index, old, val, type: 'item' } });
        }
        else {
            if (context.props.hasOwnProperty(p))
                refProp = context.props[p];
            context.refType.react({ [refProp[NAME]]: { old, val, type: 'set' } });
        }
        return true;
    },
    deleteProperty(target, p) {
        let refProp;
        if (context.props.hasOwnProperty(p))
            refProp = context.props[p];
        const old = target[p];
        delete target[p];
        context.refType.react({ [refProp[NAME]]: { old, type: 'del' } });
        return true;
    },
    apply(target, thisArg, old) {
        const val = target.apply(thisArg, old);
        context.refType.react({ [context[NAME]]: { old, val, type: (val !== undefined) ? 'set' : 'del' } });
        return val;
    }
});
/**
 * Get the name of a ref.
 *
 * @param ref
 * @returns
 */
export function name(ref) {
    return ref[NAME];
}
/**
 * Get the value of a ref. Apart from property access which returns
 * other refs for method and object properties, refs largely
 * behave like their values.
 *
 *
 * @param ref
 * @returns
 */
export function value(ref) {
    return ref[VALUE];
}
export class RefType {
    init;
    elements = new Map();
    refs = {};
    /**
     * Initializes a new instance of RefType.
     *
     * @param init
     */
    constructor(init) {
        this.init = init;
    }
    /**
     * Adds the element to the RefType. This may also perform an initial `react` on the element if
     * `options?.react` is truthy.
     *
     * @param element
     * @param [o]ptions]
     */
    add(element, options) {
        this.elements.set(element, options || null);
        if (options?.react) {
            const map = new Map();
            map.set(element, options || null);
            this.react(null, map);
        }
    }
    /**
     * JS objects that track both their names and values, They simplify using the
     * objects in markup.
     *
     * @example
     *
     * @param object
     * @param name
     * @returns
     */
    ref(object, name) {
        name = (name || '').replaceAll(' ', '__');
        const result = new Proxy(object, refTrap({ name, refType: this }));
        this.refs[name] = object;
        return result;
    }
    /**
     * Traverses the element tree to process all reactive attributes that are set to the keys
     * in reactMap. The values are reaction contexts which contain properties relevant to the
     * reaction type.
     *
     * The reaction types are:
     * 1. property set (new and [old] values).
     * 2. property delete ([old] value)
     * 3.
     *
     * If no react map is given, then render is called with `this.element`
     * as the element to render. No local context `this.refs` is the global
     * scope as usual..
     *
     * @param [reactMap]
     */
    react(reactMap, elements) {
        let newElements = [], mountElement, mountOptions, currentElement, prefix, refName, reactContext, attrs, newAttrs, attr, i, attrName, attrValue, attrVal2, attrContext, val;
        let mountElements;
        let mountElementVals;
        let cachedAttrs, newMap;
        let children, template, templateName, item, hasChild;
        const cache = this.init?.cache;
        for ([refName, reactContext] of Object.entries(reactMap || { '': { type: 'set', val: {}, old: {} } })) {
            if (elements)
                mountElements = elements;
            else if (cache && cache.hasOwnProperty(refName))
                mountElements = cache[refName];
            else
                mountElements = this.elements;
            for ([mountElement, mountElementVals] of mountElements.entries()) {
                if (mountElementVals instanceof Array) {
                    [mountOptions, cachedAttrs] = mountElementVals;
                }
                else {
                    mountOptions = mountElementVals;
                    cachedAttrs = null;
                }
                newElements = [mountElement];
                while (newElements.length) {
                    // react to the element
                    currentElement = newElements.pop();
                    attrs = cachedAttrs || currentElement.attributes;
                    newAttrs = [];
                    hasChild = false;
                    for (i = 0; i < attrs.length; i++) {
                        attr = attrs[i];
                        attrName = attr.name;
                        attrValue = (refName.indexOf('[') < 0) ? this.resolve(attr.value, reactContext) : attr.value;
                        // attr
                        prefix = mountOptions.prefix?.attr || 'a-';
                        if (attrName.startsWith(prefix)) {
                            if (!refName || attrValue.startsWith(refName) || this.has(reactContext, attrValue)) {
                                if (reactContext.type === 'set') {
                                    [attrVal2, attrContext] = this.resolveContext(attrValue, refName, reactContext, 'val');
                                    val = this.get(attrVal2, attrContext);
                                    if (val === undefined)
                                        currentElement.removeAttribute(attrName.slice(prefix.length));
                                    else
                                        currentElement.setAttribute(attrName.slice(prefix.length), val);
                                }
                                else if (reactContext.type === 'del') {
                                    currentElement.removeAttribute(attrName.slice(prefix.length));
                                }
                                newAttrs.push(attr);
                            }
                        }
                        // prop
                        prefix = mountOptions.prefix?.prop || 'p-';
                        if (attrName.startsWith(prefix)) {
                            if (!refName || attrValue.startsWith(refName) || this.has(reactContext, attrValue)) {
                                if (reactContext.type === 'set') {
                                    [attrVal2, attrContext] = this.resolveContext(attrValue, refName, reactContext, 'val');
                                    val = this.get(attrVal2, attrContext);
                                    if (val === undefined)
                                        delete currentElement[attrName.slice(prefix.length)];
                                    else
                                        currentElement[attrName.slice(prefix.length)] = val;
                                }
                                else if (reactContext.type === 'del') {
                                    delete currentElement[attrName.slice(prefix.length)];
                                }
                                newAttrs.push(attr);
                            }
                        }
                        // render:
                        prefix = mountOptions.prefix?.render || 'r-';
                        if (attrName.startsWith(prefix)) {
                            if (!refName || attrValue.startsWith(refName) || this.has(reactContext, attrValue)) {
                                if (reactContext.type === 'set') { // re-render.
                                    [attrVal2, attrContext] = this.resolveContext(attrValue, refName, reactContext, 'val');
                                    val = this.get(attrVal2, attrContext);
                                    if (val === undefined)
                                        currentElement.remove();
                                    else {
                                        newMap = new Map();
                                        newMap.set(currentElement, mountOptions);
                                        this.react({ '': { type: 'set', val, old: null } }, newMap);
                                    }
                                }
                                else if (reactContext.type === 'del') {
                                    currentElement.remove();
                                }
                                newAttrs.push(attr);
                            }
                        }
                        // del (can be useful for cleanups)
                        prefix = mountOptions.prefix?.del || 'd-';
                        if (attrName.startsWith(prefix)) {
                            if (!refName || attrValue.startsWith(refName) || this.has(reactContext, attrValue)) {
                                if (reactContext.type === 'del')
                                    currentElement.remove();
                                newAttrs.push(attr);
                            }
                        }
                    }
                    // child (render iterable or respond to array events)
                    attrName = mountOptions.child || 'c-hild';
                    if (currentElement.hasAttribute(attrName)) {
                        // handle array:
                        attrValue = (refName.indexOf('[') < 0) ? this.resolve(currentElement.getAttribute(attrName), reactContext) : currentElement.getAttribute(attrName);
                        if (!refName || attrValue.startsWith(refName) || this.has(reactContext, attrValue)) {
                            hasChild = true;
                            templateName = mountOptions.template || 't-emplate';
                            if (currentElement.hasOwnProperty(templateName)) {
                                template = currentElement[templateName];
                            }
                            else {
                                if (currentElement.hasAttribute(templateName)) {
                                    template = document.querySelector(currentElement.getAttribute(templateName));
                                }
                                else
                                    template = currentElement.firstElementChild;
                                if (template instanceof HTMLTemplateElement)
                                    template = template.content;
                                currentElement[templateName] = template;
                            }
                            if (reactContext.type === 'set') {
                                // initialisation:
                                currentElement.textContent = '';
                                [attrVal2, attrContext] = this.resolveContext(attrValue, refName, reactContext, 'val');
                                children = this.get(attrVal2, attrContext);
                                if (children) {
                                    if (children instanceof Array) {
                                        this.push(currentElement, template, children);
                                    }
                                    else {
                                        for (item of children)
                                            this.push(currentElement, template, [item]);
                                    }
                                }
                            }
                            else if (reactContext.type === 'push') {
                                this.push(currentElement, template, reactContext.val);
                            }
                            else if (reactContext.type === 'pop') {
                                this.pop(currentElement, template, reactContext.old);
                            }
                            else if (reactContext.type === 'item') {
                                this.item(currentElement, template, reactContext);
                            }
                            else if (reactContext.type === 'splice') {
                                this.splice(currentElement, template, reactContext);
                            }
                        }
                    }
                    else if (!cachedAttrs) {
                        // react on children (only if we are not reacting from cache since cache already has direct entries for children):
                        newElements.push(...currentElement.children);
                    }
                    if (!cachedAttrs && refName && cache && (newAttrs.length || hasChild)) {
                        if (!cache.hasOwnProperty(refName))
                            cache[refName] = new Map();
                        if (!cache[refName].has(currentElement))
                            cache[refName].set(currentElement, [mountOptions, newAttrs]);
                    }
                    // 1. note that we may fail to 
                    // cache attrs when the resolved reference differs due to a variable in the name.
                    // in such scenarios, use direct matching to get to it: if 'refNam' contains 
                    // '[' then we defer atribute value resolution until after the value has been compared
                    // with refName. This is not doable with the IRef objects (proxies) but 
                    // can be trivially done manually, further justifying our decision to make using the 
                    // proxies with reftype optional instead of mandatory.
                    // 2. note that this does not affect array items since the whole 
                    // array is managed together and the index seen in the local context is 'live'.
                }
            }
        }
    }
    /**
     * Preprocess context and value in a way that aleviates the need to search from
     * `this.refs` for references in markup. This will boost performance.
     *
     * We take advantage of the fact that the ref matched against is already
     * available in the original context. So we swap absolut names for relative names
     * and make the already available object the new context.
     *
     * A context is used for resolving relative names (those that start
     * with `this.init.context ` or `l ` by default).
     *
     * @param attrValue
     * @param refName
     * @param reactContext
     * @param contextProp
     * @returns
     */
    resolveContext(attrValue, refName, reactContext, contextProp) {
        const contextName = this.init?.context || 'l';
        if (attrValue.startsWith(refName)) {
            let attrVal2 = contextName + ' ' + attrValue.slice(refName.length).trim();
            const reactContext2 = reactContext[contextProp];
            // we need to do late resloving here because initial resolving is skipped when refName has variables
            if (refName.indexOf('[') >= 0)
                attrVal2 = this.resolve(attrVal2, reactContext2);
            return [attrVal2, reactContext2];
        }
        else
            return [attrValue, reactContext];
    }
    /**
     * Checks whether the value refers to something within the context.
     * @param context
     * @param value
     * @returns
     */
    has(context, value) {
        const parts = value.split(' ');
        return parts.length > 1 && parts[0] === (this.init?.context || 'l') && context.hasOwnProperty(parts[1]);
    }
    /**
     * Names are not always flat space separated strings. They can be nested (that is a name can be
     * held in a ref object (variable) just like in regular JavaScript). As a result, we
     * need some indirection for getting values reffered to by a name.
     *
     * Some segments may refer to other objects. This function will
     * flatten a name out so there are no object refs left within it.
     *
     * @param name
     */
    resolve(name, context) {
        if (name.indexOf('[') < 0)
            return name; // no nested names === fast.
        const parts = name.split(' ').map(p => p.trim());
        const names = [];
        let currentName = [], newName;
        names.push(currentName);
        for (let part of parts) {
            if (part === '[') {
                newName = [];
                newName.subs = 0;
                currentName.push(newName);
                names.push(newName);
                newName.parent = currentName;
                newName.index = currentName.length - 1;
                currentName.subs += 1;
                currentName = newName;
            }
            else if (part === ']') {
                currentName = currentName.parent;
            }
            else {
                currentName.push(part);
            }
        }
        let subs = 0, i, nameArr, nameStr;
        do {
            subs = 0;
            for (i = 0; i < names.length; i++) {
                nameArr = names[i];
                if (!nameArr.subs) {
                    nameStr = this.get(nameArr.join(' '), context);
                    if (nameArr.parent) {
                        nameArr.parent[nameArr.index] = nameStr;
                        nameArr.parent.subs--;
                    }
                    else
                        return nameStr;
                }
                else
                    subs++;
            }
        } while (subs > 0);
    }
    ;
    /**
     * Get the property or nested property from the given context or
     * `this.refs`.
     *
     * @param name
     * @param [context]
     */
    get(name, context) {
        if (!context)
            context = this.refs;
        else {
            const contextName = this.init?.context;
            if (name.startsWith(contextName))
                name = name.slice(contextName.length);
        }
        if (!(name = name.trim()))
            return context;
        if (context.hasOwnProperty(name))
            return context[name];
        const parts = name.split(' ').map(p => p.trim()).filter(p => p);
        let val = context, i = 0;
        while (i < parts.length && val !== undefined)
            val = val[parts[i++]];
        return val;
    }
    ;
    /**
     * Alias for `this.react({'': context}, map<element, elementOptions>)`
     * Will also change the type of context from anything else to 'set'.
     *
     * @param element
     * @param context
     */
    render(element, context) {
        const map = new Map();
        map.set(element, this.elements.get(element) || {});
        context.type = 'set';
        return this.react({ '': context }, map);
    }
    push(element, template, vals) {
        const count = (template instanceof Element) ? 1 : template.childNodes.length;
        let index = element.childNodes.length / count, val;
        for (let val of vals) {
            const cloned = template.cloneNode(true);
            val = { val, index: index++ };
            if (cloned instanceof DocumentFragment) {
                for (let clone of cloned.children)
                    this.render(clone, val);
            }
            else
                this.render(cloned, val);
            element.appendChild(cloned);
        }
    }
    ;
    pop(element, template, old) {
        const count = (template instanceof Element) ? 1 : template.childNodes.length;
        let i;
        for (let o of old) {
            for (i = 0; i < count; i++)
                element.removeChild(element.lastChild);
        }
    }
    ;
    item(element, template, context) {
        const count = (template instanceof Element) ? 1 : template.childNodes.length;
        const startIndex = count * context.index;
        let node;
        for (let i = 0; i < count; i++) {
            node = element.childNodes[startIndex + i];
            if (node instanceof Element)
                this.render(node, context);
        }
    }
    ;
    splice(element, template, context) {
        const { index, count: deleteCount, vals } = context;
        const count = (template instanceof Element) ? 1 : template.childNodes.length;
        const startIndex = count * index;
        // 1. removals:
        if (deleteCount) {
            const endIndex = startIndex + (count * deleteCount) - 1;
            const docRange = document.createRange();
            docRange.setStartBefore(element.childNodes[startIndex]);
            docRange.setEndAfter(element.childNodes[endIndex]);
            docRange.deleteContents();
        }
        // 2. additions:
        let frag, node, i;
        const child = element.childNodes.length ? element.childNodes[startIndex] : null;
        for (let val of vals) {
            frag = template.cloneNode();
            if (child)
                element.insertBefore(frag, child);
            else
                element.appendChild(frag);
            for (i = 0; i < count; i++) {
                node = element.childNodes[startIndex + i];
                if (node instanceof Element)
                    this.render(node, { type: 'set', val, old: null });
            }
        }
    }
}
