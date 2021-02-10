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

function Atom() {

    this.bbox = null;	// bounding box for the atom label
    this.bonds = {};
    this.coordX;
    this.coordY;
    this.coordZ;

    this.charge = 0;	// formal charge of the atom
    this.radical = 0;	// 0 = no radical, 1=singlet, 2=doublet, 3=triplet

    this.id = null;	// unique id (i.e. for undo / redo)
    this.index;		// numeric index in list of atoms
    this.selected = 0;	// non zero, if the atom is currently selected
    this.stereo = 0;
    this.temp = 0;	// non zero if the atom is transient (temporary)
    this.type;		// atom type / element / isotope


    /**
     * change the isotope for the current atom
     * @param dir direction 1=up, -1=down
     */
    this.changeIsotope = function (dir) {
        var idx = this.type.getIsotope().getAtomicNumber() - 1;
        var massExact = this.type.getIsotope().getMassExact();
        var newIsotope = null;
        var oldDelta = 100.0;

        for (var iso of Elements.instance.elements[idx]) {
            var delta = (iso.getMassExact() - massExact) * dir;
            if ((delta > 0.0) && (delta < oldDelta)) {
                oldDelta = delta;
                newIsotope = iso;
            }
        }
            
        if (newIsotope != null) {
            var at = new AtomType();
            at.setIsotope(newIsotope); 
            at.setColor(newIsotope.getColor()); 
            this.type = at;
            return true;
        }
        return false;
    }

    this.chargeDecrement = function () {
        this.charge -= 1;
    }
    this.chargeIncrement = function () {
        this.charge += 1;
    }

    this.addBond = function (idx) {
        this.bonds[idx] = idx;
    }

    /**
     * make a copy (clone) of this Atom
     * @return a new Atom with identical properties
     * including the bond list
     */
    this.copy = function () {
        var a = new Atom();
        a.coordX = this.coordX;
        a.coordY = this.coordY;
        a.coordZ = this.coordZ;
        a.charge = this.charge;
        a.radical = this.radical;
        a.id = this.id;
        a.index = this.index;
        a.selected = this.selected;
        a.stereo = this.stereo;
        a.temp = this.temp;
        a.type = this.type;
        a.bonds = this.copyBonds();
        return a;
    }

    this.copyBonds = function () {
        var b = {};
        for (var i in this.bonds) {
            b[i] = i;
        }
        return b;
    }

    /**
     * delete a specific bond from this atom
     */
    this.delBond = function (idx) {
        delete this.bonds[idx];
    }

    this.getBonds = function () {
        return this.bonds;
    }
    this.getCharge = function () {
        return this.charge;
    }

    /**
     * compute the hydrogen count (implicit hydrogens)
     * for this atom. Currently does not account for 
     * explicit hydrogens!
     */
    this.getHydrogenCount = function(molecule) {
        var cnt = 0;

        // evaluate bond order
        for(var id in this.bonds) {
            switch(molecule.getBond(id).getType()) {
                case 1 : cnt -= 1;
                        break;
                case 2 : cnt -= 2; 
                        break;
                case 3 : cnt -= 3;
            }
        }
        switch(this.type.isotope.symbol) {
            case "N" : cnt += 3 + this.charge;
                break;
            case "O" : cnt += 2 + this.charge;
                break;
            case "S" : cnt += 2 + this.charge;
                break;
        }
        return (cnt > 0) ? cnt : 0;
    }

    this.getId = function () {
        return this.id;
    }
    this.getIndex = function () {
        return this.index;
    }
    this.getRadical = function () {
        return this.radical;
    }
    this.getSelected = function () {
        return this.selected;
    }
    this.getStereo = function () {
        return this.stereo;
    }
    this.getTemp = function () {
        return this.temp;
    }
    this.getType = function () {
        return this.type;
    }

    this.setCharge = function (c) {
        this.charge = c;
    }
    this.setId = function (i) {
        this.id = i;
    }
    this.setIndex = function (i) {
        this.index = i;
    }
    this.setRadical = function (r) {
        this.radical = r;
    }
    this.setSelected = function (s) {
        this.selected = s;
    }
    this.setStereo = function (s) {
        this.stereo = s;
    }
    this.setTemp = function (t) {
        this.temp = t;
    }
    this.setType = function (t) {
        this.type = t;
    }
}
