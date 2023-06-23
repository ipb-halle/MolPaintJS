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

    molpaintjs.RadicalTool = function(ctx, prop) {

        let distMax = prop.distMax;
        let type = "radical";

        return {
            id : "radical",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            getType : function () {
                return type;
            },

            onClick : function (x, y, evt) {
                let coord = this.context.getView().getCoordReverse(x, y);
                let atomId = this.context.getMolecule().selectAtom(coord, distMax);
                if (atomId != null) {

                    let actionList = molPaintJS.ActionList();
                    let atom = this.context.getMolecule().getAtom(atomId);
                    let oldAtom = atom.copy();

                    switch (type) {
                        case "singlet" :
                            atom.setRadical(1);
                            break;
                        case "doublet" :
                            atom.setRadical(2);
                            break;
                        case "triplet" :
                            atom.setRadical(3);
                            break;
                        case "no_radical" :
                            atom.setRadical(0);
                            break;
                    }
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
                let destIconId = this.context.contextId + "_radical";
                let icon = document.getElementById(destIconId);
                icon.src = molPaintJS.Resources[type + ".png"]; 
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

