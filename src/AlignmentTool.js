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

        let context = ctx;

        return {

            alignBottom : function () {
            },

            alignHorizontal : function () {
            },

            alignLeft : function () {
            },

            alignRight : function () {
            },

            alignTop : function () {
            },

            alignVertical : function () {
            },

            distributeHorizontal : function () {
            },

            distributeVertical : function () {
            },

            align : function (type) {
                switch (type) {
                    case "align_bottom" :
                        this.alignBottom();
                        break;
                    case "align_horizontal" :
                        this.alignHorizontal();
                        break;
                    case "align_left" :
                        this.alignLeft();
                        break;
                    case "align_right" :
                        this.alignRight();
                        break;
                    case "align_top" :
                        this.alignTop();
                        break;
                    case "align_vertical" :
                        this.alignVertical;
                        break;
                    case "distribute_horizontal" :
                        this.distributeHorizontal();
                        break;
                    case "distribute_vertical" :
                        this.distributeVertical();
                        break;
                }
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

