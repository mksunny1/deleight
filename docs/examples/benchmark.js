import "../../src/browser.js";
import { createFragment } from "../../src/apriori.js";
import { apply, parentSelector } from "../../src/appliance.js";
import {
  preventDefault,
  stopPropagation,
  eventListener,
  matchListener,
} from "../../src/eventivity.js";

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}
const adjectives = [
  "pretty",
  "large",
  "big",
  "small",
  "tall",
  "short",
  "long",
  "handsome",
  "plain",
  "quaint",
  "clean",
  "elegant",
  "easy",
  "angry",
  "crazy",
  "helpful",
  "mushy",
  "odd",
  "unsightly",
  "adorable",
  "important",
  "inexpensive",
  "cheap",
  "expensive",
  "fancy",
];
const colours = [
  "red",
  "yellow",
  "blue",
  "green",
  "pink",
  "brown",
  "purple",
  "brown",
  "white",
  "black",
  "orange",
];
const nouns = [
  "table",
  "chair",
  "house",
  "bbq",
  "desk",
  "car",
  "pony",
  "cookie",
  "sandwich",
  "burger",
  "pizza",
  "mouse",
  "keyboard",
];

class Component {
  constructor(parent) {
    this.parent = parent;
    this.index = 0;
  }
  create(n) {
    this.clear();
    this.append(n);
  }
  append(n) {
    let markup = [];
    const a = this.index,
      z = (this.index += n);
    let lbl;
    for (let i = a; i < z; i++) {
      lbl =
        adjectives[_random(adjectives.length)] +
        " " +
        colours[_random(colours.length)] +
        " " +
        nouns[_random(nouns.length)];
      markup.push(
        `<tr><td class='col-md-1'>${i}</td><td class='col-md-4'><a class='lbl'>${lbl}</a></td><td class='col-md-1'><a class='remove'><span class='remove glyphicon glyphicon-remove' aria-hidden='true'></span></a></td><td class='col-md-6'></td></tr>`,
      );
    }
    this.parent.append(createFragment(markup.join("")));
  }
  swap() {
    if (this.parent.children.length >= 999) {
      const e998 = this.parent.children[998];
      this.parent.replaceChild(this.parent.children[1], e998);
      this.parent.insertBefore(e998, this.parent.children[1]);
    }
  }
  clear() {
    this.parent.innerHTML = "";
  }
}

apply({
  tbody: (table) => {
    const component = new Component(table);

    let selected;
    function select(node) {
      if (node === selected) {
        selected.className = selected.className ? "" : "danger";
      } else {
        if (selected) selected.className = "";
        node.className = "danger";
        selected = node;
      }
    }

    const removeListener = (e) => {
      table.removeChild(parentSelector(e.target, "tr"));
    };

    table.onclick = matchListener(
      {
        "a.lbl": (e) => select(e.target.parentNode.parentNode),
        "span.remove": [removeListener, preventDefault, stopPropagation],
      },
      true,
    );

    const btnListener = (fn) => (btn) => (btn.onclick = eventListener(fn));

    apply({
      "#run": btnListener(() => component.create(1000)),
      "#runlots": btnListener(() => component.create(10000)),
      "#add": btnListener(() => component.append(1000)),
      "#update": btnListener(() => {
        apply(
          {
            "a.lbl": (...lbls) => {
              const length = lbls.length;
              for (let i = 0; i < length; i += 10) {
                lbls[i].textContent += " !!!";
              }
            },
          },
          table,
        );
      }),
      "#clear": btnListener(() => component.clear()),
      "#swaprows": btnListener(() =>
        table.children.length >= 998 ? component.swap() : "",
      ),
    });
  },
});
