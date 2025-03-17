# **Deleight: A Lightweight, Reactive UI Framework**

Deleight is a minimalistic yet powerful JavaScript framework that enables reactive user interfaces with fine-grained control and flexible state management. It focuses on simplicity and idiomatic JavaScript without the need for complex abstractions or magic.

## Performance Benchmarks

Deleight performs exceptionally well in terms of speed and efficiency. It is one of the top-performing frameworks in the Krausest JS Framework Benchmarks.

Check out the benchmark results:

* [Krausest JS Benchmark](https://github.com/krausest/js-framework-benchmark)
Deleight currently ranks:

* 3rd (non-keyed)
* 4th (keyed)
You can explore how it compares to other frameworks and the detailed benchmarks on the Krausest page.

## Key Features

- **No Magic**: Full control over reactivity and state management without the hidden magic often found in other frameworks.
- **Flexible State Management**: Use regular JavaScript objects for state. Bind DOM elements and JavaScript objects using the `sets`, `calls`, and `dels` functions.
- **Declarative UI**: Build your UI in a declarative style with DOM builders like `hh` for defining elements and their structure.
- **Modular and Lightweight**: Only include the necessary modules, making it a lightweight framework ideal for performance-critical applications.
- **No Virtual DOM**: Direct manipulation of DOM elements allows for faster updates, reducing overhead and improving performance.

## Comparison with Other Frameworks

| Feature | **Deleight** | **React** | **Vue** | **Svelte** |
|---------|--------------|-----------|---------|------------|
| **Reactivity** | Uses explicit state management with `sets`, `calls`, and `dels`. | Virtual DOM with diffing algorithm. | Virtual DOM with reactive data binding. | Compiled into imperative code with reactive assignments. |
| **Syntax** | Direct JavaScript syntax, no magic. | JSX and hooks. | Template syntax with reactive data. | Special syntax that compiles into JavaScript. |
| **State Management** | Uses regular JavaScript objects, no need for a store. | Uses `useState` and `useReducer` for state management. | Uses reactive variables and Vuex for global state. | Built-in reactivity with store support. |
| **Performance** | High performance with fine-grained reactivity. | Virtual DOM diffing can be slower for large updates. | Virtual DOM diffing, faster than React but slower than Deleight. | Compiled code leads to fast, direct DOM manipulation. |
| **Learning Curve** | Easy to learn and use for JavaScript developers. | Steep learning curve with JSX and hooks. | Moderate learning curve with templates and directives. | Low learning curve for those familiar with JavaScript. |
| **Ecosystem** | Small ecosystem but rapidly growing. | Large and mature ecosystem with extensive tooling. | Mature ecosystem with strong support for both small and large applications. | Smaller ecosystem, but growing rapidly in the frontend space. |

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
const state = { count: [{ count: 0 }] };

// Create the counter element, binding state to textContent
const counterElement = hh.div(0).apply(addTo(state, '')).build();

// Create increment and decrement buttons
const incrementButton = hh.button('Increment').assign({
    onclick() { sets(state, state.count[0].count + 1); }
}).build();

const decrementButton = hh.button('Decrement').assign({
    onclick() { sets(state, state.count[0].count - 1); }
}).build();

// Append the elements to the document
document.body.append(decrementButton, counterElement, incrementButton);
```

### How It Works:

1. **State Management**: The `state` object holds a counter value. You can use the `sets` function to update the state and trigger DOM updates.
2. **UI Binding**: The `addTo` function binds the `state.count[0].count` property to the `textContent` of the `counterElement`. 
3. **Declarative UI**: `hh.div` and `hh.button` allow you to define the UI structure declaratively, while still providing full control over the DOM elements.
4. **Reactivity**: When you click the increment or decrement button, the `sets` function updates the state, which automatically updates the DOM because of the reactive binding.

## Advanced Usage

### Low-Level Example: Fine-Grained Control

Deleight gives you fine-grained control over the UI and state, enabling full flexibility in your application. Here’s an example of how to use the lower-level features, without relying on higher-level abstractions like `addTo`.

```javascript
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";

// Define the state
const state = { count: 0 };

// Build the counter element and bind it to the state
const counterElement = hh.div(state.count).build();

// Define the reactive object for updating state and DOM
const reactiveObject = {
    count: [state],
    textContent: [counterElement]
};

// Create increment and decrement buttons
const incrementButton = hh.button('Increment').assign({
    onclick() { sets(reactiveObject, state.count + 1); }
}).build();

const decrementButton = hh.button('Decrement').assign({
    onclick() { sets(reactiveObject, state.count - 1); }
}).build();

// Append the elements to the document
document.body.append(decrementButton, counterElement, incrementButton);
```

### How It Works:

1. **State Management**: The `state` object directly holds the `count` property, and `sets` is used to update it. 
2. **Fine-Grained Binding**: The `reactiveObject` explicitly links the `state.count` and `counterElement`. This gives you full control over which DOM elements are updated when state changes.
3. **Manual Updates**: Unlike higher-level abstractions, you manually define how and when the state is updated, making this approach more explicit.

In this version, you have complete control over the state updates and DOM bindings, which is especially useful for more complex use cases where you need full control over the behavior of your application.

## 📚 Documentation

- **[Deleight Tutorials](./tutorials.md)**  
  Step-by-step guides and practical examples to help you get started with Deleight.

- **[API Documentation](https://github.com/yourusername/deleight)**  
  Detailed reference for using Deleight's features and API.

---

## Contributing

We welcome contributions! Please feel free to submit issues or pull requests for bug fixes, improvements, or additional features.
