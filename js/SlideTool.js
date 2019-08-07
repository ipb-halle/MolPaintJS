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

/**
 * The SlideTool does not provide history as it does not affect 
 * the coordinates of the molecule. Only the View is manipulated.
 */
function SlideTool(ctx) {

    this.id = "slide";

    this.context = ctx;
    this.origin = null;

    this.abort = function () {
        Tools.abort(this);
    }

    this.onClick = function (x, y, evt) {
        this.origin = null;
        this.context.draw();
    }

    this.onMouseDown = function (x, y, evt) {
        this.origin = { 'x' : x, 'y' : y };
    }

    this.onMouseMove = function (x, y, evt) {
        if (this.origin != null) {
            var dx = x - this.origin.x;
            var dy = y - this.origin.y;
            this.origin = { 'x' : x, 'y' : y };
            this.context.view.slide(dx, dy);
            this.context.draw();
        }
    }
}

