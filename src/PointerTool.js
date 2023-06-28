/*
 * MolPaintJS
 * Copyright 2017 - 2021 Leibniz-Institut f. Pflanzenbiochemie 
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

    molpaintjs.PointerTool = function(ctx, prop) {

        let distMax = prop.distMax;
        let origin;

        let mode = 0;              // 0 = select, 1 = move / rotate
        let actionList;

        function click (context, x, y, evt) {
            origin = null;
            if (mode == 0) {
                if(evt.ctrlKey) {
                    context.getDrawing().adjustSelection(1, 3, 0);
                } else {
                    context.getDrawing().adjustSelection(1, 1, 2);
                }
            } else {
                // save history
                for (let action of actionList.getActions()) {
                    let atomId = action.oldObject.getId();
                    action.newObject = context.getDrawing().getAtom(atomId).copy();
                }
                context.getHistory().appendAction(actionList);
                actionList = null;
            }
            context.draw();
        }

        function mouseDown (context, x, y, evt) {
            let coord = context.getView().getCoordReverse(x, y);
            let atomId = context.getDrawing().selectAtom(coord, distMax);

            if ((atomId == null) ||
               ((context.getDrawing().getAtom(atomId).getSelected() & 2) == 0)) {
                // select mode
                mode = 0;
                if(evt.shiftKey || evt.ctrlKey) {
                    context.getDrawing().clearSelection(1);
                } else {
                    context.getDrawing().clearSelection(7);
                }
            } else {
                // transform mode; prepare history
                actionList = molPaintJS.ActionList();
                let sel = context.getDrawing().getSelected(2); // return the selection
                for (let a1 of sel.atoms) {
                    let atom = context.getDrawing().getAtom(a1);
                    actionList.addAction(molPaintJS.Action("UPD", "ATOM", null, atom.copy()));
                }

                if (evt.shiftKey) {
                    // rotate
                    mode = 2;
                } else {
                    // translate
                    mode = 1;
                }
            }
            context.draw();
            origin = { 'x':x, 'y':y };
        }

        function mouseMove (context, x, y, evt) {
            if (origin != null) {
                switch (mode) {
                    case 0:
                        mouseMoveSelect(context, x, y, evt);
                        break;
                    case 1:
                        mouseMoveTranslate(context, x, y, evt);
                        break;
                    case 2:
                        mouseMoveRotate(context, x, y, evt);
                        break;
                }
            }
        }

        function mouseMoveSelect (context, x, y, evt) {
            let vctx = context.getView().getViewContext();
            let box = molPaintJS.Box(origin.x, origin.y, x, y);
            let mbox = context.getView().getBBoxReverse(box);
            context.getDrawing().clearSelection(1);
            context.getDrawing().selectBBox(mbox, 1, 0);
            context.draw();
            box.draw(vctx);
        }

        function mouseMoveRotate (context, x, y, evt) {
            let dx = x - origin.x;
            let sin = Math.sin(dx / 57.0 );
            let cos = Math.cos(dx / 57.0 );

            origin = { 'x':x, 'y':y };
            context.getDrawing().transform([[cos, sin, 0], [ (sin * -1.0), cos, 0]], 2);
            context.draw();
        }

        function mouseMoveTranslate (context, x, y, evt) {
            let coord = context.getView().getCoordReverse(x, y);
            let o = context.getView().getCoordReverse(origin.x, origin.y);
            let dx = coord.x - o.x;
            let dy = coord.y - o.y;

            origin = { 'x':x, 'y':y };
            context.getDrawing().transform([[1, 0, dx], [0, 1, dy]], 2);
            context.draw();
        }

        return {
            id : "pointer",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            onClick : function (x, y, evt) { 
                click(this.context, x, y, evt);
            },

            onMouseDown : function (x, y, evt) {
                let helper = this.context;
                mouseDown(this.context, x, y, evt);
            },

            onMouseMove : function (x, y, evt) {
                mouseMove(this.context, x, y, evt);
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

