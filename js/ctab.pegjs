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
 * Parser Generator for MDL MOL Files (V2000 / V3000)
 *  
 */

{
    const util = require('util');

    var mdlParserData = { 'atomCount':0, 'currentAtom':0, 'bondCount':0, 'currentBond':0 };

    function makeNumberString (sign, integral, fraction) {
        var numberString = ((sign != null) ? sign : '');
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

mdlFile
    = header v2Counts v2ctab endOfFile { console.log('parsed V2000 File'); }
    / header v3Counts v3ctab endOfFile { console.log('parsed V3000 File'); }

header
    = header1 header2 header3 { console.log('parsed Header'); }

endOfFile
    = newline 'M  END' [ \n]*

header1
    = line:([^\n]*) { mdlParserData.header1 = line.join(''); } 

header2
    = newline line:([^\n]*) { mdlParserData.header2 = line.join(''); }

header3
    = newline line:([^\n]*) { mdlParserData.header3 = line.join(''); }

/*
 * Global Counts Line
 */
v2Counts
    = newline nAtoms:uint3 nBonds:uint3 nAtomList:uint3 string3 chiral:uint3 nSTEXT:uint3 string3 string3 string3 string3 uint3 ' V2000' { 
            console.log('parsed v2Counts');  
            mdlParserData.atomCount = nAtoms;
            mdlParserData.bondCount = nBonds;
        }
    / newline nAtoms:uint3 nBonds:uint3 nAtomList:uint3 string3 chiral:uint3 nSTEXT:uint3 string3 string3 string3 string3 uint3 {
            console.log('parsed v2Counts');  
            mdlParserData.atomCount = nAtoms;
            mdlParserData.bondCount = nBonds;
        }

v3Counts
    = newline nAtoms:uint3 nBonds:uint3 nAtomList:uint3 string3 chiral:uint3 nSTEXT:uint3 string3 string3 string3 string3 uint3 ' V3000' {
            console.log('parsed v3Counts'); 
            // nAtoms & nBonds ignored
        }

/*
/*
 *======================================================================
 *
 * V2000 Connection Table
 *
 *======================================================================
 *
 * V2000 ATOM BLOCK
 * xxxxx.xxxxyyyyy.yyyyzzzzz.zzzz aaaddcccssshhhbbbvvvHHHrrriiimmmnnneee
 *    -0.4125   -0.6348    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
 *
 * x,y,z    coordinates
 * aaa      atom type
 * dd       mass difference (-3 - 4)
 * ccc      charge (0 - 7)
 * sss      atom stereo parity (0 - 3)
 * hhh      hydrogen count + 1 (1 - 5)
 * bbb      stereo care box (0,1)
 * vvv      valence (0 - 14)
 * HHH      H0 designator (0,1)
 * rrr      unused
 * iii      unused
 * mmm      atom-atom mapping
 * nnn      inversion / retention (0,1,2)
 * eee      exact change flag (0,1)
 */

v2ctab
    = v2atom* v2bond* { console.log('parsed V2000 CTAB'); } 

v2atom
    = newline atom:v2atomLine { console.log('parsed v2Atom'); }

v2atomLine
    = atomX:float10 atomY:float10 atomZ:float10 ' ' atomType:string3 massDiff:int2
        charge:uint3 sss:uint3 hhh:uint3 bbb:uint3 vvv:uint3 HHH:uint3 
        rrr:string3 iii:string3 mmm:uint3 nnn:uint3 eee:uint3 &{
            if (mdlParserData.atomCount > mdlParserData.currentAtom) {
                mdlParserData.currentAtom++;
                return true;
            }
            return false;
        } {
            console.log('ATOM: x=' + atomX + ', y=' + atomY + ', z=' + atomZ);
            return 'atom';
        }

/*
 * V2000 BOND BLOCK
 * 111222tttsssxxxrrrccc
 *   1  2  1  0
 *
 * 111  first atom
 * 222  second atom
 * ttt  bond type (1 - 8)
 * sss  bond stereo (0 - 6)
 * xxx  unused
 * rrr  bond topology (0 - 2)
 * ccc  reacting center status (-1 - 13?)
 */

v2bond
    = newline bond:v2bondLine { console.log('parsed v2Bond'); }

v2bondLine
    = bond1:uint3 bond2:uint3 bondType:uint3 (sss:uint3 (xxx:string3 (rrr:uint3 (ccc:int3)?)?)?)? &{
            if ((mdlParserData.atomCount == mdlParserData.currentAtom)
              && (mdlParserData.bondCount > mdlParserData.currentBond)) {
                mdlParserData.currentBond++;
                return true;
            }
            return false;
        } { 
            console.log('BOND: a=' + bond1 + ', b=' + bond2);
            return 'bond';
        }

/*
 *======================================================================
 *
 * V3000 Connection Table
 *
 *======================================================================
 */
v3ctab
    = newline 'M  V30 BEGIN CTAB' v3countsLine v3atomBlock v3bondBlock newline 'M  V30 END CTAB' { console.log('parsed V3000 CTAB'); }

/*
 *
 * V3000 COUNTS LINE
 *
 *
 * M  V30 COUNTS na nb nsg n3d chiral [REGNO=regno] 
 */
v3countsLine
    = newline 'M  V30 COUNTS' nAtoms:uint nBonds:uint nSgroups:uint n3d:uint ' ' chiral:[01] countRegNo? { return {'nAtoms':nAtoms, 'nBonds':nBonds}; }

countRegNo
    = ' '* 'REGNO=' regno:uint { }

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

v3atomBlock
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

v3bondBlock
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
 *======================================================================
 *
 * Global Rules
 *
 *======================================================================
 */
newline
    = '\n'

float
    = ' '* number:numberString { return parseFloat(number); }

float10
    = num:([ \-0-9][ \-0-9][ \-0-9][ \-0-9][0-9]'.'[0-9][0-9][0-9][0-9]) { return parseFloat(num.join('')); }

numberString
    = sign:'-'? integral:('0' / [1-9][0-9]*) fraction:('.' [0-9]+)? { return makeNumberString(sign, integral, fraction); }

integer
    = ' '* sign:sign uint:uint { return sign*uint; }
    / uint 

int2
    = digits:([ \-0-9][ 0-9]) { return parseInt(digits.join(''), 10); }

int3
    = digits:([ \-0-9][ \-0-9][ 0-9]) { return parseInt(digits.join(''), 10); }

uint3
    = digits:([ 0-9][ 0-9][ 0-9]) { return parseInt(digits.join(''), 10); }

uint
    = ' '* uintString:uintString { return parseInt(uintString, 10); }

uintString
    = digits:[0-9]+ { return digits.join(''); }

sign
    = '-' { return -1; }
    / '+' { return 1; }

string3
    = characters:([^\n][^\n][^\n]) { return characters.join(''); }
