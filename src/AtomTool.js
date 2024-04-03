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

        let distMax = prop.distMax;
        let atom = null;

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
                let coord = this.context.getView().getCoordReverse(x, y);
                let drawing = this.context.getDrawing();
                let atomId = drawing.selectAtom(coord, distMax);
                let atomType = molPaintJS.AtomType();
                let oldAtom = null;
                atomType.setIsotope(this.context.getCurrentElement());
                atomType.setColor(this.context.getCurrentElement().getColor());
                drawing.begin();

                if (atomId == null) {
                    atom = molPaintJS.Atom();
                    atom.setId(drawing.createAtomId());
                    atom.setX(coord.x);
                    atom.setY(coord.y);
                    atom.setZ(0.0);
                    atom.setType(atomType);
                    drawing.addAtom(atom);
                } else {
                    oldAtom = drawing.getAtom(atomId);
                    atom = oldAtom.copy();
                    atom.setType(atomType);
                    drawing.replaceAtom(atom);
                }

                drawing.commit(this.context);
                this.context.draw();
                atom = null;
            },

            onMouseDown : function (x, y, evt) {
            },

            onMouseMove : function (x, y, evt) {
            },

            setup : function () {
                let iconId = this.context.contextId + "_customElement";
                let e = document.getElementById(iconId);
                let sym = this.context.getCurrentElement().getSymbol();
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
