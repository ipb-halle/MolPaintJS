// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("getAtomFromHistory", () => { 
    cy.window().then(win => {
        let context = win.molPaintJS.getContext("mol");
        let lastActions = context.getHistory().spy();
        for (let action of lastActions) {
            if ((action.actionType === "ADD")
                && (action.objectType === "ATOM")) {
                let atom = action.newObject;
                return atom;
            }
        }
        throw Error ("getAtomFromHistory(): no atom found");
        return null;
    });
});

