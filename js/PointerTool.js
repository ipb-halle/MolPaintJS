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

function PointerTool(ctx) {

    this.id = "pointer";

    this.context = ctx;
    this.imgData = null;
    this.originX = null;
    this.originY = null;

    this.abort = function () {
        Tools.abort(this);
    }

    this.onClick = function (x, y, evt) {
        this.originX = null;
        this.originY = null;
        if(evt.ctrlKey) {
            this.context.molecule.adjustSelection(1, 3, 0);
        } else {
            this.context.molecule.adjustSelection(1, 1, 2);
        }
        this.context.draw();
    }

    this.onMouseDown = function (x, y, evt) {
        if(evt.shiftKey || evt.ctrlKey) {
            this.context.molecule.clearSelection(1);
        } else {
            this.context.molecule.clearSelection(3);
        }
        this.context.draw();
        this.originX = x;
        this.originY = y;

        //this.imgData = vctx.getImageData(0, 0, 
        //	this.context.view.sizeX,
        //	this.context.view.sizeY);
    }

    this.onMouseMove = function (x, y, evt) {
        if (this.originX != null) {
            var vctx = this.context.view.getContext();
            var box = new Box(this.originX, this.originY, x, y);
            var mbox = this.context.view.getBBoxReverse(box);
            this.context.molecule.clearSelection(1);
            this.context.molecule.selectBBox(mbox, 1, 0);
            this.context.draw();
            box.draw(vctx);
        }
    }
}

