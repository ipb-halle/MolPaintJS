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

function PointerTool(ctx, prop) {

    this.id = "pointer";

    this.mode = 0;              // 0 = select, 1 = move / rotate

    this.context = ctx;
    this.distMax = prop.distMax;
    this.origin = null;

    this.abort = function () {
        Tools.abort(this);
    }

    this.onClick = function (x, y, evt) {
        this.origin = null;
        if (this.mode == 0) {
            if(evt.ctrlKey) {
                this.context.molecule.adjustSelection(1, 3, 0);
            } else {
                this.context.molecule.adjustSelection(1, 1, 2);
            }
        } else {
            // TODO: save history
        }
        this.context.draw();
    }

    this.onMouseDown = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);
        var atomId = this.context.molecule.selectAtom(coord, this.distMax);

        if ((atomId == null) ||
           ((this.context.molecule.getAtom(atomId).getSelected() & 2) == 0)) {
            this.context.debug("SELECT " + atomId);
            // select mode
            this.mode = 0;
            if(evt.shiftKey || evt.ctrlKey) {
                this.context.molecule.clearSelection(1);
            } else {
                this.context.molecule.clearSelection(3);
            }
        } else {
            // transform mode
            if (evt.shiftKey) {
                // rotate
                this.context.debug('ROTATE');
                this.mode = 2;
            } else {
                // translate
                this.context.debug('TRANSLATE');
                this.mode = 1;
            }
        }
        this.context.draw();
        this.origin = { 'x':x, 'y':y };
    }

    this.onMouseMove = function (x, y, evt) {
        if (this.origin != null) {
            switch (this.mode) {
                case 0:
                    this.onMouseMoveSelect(x, y, evt);
                    break;
                case 1:
                    this.onMouseMoveTranslate(x, y, evt);
                    break;
                case 2:
                    this.onMouseMoveRotate(x, y, evt);
                    break;
            }
        }
    }

    this.onMouseMoveSelect = function (x, y, evt) {
        var vctx = this.context.view.getContext();
        var box = new Box(this.origin.x, this.origin.y, x, y);
        var mbox = this.context.view.getBBoxReverse(box);
        this.context.molecule.clearSelection(1);
        this.context.molecule.selectBBox(mbox, 1, 0);
        this.context.draw();
        box.draw(vctx);
    }

    this.onMouseMoveRotate = function (x, y, evt) {
        var dx = x - this.origin.x;
        var sin = Math.sin(dx / 57.0 );
        var cos = Math.cos(dx / 57.0 );

        this.origin = { 'x':x, 'y':y };
        this.context.molecule.transform([[cos, sin, 0], [ (sin * -1.0), cos, 0]], 2);
        this.context.draw();
    }

    this.onMouseMoveTranslate = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);
        var o = this.context.view.getCoordReverse(this.origin.x, this.origin.y);
        var dx = coord.x - o.x;
        var dy = coord.y - o.y;

        this.origin = { 'x':x, 'y':y };
        this.context.molecule.transform([[1, 0, dx], [0, 1, dy]], 2);
        this.context.draw();
    }
}

