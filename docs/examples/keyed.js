import { templates, createFragment } from "../../src/apriori.js";
import { apply, parentSelector } from "../../src/appliance.js";
import { set, update } from "../../src/queryoperator.js";
import { preventDefault, stopPropagation, eventListener, matchListener} from "../../src/eutility.js";
import { one } from "../../src/onetomany.js";
import { range, items } from "../../src/generational.js";

function _random(max) {
  return Math.round(Math.random() * 1000) % max;
}
const adjectives = ["pretty","large","big","small","tall","short","long","handsome","plain","quaint","clean", "elegant","easy","angry","crazy","helpful","mushy","odd","unsightly","adorable", "important","inexpensive","cheap","expensive","fancy",];
const colours = ["red","yellow","blue","green","pink","brown","purple","brown","white","black","orange",];
const nouns = ["table","chair","house","bbq","desk","car","pony","cookie","sandwich","burger","pizza","mouse","keyboard",];

const itemTemplate = templates(
`
<tr>
    <td class='col-md-1'>\${indices[item]}</td>
    <td class='col-md-4'><a class='lbl'>\${data[item]}</a></td>
    <td class='col-md-1'>
        <a class='remove'>
            <span class='remove glyphicon glyphicon-remove' aria-hidden='true'></span>
        </a>
    </td>
    <td class='col-md-6'></td>
</tr>
`,
  ["indices", "data"],
);

function data(data, indices) {
  return {
    index: 1,
    *createIndices(n) {
      const start = this.index;
      const end = (this.index += n);
      for (let i = start; i < end; i++) yield i;
    },
    *createLabels(n) {
      for (let i = 0; i < n; i++) {
        yield `${adjectives[_random(adjectives.length)]} ${colours[_random(colours.length)]} ${nouns[_random(nouns.length)]}`;
      }
    },
    build(n) {
      indices.push(...this.createIndices(n));
      data.push(...this.createLabels(n));
    },
    create(n) {
      this.clear();
      this.build(n);
    },
    append(n) {
      this.build(n);
    },
    update() {
      const length = data.length;
      for (let i = 0; i < length; i += 10) data[i] += " !!!";
    },
    clear() { data.length = indices.length = 0 },
    swap() {
      if (data.length >= 999) {
        [data[1], data[998], indices[1], indices[998]] = [data[998], data[1], indices[998], indices[1]];
      }
    },
    remove(element) {
      const index = Array.from(element.parentNode.children).indexOf(element);
      data.splice(index, 1); indices.splice(index, 1);
    },
  };
}

function view(table, data, indices) {
  return {
    create(n) {
      this.clear();
      this.append(n);
    },
    append(n) {
      const length = data.length;
      const renderedItems = [...itemTemplate( range(length - n, length), indices, data)];
      table.appendChild(createFragment(renderedItems.join('')));
    },
    update() {
      apply(
        {
          "a.lbl": (...labels) => {
            const indices = [...range(0, data.length, 10)];
            set(items(labels, indices), {
              textContent: items(data, indices),
            });
          },
        },
        table,
      );
    },
    clear() {
      table.innerHTML = "";
    },
    swap() {
      if (table.children.length >= 999) {
        update(
          [...items(table.children, [1, 998])],
          [...items(table.children, [998, 1])],
        );
      }
    },
    remove(element) {
      table.removeChild(element);
    },
  };
}

apply({
  tbody: (table) => {
    const context = [[], []];  // data, indices
    const component = one({data: data(...context), view: view(table, ...context)});

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
      component.remove([parentSelector(e.target, "tr")]);
    };

    table.addEventListener(
      "click",
      matchListener({
        "a.lbl": (e) => select(e.target.parentNode.parentNode),
        "span.remove": eventListener(
          [removeListener, preventDefault, stopPropagation],
          {},
        ),
      }),
    );

    const btnListener = (fn) => (btn) => btn.addEventListener("click", fn);

    apply({
      "#run": btnListener((e) => e.stopPropagation() || component.create(1000)),
      "#runlots": btnListener((e) => e.stopPropagation() || component.create(10000)),
      "#add": btnListener((e) => e.stopPropagation() || component.append(1000)),
      "#update": btnListener((e) => e.stopPropagation() || component.update()),
      "#clear": btnListener((e) => e.stopPropagation() || component.clear()),
      "#swaprows": btnListener((e) => e.stopPropagation() || component.swap()),
    });
  },
});
