# Deleight

![Logo](https://github.com/mksunny1/deleight/blob/main/docs/assets/logos/small.png?raw=true)

This is now a group of 12 libraies that simplify web frontend development in vanilla HTML, CSS and JavasSript. Deleight aims to make frontend development more enjoyable for everyone.

Apart from this brief guide and the [documentation](https://mksunny1.github.io/deleight-api-docs/main), there are also some examples which can be used to understand how the parts fit together and to develop a feel for using deleight. To play with the exmples, you can run the included server with `npm start` and visit http://localhost:8000/docs/examples/index.html. The demos are also hosted online [here](https://mksunny1.github.io/deleight/docs/examples).

What follows is a brief description of the libraries and how to include them in your projects.

## Class-Action

[Class-action](https://github.com/mksunny1/class-action) is a simple library for replacing functions and methods with more compasable objects. It enables a form of metaprogramming in JavaScript. Learn more about it [here](https://github.com/mksunny1/class-action).

## Action-object

[Action-object](https://github.com/mksunny1/action-object) is a simple library for making JavaScript objects *reactive*. This means we can set up actions to run when an object property is set or a a method is invoked. It demonstrates a powerful use-case for [class-action](https://github.com/mksunny1/class-action). Learn more about it [here](https://github.com/mksunny1/action-object).

## Element-action

[Element-action](https://github.com/mksunny1/element-action) is the new reactivity library implemented with [action-object](https://github.com/mksunny1/action-object) and [class-action](https://github.com/mksunny1/class-action). The library is mostly complete now (and stripped-down for simplicity). Learn more about it [here](https://github.com/mksunny1/element-action).


* NB: [reftype](https://github.com/mksunny1/reftype) has is now a separate package and has been removed from here. Element-action is the preferred module for the same function. You can still install reftype with `npm i reftype` *


## Actribute

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

## Appliance

*Appliance* provides another declarative API for manipulating the DOM and for structuring code in JavaScript. It can be used to attach behavior to HTML elements easily and efficiently. It is like custom elements without the DOM building aspects. Here the elements may already exist in the DOM. This can produce big gains in accessibility and flexibility as DOM can be built server-side or client-side using any technology of choice. This can also increase efficiency because all the elements can be set up in one call.

```js
import { apply } from 'deleight/appliance'
import { mySophistry } from './my-style-manager.js'
import { myEutility } from './my-event-manager.js'

// apply used globally on all divs within the componentElement
function(componentElement) {
    apply({
        div: (...divs) => mySophistry.styles.style(...divs) || myEutility.listener.listen('click', divs,  myEutility.options)
    }, componentElement);  // componentElement defaults to document.body.
}
```

## Queryoperator

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


## Apriori

This is a fun library to use if you need to build DOM with JavaScript. It includes primitives for template creation, template rendering and document tree building. There are tools for building DOM from in-page resources or dynamically loaded ones. This gives us the flexibility to choose whatever works best for a project.

```js
import { get, template } from "deleight/apriori";
const myTemplate = template(await get("markup.html"));
function(componentElement, ...args) {
    componentElement.insertAdjacentHTML('beforeend', myTemplate(...args));
}
```


## Sophistry

Styling is a crucial aspect of most pages on the web. We need to make the pages beautiful and improve the UX for visual users. CSS is easy to include globally in any page, but when localising styles with Shadow DOM, one currently has to decide between writing duplicitive declarative styles vs writing JavaScript boilerplate to manage styles efficiently. 

*Sophistry* enables efficiently scoping of declaratively written styles to specific elements. The library provides an API which simplifies the code needed for such. It will internally create open shadow roots where necessary. it maintains a cache to avoid reloading or re-processing the same styles (unless we request). *Sophistry* can draw styles from anywhere.

```js
import { Sophistry } from "deleight/sophistry";
export const mySophistry = new Sophistry();
mySophistry.import("pStyle.css");
```


## Generational

*Generational* exports some useful generators to improve performance and reduce memory footprint. The `range` and `items` generators have been especially useful in the examples. They may not work in many places where an array is expected because we can only iterate them once. Thus they should be used with caution. When in doubt, use an array.

```js
import { range, items } from "deleight/generational";
const everyTenthIn1000 = range(0, 1000, 10);
// 0, 10, 20, ...

const everyHundredthIn1000 = items(everyTenthIn1000, range(0, 100, 10));
// 0, 100, 200, ...
```


## Withly

We are bringing `with` back to JavaScript with the help of Proxies. This functionality was removed from the language 
because of performance, code comprehension and readbility issues. Once we have an implementation without these limitations, 
we can benefit from the improved concision and structure in our code. 

```js
import { With, SET } from "deleight/withly";
With(document.createElement('button'))[SET]({
    textContent: 'Wow!', className: 'main'
})(btm => document.body.appendChild(btn));
```


## OneToMany

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


## Eutility

This library provides some useful primitives for simiplifying the code that will likely be included in many simple pages where JavaScript is used to support interactivity. Most JavaScript code can only run in response to an event. *Eutility* exports functions for:

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
import { Component } from "deleight/element-action";
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

