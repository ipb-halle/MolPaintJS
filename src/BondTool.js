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

    molpaintjs.BondTool = function(ctx, prop, bt, st, i) {

        var context = ctx;
        var distMax = prop.distMax;
        var bondType = bt;
        var stereoType = st;
        var id = i;

        var atomA = null;
        var actionList;


        return {
            context : ctx,
            id : i,

            abort : function () {
                molPaintJS.Tools.abort(this);

                var iconId = this.context.contextId + "_currentBond";
                document.getElementById(iconId).className = "inactiveTool";

                atomA = null;
            },

            /**
             * this finally creates the new bond
             */
            onClick : function (x, y, evt) {
                if(atomA == null) return;
                atomA = null;
                actionList.addActionList(this.context.getMolecule().clearTemp());
                this.context.getHistory().appendAction(actionList); 
                this.context.draw();
            },

            /**
             * this determines the first atom of the new bond
             */
            onMouseDown : function (x, y, evt) {
                var coord = this.context.getView().getCoordReverse(x, y);

                var bonds = this.context.getMolecule().selectBond(coord, distMax);
                var atomId = this.context.getMolecule().selectAtom(coord, distMax);

                actionList = molPaintJS.ActionList();

                if (atomId == null) {
                    if (bonds.length > 0) {
                        var b = this.context.getMolecule().bonds[bonds[0]];
                        var old = b.copy();
                        var changed = false;
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
                        var at = molPaintJS.AtomType();
                        at.setIsotope(this.context.getCurrentElement());
                        at.setColor(this.context.getCurrentElement().getColor());
                        atomA.setType(at);
                        this.context.getMolecule().addAtom(atomA, null);
                        atomId = atomA.id;
                        
                        actionList.addAction(molPaintJS.Action("ADD", "ATOM", atomA, null));

                    }
                } else {
                    atomA = this.context.getMolecule().getAtom(atomId);
                } 
                this.onMouseMove(x, y, evt);
            },

            /**
             * handle mouse move events
             */
            onMouseMove : function (x, y, evt) {
                if (atomA == null) { return; }

                var coord = this.context.getView().getCoordReverse(x, y);

                this.context.getMolecule().delTemp();
                var atomId = this.context.getMolecule().selectAtom(coord, distMax);
                var atomB;

                // no atom found in proximity?
                if((atomId == null) || (atomId == atomA.getId())) {

                    var dx = coord.x - atomA.getX();
                    var dy = coord.y - atomA.getY();
                    var len = Math.sqrt((dx * dx) + (dy * dy));
                    len = (len < 0.01) ? 1.0 : len;         // avoid division by zero
                    var v = 180.0 * Math.asin(-dy / len) / Math.PI;
                    var w = 180.0 * Math.acos(dx / len) / Math.PI;

                    w = (v < 0) ? w : 360.0 - w;

                    var i = Math.floor(w / 30.0);
                    atomB = molPaintJS.Atom();
                    atomB.setX(atomA.getX() + this.context.getRasterX(i));
                    atomB.setY(atomA.getY() + this.context.getRasterY(i));
                    atomB.setZ(0.0);
                    atomB.setTemp(1);
                    var at = molPaintJS.AtomType();
                    at.setIsotope(this.context.getCurrentElement());
                    at.setColor(this.context.getCurrentElement().getColor());
                    atomB.setType(at);
                    this.context.getMolecule().addAtom(atomB, null);

                } else {
                    atomB = this.context.getMolecule().getAtom(atomId);
                }
                var bond = molPaintJS.Bond ();
                bond.setAtomA(atomA);
                bond.setAtomB(atomB);
                bond.setType(bondType);
                bond.setStereo(stereoType);
                bond.setTemp(1);
                this.context.getMolecule().addBond(bond, null);
                this.context.draw();
            },

            setup : function () {
                var srcIconId = this.context.contextId + "_" + id;
                var destIconId = this.context.contextId + "_currentBond";
                icon = document.getElementById(destIconId);
                icon.src = document.getElementById(srcIconId).src;
                icon.className = "activeTool";
                this.context.currentBondTool = this;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
