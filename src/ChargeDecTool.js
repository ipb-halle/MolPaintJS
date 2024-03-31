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

    molpaintjs.ChargeDecTool = function (ctx, prop) {

        let distMax = prop.distMax;

        return {

            id : "minus",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            onClick : function (x, y, evt) {
                let coord = this.context.getView().getCoordReverse(x, y);
                let atomId = this.context.getDrawing().selectAtom(coord, distMax);
                if (atomId != null) {
                    let actionList = molPaintJS.ActionList();
                    let oldAtom = this.context.getDrawing().getAtom(atomId);
                    let atom = oldAtom.copy();
                    atom.chargeDecrement();
                    actionList.addAction(molPaintJS.Action("UPD","ATOM",atom,oldAtom));
                    this.context.getDrawing().replaceAtom(atom);
                    this.context.getHistory().appendAction(actionList);
                    this.context.draw();
                }
            },

            onMouseDown : function (x, y, evt) {
            },

            onMouseMove : function (x, y, evt) {
            },
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
