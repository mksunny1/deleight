/**
 * @module deleight/reftype
 * This module exports RefType and IterRefType classes which can
 * be used to refer to JavaScript objects from markup. It enables
 * the Angular-like declarative paradigm using pure, transparent and
 * explicit primitives. You are in control of everything and not a
 * framework. This will enable you to freely mix and match Reftype with
 * regular JavaScript and many other tools without fear of breaking
 * anything.
 *
 */
/**
 * Base class for all multivalue instances providing the `set`
 * implementation.
 */
export class MultiValue {
    values;
    calc;
    constructor(values, calc) {
        this.values = values;
        if (calc)
            this.calc = calc;
    }
    set(index, value) {
        this.values[index] = value;
        if (this.calc) {
            return this.calc(...this.values.filter((val, index) => (val !== '' || !(index % 2))));
        }
        else
            return this.values.join('');
    }
}
/**
 * Adds the reaction for `ref` to the map of all reactions of the
 * same type for agiven reftype.
 *
 * @param ref
 * @param element
 * @param reactions
 * @param reaction
 */
export function addRef(ref, element, reactions, reaction) {
    let map;
    let set;
    if (!(reactions.hasOwnProperty(ref))) {
        reactions[ref] = map = new Map();
    }
    else
        map = reactions[ref];
    if (!(map.has(element)))
        map.set(element, set = new Set());
    else
        set = map.get(element);
    set.add(reaction);
}
/**
 * A wrapper around a regular JS object (refs) that automatically
 * synchronises registered DOM attributes and properties with properties
 * within the wrapped object.
 *
 */
