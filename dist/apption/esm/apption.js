/**
 * Wraps a function that returns a real value to work with when an action is triggered.
 * ALl actions exported by this module ({@link act}, {@link call}, {@link set}, {@link del})
 * recognise instances of this type. This removes the need to hold references to concrete
 * objects before-hand, which may be memory-inneficient.
 *
 * @example
 * import { Lazy, set } from 'apption';
 * const element = document.querySelector('ul');
 * const lazy = new Lazy((value, index) => element.children[index]);
 * set({ className: lazy }, 'color-primary', 0);
 * for (let i = 1; i < element.children.length; i++) set({ className: lazy }, '', i)
 *
 */
class Lazy {
    constructor(callable) {
        this.callable = callable;
    }
    value(...args) {
        return this.callable(...args);
    }
}
/**
 * An object returned from a function (or `Action.act` implementation) which specifies our intent to
 * replace the propagated arguments with the new arguments list it is initialized with. This allows the
 * `act` function to behave like a pipe operator if we require such. This is more limited than
 * passing the same argument list to all the functions, but may perhaps be desired for some reason.
 *
 * @example
 * import { act, Args } from 'apption'
 * let count = 0;
 * act([
 *     (a1, a2) => count += a1,
 *     (a1, a2) => new Args([a2, 0]),
 *     (a1, a2) => count += a2 + 5
 * ], 20, 21);
 * console.log(count);   // 25
 *
 */
class Args {
    constructor(value) {
        this.value = value;
    }
}
/**
 * An abstract function that can combine any set of operations.
 * Can be used in scenarios where the operations are not similar enough for the
 * other more specialised functions: {@link call}, {@link set} or {@link del}.
 *
 * The functions to call may be specified statically or generated dynamically
 * from {@link Lazy} instances. Similar arrays may be nested within the outermost one to
 * any depth.
 *
 * @example
 * import { act } from 'apption'
 * let count = 0;
 * const actions = [
 *     (a1, a2) => count += a1,
 *     (a1, a2) => count += a2,
 *     (a1, a2) => count += a2 + 1
 * ]
 * act(actions, 20, 21);
 * console.log(count);   // 63
 *
 * actions.pop();
 *
 * act(actions, 10, 20);
 * console.log(count);   // 93
 *
 * @param operations
 * @param args
 * @returns
 */
function act(operations, ...args) {
    let result;
    for (let operation of operations) {
        if (operation instanceof Lazy)
            operation = operation.value(...args);
        if (operation instanceof Array)
            result = act(operation, ...args);
        else if (operation instanceof Action)
            result = operation.act(...args);
        else
            result = operation(...args);
        if (result instanceof Args)
            args = result.value;
    }
    return result;
}
/**
 * Calls specified methods in multiple objects.
 *
 * If any array of objects (value) or object (value item) is of type {@link Lazy},
 * it is first resolved to obtain the object(s) to work with.
 *
 * @example
 * import { call } from 'apption'
 * let arr1 = [1, 2, 3], arr2 = [1, 2, 3], arr3 = [1, 2, 3];
 * const actions = { push: [arr1, arr3], unshift: [arr2] };
 * call(actions, 20, 21);
 * console.log(arr1)   // [1, 2, 3, 20, 21]
 * console.log(arr2)   // [20, 21, 1, 2, 3]
 * console.log(arr3)   // [1, 2, 3, 20, 21]
 *
 * @param map
 * @param args
 */
function call(map, ...args) {
    let result, object;
    for (let [key, objects] of Object.entries(map)) {
        if (objects instanceof Lazy)
            objects = objects.value(key, ...args);
        for (object of objects) {
            if (object instanceof Lazy)
                object = object.value(key, ...args);
            result = object[key](...args);
            if (result instanceof Args)
                args = result.value;
        }
    }
    return result;
}
/**
 * Sets specified properties in different objects.
 *
 * If any array of objects (value) or object (value item) is of type {@link Lazy}, it is first resolved to obtain the
 * object(s) to work with.
 *
 * @example
 * import { set } from 'apption'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const actions = { a: [obj1], b: [obj2], c: [obj1] };
 * set(actions, 20);
 * console.log(obj1);    // { a: 20, b: 2, c: 20}
 * console.log(obj2);    // { a: 1, b: 20, c: 3}
 *
 * @param map
 * @param value
 */
