/**
 * Objects that select and manipulate elements when their properties or
 * methods are accessed.
 *
 * @module
 */
/**
 * Returns a selection object that lazily represents an element within the `treespace` element (or document).
 * Calling [get]{@link Selector#get} returns the specified element.
 * Calling {@link Selector#set} replaces the element and calling {@link Selector#delete}
 * removes it.
 *
 * Selector instances are used as the target of the proxy object returned by {@link selector}
 *
 * @example
 * import { Selector } from 'deleight/proxy/selector';
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
export declare class Selector {
    #private;
    treespace?: Element;
    constructor(treespace?: Element);
    get(key: any): any;
    set(key: any, value: any): void;
    delete(key: any): void;
    proxy(): any;
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
 * import { selector } from 'deleight/proxy/selector';
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
export declare function selector(treespace?: Element): any;
/**
 * Returns a selection object that lazily represents a property with the name within the `treespace` element (or document).
 * Calling [get]{@link MemberSelector#get} returns the property in the specified element.
 * Calling {@link MemberSelector#set} updates the property and calling {@link MemberSelector#delete}
 * deletes it.
 *
 * MemberSelector instances are used as the target of the proxy object returned by {@link member}
 *
 * @example
 * import { MemberSelector } from 'deleight/proxy/selector';
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
export declare class MemberSelector extends Selector {
    name: string;
    constructor(name: string, treespace?: Element);
    get(key: any): any;
    set(key: any, value: any): void;
    delete(key: any): void;
}
/**
 * Returns an object that lazily represents a property with the name within the `treespace` (or document).
 * Getting properties returns the property in the specified element and setting or deleting properties
 * updates or deletes the property correspondingly.
 *
 * @example
 * import { member } from 'deleight/proxy/selector';
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
export declare function member(name: string, treespace?: Element): any;
/**
 * Returns a selection object that lazily represents an attribute with the name within the `treespace` element (or document).
 * Calling [get]{@link AttrSelector#get} returns the attribute in the specified element.
 * Calling {@link AttrSelector#set} updates the attribute and calling {@link AttrSelector#delete}
 * removes it.
 *
 * AttrSelector instances are also used as the target of the proxy object returned by {@link attr}
 *
 * @example
 * import { attr } from 'deleight/proxy/selector';
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
export declare class AttrSelector extends MemberSelector {
    get(key: any): any;
    set(key: any, value: any): void;
    delete(key: any): void;
}
/**
 * Returns an object that lazily represents an attribute with the name within the `treespace` element (or document).
 * Getting properties returns the attribute in the specified element and setting or deleting properties
 * updates or removes the attribute correspondingly.
 *
 * @example
 * import { attr } from 'deleight/proxy/selector';
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
export declare function attr(name: string, treespace?: Element): any;
/**
 * Returns a selection object that lazily represents a method with the name within the `treespace` element (or document).
 * Invoking [call]{@link AttrSelector#get} will call the corresponding method on the
 * element selected with the `key` argument.
 *
 * This is used as the target of the proxy object returned by {@link method}
 *
 * @example
 * import { MethodSelector } from 'deleight/proxy/selector';
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
export declare class MethodSelector extends Selector {
    #private;
    name: string;
    constructor(name: string, treespace?: Element);
    call(key: any, ...args: any[]): any;
    proxy(): any;
}
/**
 * Returns an object that lazily represents a method with the name within the `treespace` (or document).
 * Calling its methods calls the corresponding method in the specified element.
 *
 * @example
 * import { method } from 'deleight/proxy/selector';
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
export declare function method(name: string, treespace?: Element): any;