export class RefType {
    refs;
    elements;
    options;
    parent;
    attrs; // attributes to set {refpath: weakmap<element, attr}
    props; // properties to set
    multiValues;
    children;
    hidden;
    /**
     * Creates a wrapper around {@link refs} to automatically modify added elements
     * when certain actions are performed on objects within it.
     * The actions include property setting or deleting and method invocations.
     * We can also call {@link RefType#react} directly to modify some or all added
     * elements.
     *
     * Attributes on the element trees can be used to describe attributes or
     * properties to set, elements to render or remove and element children
     * to add, render or remove in response to {@link RefType#react} invocations.
     *
     * 'Render' in this context means performing all registered reactive
     * operations on all added elements (including all elements within their trees).
     *
     * The great benefit of this is the ability to perform more abstract DOM
     * manipulations from JavaScript with the aid of descriptive attributes. It
     * removes the burden to know or keep track of everything in the markup. This
     * will provide more flexibility in designing and redesigning pages.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     *
     * @param refs
     * @param options
     * @param parent
     */
    constructor(refs, options, parent) {
        this.refs = refs;
        if (options)
            this.options = options;
        if (parent)
            this.parent = parent;
    }
    /**
     * Creates a multivalue instance, used for more complex ref
     * linking.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { sep: { multivalue: '+' } };
     * const reftype = new RefType(refs, options);
     * const multiValueStr = 'venus + & + mars';
     * const calc = (...args: string[]) => args.join('');
     * const { refs, values: multivalueObject } = reftype.createMultiValue(multivalueStr, calc);
     *
     * @param value
     * @param calc
     */
    createMultiValue(value, calc) {
        const values = value.split(this.options?.sep?.multivalue || options.sep.multivalue);
        const refs = [];
        let val;
        for (let i = 0; i < values.length; i += 2) {
            val = values[i].trim();
            refs.push(val);
            values[i] = this.get(val);
        }
        return { refs, values: new MultiValue(values, calc) };
    }
    /**
     * Links refs in the value to the specified members of the element.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.addValue('venus', document.querySelector('p'), reftype.props || {}, 'textContent')
     *
     * @param value
     * @param element
     * @param reactions
     * @param memberName
     */
    addValue(value, element, reactions, memberName) {
        let calc, calcF;
        const calcSep = this.options?.sep?.calc || options.sep.calc;
        value = value.trim();
        if (value.indexOf(calcSep) >= 0) {
            [calc, value] = value.split(calcSep, 2);
            calc = calc.trim();
            calcF = this.options?.calc?.[calc] || options.calc[calc];
            if (!calcF)
                throw new TypeError(`The calculation ${calc} could not be found`);
        }
        value = value.trim();
        if (calcF || value.indexOf(this.options?.sep?.multivalue || options.sep.multivalue) >= 0) {
            const { refs, values } = this.createMultiValue(value, calcF);
            const mv = { name: memberName, values };
            let i = 0;
            for (let ref of refs) {
                addRef(ref, element, reactions, Object.assign({ index: i }, mv));
                i += 2;
            }
        }
        else {
            addRef(value, element, reactions, memberName);
        }
    }
    /**
     * Optionally add the elements that contain any directives that match the
     * requirements for this reftype. This can be called from anywhere in JavaScript code,
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     *
     * @param elements
     */
    add(...elements) {
        const attrPrefix = this.options?.suffix?.attr || options.suffix.attr;
        const propPrefix = this.options?.suffix?.prop || options.suffix.prop;
        const textAttr = this.options?.attr?.text || options.attr.text;
        const refAttr = this.options?.attr?.ref || options.attr.ref;
        const iterAttr = this.options?.attr?.iter || options.attr.iter;
        const closedAttr = this.options?.attr?.closed || options.attr.closed;
        const ctor = {
            [refAttr]: this.options?.ref || options.ref,
            [iterAttr]: this.options?.iter || options.iter
        };
        let reftype, attr, attrVal, rAttr, toContinue;
        let addIndex;
        for (let element of elements) {
            toContinue = false;
            if (!this.elements || !(this.elements.includes(element))) {
                for (rAttr of [refAttr, iterAttr]) {
                    if (element.hasAttribute(rAttr)) {
                        attrVal = element.getAttribute(rAttr);
                        if (rAttr === iterAttr && attrVal.startsWith('{') && attrVal.endsWith('}')) {
                            addIndex = true;
                            attrVal = attrVal.slice(1, -1);
                        }
                        else
                            addIndex = false;
                        if (!this.children)
                            this.children = {};
                        if (!(this.children.hasOwnProperty(attrVal))) {
                            this.children[attrVal] = reftype = new (ctor[rAttr])(this.get(attrVal), this.options, this);
                        }
                        else
                            reftype = this.children[attrVal];
                        if (addIndex && reftype instanceof IterRefType)
                            reftype.addIndex = true;
                        reftype.elements = [element];
                        reftype.add(element);
                        toContinue = true;
                        ;
                    }
                }
                if (toContinue)
                    continue;
            }
            for (attr of element.attributes) {
                if (attr.name === closedAttr)
                    continue;
                else if (attr.name === textAttr) {
                    if (!this.props)
                        this.props = {};
                    this.addValue(element.textContent, element, this.props, 'textContent');
                }
                else if (attr.name.endsWith(attrPrefix)) {
                    if (!this.attrs)
                        this.attrs = {};
                    this.addValue(attr.value, element, this.attrs, attr.name.slice(0, -attrPrefix.length));
                }
                else if (attr.name.endsWith(propPrefix)) {
                    if (!this.props)
                        this.props = {};
                    this.addValue(attr.value, element, this.props, attr.name.slice(0, -propPrefix.length));
                }
            }
            let child = element.firstElementChild;
            while (child) {
                if (!child.hasAttribute(closedAttr))
                    this.add(child);
                child = child.nextElementSibling;
            }
        }
    }
    /**
     * Removes all reactions starting with {@link ref}. This is a
     * cleanup method that is also called automatically
     * from {@link RefType#delete}.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.remove('mars')    // removes all reactions associated with mars.
     *
     * @param ref
     */
    remove(ref) {
        if (ref) {
            if (this.children)
                for (let key of Object.keys(this.children))
                    if (key.startsWith(ref)) {
                        delete this.children[key];
                    }
            if (this.attrs)
                for (let key of Object.keys(this.attrs))
                    if (key.startsWith(ref)) {
                        delete this.attrs[key];
                    }
            if (this.props)
                for (let key of Object.keys(this.props))
                    if (key.startsWith(ref)) {
                        delete this.props[key];
                    }
        }
        else {
            delete this.children;
            delete this.attrs;
            delete this.props;
        }
        return this;
    }
    /**
     * The main workhorse of this library. Calling this method modifies
     * the appropriate elements which have been added to this reftype.
     * What will be modified is typically determined by what has been
     * previously linked in {@link add} and what is passed as the {@link refs}
     * arg here.
     *
     * In the simplest case, we may call this method with no
     * args to perform all previously linked DOM actions. Supply specific
     * ref paths to limit DOM modifications to only those that are linked
     * to the refs (references) at those paths.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.react('mars')    // trigger all reactions associated with mars.
     *
     * @param refs
     * @returns
     */
    react(...refs) {
        // hide or show as necessary.
        if (this.refs === null && !this.hidden)
            return this.hide(); // please note the return. proceeding can lead to errors when getting
        else if (this.hidden && this.refs !== null)
            this.show();
        if (refs.length) { // call a subset
            let values;
            if (refs.length === 1) {
                if (typeof refs[0] === 'object') {
                    values = refs[0];
                    refs = Array.from(Object.keys(refs[0]));
                }
            }
            if (this.hidden && this.refs !== null)
                this.show(); // automatically show
            let child, key, val;
            let value, ref;
            for (ref of refs) {
                value = values ? values[ref] : this.get(ref);
                if (this.attrs) {
                    for ([key, val] of Object.entries(this.attrs)) {
                        if (key.startsWith(ref)) {
                            react(val, value, setAttr);
                        }
                    }
                }
                if (this.props) {
                    for ([key, val] of Object.entries(this.props)) {
                        if (key.startsWith(ref)) {
                            react(val, value, setProp);
                        }
                    }
                }
                if (this.children?.hasOwnProperty(ref)) {
                    child = this.children[ref];
                    if (value !== undefined) {
                        child.refs = value;
                        child.react();
                    }
                    else {
                        child.delete();
                        delete this.children[ref];
                    }
                }
                if (ref === this.options?.self || ref === options.self) {
                    if (value !== undefined)
                        this.react();
                    else
                        this.delete();
                }
            }
        }
        else { // call everything
            if (this.attrs)
                for (let [key, val] of Object.entries(this.attrs)) {
                    react(val, this.get(key), setAttr);
                }
            if (this.props)
                for (let [key, val] of Object.entries(this.props)) {
                    react(val, this.get(key), setProp);
                }
            if (this.children) {
                for (let [key, child] of Object.entries(this.children)) {
                    child.refs = this.get(key);
                    child.react();
                }
            }
        }
        return this;
    }
    /**
     * Sets the properties on the wrapped object and calls {@link RefType#react}
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.set({ mars: 'Our dream planet.'})    // reactively sets the value of mars.
     *
     * @param refs
     */
    set(refs) {
        let dest;
        for (let [ref, value] of Object.entries(refs)) {
            dest = this.destructure(ref);
            dest.parent[dest.prop] = value;
        }
        this.react(refs);
        return this;
    }
    /**
     * Delete the value pointed to by {@link ref} and triggers any linked
     * reactions.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.delete('mars')
     * // Removes mars from refs, reftype and everywhere it is referenced
     * // within document.body
     *
     * @param ref
     * @returns
     */
    delete(ref) {
        if (ref === undefined) {
            if (this.elements) {
                for (let element of this.elements)
                    element.remove();
            }
        }
        else {
            // delete in main object
            const prop = this.destructure(ref);
            delete prop.parent[prop.prop];
            // react
            if (this.children?.hasOwnProperty(ref))
                this.children[ref].delete();
            else
                this.react({ [ref]: undefined });
        }
        // cleanup after itself
        return this.remove(ref);
    }
    /**
     * Invokes the method pointed to by {@link ref} with the given
     * {@link args} and triggers any linked reactions on this reftype.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: (x) => x * 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * reftype.call('mars', 20)
     * // Invokes refs.mars to calculate 20 * 4 = 80 and assigns this value to
     * // all attributes and properties within document.body that refer to mars.
     *
     * @param ref
     * @param args
     * @returns
     */
    call(ref, ...args) {
        const prop = this.destructure(ref);
        const value = prop.parent[prop.prop](...args);
        this.react({ [ref]: value });
        return value;
    }
    /**
     * Returns an object containing the ref parent object (`.parent`) and
     * its property (`.prop`) in the object.
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * const dest = reftype.destructure('mars')    // { parent: refs, prop: 'mars' }
     *
     * @param ref
     *
     */
    destructure(ref) {
        if (typeof ref !== 'string' || !ref.trim())
            return null;
        if ((ref === this.options?.self) || (ref === options.self)) {
            return { parent: this, prop: 'refs' };
        }
        const path = ref.split(this.options?.sep?.ref || options.sep.ref);
        let val = this.refs, parent = this.parent, prop = path[0], propVal = val[prop];
        while (propVal === undefined && parent) {
            val = parent.refs;
            propVal = val[prop];
            parent = parent.parent;
        }
        if (propVal !== undefined) {
            for (let i = 1; i < path.length; i++) {
                val = propVal;
                prop = path[i];
                propVal = val[prop];
                if (propVal === undefined)
                    break;
            }
        }
        return { parent: val, prop };
    }
    /**
     * Returns the value pointed to by {@link ref} within {@link RefType#refs}
     *
     * @example
     * import { RefType } from "deleight/reftype";
     * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
     * const reftype = new RefType(refs, options);
     * reftype.add(document.body)
     * const marsValue = reftype.get('mars')    // 4
     *
     * @param ref
     *
     */
    get(ref) {
        if (typeof ref !== 'string' || !ref.trim())
            return '';
        if ((ref === this.options?.self) || (ref === options.self))
            return this.refs;
        const prop = this.destructure(ref);
        if (!prop)
            return;
        const result = prop.parent[prop.prop];
        if (result !== undefined)
            return result;
    }
    /**
     * Hides any elements this reftype is mounted on. That is all
     * elements in {@link RefType#elements}. This is called automatically
     * when {@link RefType#refs} is reactively set to `null` from {@link RefType#parent}.
     *
     * This works by setting the display property of the element styles
     * to `none`.
     *
     */
    hide() {
        this.hidden = new Map();
        let element;
        for (element of this.elements) {
            this.hidden.set(element, element.style.display);
            element.style.display = 'none';
        }
    }
    /**
     * The reverse of {@link RefType#hide}. This restores the display
     * property of all elements in {@link RefType#elements} to their original
     * values. It is also called internally when {@link RefType#refs} is
     * set to anything other than `null` or `undefined` in {@link RefType#parent}.
     *
     */
    show() {
        if (!this.hidden)
            return;
        for (let [element, display] of this.hidden.entries()) {
            element.style.display = display;
        }
        delete this.hidden;
    }
}
/**
 * Updates specified attributes and properties of the given elements with
 * the given value. The value will be set directly on the members if just
 * the member name is given in the set (a string). If instead an
 * IMultiValueMember object is used, the value is first used to call the
 * `set` method on its multivalue instance to update the instance and get
 * back the value to be set directly on the member.
 *
 * @example
 * import { RefType } from "deleight/reftype";
 * const refs = { mercury: 1, venus: 2, earch: 3, mars: 4 }, options = { };
 * const reftype = new RefType(refs, options);
 * reftype.add(document.body)
 * react(reftype.attrs['mars'], 28, setAttr)
 * // traverses all reactions in the first arg to find all element attributes
 * // that refence `mars` and set 28 as their new values.
 *
 * @param map A map of Element to the set of members to update.
 * @param value The new value to set on the elements
 * @param reaction The function to implement the updates; normally setAttr or setProp.
 */
