# **Deleight: A Lightweight, Reactive UI Framework**

![Logo](https://github.com/mksunny1/deleight/blob/main/docs/assets/logos/logo.png?raw=true)

Deleight is a minimalistic yet powerful JavaScript framework that enables reactive user interfaces with fine-grained control and flexible state management. It focuses on simplicity and idiomatic JavaScript without the need for complex abstractions or magic.

## Performance Benchmarks

Deleight performs exceptionally well in terms of speed and efficiency. It is one of the top-performing frameworks in the Krausest JS Framework Benchmarks.

As of latest benchmark results, Deleight ranks among the top-performing frameworks. [Check the most recent standings](https://github.com/krausest/js-framework-benchmark) to see how it compares!

## Key Features

- **No Magic**: Full control over reactivity and state management without the hidden magic often found in other frameworks.
- **Flexible State Management**: Use regular JavaScript objects for state. Bind DOM elements and JavaScript objects using the `sets`, `calls`, and `dels` functions.
- **Declarative UI**: Build your UI in a declarative style with DOM builders like `hh` for defining elements and their structure.
- **Modular and Lightweight**: Only include the necessary modules, making it a lightweight framework ideal for performance-critical applications.
- **No Virtual DOM**: Direct manipulation of DOM elements allows for faster updates, reducing overhead and improving performance.
- **Platform-agnostic Components**: Many parts of Deleight work naturally on both the frontend and backend of your applications.
- **First-class TypeScript Support**: Write your whole app in pure TypeScript and benefit from the strong tooling support that entails.
- **Works with Anything on the Backend**: Deleight has facilities like `apply` and `process` for associating components with DOM elements in a simple and extremely concise way.
- **Advanced Tools**: Deleight also includes components that support advanced techniques such as function chaining, artificial scopes, and decentralized function composition. You can use these techniques when needed or experiment with new ways of structuring your code.

## Comparison with Other Frameworks

| Feature/Framework   | **Deleight**                          | **React**                                | **Vue.js**                               | **Solid**                                | **Angular**                              | **Svelte**                                |
|---------------------|---------------------------------------|------------------------------------------|------------------------------------------|------------------------------------------|------------------------------------------|------------------------------------------|
| **Reactivity**      | Fine-grained reactivity, no virtual DOM, direct DOM manipulation. | Virtual DOM with diffing algorithm.      | Virtual DOM with reactivity system (proxy-based). | Fine-grained reactivity, no virtual DOM. | Two-way data binding with zones and change detection. | Compiler-driven reactivity with no virtual DOM. |
| **Performance**      | Extremely fast, outperforms most frameworks in benchmarks (Krausest). | Fast, but can be slower due to virtual DOM and diffing. | Similar to React but optimized in some cases, faster reactivity system. | Extremely fast, optimized for large-scale apps. | Slower due to extensive change detection cycles and zones. | Very fast due to compile-time optimizations. |
| **Memory Efficiency** | More memory-efficient due to no virtual DOM, minimal overhead, and the **generators module** for handling large datasets. | Higher memory usage due to virtual DOM and diffing. | Moderate memory usage, virtual DOM and reactive system, optimized for smaller apps. | Very efficient, but still slightly higher than Deleight due to reactivity systems. | Higher memory usage due to extensive use of change detection and zones. | Very memory-efficient due to compile-time optimizations. |
| **Ease of Learning** | Easier to learn compared to others, uses plain JavaScript/TypeScript objects with no "magic". | Easy to learn, many tutorials and resources available. | Easy to learn, similar to React, but slightly more declarative. | Steep learning curve, but very powerful for large apps. | Steep learning curve, more complex due to its full framework nature. | Simple syntax, but not true JavaScript/TypeScript. Requires unique tooling and concepts, which can be unintuitive for pure JS/TS developers. |
| **Development Speed** | Fast for both small and large projects, no special tooling required. | Fast with a large ecosystem of libraries and tools. | Fast with many built-in features and Vue CLI tools. | Fast for developers familiar with reactive paradigms. | Slow, as it comes with a lot of boilerplate and setup. | Fast, no build step or special tooling required, everything is compiled. |
| **Community Support** | Growing but small community. | Large and active community with lots of resources. | Large and growing community. | Smaller community, but very passionate and growing. | Huge community with extensive resources, but can be opinionated. | Growing, but smaller than React/Vue. |
| **Use Case**        | Ideal for both small and large projects, very high performance, memory-efficient with **generators module** for large datasets. | Best for large-scale applications with heavy user interaction. | Great for both small and large-scale projects, reactive systems. | Best for large-scale applications with complex UI updates. | Best for enterprise-level applications with complex architectures. | Best for projects with simple-to-moderate complexity, or those needing minimal overhead. |
| **Flexibility**     | Extremely flexible, gives you full control over implementation, can be used for any kind of project. | High flexibility, but requires React-specific paradigms and tooling. | Flexible but has a more opinionated structure compared to React. | Highly flexible, offers low-level control with fine-grained reactivity. | Less flexible due to its strict opinions on how things should be done. | Limited flexibility compared to others due to its compile-time nature. |
| **Modularity**      | Very modular, components can be composed easily, and you can build custom solutions easily. | Modular, but often needs external libraries and patterns for more complex use cases. | Modular with good support for state management (Vuex) and component structure. | Highly modular, built around fine-grained reactivity but can become complex. | Less modular due to the monolithic nature of the framework. | Modular, but the framework is designed to be minimal and lean. |
| **Tools/Extensions** | No special tooling required, just JavaScript/TypeScript. | Huge ecosystem, extensive tools and extensions available. | Strong ecosystem, Vuex for state management. | Smaller ecosystem, but fast-growing. | Very extensive, with tools like Angular CLI, RxJS, etc. | Unique tooling required, but the ecosystem is growing. |
| **Compatibility**   | Works with anything, supports commonJS imports, can work via jsdelivr, fully compatible with modern JS/TS ecosystems. | Works well with most modern browsers and toolchains. | Works with modern browsers and toolchains. | Compatible with modern browsers and libraries. | Full support for modern browsers, integrates well with TypeScript and other tools. | Works with modern browsers but requires unique tooling that deviates from standard JS/TS workflows. |


## Installation

Install Deleight via NPM:

```bash
npm install deleight
```

## Usage Example

Here’s an example of creating a simple counter with Deleight using the **builder** and **components** APIs:

```javascript
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";
import { addTo } from "deleight/dom/components";

// Define the state
const state = { count: 0 };

// Define the reactive state
const reactiveState = { count: [state] };

// Create the counter element, binding state.count to counterElement.textContent
const counterElement = hh.div(0).apply(addTo(reactiveState, '')).build();
// reactive State becomes { count: [state], textContent: [counterElement] }. 

// Create increment and decrement buttons
const incrementButton = hh.button('Increment').assign({
    onclick() { sets(reactiveState, state.count + 1); }
}).build();

const decrementButton = hh.button('Decrement').assign({
    onclick() { sets(reactiveState, state.count - 1); }
}).build();

// Append the elements to the document
document.body.append(decrementButton, counterElement, incrementButton);
```

### How It Works:

1. **State Management**: The `state` object holds a counter value. You can use the `sets` function with `reactiveState` to update the state and trigger DOM updates.
2. **UI Binding**: The `addTo` function binds the `state.count` property to the `counterElement.textContent` property. '' is just a shorthand for 'textContent' in the `addTo` function. We can bind any properties and any number of objects. 
3. **Declarative UI**: `hh.div` and `hh.button` allow you to define the UI structure declaratively, while still providing full control over the DOM elements.
4. **Reactivity**: When you click the increment or decrement button, the `sets` function updates the bound properties on both the state and the counterElement.

## Advanced Usage

### Low-Level Example: Fine-Grained Control

Deleight gives you fine-grained control over the UI and state, enabling full flexibility in your application. Here’s an example that creates the reactive binding explicitly, without relying on higher-level abstractions like `addTo`.

```javascript
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";

// Define the state
const state = { count: 0 };

// Build the counter element and bind it to the state
const counterElement = hh.div(state.count).build();

// Define the reactive object for updating state and DOM
const reactiveState = {
    count: [state],
    textContent: [counterElement]
};

// Create increment and decrement buttons
const incrementButton = hh.button('Increment').assign({
    onclick() { sets(reactiveState, state.count + 1); }
}).build();

const decrementButton = hh.button('Decrement').assign({
    onclick() { sets(reactiveState, state.count - 1); }
}).build();

// Append the elements to the document
document.body.append(decrementButton, counterElement, incrementButton);
```

### How It Works:

1. **State Management**: The `state` object directly holds the `count` property, and `sets` is used to update it. 
2. **Fine-Grained Binding**: The `reactiveState` explicitly links the `state.count` and `counterElement.textContent`.
3. **Rectivity**: The call to `sets` works in exactly the same way as the earlier example.

In this version, you have complete control over the DOM bindings, which is especially useful for more complex use cases where you need full control over the behavior of your application.

## 📚 Documentation

- **[Deleight Tutorials](./tutorials.md)**  
  Step-by-step guides and practical examples to help you get started with Deleight.

- **[API Documentation](https://mksunny1.github.io/deleight-api-docs/main/modules/deleight.html)**  
  Detailed reference for using Deleight's features and API.

---

 ## Demo

 Check out Deleight in action in one of my projects. This is a simple page for creating the daily menu for a cafeteria. This demo showcases how Deleight enables simple and efficient DOM building and dynamic UI updates.

 [daily menu](https://mksunny1.github.io/cafe-menu/)

## Contributing

Want to make Deleight even better? Contributions are welcome! Submit issues, feature suggestions, or pull requests to help improve the framework.

