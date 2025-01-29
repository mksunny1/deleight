# Deleight (v5.8.0)

![Logo](https://github.com/mksunny1/deleight/blob/main/docs/assets/logos/logo.png?raw=true)

Deleight is a JavaScript library now comprising 9 modules designed to improve expressiveness without compromising simplicity, performance, flexibility and sheer elegance of pure JavaScript. We achieve this by creating higher level functions, classes and objects which can get more done with less code than standard JavaScript primitives. These new utilities have been assembled into different modules based on functionality and dependency so that you can include only the parts you need in your projects. The whole architecture means you can write your apps in vanilla JavaScript and still reap the same benefits as when you use a framework.

## Usage

```js
import { addTo, attr } from 'deleight/dom/components'
import { apply } from 'deleight/dom/apply'
import { sets } from 'deleight/object/shared'

/* Add behavior to elements created on the server. */
document.body.innerHTML = `
<div>I am a div</div>
<p>I am a paragraph</p>
<section>I am a section <button>Btn1</button></section>
<aside m-ember="aside">I am a section <button>Btn1</button></aside>
<article>I am an article <button>Btn2</button></article>
`;
const obj = {};
apply({ 
    section: { button: addTo(obj, 'a', attr) }, 
    aside: { button: addTo(obj, 'textContent') }, 
    article: { button: addTo(obj, 'color', 'style') } 
});
sets(obj, 'yellow');
sets(obj, 'green');

// Build the elements directly:
import { b, hh } from "deleight/dom/builder.js";
b(
    hh.div('I am a div'),
    hh.p('I am a paragraph'),
    hh.section('I am a section ', hh.button('Btn1').apply(addTo(obj, 'a', attr))),
    hh.aside('I am a section ', hh.button('Btn1').apply(addTo(obj, 'textContent')))
      .set({'m-ember':'aside'}),
    hh.article('I am an article ', hh.button('Btn2').apply(addTo(obj, 'color', 'style')))
).appendTo(document.body);

// dom/builder is also very effective for server renedeing where you just call 
// `render` instead of `build`...

*/
```

Deleight has been written in TypeScript. Using TypeScript helps to provide more guarantees about runtime perfornce because of the type enforcements and other helpful things at compile time. Also most of the primitives are well tested and have been further enhanced from earlier versions of Deleight. Deleight was already among the best performing frameworks in the [Krausest frameworks benchmark](https://github.com/krausest/js-framework-benchmark) before major work to restructure and improve the whole ibrary for V5.


## Installation

This is a dual module library with both ES modules and CommonJS packages so that many project structures can benefit from it. You can simply throw any deleight modules (or sub-modules) into your web page and they will load fast and work well. All of them are focused on particular tasks and have small file sizes, even unminified. 

`npm install deleight` 

or 

`import { object } from "https://cdn.jsdelivr.net/npm/deleight/dist/esm/deleight.min.js"`

```js
import { apply } from 'deleight/dom/apply';
import { range, map, chain } from 'deleight/generators';
```

If you use NPM with a bundler to build your frontend, you can bring anything from the whole package into your files like this:

**ESM**
```js
import { dom, Generator } from 'deleight';
const apply = dom.apply;
const { range, map, chain } = Generator;

```

or 

**CommonJS**
```js
const { dom, Generator } = require('deleight');
const apply = dom.apply;
const { range, map, chain } = Generator;

```

## Documentation

Deleight is easy to learn. Both the modules and the primitives in them are self-containing. In editors like VS Code, simply importing a function or a class will be all you need to learn what it does and how to use it. 

You will find many examples (still adding) that show the code in action. Beyond this, you only need a bit of context about what a particular module entails so that you know when you need it and what to expect when you reach for it. You can learn a single function or class and benefit from that. There is no need to learn Deleight from the top down. The API documentation is available [here](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.html).


## Modules

### Action
[action](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.action.html)

Exports an `Action` class that converts every iterable into a callable, provided they contain one or more `Step` objects. A `Step` provides the interpretations for the values in the iterable after it, up to the next step with equal or lower priority.

Many simple steps have been implemented to do things like:
- calling functions with the same scope and arguments, 
- chaining functions, 
- accessing properties on multiple objects, 
- spreading and compacting values, 
- etc. 

Think of an Action as a function whose lines are like items in an array. We can manipulate them however we want. We can also define the meaning of all the keywords. It is meant for generating and modifying code on the fly without using `Function` constructor. We can use it for setting up reactivity and for more general declarative programming.

**Note**: This module has been renamed from **process** to avoid confusion with similarly named submodules in **deleight/object** and **deleight/dom**.

### CSS
[css](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.css.html)

Primitives for loading and using stylesheets. This module is most useful when developing reusable web components that need to be styled independently of the environment where they are used. With **css**, you can 

- create `CSSStyleSheet` instances from CSS files or text
- extract `CSSStyleSheet` objects from a document tree from `<style>` and `<link>` elements, optionally removing them from the tree
- add or remove a `CSSStyleSheet` to/from multiple documents, fragments or elements (using shadow roots) at the same time.
- locate and manipulate rules within a stylesheet with string (selector) keys. 

### DOM
[dom](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.dom.html)

Primitives for building and working with the DOM. With **dom**, yoe can:
- build elements from HTML text and files
- build elements (or their HTML text) from objects
- apply components to elements by matching with selectors
- apply components to elements by specifying them with attributes
- escape text to make them safe for use in markup
- etc

Many standard components have been included for creating event handlers, setting attributes and setting and assigning properties, etc.

### Function
[function](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.function.html)

Currently includes 5 functions/submodules:

1. **function/cache**: Wrap functions to cache results.

2. **function/context**: Call `setContext` on multiple functions to make them run mutually exclusively. This can be useful, for example, in event handlers that create network requests so they do not unnecessarily repeat them.

3. **function/dynamic**: Create 'dynamic' getters, setters and 'deleters'.

4. **function/return**: Create objects that represent function return values. Accessing members call the wrapped functions to get the values which are accessed instead.

5. **function/reversible**: Cleanly implement things like tabs and item selection.

### Generator
[generators](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.Generator.html)

Many powerful generators to minimize computations and memory use. Some are seen in the usage example.

### List
[lists](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.List.html)

Objects implementing an array-like mutation interface so they can be used together or, in the case of `ElementList`, provide a more 'array-like' usage pattern. 


### Object
[object](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.object.html)

Many important primitives for manipulating objects or getting stuff done with them. The `apply` and `process` functions of the **dom** module use the object versions under the hood. There are also **shared** and **deep** sub-modules for respectively accessing members in multiple objects and members deep within an object. 

Using **shared**, you can add more structure and concision in your code by manipulating multiple objects with a single action. **This is where you find reactivity in Deleight**. 

Using **deep**, you can trivially implement things like routing. Async deep member access can be used to access server data like other objects on the client.

```js
import { call } from 'deleight/object/deep'

const routes = {
    blog: {
        post(title) { 
            return () => {

            }
        },
        posts(page) {

        }
    },
    news(article) {

    }
}

function router(newHash) {
    const path = newHash.split('/');
    call(routes, path);
}

// Hey this router could be slow if poorly implemented. But you get the idea...

```

### Proxy
[proxy](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.Proxy.html)

Many useful proxies including `Alias` and `Scope` which are virtual objects that behave like their names imply, `Selector` for treating descendant elements as simple properties and `Wrapper` to wrap any objects and perform pre- or post- processing during member access.

### Template
[template](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.template.html)

Functions for creating template functions from pre-existing text, such as those loaded from files. This is important because JS template literals must be created 'immediately'. Created templates can be either sync or async, return a single rendered text or an iterable of rendered text or promises that resolve to rendered text.


## Contributing

We need you. See our [Contributing guide](/CONTRIBUTING.md) for the many ways you can contribute to this project. Everyone is welcome. Cheers...