function set(map, value) {
    let object;
    for (let [key, objects] of Object.entries(map)) {
        if (objects instanceof Lazy)
            objects = objects.value(key, value);
        for (object of objects) {
            if (object instanceof Lazy)
                object = object.value(key, value);
            object[key] = value;
        }
    }
}
/**
 * Deletes specified properties from different objects.
 * If an object or array of objects is {@link Lazy}, it will be called with the key first to obtain the
 * real values to work with.
 *
 * @example
 * .import { del } from 'apption'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * del({ a: [obj1], b: [obj2], c: [obj1] });
 * console.log(obj1);    // { b: 2 }
 * console.log(obj2);    // { a: 1, c: 3}
 *
 * @param map
 */
function del(map) {
    if (map instanceof Lazy)
        map = map.value();
    let object;
    for (let [key, objects] of Object.entries(map)) {
        if (objects instanceof Lazy)
            objects = objects.value(key);
        for (object of objects) {
            if (object instanceof Lazy)
                object = object.value(key);
            delete object[key];
        }
    }
}
/**
 * A wrapper around {@link act} to store the operations array. The operartions can be an instance
 * of {@link Lazy} so that it is computed every time {@link Action#act} is called.
 *
 * @example
 * import { Action } from 'apption'
 * let count = 0;
 * const action = new Action([
 *     (a1, a2) => count += a1,
 *     (a1, a2) => count += a2,
 *     (a1, a2) => count += a2 + 1
 * ]);
 * action.act(20, 21);
 * console.log(count);   // 63
 */
class Action {
    constructor(operations) {
        this.operations = operations;
    }
    act(...args) {
        return act(this.operations instanceof Lazy ? this.operations.value(...args) : this.operations, ...args);
    }
    /**
     * The function equivalent of this action.
     * @example
     * import { CallAction } from 'apption'
     * let arr1 = [1, 2, 3], arr2 = [1, 2, 3];
     * const action = new CallAction({ push: [arr1], unshift: [arr2] }).actor;
     * action(20, 21);
     * console.log(arr1)   // [1, 2, 3, 20, 21]
     * console.log(arr2)   // [20, 21, 1, 2, 3]
     */
    get actor() {
        return this.act.bind(this);
    }
}
/**
 * Base class for actions on objects
 */
class ObjectAction {
    act(...args) {
        return;
    }
    constructor(map) {
        this.map = map;
    }
    /**
     * The function equivalent of this action.
     */
    get actor() {
        return this.act.bind(this);
    }
}
/**
 * A wrapper around {@link call} to store the map. The map can be an instance
 * of {@link Lazy} so that it is computed every time {@link CallAction#act} is called.
 *
 * @example
 * import { CallAction } from 'apption'
 * let arr1 = [1, 2, 3], arr2 = [1, 2, 3];
 * const action = new CallAction({ push: [arr1], unshift: [arr2] });
 * action.act(20, 21);
 * console.log(arr1)   // [1, 2, 3, 20, 21]
 * console.log(arr2)   // [20, 21, 1, 2, 3]
 *
 */
class CallAction extends ObjectAction {
    act(...args) {
        call(this.map instanceof Lazy ? this.map.value(...args) : this.map, ...args);
    }
}
/**
 * A wrapper around {@link set} to store the map. The map can be an instance
 * of {@link Lazy} so that it is computed every time {@link SetAction#act} is called.
 *
 * @example
 * import { SetAction } from 'apption'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const action = new SetAction({ a: [obj1], b: [obj2], c: [obj1] });
 * action.act(20);
 * console.log(obj1);    // { a: 20, b: 2, c: 20}
 * console.log(obj2);    // { a: 1, b: 20, c: 3}
 *
 */
class SetAction extends ObjectAction {
    act(value, ...args) {
        set(this.map instanceof Lazy ? this.map.value(value, ...args) : this.map, value);
    }
}
/**
 * A wrapper around {@link del} to store the map. The map can be an instance
 * of {@link Lazy} so that it is computed every time {@link DelAction#act} is called.
 *
 * @example
 * .import { DelAction } from 'apption'
 * let obj1 = { a: 1, b: 2, c: 3 }, obj2 = { a: 1, b: 2, c: 3 };
 * const action = new DelAction({ a: [obj1], b: [obj2], c: [obj1] });
 * action.act();
 * console.log(obj1);    // { b: 2 }
 * console.log(obj2);    // { a: 1, c: 3}
 */
