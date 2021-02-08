/*
 * MolPaintJS
 * Copyright 2021 Leibniz-Institut f. Pflanzenbiochemie 
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
 *============================================================================
 *
 * Parser Generator for MDL V3000 MOL Files
 *  
 */

{
    const util = require('util');

    function makeNumberString (sign, integral, fraction) {
        var numberString = ((sign != null) ? sign : "");
        numberString += integral[0];
        if (integral[1] != null) {
            numberString += integral[1].join('');
        }
        if (fraction != null) {
            numberString += fraction[0];
            if (fraction[1] != null) {
                numberString += fraction[1].join('');
            }
        }
        return numberString;
    }

    function flatten(collection, obj) {
        if (collection == undefined) {
            return obj;
        }
        collection.forEach(o => { if (o != undefined) { obj = {...obj, ...o}; }});
        return obj;
    }
}

ctab
    = atomBlock bondBlock { console.log('parsed CTAB'); }

/*
 *
 * ATOM BLOCK
 *
 *
 *  M  V30 BEGIN ATOM
 *  M  V30 index type x y z aamap -
 *  M  V30 [CHG=val] [RAD=val] [CFG=val] [MASS=val] -
 *  M  V30 [VAL=val] -
 *  M  V30 [HCOUNT=val] [STBOX=val] [INVRET=val] [EXACHG=val] -
 *  M  V30 [SUBST=val] [UNSAT=val] [RBCNT=val] -
 *  M  V30 [ATTCHPT=val] -
 *  M  V30 [RGROUPS=(nvals val [val ...])] -
 *  M  V30 [ATTCHORD=(nvals nbr1 val1 [nbr2 val2 ...])] -
 *  M  V30 [CLASS=template_class] -
 *  M  V30 [SEQID=sequence_id] -
 *  . . .
 *  M  V30 END ATOM
 */

atomBlock
    = newline 'M  V30 BEGIN ATOM' newline atomEntry* 'M  V30 END ATOM' { console.log('parsed ATOM BLOCK'); }

atomEntry
    = 'M  V30' atomIndex:uint atomType:atomTypeList atomX:float atomY:float 
      atomZ:float atomAtomMap:uint atomCont:atomContinuation { 
            console.log("idx=" + atomIndex 
                + ", elem=" + atomType 
                + ", x=" + atomX 
                + ", y=" + atomY 
                + ", z=" + atomZ 
                + ", map=" + atomAtomMap); 
            console.log("AtomProperties: " + util.inspect(atomCont, {showHidden: false, depth: null})); 
        }

atomContinuation
    = ' '* '-\nM  V30' cont:atomContinuation { return cont; }
    / ' '* charge:atomCharge ccont:atomContinuation* { return flatten(ccont, charge); }
    / ' '* radical:atomRadical rcont:atomContinuation* { return flatten(rcont, radical); }
    / ' '* '\n' { }

atomCharge
    = 'CHG=' chg:integer { return {'charge': chg, }; }

atomRadical
    = 'RAD=' rad:[0-3] { return {'radical': rad, }; } 

/* ToDo: add atomTypeList parser */
atomTypeList
    = ' '* element:([A-Z][a-z]*) { return element.join(''); }

/*
 *
 * BOND BLOCK
 *
 *
 * M  V30 BEGIN BOND
 * M  V30 index type atom1 atom2 -
 * M  V30 [CFG=val] -
 * M  V30 [TOPO=val] -
 * M  V30 [RXCTR=val] -
 * M  V30 [STBOX=val] -
 * M  V30 [ATTACH=[ALL|ANY] -
 * M  V30 [ENDPTS]=(natoms atom1 atoms2 [atom3 ...])]
 * M  V30 [DISP=[HBOND1|HBOND2|COORD|DATIVE]] -
 * ...
 * M  V30 END BOND
 */

bondBlock
    = newline 'M  V30 BEGIN BOND' newline bondEntry* 'M  V30 END BOND' { console.log('parsed BOND BLOCK'); }

bondEntry
    = 'M  V30' bondIndex:uint bondType:uint atom1:uint atom2:uint bondCont:bondContinuation {
            console.log("idx=" + bondIndex
                + ", type=" + bondType
                + ", atom 1=" + atom1
                + ", atom 2=" + atom2);
        }

bondContinuation
    = ' '* '-\nM  V30' cont:bondContinuation { return cont; }
    / ' '* '\n' { }

/*
 *
 * Global rules
 *
 */
newline
    = '\n'

float
    = ' '* number:numberString { return parseFloat(number); }

numberString
    = sign:'-'? integral:('0' / [1-9][0-9]*) fraction:('.' [0-9]+)? { return makeNumberString(sign, integral, fraction); }

integer
    = ' '* sign:sign uint:uint { return sign*uint; }
    / uint 

uint
    = ' '* uintString:uintString { return parseInt(uintString, 10); }

uintString
    = digits:[0-9]+ { return digits.join(''); }

sign
    = '-' { return -1; }
    / '+' { return 1; }

