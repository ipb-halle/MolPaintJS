/*
 * Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
 * See LICENSE in the project root for license information.
 */

/* global document, Office, Word */

Office.onReady((info) => {
  if (info.host === Office.HostType.Word) {
    initPlugin();
    document.getElementById("insertDrawing").onclick = () => tryCatch(insertDrawing);
    document.getElementById("sideload-msg").style.display = "none";
    document.getElementById("app-body").style.display = "flex";
  }
});

async function initPlugin() {
    molPaintJS.setProperty("FontAwesomePath", "molpaintjs/assets/fontawesome/css/");
    molPaintJS.newContext("mol", {sizeX:400, sizeY:400, })
        .init();
}

async function insertDrawing() {
    await Word.run(async (context) => {
        imageData = molPaintJS.getImage("mol");
        context.document.body.insertInlinePictureFromBase64(
            imageData, 
            Word.InsertLocation.end);
    });
}

async function tryCatch(callback) {
    try {
        callback();
    } catch (error) {
        console.error(error);
    }
}

