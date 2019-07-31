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

function AtomTool(ctx, prop, i) {

    this.context = ctx;
    this.distMax = prop.distMax;
    this.id = i;

    this.atom = null;

    this.abort = function () {
        Tools.abort(this);
        this.atom = null;
    }

    /**
     * create new single atom or change type of
     * an existing atom
     */
    this.onClick = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);
        var atomId = this.context.molecule.selectAtom(coord, this.distMax);
        var at = new AtomType();
        at.setIsotope(this.context.currentElement);
        at.setColor(this.context.currentElement.getColor());
        var actionList = new ActionList();
        var oldAtom = null;

        if (atomId == null) {
            this.atom = new Atom();
            this.atom.coordX = coord.x;
            this.atom.coordY = coord.y;
            this.atom.coordZ = 0.0;
            this.atom.setType(at);
            this.context.molecule.addAtom(this.atom, null);
            actionList.addAction(new Action("ADD", "ATOM", this.atom, null));
        } else {
            oldAtom = this.context.molecule.getAtom(atomId);
            this.atom = oldAtom.copy();
            this.atom.setType(at);
            this.context.molecule.replaceAtom(this.atom);
            actionList.addAction(new Action("UPD", "ATOM", this.atom, oldAtom));
        }

        this.context.history.appendAction(actionList);
        this.context.draw();

        this.atom = null;
    }

    this.onMouseDown = function (x, y, evt) {
    }

    this.onMouseMove = function (x, y, evt) {
    }

    this.setup = function () {
        var iconId = this.context.contextId + "_customElement";
        var e = document.getElementById(iconId);
        var sym = this.context.currentElement.getSymbol();
        switch (sym) {
            case "H":
            case "C":
            case "N":
            case "O":
                e.innerHTML = "";
                break;
            default :
                e.innerHTML = sym;
                e.style.color = this.context.currentElement.getColor();
        }
    }

}
