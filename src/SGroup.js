/*
 * MolPaintJS
 * Copyright 2019 Leibniz-Institut f. Pflanzenbiochemie 
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

function SGroup(t) {

    /* 
     * this class stores an sgroup information as defined 
     * in the CT-file document. Implementation is incomplete!
     * 
     */
    this.type = t;
    this.atoms = {};
    this.bonds = {};
    this.bondVector = [];
    this.bracketCoordinates = [];
    this.data = [];
    this.dataBuffer = '';
    this.dataDisplay = [];
    this.subscript = null;
    this.uniqueLabel = null;

    /* SAL sssn15 aaa ... */
    this.addAtom = function(idx) {
        this.atoms[idx] =  idx;
    }

    /* SBL sssn15 bbb ... */
    this.addBond = function(idx) {
        this.bonds[idx] = idx;
    }

    /* SBV sss bb1 x1 y1 */
    this.setBondVector = function(idx, x, y) {
        this.bondVector = { 'idx' : idx, 'x' : x, 'y' : y };
    }

    /* SDI sssnn4 x1 y1 x2 y2 */
    this.setBracketCoordinates = function(x1, y1, x2, y2) {
        /*
         * * need to check whether left becomes before right? 
         *   --> necessity to swap brackets?
         * * brackets always horizontally? Inclined, vertical?
         *   --> necessity to determine direction of bracket lines 
         */
        this.bracketCoordinates.push([x1, y1, x2, y2]);
    }

    /* SCD sss d...  */
    this.addData = function(d) {
        this.buffer += d;
    }

    /* SED sss d...  */
    this.setData = function(d) {
        b = this.buffer + d;
        this.buffer = '';
        this.data.push(b.substr(0,200));
    }

    /* SDD sss xxxxx.xxxxyyyyy.yyyy eeefgh i jjjkkk ll m noo */
    this.setDataDisplay = function(d) {
        this.dataDisplay.push(d);
    }

    /* SMT sss m... */
    this.setSubscript = function(m) {
        this.subscript = m;
    }

    /* SLBnn8 sss vvv ... */
    this.setUniqueLabel = function(l) {
        this.uniqueLabel = l;
    }

}
