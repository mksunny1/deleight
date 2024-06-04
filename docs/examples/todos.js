import { Actribute, recursive, join, props } from '../../src/actribute.js'
import { RefType, getComponent } from '../../src/reftype-beta.js'

const act = new Actribute();
const reftype = new RefType();

const todos = [];                           // pure todos
const data = reftype.ref({ todos });        // reactive todos.

const getObjects = (init, ...scopes) => props(init.value, ...scopes, data);
const getHandler = (element, attr) => ({ getObjects });
const args = [reftype, getHandler];

const iterComps = ['iter', 'push', 'item', 'splice'];    
// we aren't using `pop` here.

act.register({
    text: recursive(getComponent.text(...args)),
    attr: recursive(getComponent.attr(...args)),
    prop: recursive(getComponent.prop(...args)),
    iter: join(...iterComps.map(key => getComponent[key](...args))),
    edit(element, attr) {
        const index = parseInt(attr.value);
        const title = prompt('Enter a title');
        const description = prompt('Enter a brief description.');
        const item = { title, description, date: new Date() };
        data.todos.push(item);
    },
    del(element, attr) {
        const index = parseInt(attr.value);
        data.todos.splice(index, 1);   // this is reactive.
    },
})
