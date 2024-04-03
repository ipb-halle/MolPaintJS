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

    molpaintjs.BondTool = function(ctx, prop, bt, st, i) {

        const context = ctx;
        let distMax = prop.distMax;
        let bondType = bt;
        let stereoType = st;

        let atomIdA = null;
        let actionList;

        function addAtomA () {
            this.drawing.begin();
            atomIdA = this.drawing.createAtomId();
            let atomA = molPaintJS.Atom();
            atomA.setId(atomIdA);
            atomA.setX(coord.x);
            atomA.setY(coord.y);
            atomA.setZ(0.0);
            let atomType = molPaintJS.AtomType();
            atomType.setIsotope(this.context.getCurrentElement());
            atomType.setColor(this.context.getCurrentElement().getColor());
            atomA.setType(atomType);
            this.drawing.addAtom(atomA);
        }

        function modifyBondType (oldBond) {
            this.drawing.begin();
            let bond = oldBond.copy();
            bond.setType(bondType);
            bond.setStereo(stereoType);
            this.drawing.replaceBond(bond);
            this.drawing.commit(this.context);
            this.context.draw();
        }

        function modifyBondStereo (oldBond) {
            this.drawing.begin();
            let bond = oldBond.copy();
            bond.swap();
            this.drawing.replaceBond(bond);
            this.drawing.commit(this.context);
            this.context.draw();
        }

        function modifyBond (bond) {
            // change existing bond
            let changed = false;
            if((bond.getType() != bondType) || (bond.getStereo() != stereoType)) { 
                modifyBondType(bond);
            } else {
                if ((stereoType != "0") || (b.getType() == 2)) {
                    modifyBondStereo(bond);
                }
            }
        }

        return {
            context : ctx,
            drawing : ctx.getDrawing(),
            id : i,

            abort : function () {
                molPaintJS.Tools.abort(this);

                let iconId = this.context.contextId + "_currentBond";
                document.getElementById(iconId).className = "molPaintJS-inactiveTool";

                atomIdA = null;
            },

            /**
             * this finally creates the new bond
             */
            onClick : function (x, y, evt) {
                if(atomIdA == null) {
                    this.drawing.rollbackAll(this.context);
                    return;
                }
                atomIdA = null;
                this.drawing.commit(this.context);
                this.context.draw();
            },

            /**
             * this determines the first atom of the new bond
             */
            onMouseDown : function (x, y, evt) {
                let coord = this.context.getView().getCoordReverse(x, y);
                let atomId = this.drawing.selectAtom(coord, distMax);
                atomIdA = null;

                if (atomId == null) {
                    let bonds = this.drawing.selectBonds(coord, distMax);
                    if (bonds.length > 0) {
                        let bond = this.drawing.getBond(bonds[0]);
                        modifyBond(bond);
                    } else {
                        addAtomA();
                    }
                } else {
                    atomIdA = atomId;
                } 
                this.onMouseMove(x, y, evt);
            },

            /**
             * handle mouse move events
             */
            onMouseMove : function (x, y, evt) {
                if (atomIdA == null) { return; }

                alert("XXXXXXXXXXX WORK IN PROGRESS XXXXXXXXXXXX");

                let atomA = this.drawing().getAtom(atomIdA);
                let view = this.context.getView();
                let coord = view.getCoordReverse(x, y);

                this.context.getDrawing().delTemp();
                let atomId = this.context.getDrawing().selectAtom(coord, distMax);
                let atomB;

                // no atom found in proximity?
                if((atomId == null) || (atomId == atomIdA)) {
                    console.log("no atom in proximity");
                    let dx = coord.x - atomA.getX();
                    let dy = coord.y - atomA.getY();
                    let len = Math.sqrt((dx * dx) + (dy * dy));
                    len = (len < 0.01) ? 1.0 : len;         // avoid division by zero
                    let v = 180.0 * Math.asin(-dy / len) / Math.PI;
                    let w = 180.0 * Math.acos(dx / len) / Math.PI;

                    w = (v < 0) ? w : 360.0 - w;

                    let i = Math.floor(w / 30.0);
                    atomB = molPaintJS.Atom();
                    atomB.setId(this.context.getDrawing().createAtomId());

                    atomB.setX(atomA.getX() + view.getRasterX(i));
                    atomB.setY(atomA.getY() + view.getRasterY(i));
                    atomB.setZ(0.0);
                    atomB.setTemp(1);
                    let at = molPaintJS.AtomType();
                    at.setIsotope(this.context.getCurrentElement());
                    at.setColor(this.context.getCurrentElement().getColor());
                    atomB.setType(at);
                    this.context.getDrawing().addAtom(atomB);

                } else {
                    atomB = this.context.getDrawing().getAtom(atomId);
                }
                let bond = molPaintJS.Bond();
                bond.setId(this.context.getDrawing().createBondId());

                bond.setAtomA(atomIdA);
                bond.setAtomB(atomB.getId());
                bond.setType(bondType);
                bond.setStereo(stereoType);
                bond.setTemp(1);
                this.context.getDrawing().addBond(bond);
                this.context.draw();
            },

            setup : function () {
                let destIconId = this.context.contextId + "_currentBond";
                let icon = document.getElementById(destIconId);
                icon.src = molPaintJS.Resources[this.id + ".png"];
                icon.className = "molPaintJS-activeTool";
                this.context.currentBondTool = this;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
