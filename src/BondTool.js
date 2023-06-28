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

        let context = ctx;
        let distMax = prop.distMax;
        let bondType = bt;
        let stereoType = st;

        let atomA = null;
        let actionList;


        return {
            context : ctx,
            id : i,

            abort : function () {
                molPaintJS.Tools.abort(this);

                let iconId = this.context.contextId + "_currentBond";
                document.getElementById(iconId).className = "molPaintJS-inactiveTool";

                atomA = null;
            },

            /**
             * this finally creates the new bond
             */
            onClick : function (x, y, evt) {
                if(atomA == null) return;
                atomA = null;
                actionList.addActionList(this.context.getDrawing().clearTemp());
                this.context.getHistory().appendAction(actionList); 
                this.context.draw();
            },

            /**
             * this determines the first atom of the new bond
             */
            onMouseDown : function (x, y, evt) {
                let coord = this.context.getView().getCoordReverse(x, y);

                let bonds = this.context.getDrawing().selectBond(coord, distMax);
                let atomId = this.context.getDrawing().selectAtom(coord, distMax);

                actionList = molPaintJS.ActionList();

                if (atomId == null) {
                    if (bonds.length > 0) {
                        let b = this.context.getDrawing().getBonds()[bonds[0]];
                        let old = b.copy();
                        let changed = false;
                        if((b.getType() != bondType) || (b.getStereo() != stereoType)) { 
                            b.setType(bondType);
                            b.setStereo(stereoType);
                            changed = true;
                        } else {
                            if ((stereoType != "0") || (b.getType() == 2)) {
                                b.swap();
                                changed = true;
                            }
                        }
                        if (changed) {    
                            actionList.addAction(molPaintJS.Action("UPD", "BOND", b, old));
                            this.context.getHistory().appendAction(actionList);
                            this.context.draw();
                        }
                    } else {
                        atomA = molPaintJS.Atom();
                        atomA.setX(coord.x);
                        atomA.setY(coord.y);
                        atomA.setZ(0.0);
                        let at = molPaintJS.AtomType();
                        at.setIsotope(this.context.getCurrentElement());
                        at.setColor(this.context.getCurrentElement().getColor());
                        atomA.setType(at);
                        this.context.getDrawing().addAtom(atomA, null);
                        atomId = atomA.getId();
                        
                        actionList.addAction(molPaintJS.Action("ADD", "ATOM", atomA, null));

                    }
                } else {
                    atomA = this.context.getDrawing().getAtom(atomId);
                } 
                this.onMouseMove(x, y, evt);
            },

            /**
             * handle mouse move events
             */
            onMouseMove : function (x, y, evt) {
                if (atomA == null) { return; }

                let view = this.context.getView();
                let coord = view.getCoordReverse(x, y);

                this.context.getDrawing().delTemp();
                let atomId = this.context.getDrawing().selectAtom(coord, distMax);
                let atomB;

                // no atom found in proximity?
                if((atomId == null) || (atomId == atomA.getId())) {

                    let dx = coord.x - atomA.getX();
                    let dy = coord.y - atomA.getY();
                    let len = Math.sqrt((dx * dx) + (dy * dy));
                    len = (len < 0.01) ? 1.0 : len;         // avoid division by zero
                    let v = 180.0 * Math.asin(-dy / len) / Math.PI;
                    let w = 180.0 * Math.acos(dx / len) / Math.PI;

                    w = (v < 0) ? w : 360.0 - w;

                    let i = Math.floor(w / 30.0);
                    atomB = molPaintJS.Atom();
                    atomB.setX(atomA.getX() + view.getRasterX(i));
                    atomB.setY(atomA.getY() + view.getRasterY(i));
                    atomB.setZ(0.0);
                    atomB.setTemp(1);
                    let at = molPaintJS.AtomType();
                    at.setIsotope(this.context.getCurrentElement());
                    at.setColor(this.context.getCurrentElement().getColor());
                    atomB.setType(at);
                    this.context.getDrawing().addAtom(atomB, null);

                } else {
                    atomB = this.context.getDrawing().getAtom(atomId);
                }
                let bond = molPaintJS.Bond();
                bond.setAtomA(atomA);
                bond.setAtomB(atomB);
                bond.setType(bondType);
                bond.setStereo(stereoType);
                bond.setTemp(1);
                this.context.getDrawing().addBond(bond, null);
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
