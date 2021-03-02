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

    molpaintjs.Atom = function () {


        var bbox = null;        // bounding box for the atom label
        var bonds = {};
        var coordX = 0.0;
        var coordY = 0.0;
        var coordZ = 0.0;

        var charge = 0;         // formal charge of the atom
        var radical = 0;        // 0 = no radical, 1=singlet, 2=doublet, 3=triplet

        var id = null;          // unique id (i.e. for undo / redo)
        var index = null;       // numeric index in list of atoms
        var selected = 0;       // non zero, if the atom is currently selected
        var stereo = 0;
        var temp = 0;           // non zero if the atom is transient (temporary)
        var type = null;        // atom type / element / isotope


        return {
            addX : function (x) {
                coordX += x;
            },

            addY : function (y) {
                coordY += y;
            },

            addZ : function (z) {
                coordZ += z;
            },

            /**
             * change the isotope for the current atom
             * @param dir direction 1=up, -1=down
             */
            changeIsotope : function (dir) {
                var idx = type.getIsotope().getAtomicNumber();
                var massExact = type.getIsotope().getMassExact();
                var newIsotope = null;
                var oldDelta = 100.0;

                for (var iso of molPaintJS.Elements.getIsotopes(idx)) {
                    var delta = (iso.getMassExact() - massExact) * dir;
                    if ((delta > 0.0) && (delta < oldDelta)) {
                        oldDelta = delta;
                        newIsotope = iso;
                    }
                }
                    
                if (newIsotope != null) {
                    var at = molPaintJS.AtomType();
                    at.setIsotope(newIsotope); 
                    at.setColor(newIsotope.getColor()); 
                    type = at;
                    return true;
                }
                return false;
            },

            chargeDecrement : function () {
                charge -= 1;
            },

            chargeIncrement : function () {
                charge += 1;
            },

            addBond : function (idx) {
                bonds[idx] = idx;
            },

            /**
             * make a copy (clone) of this Atom
             * @return a new Atom with identical properties
             * including the bond list
             */
            copy : function () {
                var a = molPaintJS.Atom();
                a.setX(coordX);
                a.setY(coordY);
                a.setZ(coordZ);
                a.setCharge(charge);
                a.setRadical(radical);
                a.setId(id);
                a.setIndex(index);
                a.setSelected(selected);
                a.setStereo(stereo);
                a.setTemp(temp);
                a.setType(type);
                a.setBonds(this.copyBonds());
                return a;
            },

            copyBonds : function () {
                var b = {};
                for (var i in bonds) {
                    b[i] = i;
                }
                return b;
            },

            /**
             * delete a specific bond from this atom
             */
            delBond : function (idx) {
                delete bonds[idx];
            },

            getBBox : function () {
                return bbox;
            },

            getBonds : function () {
                return bonds;
            },

            getCharge : function () {
                return charge;
            },

            /**
             * compute the hydrogen count (implicit hydrogens)
             * for this atom. Currently does not account for 
             * explicit hydrogens!
             */
            getHydrogenCount : function(molecule) {
                var cnt = 0;

                // evaluate bond order
                for(var b in bonds) {
                    switch(molecule.getBond(b).getType()) {
                        case 1 : cnt -= 1;
                                break;
                        case 2 : cnt -= 2; 
                                break;
                        case 3 : cnt -= 3;
                    }
                }

                switch(type.getIsotope().getSymbol()) {
                    case "N" : cnt += 3 + charge;
                        break;
                    case "O" : cnt += 2 + charge;
                        break;
                    case "S" : cnt += 2 + charge;
                        break;
                }
                return (cnt > 0) ? cnt : 0;
            },

            getId : function () {
                return id;
            },

            getIndex : function () {
                return index;
            },

            getRadical : function () {
                return radical;
            },

            getSelected : function () {
                return selected;
            },

            getStereo : function () {
                return stereo;
            },

            getTemp : function () {
                return temp;
            },

            getType : function () {
                return type;
            },

            getX : function() {
                return coordX;
            },

            getY : function() {
                return coordY;
            },

            getZ : function() {
                return coordZ;
            },

            setBBox : function (b) {
                bbox = b;
            },

            setBonds : function (b) {
                bonds = b;
            },

            setCharge : function (c) {
                charge = c;
            },

            setId : function (i) {
                id = i;
            },

            setIndex : function (i) {
                index = i;
            },

            setRadical : function (r) {
                radical = r;
            },

            setSelected : function (s) {
                selected = s;
            },

            setStereo : function (s) {
                stereo = s;
            },

            setTemp : function (t) {
                temp = t;
            },

            setType : function (t) {
                type = t;
            },

            setX : function (x) {
                coordX = x;
            },

            setY : function (y) {
                coordY = y;
            },

            setZ : function (z) {
                coordZ = z;
            }
        }; // return
    }
    return molpaintjs;
}(molPaintJS || {}));
