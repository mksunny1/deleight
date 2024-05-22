# Deleight

![Logo](https://github.com/mksunny1/deleight/blob/main/docs/assets/logos/small.png?raw=true)

This is a group of 9 libraies that simplify web frontend development in vanilla HTML, CSS and JavasSript. Deleight is an inclusive library that everyone operating on the web can benefit from.

- Frontend JavaScript developers can create apps without worrying about control, modularity or maintainance. Not only is the framework flexible, modular and compact, it also aligns with familiar semantics. You also have the convenience of a declarative API.

- Distributed frontend teams can work freely in their favourite languages without worrying about interop. HTML experts can write pure HTML. JavaScript developers can write pure JavaScript. Designers can write pure CSS. Deleight will ensure that everything plays well together.

- Back-end developers using any technology can stop worrying about front-end complexity. Deleight ships modern ES6 modules which can be loaded directly into webpages. Because the framework is modular and compact, you only load the libraries you need into your pages. You can also compose them with your favourite back-end template engines to reduce the number of files to load. Finally, the [API](https://mksunny1.github.io/deleight-api-docs/main) is small and natural; it is very easy to pick up in a few hours.

Apart from this brief guide and the [API](https://mksunny1.github.io/deleight-api-docs/main) documentation, there are also some examples which can be used to understand how the parts fit together and to develop a feel for using deleight. To play with the exmples, you can run the included server with `npm start` and visit http://localhost:8000/docs/examples/index.html. The demos are also hosted online [here](https://mksunny1.github.io/deleight/docs/examples).

What follows is a brief description of the libraries and how to include them in your projects.


## Appliance

Appliance provides a powerful declarative API for manipulating the DOM and for structuring code in JavaScript. It can be used to attach behavior to HTML elements easily and efficiently. It is like custom elements without the DOM building aspects. Here the elements may already exist in the DOM. This can produce big gains in accessibility and flexibility as DOM can be built server-side or client-side using any technology of choice. This can also increase efficient=cy because all the elements can be set up in one call. When used in tandem with other primitives from `actribute`, `domitory` and `onetomany`, appiance will match and exceed advanced 'framework' functionality, like data-binding, state management and lifecycle hooks. Hydration is natural.

```js
import { apply } from 'deleight/appliance'
import { mySophistry } from './my-style-manager.js'
import { meEventivity } from './my-event-manager.js'

// apply used globally on all divs within the containingElement
function(containingElement) {
    apply({
        div: (...divs) => mySophistry.styles.style(...divs) || meEventivity.listener.listen('click', divs,  myEventivity.options)
    }, containingElement);  // containingElement default to document.body.
}
```


## Actribute

Actribute is a versatile library for associating element attributes with JavaScript code. In one instance it can be used as a more widely supported, flexible and powerful alternative to extending built-in HTML elements, using a similar API. In another, it can be used to establish conventions for automatically manipulating the DOM. Think about directives in Angular or Vue.

```js
 import { Actribute, props } from 'deleight/actribute';
 // initialize:
 const fallbackProps = {
    prop1: 'Fallback', prop4: 'Last resort', 
    sig: '$2b$20$o7DWuroOjbA/4LDWIstjueW9Hi6unv4fI0xAit7UQfLw/PI8iPl1y'
 };
 const act = new Actribute();
 
 // register components:
 act.register('comp1', (element, attr, ...context) => element.textContent = props(attr.value, context)[0]);
 act.register('comp2', (element, attr) => element.style.left = attr.value);
 
 // use in markup:
 // &lt;section c-comp1="prop1"  c-comp2="100px" &gt;
 //       First section
 // &lt;/section&gt;
 
 // process components:
 act.process({el: document.body, ctx: [{prop1: 2, prop3: 2}, fallbackProps]});
 
 // unregister a component:
 delete act.registry.comp2;
```


## Domitory

This provides a painless SQLesque API for manipulating the DOM. The library exports `insert`, `set`, `update` and `remove` functions for bulk manipulation of things on the DOM. It is an efficient, consistent and simple API to use. See the examples and the API docs.

```js
import { apply } from 'deleight/appliance'
import { set } from 'deleight/domitory'
import { range } from 'deleight/generational'

// set the text content of all selected div elements to its position in the array. We can set as many properties or attributes as we want at once.
function(containingElement) {
    apply({
        div: (...divs) => set(divs, {textContent: range(divs.length)})
    }, containingElement);
}
```


## Eventivity

This library provides some useful primitives for simiplifying the code that must be included in every page where JavaScript is used to support interactivity. Most JavaScript code can only run in response to an event. Eventivity exports functions for:

- composing event handlers
- creating *lazy* handlers whose functionality can be injected later
- promoting handler reuse with different elements
- creating fewer event handlers by taking advantage of event bubbling
- disabling event firing until a running handler completes and all their promises get resolved.
- creating handlers for specific key events, like enter.
- creating reusable handler guards to stop event handling at any point.
- etc.

```js
import { EventListener } from 'deleight/eventivity'

export const myEventivity = {
    listener: new EventListener((e, runContext) => console.log({e.target, runContext}))
};

```


## OneToMany

OneToMany exports primitives to manipulate many objects simultaneously. There are methods for getting and setting properties and invoking functions and object methods. The library is simple, concise, explicit and transparent.

```js
import { One, one } from "deleight/onetomany";
const arr1 = [1, 2, 3, 4, 5];

const arr2 = ["a", "b", "c", "d"];
// not compulsory to have the same length

export const oneArray = new One([arr1, arr2]);
oneArray.many.unshift([true, true, false]);
// you can add or remove arrays later using its 'many' property

const wrappedOneArray = one([arr1, arr2]);
wrappedOneArray.push([6], ["e"]);
// wrapping enables shorthand syntax like this.
```


## Apriori

This is a fun library to use if you need to build part or all of your DOM with the help of JavaScript. It includes primitives for template creation, template rendering and document tree building. There are tools for building the DOM from in-page resources or dynamically loaded ones. This gives us the flexibility to choose whatever works best for a project.

```js
import { get, template } from "deleight/apriori";
export const myTemplate = template(await get("markup.html"));
```


## Sophistry

Styling is a crucial aspect of most pages on the web. We need to make the pages beautiful and improve the UX for visual users. CSS is easy to include globally in any page. However, when localising styles with Shadow DOM, one currently has to make the decision between writing duplicitive declarative styles vs writing JavaScript boilerplate to manage styles efficiently. Sophistry will help with efficiently scoping declaratively written styles to specific elements. The library provides an API which simplifies the code needed for such scoping. It will internally create open shadow roots where necessary. it maintains a cache to avoid reloading or re-processing the same styles (unless we request). Sophistry can also draw styles from anywhere.

```js
import { Sophistry } from "deleight/sophistry";
export const mySophistry = new Sophistry();
mySophistry.import("pStyle.css");
```


## Generational

Generational exports some useful generators to improve performance and reduce memory footprint. The `range` and `items` generators have been especially useful in the examples. They may not work in many places where arrays are expected because we can only iterate them once. Thus they should be used with caution. When in doubt, use an array.

```js
import { range, items } from "deleight/generational";
const everyTenthIn1000 = range(0, 1000, 10);
// 0, 10, 20, ...

const everyHundredthIn1000 = items(everyTenthIn1000, range(0, 100, 10));
// 0, 100, 200, ...
```


## Withy

We are bringing `with` back to JavaScript with the help of Proxies. This functionality was removed from the language 
because of performance, code comprehension and readbility issues. Once we have an implementation without these limitations, 
we can benefit from the improved concision and structure in our code. 

```js
import { With, SET } from "deleight/withy";
With(document.createElement('button'))[SET]({
    textContent: 'Wow!', className: 'main'
})(btm => document.body.append(btn));
```


## Installation

You can currently install deleight in 2 ways:

### Direct download

Download or clone the repository and import any libraries you need from the ./src. It contains both JavaScript and TypeScript files.

### From NPM

`npm i deleight`

Deleight will also be installable from a CDN network soon.

## Usage

Depending on how you bring deleight into your app, there may be subtle differences in how to import the libraries:

### Direct download

```js
import { apply } from "./deleight/src/appliance.js";
import { One } from "./deleight/src/onetomany.js";
// ...
```

### From NPM

```js
import { apply } from "deleight/appliance";
import { One } from "deleight/onetomany";
// ...
```

## Contributing

If you like the concept and/or the direction of deleight, feel free to contribute to this project. We are accepting contributions in many areas. Sponsorship, issues, pull requests, benchmarks, picking up tickets, discussions, questions, examples; all are welcome. We only request that everyone maintains a positive disposition about this and about each-other.

Thank you for contributing.

## Ongoing and Planned Work

1. Complete testing on the tenth library (`reftype`) for referring to JavaScript variables directly in pure HTML. Everything is still transparent and explicit.
2. Complete the site (deleightjs.com).
3. Complete and add more examples.
4. Improve the documentation.
5. Fix the logo...

## Ideas

- Progressive Web Apps.
- Efficient navigation library (not a router).

