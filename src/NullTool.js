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
"use strict";

var molPaintJS = (function (molpaintjs) {

    molpaintjs.NullTool = function(ctx) {

        var imgData = null;
        var originX = null;
        var originY = null;

        return {
            id : "nullTool",
            context : ctx,

            abort : function () { Tools.abort(this); },

            onClick : function (x, y, evt) { },

            onMouseDown : function (x, y, evt) { },

            onMouseMove : function (x, y, evt) { }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

