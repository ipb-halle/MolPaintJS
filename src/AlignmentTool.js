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
        let boundingBoxes = {};
        let chemObjectIds = [];
        let commonBoundingBox = null;
        let selectedChemObjects = {};
        let selectedChemObjectCount = 0;

        return {

            alignBottom : function (cid) {
                let box = boundingBoxes[cid];
                let dy = commonBoundingBox.getMaxY() - box.getMaxY();
                return [[1, 0, 0], [0, 1, dy]];
            },

            alignHorizontal : function (cid) {
                let box = boundingBoxes[cid];
                let horizontY = commonBoundingBox.getMinY()
                    + (commonBoundingBox.getMaxY() - commonBoundingBox.getMinY()) / 2;
                let dy = box.getMinY()
                    + (box.getMaxY() - box.getMinY()) / 2;
                dy = horizontY - dy;
                return [[1, 0, 0], [0, 1, dy]];
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
                let dy = commonBoundingBox.getMinY() - box.getMinY();
                return [[1, 0, 0], [0, 1, dy]];
            },

            alignVertical : function (cid) {
                let box = boundingBoxes[cid];
                let verticalX = commonBoundingBox.getMinX()
                    + (commonBoundingBox.getMaxX() - commonBoundingBox.getMinX()) / 2;
                let dx = box.getMinX()
                    + (box.getMaxX() - box.getMinX()) / 2;
                dx = verticalX - dx;
                return [[1, 0, dx], [0, 1, 0]];
            },

            distributeHorizontal : function (cid, index) {
                let last = selectedChemObjectCount - 1;
                if ((index == 0) || (index == last)) {
                    return [[1, 0, 0], [0, 1, 0]];
                }
                let box = boundingBoxes[cid];
                let dx = boundingBoxes[chemObjectIds[last]].getCenterX()
                    - boundingBoxes[chemObjectIds[0]].getCenterX();
                dx = (dx * index) / last;
                dx -= box.getCenterX();
                dx += boundingBoxes[chemObjectIds[0]].getCenterX();
                return [[1, 0, dx], [0, 1, 0]];
            },

            distributeVertical : function (cid, index) {
                let last = selectedChemObjectCount - 1;
                if ((index == 0) || (index == last)) {
                    return [[1, 0, 0], [0, 1, 0]];
                }
                let box = boundingBoxes[cid];
                let dy = boundingBoxes[chemObjectIds[last]].getCenterY()
                    - boundingBoxes[chemObjectIds[0]].getCenterY();
                dy = (dy * index) / last;
                dy -= box.getCenterY();
                dy += boundingBoxes[chemObjectIds[0]].getCenterY();
                return [[1, 0, 0], [0, 1, dy]];
            },

            compareCenterX : function (a, b) {
                return boundingBoxes[a].getCenterX() - boundingBoxes[b].getCenterX();
            },

            sortByCenterY : function (a, b) {
                return boundingBoxes[a].getCenterY() - boundingBoxes[b].getCenterY();
            },

            prepareChemObjects : function () {
                selectedChemObjects = context.getDrawing().getSelectedChemObjects(2);
                for (let cid in selectedChemObjects) {
                    let box = selectedChemObjects[cid].computeBBox(0);
                    selectedChemObjectCount++;
                    if (selectedChemObjectCount > 1) {
                        commonBoundingBox.join(box);
                    } else {
                        commonBoundingBox = box.copy();
                    }
                    boundingBoxes[cid] = box;
                    chemObjectIds.push(cid);
                }
                return (selectedChemObjectCount > 1);
            },

            prepareDistribution : function (type) {
                switch (type) {
                    case "distribute_horizontal" : chemObjectIds.sort(this.compareCenterX);
                        break;
                    case "distribute_vertical" : chemObjectIds.sort(this.compareCenterY);
                        break;
                }
            },

            alignObject : function (type, index) {
                let matrix = null;
                let cid = chemObjectIds[index];
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
                        matrix = this.distributeHorizontal(cid, index);
                        break;
                    case "distribute_vertical" :
                        matrix = this.distributeVertical(cid, index);
                        break;
                }
                let chemObject = selectedChemObjects[cid].deepCopy();
                chemObject.transform(matrix, 0);
                drawing.replaceChemObject(chemObject);
            },

            align : function (type) {
                if (! this.prepareChemObjects()) {
                    console.log("no objects");
                    return;
                }
                drawing.begin();
                this.prepareDistribution();
                for (let i in chemObjectIds) {
                    this.alignObject(type, i);
                }
                drawing.commit(context);
                context.draw();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

