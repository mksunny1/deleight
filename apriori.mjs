import { report } from "./report.mjs";
import {
  createFragment,
  get,
  tag,
  template,
  asyncTemplate,
  arrayTemplate,
  asyncArrayTemplate,
} from "../src/apriori.js";
const apriori = {
  createFragment,
  get,
  tag,
  template,
  asyncTemplate,
  arrayTemplate,
  asyncArrayTemplate,
};

let expected, got;

/**
 * apriori: For building markup
 */

// 1. create fragment (createFragment)
const frag1 = apriori.createFragment(`
    <p>Para 1</p>
    <p>Para 2</p>
`);
expected = "<p>Para 1</p><p>Para 2</p>";
got = Array.from(frag1.childNodes)
  .map((c) => c.outerHTML)
  .join("");
report("apriori.createFragment", expected, got);

// b.append(frag1);

// 2. load html (get)
got = await apriori.get("./apriori/get.html");
expected = `<article>\n    This is my first blog post\n</article>\n<article>\n    This is my second blog post\n</article>\n<aside>\n    By the way I am Sun\n</aside>\n<article>\n    My third blog post\n</article>\n`;
report("apriori.get", expected, got);

// b.appendChild(apriori.createFragment(html1))

// 3. Async template (tag)
got = await apriori.tag`I will wait for this ${Promise.resolve("promise")}!!!`;
expected = "I will wait for this promise!!!";
report("apriori.tag", expected, got);

// 4. template (template)
got = await apriori.template('I will render this ${"guy"} immediately!!!')();
expected = "I will render this guy immediately!!!";
report("apriori.template", expected, got);

// 5. async template (asyncTemplate)
got = await apriori.asyncTemplate(
  'I will wait for this ${Promise.resolve("promise")}!!!',
)();
expected = "I will wait for this promise!!!";
report("apriori.asyncTemplate", expected, got);

// 6. array template (arrayTemplate)
got = apriori.arrayTemplate("I will render this ${item} immediately!!!")([
  1, 2, 3, 4, 5,
]);
expected =
  "I will render this 1 immediately!!!I will render this 2 immediately!!!I will render this 3 immediately!!!I will render this 4 immediately!!!I will render this 5 immediately!!!";
report("apriori.arrayTemplate", expected, got);

got = apriori.arrayTemplate(
  "I will render this ${it}/${other} immediately!!!",
  ["other"],
  "it",
  " & ",
)([1, 2, 3, 4, 5], "(shared)");
expected =
  "I will render this 1/(shared) immediately!!! & I will render this 2/(shared) immediately!!! & I will render this 3/(shared) immediately!!! & I will render this 4/(shared) immediately!!! & I will render this 5/(shared) immediately!!!";
report(
  "apriori.arrayTemplate (correctly uses argNames, itemName and itemSep)",
  expected,
  got,
);

// 7. async array template (asyncArrayTemplate)
got = apriori.asyncArrayTemplate("I will async render this ${item}")(
  [1, 2, 3, 4, 5].map((i) => Promise.resolve(i)),
);
report(
  "apriori.asyncArrayTemplate (returns a Promise)",
  true,
  got instanceof Promise,
);
got = await got;
expected =
  "I will async render this 1I will async render this 2I will async render this 3I will async render this 4I will async render this 5";
report("apriori.asyncArrayTemplate", expected, got);

got = await apriori.asyncArrayTemplate(
  "I will async render this ${it}/${other}",
  ["other"],
  "it",
  " & ",
)(
  [1, 2, 3, 4, 5].map((i) => Promise.resolve(i)),
  "(shared)",
);
expected =
  "I will async render this 1/(shared) & I will async render this 2/(shared) & I will async render this 3/(shared) & I will async render this 4/(shared) & I will async render this 5/(shared)";
report(
  "apriori.asyncArrayTemplate (correctly uses argNames, itemName and itemSep)",
  expected,
  got,
);
