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

function MDLReader(st) {

    /*
     *
     * This reader is currently limited to parse a subset of
     * the MDL v2000 format!
     *
     */
    this.molString = st;
    this.currentIndex = 0;
    this.molecule = new Molecule();
    this.isoProp = 0;   // keep track of isotope settings from atom block / property block
    this.chgProp = 0;   // keep track of charge settings form atom block / property block

    /**
     * getLine()
     */
    this.getLine = function () {
        var i = this.currentIndex;
        if (this.molString.length <= i) {
            return null;
        }

        var j = this.molString.substr(this.currentIndex).indexOf("\n");
        if (j > -1) {
            this.currentIndex += j + 1;
            return this.molString.substr(i, j);
        }
        this.currentIndex = this.molString.length;
        return this.molString.substr(i);
    }

    /**
     * @return the molecule
     */
    this.getMolecule = function () {
        return this.molecule;
    }

    /**
     * parseAtom()
     * @param st String containing atom data
     */
    this.parseAtom = function (st) {
        var a = new Atom();
        a.coordX = parseFloat(st.substr(0, 10));
        a.coordY = -1.0 * parseFloat(st.substr(10, 10)); 	// flip on X axis
        a.coordZ = parseFloat(st.substr(20, 10));

        var iso = Elements.instance.getElement(st.substr(31, 3));
        var at = new AtomType();
        at.setIsotope(iso);
        at.setColor(iso.getColor());
        a.setType(at);

        this.parseAtomMassDiff(a, parseInt(st.substr(34, 2)));
        this.parseAtomLineCharge(a, parseInt(st.substr(36, 3)));
//      this.parseAtomStereo(a, parseInt(st.substr(39, 3)));
//      this.parseAtomQueryH(a, parseInt(st.substr(42, 3)));

        return a;
    }

    /**
     * parse the charge value in the V2000 atom line
     */
    this.parseAtomLineCharge = function (atom, chg) {
        this.chgProp = 1;
        switch (chg) {
            case 0 :
                atom.setCharge(0);
                break;
            case 1 :
                atom.setCharge(3);
                break;
            case 2 :
                atom.setCharge(2);
                break;
            case 3 :
                atom.setCharge(1);
                break;
            case 4 :
                atom.setCharge(0);
                atom.setRadical(2);
                break;
            case 5 :
                atom.setCharge(-1);
                break;
            case 6 :
                atom.setCharge(-2);
                break;
            case 7 :
                atom.setCharge(-3);
                break;
            default :
                alert("Illegal value for charge in atom line: " + chg);
        }
    }

    /**
     * Compatibility setting of mass difference. 
     * @param atom the atom
     * @param diff the mass difference (according to the documentation 
     * in the range of -3 .. +4)
     */
    this.parseAtomMassDiff = function (atom, diff) {
        this.isoProp = 1;
        if (diff !== 0) {
            var idx = atom.getType().getIsotope().getAtomicNumber() - 1;
            var mass = atom.getType().getIsotope().getMass();
            for (var iso of Elements.instance.elements[idx]) {
                if ((iso.getIsotope() > 0) && (iso.getMass() == (mass + diff))) {
                    var at = new AtomType();
                    at.setIsotope(iso);
                    at.setColor(iso.getColor());
                    atom.setType(at);
                    break;
                }
            }
        }
    }

    /**
     * parseBond()
     * @param st String containing bond data
     */
    this.parseBond = function (st) {
        var b = new Bond();
        var id = "Atom" + st.substr(0, 3).trim();
        b.setAtomA(this.molecule.getAtom(id));
        id = "Atom" + st.substr(3, 3).trim();
        b.setAtomB(this.molecule.getAtom(id));

        b.setType(st.substr(6, 3).trim());
        b.setStereo(st.substr(9, 3).trim());
        return b;
    }

    /**
     * parse a charge ("M CHG") line
     * @param st String containing charge data
     */
    this.parseCharge = function (st) {
        if (this.chgProp > 0) {
            this.resetCharges();
        }
        var l = parseInt(st.substr(6,3).trim());
        var i = 9;
        while (l > 0) {
            var id = "Atom" + st.substr(i, 4).trim();
            var chg = parseInt(st.substr(i + 4, 4).trim());
            this.molecule.getAtom(id).setCharge(chg);
            i += 8;
            l--;
        }
    }

    /**
     * parse an isotope ("M  ISO") line
     * @param st String containing isotope data
     */
    this.parseIsotope = function (st) {
        if (this.isoProp > 0) {
            this.resetIsotopes();
        }
        var l = parseInt(st.substr(6,3).trim());
        var i = 9;
        while (l > 0) {
            var id = "Atom" + st.substr(i, 4).trim();
            var mass = parseInt(st.substr(i + 4, 4).trim());
            var el = this.molecule.getAtom(id).getType().getIsotope().getAtomicNumber() - 1;

            for (var iso of Elements.instance.elements[el]) {
                if ((iso.getIsotope() > 0) && (iso.getMass() == mass)) {
                    var at = new AtomType();
                    at.setIsotope(iso); 
                    at.setColor(iso.getColor());
                    this.molecule.getAtom(id).setType(at);
                    break;
                }
            }

            i += 8;
            l--;
        }
    }

    /**
     * parseProperty()
     * @param st String containing property data
     */
    this.parseProperty = function (st) {
        var type = st.substr(0,6);
        switch (type) {
            case "M  CHG" : this.parseCharge(st);
                break;
            case "M  ISO" : this.parseIsotope(st);
                break;
            case "M  RAD" : this.parseRadical(st);
                break;
            case "M  V30" : this.parseV3000(st);
        }
    }

    /**
     * parse a radical ("M  RAD") line
     * @param st String containing radical data
     */
    this.parseRadical = function (st) {
        if (this.chgProp > 0) {
            this.resetCharges();
        }
        var l = parseInt(st.substr(6,3).trim());
        var i = 9;
        while (l > 0) {
            var id = "Atom" + st.substr(i, 4).trim();
            var rad = parseInt(st.substr(i + 4, 4).trim());
            this.molecule.getAtom(id).setRadical(rad);
            i += 8;
            l--;
        }
    }

    /**
     * parse a V3000 ("M  V30") line
     * @param st String containing data
     */
    this.parseV3000 = function (st) {
        alert("V3000 not supported yet");
    }

    /**
     * read()
     * @param molstr molecule in MDL V2000 format
     */
    this.read = function () {
        var cnt = 0;
        var atomcnt = 0;
        var bondcnt = 0;
        var atomlistcnt = 0;
        var stextcnt = 0;
        var phase = 0;
        var st = this.getLine();
        while (st != null) {
            switch (phase) {
                case 0 :
                    this.molecule.setProperty("NAME", st);
                    phase++;
                    break;
                case 1 :
                    this.molecule.setProperty("HEADER2", st);
                    phase++;
                    break;
                case 2 :
                    this.molecule.setProperty("COMMENT", st);
                    phase++;
                    break;
                case 3 :
                    atomcnt = parseInt(st.substr(0, 3));
                    bondcnt = parseInt(st.substr(3, 3));
                    atomlistcnt = parseInt(st.substr(6, 3));
                    stextcnt = parseInt(st.substr(15, 3));
                    phase++;
                    break;
                case 4 :
                    // v2000 atom block
                    if (cnt == atomcnt) {
                        cnt = 0;
                        phase++;
                    } else {
                        this.molecule.addAtom(this.parseAtom(st), null);
                        cnt++;
                        break;
                    }
                case 5 :
                    // v2000 bond block
                    if (cnt == bondcnt) {
                        cnt = 0;
                        phase++;
                    } else {
                        this.molecule.addBond(this.parseBond(st), null);
                        cnt++;
                        break;
                    }
                case 6:
                    // v2000 atom list block
                    if (atomlistcnt > 0) {
                        if (cnt == atomlistcnt) {
                            cnt = 0;
                            phase++;
                        } else {
                            // ignore atom list block
                            cnt++;
                            break;
                        }
                    } else {
                        phase++;
                    }
                case 7:
                    // v2000 stext block
                    if (stextcnt > 0) {
                        if (cnt == stextcnt) {
                            cnt = 0;
                            phase++;
                        } else {
                            // ignore stext block
                            cnt++;
                            break;
                        }
                    } else {
                        phase++;
                    }
                default :
                    // v2000 properties _and_ any v3000 data
                    this.parseProperty(st);
                    cnt++;
            }
            st = this.getLine();
        }
    }

    /**
     * reset all the charge and radical settings if "M  CHG" or "M  RAD" 
     * lines are given
     */
    this.resetCharges = function () {
        for (var a in this.molecule.getAtoms()) {
            var atom = this.molecule.getAtom(a);
            atom.setCharge(0);
            atom.setRadical(0);
        }
        this.chgProp = 0;
    }

    /**
     * reset all the isotope settings if "M  ISO" line is given
     */
    this.resetIsotopes = function () {
        for (var a in this.molecule.getAtoms()) {
            var atom = this.molecule.getAtom(a);
            if (atom.getType().getIsotope().getIsotope() > 0) {
                var idx = atom.getType().getIsotope().getAtomicNumber() - 1;
                var at = new AtomType();
                at.setIsotope(Elements.instance.elements[idx][0]); 
                at.setColor(at.getIsotope().getColor());
                atom.setType(at);
            }
        }
    }

}
