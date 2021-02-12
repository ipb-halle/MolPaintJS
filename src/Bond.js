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

function Bond() {

    const stereoMap = {
        'iv2': { '0':0, '1':1, '4':2, '6':3 },
        'iv3': { '0':0, '1':1, '2':2, '3':3 },
        'ov2': [ 0, 1, 4, 6 ],
        'ov3': [ 0, 1, 2, 3 ] 
    };

    this.atomA = null;
    this.atomB = null;
    this.color = null;
    this.id = null;		// unique id (i.e. for undo / redo)
    this.index = null;	        // numeric index
    this.selected = 0; 	        // non zero if bond is selected
    this.stereo = "0";          // 0 no stereo, 1 up, 6 down; also for Query!
    this.temp = 0;		// non zero if bond is transient (temporary)
    this.type = null;


    /**
     * make a copy (clone) of this Bond with
     * identical properties.
     * @return the new (cloned) bond object
     */
    this.copy = function () {
        var b = new Bond();
        b.atomA = this.atomA;
        b.atomB = this.atomB;
        b.color = this.color;
        b.id = this.id;
        b.index = this.index;
        b.selected = this.selected;
        b.temp = this.temp;
        b.type = this.type;
        b.stereo = this.stereo;
        return b;
    }

    this.getAtomA = function () {
        return this.atomA;
    }
    this.getAtomB = function () {
        return this.atomB;
    }
    this.getColor = function () {
        return this.color;
    }
    this.getId = function () {
        return this.id;
    }
    this.getIndex = function () {
        return this.index;
    }
    this.getSelected = function () {
        return this.selected;
    }
    this.getStereo = function () {
        if (arguments[0] != null) {
            return stereoMap['o' + arguments[0]][this.stereo];
        }
        return this.stereo;
    }
    this.getTemp = function () {
        return this.temp;
    }
    this.getType = function () {
        return this.type;
    }

    this.setAtomA = function (a) {
        this.atomA = a;
    }
    this.setAtomB = function (b) {
        this.atomB = b;
    }
    this.setColor = function (c) {
        this.color = c;
    }
    this.setId = function (i) {
        this.id = i;
    }
    this.setIndex = function (i) {
        this.index = i;
    }
    this.setSelected = function (s) {
        this.selected = s;
    }
    this.setStereo = function (s) {
        if(s != null) {
            if (arguments[1] != null) {
                this.stereo = stereoMap['i' + arguments[1]][s.toString()];
            } else {
                this.stereo = s;
            }
        }
    }

    this.setTemp = function (t) {
        this.temp = t;
    }
    this.setType = function (t) {
        this.type = t;
    }

    /*
     * swap order of atoms (i.e. to flip the direction of 
     * stereo indicators)
     */
    this.swap = function () {
        [ this.atomA, this.atomB ] = [ this.atomB, this.atomA ];
    }
}
