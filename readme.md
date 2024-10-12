# Deleight

![Logo](https://github.com/mksunny1/deleight/blob/main/docs/assets/logos/logo.png?raw=true)

Deleight is a library now comprising 9 modules designed to improve expressiveness without compromising simplicity, performance, flexibility and sheer elegance of pure JavaScript. We achieve this by creating higher level functions, classes and objects which can get more done with less code than standard JavaScript primitives. These new utilities have been assembled into different modules based on functionality and dependency so that you can include only the parts you need in your projects. The whole architecture means you can benefit from more expressiveness without compromising the power and freedom of vanilla JavaScript.


## Usage

```js
import { apply } from 'deleight/dom/apply';
import { map, range, forEach, zip } from 'deleight/generators';

apply({
    main: (main) => {
        const newContent = map(range(101, 120), i => `My index is  now ${i}`);
        const lastChildren = map(main.children, c => c.lastElementChild);
        forEach(zip(lastChildren, newContent), ([el, c]) => el.textContent = c);
    }
});

```

Deleight has been written in TypeScript. Using TypeScript helps to provide more guarantees about runtime perfornce because of the type enforcements and other helpful things at compile time. Also most of the primitives are well tested and have been further enhanced from earlier versions of Deleight. Deleight was already among the best performing frameworks in the [Krausest frameworks benchmark](https://github.com/krausest/js-framework-benchmark) before major work to restructure and improve the whole ibrary for *Deleight 5*.


## Installation

Deleight has been compiled into ES modules and CommonJS so that many project structures can benefit from it. You can simply throw any deleight modules (or sub-modules) into your web page and they will load fast and work well. All of them are focused on particular tasks and have small file sizes, even unminified. 

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

### [action](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.action.html)

Exports an `Action` class that converts every iterable into a callable, providing they contain one or more `Step` objects. A `Step` provides the interpretations for the values in the iterable after it, up to the next step with equal or lower priority.

Many simple steps have been implemented to do things like call functions with the same scope and arguments, chain functions, access properties on multiple objects, spread and compact values, etc. 

Think of an Action as a function whose lines are as items in an array. We can manipulate them however we want. We can also define the meaning of all the keywords. Action is meant for generating and modifying code on the fly without using Function constructor. We can use it to setup reactivity and for more general declarative programming.

### [css](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.css.html)

Primitives for loading and using stylesheets. Using **css**, you can 

- create `CSSStyleSheet` instances from CSS files or text
- extract `CSSStyleSheet` objects from a document tree from `<style>` and `<link>` elements, optionally removing them from the tree
- add or remove a `CSSStyleSheet` to/from multiple documents, fragments or elements (using shadow roots) at the same time.
- locate and manipulate rules within a stylesheet with string (selector) keys. 

### [dom](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.dom.html)

Primitives for building and working with the DOM. Using **dom**, we can:
- build elements from HTML text and files
- build elements (or their HTML text) from objects
- apply components to elements by matching with selectors
- apply components to elements by specifying them with attributes

Many standard components have been included for creating event handlers, setting attributes and setting and assigning properties (components).

### [function](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.function.html)

Currently includes 4 submodules:

1. **function/cache**: functions to wrap a function to cache and return the first result. `cache#reset` method can be used for reset. 

2. **function/context**: a `setContext` function which wraps a function with another one to include the given `context` object in its scope. `setContext` can be called on multiple functions to effectively make them run mutually exclusively. This can be useful, for example, in event handlers that create network requests so they do not unnecessarily repeat the requests.

3. **function/dynamic**: a `dyn` function to effectively create dynamic 
getters, setters and 'deleters'.

4. **function/return**: a `Return` function which creates an object that represents the return value of calling a function. Accessing members will first call the wrapped function to get the object which will be accessed instead.

### [generators](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.Generator.html)

Many powerful generators to minimize computations and memory use. Some are seen in the usage example.

### [lists](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.List.html)

Objects implementing an array-like mutation interface so they can be used together or, in the case of `ElementList`, provide a more 'array-like' usage pattern. 


### [object](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.object.html)

Many important primitives for manipulating objects or getting stuff done with them. The `apply` and `process` functions of the **dom** module use the object versions under the hood. There are also **shared**/**sharedasync** and **deep** sub-modules for respectively accessing members in multiple objects and members deep within an object. 

Uing **shared**, you can add more structure and concision in your code by manipulating multiple objects with a single action. Using **deep**, you can trivially implement things like routing. Async deep member access can be used to access server data like other objects on the client.

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

### [proxy](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.Proxy.html)

Many useful proxies including `Alias` and `Scope` which are virtual objects that behave like their names imply, `Selector` for treating descendant elements as simple properties and `Wrapper` to wrap any objects and perform pre- or post- processing during member access.

### [template](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.template.html)

Functions for creating template functions from pre-existing text, such as those loaded from files. This is important because JS template literals must be created 'immediately'. Created templates can be either sync or async, return a single rendered text or an iterable of rendered text or promises that resolve to rendered text.


## Contributing

We need you. See our [Contributing guide](/CONTRIBUTING.md) for the many ways you can contribute to this project. Everyone is welcome. Cheers...


