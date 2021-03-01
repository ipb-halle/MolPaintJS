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

    molpaintjs.ChainTool = function (ctx, prop) {

        var distMax = prop.distMax;
        var origin = null;
        var atomA = null
        var actionList;

        return {

            id : "chain",
            context : ctx,

            abort : function () {
                origin = null;
                molPaintJS.Tools.abort(this);
            },

            /**
             * finalize the addition of a chain by adding the new atoms 
             * and bonds to the history and removing the temp attribute
             * from new atoms and bonds
             */
            onClick : function (x, y, evt) {
                atomA = null;
                actionList.addActionList(this.context.getMolecule().clearTemp());
                this.context.getHistory().appendAction(actionList); 
                this.context.draw();
            },

            /**
             * handle mouse click, i.e. define starting position of chain
             */
            onMouseDown : function (x, y, evt) {
                var coord = this.context.getView().getCoordReverse(x, y);
                var atomId = this.context.getMolecule().selectAtom(coord, distMax);
                actionList = molPaintJS.ActionList();

                if (atomId == null) {
                    atomA = molPaintJS.Atom();
                    atomA.setX(coord.x);
                    atomA.setY(coord.y);
                    atomA.setZ(0.0);
                    /*
                     * atomA will be created under all circumstances 
                     * and not be temporary (it will be placed in the same 
                     * history action though)
                     */
                    var at = molPaintJS.AtomType();
                    at.setIsotope(molPaintJS.Elements.getElement("C"));
                    at.setColor(molPaintJS.Elements.getElement("C").getColor());
                    atomA.setType(at);
                    this.context.getMolecule().addAtom(atomA, null);
                    atomId = atomA.id;

                    // must add to history
                    actionList.addAction(molPaintJS.Action("ADD", "ATOM", atomA, null));
                } else {
                    atomA = this.context.getMolecule().getAtom(atomId);
                }

                this.context.draw();
            },

            /**
             * handle mouse movement
             */
            onMouseMove : function (x, y, evt) {
                if (atomA == null) { return; }

                this.context.getMolecule().delTemp();

                var coord = this.context.getView().getCoordReverse(x, y);
                var dx = coord.x - atomA.getX();
                var dy = coord.y - atomA.getY();
                var len = Math.sqrt((dx * dx) + (dy * dy));
                len = (len < 0.01) ? 1.0 : len;         // avoid division by zero
                var v = 180.0 * Math.asin(-dy / len) / Math.PI;
                var w = 180.0 * Math.acos(dx / len) / Math.PI;

                w = (v < 0) ? w : 360.0 - w;    // angle

                var i = Math.floor(w / 30.0);   // index in raster
                var j = Math.ceil(w / 30.0);    // index in raster
                var dw = (w / 30.0) - i;         
                if(i == j) {
                    j += 2;
                } else {
                    j++;
                }

                var n = 0;
                var m = (dw > 0.5) ? 1 : 0;     // which raster to start with
                dx = 0.0;
                dy = 0.0;
                dbg = "";
                var atomB = atomA;
                do { 
                    var atom = molPaintJS.Atom();
                    var k = ((n % 2) == m) ? i : j;
                    n++;
                    dx += this.context.getRasterX(k);
                    dy += this.context.getRasterY(k);
                    atom.setX(atomA.getX() + dx);
                    atom.setY(atomA.getY() + dy);
                    atom.setZ(0.0);
                    atom.setTemp(1);
                    var at = molPaintJS.AtomType();
                    at.setIsotope(molPaintJS.Elements.getElement("C"));
                    at.setColor(molPaintJS.Elements.getElement("C").getColor());
                    atom.setType(at);
                    this.context.getMolecule().addAtom(atom, null);

                    var bond = molPaintJS.Bond();
                    bond.setAtomA(atomB);
                    bond.setAtomB(atom);
                    bond.setType(1);
                    bond.setTemp(1);
                    this.context.getMolecule().addBond(bond, null);
                    atomB = atom;

                } while (len > Math.sqrt((dx*dx) + (dy*dy))); 

                this.context.draw();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

