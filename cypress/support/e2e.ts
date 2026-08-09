// Cypress support file.
// Keep browser-wide setup here; scenario data stays inside each spec.

beforeEach(() => {
  cy.clearCookies();
  cy.clearLocalStorage();
});
