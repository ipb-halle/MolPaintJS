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
    molpaintjs.Drawing = function(ctx) {

        let chemObjects = {};
        let properties = {};
        let context = ctx;
        let currentChemObjectId;

        return {

            /**
             * Add and Atom to this drawing. If the atom has a chemObjectId set,
             * it is added to that chemObject. Otherwise a new ChemObject is 
             * created and the atom is assigned to that new ChemObject.
             */
            addAtom : function (a) {
                let cid = a.getChemObjectId();
                if (cid == null) {
                    cid = this.createChemObject();
                }
                chemObjects[cid].addAtom(a);
            },

            /**
             * Add a Bond to this drawing. If both atoms of the bond belong 
             * to different ChemObjects, the two ChemObjects are joined to 
             * form a single ChemObject.
             */
            addBond : function (b) {
                let coA = b.getAtomA().getChemObjectId();
                let coB = b.getAtomB().getChemObjectId();

                if (coA === coB) {
                    chemObjects[coA].addBond(b);
                } else {
                    if (Object.keys(chemObjects[coA].getAtoms()).length > Object.keys(chemObjects[coB].getAtoms()).length) {
                        chemObjects[coA].join(chemObjects[coB]);
                        chemObjects[coA].addBond(b);
                        delete chemObjects[coB];
                    } else {
                        chemObjects[coB].join(chemObjects[coA]);
                        chemObjects[coB].addBond(b);
                        delete chemObjects[coA];
                    }
                }
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
                for (let id in chemObjects) {
                    bondLength.push(chemObjects[id].computeBondLengths());
                }
                bondLength.sort(function (a, b) {
                    return a - b;
                });
                if (bondLength.length > 0) {
                    return Math.sqrt(bondLength[Math.floor(bondLength.length / 2)]);
                }
                return 1.5;     // default bond length
            },


            createAtomId : function() {
                return "Atom" + context.uniqueCounter();
            },

            createBondId : function() {
                return "Bond" + context.uniqueCounter();
            },

            createChemObject : function () {
                let c = molpaintjs.ChemObject(this);
                let cid = c.getId();
                chemObjects[cid] = c;
                return cid;
            },

            delAtom : function (a) {
                chemObjects[a.getChemObjectId()].delAtom(a);
                // xxxxx eventually delete empty ChemObject
            },

            delBond : function (b) {
                chemObjects[b.getChemObjectId()].delBond(b);
                // xxxxx eventually split ChemObject
            },

            /**
             * Deletes all collections with given name from all ChemObjects
             */
            delCollection : function (name) {
                for (let cid in chemObjects) {
                    chemObjects[cid].delCollection(name);
                }
            },

            delSGroup : function (sg) {
                chemObjects[sg.getChemObject()].delSGroup(sg);
            },

            delTemp : function() {
                for (let cid in chemObjects) {
                    chemObjects[cid].delTemp();
                }
            },

            getAtom : function (idx) {
                for (let cid in chemObjects) {
                    let atom = chemObjects[cid].getAtom(idx);
                    if (atom != undefined) {
                        return atom;
                    }
                }
                return undefined;
            },

            getAtomCount : function () {
                let atomCount = 0;
                for (let cid in chemObjects) {
                    atomCount += chemObjects[cid].getAtomCount();
                }
                return atomCount;
            },

            getAtoms : function () {
                let atoms = {};
                for (let cid in chemObjects) {
                    atoms = Object.assign(atoms, chemObjects[cid].getAtoms());
                }
                return atoms;
            },

            getBond : function (idx) {
                for (let cid in chemObjects) {
                    let bond = chemObjects[cid].getBond(idx);
                    if (bond != undefined) {
                        return bond;
                    }
                }
                return undefined;
            },

            getBondCount : function () {
                let bondCount = 0;
                for (let cid in chemObjects) {
                    bondCount += chemObjects[cid].getBondCount();
                }
                return bondCount;
            },

            getBonds : function () {
                let bonds = {};
                for (let cid in chemObjects) {
                    bonds = Object.assign(bonds, chemObjects[cid].getBonds());
                }
                return bonds;
            },

            getChemObjects : function () {
                return chemObjects;
            },

            getCollectionNames : function () {
                let collectionNames = {};
                for (let cid in chemObjects) {
                    for (let name in chemObjects[cid].getCollections()) {
                        collectionNames[name] = name;
                    }
                }
                return collectionNames;
            },

            getContext : function () {
                return context;
            },

            getCurrentChemObject : function () {
                if (currentChemObjectId === undefined) {
                    currentChemObjectId = this.createChemObject();
                }
                return chemObjects[currentChemObjectId];
            },

            getProperties : function () {
                return properties;
            },

            getProperty : function (propname) {
                return properties[propname];
            },

            /**
             * return a map of ChemObject-Ids by their role
             */
            getRoles : function () {
                let roles = {};
                for (let cid in chemObjects) {
                    let role = chemObjects[cid].getRole();
                    if (roles[role] === undefined) {
                        roles[role] = {};
                    }
                    roles[role][cid] = cid;
                }
                return roles;
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
                for (let cid in chemObjects) {
                    let sgroup = chemObjects[cid].getSGroup(idx);
                    if (sgroup != undefined) {
                        return sgroup;
                    }
                }
                return undefined;
            },

            getSGroups : function () {
                let sgroups = {};
                for (let id in chemObjects) {
                    sgroups = Object.assign(sgroups, chemObjects[id].getSGroups());
                }
                return sgroups;
            },

            replaceAtom : function (atom) {
                let cid = atom.getChemObjectId();
                chemObjects[cid].replaceAtom(atom);
            },

            replaceBond : function (bond) {
                let cid = bond.getChemObjectId();
                chemObjects[cid].replaceBond(bond);
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
                    chemObjects[id].selectBonds(matches, coords, distmax);
                }
                return matches;
            },

            setCurrentChemObjectId : function (cid) {
                currentChemObjectId = cid;
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
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
