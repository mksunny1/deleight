## 📖 Deleight Tutorials

Welcome to the **Deleight Tutorials** repository! 🚀  
This repo contains step-by-step guides and practical examples to help you understand and master **Deleight**.

### 📌 What You’ll Learn
- Creating dynamic UI with **Deleight**.
- Managing **state and reactivity**.
- Handling **user input** and forms.
- Fetching **data from APIs**.
- Using **conditional rendering**.
- Implementing **frontend routing**.
- Server-side rendering with **Deleight on the backend**.

---

# **1️⃣ Counter Example (Basic State Management)**

This example demonstrates **reactive state management** using Deleight.  

### **Code**
```js
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";

const counterState = { count: 0 };
const counterElement = hh.div(counterState.count).build();

const reactiveObject = {
    count: [counterState],
    textContent: [counterElement]
};

const incrementButton = hh.button('Increment').assign({
    onclick() { sets(reactiveObject, counterState.count + 1) }
}).build();

const decrementButton = hh.button('Decrement').assign({
    onclick() { sets(reactiveObject, counterState.count - 1) }
}).build();

document.body.append(decrementButton, counterElement, incrementButton);
```

### **How It Works**
1. `counterState` stores the count value.
2. `reactiveObject` binds the `count` property to both state and DOM.
3. `sets` updates **both the state and the DOM** automatically.
4. `incrementButton` and `decrementButton` modify the state when clicked.

---

# **2️⃣ Todo List (Dynamic List Updates)**

### **Code**
```js
import { hh } from "deleight/dom/builder";
import { ElementList } from "deleight/lists";

const todos: [];
const listElement = hh.ul().build();

const todoElementList = new ElementList(listElement, 1, item => hh.li(item).build());
const reactiveObject = [todos, todoElementList]

const addTodo = (text) => {
    calls({ push: reactiveObject })
};

const input = hh.input().build();
const button = hh.button("Add Todo").assign({
    onclick() { addTodo(input.value); input.value = ''; }
}).build();

document.body.append(input, button, listElement);
```

### **How It Works**
1. **State Management**: The `state.todos` array stores tasks.
2. **Dynamic Updates**: `sets` updates the DOM when items are added.
3. **Event Handling**: The button adds new tasks from the input field.

---

# **3️⃣ Form Handling (Reactive User Input)**

### **Code**
```js
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";

const state = { name: '' };
const input = hh.input().assign({ 
    oninput(event) { state.name = event.target.value; } 
}).build();

const display = hh.div(state.name).build();
const reactiveState = { textContent: [display], name: [state] };

document.body.append(input, display);
```

### **How It Works**
1. **Reactivity**: Updates the text as the user types.
2. **Binding**: `sets(state, value)` updates both state and DOM.

---

# **4️⃣ Conditional Rendering (Show/Hide Elements)**

### **Code**
```js
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";

const state = { visible: true };
const message = hh.div("Hello, Deleight!").build();
const toggleButton = hh.button("Toggle Message").assign({
    onclick() { sets({ 
        visible: [state, (value) => message.classList.toggle('visible') ]
        }, !state.visible); 
    }
}).build();

// This pattern is not normal in deleight. I recommend going directly and just toggling a class in the event handler instead of matching the visibility state with the value of a property.

document.body.append(toggleButton, message);
```

### **How It Works**
1. **Toggles visibility** using the `hidden` property.
2. **State Binding**: Updates both state and the DOM.

---

# **5️⃣ Fetching & Displaying API Data**

### **Code**
```js
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";
import { ElementList } from "deleight/lists/element";

const state = { users: [] };
const listElement = hh.ul().build();

const apiElementList = new ElementList(listElement, 1, (user) => hh.li(user.name).build());

fetch("https://jsonplaceholder.typicode.com/users")
    .then(res => res.json())
    .then(data => apiElementList.push(...data));

document.body.append(listElement);
```

### **How It Works**
1. **Fetches API data** and binds it to the DOM.
2. **Renders a list** dynamically.

---

# **6️⃣ Server-Side Rendering (Deleight on Backend)**

### **Example: Node.js Server**
```js
import { hh } from "deleight/dom/builder";

const content = hh.div("Hello from the server!");
console.log(content.render());
```

This outputs:
```html
<div>Hello from the server!</div>
```

### **How It Works**
1. **Runs Deleight in Node.js** to generate HTML.
2. **Can be used for server-side rendering (SSR).**

---

# **7️⃣ Frontend Routing (Simple Hash-Based Routing)**

### **Code**
```js
import { hh } from "deleight/dom/builder";
import { sets } from "deleight/object/shared";

const routes = {
    "#home": "Welcome to Home!",
    "#about": "About Us",
    "#contact": "Contact Us"
};

const state = { page: routes[location.hash] || "404 Not Found" };
const content = hh.div(state.page).build();

window.onhashchange = () => content.textContent = routes[location.hash] || "404 Not Found";

document.body.append(content);
```

### **How It Works**
1. **Listens to hash changes** (`onhashchange`).
2. **Updates content dynamically**.
