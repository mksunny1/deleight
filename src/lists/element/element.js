/**
 * An object which represents the `children` of an element as a list.
 * A list has a an array-like mutation API with a few extra methods.
 *
 * @example
 * import { ArrayList } from 'deleight/lists/array';
 * import { ElementList } from 'deleight/lists/element';
 * const array = [], tbody = document.querySelector('tbody');
 * const TBodyElementList = class extends ElementList {
 *     render(item) {
 *         const el = document.createElement('p');
 *         el.textContent = item;
 *     }
 * }, lists = [new ArrayList(array), new TBodyElementList(tbody)];
 * for (let list of lists) list.push(1, 2, 3, 4, 5);
 */
export class ElementList {
    constructor(element, count = 1, renderer) {
        this.element = element;
        this.count = count;
        if (renderer)
            this.renderer = renderer;
    }
    get length() {
        return this.element.children.length / this.count;
    }
    *get(index) {
        if (index < 0)
            index = this.length + index;
        index = index * this.count;
        for (let i = 0; i < this.count; i++)
            yield this.element.children[index + i];
    }
    set(index, value) {
        index = index * this.count;
        if (index >= this.element.children.length)
            return false;
        if (!(value instanceof Node))
            value = this.render(value);
        for (let i = 1; i < this.count; i++) {
            this.element.children[index + 1].remove();
        }
        if (Reflect.has(value, Symbol.iterator)) {
            this.element.children[index].replaceWith(...value);
        }
        else {
            this.element.children[index].replaceWith(value);
        }
        return value;
    }
    ;
    render(item) {
        if (!this.renderer)
            throw new TypeError('You must implement the `render` method to use it.');
        return this.renderer(item, this);
    }
    push(...items) {
        this.element.append(...items.map(item => this.render(item)));
        return this.length;
    }
    ;
    pop() {
        const index = this.element.children.length - this.count;
        let el = this.element.children[index], el2;
        const result = [];
        while (el) {
            el2 = el.nextElementSibling;
            el.remove();
            result.push(el);
            el = el2;
        }
        return result;
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
        return this.length;
    }
    ;
    shift() {
        const result = [];
        let el = this.element.firstElementChild, el2;
        ;
        for (let i = 0; i < this.count; i++) {
            if (!el)
                return;
            else {
                el2 = el.nextElementSibling;
                el.remove();
                result.push(el);
                el = el2;
            }
        }
        return result;
    }
    ;
    splice(start, deleteCount, ...items) {
        start = start * this.count;
        deleteCount = deleteCount * this.count;
        if (deleteCount === undefined)
            deleteCount = this.element.children.length - start;
        if (start + deleteCount - 1 >= this.element.children.length)
            return;
        let el;
        const result = [];
        for (let i = 0; i < deleteCount; i++) {
            el = this.element.children[start];
            el.remove();
            result.push(el);
        }
        if (this.element.children.length > start) {
            const before = this.element.children[start];
            for (let item of items)
                this.element.insertBefore(this.render(item), before);
        }
        else {
            for (let item of items)
                this.element.appendChild(this.render(item));
        }
        return result;
    }
    ;
    swap(from, to) {
        const length = this.element.children.length;
        if (from >= length || to >= length)
            return;
        const from1 = from * this.count, to1 = to * this.count;
        for (let i = 0; i < this.count; i++) {
            [from, to] = [from1 + i, to1 + i].sort();
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
    }
    ;
    move(from, to) {
        const length = this.length;
        if (from >= length || to >= length)
            return;
        from *= this.count, to *= this.count;
        const movers = [];
        let el = this.element.children[from], el2;
        for (let i = 0; i < this.count; i++) {
            if (!el)
                break;
            movers.push(el);
            el2 = el.nextElementSibling;
            el.remove();
            el = el2;
        }
        if (this.element.children.length > to) {
            const target = this.element.children[to];
            for (let mover of movers) {
                this.element.insertBefore(mover, target);
            }
        }
        else {
            this.element.append(...movers);
        }
    }
    ;
    clear() {
        this.element.textContent = '';
    }
    ;
    *[Symbol.iterator]() {
        for (let element of this.element.children)
            yield element;
    }
}
/**
 * Please note that results are flat, so the number of items
 * returned by an element list with a count of 2 during iteration will
 * be double that returned by, say, an array with the same 'length'. The
 * same thing applies for {@link ElementList#splice}.
 */
