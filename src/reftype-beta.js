/**
 * Exports 2 reactivity primitives and some reactivity components for use with Actribute.
 *
 */
const VALUE = Symbol('value');
/**
 * Prepares the reaction init objects for adding reactions to a reftype..
 *
 * @example
 *
 *
 * @param element
 * @param prefix
 */
export function* initFromAttr(attrs, prefix) {
    let reactOrder = 0, reactName = '', attrName;
    for (let attr of attrs) {
        if (!prefix || attr.name.startsWith(prefix)) {
            attrName = attr.name.split('-');
            if (attrName.length > 2)
                reactOrder = parseInt(attrName[2]);
            if (attrName.length > 3)
                reactName = attrName[3];
            yield { name: attrName[1], value: attr.value, reactionOrder: reactOrder, reactionName: reactName };
        }
    }
}
export class Scope {
    objects;
    constructor(...objects) {
        this.objects = objects;
    }
}
const arrayMethods = new Set(['push', 'pop', 'splice']);
function getArrayMethod(target, method, ref) {
    if (method === 'push') {
        return (...items) => {
            target.push(...items);
            ref.reftype.react(target, { type: 'push', val: items });
        };
    }
    else if (method === 'pop') {
        return (count = 1) => {
            const old = [];
            while (count-- > 0)
                old.unshift(target.pop());
            ref.reftype.react(target, { type: 'pop', old });
        };
    }
    else if (method === 'splice') {
        return (start, deleteCount, ...items) => {
            target.splice(start, ...((deleteCount !== undefined) ? [deleteCount] : []), ...items);
            const count = (deleteCount === undefined) ? target.length - start : deleteCount;
            ref.reftype.react(target, { type: 'splice', index: start, count, vals: items });
        };
    }
}
export class Ref {
    props = {};
    reftype;
    constructor(reftype) {
        this.reftype = reftype;
    }
    // previously accessed props are stored in context.
    get(target, p) {
        if (p === VALUE)
            return target;
        else if (this.props.hasOwnProperty(p))
            return this.props[p];
        if (target instanceof Array && arrayMethods.has(p)) {
            return getArrayMethod(target, p, this);
        }
        const prop = target[p];
        if (prop === undefined)
            return;
        let refProp;
        if (prop instanceof Function) {
            refProp = this.props[p] = this.reftype.ref((...args) => {
                const result = prop(...args);
                ;
                this.react(target, p, args, result);
                return result;
            });
        }
        else if (typeof prop === "object") {
            refProp = this.props[p] = this.reftype.ref(prop);
        }
        else
            refProp = this.props[p] = { [VALUE]: prop };
        // this is very useful for also mapping primitive props.
        return refProp;
    }
    ;
    set(target, p, value) {
        return this.react(target, p, target[p], target[p] = value);
    }
    ;
    deleteProperty(target, p) {
        this.set(target, p, undefined); // for reactivity deleting is the same as assigning undifined
        delete target[p];
        return true;
    }
    ;
    react(target, p, old, val) {
        let refProp;
        const told = typeof old, tval = typeof val;
        if (target instanceof Array && (typeof p === 'number') || (typeof p === 'string' && !isNaN(parseInt(p)))) {
            const index = (typeof p === 'number') ? p : parseInt(p);
            this.reftype.react(target, { index, old, val, type: 'item' });
        }
        else {
            if (this.props.hasOwnProperty(p)) {
                refProp = this.props[p];
                this.reftype.react(refProp, { old, val, type: 'set' });
            }
            if (told === 'object' || told === 'function') {
                // these could have been mapped directly since they are reference types. 
                // for them we should either map the pure object or the proxy.
                // if we map both, we will have double reactivity here. 
                this.reftype.react(refProp, { old, val, type: 'set' });
                const reactions = this.reftype.map.get(old);
                if (reactions) {
                    // bind the new prop also.
                    if (tval === 'object' || tval === 'function') {
                        this.reftype.map.set(val, reactions);
                    }
                    else {
                        this.reftype.map.set(this.props[p] = { [VALUE]: val }, reactions);
                    }
                }
            }
        }
        return true;
    }
    ;
}
;
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
/**
 * Maps JavaScript objects to reactive functions
 * that follow operations on the object. This is used internally by
 * ref objects created with it but can also be manually anywhere in our code to
 * either trigger reactivity or modify the reactive map.
 *
 * The supported reaction types are:
 * 1. set (when the object is changed (or the property it represents is set).
 *      this also includes array objects. setting to undefined doubles as delete.)
 * 2. push (when push is called on the array object)
 * 3. pop (when pop is called on the array object)
 * 4. item (when an item is set/changed/deleted in the array object.)
 * 5. splice (when splice is called on the array object)
 *
 * We map names to the final functions to enable easy manual manipulation after
 * the reactions have been created. We can use the names to easily obtain reactions
 * to change or remove.
 *
 * @example
 *
 */
