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

function EraserTool(ctx, prop) {

    this.id = "eraser";

    this.context = ctx;
    this.distMax = prop.distMax;

    this.abort = function () {
        Tools.abort(this);
    }


    /**
     * erase a single atom and all of its bonds
     */
    this.eraseAtom = function (id) {
        var actionList = new ActionList();
        var atom = this.context.molecule.getAtom(id);
        for (var b in atom.bonds) {
            var bond = this.context.molecule.getBond(b);
            actionList.addAction(new Action("DEL", "BOND", null, bond));
            this.context.molecule.delBond(bond);
        }
        actionList.addAction(new Action("DEL", "ATOM", null, atom));
        this.context.molecule.delAtom(atom);
        this.context.history.appendAction(actionList);
        this.context.draw();
    }

    /**
     * erase a single bond. If one or both of its atoms
     * have no more bonds left they're erased as well.
     */
    this.eraseBond = function (id) {
        var actionList = new ActionList();
        var bond = this.context.molecule.getBond(id);
        var atomA = bond.atomA;
        var atomB = bond.atomB;
        actionList.addAction(new Action("DEL", "BOND", null, bond));
        this.context.molecule.delBond(bond);
        if (Object.keys(atomA.bonds).length == 0) {
            actionList.addAction(new Action("DEL", "ATOM", null, atomA));
            this.context.molecule.delAtom(atomA);
        }
        if (Object.keys(atomB.bonds).length == 0) {
            actionList.addAction(new Action("DEL", "ATOM", null, atomB));
            this.context.molecule.delAtom(atomB);
        }
        this.context.history.appendAction(actionList);
        this.context.draw();
    }

    this.onClick = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);
        var bonds = this.context.molecule.selectBond(coord, this.distMax);
        if (bonds.length == 1) {
            this.eraseBond(bonds[0]);
            // alert("Erase bond: id=" + bonds[0]);
        } else {
            var atom = this.context.molecule.selectAtom(coord, this.distMax);
            if (atom != null) {
                this.eraseAtom(atom);
                // alert("Erase atom: id=" + atom);
            }
        }
    }

    this.onMouseDown = function (x, y, evt) {
    }

    this.onMouseMove = function (x, y, evt) {
    }
}

