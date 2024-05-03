import { report } from "./report.mjs";

import {
  insert,
  inserter,
  set,
  update,
  createRange,
  remove,
} from "../src/domitory.js";
import { createFragment, arrayTemplate } from "../src/apriori.js";
import { apply } from "../src/appliance.js";
import { range, items } from "../src/generational.js";

Object.assign(
  window,
  { insert, inserter, set, update, createRange, remove },
  { createFragment, arrayTemplate },
  { apply, range, report, items },
);

window.expectedBodyContent = await fetch("./domitory.json").then((r) =>
  r.json(),
);
window.bodyContent = [];

let expected, got;

// 1. setup:
document.body.innerHTML = "";
window.bodyContent.push([document.body.innerHTML, "domitory"]);

// 1. insert
insert(
  [document.body],
  [
    createFragment(`
    <h1>Title</h1>
    <main>[[Nothing yet]]</main>
    <footer>Cheers</footer>
`),
  ],
);
window.bodyContent.push([document.body.innerHTML, "domitory.insert (basic)"]);

apply({
  main: (main) => {
    main.innerHTML = "";
    insert(
      [main],
      [
        createFragment(
          arrayTemplate(`
            <article>
                <h2>Article \${item}</h2>
                <p>No body for now</p>
            </article>
        `)(range(1, 20)),
        ),
      ],
    );

    expected = 19;
    got = main.children.length;
    report("domitory.insert (basic usage 2)", expected, got);
  },
});
window.bodyContent.push([document.body.innerHTML, "domitory.insert (append)"]);

apply({
  main: (main) => {
    const newElements = createFragment(
      arrayTemplate(`
        <p>
            Now adding content to article \${item}
        </p>
        `)(range(1, 20)),
    ).children;
    const lastChildren = Array.from(main.children).map(
      (c) => c.lastElementChild,
    );
    insert(lastChildren, newElements, inserter.before);
  },
});
window.bodyContent.push([document.body.innerHTML, "domitory.insert (before"]);

// set
apply({
  main: (main) => {
    const newContent = [...range(101, 120)].map((i) => `My index is  now ${i}`);
    const lastChildren = Array.from(main.children).map(
      (c) => c.lastElementChild,
    );
    set(lastChildren, { textContent: newContent });
  },
});
window.bodyContent.push([document.body.innerHTML, "domitory.set (properties)"]);

apply({
  main: (main) => {
    const newContent = items(
      [...range(101, 120)].map((i) => "background-color: navy; color: white"),
      range(5, 15, 2),
    );
    const firstChildren = items(
      Array.from(main.children).map((c) => c.firstElementChild),
      range(5, 15, 2),
    );
    set(firstChildren, { _style: newContent });
  },
});
window.bodyContent.push([document.body.innerHTML, "domitory.set (attributes)"]);

// update
apply({
  main: (main) => {
    let newElements = createFragment(
      arrayTemplate(`
        <h2 style="background-color: yellow;">
            Now this is a new title \${item}
        </h2>
        `)(range(1, 20)),
    ).children;
    newElements = items(newElements, range(0, 7));
    const firstChildren = items(
      Array.from(main.children).map((c) => c.firstElementChild),
      range(7),
    );
    update(firstChildren, newElements);
  },
});
window.bodyContent.push([document.body.innerHTML, "domitory.update"]);

// remove
apply({
  main: (main) => {
    const lastChildren = items(
      Array.from(main.children).map((c) => c.lastElementChild),
      range(7, 17),
    );
    remove(lastChildren);
  },
});
window.bodyContent.push([document.body.innerHTML, "domitory.remove"]);

for (let i = 0; i < window.bodyContent.length; i++) {
  report(
    window.bodyContent[i][1],
    expectedBodyContent[i][0],
    window.bodyContent[i][0],
  );
}
