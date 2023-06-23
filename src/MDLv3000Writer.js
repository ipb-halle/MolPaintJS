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

    molpaintjs.MDLv3000Writer = function() {

        var output = "";

        /**
         * check if the concatenation of line and st would exceed the 80 characters
         * per line limit of MDL v3000 files and make a line continuation
         * @param line the current line containing data
         * @param st additional data for the current line
         * @return either concatenation (if combined length is smaller than 79) or st
         */
        function extendLine (line, st) {
            if ((line.length + st.length) > 78) {
                output += line + "-\n";
                return "M  V30 " + st;
            }
            return line + st;
        }

        function writeCTAB (mol) {
            output += 'M  V30 BEGIN CTAB\n';

            writeCountsLine(mol);

            if (mol.getAtomCount() > 0) {
                writeAtomBlock(mol);
            }

            if (mol.getBondCount() > 0) {
                writeBondBlock(mol);
            }

            // SGroup

            if (mol.getCollections().length > 0) {
                writeCollectionBlock(mol);
            }

            output += 'M  V30 END CTAB\n';
        }

        function writeCountsLine (mol) {

            // atomCount, bondCount, SgroupCount, 3D-ConstraintCount, chiralFlag(0,1), [registration number]

            output += 'M  V30 COUNTS '
                + mol.getAtomCount() + ' '
                + mol.getBondCount() + ' '
                + '0 '
                + '0 '
                + '0\n';
        }

        function writeAtomBlock (mol) {
            output += "M  V30 BEGIN ATOM\n";
            for (let i in mol.getAtoms()) {
                let st = "";
                let a = mol.getAtom(i);
                //
                //	coordinates must be flipped on X-axis!
                //
                st += sprintf("M  V30 %d %s %.4f %.4f %.4f %d",
                        a.getIndex(),
                        a.getType().getIsotope().getSymbol(),
                        a.getX(),
                        a.getY() * -1.0,
                        a.getZ(),
                        0                           // aamap
                    );
                st = extendLine(st, writeAtomCharge(a));
                st = extendLine(st, writeAtomRadical(a));
                st = extendLine(st, writeAtomMass(a));
                output += st + '\n';
            }
            output += "M  V30 END ATOM\n";
        }

        function writeAtomCharge (atom) {
            if (atom.getCharge() != 0) {
                return " CHG=" + atom.getCharge();
            }
            return '';
        }

        function writeAtomMass (atom) {
            let iso = atom.getType().getIsotope();
            if (iso.getIsotope() != 0) {
                return " MASS=" + iso.getMass();
            }
            return '';
        }

        function writeAtomRadical (atom) {
            if (atom.getRadical() != 0) {
                return " RAD=" + atom.getRadical();
            }
            return '';
        }

        function writeAtomList (mol, id, line, count, atoms) {
            let st = " " + id + "=(";
            st = extendLine(line, st);
            st = extendLine(st, "" + count);
            for (let a in atoms) {
                st = extendLine(st, ' ' + mol.getAtom(a).getIndex());
            }
            st = extendLine(st, ")");
            return st;
        }

        function writeBondBlock (mol) {
            output += "M  V30 BEGIN BOND\n";
            for (let i in mol.getBonds()) {
                let st = "";
                let b = mol.getBond(i);
                st += sprintf("M  V30 %d %d %d %d",
                    b.getIndex(),
                    b.getType(),
                    b.getAtomA().getIndex(),
                    b.getAtomB().getIndex());

                st = extendLine(st, writeBondStereo(b));
                output += st + '\n';
            }
            output += "M  V30 END BOND\n";
        }

        function writeBondList (mol, id, line, count, bonds) {
            let st = " " + id + "=(";
            st = extendLine(line, st);
            st = extendLine(st, "" + count);
            for (let b in bonds) {
                st = extendLine(st, ' ' + mol.getBond(b).getIndex());
            }
            st = extendLine(st, ")");
            return st;
        }

        function writeBondStereo (bond) {
            if (bond.getStereo('v3') != 0) {
                return " CFG=" + bond.getStereo('v3');
            }
            return '';
        }

        function writeCollectionBlock (mol) {
            output += "M  V30 BEGIN COLLECTION\n";
            for (let collection of mol.getCollections()) {
                let st = "M  V30 ";
                st = extendLine(st, '"' + collection.getName() + '" ');
                let count = Object.keys(collection.getAtoms()).length;
                if (count > 0) {
                    st = writeAtomList(mol, 'ATOMS', st, count, collection.getAtoms());
                }
                count = Object.keys(collection.getBonds()).length;
                if (count > 0) {
                    st = writeBondList(mol, 'BONDS', st, count, collection.getBonds());
                }
                output += st + '\n';
            }
            output += "M  V30 END COLLECTION\n";
        }

        return {
            write : function (mol) {

                mol.reIndex();

                output = mol.getProperty("NAME") + "\n";
                //         IIPPPPPPPPMMDDYYHHMM
                output += "  MolPaint" + molPaintJS.getMDLDateCode() + "\n";
                output += mol.getProperty("COMMENT") + "\n";
                //
                //         aaabbblllfffcccsssxxxrrrpppiii999vvvvv
                //
                output += "  0  0  0  0  0  0            999 V3000\n";
                writeCTAB(mol);
                output += "M  END\n";
                return output;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