export function react(map, value, reaction) {
    let member;
    for (let [element, members] of map.entries()) {
        for (member of members) {
            if (typeof member === 'string')
                reaction(element, member, value);
            else {
                reaction(element, member.name, member.values.set(member.index, value));
            }
        }
    }
}
/**
 * Sets the specified attribute to the specified value if the value is
 * defined; otherwise remove the attribute.
 *
 * @example
 * import { setAttr } from 'deleight/reftype'
 * setAttr(document.querySelector('h1'), 'class', 'dance');
 *
 * @param element
 * @param member
 * @param value
 */
export function setAttr(element, member, value) {
    if (value !== undefined)
        element.setAttribute(member, value);
    else
        element.removeAttribute(member);
}
/**
 * Sets the specified property to the specified value if the value.
 * Additionally if the new value is undefined, deletes the property
 * from the element.
 *
 * @example
 * import { setProp } from 'deleight/reftype'
 * setProp(document.querySelector('h1'), 'textContent', 'Deleight');
 *
 * @param element
 * @param member
 * @param value
 */
export function setProp(element, member, value) {
    element[member] = value;
    if (value === undefined)
        delete element[member];
}
/**
 * A specialisation of `RefType` to support array methods and semantics.
 * The `ref` object wrapped by IterRefType should be an iterable. Any iterable
 * can be used for 'single-pass' scenarios where we just want to render a list
 * into the DOM.
 *
 * If the iterable will be modified later, use an array or an
 * iterable  with the same API (`push`, `pop`, set property  and `splice`).
 * This wrapper exposes similar methods for performing reactive modifications on
 * the iterable.
 *
 * @extends RefType
 */
