import { Actribute } from "../../dist/esm/actribute";
const act = new Actribute();

function tabd(tabPanels, tabButtons) {}

act.register("tabs", (element) => {
  // For simplicity the items have to include the next or previous buttons.
  // They do this with shared buttons here.
  element.title =
    "Tabs. Use the > and < keys to move to next and pravious items respectively.";

  // uses the none css display:none attribute to hide all but the current item
});

act.process();
