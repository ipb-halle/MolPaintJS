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

function ChainTool(ctx, prop) {

    this.id = "chain";

    this.context = ctx;
    this.distMax = prop.distMax;
    this.origin = null;

    this.atomA = null;
    
    this.abort = function () {
        this.origin = null;
        Tools.abort(this);
    }

    /**
     * finalize the addition of a chain by adding the new atoms 
     * and bonds to the history and removing the temp attribute
     * from new atoms and bonds
     */
    this.onClick = function (x, y, evt) {
        this.atomA = null;
        this.actionList.addActionList(this.context.molecule.clearTemp());
        this.context.history.appendAction(this.actionList); 
        this.context.draw();
    }

    /**
     * handle mouse click, i.e. define starting position of chain
     */
    this.onMouseDown = function (x, y, evt) {
        var coord = this.context.view.getCoordReverse(x, y);
        var atomId = this.context.molecule.selectAtom(coord, this.distMax);
        this.actionList = new ActionList();

        if (atomId == null) {
            this.atomA = new Atom();
            this.atomA.coordX = coord.x;
            this.atomA.coordY = coord.y;
            this.atomA.coordZ = 0.0;
            /*
             * atomA will be created under all circumstances 
             * and not be temporary (it will be placed in the same 
             * history action though)
             */
            var at = new AtomType();
            at.setIsotope(Elements.instance.getElement("C"));
            at.setColor(Elements.instance.getElement("C").getColor());
            this.atomA.setType(at);
            this.context.molecule.addAtom(this.atomA, null);
            atomId = this.atomA.id;

            // must add to history
            this.actionList.addAction(new Action("ADD", "ATOM", this.atomA, null));
        } else {
            this.atomA = this.context.molecule.getAtom(atomId);
        }

        
        this.context.draw();
    }

    /**
     * handle mouse movement
     */
    this.onMouseMove = function (x, y, evt) {
        if (this.atomA == null) { return; }

        this.context.molecule.delTemp();

        var coord = this.context.view.getCoordReverse(x, y);
        var dx = coord.x - this.atomA.coordX;
        var dy = coord.y - this.atomA.coordY;
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
        var atomB = this.atomA;
        do { 
            var atom = new Atom();
            var k = ((n % 2) == m) ? i : j;
            n++;
            dx += this.context.rasterX[k];
            dy += this.context.rasterY[k];
            atom.coordX = this.atomA.coordX + dx;
            atom.coordY = this.atomA.coordY + dy;
            atom.coordZ = 0.0;
            atom.setTemp(1);
            var at = new AtomType();
            at.setIsotope(Elements.instance.getElement("C"));
            at.setColor(Elements.instance.getElement("C").getColor());
            atom.setType(at);
            this.context.molecule.addAtom(atom, null);

            var bond = new Bond();
            bond.setAtomA(atomB);
            bond.setAtomB(atom);
            bond.setType("1");
            bond.setTemp(1);
            this.context.molecule.addBond(bond, null);
            atomB = atom;

        } while (len > Math.sqrt((dx*dx) + (dy*dy))); 

        this.context.draw();
    }

}

