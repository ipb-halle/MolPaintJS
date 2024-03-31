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

    /**
     * Please note: the MDLv3000Writer is not re-entrant!
     */
    molpaintjs.MDLv3000Writer = function() {

        let output = "";

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

        function writeCTAB (chemObject) {
            output += 'M  V30 BEGIN CTAB\n';

            writeCountsLine(chemObject);

            if (chemObject.getAtomCount() > 0) {
                writeAtomBlock(chemObject);
            }

            if (chemObject.getBondCount() > 0) {
                writeBondBlock(chemObject);
            }

            // SGroup

            if (Object.keys(chemObject.getCollections()).length > 0) {
                writeCollectionBlock(chemObject);
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
            for (let a of atoms) {
                st = extendLine(st, ' ' + mol.getAtom(a).getIndex());
            }
            st = extendLine(st, ")");
            return st;
        }

        function writeBondBlock (chemObject) {
            output += "M  V30 BEGIN BOND\n";
            let atoms = chemObject.getAtoms();
            let bonds = chemObject.getBonds();
            for (let i in bonds) {
                let st = "";
                let b = bonds[i];
                st += sprintf("M  V30 %d %d %d %d",
                    b.getIndex(),
                    b.getType(),
                    atoms[b.getAtomA()].getIndex(),
                    atoms[b.getAtomB()].getIndex());

                st = extendLine(st, writeBondStereo(b));
                output += st + '\n';
            }
            output += "M  V30 END BOND\n";
        }

        function writeBondList (mol, id, line, count, bonds) {
            let st = " " + id + "=(";
            st = extendLine(line, st);
            st = extendLine(st, "" + count);
            for (let b of bonds) {
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
            for (let collection of Object.values(mol.getCollections())) {
                let st = "M  V30 ";
                st = extendLine(st, '"' + collection.getName() + '" ');
                let count = collection.getAtoms().length;
                if (count > 0) {
                    st = writeAtomList(mol, 'ATOMS', st, count, collection.getAtoms());
                }
                count = collection.getBonds().length;
                if (count > 0) {
                    st = writeBondList(mol, 'BONDS', st, count, collection.getBonds());
                }
                output += st + '\n';
            }
            output += "M  V30 END COLLECTION\n";
        }

        return {
            write : function (drawing) {
                output = "";
                let chemObject = molPaintJS.ChemObject(drawing);
                for (let c of Object.values(drawing.getChemObjects())) {
                    // xxxxx we should not join the RGroups here!
                    chemObject.join(c);
                }

                output = drawing.getProperty("NAME") + "\n";
                //         IIPPPPPPPPMMDDYYHHMM
                output += "  MolPaint" + molPaintJS.getMDLDateCode() + "\n";
                output += drawing.getProperty("COMMENT") + "\n";
                //
                //         aaabbblllfffcccsssxxxrrrpppiii999vvvvv
                //
                output += "  0  0  0  0  0  0            999 V3000\n";
                writeCTAB(chemObject.reIndex());
                output += "M  END\n";
                return output;
            },

            writeRXN : function (drawing) {
                let chemObjectIdsByRole = drawing.getRoles();
                if (chemObjectIdsByRole['educt'] == null) {
                    throw new Error("No ChemObject in educt role found");
                }
                if (chemObjectIdsByRole['product'] == null) {
                    throw new Error("No ChemObject in product role found");
                    return "";
                }
                if (chemObjectIdsByRole['default'] != null) {
                    throw new Error("Reaction must not contain ChemObject in default role");
                    return "";
                }

                output = "$RXN V3000\n";
                output += drawing.getProperty("NAME") + "\n";
                //         IIIIIIPPPPPPPPPMMDDYYYYHHmmRRRRRRR
                output += "      MolPaint " + molPaintJS.getMDLDateCode() + "\n";
                output += drawing.getProperty("COMMENT") + "\n";
                output += sprintf("M  V30 COUNTS %d %d\n",
                    Object.keys(chemObjectIdsByRole['educt']).length,
                    Object.keys(chemObjectIdsByRole['product']).length);
                output += "M  V30 BEGIN REACTANT\n";

                for (let chemObjectId in chemObjectIdsByRole['educt']) {
                    writeCTAB(drawing
                        .getChemObjects()[chemObjectId]
                        .reIndex());
                }

                output += "M  V30 END REACTANT\n";
                output += "M  V30 BEGIN PRODUCT\n";

                for (let chemObjectId in chemObjectIdsByRole['product']) {
                    writeCTAB(drawing
                        .getChemObjects()[chemObjectId]
                        .reIndex());
                }

                output += "M  V30 END PRODUCT\n";

                if (chemObjectIdsByRole['agent'] != null) {
                    output += "M  V30 BEGIN AGENT\n";
                    for (let chemObjectId in chemObjectIdsByRole['agent']) {
                        writeCTAB(drawing
                            .getChemObjects()[chemObjectId]
                            .reIndex());
                    }
                    output += "M  V30 END AGENT\n";
                }
                output += "M  END\n";
                return output;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
