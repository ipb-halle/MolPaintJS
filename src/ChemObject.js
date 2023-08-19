/*
 * MolPaintJS
 * Copyright 2017-2021 Leibniz-Institut f. Pflanzenbiochemie
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

    molpaintjs.ChemObject = function (d) {

        let drawing = d;

        const id = "chemObj" + drawing.getCounter().uniqueCounter();
        let atoms = {};
        let bonds = {};
        let collections = {};
        let properties = {};
        let role = "default";
        let sgroups = {};
        let atomCount = 0;
        let bondCount = 0;

        properties["COMMENT"] = "generated by MolPaintJS";
        properties["HEADER2"] = "";
        properties["NAME"] = "n.n.";

        return {
            addAtom : function (a) {
                let atomId = a.getId();
                atoms[atomId] = a;
                a.setChemObjectId(this.getId());
                return atomId;
            },

            addBond : function (b) {
                let id = b.getId();
                bonds[id] = b;
                b.setChemObjectId(this.getId());
                b.getAtomA().addBond(id);
                b.getAtomB().addBond(id);
                return id;
            },

            /**
             * called by parser; collections may be defined incrementally
             */
            addCollection : function (collection) {
                let name = collection.getName();
                if (collections[name] != null) {
                    collections[name].join(collection);
                } else {
                    collections[name] = collection;
                }
            },

            addSGroup : function (sg, id) {
                if (id == null) {
                    id = "SGroup" + drawing.getCounter().uniqueCounter();
                    sg.setId(id);
                }
                sgroups[id] = sg;
                return id;
            },

            /**
             * adjust selections
             * @param match match all atoms and bonds where any of the given bits are set
             * @param clear clear given bits on all matching atoms, bonds and sgroups
             * @param set Set the given bits on all matching atoms, bonds and sgroups
             */
            adjustSelection : function (match, clear, set) {
                for (let id in atoms) {
                    let sel = atoms[id].getSelected();
                    if(sel & match) {

                        // order matters: first clear, then set
                        sel &= ~clear;
                        atoms[id].setSelected(sel | set);
                    }
                }
                for (let id in bonds) {
                    let sel = bonds[id].getSelected();
                    if(sel & match) {
                        sel &= ~clear;
                        bonds[id].setSelected(sel | set);
                    }
                }
                for (let id in sgroups) {
                    let sel = sgroups[id].getSelected();
                    if(sel & match) {
                        sel &= ~clear;
                        sgroups[id].setSelected(sel | set);
                    }
                }
            },

            /**
             * check, whether this ChemObject is composed of two
             * disconnected bond graphs
             */
            checkSplit : function () {
                let connectedBondSets = [];
                let bondsToWalk = {};
                for (let b in bonds) {
                    bondsToWalk[b] = b;
                }
                while (Object.keys(bondsToWalk).length > 0) {
                    let bondsWalked = {};
                    connectedBondSets.push(bondsWalked);
                    let bondId = Object.keys(bondsToWalk)[0];
                    let bond = bonds[bondId];
                    bondsWalked[bondId] = bondId;
                    delete bondsToWalk[bondId];
                    this.walkBonds (bondsToWalk, bondsWalked, bond.getAtomA());
                    this.walkBonds (bondsToWalk, bondsWalked, bond.getAtomB());
                }
                return connectedBondSets;
            },

            /**
             * clear all selections
             * @param val All selections with bit val will be cleared.
             */
            clearSelection : function (val) {
                for (let atom of Object.values(atoms)) {
                    atom.setSelected(atom.getSelected() & ~val);
                }
                for (let bond of Object.values(bonds)) {
                    bond.setSelected(bond.getSelected() & ~val);
                }
                for (let sgroup of Object.values(sgroups)) {
                    sgroup.setSelected(sgroup.getSelected & ~val);
                }
            },

            /**
             * compute update history and clear temp flag
             * @param actionList to receive update history
             */
            clearTemp : function (actionList)  {
                for (let id in atoms) {
                    if(atoms[id].getTemp() != 0) {
                        atoms[id].setTemp(0);
                        actionList.addAction(molPaintJS.Action("ADD", "ATOM", atoms[id], null));
                    }
                }
                for (let id in bonds) {
                    if(bonds[id].getTemp() != 0) {
                        bonds[id].setTemp(0);
                        actionList.addAction(molPaintJS.Action("ADD", "BOND", bonds[id], null));
                    }
                }
            },


            /**
             * compute the bounding box coordinates of the current drawing
             * @param sel select bits which must be set when computing the
             * bounding box; if sel = 0, everything is selected
             */
            computeBBox : function (sel) {
                let first = 0;
                let minX, maxX, minY, maxY;

                for (let i in atoms) {
                    let a = atoms[i];
                    if ((sel === 0) || ((a.getSelected() & sel) != 0)) {
                        let x = a.getX();
                        let y = a.getY();
                        if (first == 0) {
                            minX = x;
                            maxX = x;
                            minY = y;
                            maxY = y;
                            first = 1;
                        } else {
                            minX = (minX < x) ? minX : x;
                            maxX = (maxX > x) ? maxX : x;
                            minY = (minY < y) ? minY : y;
                            maxY = (maxY > y) ? maxY : y;
                        }
                    }
                }
                return molPaintJS.Box(minX, minY, maxX, maxY);
            },

            /**
             * compute median bond length; return 1.5 ChemObject does not
             * contain any bonds
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

            /**
             * deletes a single atom from this drawing
             * CAVEAT: this function does not perform any cross-check,
             * whether this atom is still part of a bond in this
             * drawing
             * @return true if deleted atom was the last atom in this ChemObject
             */
            delAtom : function (a) {
                let idx = a.getId();
                delete atoms[idx];
                return (Object.keys(atoms).length === 0);
            },

            delBond : function (b) {
                let idx = b.getId();
                let bond = bonds[idx];
                bond.getAtomA().delBond(idx);
                bond.getAtomB().delBond(idx);
                delete bonds[idx];
                return this.checkSplit();
            },

            delCollection : function (name) {
                delete collections[name];
            },

            /*
             * delete a SGroup
             */
            delSGroup : function (sg) {
                let idx = sg.getId();
                /*
                 * ToDo: remove SGroup from atoms and bonds
                 */
                delete sgroups[idx];
            },

            /**
             * delete all temporary bonds and atoms from the drawing
             */
            delTemp : function() {
                for(let b in bonds) {
                    if(bonds[b].getTemp() != 0) {
                        bonds[b].getAtomA().delBond(b);
                        bonds[b].getAtomB().delBond(b);
                        delete bonds[b];
                    }
                }
                for(let a in atoms) {
                    if(atoms[a].getTemp() != 0) {
                        delete atoms[a];
                    }
                }
            },

            getAtom : function (id) {
                return atoms[id];
            },

            getAtomCount : function () {
                return atomCount;
            },

            getAtoms : function () {
                return atoms;
            },

            getBond : function (id) {
                return bonds[id];
            },

            getBondCount : function () {
                return bondCount;
            },

            getBonds : function () {
                return bonds;
            },

            getCollection : function (name) {
                return collections[name];
            },

            getCollections : function () {
                return collections;
            },

            getId : function () {
                return id;
            },

            getProperties : function () {
                return properties;
            },

            getProperty : function (propname) {
                return properties[propname];
            },

            getRole : function () {
                return role;
            },

            /**
             * @param result object containing the atom and bond objects
             * @param sel selection bits
             * @return the atoms and bonds which match the given selection bits
             */
            getSelected : function (result, sel) {
                for (let id in atoms) {
                    if ((atoms[id].getSelected() & sel) != 0) {
                        result.atoms.push(id);
                    }
                }
                for (let id in bonds) {
                    if ((bonds[id].getSelected() & sel) != 0) {
                        result.bonds.push(id);
                    }
                }
            },

            getSGroup : function (idx) {
                return sgroups[idx];
            },

            getSGroups : function () {
                return sgroups;
            },


            /**
             * Join two ChemObjects by adding the atoms, bonds, sgroups etc. from
             * the given ChemObjecty to this ChemObject. Joins happen, if two
             * ChemObjects are connected by a common bond.
             * Split is the inverse operation to join.
             */
            join : function (chemObj) {
                let otherAtoms = chemObj.getAtoms();
                let otherBonds = chemObj.getBonds();
                let otherCollections = chemObj.getCollections();

                for (let atomId in otherAtoms) {
                    let atom = otherAtoms[atomId];
                    atom.setChemObjectId(this.getId());
                    atoms[atomId] = atom;

                }
                for (let bondId in otherBonds) {
                    let bond = otherBonds[bondId];
                    bond.setChemObjectId(this.getId());
                    bonds[bondId] = bond;
                }
                // xxxxx join also SGroups and other Info

                for (let name in otherCollections) {
                    let collection = otherCollections[name];
                    if (collections[name]) {
                        collections[name].join(collection);
                    } else {
                        collections[name] = collection;
                    }
                }
            },

            /**
             * move the ChemObject according to the given coordinates
             * @param dx delta in X direction
             * @param dy delta in Y direction
             */
            move : function (dx, dy) {
                for (let id in atoms) {
                    atoms[id].addX(dx);
                    atoms[id].addY(dy);
                }
            },

            /**
             * assign a numeric index to all atoms and bonds
             */
            reIndex : function () {
               let i = 1;
                for (let id in atoms) {
                    let a = atoms [id];
                    a.setIndex(i);
                    i++;
                }
                atomCount = i - 1;

                i = 1;
                for (let id in bonds) {
                    let b = bonds[id];
                    b.setIndex(i);
                    i++;
                }
                bondCount = i - 1;
                return this;
            },

            /**
             * replace an atom in the atom list and all
             * bonds. The IDs of the atoms must be identical.
             * @param a atom
             */
            replaceAtom : function (a) {
                let id = a.getId();
                let o = atoms[id];
                if (o == null) {
                    alert("ChemObject.replaceAtom() called for non-existing atom.");
                    return;
                }
                for (let i in a.getBonds()) {
                    let b = bonds[i];
                    if (b.getAtomA().getId() == id) {
                        b.setAtomA(a);
                    } else {
                        b.setAtomB(a);
                    }
                }
                atoms[id] = a;
            },

            /**
             * replace a bond in the bond list. The IDs of the
             * bonds must be identical. The bond lists
             * of the atoms are not affected, because they contain
             * only bond IDs.
             */
            replaceBond : function (b) {
                let id = b.getId();
                let o = bonds[id];
                if (o == null) {
                    alert("ChemObject.replaceBond() called for non-existing bond.");
                    return;
                }
                bonds[id] = b;
            },

            /**
             * replace a Collection of this Drawing by the Collection
             * given as an argument. If the Collection does not yet
             * exist, append it to the list of Collections.
             * @param collection the collection object with modified data
             */
            replaceCollection : function (collection) {
                collections[collection.getName()] = collection;
            },

            /**
             * select the first matching atom
             * @param coords the coordinates
             * @param distmax maximum squared euclidian distance
             * @return atomId
             */
            selectAtom : function (coords, distmax) {
                for (let id in atoms) {
                    let a = atoms[id];
                    let dx = a.getX() - coords.x;
                    let dy = a.getY() - coords.y;
                    if (distmax > ((dx * dx) + (dy * dy))) {
                        return id;
                    }
                }
                return null;
            },

            /**
             * return a list of atom id's and a list of bond id's,
             * which are enclosed by the given bounding box.
             * Enclosed atoms and bonds are marked as selected.
             * @param bbox bounding box in drawing coordinates
             * @param val bit value to set on selected entities
             * @param cond bits which must not be set for selection of an entity
             * @return an object with properties "atoms" and "bonds"
             */
            selectBBox : function (result, bbox, val, cond) {
                for (let id in atoms) {
                    let atom = atoms[id];
                    let sel = atom.getSelected();
                    if ((sel & cond) === 0) {
                        if (bbox.contains(atom.getX(), atom.getY())) {
                            atom.setSelected(sel | val);
                            result.atoms.push(id);
                        }
                    }
                }
                for (let id in bonds) {
                    let bond = bonds[id];
                    let sel = bond.getSelected();
                    if ((sel & cond) === 0) {
                        let atomA = bond.getAtomA();
                        let atomB = bond.getAtomB();
                        if (bbox.contains(atomA.getX(), atomA.getY()) &&
                            bbox.contains(atomB.getX(), atomB.getY())) {
                            bond.setSelected(sel | val);
                            result.bonds.push(id);
                        }
                    }
                }
            },

            /**
             * return a list of matching bonds
             * @param coords coordinates of action
             * @param distmax maximum squared euclidian distance
             * @param returns an array of matching bonds; array may be empty
             */
            selectBonds : function (matches, coords, distmax) {
                for (let id in bonds) {
                    let b = bonds[id];
                    let dx = b.getAtomA().getX() - b.getAtomB().getX();
                    let dy = b.getAtomA().getY() - b.getAtomB().getY();
                    let l = Math.sqrt(dx * dx + dy * dy);

                    l = (l < 0.01) ? 1.0 : l;   // guard against division by zero

                    let bx = coords.x - b.getAtomB().getX();
                    let by = coords.y - b.getAtomB().getY();

                    let sin = dy / l;
                    let cos = dx / l;

                    let rx = bx * cos + by * sin;
                    let ry = -bx * sin + by * cos

                    if ((rx > 0) && (rx < l) && ((ry * ry) < distmax)) {
                        matches.push(id);
                    }
                }
            },

            setProperty : function (propname, propval) {
                properties[propname] = propval;
            },

            setRole : function (r) {
                role = r;
            },

            setSelected : function (val) {
                for (let atom of Object.values(atoms)) {
                    atom.setSelected(atom.getSelected() | val);
                }

                for (let bond of Object.values(bonds)) {
                    bond.setSelected(bond.getSelected() | val);
                }
            },

            /**
             * 2d-transforms the coordinates of this drawing.
             * The z-coordinate is not affected!
             * @param matrix a 2x3 transformation matrix
             * @param sel select bits to which the transformation should apply (set to
             * zero to apply transformation to all atoms)
             */
            transform : function (matrix, sel) {
                for (let id in atoms) {
                    let atom = atoms[id];
                    if ( (sel === 0) || ((atom.getSelected() & sel) != 0)) {
                        let x = atom.getX();
                        let y = atom.getY();
                        atom.setX(matrix[0][0] * x + matrix[0][1] * y + matrix[0][2]);
                        atom.setY(matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]);
                    }
                }
            },

            walkBonds : function (bondsToWalk, bondsWalked, atom) {
                for (let bondId in atom.getBonds()) {
                    if (! bondsWalked[bondId]) {
                        let bond = bonds[bondId]
                        bondsWalked[bondId] = bondId;
                        delete bondsToWalk[bondId];
                        this.walkBonds(bondsToWalk, bondsWalked, bond.getAtomA());
                        this.walkBonds(bondsToWalk, bondsWalked, bond.getAtomB());
                    }
                }
            },
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

