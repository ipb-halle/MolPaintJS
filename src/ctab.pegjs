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
//  const util = require('util');

    var mdlParserData = {
        'atomCount':0,
        'atomListCount':0,
        'bondCount':0,
        'currentAtom':0,
        'currentAtomList':0,
        'currentBond':0,
        'currentProperty':0,
        'currentStext':0,
        'propertyCount':0,
        'resetCharges':true,
        'resetIsotopes':true,
        'stextCount':0,
    };

    function logMessage(level, message) {
        if ((options.logLevel != null) && (options.logLevel > level)) {
            console.log(message);
        }
    }

    /**
     * obtain an atomType from a given elemental symbol and optionally
     * a mass difference (V2000) or an absolute mass (V2000 'M  ISO' or V3000)
     */
    function getAtomType(sym, massDiff, absMass) {
        var atomType = molPaintJS.AtomType();
        var stdIsotope = molPaintJS.Elements.getElement(sym);
        var atomicNumber = stdIsotope.getAtomicNumber() - 1;
        var targetMass = stdIsotope.getMass();

        if (absMass != null) {
            targetMass = absMass;
        } else {
            if ((massDiff != null) && (massDiff !== 0)) {
                targetMass = + massDiff;
            } else {
                return getAtomTypeFromIsotope(stdIsotope);
            }
        }

        for(var iso of molPaintJS.Elements.elements[atomicNumber]) {
            if ((iso.getIsotope() > 0) && (iso.getMass() == targetMass)) {
                return(getAtomTypeFromIsotope(iso));
            }
        }

        logMessage(1, "Isotope not found: " + targetMass + sym);
        return getAtomTypeFromIsotope(stdIsotope);
    }

    function getAtomTypeFromIsotope(iso) {
        var atomType = molPaintJS.AtomType();
        atomType.setIsotope(iso);
        atomType.setColor(iso.getColor());
        return atomType;
    }

    /**
     * flatten nested property blocks which occur during parsing
     */
    function flatten(collection, obj) {
        if (collection == undefined) {
            return obj;
        }
        collection.forEach(o => { if (o != undefined) { obj = {...obj, ...o}; }});
        return obj;
    }

    /**
     * make a number string from sign, integral and fractional values
     */
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

    /**
     * reset the charge and radical properties for V2000 connection tables
     * in case a 'M  CHG' or 'M  RAD' block is found. Executes only once.
     */
    function resetCharges () {
        if (mdlParserData.resetCharges) {
            for (var a in mdlParserData.molecule.getAtoms()) {
                var atom = mdlParserData.molecule.getAtom(a);
                atom.setCharge(0);
                atom.setRadical(0);
            }
            mdlParserData.resetCharges = false;
        }
    }

    /**
     * reset the isotope properties for V2000 connection tables in case
     * a 'M  ISO' property block is read. Executes only once.
     */
    function resetIsotopes () {
        if (mdlParserData.resetIsotopes) {
            for (var a in mdlParserData.molecule.getAtoms()) {
                var atom = mdlParserData.molecule.getAtom(a);
                if (atom.getType().getIsotope().getIsotope() > 0) {

                    // does not reset Deuterium and Tritium!

                    atom.setType(getAtomType(atom.getType().getIsotope().getSymbol(), null, null));
                }
            }
            mdlParserData.resetIsotopes = false;
        }
    }

    /**
     * set atom charge from V2000 charge value
     */
    function setV2AtomCharge(atom, charge) {
        switch(charge) {
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
                logMessage(1, 'Invalid charge value: ' + charge);
        }
    }

}

mdlFile
    = header v2Counts v2ctab endOfFile { logMessage(1, 'parsed V2000 File'); return mdlParserData.molecule; }
    / header v3Counts v3ctab endOfFile { logMessage(1, 'parsed V3000 File'); return mdlParserData.molecule; }

header
    = header1 header2 header3 { logMessage(1, 'parsed Header'); }

endOfFile
    = newline 'M  END' whitespaceNL*

header1
    = line:(noNL*) { mdlParserData.header1 = line.join(''); }

header2
    = newline line:(noNL*) { mdlParserData.header2 = line.join(''); }

header3
    = newline line:(noNL*) { mdlParserData.header3 = line.join(''); }

/*
 * Global Counts Line
 */