class DelAction extends ObjectAction {
    act(...args) {
        del(this.map instanceof Lazy ? this.map.value(...args) : this.map);
    }
}

/**
 * Array types to work with {link actinn}
 *
 * @module
 */
/**
 * Wraps an array exposing the same mutation API (`push`, `pop`, `unshift`, `shift`, `splice`)
 * and adds a few extra methods namely: `set`, `move`, `swap` and `clear`.
 *
 * @example
 * import { ArrayActions, call, ChildrenActions } from 'apption';
 * const array = [];
 * const actions = new ArrayActions(array);
 * actions.push(1, 2, 3);
 * console.log(array.length);   // 3
 *
 */
class ArrayActions {
    set(index, value) {
        if (index >= this.array.length)
            return;
        this.array[index] = value;
    }
    ;
    push(...items) { return this.array.push(...items); }
    ;
    pop() { return this.array.pop(); }
    ;
    unshift(...items) { return this.array.unshift(...items); }
    ;
    shift() { return this.array.shift(); }
    ;
    splice(start, deleteCount, ...items) {
        if (start + deleteCount - 1 >= this.array.length)
            return;
        return this.array.splice(start, deleteCount, ...items);
    }
    ;
    swap(from, to) {
        if (from >= this.array.length || to >= this.array.length)
            return;
        return [this.array[from], this.array[to]] = [this.array[to], this.array[from]];
    }
    ;
    move(from, to) {
        if (from >= this.array.length || to >= this.array.length)
            return;
        return this.array.splice(to, 0, ...this.array.splice(from, 1));
    }
    ;
    clear() {
        this.array.length = 0;
    }
    ;
    constructor(array) {
        this.array = array;
    }
}
/**
 * Wraps an element exposing the same array mutation API (`push`, `pop`, `unshift`, `shift`, `splice`,
 * `set`, `move`, `swap` and `clear` for working with the element's children. This can be used together
 * with ArrayActions to, for example, keep an array and its DOM representation in sync.
 *
 * @example
 * import { ArrayActions, call, ChildrenActions } from 'apption';
 * const array = [], tbody = document.querySelector('tbody');
 * const AppChildrenActions = class extends ChildrenActions {
 *     render(item) {
 *         return (rowId.firstChild.nodeValue = item.id) && (rowlbl.firstChild.nodeValue = item.lbl) && row.cloneNode(true);
 *     } update(value = ' !!!') {
 *        for (let i = 0; i < array.length; i += 10)
 *            this.element.children[i].querySelector('a').firstChild.nodeValue = array[i].lbl += value;
 *     }
 * }, actions = [new ArrayActions(array), new AppChildrenActions(tbody)];
 * call({ swap: actions }, 1, 998);  // swap item 1 with item 998
 *
 */
class ChildrenActions {
    render(item) {
        throw new TypeError('You must implement the `render` method to use it.');
    }
    set(index, value) {
        if (index >= this.element.children.length)
            return;
        this.element.children[index].replaceWith(this.render(value));
    }
    ;
    push(...items) {
        this.element.append(...items.map(item => this.render(item)));
    }
    ;
    pop() {
        this.element.lastElementChild?.remove();
    }
    ;
    unshift(...items) {
        const firstChild = this.element.firstChild;
        if (firstChild !== null) {
            for (let item of items)
                this.element.insertBefore(this.render(item), firstChild);
        }
        else
            this.element.append(...items.map(item => this.render(item)));
    }
    ;
    shift() {
        this.element.firstElementChild?.remove();
    }
    ;
    splice(start, deleteCount, ...items) {
        if (start + deleteCount - 1 >= this.element.children.length)
            return;
        for (let i = 0; i < deleteCount; i++)
            this.element.children[start].remove();
        if (this.element.children.length > start) {
            const before = this.element.children[start];
            for (let item of items)
                this.element.insertBefore(this.render(item), before);
        }
        else {
            for (let item of items)
                this.element.appendChild(this.render(item));
        }
    }
    ;
    swap(from, to) {
        const length = this.element.children.length;
        if (from >= length || to >= length)
            return;
        [from, to] = [from, to].sort();
        let e1 = this.element.children[from];
        let e2 = this.element.children[to];
        if (from > to) {
            [e1, e2] = [e2, e1];
        }
        if (e1.nextElementSibling === e2) {
            this.element.insertBefore(e2, e1);
        }
        else {
            const sib = e1.nextElementSibling;
            this.element.insertBefore(e1, e2);
            this.element.insertBefore(e2, sib);
        }
    }
    ;
    move(from, to) {
        const length = this.element.children.length;
        if (from >= length || to >= length)
            return;
        const target = this.element.children[from];
        target.remove();
        if (this.element.children.length > to) {
            this.element.insertBefore(target, this.element.children[to]);
        }
        else
            this.element.appendChild(target);
    }
    ;
    clear() {
        this.element.textContent = '';
    }
    ;
    constructor(element) {
        this.element = element;
    }
}

