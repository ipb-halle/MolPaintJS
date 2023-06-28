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

    /*
     * ToDo: history for collections, removal and replacement of
     * atoms and bonds in collections
     */
    molpaintjs.Drawing = function() {

        let counter = 0;
        let chemObjects = {};
        let properties = {};

        chemObjects["chemObject" + counter++] = ChemObject();

        return {

            addAtom : function (a, id) {
                // xxxxx
            },

            addBond : function (b, id) {
                // xxxxx
            },

            addCollection : function (collection) {
                // xxxxx
            },

            addSGroup : function (sg, id) {
                // xxxxx
            },

            /**
             * adjust selections
             * @param match match all atoms and bonds where any of the given bits are set
             * @param clear clear given bits on all matching atoms, bonds and sgroups
             * @param set Set the given bits on all matching atoms, bonds and sgroups
             */
            adjustSelection : function (match, clear, set) {
                for (let id in chemObjects) {
                    chemObjects[id].adjustSelection(match, clear, set);
                }
            },

            /**
             * loop over all ChemObjects and center the drawing 
             * according to its bounding box
             * i.e. move the center of the drawing to the point 0,0
             * @return the updated bounding box
             */
            center : function () {
                let bbox = this.computeBBox(0);

                let dx = -bbox.getCenterX();
                let dy = -bbox.getCenterY();

                for (let id in chemObjects) {
                    chemObjects[id].move(dx, dy);
                }
                let b = molPaintJS.Box(
                    bbox.getMinX() + dx,
                    bbox.getMinY() + dy,
                    bbox.getMaxX() + dx,
                    bbox.getMaxY() + dy);
                return b;
            },

            /**
             * clear all selections
             * @param val All selections with bit val will be cleared.
             */
            clearSelection : function (val) {
                for (let id in chemObjects) {
                    chemObjects[id].clearSelection(val);
                }
            },

            /**
             * compute update history and clear temp flag
             * @return actionList containing update history
             */
            clearTemp : function ()  {
                let actionList = molPaintJS.ActionList();
                for (let id in chemObjects) {
                    chemObjects[id].clearTemp(actionList);
                }
                return actionList;
            },

            /**
             * loop over all ChemObjects and compute the bounding box 
             * coordinates of the current drawing
             * @param sel select bits which must be set when computing the
             * bounding box; if sel = 0, everything is selected
             */
            computeBBox : function (sel) {
                let bbox;
                let first = 0;

                for (let id in chemObjects) {
                    if (first == 0) {
                        bbox = chemObjects[id].computeBBox(sel);
                    } else {
                        bbox.join(chemObjects[id].computeBBox(sel));
                    }
                }
                return bbox;
            },

            /**
             * computes the median bond length in this drawing
             */
            computeBondLengths : function () {
                let bondLength = [];
                for (let i in bonds) {
                    let b = bonds[i];
                    let dx = b.getAtomA().getX() - b.getAtomB().getX();
                    let dy = b.getAtomA().getY() - b.getAtomB().getY();
                    let lensq = (dx * dx) + (dy * dy);
                    bondLength.push(lensq);
                }
                bondLength.sort(function (a, b) {
                    return a - b;
                });
                if (bondLength.length > 0) {
                    return Math.sqrt(bondLength[Math.floor(bondLength.length / 2)]);
                }
                return 1.5;     // default bond length
            },

            delAtom : function (a) {
                // xxxxx
            },

            delBond : function (b) {
                // xxxxx
            },

            delCollection : function (name) {
                // xxxxx
            },

            delSGroup : function (sg) {
                // xxxxx
            },

            delTemp : function() {
                // xxxxx
            },

            getAtom : function (id) {
                // xxxxx
            },

            getAtomCount : function () {
                // xxxxx
            },

            getAtoms : function () {
                // xxxxx
            },

            getBond : function (id) {
                // xxxxx
            },

            getBondCount : function () {
                // xxxxx
            },

            getBonds : function () {
                // xxxxx
            },

            getCollections : function () {
                // xxxxx
            },

            getProperties : function () {
                return properties;
            },

            getProperty : function (propname) {
                return properties[propname];
            },

            /**
             * @param sel selection bits
             * @return the atoms and bonds which match the given selection bits
             */
            getSelected : function (sel) {
                let result = {atoms: [], bonds: []};
                for (let id in chemObjects) {
                    chemObjects[id].getSelected(result, sel);
                }
                return result;
            },

            getSGroup : function (idx) {
                // xxxxx
            },

            getSGroups : function () {
                // xxxxx
            },

            reIndex : function () {
                // xxxxx
            },

            replaceAtom : function (a) {
                // xxxxx
            },

            replaceBond : function (b) {
                // xxxxx
            },

            /**
             * replace a Collection of this Drawing by the Collection
             * given as an argument. If the Collection does not yet
             * exist, append it to the list of Collections.
             * @param collection the collection object with modified data
             */
            replaceCollection : function (collection) {
                // xxxxx
            },


            /**
             * loop over all ChemObjects and select the first matching atom 
             * @param coords the coordinates
             * @param distmax maximum squared euclidian distance
             * @return atomId
             */
            selectAtom : function (coords, distmax) {
                for (let id in chemObjects) {
                    let atomId = chemObjects[id].selectAtom(coords, distmax);
                    if (atomId != null) {
                        return atomId;
                    }
                }
                return null;
            },

            /**
             * loop over all ChemObjects and return a list of 
             * atom id's and a list of bond id's, which are enclosed 
             * by the given bounding box.
             * Enclosed atoms and bonds are marked as selected.
             * @param bbox bounding box in drawing coordinates
             * @param val bit value to set on selected entities
             * @param cond bits which must not be set for selection of an entity
             * @return an object with properties "atoms" and "bonds"
             */
            selectBBox : function (bbox, val, cond) {
                let result = {atoms: [], bonds: []};
                for (let id in chemObjects) {
                    chemObjects[id].selectBBox(result, bbox, val, cond);
                }
                return result;
            },

            /**
             * loop over all ChemObjects and return a list of bonds matching 
             * the distance criterium.
             * @param coords coordinates of action
             * @param distmax maximum squared euclidian distance
             * @param returns an array of matching bonds; array may be empty
             */
            selectBonds : function (coords, distmax) {
                let matches = [];
                for (let id in chemObjects) {
                    chemObject.selectBonds(matches, coords, distmax);
                }
                return matches;
            },

            setProperty : function (propname, propval) {
                properties[propname] = propval;
            },

            /**
             * loop over all ChemObjects and 2d-transform the coordinates 
             * of this drawing.
             * The z-coordinate is not affected!
             * @param matrix a 2x3 transformation matrix
             * @param sel select bits to which the transformation should apply (set to
             * zero to apply transformation to all atoms)
             */
            transform : function (matrix, sel) {
                for (let id in chemObjects) {
                    chemObjects[id].transform(matrix, sel);
                }
            },

            uniqueCounter : function () {
                return counter++;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
