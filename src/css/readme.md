# Deleight/css

This module exports primitives to simplify CSS style handling on a web page. It includes functions to succinctly create stylesheets from CSS text, CSS files or endpoints and to process document trees to extract stylesheets from  `style` and `link` elements. Deleight/css also has functions to select and manipulate style rules that match specified queries. 

The StyleSheet class can be used to add or remove the css stylesheet it wraps as an adopted style to one or more elements at the same time. This primitive also provides a 'simple' interface for accessing the rules within its css stylesheet like object members.


## Examples

### Create a CSSStyleSheet from CSS text

```js
import { createStyle } from 'deleight/css'
const css = `
    .hd {
        background-color: navy;
        color: white;
    }
`;
const style = createStyle(css);
```

### Create a CSSStyleSheet from a CSS file

my/component.css
```css
.hd {
    background-color: navy;
    color: white;
}
```

```js
import { loadStyle } from 'deleight/css'
const style = await loadStyle('./my/component.css');
```

### Create CSSStyleSheets from a document tree

```html
<body>
    <div>
        <style>${css}</style>
        <div>
            <link rel="stylesheet" href="page.css">
        </div>
        <style>${css}</style>
        <div><div><link rel="stylesheet" href="page.css"></div></div>
    </div>
</body>
```

```js
import { popStyles } from 'deleight/css'
[...document.body.querySelectorAll('style, link')].length;   // 4
const extractedStyles = [...popStyles(document.body)];   // [CSSStyleSheet, Promise<CSSStyleSheet>, CSSStyleSheet, Promise<CSSStyleSheet>]
extractedStyles.length;          // 4
[...document.body.querySelectorAll('style, link')].length;   // 0
```


### Apply a CSSStyleSheet to multiple elements, fragments, shadow roots and/or documents

```js
import { StyleSheet, createStyle } from 'deleight/css'
const css = `
    .hd {
        background-color: navy;
        color: white;
    }
`;
const stylesheet = new StyleSheet(createStyle(css));
stylesheet.add(...document.querySelectorAll('.marksafe'));
```

### Remove a CSSStyleSheet from multiple elements, fragments, shadow roots and/or documents

```js
import { StyleSheet, createStyle } from 'deleight/css'
const css = `
    .hd {
        background-color: navy;
        color: white;
    }
`;
const stylesheet = new StyleSheet(createStyle(css));
stylesheet.add(...document.querySelectorAll('.marksafe, .markdanger'));
stylesheet.remove(...document.querySelectorAll('.markdanger'));

```

## Get style rules from a CSSStyleSheet

```js
import { StyleSheet, createStyle } from 'deleight/css'
const css = `
    div {color: blue}
    article {color: yellow;}
    section {color: yellow;}
`;
const stylesheet = new StyleSheet(createStyle(css));
stylesheet.get('div').cssText;    // div {color: blue}
```

## Update style rules in a CSSStyleSheet

```js
import { StyleSheet, createStyle } from 'deleight/css'
const css = `
    div {color: blue}
    article {color: yellow;}
    section {color: yellow;}
`;
const stylesheet = new StyleSheet(createStyle(css));
const divStyle = stylesheet.get('div');
divStyle.cssText;    // div {color: blue}
stylesheet.set('div', 'civ {color: brown}');
divStyle.cssText;    // div {color: brown}
```

## Delete style rules from a CSSStyleSheet

```js
import { StyleSheet, createStyle } from 'deleight/css'
const css = `
    div {color: blue}
    article {color: yellow;}
    section {color: yellow;}
`;
const stylesheet = new StyleSheet(createStyle(css));
const divStyle = stylesheet.get('div');
divStyle.cssText;    // div {color: blue}
stylesheet.delete('div');
stylesheet.get('div');    // undefined
```

