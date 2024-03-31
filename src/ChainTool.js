/*
 * MolPaintJS
 * Copyright 2024 Leibniz-Institut f. Pflanzenbiochemie
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

    molpaintjs.ChainTool = function (ctx, prop) {

        let distMax = prop.distMax;
        let atomA = null
        let actionList;

        return {

            id : "chain",
            context : ctx,

            abort : function () {
                molPaintJS.Tools.abort(this);
            },

            /**
             * finalize the addition of a chain by adding the new atoms
             * and bonds to the history and removing the temp attribute
             * from new atoms and bonds
             */
            onClick : function (x, y, evt) {
                atomA = null;
                actionList.addActionList(this.context.getDrawing().clearTemp());
                this.context.getHistory().appendAction(actionList);
                this.context.draw();
            },

            /**
             * handle mouse click, i.e. define starting position of chain
             */
            onMouseDown : function (x, y, evt) {
                let coord = this.context.getView().getCoordReverse(x, y);
                let atomId = this.context.getDrawing().selectAtom(coord, distMax);
                actionList = molPaintJS.ActionList();

                if (atomId == null) {
                    atomA = molPaintJS.Atom();
                    atomA.setId(this.context.getDrawing().createAtomId());
                    atomA.setX(coord.x);
                    atomA.setY(coord.y);
                    atomA.setZ(0.0);
                    /*
                     * atomA will be created under all circumstances
                     * and not be temporary (it will be placed in the same
                     * history action though)
                     */
                    let at = molPaintJS.AtomType();
                    at.setIsotope(molPaintJS.Elements.getElement("C"));
                    at.setColor(molPaintJS.Elements.getElement("C").getColor());
                    atomA.setType(at);
                    this.context.getDrawing().addAtom(atomA);
                    atomId = atomA.id;

                    // must add to history
                    actionList.addAction(molPaintJS.Action("ADD", "ATOM", atomA, null));
                } else {
                    atomA = this.context.getDrawing().getAtom(atomId);
                }

                this.context.draw();
            },

            /**
             * handle mouse movement
             */
            onMouseMove : function (x, y, evt) {
                if (atomA == null) { return; }

                this.context.getDrawing().delTemp();

                let view = this.context.getView();
                let coord = view.getCoordReverse(x, y);
                let dx = coord.x - atomA.getX();
                let dy = coord.y - atomA.getY();
                let len = Math.sqrt((dx * dx) + (dy * dy));
                len = (len < 0.01) ? 1.0 : len;         // avoid division by zero
                let v = 180.0 * Math.asin(-dy / len) / Math.PI;
                let w = 180.0 * Math.acos(dx / len) / Math.PI;

                w = (v < 0) ? w : 360.0 - w;    // angle

                let i = Math.floor(w / 30.0);   // index in raster
                let j = Math.ceil(w / 30.0);    // index in raster
                let dw = (w / 30.0) - i;
                if(i == j) {
                    j += 2;
                } else {
                    j++;
                }

                let n = 0;
                let m = (dw > 0.5) ? 1 : 0;     // which raster to start with
                dx = 0.0;
                dy = 0.0;
                let atomB = atomA;
                do {
                    let atom = molPaintJS.Atom();
                    atom.setId(this.context.getDrawing().createAtomId());

                    let k = ((n % 2) == m) ? i : j;
                    n++;
                    dx += view.getRasterX(k);
                    dy += view.getRasterY(k);
                    atom.setX(atomA.getX() + dx);
                    atom.setY(atomA.getY() + dy);
                    atom.setZ(0.0);
                    atom.setTemp(1);
                    let at = molPaintJS.AtomType();
                    at.setIsotope(molPaintJS.Elements.getElement("C"));
                    at.setColor(molPaintJS.Elements.getElement("C").getColor());
                    atom.setType(at);
                    this.context.getDrawing().addAtom(atom);

                    let bond = molPaintJS.Bond();
                    bond.setId(this.context.getDrawing().createBondId());

                    bond.setAtomA(atomB.getId());
                    bond.setAtomB(atom.getId());
                    bond.setType(1);
                    bond.setTemp(1);
                    this.context.getDrawing().addBond(bond);
                    atomB = atom;

                } while (len > Math.sqrt((dx*dx) + (dy*dy)));

                this.context.draw();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

