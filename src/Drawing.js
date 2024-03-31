/*
 * MolPaintJS
 * Copyright 2017 - 2024 Leibniz-Institut f. Pflanzenbiochemie
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
    molpaintjs.Drawing = function(uniqueCounter) {

        let chemObjects = {};
        let properties = {};
        let counter = uniqueCounter;
        let currentChemObjectId;
        let role = 'default';

        return {

            /**
             * Add and Atom to this drawing. If the atom has a chemObjectId set,
             * it is added to that chemObject. Otherwise a new ChemObject is
             * created and the atom is assigned to that new ChemObject.
             */
            addAtom : function (a) {
                let cid = this.getAtomChemObjectId(a.getId());
                if (cid == null) {
                    cid = this.createChemObject().getId();
                }
                chemObjects[cid].addAtom(a);
            },

            /**
             * Add a Bond to this drawing. If both atoms of the bond belong
             * to different ChemObjects, the two ChemObjects are joined to
             * form a single ChemObject.
             */
            addBond : function (b) {
                let coA = this.getAtomChemObjectId(b.getAtomA());
                let coB = this.getAtomChemObjectId(b.getAtomB());

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

            addChemObject : function (c) {
                chemObjects[c.getId()] = c;
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
                return "Atom" + counter.atomCounter();
            },

            createBondId : function() {
                return "Bond" + counter.bondCounter();
            },

            createChemObject : function () {
                let obj = molpaintjs.ChemObject(this);
                let cid = obj.getId();
                obj.setRole(role);
                chemObjects[cid] = obj;
                return obj;
            },

            delAtom : function (atom) {
                let cid = this.getAtomChemObjectId(atom.getId());
                if (chemObjects[cid].getAtomCount() === 1) {
                    delete chemObjects[cid];
                } else {
                    chemObjects[cid].delAtom(atom);
                }
            },

            delBond : function (bond) {
                let cid = this.getBondChemObjectId(bond.getId());
                let connectedBondSets = chemObjects[cid].delBond(bond);
                if (connectedBondSets.length > 1) {
                    console.log(connectedBondSets);

                    // xxxxx split ChemObject
                    // xxxxx delete ChemObject if deletion of a bond
                    // xxxxx         also removes the the last atoms
                }
            },

            delChemObject : function (c) {
                delete chemObjects[c.getId()];
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

            getAtomChemObjectId : function(atomId) {
                for (let cid in chemObjects) {
                    if (chemObjects[cid].hasAtom(atomId)) {
                        return cid;
                    }
                }
                return null;
            },

            getAtomCount : function () {
                let atomCount = 0;
                for (let cid in chemObjects) {
                    atomCount += chemObjects[cid].getAtomCount();
                }
                return atomCount;
            },

            getAtoms : function () {
                alert("Drawing.getAtoms()");
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

            getBondChemObjectId : function(bondId) {
                for (let cid in chemObjects) {
                    if (chemObjects[cid].hasBond(bondId)) {
                        return cid;
                    }
                }
                return null;
            },

            getBondCount : function () {
                let bondCount = 0;
                for (let cid in chemObjects) {
                    bondCount += chemObjects[cid].getBondCount();
                }
                return bondCount;
            },

            getBonds : function () {
                alert("Drawing.getBonds()");
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

            getCounter : function () {
                return counter;
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

            /**
             * @param sel selection bits
             * @return all chemobjects, which contain selected atoms or bonds
             */
            getSelectedChemObjects : function (sel) {
                let result = {};
                for (let cid in chemObjects) {
                    if (chemObjects[cid].hasSelected(sel)) {
                        result[cid] = chemObjects[cid];
                    }
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
                let cid = this.getAtomChemObjectId(atom.getId());
                chemObjects[cid].replaceAtom(atom);
            },

            replaceBond : function (bond) {
                let cid = this.getBondChemObjectId(bond.getId());
                chemObjects[cid].replaceBond(bond);
            },

            replaceChemObject : function (chemObject) {
                let cid = chemObject.getId();
                chemObjects[cid] = chemObject;
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

            setProperty : function (propname, propval) {
                properties[propname] = propval;
            },

            /**
             * determine the role for the next ChemObject to be created
             */
            setRole : function (r) {
                role = r;
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
