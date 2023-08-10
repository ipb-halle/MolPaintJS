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
        let id = null;
        let type = t;
        let jsonData = {};

        let atoms = [];
        let brkxyz = [];
        let cbonds = [];
        let connect = 'EU';
        let fieldData = '';
        let fieldDisposition = '';
        let label = '';
        let patoms = [];
        let selected = 0;
        let xbonds = [];

/* 
    ToDo:
        let subscript = null;
        let bondVector = [];
        let uniqueLabel = null;

        and much more ...
*/


        return {

            /*
             * add data to existing jsonDataObject
             */
            addJsonData : function(data) {
                for (let t in [ 'ATOMS', 'BONDS', 'CBONDS', 'XBONDS', 'PATOMS', 'XHEAD' ]) {
                    if (data[t] != null) {
                        if (t == 'BONDS') {
                            t = (type == 'DAT') ?  'CBONDS' : 'XBONDS';
                        }
                        addNumberedList(t, data[t]);
                    }
                }
            },


            /**
             * add / append a numbered list of type t to jsonData
             */
            addNumberedList : function(listType, data) {
                if (jsonData[listType] == null) {
                    jsonData[listType].count = data.length;
                    jsonData[listType].data = data;
                } else {
                    for (let d of data[listType].data) {
                        jsonData[listType].count++;
                        jsonData[listType].data.push(d);
                    }
                }
            },

            getBRKXYZ : function() {
                return brkxyz;
            },

            getFieldData : function() {
                return fieldData;
            },

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
            getFieldDispositionCoordinates : function() {
                let x = parseFloat(fieldDisposition.substr(0,9));
                let y = -1.0 * parseFloat(fieldDisposition.substr(10,19)); // flip on X axis
                return { 'x':x, 'y':y };
            },

            getJsonData : function() {
                return jsonData;
            },

            getSelected : function() {
                return selected;
            },

            getType : function() {
                return type;
            },

            parseJsonAtoms : function(drawing) {
                if (jsonData['ATOMS'] != null) {
                    for (let idx in jsonData['ATOMS']) {
                        let atom = drawing.getAtom(idx);
                        atoms.push(atom); 
                        atom.addSGroup(this);
                    }
                }
            },

            parseJsonBRKXYZ : function() {
                brkxyz = jsonData['BRKXYZ'];
                // invert Y coordinates
                for (let i in brkxyz) {
                    if (brkxyz[i].data !== undefined) {
                        brkxyz[i].data[1] *= -1.0;
                        brkxyz[i].data[4] *= -1.0;
                    }
                }
            },

            parseJsonCBonds : function(drawing) {
                if (jsonData['CBONDS'] != null) {
                    for (let idx in jsonData['CBONDS']) {
                        let cbond = drawing.getBond(idx);
                        cbonds.push(cbond);
                        cbond.addSGroup(this);
                    }
                }
            },

            parseJsonFieldData : function() {
                if (jsonData['FIELDDATA'] != null) {
                    fieldData = jsonData['FIELDDATA'];
                }
            },

            parseJsonFieldDisposition : function() {
                if (jsonData['FIELDDISP'] != null) {
                    // ToDo: more elaborated parsing of FIELDDISP
                    fieldDisposition = jsonData['FIELDDISP'];
                }
            },

            parseJsonLabel : function() {
                if (jsonData['LABEL'] != null) {
                    label = jsonData['LABEL'];
                }
            },

            parseJsonPAtoms : function(drawing) {
                if (jsonData['PATOMS'] != null) {
                    for (let idx in jsonData['PATOMS']) {
                        let atom = drawing.getAtom(idx);
                        patoms.push(atom);
                        atom.addSGroup(this);
                    }
                }
            },

            parseJsonXBonds : function(drawing) {
                if (jsonData['XBONDS'] != null) {
                    for (let idx in jsonData['XBONDS']) {
                        let xbond = drawing.getBond(idx);
                        xbonds.push(xbond);
                        xbond.addSGroup(this);
                    }
                }
            },

            parseJsonData : function(drawing) {
                console.log("parseJsonData");
                this.parseJsonAtoms(drawing);
                this.parseJsonBRKXYZ();
                this.parseJsonCBonds(drawing);
                this.parseJsonFieldData();
                this.parseJsonFieldDisposition();
                this.parseJsonLabel();
                this.parseJsonPAtoms(drawing);
                this.parseJsonXBonds(drawing);
            },

            setId : function(i) {
                id = i;
            },

            /* set complex parsed sgroup data */
            setJsonData : function(data) {
                jsonData = data;
            },

            setSelected : function(s) {
                selected = s;
            }

        };
    }
    return molpaintjs;
}(molPaintJS || {}));