v2Counts
    = newline nAtoms:uint3 nBonds:uint3 nAtomList:uint3 string3 chiral:uint3 nSTEXT:uint3 string3 string3 string3 string3 uint3 ' V2000'? {
            logMessage(1, 'parsed v2Counts');
            mdlParserData.atomCount = nAtoms;
            mdlParserData.bondCount = nBonds;
            mdlParserData.atomListCount = nAtomList;
            mdlParserData.stextCount = nSTEXT;
            mdlParserData.molecule = molPaintJS.Molecule();
            mdlParserData.molecule.setProperty('NAME', mdlParserData.header1);
            mdlParserData.molecule.setProperty('HEADER2', mdlParserData.header2);
            mdlParserData.molecule.setProperty('COMMENT', mdlParserData.header3);
        }

v3Counts
    = newline nAtoms:uint3 nBonds:uint3 nAtomList:uint3 string3 chiral:uint3 nSTEXT:uint3 string3 string3 string3 string3 uint3 ' V3000' {
            logMessage(1, 'parsed v3Counts');
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
    = v2atom* v2bond* v2atomlist* v2stext* v2props* { logMessage(1, 'parsed V2000 CTAB'); }

v2atom
    = newline atom:v2atomLine {
            mdlParserData.molecule.addAtom(atom, null);
        }

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
            var a = molPaintJS.Atom();
            a.setX(atomX);
            a.setY(-1.0 * atomY); // flip on X axis
            a.setZ(atomZ);

            a.setType(getAtomType(atomType, massDiff, null));
            setV2AtomCharge(a, charge);

            // query features etc.

            return a;
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
    = newline bond:v2bondLine {
            mdlParserData.molecule.addBond(bond, null);
        }

v2bondLine
    = atom1:uint3 atom2:uint3 bondType:uint3 sss:uint3 optprop:(xxx:string3 (rrr:uint3 (ccc:int3)?)?)? &{
            if ((mdlParserData.atomCount == mdlParserData.currentAtom)
              && (mdlParserData.bondCount > mdlParserData.currentBond)) {
                mdlParserData.currentBond++;
                return true;
            }
            return false;
        } {
            var b = molPaintJS.Bond();
            b.setAtomA(mdlParserData.molecule.getAtom("Atom" + atom1));
            b.setAtomB(mdlParserData.molecule.getAtom("Atom" + atom2));
            b.setType(bondType);
            b.setStereo(sss, 'v2');

            // optprop

            return b;
        }

/*
 * V2000 ATOMLIST BLOCK
 *
 * aaa kSSSSn 111 222 333 444 555
 */
v2atomlist
    = newline aaa:uint3 ' ' flag:[TF] '    ' cnt:[1-5] ' ' entries:(uint3 (' ' uint3 (' ' uint3 (' ' uint3 (' ' uint3)?)?)?)?) & {
            if (mdlParserData.atomListCount > mdlParserData.currentAtomList) {
                mdlParserData.currentAtomList++;
                return true;
            }
            return false;
        }

/*
 * V2000 STEXT BLOCK
 *
 * xxxxx.xxxxyyyyy.yyyy
 * TTTT...
 */
v2stext
    = newline float10 float10 newline noNL* &{
            if (mdlParserData.stextCount > mdlParserData.currentStext) {
                mdlParserData.currentStext++;
                return true;
            }
            return false;
        }

/*
 * V2000 PROPERTY BLOCK (incomplete!)
 */
v2props
    = v2propIsis
    / v2propAtomValuePairs
    / v2propLinkAtom
    / v2propAtomList
    / v2propRGROUP
    / v2propSGROUP
    / v2propOTHER

v2propIsis
    = newline 'A  ' uint3 newline noNL*
    / newline 'V  ' uint3 ' ' noNL*
    / newline 'G  ' uint3 uint3 newline noNL*

/*
 * properties: atom number value pairs
 * M  [RAD|CHG|ISO|...]nn8 aaa vvv ...
 */
v2propAtomValuePairs
    = propType:v2propAtomValuePairsHeader props:v2propAtomValuePair+ {
            for(var prop of props) {
                var atom = mdlParserData.molecule.getAtom("Atom" + prop.atom);
                switch(propType) {
                    case 'CHG' :
                        atom.setCharge(prop.value);
                        break;
                    case 'ISO' :
                        atom.setType(getAtomType(atom.getType().getIsotope().getSymbol(), null, prop.value));
                        break;
                    case 'RAD' :
                        atom.setRadical(prop.value);
                    default :
                        logMessage(1, 'Ignoring property ' + propType);
                }
            }
//          logMessage(1, util.inspect(props, {showHidden: false, depth: null}));
        }

v2propAtomValuePairsHeader
    = newline 'M  CHG' propcnt:uint3 {
            resetCharges();
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'CHG'; }
    / newline 'M  RAD' propcnt:uint3 {
            resetCharges();
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'RAD'; }
    / newline 'M  ISO' propcnt:uint3 {
            resetIsotopes();
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'ISO'; }
    / newline 'M  RBC' propcnt:uint3 {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'RBC'; }
    / newline 'M  SUB' propcnt:uint3 {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'SUB'; }
    / newline 'M  UNS' propcnt:uint3 {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'UNS'; }
    / newline 'M  APO' propcnt:uint3 {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'APO'; }
    / newline 'M  RGP' propcnt:uint3 {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
            return 'RGP'; }

v2propAtomValuePair
    = atom:uint value:integer &{
            if (mdlParserData.propertyCount > mdlParserData.currentProperty) {
                mdlParserData.currentProperty++;
                return true;
            }
            return false;
        } {
            return {'atom':atom, 'value':value, };
        }

v2propLinkAtom
    = v2propLinkAtomHeader v2propLinkAtomEntry+

v2propLinkAtomHeader
    = newline 'M  LIN' propcnt:uint3 {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0;
        }

v2propLinkAtomEntry
    = atom:uint value:uint sub1:uint sub2:uint &{
            if (mdlParserData.propertyCount > mdlParserData.currentProperty) {
                mdlParserData.currentProperty++;
                return true;
            }
            return false;
        } {
            return {'atom':atom, 'value':value, 'sub1':sub1, 'sub2':sub2, }; 
        }

v2propAtomList
    = v2propAtomListHeader v2propAtomListEntry+

v2propAtomListHeader
    = newline 'M  ALS ' uint3 propcnt:uint3 ' ' [TF] ' ' {
            mdlParserData.propertyCount = propcnt;
            mdlParserData.currentProperty = 0; 
        }

v2propAtomListEntry
    = entry:string4 &{
            if (mdlParserData.propertyCount > mdlParserData.currentProperty) {
                mdlParserData.currentProperty++;
                return true;
            }
            return false;
        } {
            return entry;
        }

v2propRGROUP
    = newline 'M  AAL ' noNL*
    / newline 'M  LOG ' noNL*

v2propSGROUP
    = newline 'M  STY ' noNL*
    / newline 'M  SST ' noNL*
    / newline 'M  SLB' noNL*
    / newline 'M  SCN' noNL*
    / newline 'M  SDS' noNL*
    / newline 'M  SAL' noNL*
    / newline 'M  SBL' noNL*
    / newline 'M  SPA ' noNL*
    / newline 'M  SMT ' noNL*
    / newline 'M  CRS ' noNL*
    / newline 'M  SDI ' noNL*
    / newline 'M  SBV ' noNL*
    / newline 'M  SDT ' noNL*
    / newline 'M  SDD ' noNL*
    / newline 'M  SCD ' noNL*
    / newline 'M  SED ' noNL*
    / newline 'M  SPL' noNL*
    / newline 'M  SNC' noNL*
    / newline 'M  SAP ' noNL*
    / newline 'M  SCL ' noNL*
    / newline 'M  SBT' noNL*



v2propOTHER
    = newline 'M  PXA ' noNL*
    / newline 'M  REG ' noNL*
    / newline 'M  $3D' noNL*




/*
 *======================================================================
 *
 * V3000 Connection Table
 *
 *======================================================================
 */
v3ctab
    = newline 'M  V30 BEGIN CTAB' v3countsLine v3atomBlock v3bondBlock? v3propertyBlocks+  { logMessage(1, 'parsed V3000 CTAB'); }

/*
 *
 * V3000 COUNTS LINE
 *
 *
 * M  V30 COUNTS na nb nsg n3d chiral [REGNO=regno]
 */
v3countsLine
    = newline 'M  V30 COUNTS' nAtoms:uint nBonds:uint nSgroups:uint n3d:uint ' ' chiral:[01] countRegNo? {
            mdlParserData.molecule = molPaintJS.Molecule();
            mdlParserData.molecule.setProperty('NAME', mdlParserData.header1);
            mdlParserData.molecule.setProperty('HEADER2', mdlParserData.header2);
            mdlParserData.molecule.setProperty('COMMENT', mdlParserData.header3);
        }

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
    = newline 'M  V30 BEGIN ATOM' newline atoms:atomEntry* 'M  V30 END ATOM' {
            atoms.forEach(atom => { mdlParserData.molecule.addAtom(atom, null); });
            logMessage(1, 'parsed ATOM BLOCK');
        }

atomEntry
    = 'M  V30' atomIndex:uint atomType:atomTypeList atomX:float atomY:float
      atomZ:float atomAtomMap:uint atomCont:atomContinuation {


            var a = molPaintJS.Atom();
            a.setX(atomX);
            a.setY(-1.0 * atomY); // flip on X axis
            a.setZ(atomZ);

            if (atomCont == undefined) {
                atomCont = { };
            }
            a.setType(getAtomType(atomType, null, atomCont.mass));
            if (atomCont.charge != null) {
                a.setCharge(atomCont.charge);
            }
            if (atomCont.radical != null) {
                a.setRadical(atomCont.radical);
            }

            // query features etc.

            return a;
        }

atomContinuation
    = v3LineContinuation cont:atomContinuation { return cont; }
    / whitespace* charge:atomCharge cont:atomContinuation* { return flatten(cont, charge); }
    / ' '* radical:atomRadical cont:atomContinuation* { return flatten(cont, radical); }
    / ' '* cfg:atomConfiguration cont:atomContinuation* { return flatten(cont, cfg); }
    / ' '* mass:atomMass cont:atomContinuation* { return flatten(cont, mass); }
    / ' '* val:atomValence cont:atomContinuation* { return flatten(cont, val); }
    / ' '* hcount:atomHcount cont:atomContinuation* { return flatten(cont, hcount); }
    / ' '* stbox:atomStereoBox cont:atomContinuation* { return flatten(cont, stbox); }
    / ' '* invret:atomInversionRetention cont:atomContinuation* { return flatten(cont, invret); }
    / ' '* exachg:atomExactChange cont:atomContinuation* { return flatten(cont, exachg); }
    / ' '* subst:atomSubstCnt cont:atomContinuation* { return flatten(cont, subst); }
    / ' '* unsat:atomUnsaturation cont:atomContinuation* { return flatten(cont, unsat); }
    / ' '* rbcnt:atomRingBondCount cont:atomContinuation* { return flatten(cont, rbcnt); }
    / ' '* attchpt:atomAttachPoints cont:atomContinuation* { return flatten(cont, attchpt); }
    / ' '* attchord:atomAttachmentOrder cont:atomContinuation* { return flatten(cont, attchord); }
    / ' '* tplclass:atomTemplateClass cont:atomContinuation* { return flatten(cont, tplclass); }
    / ' '* seqid:atomSequenceId cont:atomContinuation* { return flatten(cont, seqid); }
    / ' '* newline { }

atomCharge
    = 'CHG=' chg:integer { return {'charge': chg, }; }

atomRadical
    = 'RAD=' rad:[0-3] { return {'radical': parseInt(rad, 10), }; }

atomConfiguration
    = 'CFG=' cfg:[0-3] { return {'configuration':cfg, }; }

atomMass
    = 'MASS=' mass:uint { return {'mass': mass, }; }

atomValence
    = 'VAL=' val:integer { return {'valence': val, }; }

atomHcount
    = 'HCOUNT=' hcount:integer { return {'Hcount':hcount, }; }

atomStereoBox
    = 'STBOX=' stbox:[01] { return {'stbox':stbox, }; }

atomInversionRetention
    = 'INVRET=' invret:[0-2] { return {'invret':invret, }; }

atomExactChange
    = 'EXACHG=' exachg:[01] { return {'exachg':exachg, }; }

atomSubstCnt
    = 'SUBST=' subst:integer { return {'subst':subst, }; }

atomUnsaturation
    = 'UNSAT=' unsat:[01] { return {'unsat':unsat, }; }

atomRingBondCount
    = 'RBCNT=' rbcnt:integer { return {'rbcnt':rbcnt, }; }

atomAttachPoints
    = 'ATTCHPT=' attchpt:integer { return {'attchpt':attchpt, }; }

atomAttachmentOrder
    = 'ATTCHORD=(' [^)]* ')' { 
            logMessage(1, 'ATTCHORD currently not supported');
            return { 'attchord':'present', }; 
        }

