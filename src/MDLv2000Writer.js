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
var molPaintJS = (function (molpaintjs) {
    "use strict";

    molpaintjs.MDLv2000Writer = function() {

        /**
         * return charge value of atom according to V2000
         * specification
         */
        function atomLineCharge (atom) {
            switch (atom.getCharge()) {
                case 1 :
                    return 3;
                case 2 :
                    return 2;
                case 3 :
                    return 1;
                case -1 :
                    return 5;
                case -2 :
                    return 6;
                case -3 :
                    return 7;
            }
            if (atom.getRadical() == 2) {
                return 4;
            }
            return 0;
        }

        function writeAtomTable (mol) {
            let st = "";
            for (let i in mol.getAtoms()) {
                let a = mol.getAtom(i);
                //
                //      xx.xx yy.yy zz.zz XxxddcccssshhhbbbvvvHHHrrriiimmmnnneee
                //	(must be flipped on X-axis)
                //
                let sym = a.getType().getIsotope().getSymbol() + "  ";
                st += sprintf("%10.4f%10.4f%10.4f %3s%2d%3d%3d%3d%3d%3d%3d%3d%3d%3d%3d%3d\n",
                    a.getX(), -1.0 * a.getY(), a.getZ(),
                    sym.substring(0, 3),		// symbol
                    0, 				// mass difference
                    atomLineCharge(a),	// formal charge
                    0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
            }
            return st;
        }

        function writeBondTable (chemObject) {
            let st = "";
            let atoms = chemObject.getAtoms();
            let bonds = chemObject.getBonds();
            for (let i in bonds) {
                let b = bonds[i];
                st += sprintf("%3d%3d%3d%3d\n",
                    atoms[b.getAtomA()].getIndex(),
                    atoms[b.getAtomB()].getIndex(),
                    b.getType(),
                    b.getStereo('v2'));
            }
            return st;
        }

        /**
         * Write the "M  CHG" part of the mol file
         * @param mol the drawing
         * @return the string
         */
        function writeCharges (mol) {
            let st = "";
            let atomNumbers = [];
            let charges = [];

            for (let idx in mol.getAtoms()) {
                let atom = mol.getAtom(idx);
                if (atom.getCharge() != 0) {
                    atomNumbers.push(atom.getIndex());
                    charges.push(atom.getCharge()); 
                }
            }

            let j;
            for (let i=0; i<atomNumbers.length; i++) {
                if ((i % 8) == 0) {
                    if (i > 0) {
                        st += "\n";
                    }
                    j = atomNumbers.length - i;
                    j = (j > 8) ? 8 : j;
                    st += sprintf("M  CHG%3d", j);
                }
                st += sprintf(" %3d %3d", atomNumbers[i], charges[i]);
                if (i == (atomNumbers.length - 1)) {
                    st += "\n";
                }
            }
            return st;
        }

        /**
         * Write the "M  ISO" part of the mol file
         * @param mol the drawing 
         * @return the string
         */
        function writeIsotopes (mol) {
            let st = "";
            let atomNumbers = [];
            let masses = [];

            for (let idx in mol.getAtoms()) {
                let atom = mol.getAtom(idx);
                if (atom.getType().getIsotope().getIsotope() > 0) {
                    atomNumbers.push(atom.getIndex());
                    masses.push(atom.getType().getIsotope().getMass());
                }
            }

            let j;
            for (let i=0; i<atomNumbers.length; i++) {
                if ((i % 8) == 0) {
                    if (i > 0) {
                        st += "\n";
                    }
                    j = atomNumbers.length - i;
                    j = (j > 8) ? 8 : j;
                    st += sprintf("M  ISO%3d", j);
                }
                st += sprintf(" %3d %3d", atomNumbers[i], masses[i]);
                if (i == (atomNumbers.length - 1)) {
                    st += "\n";
                }
            }
            return st;
        }

        /**
         * write the properties block 
         * @param mol the drawing 
         * @return a string containing the properties block
         */
        function writeProperties (mol) {
            let st = "";
            st += writeCharges(mol);
            st += writeRadicals(mol);
            st += writeIsotopes(mol);
            return st;
        }

        /**
         * Write the "M  RAD" part of the mol file
         * @param mol the drawing 
         * @return the string
         */
        function writeRadicals (mol) {
            let st = "";
            let atomNumbers = [];
            let radicals = [];

            for (let idx in mol.getAtoms()) {
                let atom = mol.getAtom(idx);
                if (atom.getRadical() != 0) {
                    atomNumbers.push(atom.getIndex());
                    radicals.push(atom.getRadical()); 
                }
            }

            let j;
            for (let i=0; i<atomNumbers.length; i++) {
                if ((i % 8) == 0) {
                    if (i > 0) {
                        st += "\n";
                    }
                    j = atomNumbers.length - i;
                    j = (j > 8) ? 8 : j;
                    st += sprintf("M  RAD%3d", j);
                }
                st += sprintf(" %3d %3d", atomNumbers[i], radicals[i]);
                if (i == (atomNumbers.length - 1)) {
                    st += "\n";
                }
            }
            return st;
        }

        return {
            write : function (drawing) {

                let st = "";

                let chemObject = molPaintJS.ChemObject(drawing);
                for (let c of Object.values(drawing.getChemObjects())) {
                    if (c.getRole() != "default") {
                        throw new Error("MDLv2000Writer currently neither supports reactions nor RGroups");
                    }
                    chemObject.join(c);
                }
                chemObject.reIndex();

                if ((chemObject.getAtomCount() > 999) || (chemObject.getBondCount() > 999)) {
                    throw new Error("Atom count or bond count exceeds limit for V2000 format");
                }

                st += drawing.getProperty("NAME") + "\n";
                //     IIPPPPPPPPMMDDYYHHMM
                st += "  MolPaint" + molPaintJS.getMDLDateCode() + "\n";
                st += drawing.getProperty("COMMENT") + "\n";
                //
                //             aaabbblllfffcccsssxxxrrrpppiii999vvvvvv
                //
                st += sprintf("%3d%3d  0  0  0  0            999 V2000\n",
                    chemObject.getAtomCount(),
                    chemObject.getBondCount());

                st += writeAtomTable(chemObject);
                st += writeBondTable(chemObject);
                st += writeProperties(chemObject);

                st += "M  END\n";
                return st;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
