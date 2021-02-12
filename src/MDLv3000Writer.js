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

    this.write = function (mol) {

        var st = "";

        mol.reIndex();

        st += mol.getProperty("NAME") + "\n";
        st += mol.getProperty("HEADER2") + "\n";
        st += mol.getProperty("COMMENT") + "\n";
        //
        //     aaabbblllfffcccsssxxxrrrpppiii999
        //
        st += "  0  0  0  0  0  0            999 V3000\n";
        st += this.writeCTAB(mol);
        st += "M  END\n";
        return st;
    }

    this.writeCTAB = function(mol) {
        var st = 'M  V30 BEGIN CTAB\n'
            + this.writeCountsLine(mol);

        if (mol.getAtomCount() > 0) {
            st += this.writeAtomBlock(mol);
        }

        if (mol.getBondCount() > 0) {
            st += this.writeBondBlock(mol);
        }

        // SGroup

        return st + 'M  V30 END CTAB\n';
    }

    this.writeCountsLine = function (mol) {

        // atomCount, bondCount, SgroupCount, 3D-ConstraintCount, chiralFlag(0,1), [registration number]

        var st = 'M  V30 COUNTS '
            + mol.getAtomCount() + ' '
            + mol.getBondCount() + ' '
            + '0 '
            + '0 '
            + '0\n';
        return st; 
    }

    this.writeAtomBlock = function (mol) {
        var st = "M  V30 BEGIN ATOM\n";
        for (var i in mol.getAtoms()) {
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
            st += '\n';
        }
        return st + "M  V30 END ATOM\n";
    }

    this.writeBondBlock = function (mol) {
        return "";
    }
}