atomTemplateClass
    = 'CLASS=' tplclass:string { return {'class':tplclass, }; }

atomSequenceId
    = 'SEQID=' seqid:uint { return {'seqid':seqid, }; }

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
    = newline 'M  V30 BEGIN BOND' newline bonds:bondEntry* 'M  V30 END BOND' {
            bonds.forEach(bond => { mdlParserData.molecule.addBond(bond, null); });
            logMessage(1, 'parsed BOND BLOCK');
        }

bondEntry
    = 'M  V30' bondIndex:uint bondType:uint atom1:uint atom2:uint bondCont:bondContinuation {

            var b = molPaintJS.Bond();
            b.setAtomA(mdlParserData.molecule.getAtom("Atom" + atom1));
            b.setAtomB(mdlParserData.molecule.getAtom("Atom" + atom2));
            b.setType(bondType);

            if (bondCont == null) {
                bondCont = { };
            }
            if (bondCont.configuration != null) {
                b.setStereo(bondCont.configuration, 'v3');
            }

            return b;
        }

bondContinuation
    = v3LineContinuation cont:bondContinuation { return cont; }
    / ' '* cfg:bondConfiguration cont:bondContinuation { return flatten(cont, cfg); }
    / ' '* topo:bondTopology cont:bondContinuation { return flatten(cont, topo); }
    / ' '* rxctr:bondRxCenter cont:bondContinuation { return flatten(cont, rxctr); }
    / ' '* stbox:bondStereoBox cont:bondContinuation { return flatten(cont, stbox); }
    / ' '* endpts:bondEndPoints cont:bondContinuation { return flatten(cont, endpts); }
    / ' '* newline { }