/**
 * Primitives for functionally creating and manipulating objects.
 *
 * @module
 */
/**
 * Combine `keys` with corresponding items in `values` to form and return an object.
 * `values` could be `undefined` may not have items corresponding to some keys but
 * all keys must be provided.
 *
 * @example
 * import { zip } from 'apption'
 * const obj = zip(['a', 'b', 'c'], [1, 2, 3]);
 * console.log(obj)   // { a: 1, b: 2, c: 3 }
 *
 * @param keys
 * @param values
 * @returns
 */
function zip(keys, values) {
    const result = {};
    for (let i = 0; i < keys.length; i++)
        result[keys[i]] = values?.[i];
    return result;
}
/**
 * Transform the values of the input object using the mapper and return the mapped object.
 * The returned object will be the same as the input if `inPlace` is truthy.
 *
 * @example
 * import { mapValues } from 'apption'
 * const obj = mapValues({ a: 1, b: 2, c: 3 }, (k, v) => v * 3);
 * console.log(obj)   // { a: 3, b: 6, c: 9 }
 *
 * @param object
 * @param mapper
 * @param inPlace
 * @returns
 */
function mapValues(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let [key, value] of Object.entries(object))
        result[key] = mapper(key, value);
    return result;
}
/**
 * Transform the keys of the input object using the mapper and return the mapped object.
 * The returned object will be the same as the input if `inPlace` is truthy.
 *
 * @example
 * import { mapKeys } from 'apption'
 * const obj = mapKeys({ a: 1, b: 2, c: 3 }, (k, v) => `${k}1`);
 * console.log(obj)   // { a1: 1, b1: 2, c1: 3 }
 *
 * @param object
 * @param mapper
 * @param inPlace
 * @returns
 */
function mapKeys(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let [key, value] of Object.entries(object))
        result[mapper(key, value)] = value;
    return result;
}
/**
 * Transform the keys and values of the input object using the mapper and return the mapped object.
 * The returned object will be the same as the input if `inPlace` is truthy.
 *
 * @example
 * import { map } from 'apption'
 * const obj = map({ a: 1, b: 2, c: 3 }, (k, v) => `${k}1`);
 * console.log(obj)   // { a1: 3, b1: 6, c1: 9 }
 *
 * @param object
 * @param mapper
 * @param inPlace
 * @returns
 */
function map(object, mapper, inPlace) {
    const result = inPlace ? object : {};
    for (let [key, value] of Object.entries(object)) {
        [key, value] = mapper(key, value);
        result[key] = value;
    }
    return result;
}
/**
 * Reduces the input object using the reducer (and optional initial value)
 * and return the reduced value.
 *
 *
 * @example
 * import { reduce } from 'apption'
 * const r = mapValues({ a: 1, b: 2, c: 3 }, (r, k, v) => r + (v * v), 0);
 * console.log(r)   // 14
 *
 * @param object
 * @param reducer
 * @param result
 * @returns
 */
