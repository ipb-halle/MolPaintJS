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
var molPaintJS = (function (molpaintjs) {
    "use strict";

    molpaintjs.SGroup = function(t) {

        /*
         * this class stores an sgroup information as defined
         * in the CT-file document. Implementation is incomplete!
         *
         */
        var id = null;
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
        var sgroupData = null;

        /**
        * M SDD sss xxxxx.xxxxyyyyy.yyyy eeefgh i jjjkkk ll m noo
        * sss: Index of data Sgroup; parsed by parser
        *
        * @param str string with following fields (see also above)
        * x,y: Coordinates (2F10.4)
        * eee: (Reserved for future use)
        * f: Data display, A = attached, D = detached
        * g: Absolute, relative placement, A = absolute, R = relative
        * h: Display units, blank = no units displayed, U = display units
        * i: (Reserved for future use)
        * jjj: Number of characters to display (1...999 or ALL)
        * kkk: Number of lines to display (unused, always 1)
        * ll: (Reserved for future use)
        * m: Tag character for tagged detached display (if non-blank)
        * n: Data display DASP position (1...9). (MACCS-II only)
        * oo: (Reserved for future use)
        *
        * @return JSON object with parsed data
        */
        function parseFieldDisposition(str) {
            var obj = {};
            var x = parseFloat(str.substr(0,9));
            var y = -1.0 * parseFloat(str.substr(10,19)); // flip on X axis
            obj["coord"] = { 'x':x, 'y':y };

            return obj;
        }

        return {

            setId : function(i) {
                id = i;
            },

            /* set complex parsed sgroup data */
            setSGroup : function(data) {
                console.log("SGroup implementation incomplete; must resolve atom and bond references");
                sgroupData = data;
                sgroupData['FIELDDISP'] = parseFieldDisposition(data['FIELDDISP']);
            },

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

            getSGroup : function() {
                return sgroupData;
            },

            getType : function() {
                return type;
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
