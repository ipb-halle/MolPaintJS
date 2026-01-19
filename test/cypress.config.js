const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    "baseURL": "http://localhost:16000/index.html",
    "fileServerFolder": "../molpaintjs",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