export class RefType {
    /**
     * Maps objects to reactions. The reactions are placed in an array of
     * objects to enable ordering. The reactions are processed in the same order
     * in which they appear in the array.
     *
     * @example
     *
     *
     */
    map = new WeakMap();
    /**
     * A convenient method for adding reactions for objects.
     *
     * @param objects
     * @param func
     * @param attr
     */
    add(objects, types, func, init) {
        let reactionTypes, type;
        let reactions, reaction, reactionFunctions;
        const order = init?.reactionOrder || 0, name = init?.reactionName || '';
        for (let object of objects) {
            reactionTypes = this.map.get(object);
            if (!reactionTypes) {
                reactionTypes = {};
                this.map.set(object, reactionTypes);
            }
            for (type of types) {
                if (reactionTypes.hasOwnProperty(type))
                    reactions = reactionTypes[type];
                else {
                    reactions = [];
                    reactionTypes[type] = reactions;
                }
                if (reactions.length > order)
                    reaction = reactions[order];
                else {
                    reaction = {};
                    reactions[order] = reaction;
                }
                if (reaction.hasOwnProperty(name))
                    reactionFunctions = reaction[name];
                else {
                    reactionFunctions = [];
                    reaction[name] = reactionFunctions;
                }
                reactionFunctions.push(func);
            }
        }
    }
    ;
    /**
     * A function that binds objects obtainable by calling `options.src(...)` to
     * attributes on the given element. Both properties and methods can
     * be referenced from markup within the element.
     *
     * @example
     *
     *
     * @param attrs
     * @param handler
     */
    addWithAttrs(attrs, handler, reactionTypes, prefix) {
        const rAttrs = initFromAttr(attrs, prefix);
        let objects, func;
        const funcs = [];
        for (let attr of rAttrs) {
            objects = handler.getObjects?.(attr);
            funcs.push(func = handler.getReaction?.(attr));
            if (func && objects && objects.length) {
                this.add(objects, reactionTypes, func, attr);
            }
        }
        return funcs;
    }
    ;
    /**
     * The main reactivity function that invokes matching reactive functions
     * in `this.map` with the given reaction context.
     *
     * @example
     *
     *
     * @param object
     * @param contexts
     */
    react(object, ...contexts) {
        const reactionTypes = this.map.get(object);
        if (reactionTypes) {
            let reactionType, reactions, reaction, reactionFunctions, fn;
            for (let context of contexts) {
                for ([reactionType, reactions] of Object.entries(reactionTypes)) {
                    if (reactionType === context.type) {
                        for (reaction of reactions) {
                            for (reactionFunctions of Object.values(reaction)) {
                                for (fn of reactionFunctions)
                                    fn(context);
                            }
                        }
                    }
                }
            }
        }
    }
    ;
    /**
     * Returns a convenient object that automatically triggers reactions
     * in response to reactive operations.
     *
     * @example
     *
     *
     * @param object
     */
    ref(object) {
        return new Proxy(object, new Ref(this));
    }
    ;
    *renderAll(template, it, index = 0) {
        let clone, child, ctx;
        const old = null, type = 'item';
        for (let val of it) {
            clone = template.cloneNode(true);
            ctx = { type, val, old, index };
            index++;
            if (clone instanceof DocumentFragment) {
                for (child of clone.children)
                    this.render(child, ctx);
            }
            else
                this.render(clone, ctx);
            yield clone;
        }
    }
    ;
    render(element, reactContext, nested) {
        if (nested && rendered.has(element))
            return this.react(element, reactContext);
        else if (nested)
            this.react(element, reactContext);
        else {
            if (startedRender.has(element))
                return rendered.add(element);
            startedRender.add(element);
            this.react(element, reactContext);
        }
        if (!renderedChildren.has(element)) {
            renderedChildren.add(element);
            let child = element.firstElementChild;
            while (child) {
                this.render(child, reactContext, true);
                child = child.nextElementSibling;
            }
        }
        else
            renderedChildren.delete(element);
        startedRender.delete(element);
    }
    ;
    getComponent(getHandler, reactionName, reactionType, options) {
        return (element) => {
            const handler = getHandler(element);
            if (!handler.getReaction)
                handler.getReaction = getReactionFactory[reactionName](this, element, handler);
            const prefix = options?.prefix || defaults.prefix;
            let attrs, name;
            if (options.attrs) {
                attrs = [];
                for (let attr of element.attributes)
                    for (name of options.attrs)
                        if (attr.name.startsWith(prefix + name))
                            attrs.push(attr);
            }
            else
                attrs = Array.from(element.attributes);
            const funcs = this.addWithAttrs(attrs, handler, [reactionType], prefix);
            // also bind all the functions to the element so they can be triggered by render.
            for (let func of funcs)
                this.add([element], [reactionType], func);
            return funcs;
        };
    }
}
;
export function getTemplate(element) {
    let template = templates.get(element);
    if (!template) {
        if (element.children.length === 1 && element.firstElementChild instanceof HTMLTemplateElement) {
            template = element.firstElementChild.content;
        }
        else {
            template = document.createDocumentFragment();
            template.append(...element.childNodes);
            templates.set(element, template);
        }
    }
    return template;
}
export const templates = new WeakMap();
// exporting to allow template set, change or removal
export const rendered = new WeakSet();
// also exporting this to optionally add/remove elements which are treated as if 
// they contain a render (or similar) reactive attribute.
const startedRender = new WeakSet();
const renderedChildren = new WeakSet();
function getComponentFactory(reactionName, reactionType, options) {
    return (reftype, handlerFunction) => {
        return reftype.getComponent(handlerFunction, reactionName, reactionType, options);
    };
}
export const getReactionFactory = {
    /**
     *
     *
     * @example
     *
     * @param reftype
     * @param element
     * @returns
     */
    attr(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            if (val !== undefined)
                element.setAttribute(init.name, val);
            else
                element.removeAttribute(init.name);
        };
    },
    prop(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            if (val !== undefined)
                element[init.name] = val;
            else
                delete element[init.name];
        };
    },
    render(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            if (val !== undefined) {
                reftype.render(element, { val, old: null, type: 'set' });
            }
            else
                element.remove();
        };
    },
    del(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            if (val === undefined)
                element.remove();
        };
    },
    iter(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            if (val !== undefined)
                element.replaceChildren(...reftype.renderAll(getTemplate(element), val));
            else
                element.textContent = '';
        };
    },
    push(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            if (val !== undefined)
                element.append(...reftype.renderAll(getTemplate(element), val));
        };
    },
    pop(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            const template = getTemplate(element);
            let count = template instanceof DocumentFragment ? template.childNodes.length : 1;
            while (count-- > 0)
                element.removeChild(element.lastChild);
        };
    },
    item(reftype, element, handler) {
        return (init) => (ctx) => {
            const val = (ctx.val instanceof Scope) ? handler.getObjects(init, ...ctx.val.objects)[0] : ctx.val;
            const template = getTemplate(element);
            let count = template instanceof DocumentFragment ? template.childNodes.length : 1;
            if (val !== undefined) {
                let child;
                ctx = Object.assign(ctx, { val });
                for (let i = 0; i < count; i++) {
                    child = element.childNodes[ctx.index + i];
                    if (child instanceof Element)
                        reftype.render(child, ctx);
                }
            }
            else
                while (count-- > 0)
                    element.removeChild(element.childNodes[ctx.index]);
        };
    },
    splice(reftype, element, handler) {
        return (init) => (ctx) => {
            const vals = (ctx.vals instanceof Scope) ? handler.getObjects(init, ...ctx.vals.objects)[0] : ctx.vals;
            const template = getTemplate(element);
            let count = template instanceof DocumentFragment ? template.childNodes.length : 1;
            let totalCount = count * ctx.count;
            while (totalCount-- > 0)
                element.removeChild(element.childNodes[ctx.index]);
            if (vals && vals.length) {
                const newChildren = reftype.renderAll(getTemplate(element), vals, ctx.index);
                if (element.childNodes.length) {
                    const child = element.childNodes[ctx.index];
                    for (let newChild of newChildren)
                        element.insertBefore(newChild, child);
                }
                else
                    element.append(...newChildren);
            }
        };
    }
};
export const defaults = {
    prefix: 'r', attrPrefix: 'a-', propPrefix: 'p-',
    renderAttr: 'render', deleteAttr: 'del', iterAttr: 'iter',
    pushAttr: 'push', popAttr: 'pop', itemAttr: 'item', spliceAttr: 'splice'
};
/**
 * These are actually component factories
 */
export const getComponent = {
    attr: getComponentFactory('attr', 'set', { prefix: defaults.attrPrefix }),
    // apply the component returned by this to any element that has reactive attributes.
    prop: getComponentFactory('prop', 'set', { prefix: defaults.propPrefix }),
    // apply to elements with reactive properties
    render: getComponentFactory('render', 'set', { attrs: [defaults.renderAttr] }),
    // apply to element to rerender or delete it when the mapped object (prop of another object) 
    // is set or deleted
    del: getComponentFactory('del', 'set', { attrs: [defaults.deleteAttr] }),
    iter: getComponentFactory('iter', 'set', { attrs: [defaults.iterAttr] }),
    push: getComponentFactory('push', 'push', { attrs: [defaults.pushAttr] }),
    pop: getComponentFactory('pop', 'pop', { attrs: [defaults.popAttr] }),
    item: getComponentFactory('item', 'item', { attrs: [defaults.itemAttr] }),
    splice: getComponentFactory('splice', 'splice', { attrs: [defaults.spliceAttr] })
};
