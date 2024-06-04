import { Sophistry } from "../../src/sophistry.js";
import { apply } from "../../src/appliance.js";
import { remove } from "../../src/queryoperator.js";
import {
    onEnter,
    preventDefault,
    eventListener,
} from "../../src/eutility.js";

const accountSophistry = new Sophistry();

// Components (notice the nesting, so easy to declare components elsewhere and reuse here.):
const views = {};

let currentView;

const onViewChange = (view) => {
    if (currentView) remove(currentView);
    currentView = view
} // remove existing view when a new one is added

const loginYes = (username) => profileView(username);  // show profile view whenlogged in
const logoutYes = () => loginView();                   // show login view when logged out


const loginNo = (msg) => loginNo.action(msg) || console.log("no views yet!");

function getView(name, map) {
    const frag = views[name]();

    // apply styles within
    const styles = accountSophistry.process(frag)[0];
    const view = Array.from(frag.children);
    apply(map, frag);

    // add this view, simultaneously removing any previously added inverse views.
    onViewChange(document.querySelector("main").appendChild(frag) && view);
    for (let style of styles) style.style(...view);
    return view;
}

/**
 * Call anytime from anywhere to build, show and setup behavior (components) on the login view.
 * It is like a LoginView component/custom element.
 * The profile view will be simultaneously removed
 */
function loginView() {
    // create the view
    getView("login", {
        "#loginForm": (form) => {
            // show/hide in response to logout/login event using the display_none css class
            apply(
                {
                    input: (input) => {
                        // simulate button click when enter is pressed. notice the tag name is the selector here!
                        input.onkeyup = eventListener([
                            onEnter,
                            () => login(input.value),
                            preventDefault,
                        ]);
                        apply(
                            {
                                // this is nested in here to create a closure around the input
                                "#loginButton": (button) => {
                                    // invoke login function when clicked
                                    button.onclick = eventListener(() => login(input.value));
                                },
                            },
                            form,
                        );
                    },
                    // report login error:
                    "#loginErrorBox": (box) =>
                    (loginNo.action = (msg) =>
                        (box.textContent = msg || "What happened?")),
                },
                form,
            );
        },
    });
}

/**
 * Call anytime from anywhere to build, show and setup behavior (components) on the profile view.
 * It is like a ProfileView component/custom element.
 * The login view will be simultaneously removed.
 *
 * The user argument is used within the view to provide obvious context.
 */
function profileView(username) {
    getView("profile", {
        "#profileBox": (box) => {
            // views:
            // code to setup profile info and the 2 tabs.

            // logout handler
            apply(
                {
                    "#userHeading": (h2) => {
                        h2.textContent = "Welcome " + username;
                        // bind content. can also bind attributes and if we dont rerender, just wrap with h.loginYes...
                    },
                    "#logoutButton": (button) => {
                        button.onclick = eventListener(logout);
                    },
                },
                box,
            );
        },
    });
}

/**
 * Set up the apriory tree factory functions used for building the views dynamically
 */
apply({
    "#loginTemplate": async (template) => {
        views.login = () => template.content.cloneNode(true);
        if (!window.page?.username) loginView();
    },
    "#profileTemplate": async (template) => {
        views.profile = () => template.content.cloneNode(true);
        if (window.page?.username) profileView(window.page.username);
    },
});

/**
 * Tries to login if account already exists, else calls signin
 * @param {*} username
 */
async function login(username) {
    if (Math.round(Math.random())) loginYes(username);
    else loginNo("Massive error occured");
}

async function logout() {
    logoutYes();
}
