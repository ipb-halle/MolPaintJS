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

function TemplateTool(ctx, prop, i) {

    this.actionList = null;
    this.context = ctx;
    this.properties = prop;
    this.id = i;

    this.template = "";
    this.templateId = "";
    this.origin = null;

    this.abort = function () {
        Tools.abort(this);
    }


    /**
     * @param a1 the atom from the original molecule which is to be replaced
     * @param a2 the atom from the template fragment
     */
    this.joinAtoms = function (atom1, atom2) {
        var a1 = atom1.id;
        var a2 = atom2.id;
        for (var b in atom1.bonds) {
            var atom = null;
            var bond = null;
            if (this.context.molecule.bonds[b].atomA.id == a1) {
                var atom = this.context.molecule.bonds[b].atomB;
                if ((atom.selected & 2) === 0) {
                    bond = new Bond();
                    bond.setAtomA(atom2);
                    bond.setAtomB(atom);
                    bond.setType(this.context.molecule.bonds[b].getType());
                    bond.setStereo(this.context.molecule.bonds[b].getStereo());
                }
            } else {
                atom = this.context.molecule.bonds[b].atomA;
                if ((atom.selected & 2) === 0) {
                    bond = new Bond();
                    bond.setAtomA(atom);
                    bond.setAtomB(atom2);
                    bond.setType(this.context.molecule.bonds[b].getType());
                    bond.setStereo(this.context.molecule.bonds[b].getStereo());
                }
            }
            if (bond != null) {
                this.actionList.addAction(new Action("ADD", "BOND", bond, null));
                this.context.molecule.addBond(bond, null);
            }
            bond = this.context.molecule.bonds[b];
            this.actionList.addAction(new Action("DEL", "BOND", null, bond)); 
            this.context.molecule.delBond(bond); 
        }
        this.actionList.addAction(new Action("DEL", "ATOM", null, atom1));
        this.context.molecule.delAtom(atom1);
    }

    this.onClick = function (x, y, evt) {
        this.origin = null;

        this.context.molecule.adjustSelection(2,2,0);
        var box = this.context.molecule.computeBBox(1);
        var sel = this.context.molecule.selectBBox(box, 2, 1);  // overlapping atoms and bonds
        var tpl = this.context.molecule.getSelected(1);         // return the template

        for (var a1 of sel.atoms) {
            for (var a2 of tpl.atoms) {
                var atom1 = this.context.molecule.getAtom(a1);
                var atom2 = this.context.molecule.getAtom(a2);
                var dx = atom1.coordX - atom2.coordX;
                var dy = atom1.coordY - atom2.coordY;
                if (prop.distMax > ((dx * dx) + (dy * dy))) {
                    this.joinAtoms(atom1, atom2);
                    break;
                }
            }
        }
    
        this.context.molecule.clearSelection(3);
        this.context.draw();
    }

    this.onMouseDown = function (x, y, evt) {
        this.origin = this.context.view.getCoordReverse(x, y);
        this.actionList = this.context.pasteMolecule(this.template, 1);
        this.context.molecule.transform([[1, 0, this.origin.x], [0, 1, this.origin.y]], true);
        this.context.draw();
    }

    this.onMouseMove = function (x, y, evt) {
        /* move template around */
        if (this.origin != null) {
            var coord = this.context.view.getCoordReverse(x, y);
            var dx = coord.x - this.origin.x;
            var dy = coord.y - this.origin.y;
            this.origin = coord;
            this.context.molecule.transform([[1, 0, dx], [0, 1, dy]], 1)

            this.context.molecule.adjustSelection(2,2,0);
            var box = this.context.molecule.computeBBox(1);
            this.context.molecule.selectBBox(box, 2, 1);
            this.context.draw();
/*
            var xbox = this.context.view.getBBox(box);
            xbox.draw(this.context.view.getContext());
*/
        }

    }

    this.setTemplate = function (i, t) {
        this.templateId = i;
        this.template = t;
    }

    this.setup = function () {
        var srcIconId = this.context.contextId + "_" + this.templateId;
        var destIconId = this.context.contextId + "_template";
        icon = document.getElementById(destIconId);
        icon.src = document.getElementById(srcIconId).src;
    }

}
