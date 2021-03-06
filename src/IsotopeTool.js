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

    molpaintjs.IsotopeTool = function(ctx, prop) {

        var distMax = prop.distMax;
        var type = "isotope_up";

        return {
            id : "isotope",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            onClick : function (x, y, evt) {
                var coord = this.context.getView().getCoordReverse(x, y);
                var atomId = this.context.getMolecule().selectAtom(coord, distMax);
                if (atomId != null) {
                    var actionList = molPaintJS.ActionList();
                    var atom = this.context.getMolecule().getAtom(atomId);
                    var oldAtom = atom.copy();
                    var dir = (type == "isotope_up") ? 1 : -1;

                    atom.changeIsotope(dir);
                    this.context.getMolecule().replaceAtom(atom);
                    actionList.addAction(molPaintJS.Action("UPD", "ATOM", atom, oldAtom));
                    this.context.getHistory().appendAction(actionList);
                }
                this.context.draw();
            },

            onMouseDown : function (x, y, evt) {
            },

            onMouseMove : function (x, y, evt) {
            },

            setType : function(t) {
                type = t;
            },

            setup : function () {
                var destIconId = this.context.contextId + "_isotope";
                var icon = document.getElementById(destIconId);
                icon.src = molPaintJS.Resources[type + ".png"];
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