bondConfiguration
    = 'CFG=' cfg:[0-3] { return {'configuration':cfg, }; }

bondTopology
    = 'TOPO=' topo:[0-2] { return {'topology':topo, }; }

bondRxCenter
    = 'RXCTR=' rxctr:integer { return {'rxctr':rxctr, }; }

bondStereoBox
    = 'STBOX=' stbox:[01] { return {'stbox':stbox, }; }

bondEndPoints
    = 'ENDPTS=ALL' { return {'endpts':'ALL', }; }
    / 'ENDPTS=ANY' { return {'endpts':'ANY', }; }


/*
 * V3000 Properties
 */
v3propertyBlocks
    = v3SGROUP
    / v3obj3dBlock
    / v3LinkAtomLine
    / v3collectionBlock
    / newline 'M  V30 END CTAB' 

v3SGROUP
    = newline 'M  V30 BEGIN SGROUP' (newline !'M  V30 END SGROUP' noNL+)+ newline 'M  V30 END SGROUP'

v3obj3dBlock
    = newline 'M  V30 BEGIN OBJ3D' (newline !'M  V30 END OBJ3D' noNL+)+ newline 'M V30 END OBJ3D'

v3LinkAtomLine
    = newline 'M  V30 LINKNODE ' noNL*

/*
 * V3000 Collection Block
 *
 * M  V30 BEGIN COLLECTION
 * [M V30 DEFAULT -]M V30 name/subname -
 * M  V30 [ATOMS=(natoms atom [atom ...])] -
 * M  V30 [BONDS=(nbonds bond [bond ...])] -
 * M  V30 [SGROUPS=(nsgroups sgrp [sgrp ...])] -
 * M  V30 [OBJ3DS=(nobj3ds obj3d [obj3d ...])] -
 * M  V30 [MEMBERS=(nmembers member [member ...])] -
 * M  V30 [RGROUPS=(nrgroups rgroup [rgroup ...])] -
 * . . .
 * M  V30 END COLLECTION
 */

