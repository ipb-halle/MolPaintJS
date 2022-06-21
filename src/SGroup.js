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
        var jsonData = {};

        var atoms = [];
        var brkxyz = [];
        var cbonds = [];
        var connect = 'EU';
        var fieldData = '';
        var fieldDisposition = '';
        var label = '';
        var patoms = [];
        var selected = 0;
        var xbonds = [];

/* 
    ToDo:
        var subscript = null;
        var bondVector = [];
        var uniqueLabel = null;

        and much more ...
*/


        return {

            /*
             * add data to existing jsonDataObject
             */
            addJsonData : function(data) {
                for (var t in [ 'ATOMS', 'BONDS', 'CBONDS', 'XBONDS', 'PATOMS', 'XHEAD' ]) {
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
                    for (var d of data[listType].data) {
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
                var x = parseFloat(fieldDisposition.substr(0,9));
                var y = -1.0 * parseFloat(fieldDisposition.substr(10,19)); // flip on X axis
                return { 'x':x, 'y':y };
            },

            getJsonData : function() {
                return jsonData;
            },

            getType : function() {
                return type;
            },

            parseJsonAtoms : function(molecule) {
                if (jsonData['ATOMS'] != null) {
                    for (var idx of jsonData['ATOMS'].data) {
                        var atom = molecule.getAtom('Atom' + idx);
                        atoms.push(atom); 
                        atom.addSGroup(this);
                    }
                }
            },

            parseJsonBRKXYZ : function() {
                brkxyz = jsonData['BRKXYZ'];
                // invert Y coordinates
                for (var i in brkxyz) {
                    if (brkxyz[i].data !== undefined) {
                        brkxyz[i].data[1] *= -1.0;
                        brkxyz[i].data[4] *= -1.0;
                    }
                }
            },

            parseJsonCBonds : function(molecule) {
                if (jsonData['CBONDS'] != null) {
                    for (var idx of jsonData['CBONDS'].data) {
                        var cbond = molecule.getBond('Bond' + idx);
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

            parseJsonPAtoms : function(molecule) {
                if (jsonData['PATOMS'] != null) {
                    for (var idx of jsonData['PATOMS'].data) {
                        var atom = molecule.getAtom('Atom' + idx);
                        patoms.push(atom);
                        atom.addSGroup(this);
                    }
                }
            },

            parseJsonXBonds : function(molecule) {
                if (jsonData['XBONDS'] != null) {
                    for (var idx of jsonData['XBONDS'].data) {
                        var xbond = molecule.getBond('Bond' + idx);
                        xbonds.push(xbond);
                        xbond.addSGroup(this);
                    }
                }
            },

            parseJsonData : function(molecule) {
                console.log("parseJsonData");
                this.parseJsonAtoms(molecule);
                this.parseJsonBRKXYZ();
                this.parseJsonCBonds(molecule);
                this.parseJsonFieldData();
                this.parseJsonFieldDisposition();
                this.parseJsonLabel();
                this.parseJsonPAtoms(molecule);
                this.parseJsonXBonds(molecule);
            },

            setId : function(i) {
                id = i;
            },

            /* set complex parsed sgroup data */
            setJsonData : function(data) {
                console.log("SGroup implementation incomplete; must resolve atom and bond references");
                jsonData = data;
            }

        };
    }
    return molpaintjs;
}(molPaintJS || {}));
