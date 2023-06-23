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
var molPaintJS = (function (molpaintjs) {
    "use strict";

    molpaintjs.Bond = function () {

        const stereoMap = {
            'iv2': { '0':0, '1':1, '4':2, '6':3 },
            'iv3': { '0':0, '1':1, '2':2, '3':3 },
            'ov2': [ 0, 1, 4, 6 ],
            'ov3': [ 0, 1, 2, 3 ] 
        };
  
        var atomA;
        var atomB;
        var sgroups = {};
        var color;
        var id;                 // unique id (i.e. for undo / redo)
        var index;              // numeric index
        var selected = 0;       // non zero if bond is selected
        var stereo = "0";       // 0 no stereo, 1 up, 6 down; also for Query!
        var temp = 0;           // non zero if bond is transient (temporary)
        var type = null;

        return {

            addSGroup : function (idx) {
                sgroups[idx] = idx;
            },

            /**
             * make a copy (clone) of this Bond with
             * identical properties.
             * @return the new (cloned) bond object
             */
            copy : function () {
                let b = molPaintJS.Bond();
                b.setAtomA(atomA);
                b.setAtomB(atomB);
                b.setColor(color);
                b.setId(id);
                b.setIndex(index);
                b.setSelected(selected);
                b.setTemp(temp);
                b.setType(type);
                b.setStereo(stereo);
                b.setSGroups(copySGroups());
                return b;
            },

            copySGroups : function () {
                let s = {};
                for (let i in sgroups) {
                    s[i] = i;
                }
                return s;
            },

            delSGroup : function (idx) {
                delete sgroups[idx];
            },

            getAtomA : function () {
                return atomA;
            },

            getAtomB : function () {
                return atomB;
            },

            getColor : function () {
                return color;
            },

            getId : function () {
                return id;
            },

            getIndex : function () {
                return index;
            },

            getSGroups : function () {
                return sgroups;
            },

            getSelected : function () {
                return selected;
            },

            getStereo : function () {
                if (arguments[0] != null) {
                    return stereoMap['o' + arguments[0]][stereo];
                }
                return stereo;
            },

            getTemp : function () {
                return temp;
            },

            getType : function () {
                return type;
            },

            setAtomA : function (a) {
                atomA = a;
            },

            setAtomB : function (b) {
                atomB = b;
            },

            setColor : function (c) {
                color = c;
            },

            setId : function (i) {
                id = i;
            },

            setIndex : function (i) {
                index = i;
            },

            setSGroups : function (s) {
                sgroups = s;
            },

            setSelected : function (s) {
                selected = s;
            },

            setStereo : function (s) {
                if(s != null) {
                    if (arguments[1] != null) {
                        stereo = stereoMap['i' + arguments[1]][s.toString()];
                    } else {
                        stereo = s;
                    }
                }
            },

            setTemp : function (t) {
                temp = t;
            },

            setType : function (t) {
                type = t;
            },

            /*
             * swap order of atoms (i.e. to flip the direction of 
             * stereo indicators)
             */
            swap : function () {
                [ atomA, atomB ] = [ atomB, atomA ];
            },
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