function reduce(object, reducer, result = null) {
    for (let [key, value] of Object.entries(object))
        result = reducer(result, key, value);
    return result;
}
/**
 * Performs the specified operation on all pairs of object keys and values (Object.entries()).
 *
 * @example
 * import { foreach } from 'apption'
 * let count = 0;
 * foreach({ a: 1, b: 2, c: 3 }, (k, v) => count += (v * v));
 * console.log(count)    // 14
 *
 * @param object
 * @param callable
 */
function foreach(object, callable) {
    for (let [key, value] of Object.entries(object))
        callable(key, value);
}

/**
 * Objects that select and manipulate elements when their properties or methods are accessed
 *
 * @module
 */
const selectorTrap = {
    get(target, p) {
        return target.get(p);
    },
    set(target, p, value) {
        target.set(p, value);
        return true;
    },
    deleteProperty(target, p) {
        target.delete(p);
        return true;
    }
};
/**
 * Returns a selection object that lazily represents an element within the `treespace` element (or document).
 * Calling [get]{@link Selector#get} returns the specified element.
 * Calling {@link Selector#set} replaces the element and calling {@link Selector#delete}
 * removes it.
 *
 * Selector instances are used as the target of the proxy object returned by {@link selector}
 *
 * @example
 * import { Selector } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * <main>
 *      <p>P in MAIN</p>
 * </main>
 * `;
 * const slct = new Selector(document.body);
 * console.log(slct.get('article').textContent);  // I am an article
 * console.log(slct.get('main & p').textContent);  // P in MAIN
 *
 */
class Selector {
    #proxy;
    constructor(treespace) {
        if (treespace)
            this.treespace = treespace;
    }
    get(key) {
        let element = this.treespace || document;
        if (typeof key === "number")
            return element.children[key >= 0 ? key : element.children.length + key];
        if (typeof key !== 'string')
            return; // not handled here.
        const selectors = (typeof key === 'string' && key.indexOf('&') >= 0) ? key.split('&') : [key];
        let nKey;
        for (let key of selectors) {
            key = key.trim();
            nKey = parseInt(key);
            if (isNaN(nKey)) {
                element = element.querySelector(key);
            }
            else
                element = element.children[nKey >= 0 ? nKey : element.children.length + nKey];
        }
        return element;
    }
    set(key, value) {
        const currentElement = this.get(key);
        if (currentElement) {
            if (value instanceof Array)
                currentElement.replaceWith(...value);
            else
                currentElement.replaceWith(value);
        }
    }
    delete(key) {
        const currentElement = this.get(key);
        if (currentElement)
            currentElement.remove();
    }
    proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this, selectorTrap);
        return this.#proxy;
    }
}
/**
 * Returns a proxy object that selects an element when a property is requested from it.
 * Setting a property will also replace the selected element and deleting
 * a property will remove the selected element.
 *
 * By default it uses `querySelector` for string keys and `children` for
 * number keys.
 *
 * @example
 * import { selector } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = selector(document.body);
 * console.log(slct.article.textContent);  // I am an article
 *
 *
 * @param treespace
 * @returns
 */
function selector(treespace) {
    return new Selector(treespace).proxy();
}
/**
 * Returns a selection object that lazily represents a property with the name within the `treespace` element (or document).
 * Calling [get]{@link MemberSelector#get} returns the property in the specified element.
 * Calling {@link MemberSelector#set} updates the property and calling {@link MemberSelector#delete}
 * deletes it.
 *
 * MemberSelector instances are used as the target of the proxy object returned by {@link member}
 *
 * @example
 * import { MemberSelector } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = new MemberSelector('textContent', document.body);
 * console.log(slct.get('div'));  // I am a div
 *
 */
class MemberSelector extends Selector {
    constructor(name, treespace) {
        super(treespace);
        this.name = name;
    }
    get(key) {
        return super.get(key)?.[this.name];
    }
    set(key, value) {
        super.get(key)[this.name] = value;
    }
    delete(key) {
        delete super.get(key)[this.name];
    }
}
/**
 * Returns an object that lazily represents a property with the name within the `treespace` (or document).
 * Getting properties returns the property in the specified element and setting or deleting properties
 * updates or deletes the property correspondingly.
 *
 * @example
 * import { member } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = member('textContent', document.body);
 * console.log(slct.div);  // I am a div
 *
 *
 * @param name
 * @param treespace
 * @returns
 */