export class IterRefType extends RefType {
    /**
     * Map of linked elements to the arrays of item reftypes created
     * for them.
     */
    items;
    /**
     * When this is `true`, all the items will be wrapped with an
     * object containing both the item and its index in the created
     * item reftypes for each item. Also the indices will be reactive.
     * This can help in cases where the index forms part of the display
     * but is less performant and memory-efficient.
     *
     * To specify `addIndex` in markup, wrap the ref path with `{}`, as in
     * `<span>ite-r="{refPath}">item.prop</span>`
     *
     */
    addIndex;
    /**
     * Map of linked elements to the templates created for them.
     */
    templates;
    /**
     * Returns the template associated with this reftype. If the template
     * has neet been created yet or {@link replace} is truthy, the template
     * will be created from the content of the last element in
     * {@link IterRefType#elements}.
     *
     * This method is called when adding an element. The template will be
     * rendered with all the items in the array wrapped by this instance.
     *
     * For each rendered item a new {@link RefType} will be created with a
     * `refs` property holding both the item value and the item
     * index (`refs = { index, item }`). As a result, we can refer to the
     * item value and index within the template just like with any object
     * wrapped with RefType.
     *
     * Specify a template declaratively by placing it inside the
     * element, either directly or within a template element. We can also
     * programmatically set (or change) a template on an {@link IterRefType}.
     * or a subclass.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * const template = iterReftype.getTemplate(document.querySelector('ul'), true)
     * // this is part of what will happen if we instead did:
     * // iterReftype.add(document.querySelector('ul'))
     * // which will get the template and render it with all the items in
     * // iterRefType.refs immediately.
     *
     * @param element
     * @param [replace]
     * @returns
     */
    getTemplate(element, replace) {
        if (!this.templates)
            this.templates = new WeakMap();
        let template = this.templates.get(element);
        if (!template || replace) {
            if (element.children.length === 1) {
                if (element.firstElementChild instanceof HTMLTemplateElement) {
                    template = element.firstElementChild.content;
                }
                else
                    template = element.firstElementChild;
            }
            else {
                template = document.createDocumentFragment();
                template.append(...element.childNodes);
            }
            this.templates.set(element, template);
        }
        return template;
    }
    /**
     * Obtains and renders the template for all the added items.
     * We can use this to render multiple elements with the iterable
     * items at the same time.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     *
     * @param elements
     * @returns
     */
    add(...elements) {
        if (!this.elements)
            this.elements = [];
        if (!this.items)
            this.items = new WeakMap();
        for (let element of elements) {
            this.elements.push(element);
            this.items.set(element, []); // element children.
            this.getTemplate(element, true);
        }
        this.reactOn(...elements);
        return this;
    }
    /**
     * Not recommended to be called directly. Calling for individual
     * items is unlikely to work while calling for the whole array
     * (that is without args) will work but it will be more inefficient in
     * all but cases where the array has changed substancially
     * 'from outside'.
     *
     * It is better to call the 'array-like' methods (push, pop, splice
     * and set).
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * refs.reverse();
     * iterRefType.react();
     *
     * @param refs
     * @returns
     */
    react(...refs) {
        // hide or show as necessary.
        if (this.refs === null && !this.hidden)
            return this.hide(); // please note the return. proceeding can lead to errors when getting
        else if (this.hidden && this.refs !== null)
            this.show();
        if (!this.items)
            this.items = new WeakMap();
        if (refs.length) { // setting an item:
            let child;
            let values, value;
            if (refs.length === 1 && typeof refs[0] === 'object') {
                values = refs[0];
                refs = Array.from(Object.keys(values));
            }
            let element, children;
            for (let key of refs) {
                value = values ? values[key] : this.get(key);
                if (key === this.options?.self || key === options.self) {
                    this.refs = value;
                    this.react();
                    continue;
                }
                for (element of this.elements) {
                    children = this.items.get(element);
                    if (children.hasOwnProperty(key)) {
                        child = children[key];
                        if (this.addIndex) {
                            child.refs = { item: value, index: (typeof key === 'number') ? key : parseInt(key) };
                        }
                        else {
                            child.refs = value;
                        }
                        child.react();
                    }
                }
            }
        }
        else { // rebuilding everything:
            let element;
            this.items = new WeakMap();
            this.remove();
            for (element of this.elements) {
                element.textContent = '';
                this.items.set(element, []);
            }
            for (let item of this.refs) {
                for (element of this.elements) {
                    this.addChild(element, item);
                }
            }
        }
        return this;
    }
    /**
     * Reeacts on only the specified elements. This is useful when
     * adding new elements to avoid wasteful reactions on existing
     * elements.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * refs.reverse();
     * iterRefType.reactOn(iterRefType.elements.at(-1));
     *
     * @param elements
     */
    reactOn(...elements) {
        // hide or show as necessary.
        if (this.refs === null && !this.hidden)
            return this.hide(); // please note the return. proceeding can lead to errors when getting
        else if (this.hidden && this.refs !== null)
            this.show();
        let element;
        if (!this.items)
            this.items = new WeakMap();
        for (element of elements) {
            element.textContent = '';
            this.items.set(element, []);
        }
        for (let item of this.refs) {
            for (element of elements) {
                this.addChild(element, item);
            }
        }
    }
    /**
     * Creates a new reftype for an item.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * const child = iterRefType.createChild(iterRefType.elements.at(-1), 0, {name: 'unknown'});
     *
     * @param element
     * @param index
     * @param item
     */
    createChild(element, index, item) {
        const child = new (this.options?.item || options.item)(this.addIndex ? { index, item } : item, this.options, this);
        const template = this.templates.get(element);
        if (template instanceof Element) {
            const clone = template.cloneNode(true);
            child.elements = [clone];
            child.add(clone);
        }
        else if (template instanceof DocumentFragment) {
            child.elements = Array.from(template.cloneNode(true).children);
            child.add(...child.elements);
        }
        child.react();
        return child;
    }
    /**
     * Renders and adds a new item at the given index or otherwise the
     * end of the list.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterRefType.addChild(iterRefType.elements.at(-1), {name: 'unknown'});
     *
     * @param element
     * @param item
     * @param beforeIndex
     */
    addChild(element, item, beforeIndex) {
        const elementChildren = this.items.get(element);
        const child = this.createChild(element, elementChildren.length, item);
        const before = (beforeIndex !== undefined && element.children.length > beforeIndex) ? element.children[beforeIndex] : null;
        if (before) {
            for (let childElement of child.elements)
                element.insertBefore(childElement, before);
        }
        else
            element.append(...child.elements);
        elementChildren.push(child);
    }
    /**
     * Reactively adds new items to the wrapped array.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.push({jupiter: 5}, {saturn: 6})  // push like a normal array
     *
     * @param items
     */
    push(...items) {
        let result;
        if (this.refs.push)
            result = this.refs.push(...items);
        let element;
        for (let item of items) {
            for (element of this.elements)
                this.addChild(element, item);
        }
        return result;
    }
    /**
     * Reactively pops the wrapped array.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.pop()  // pop like a normal array
     *
     */
    pop() {
        let result;
        if (this.refs.pop)
            result = this.refs.pop();
        let children;
        for (let element of this.elements) {
            children = this.items.get(element);
            children.at(-1).delete();
            children.pop();
        }
        return result;
    }
    /**
     * Reactively splices the wrapped array.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.splice(1, 2)  // splice like a normal array
     *
     * @param start
     * @param deleteCount
     * @param items
     */
    splice(start, deleteCount, ...items) {
        let result;
        if (this.refs.splice)
            result = this.refs.splice(start, deleteCount, ...items);
        for (let element of this.elements) {
            const children = this.items.get(element);
            const newChildren = items.map((item, index) => this.createChild(element, start + index, item));
            for (let i = 0; i < deleteCount; i++)
                children[start + i].delete();
            children.splice(start, deleteCount, ...newChildren);
            if (this.addIndex) {
                // we need to update indices:
                for (let i = start; i < children.length; i++) {
                    children[i].set({ index: i + items.length });
                }
            }
            let childElement;
            const template = this.templates.get(element);
            const count = (template instanceof DocumentFragment) ? template.children.length : 1;
            const index = count * start;
            if (element.children.length > index) {
                const before = element.children[index];
                for (let child of newChildren) {
                    for (childElement of child.elements) {
                        element.insertBefore(childElement, before);
                    }
                }
            }
            else {
                for (let child of newChildren) {
                    element.append(...child.elements);
                }
            }
        }
        return result;
    }
    /**
     * Supports structural changes in the array which do not
     * involve setting new values. We instead move array items along
     * with their linked elements to new positions.
     *
     * The function operates in two modes:
     * 1. `!swap`: move the item at {@link i1} to the {@link i2},
     * shifting the other items appropriately..
     *
     * 3. `swap`: swaps the items at {@link i1} and {@link i2}.
     * nothing is shifted.
     *
     * In both cases item indices will be updated to reflect their
     * new positions if {@link IterRefType#addIndex} is `true`.
     *
     * @example
     *
     *
     * @param i1
     * @param i2
     * @param swap
     */
    move(i1, i2, swap) {
        if (i1 === i2)
            return; // nothing to do here.
        const what = { [i1]: i2 };
        if (swap)
            what[i2] = i1;
        let children;
        let i;
        let c1;
        const refs = this.refs.slice();
        let sources, anchors, childElement, parent, anchor;
        let counter = 0, val, child;
        for (let element of this.elements) {
            counter++;
            children = this.items.get(element);
            sources = {};
            for (val of Object.keys(what)) {
                sources[val] = children[val];
            }
            anchors = {};
            for (val of Object.values(what)) {
                child = children[val];
                anchors[val] = child.elements.at(-1).nextSibling || [child.elements[0].parentNode];
            }
            for ([i1, i2] of Object.entries(what)) {
                if (typeof i1 === 'string')
                    i1 = parseInt(i1);
                c1 = sources[i1];
                // move elements:
                anchor = anchors[i2];
                if (anchor instanceof Array) {
                    parent = anchor[0];
                    for (childElement of c1.elements) {
                        parent.appendChild(childElement);
                    }
                }
                else {
                    parent = anchor.parentNode;
                    for (childElement of c1.elements) {
                        parent.insertBefore(childElement, anchor);
                    }
                }
                if (!swap) {
                    if (this.addIndex) {
                        if (i1 > i2) {
                            for (i = i2; i < i1; i++) {
                                children[i].set({ index: i + 1 });
                            }
                        }
                        else {
                            for (i = i1 + 1; i <= i2; i++) {
                                children[i].set({ index: i - 1 });
                            }
                        }
                    }
                    if (counter === 1)
                        this.refs.splice(i2, 0, ...this.refs.splice(i1, 1));
                    children.splice(i2, 0, ...children.splice(i1, 1));
                }
                else {
                    if (counter === 1)
                        this.refs[i2] = refs[i1];
                    children[i2] = c1;
                }
                if (this.addIndex)
                    c1.set({ index: i2 });
            }
        }
        return this;
    }
    /**
     * Calls splice on the {@link IterRefType#refs} to ensure it behaves the
     * same way as the bound view which removes the DOM tree rendered
     * for the deleted item. This is unlike normal deleting of array
     * items which create 'holes' in them.
     *
     * @example
     * import { IterRefType } from "deleight/reftype";
     * const refs = [{ mercury: 1}, {venus: 2}, {earch: 3}, {mars: 4 }], options = { };
     * const iterReftype = new IterRefType(refs, options);
     * iterReftype.add(...document.querySelectorAll('ul'));
     * iterReftype.delete(3)  // delete last item
     * iterReftype.delete()   // delete everything
     *
     * @param ref
     * @returns
     */
    delete(ref) {
        if (ref === undefined) {
            this.refs.length = 0;
            if (this.elements) {
                for (let element of this.elements)
                    element.remove();
                delete this.elements;
            }
            delete this.templates;
            delete this.items;
            return this.remove();
        }
        else
            this.splice((typeof ref === 'string') ? parseInt(ref) : ref, 1);
    }
}
/**
 * Global options.
 */
