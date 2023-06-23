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

    molpaintjs.TemplateTool = function (ctx, prop, i) {

        let actionList = null;
        let properties = prop;
        let template = "";
        let templateId = "";
        let origin = null;

        return {
            id : i,
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            /**
             * @param a1 the atom from the original molecule which is to be replaced
             * @param a2 the atom from the template fragment
             */
            joinAtoms : function (atom1, atom2) {
                let a1 = atom1.getId();
                let a2 = atom2.getId();
                let allBonds = this.context.getMolecule().getBonds();
                for (let b in atom1.getBonds()) {
                    let atom = null;
                    let bond = null;
                    if (allBonds[b].getAtomA().getId() == a1) {
                        let atom = allBonds[b].getAtomB();
                        if ((atom.getSelected() & 2) === 0) {
                            bond = molPaintJS.Bond();
                            bond.setAtomA(atom2);
                            bond.setAtomB(atom);
                            bond.setType(allBonds[b].getType());
                            bond.setStereo(allBonds[b].getStereo());
                        }
                    } else {
                        atom = atom = allBonds[b].getAtomA();
                        if ((atom.getSelected() & 2) === 0) {
                            bond = molPaintJS.Bond();
                            bond.setAtomA(atom);
                            bond.setAtomB(atom2);
                            bond.setType(allBonds[b].getType());
                            bond.setStereo(allBonds[b].getStereo());
                        }
                    }
                    if (bond != null) {
                        actionList.addAction(molPaintJS.Action("ADD", "BOND", bond, null));
                        this.context.getMolecule().addBond(bond, null);
                    }
                    bond = allBonds[b];
                    actionList.addAction(molPaintJS.Action("DEL", "BOND", null, bond)); 
                    this.context.getMolecule().delBond(bond); 
                }
                actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, atom1));
                this.context.getMolecule().delAtom(atom1);
            },

            onClick : function (x, y, evt) {
                origin = null;

                this.context.getMolecule().adjustSelection(2,2,0);
                let box = this.context.getMolecule().computeBBox(1);
                let sel = this.context.getMolecule().selectBBox(box, 2, 1);  // overlapping atoms and bonds
                let tpl = this.context.getMolecule().getSelected(1);         // return the template

                for (let a1 of sel.atoms) {
                    for (let a2 of tpl.atoms) {
                        let atom1 = this.context.getMolecule().getAtom(a1);
                        let atom2 = this.context.getMolecule().getAtom(a2);
                        let dx = atom1.getX() - atom2.getX();
                        let dy = atom1.getY() - atom2.getY();
                        if (prop.distMax > ((dx * dx) + (dy * dy))) {
                            this.joinAtoms(atom1, atom2);
                            break;
                        }
                    }
                }
            
                this.context.getMolecule().clearSelection(3);
                this.context.draw();
            },

            onMouseDown : function (x, y, evt) {
                origin = this.context.getView().getCoordReverse(x, y);
                actionList = this.context.pasteMolecule(template, 1);
                this.context.getMolecule().transform([[1, 0, origin.x], [0, 1, origin.y]], true);
                this.context.draw();
            },

            onMouseMove : function (x, y, evt) {
                /* move template around */
                if (origin != null) {
                    let coord = this.context.getView().getCoordReverse(x, y);
                    let dx = coord.x - origin.x;
                    let dy = coord.y - origin.y;
                    origin = coord;
                    this.context.getMolecule().transform([[1, 0, dx], [0, 1, dy]], 1)

                    this.context.getMolecule().adjustSelection(2,2,0);
                    let box = this.context.getMolecule().computeBBox(1);
                    this.context.getMolecule().selectBBox(box, 2, 1);
                    this.context.draw();
                }

            },

            setTemplate : function (i, t) {
                templateId = i;
                template = t;
            },

            setup : function () {
                let destIconId = this.context.contextId + "_template";
                let icon = document.getElementById(destIconId);
                icon.src = molPaintJS.Resources[templateId + ".png"];
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
