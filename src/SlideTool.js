/*
 * MolPaintJS
 * Copyright 2017 Leibniz-Institut f. Pflanzenbiochemie 
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

    /**
     * The SlideTool does not provide history as it does not affect
     * the coordinates of the molecule. Only the View is manipulated.
     */
    molpaintjs.SlideTool = function(ctx) {

        let origin = null;

        return {
            id : "slide",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            onClick : function (x, y, evt) {
                origin = null;
                this.context.draw();
            },

            onMouseDown : function (x, y, evt) {
                origin = { 'x' : x, 'y' : y };
            },

            onMouseMove : function (x, y, evt) {
                if (origin != null) {
                    let dx = x - origin.x;
                    let dy = y - origin.y;
                    origin = { 'x' : x, 'y' : y };
                    this.context.getView().slide(dx, dy);
                    this.context.draw();
                }
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
