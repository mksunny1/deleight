/**
 * Objects that select and manipulate elements when their properties or methods are accessed.
 *
 * @module
 */
const selectorHandler = {
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
 * import { Selector } from 'deleight/proxies/selector';
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
export class Selector {
    treespace;
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
            this.#proxy = new Proxy(this, selectorHandler);
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
 * import { selector } from 'deleight/proxies/selector';
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
export function selector(treespace) {
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
 * import { MemberSelector } from 'deleight/proxies/selector';
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
export class MemberSelector extends Selector {
    name;
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
 * import { member } from 'deleight/proxies/selector';
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
export function member(name, treespace) {
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
 * import { attr } from 'deleight/proxies/selector';
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
export class AttrSelector extends MemberSelector {
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
export function attr(name, treespace) {
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
export class MethodSelector extends Selector {
    name;
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
            this.#proxy = new Proxy(this, methodSelectorHandler);
        return this.#proxy;
    }
}
const methodSelectorHandler = {
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
export function method(name, treespace) {
    return new MethodSelector(name, treespace).proxy();
}
