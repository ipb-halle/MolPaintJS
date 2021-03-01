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

    molpaintjs.EraserTool = function (ctx, prop) {

        var distMax = prop.distMax;
        var actionList;

        return {
            id : "eraser",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            /**
             * erase a single atom and all of its bonds
             */
            eraseAtom : function (id) {
                var actionList = molPaintJS.ActionList();
                var atom = this.context.getMolecule().getAtom(id);
                for (var b in atom.getBonds()) {
                    var bond = this.context.getMolecule().getBond(b);
                    actionList.addAction(molPaintJS.Action("DEL", "BOND", null, bond));
                    context.getMolecule().delBond(bond);
                }
                actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, atom));
                this.context.getMolecule().delAtom(atom);
                this.context.getHistory().appendAction(actionList);
                this.context.draw();
            },

            /**
             * erase a single bond. If one or both of its atoms
             * have no more bonds left they're erased as well.
             */
            eraseBond : function (id) {
                var actionList = molPaintJS.ActionList();
                var bond = this.context.getMolecule().getBond(id);
                var atomA = bond.getAtomA();
                var atomB = bond.getAtomB();
                actionList.addAction(molPaintJS.Action("DEL", "BOND", null, bond));
                this.context.getMolecule().delBond(bond);
                if (Object.keys(atomA.getBonds()).length == 0) {
                    actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, atomA));
                    this.context.getMolecule().delAtom(atomA);
                }
                if (Object.keys(atomB.bonds).length == 0) {
                    actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, atomB));
                    this.context.getMolecule().delAtom(atomB);
                }
                this.context.getHistory().appendAction(actionList);
                this.context.draw();
            },

            onClick : function (x, y, evt) {
                var coord = this.context.getView().getCoordReverse(x, y);
                var bonds = this.context.getMolecule().selectBond(coord, distMax);
                if (bonds.length == 1) {
                    eraseBond(bonds[0]);
                    // alert("Erase bond: id=" + bonds[0]);
                } else {
                    var atom = this.context.getMolecule().selectAtom(coord, distMax);
                    if (atom != null) {
                        eraseAtom(atom);
                        // alert("Erase atom: id=" + atom);
                    }
                }
            },

            onMouseDown : function (x, y, evt) {
            },

            onMouseMove : function (x, y, evt) {
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