/* ToDo collection block parsing */
v3collectionBlock
    = newline 'M  V30 BEGIN COLLECTION' collectionEntry* 'M  V30 END COLLECTION' { logMessage(1, 'ignoring collection block'); }

collectionEntry
    = newline 'M  V30 DEFAULT' collectionContinuation* 
    / newline 'M  V30 ' string collectionContinuation*

collectionContinuation
    = v3LineContinuation cont:collectionContinuation
    / ' '* 'ATOMS=(' [^)]* ')' collectionContinuation
    / ' '* 'BONDS=(' [^)]* ')' collectionContinuation
    / ' '* 'BONDS=(' [^)]* ')' collectionContinuation
    / ' '* 'SGROUPS=(' [^)]* ')' collectionContinuation
    / ' '* 'OBJ3DS=(' [^)]* ')' collectionContinuation
    / ' '* 'MEMBERS=(' [^)]* ')' collectionContinuation
    / ' '* 'RGROUPS=(' [^)]* ')' collectionContinuation
    / ' '* newline
/*
 *======================================================================
 *
 * Global Rules
 *
 *======================================================================
 */
v3LineContinuation
    = whitespace* '-' newline 'M  V30'

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

/* ToDo: quoted strings */
string
    = characters:[^ "'\t\n\r]+ { return characters.join(''); }

string4
    = characters:([^\n\r][^\n\r][^\n\r][^\n\r]) { return characters.join(''); }

string3
    = characters:([^\n\r][^\n\r][^\n\r]) { return characters.join(''); }

whitespaceNL
    = whitespace
    / newline 

whitespace
    = [ \t] 

newline
    = '\n'
    / '\r\n'
    / '\r'

noNL
    = [^\n\r]

