# Deleight

![Logo](https://github.com/mksunny1/deleight/blob/main/docs/assets/logos/small.png?raw=true)

This is now a group of 10 independent libraies that simplify web frontend development in vanilla HTML, CSS and JavasSript. Deleight aims to make frontend development more enjoyable for everyone.

Apart from this brief guide and the [documentation](https://mksunny1.github.io/deleight-api-docs/main), there are also some examples which can be used to understand how the parts fit together and to develop a feel for using deleight. To play with the exmples, you can run the included server with `npm start` and visit http://localhost:8000/docs/examples/index.html. The demos are also hosted online [here](https://mksunny1.github.io/deleight/docs/examples).

What follows is a brief description of the currently included libraries and how to include them in your projects. A list of removed libraries is also given for those who like them. 


## Removed libraries

The following libraies been removed from `deleight` at different times. They do not align fully with the main ideas of this project. The main goal here is to minimize complexity and make it easier to write flexible, succinct and efficient code. We want all the libraries to be independent and very close to bare-metal. 

The removed libraries are retained in their own packages for those who might be interested in pursuing their development.

- [Class-action](https://github.com/mksunny1/class-action)
- [Action-object](https://github.com/mksunny1/action-object)
- [Element-action](https://github.com/mksunny1/element-action)
- [Reftype](https://github.com/mksunny1/reftype) 

## Current Libraries

These are the current libraries bundled together in `deleight`. All ten libraries have no dependencies and you can import each into your projects on their own using code like: `import { [primitive] } from 'deleight/[library]'`.

### Apption

Apption is a simple and pragmatic library for composing clean, efficient and succinct frontend applications. It exports several primitives for performing common actions in a typical web application. Further details can be found within its repository at https://github.com/mksunny1/apption. It consolidates some of the most useful patterns discovered from developing and using earlier libraries and from writing a lot of JavaScript code.

```js
import { call, ArrayActions, ChildrenActions } from 'deleight/apption';

const array = [];
const tbody = document.querySelector('tbody'), row = document.querySelector('template').content.firstElementChild;
const rowId = row.querySelector('td'), rowlbl = row.querySelector('a');

const AppChildrenActions = class extends ChildrenActions {
    render(item) {
        rowId.firstChild.nodeValue = item.id;
        rowlbl.firstChild.nodeValue = item.lbl;
        return row.cloneNode(true);
    } 
}, actions = [new ArrayActions(array), new AppChildrenActions(tbody)];

call({ push: actions }, { id: 1, lbl: 'First item' }, { id: 2, lbl: 'Second item' } );
```

[More about *apption*](https://github.com/mksunny1/apption)


### Actribute

*Actribute* is a versatile library for associating element attributes with JavaScript code. In one instance it can be used as a more widely supported, flexible and powerful alternative to extending built-in HTML elements, exposing a similar API. In another, it can be used to establish conventions for manipulating the DOM. The library also has some notable enhancements including the ability to join or recurse components.

```js
 import { Actribute, props } from 'deleight/actribute';
 // initialize:
 const fallbackProps = {
    prop1: 'Fallback', prop4: 'Last resort', 
    sig: '$2b$20$o7DWuroOjbA/4LDWIstjueW9Hi6unv4fI0xAit7UQfLw/PI8iPl1y'
 };
 const act = new Actribute();
 
 // register components:
 const comp1 = (element, attr, ...context) => element.textContent = props(attr.value, context)[0]);
 const comp2 = (element, attr) => element.style.left = attr.value;
act.register({ comp1, comp2 })
```

```html
 <section c-comp1="prop1"  c-comp2="100px" >
    First section
 </section>
```

```js 
 // process components:
 act.process({el: document.body, ctx: [{prop1: 2, prop3: 2}, fallbackProps]});
 
 // unregister a component:
 delete act.registry.comp2;
```

[API docs for *actribute*](https://mksunny1.github.io/deleight-api-docs/main/modules/actribute.html)


### Appliance

*Appliance* provides a declarative API for manipulating the DOM and for structuring code in JavaScript. It can be used to attach behavior to HTML elements easily and efficiently. It is like custom elements without the DOM building aspects. Here the elements may already exist in the DOM. This can produce big gains in accessibility and flexibility as DOM can be built server-side or client-side using any technology of choice. This can also increase efficiency because all the elements can be set up in one call.

```js
import { apply } from 'deleight/appliance'
import { call } from 'deleight/apption'
import { click, actions } from './my-app-actions.js'

function(parentElement, item) {
    apply({
        "header": (...headers) => headers[item.index].textContent = item.title,
        "p": (...paras) => paras[item.index].textContent = item.description,
        ".cta": click(() => call({ update: actions })), "#clear": click(() => call({ clear: actions })),
        "footer > button": click(() => call({ swap: actions }, 1, 998))
    }, parentElement);
}
```

[API docs for *appliance*](https://mksunny1.github.io/deleight-api-docs/main/modules/appliance.html)


### Queryoperator

This provides a painless SQLesque API for manipulating the DOM. The library exports `insert`, `set`, `update` and `remove` functions for bulk manipulation of things on the DOM. It is an efficient, consistent and simple API to use. See the examples and the API docs.

```js
import { set } from 'deleight/queryoperator'
import { range } from 'deleight/generational'

// set the text content of all selected div elements to its position in the array. We can set as many properties or attributes as we want at once.
function(componentElement) {
    const links = componentElement.querySelectorAll('a');
    const indices = [...range(links.length)]
    set(links, { textContent: indices , _href: indices.map(i => `./page/${i}.html`) });
}
```

[API docs for *queryoperator*](https://mksunny1.github.io/deleight-api-docs/main/modules/queryoperator.html)


### Apriori

This is a fun library to use if you want to build DOM with JavaScript. It includes primitives for template creation, template rendering and document tree building. There are tools for building DOM from in-page resources or dynamically loaded ones. This gives us the flexibility to choose whatever works best for a project.

```js
import { get, template } from "deleight/apriori";
const myTemplate = template(await get("markup.html"));
function(componentElement, ...args) {
    componentElement.insertAdjacentHTML('beforeend', myTemplate(...args));
}
```

[API docs for *apriori*](https://mksunny1.github.io/deleight-api-docs/main/modules/apriori.html)


### Sophistry

Styling is a crucial aspect of most pages on the web. We need to make the pages beautiful and improve the UX for visual users. CSS is easy to include globally in any page, but when localising styles with Shadow DOM, one currently has to decide between writing duplicitive declarative styles vs writing JavaScript boilerplate to manage styles efficiently. 

*Sophistry* enables efficiently scoping of declaratively written styles to specific elements. The library provides an API which simplifies the code needed for such. It will internally create open shadow roots where necessary. it maintains a cache to avoid reloading or re-processing the same styles (unless we request). *Sophistry* can draw styles from anywhere.

```js
import { Sophistry } from 'deleight/sophistry';
import { createFragment } from 'deleight/apriori';
const mySophistry = new Sophistry();
const element = createFragment(apriori.get('markup.html'));
const [styles, promises] = mySophistry.process(element);
document.body.append(element);
for (let style of styles) style.style(element, document.body.firstElementChild);

```

[API docs for *sophistry*](https://mksunny1.github.io/deleight-api-docs/main/modules/sophistry.html)


### Generational

*Generational* exports some useful generators to improve performance and reduce memory footprint. The `range` and `items` generators have been especially useful in some of the examples. They may not work in many places where an array is expected because we can only iterate them once. Thus they should be used with caution. When in doubt, use an array.

```js
import { range, items } from "deleight/generational";
const everyTenthIn1000 = range(0, 1000, 10);
// 0, 10, 20, ...

const everyHundredthIn1000 = items(everyTenthIn1000, range(0, 100, 10));
// 0, 100, 200, ...
```

[API docs for *generational*](https://mksunny1.github.io/deleight-api-docs/main/modules/generational.html)


### Withly

We are bringing `with` back to JavaScript with the help of Proxies. This functionality was removed from the language 
because of performance, code comprehension and readbility issues. Once we have an implementation without these limitations, 
we can benefit from the improved concision and structure in our code. 

```js
import { With, SET } from "deleight/withly";
With(document.createElement('button'))[SET]({
    textContent: 'Wow!', className: 'main'
})(btm => document.body.appendChild(btn));
```

[API docs for *withly*](https://mksunny1.github.io/deleight-api-docs/main/modules/withly.html)


### OneToMany

*OneToMany* exports primitives to manipulate many objects simultaneously. There are methods for getting and setting properties and invoking object methods. It provides a potentially more extensible alternative to functions, although presently it is less performant and the usage pattern is not quite as natural.

```js
import { One, wrap, args } from "deleight/onetomany";
const arr1 = [1, 2, 3, 4, 5];

const arr2 = [6, 7, 8, 9];
// not compulsory to have the same length

export const oneArray = new One({arr1, arr2});
oneArray.extend({arr3: [10, 11, 12]});
// you can add or remove objects later with `extend()` or `contract()`

oneArray.call( { push: 50 })
// push 50 to all the arrays

oneArray.call( { push: { [args]: [51, 52, 53, 54] } } )
// push 51-54 to all the arrays.

const wrappedOneArray = wrap(oneArray);
wrappedOneArray.push(99, 100, 101, 102, 103, 104);
// wrapping enables shorthand syntax like this.

```

### Eutility

* NB: Eutility may be deprecated. It will likely be removed soon once all its dependents have been updated and a separate package is created for it. *

This provides some useful primitives for simiplifying the code that will likely be included in many simple pages where JavaScript is used to support interactivity. Most JavaScript code can only run in response to an event. *Eutility* exports functions for:

- composing event handlers
- creating *lazy* handlers whose functionality can be injected later
- promoting handler reuse with different elements
- creating fewer event handlers by taking advantage of event bubbling
- disabling event firing until a running handler completes and all their promises get resolved.
- creating handlers for specific key events, like enter.
- creating reusable handler guards to stop event handling at any point.
- etc.

```js
import { EventListener } from 'deleight/eutility'

export const myEutility = {
    listener: new EventListener((e, runContext) => console.log({e.target, runContext}))
};

```


## Installation

`npm i deleight`


## Usage

```js
import { act } from "deleight/apption";
import { apply } from "deleight/appliance";
import { Actribute } from "deleight/actribute";
// ...
```

## Contributing

If you like this, I invite you to contribute. You can contribute in many areas. Sponsorship, issues, pull requests, benchmarks, testing, CI, examples; all are welcome. Please just maintain a positive disposition about this and about each-other.

Thank you for contributing.

## Ongoing and Planned Work
1. Make all the libraries stand on their own. Then we can include more useful libraries from other authors.
2. Complete the site (*deleightjs.com*).
3. Complete and add more examples.
4. Improve the documentation.
5. Fix the logo...

## Ideas

- Progressive Web Apps.
- Efficient navigation library.