function member(name, treespace) {
    return new MemberSelector(name, treespace).proxy();
}
/**
 * Returns a selection object that lazily represents an attribute with the name within the `treespace` element (or document).
 * Calling [get]{@link AttrSelector#get} returns the attribute in the specified element.
 * Calling {@link AttrSelector#set} updates the attribute and calling {@link AttrSelector#delete}
 * removes it.
 *
 * AttrSelector instances are also used as the target of the proxy object returned by {@link attr}
 *
 * @example
 * import { attr } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p class="main">I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = new AttrSelector('class', document.body);
 * console.log(slct.get('p'));  // main
 *
 */
class AttrSelector extends MemberSelector {
    get(key) {
        return Selector.prototype.get.call(this, key)?.getAttribute(this.name);
    }
    set(key, value) {
        Selector.prototype.get.call(this, key)?.setAttribute(this.name, value);
    }
    delete(key) {
        Selector.prototype.get.call(this, key)?.removeAttribute(this.name);
    }
}
/**
 * Returns an object that lazily represents an attribute with the name within the `treespace` element (or document).
 * Getting properties returns the attribute in the specified element and setting or deleting properties
 * updates or removes the attribute correspondingly.
 *
 * @example
 * import { attr } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p class="main">I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = attr('class', document.body);
 * console.log(slct.p);  // main
 *
 *
 * @param name
 * @param treespace
 * @returns
 */
function attr(name, treespace) {
    return new AttrSelector(name, treespace).proxy();
}
/**
 * Returns a selection object that lazily represents a method with the name within the `treespace` element (or document).
 * Invoking [call]{@link AttrSelector#get} will call the corresponding method on the
 * element selected with the `key` argument.
 *
 * This is used as the target of the proxy object returned by {@link method}
 *
 * @example
 * import { MethodSelector } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = new MethodSelector('remove', document.body);
 * slct.call('section');
 * console.log(document.querySelector('section'));  // null
 *
 */
class MethodSelector extends Selector {
    #proxy;
    constructor(name, treespace) {
        super(treespace);
        this.name = name;
    }
    call(key, ...args) {
        return super.get(key)?.[this.name](...args);
    }
    proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this, methodSelectorTrap);
        return this.#proxy;
    }
}
const methodSelectorTrap = {
    get(target, p) {
        return (...args) => target.call(p, ...args);
    }
};
/**
 * Returns an object that lazily represents a method with the name within the `treespace` (or document).
 * Calling its methods calls the corresponding method in the specified element.
 *
 * @example
 * import { method } from 'apption';
 * document.body.innerHTML = `
 * <div>I am a div</div>
 * <p>I am a paragraph</p>
 * <section>I am a section</section>
 * <article>I am an article</article>
 * `;
 * const slct = method('remove', document.body);
 * slct.section();
 * console.log(document.querySelector('section'));  // null
 *
 *
 * @param name
 * @param treespace
 * @returns
 */
function method(name, treespace) {
    return new MethodSelector(name, treespace).proxy();
}

/**
 * Objects that transform values before they are sent to/from objects they wrap.
 *
 * @module
 */
const transformerTrap = {
    get(transformer, p) {
        return transformer.get(p);
    },
    set(transformer, p, value) {
        transformer.set(p, value);
        return true;
    },
};
class Transformer {
    #proxy;
    constructor(object, trans) {
        this.object = object;
        this.trans = trans;
    }
    get(p) {
        const { object, trans } = this;
        const result = object[p];
        if (result instanceof Function) { // method
            return (...args) => {
                if (trans && trans.call)
                    args = trans.call(p, args);
                let iResult = result.apply(object, args);
                if (trans && trans.ret)
                    iResult = trans.ret(p, iResult);
                return iResult;
            };
        }
        return (trans && trans.get) ? trans.get(p, result) : result;
    }
    set(p, value) {
        const { object, trans } = this;
        if (trans && trans.set)
            value = trans.set(p, value);
        object[p] = value;
    }
    proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this, transformerTrap);
        return this.#proxy;
    }
}
/**
 * Creates a transformer object which wraps the given object to
 * transform values passed to/from it.
 *
 * @example
 * import { transformer } from 'apption'
 * const obj = { a: 1, b: 2 };
 * const trans = { get(val) {return val * 5} };
 * const tObj = transformer(obj, trans);
 * console.log(tObj.a);    // 5
 * console.log(tObj.b);    // 10
 *
 * @param object
 * @param trans
 * @returns
 */