export const options = {
    suffix: {
        /**
         * Attributes with names ending with this create reactive attributes
         */
        attr: '-a',
        /**
         * Attributes with names ending with this create reactive properties
         */
        prop: '-p'
    },
    attr: {
        /**
         * The textContent property is reactive when this attribute is present.
         */
        text: 't',
        /**
         * This attribute points to a 'local scope' ref(erence) within the element. When
         * the ref is deleted or set to undefined, the element will be removed from
         * its parent.
         *
         * If the ref is set to null, the display property of the
         * element style is set to 'none' and reactivity is suspended until the
         * ref is reactively changed to something more meaningful. Then the display
         * property is restored and reactivity resumes on the element.
         *
         */
        ref: 're-f',
        /**
         * This attribute points to an array whose items will be used to render
         * the children of the element using the provided template. The initial content
         * (innerHTML) of the element is deemed the template. It may be placed directly
         * of put inside a template element.
         */
        iter: 'ite-r',
        /**
         * Similar to closed attr in actributes. When placed on an element,
         * adding an ancestor element to a reftype will not also add the
         * element and those within its tree to the reftype. You must add
         * the element directly to a reftype to set up reactivity within
         * its tree.
         */
        closed: 'close-d'
    },
    sep: {
        /**
         * The string used to separate the property names that lead from
         * the `refs` object wrapped by a reftype to a ref within it.
         *
         * @example
         *
         */
        ref: '.',
        /**
         * The string used to separate individual items in multivalue attributes
         * or props. refs and lierals are assumed to appear alternately in such
         * values, starting with ref.Therefore to have consecutive refs, we need
         * to provide the string twice (this is simply creating an empty string literal
         * between them).
         *
         * @example
         *
         */
        multivalue: '|',
        /**
         * Place between the name of a calculation and the refs/multivalues
         * in an attribute to run the calculation over the multivalue or ref
         * before setting the element member (instead of simply joining the
         * values).
         */
        calc: ':='
    },
    /**
     * Add globally relevant calculation functions here.
     */
    calc: {
        add(...args) {
            let sum = 0;
            for (let arg of args) {
                if (typeof arg === 'string')
                    arg = ((arg.indexOf('.') >= 0) ? parseFloat : parseInt)(arg.trim());
                sum += arg;
            }
            return sum;
        }
    },
    ref: RefType,
    iter: IterRefType,
    item: RefType,
    /**
     * The value of the ref that poins directly to the wrapped object.
     * It must not be an empty string which has a special purpose in
     * calculations.
     */
    self: '.'
};
