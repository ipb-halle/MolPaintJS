/*
 * MolPaintJS
 * Copyright 2017 - 2024 Leibniz-Institut f. Pflanzenbiochemie
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
var molPaintJS = (function (molpaintjs) {
    "use strict";

    molpaintjs.AlignmentTool = function(ctx) {

        const context = ctx;
        const drawing = context.getDrawing();
        let actionList = molPaintJS.ActionList();
        let boundingBoxes = {};
        let commonBoundingBox = null;
        let selectedChemObjects = {};
        let selectedChemObjectCount = 0;

        return {

            alignBottom : function (cid) {
                let box = boundingBoxes[cid];
                let dy = commonBoundingBox.getMinY() - box.getMinY();
                return [[1, 0, 0], [0, 1, dy]];
            },

            alignHorizontal : function (cid) {
            },

            alignLeft : function (cid) {
                let box = boundingBoxes[cid];
                let dx = commonBoundingBox.getMinX() - box.getMinX();
                return [[1, 0, dx], [0, 1, 0]];
            },

            alignRight : function (cid) {
                let box = boundingBoxes[cid];
                let dx = commonBoundingBox.getMaxX() - box.getMaxX();
                return [[1, 0, dx], [0, 1, 0]];
            },

            alignTop : function (cid) {
                let box = boundingBoxes[cid];
                let dy = commonBoundingBox.getMaxY() - box.getMaxY();
                return [[1, 0, 0], [0, 1, dy]];
            },

            alignVertical : function (cid) {
            },

            distributeHorizontal : function (cid) {
            },

            distributeVertical : function (cid) {
            },

            prepareChemObjects : function () {
                selectedChemObjects = context.getDrawing().getSelectedChemObjects(2);
                for (let cid in selectedChemObjects) {
                    let box = selectedChemObjects[cid].computeBBox(0);
                    selectedChemObjectCount++;
                    if (selectedChemObjectCount > 1) {
                        commonBoundingBox.join(box);
                    } else {
                        commonBoundingBox = box;
                    }
                    boundingBoxes[cid] = box;
                }
                return (selectedChemObjectCount > 1);
            },

            alignObject : function (type, cid) {
                let matrix = null;
                switch (type) {
                    case "align_bottom" :
                        matrix = this.alignBottom(cid);
                        break;
                    case "align_horizontal" :
                        matrix = this.alignHorizontal(cid);
                        break;
                    case "align_left" :
                        matrix = this.alignLeft(cid);
                        break;
                    case "align_right" :
                        matrix = this.alignRight(cid);
                        break;
                    case "align_top" :
                        matrix = this.alignTop(cid);
                        break;
                    case "align_vertical" :
                        matrix = this.alignVertical(cid);
                        break;
                    case "distribute_horizontal" :
                        matrix = this.distributeHorizontal(cid);
                        break;
                    case "distribute_vertical" :
                        matrix = this.distributeVertical(cid);
                        break;
                }
                let chemObject = selectedChemObjects[cid].deepCopy();
                chemObject.transform(matrix, 0);
                drawing.replaceChemObject(chemObject);
                actionList.addAction(molPaintJS.Action("UPD", "CHEMOBJECT", chemObject, selectedChemObjects[cid]));
            },

            align : function (type) {
                if (! this.prepareChemObjects()) {
                    console.log("no objects");
                    return;
                }
                for (let cid in selectedChemObjects) {
                    this.alignObject(type, cid);
                }
                context.getHistory().appendAction(actionList);
                context.draw();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

