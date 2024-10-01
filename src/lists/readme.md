# Deleight/list

This module allows us to share a common interface between an array and the children list of an element. The 'interface' can also be implemented for other 
types of objects if the need arises in the future. The API is very similar to the one used to modify arrays with only the addition of `move`, `swap` and `clear` methods. 

The main purpose is to simplify working with the objects simultaneously, especialy when combined with [object](), [proxies]() and [process]() modules. 


## Examples

### Push to an array and an element's children list together

```js
import { ArrayList, ElementList } from 'deleight/list';

class AppElementList extends ElementList {
    render(val) {
        const child = document.createElement('li');
        child.textContent = val;
        return child;
    }
}

const lists = [
    new ArrayList([]), 
    new ElementList(document.querySelector('ul'))
]

for (let list of lists) list.push(1,2,3,4,5,6,7,8,9,10);

```

## Update together

```js
for (let list of lists) list.set(5, 'five');
```

## Splice together

```js
for (let list of lists) list.splice(2, 4, 'a', 'b', 'c', 'd');
```

### Swap together

```js
for (let list of lists) list.swap(5, 7)
```

### Clear together

```js
for (let list of lists) list.clear()
```
