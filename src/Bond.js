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
"use strict";

var molPaintJS = (function (molpaintjs) {

    molpaintjs.Bond = function () {

        const stereoMap = {
            'iv2': { '0':0, '1':1, '4':2, '6':3 },
            'iv3': { '0':0, '1':1, '2':2, '3':3 },
            'ov2': [ 0, 1, 4, 6 ],
            'ov3': [ 0, 1, 2, 3 ] 
        };
  
        var atomA;
        var atomB;
        var color;
        var id;                 // unique id (i.e. for undo / redo)
        var index;              // numeric index
        var selected = 0;       // non zero if bond is selected
        var stereo = "0";       // 0 no stereo, 1 up, 6 down; also for Query!
        var temp = 0;           // non zero if bond is transient (temporary)
        var type = null;

        return {

            /**
             * make a copy (clone) of this Bond with
             * identical properties.
             * @return the new (cloned) bond object
             */
            copy : function () {
                var b = molPaintJS.Bond();
                b.atomA = atomA;
                b.atomB = atomB;
                b.color = color;
                b.id = id;
                b.index = index;
                b.selected = selected;
                b.temp = temp;
                b.type = type;
                b.stereo = stereo;
                return b;
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
                [ this.atomA, this.atomB ] = [ this.atomB, this.atomA ];
            },
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
