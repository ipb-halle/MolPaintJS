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

function BondTool(ctx, prop, bt, st, i) {

    this.context = ctx;
    this.distMax = prop.distMax;
    this.bondType = bt;
    this.stereoType = st;
    this.id = i;

    this.atomA = null;

    this.abort = function () {
        Tools.abort(this);

        var iconId = this.context.contextId + "_currentBond";
        document.getElementById(iconId).className = "inactiveTool";

        this.atomA = null;
    }


    /**
     * this finally creates the new bond
     */
    this.onClick = function (x, y, evt) {
        if(this.atomA == null) return;
        this.atomA = null;
        this.actionList.addActionList(this.context.molecule.clearTemp());
        this.context.history.appendAction(this.actionList); 
        this.context.draw();
    }

    /**
     * this determines the first atom of the new bond
     */
    this.onMouseDown = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);

        var bonds = this.context.molecule.selectBond(coord, this.distMax);
        var atomId = this.context.molecule.selectAtom(coord, this.distMax);

        this.actionList = new ActionList();

        if (atomId == null) {
            if (bonds.length > 0) {
                var b = this.context.molecule.bonds[bonds[0]];
                var old = b.copy();
                var changed = false;
                if((b.getType() != this.bondType) || (b.getStereo() != this.stereoType)) { 
                    b.setType(this.bondType);
                    b.setStereo(this.stereoType);
                    changed = true;
                } else {
                    if (this.stereoType != 0) {
                        b.swap();
                        changed = true;
                    }
                }
                if (changed) {    
                    this.actionList.addAction(new Action("UPD", "BOND", b, old));
                    this.context.history.appendAction(this.actionList);
                    this.context.draw();
                }
            } else {
                this.atomA = new Atom();
                this.atomA.coordX = coord.x;
                this.atomA.coordY = coord.y;
                this.atomA.coordZ = 0.0;
                var at = new AtomType();
                at.setIsotope(this.context.currentElement);
                at.setColor(this.context.currentElement.getColor());
                this.atomA.setType(at);
                this.context.molecule.addAtom(this.atomA, null);
                atomId = this.atomA.id;
                
                this.actionList.addAction(new Action("ADD", "ATOM", this.atomA, null));

            }
        } else {
            this.atomA = this.context.molecule.getAtom(atomId);
        } 
        this.onMouseMove(x, y, evt);
    }

    /**
     * handle mouse move events
     */
    this.onMouseMove = function (x, y, evt) {
        if (this.atomA == null) { return; }

        var coord = this.context.view.getCoordReverse(x, y);

        this.context.molecule.delTemp();
        var atomId = this.context.molecule.selectAtom(coord, this.distMax);
        var atomB;

        // no atom found in proximity?
        if((atomId == null) || (atomId == this.atomA.getId())) {

            var dx = coord.x - this.atomA.coordX;
            var dy = coord.y - this.atomA.coordY;
            var len = Math.sqrt((dx * dx) + (dy * dy));
            len = (len < 0.01) ? 1.0 : len;         // avoid division by zero
            var v = 180.0 * Math.asin(-dy / len) / Math.PI;
            var w = 180.0 * Math.acos(dx / len) / Math.PI;

            w = (v < 0) ? w : 360.0 - w;

            var i = Math.floor(w / 30.0);
            atomB = new Atom();
            atomB.coordX = this.atomA.coordX + this.context.rasterX[i];
            atomB.coordY = this.atomA.coordY + this.context.rasterY[i];
            atomB.coordZ = 0.0;
            atomB.setTemp(1);
            var at = new AtomType();
            at.setIsotope(this.context.currentElement);
            at.setColor(this.context.currentElement.getColor());
            atomB.setType(at);
            this.context.molecule.addAtom(atomB, null);

        } else {
            atomB = this.context.molecule.getAtom(atomId);
        }
        var bond = new Bond ();
        bond.setAtomA(this.atomA);
        bond.setAtomB(atomB);
        bond.setType(this.bondType);
        bond.setStereo(this.stereoType);
        bond.setTemp(1);
        this.context.molecule.addBond(bond, null);
        this.context.draw();
    }

    this.setup = function () {
        var srcIconId = this.context.contextId + "_" + this.id;
        var destIconId = this.context.contextId + "_currentBond";
        icon = document.getElementById(destIconId);
        icon.src = document.getElementById(srcIconId).src;
        icon.className = "activeTool";
        this.context.currentBondTool = this;
    }
}
