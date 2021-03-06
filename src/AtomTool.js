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

    molpaintjs.AtomTool = function (ctx, prop, i) {

        var distMax = prop.distMax;
        var atom = null;

        return {
            context : ctx,
            id : i,

            abort : function () {
                molPaintJS.Tools.abort(this);
                atom = null;
            },

            /**
             * create new single atom or change type of
             * an existing atom
             */
            onClick : function (x, y, evt) {
                var coord = this.context.getView().getCoordReverse(x, y);
                var atomId = this.context.getMolecule().selectAtom(coord, distMax);
                var at = molPaintJS.AtomType();
                at.setIsotope(this.context.getCurrentElement());
                at.setColor(this.context.getCurrentElement().getColor());
                var actionList = molPaintJS.ActionList();
                var oldAtom = null;

                if (atomId == null) {
                    atom = molPaintJS.Atom();
                    atom.setX(coord.x);
                    atom.setY(coord.y);
                    atom.setZ(0.0);
                    atom.setType(at);
                    this.context.getMolecule().addAtom(atom, null);
                    actionList.addAction(molPaintJS.Action("ADD", "ATOM", atom, null));
                } else {
                    oldAtom = this.context.getMolecule().getAtom(atomId);
                    atom = oldAtom.copy();
                    atom.setType(at);
                    this.context.getMolecule().replaceAtom(atom);
                    actionList.addAction(molPaintJS.Action("UPD", "ATOM", atom, oldAtom));
                }

                this.context.getHistory().appendAction(actionList);
                this.context.draw();

                atom = null;
            },

            onMouseDown : function (x, y, evt) {
            },

            onMouseMove : function (x, y, evt) {
            },

            setup : function () {
                var iconId = this.context.contextId + "_customElement";
                var e = document.getElementById(iconId);
                var sym = this.context.getCurrentElement().getSymbol();
                switch (sym) {
                    case "H":
                    case "C":
                    case "N":
                    case "O":
                        e.innerHTML = "";
                        break;
                    default :
                        e.innerHTML = sym;
                        e.style.color = this.context.getCurrentElement().getColor();
                }
            }

        };
    }
    return molpaintjs;
}(molPaintJS || {}));
