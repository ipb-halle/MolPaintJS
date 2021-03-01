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
"use strict";

var molPaintJS = (function (molpaintjs) {

    molpaintjs.SGroup = function(t) {

        /* 
         * this class stores an sgroup information as defined 
         * in the CT-file document. Implementation is incomplete!
         * 
         */
        var type = t;
        var atoms = {};
        var bonds = {};
        var bondVector = [];
        var bracketCoordinates = [];
        var data = [];
        var dataBuffer = '';
        var dataDisplay = [];
        var subscript = null;
        var uniqueLabel = null;

        return {

            /* SAL sssn15 aaa ... */
            addAtom : function(idx) {
                atoms[idx] =  idx;
            },

            /* SBL sssn15 bbb ... */
            addBond : function(idx) {
                bonds[idx] = idx;
            },

            /* SBV sss bb1 x1 y1 */
            setBondVector : function(idx, x, y) {
                bondVector = { 'idx' : idx, 'x' : x, 'y' : y };
            },

            /* SDI sssnn4 x1 y1 x2 y2 */
            setBracketCoordinates : function(x1, y1, x2, y2) {
                /*
                 * * need to check whether left becomes before right? 
                 *   --> necessity to swap brackets?
                 * * brackets always horizontally? Inclined, vertical?
                 *   --> necessity to determine direction of bracket lines 
                 */
                bracketCoordinates.push([x1, y1, x2, y2]);
            },

            /* SCD sss d...  */
            addData : function(d) {
                buffer += d;
            },

            /* SED sss d...  */
            setData : function(d) {
                b = buffer + d;
                buffer = '';
                data.push(b.substr(0,200));
            },

            /* SDD sss xxxxx.xxxxyyyyy.yyyy eeefgh i jjjkkk ll m noo */
            setDataDisplay : function(d) {
                dataDisplay.push(d);
            },

            /* SMT sss m... */
            setSubscript : function(m) {
                subscript = m;
            },

            /* SLBnn8 sss vvv ... */
            setUniqueLabel : function(l) {
                uniqueLabel = l;
            },
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
