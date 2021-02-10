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

function RadicalTool(ctx, prop) {

    this.id = "radical";

    this.context = ctx;
    this.distMax = prop.distMax;
    this.type = "radical";

    this.abort = function () {
        Tools.abort(this);
    }

    this.getType = function () {
        return this.type;
    }

    this.onClick = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);
        var atomId = this.context.molecule.selectAtom(coord, this.distMax);
        if (atomId != null) {

            var actionList = new ActionList();
            var atom = this.context.molecule.getAtom(atomId);
            var oldAtom = atom.copy();
            var dir = (this.type == "isotope_up") ? 1 : -1;

            switch (this.type) {
                case "singlet" :
                    atom.setRadical(1);
                    break;
                case "doublet" :
                    atom.setRadical(2);
                    break;
                case "triplet" :
                    atom.setRadical(3);
                    break;
                case "no_radical" :
                    atom.setRadical(0);
                    break;
            }
            this.context.molecule.replaceAtom(atom);
            actionList.addAction(new Action("UPD", "ATOM", atom, oldAtom));
            this.context.history.appendAction(actionList);

        }
        this.context.draw();
    }

    this.onMouseDown = function (x, y, evt) {
    }

    this.onMouseMove = function (x, y, evt) {
    }

    this.setType = function(t) {
        this.type = t;
    }

    this.setup = function () {
        var srcIconId = this.context.contextId + "_" + this.type;
        var destIconId = this.context.contextId + "_radical";
        icon = document.getElementById(destIconId);
        icon.src = document.getElementById(srcIconId).src;
    }

}