function transformer(object, trans) {
    return new Transformer(object, trans).proxy();
}
const argTrap = {
    get(arg, p) {
        return arg.get(p);
    },
    set(arg, p, value) {
        arg.set(p, value);
        return true;
    },
    deleteProperty(arg, p) {
        arg.delete(p);
        return true;
    }
};
class Arg {
    #proxy;
    constructor(object, fn) {
        this.object = object;
        this.fn = fn;
    }
    get(p) {
        this.fn(this.object);
        return this.object[p];
    }
    set(p, value) {
        this.object[p] = value;
        return this.fn(this.object);
    }
    delete(p) {
        delete this.object[p];
        return this.fn(this.object);
    }
    proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this, argTrap);
        return this.#proxy;
    }
}
/**
 *
 * Returns a wrapper object which always invokes the function with the
 * input object after a property is set on or deleted from it. The function
 * will also be called before a property is retrieved from the object. This is
 * useful for more complex transformations/computations that involve properties
 * from multiple objects instead of a single one.
 *
 * @example
 * import { arg } from 'apption'
 * const obj = { a: 1, b: 2 };
 * let storedValue;
 * const fn = val => storedValue = val.a + val.b;
 * const arg = (obj, fn);
 * arg.a = 24;
 * console.log(storedValue)     // 24+2 = 26.
 * arg.b = 25;
 * console.log(storedValue)     // 24+25 = 49.
 *
 * @param object
 * @param fn
 */
function arg(object, fn) {
    return new Arg(object, fn).proxy();
}
const redirectTrap = {
    get(red, p) {
        return red.get(p);
    },
    set(red, p, value) {
        red.set(p, value);
        return true;
    },
    deleteProperty(red, p) {
        red.delete(p);
        return true;
    }
};
class Redirect {
    #proxy;
    constructor(map, remap) {
        this.map = map;
        if (remap)
            this.remap = remap;
    }
    get(p) {
        const { map, remap } = this;
        let q = (typeof p !== 'symbol') ? remap?.[p] : undefined;
        if (q === undefined)
            q = p;
        const object = map[p];
        const result = object[q];
        if (result instanceof Function) { // method
            return (...args) => result.apply(object, args);
        }
        return result;
    }
    set(p, value) {
        const { map, remap } = this;
        let q = (typeof p !== 'symbol') ? remap?.[p] : undefined;
        if (q === undefined)
            q = p;
        const object = map[p];
        object[q] = value;
    }
    delete(p) {
        const { map, remap } = this;
        let q = (typeof p !== 'symbol') ? remap?.[p] : undefined;
        if (q === undefined)
            q = p;
        const object = map[p];
        delete object[q];
    }
    proxy() {
        if (!this.#proxy)
            this.#proxy = new Proxy(this, redirectTrap);
        return this.#proxy;
    }
}
/**
 * Returns an object whose properties are drawn from multiple objects.
 *
 * The keys in `map` are the 'virtual' properties of the redirect object and
 * the values are the source objects containing the real properties.
 *
 * The optional `remap` object may be used to map virtual properties to
 * another property on the source object. Any virtual properties not in
 * `remap` will naturally have the same name in the source object.
 *
 * @example
 * import { redirect } from 'apption'
 * const obj1 = { a: 1, b: 2 };
 * const obj2 = { a: 3, b: 4 };
 * const red = redirect({ c: obj1, d: obj2 }, {c: 'a', d: 'a'});
 * console.log(red.c)     // 1
 * console.log(red.d)     // 3
 *
 * @param map
 * @param remap
 */
function redirect(map, remap) {
    return new Redirect(map, remap).proxy();
}

export { Action, Arg, Args, ArrayActions, AttrSelector, CallAction, ChildrenActions, DelAction, Lazy, MemberSelector, MethodSelector, ObjectAction, Redirect, Selector, SetAction, Transformer, act, arg, attr, call, del, foreach, map, mapKeys, mapValues, member, method, redirect, reduce, selector, set, transformer, zip };
