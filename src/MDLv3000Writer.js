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

function MDLv3000Writer() {

    this.output = "";
    this.write = function (mol) {

        mol.reIndex();

        this.output = mol.getProperty("NAME") + "\n";
        this.output += mol.getProperty("HEADER2") + "\n";
        this.output += mol.getProperty("COMMENT") + "\n";
        //
        //     aaabbblllfffcccsssxxxrrrpppiii999
        //
        this.output += "  0  0  0  0  0  0            999 V3000\n";
        this.writeCTAB(mol);
        this.output += "M  END\n";
        return this.output;
    }

    /**
     * check if the concatenation of line and st would exceed the 80 characters 
     * per line limit of MDL v3000 files and make a line continuation
     * @param line the current line containing data
     * @param st additional data for the current line
     * @return either concatenation (if combined length is smaller than 79) or st
     */
    this.extendLine = function(line, st) {
        var lenline = line.length;
        if ((line.length + st.length) > 78) {
            this.output += line + '-';
            return st;
        }
        return line + st;
    }

    this.writeCTAB = function(mol) {
        this.output += 'M  V30 BEGIN CTAB\n';

        this.writeCountsLine(mol);

        if (mol.getAtomCount() > 0) {
            this.writeAtomBlock(mol);
        }

        if (mol.getBondCount() > 0) {
            this.writeBondBlock(mol);
        }

        // SGroup

        this.output += 'M  V30 END CTAB\n';
    }

    this.writeCountsLine = function (mol) {

        // atomCount, bondCount, SgroupCount, 3D-ConstraintCount, chiralFlag(0,1), [registration number]

        this.output += 'M  V30 COUNTS '
            + mol.getAtomCount() + ' '
            + mol.getBondCount() + ' '
            + '0 '
            + '0 '
            + '0\n';
    }

    this.writeAtomBlock = function (mol) {
        this.output += "M  V30 BEGIN ATOM\n";
        for (var i in mol.getAtoms()) {
            var st = "";
            var a = mol.getAtom(i);
            //  
            //	coordinates must be flipped on X-axis!
            //
            st += sprintf("M  V30 %d %s %.4f %.4f %.4f %d", 
                    a.getIndex(),
                    a.getType().getIsotope().getSymbol(),
                    a.coordX,
                    a.coordY * -1.0, 
                    a.coordZ,
                    0                           // aamap
                );
            st = this.extendLine(st, this.writeAtomCharge(a));
            st = this.extendLine(st, this.writeAtomMass(a));
            this.output += st + '\n';
        }
        this.output += "M  V30 END ATOM\n";
    }

    this.writeAtomCharge = function(atom) {
        if (atom.getCharge() != 0) {
            return " CHG=" + atom.getCharge();
        } 
        return '';
    }

    this.writeAtomMass = function(atom) {
        var iso = atom.getType().getIsotope().getIsotope();
        if (iso != 0) {
            return " MASS=" + iso;
        } 
        return '';
    }

    this.writeBondBlock = function (mol) {
        this.output += "M  V30 BEGIN BOND\n";
        for (var i in mol.getBonds()) {
            var st = "";
            var b = mol.getBond(i);
            st += sprintf("M  V30 %d %d %d %d",
                b.getIndex(),
                b.getType(),
                b.getAtomA().getIndex(),
                b.getAtomB().getIndex());

            st = this.extendLine(st, this.writeBondStereo(b));
            this.output += st + '\n';
        }
        this.output += "M  V30 END BOND\n";
    }

    this.writeBondStereo = function (bond) {
        if (bond.getStereo('v3') != 0) {
            return " CFG=" + bond.getStereo('v3');
        }
        return '';
    }
}
