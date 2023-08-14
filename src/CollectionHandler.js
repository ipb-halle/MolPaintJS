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

    molpaintjs.CollectionHandler = function (ctx) {

        let contextId = ctx;

        function applySelection(drawing, collection, selection) {
            let atoms = {};
            let bonds = {};
            let chemObjects = {};
            for (let atom of selection.atoms) {
                let cid = drawing.getAtom(atom).getChemObjectId();
                atoms[atom] = atom;
                chemObjects[cid] = cid;
            }
            for (let bond of selection.bonds) {
                let cid = drawing.getBond(bond).getChemObjectId();
                bonds[bond] = bond;
                chemObjects[cid] = cid;
            }
            //
            // xxxxx      what to do if collection belongs to multiple ChemObjects? Merge?
            //
            collection.setAtoms(atoms);
            collection.setBonds(bonds);
        }

        /**
         * return the named collection or coalesce to a fresh and empty collection
         */
        function getCollection(drawing, name) {
            return drawing.getCollections()[name] ?? molPaintJS.Collection("");
        }

        function highlightAtoms(mol, atoms) {
            for (let a in mol.getAtoms()) {
                let atom = mol.getAtom(a);
                let sel = atom.getSelected();
                if (atoms[atom.getId()] != null) {
                    atom.setSelected(sel | 4);
                } else {
                    atom.setSelected(sel & ~4);
                }
            }
        }

        function highlightBonds(mol, bonds) {
            for (let b in mol.getBonds()) {
                let bond = mol.getBond(b);
                let sel = bond.getSelected();
                if (bonds[bond.getId()] != null) {
                    bond.setSelected(sel | 4);
                } else {
                    bond.setSelected(sel & ~4);
                }
            }
        }

        function renderInput () {
            let html = "";
            let selection = molPaintJS.getContext(contextId).getDrawing().getSelected(2);
            let inputId = molPaintJS.getDialog(contextId).getName() + "_input";
            if ((selection.atoms.length > 0) || (selection.bonds.length > 0)) {
                html = "Collection name:<br/><center style='margin:10px;'>"
                    + "<input id='" + inputId + "' type='text'/> "
                    + "<input type='button' value='Update / Add' onclick=\"molPaintJS.CollectionHandler('"
                    + contextId
                    + "').setCollection();\" /></center>";
            }
            return html;
        }

        function renderTable () {
            let html = "Currently known collections:<br/>";
            let collections = molPaintJS.getContext(contextId).getDrawing().getCollections();
            if (collections.length === 0) {
                return html;
            }

            html += "<table>";
            for (let c in collections) {
                const name = collections[c].getName();
                html += "<tr><td>"
                    + "<span onmouseover=\"molPaintJS.CollectionHandler('" + contextId + "').highlight('" + name + "');\" "
                    + "onmouseout=\"molPaintJS.CollectionHandler('" + contextId + "').highlight('');\">"
                    + name + "</span></td><td>"
                    + "<span onclick=\"molPaintJS.CollectionHandler('" + contextId + "').deleteCollection('" + name 
                    + "');\"> <i class='fa-solid fa-trash-can'></i></span>"
                    + "</td></tr>";
            }

            html += "</table>";
            return html;
        }

        return {

            clearHighlights: function () {
                this.highlight('');
            },

            highlight: function (name) {
                let context = molPaintJS.getContext(contextId);
                let mol = context.getDrawing();
                let collection = getCollection(mol, name);
                highlightAtoms(mol, collection.getAtoms());
                highlightBonds(mol, collection.getBonds());
                context.draw();
            },

            deleteCollection : function (name) {
                molPaintJS.getContext(contextId).getDrawing().delCollection(name);
                this.clearHighlights();
                if (Object.keys(molPaintJS.getContext(contextId).getDrawing().getCollections()).length > 0) {
                    this.render();
                } else {
                        console.log("ELSE");
                    molPaintJS.getDialog(contextId).close();
                }
            },

            render: function() {
                let dialog = molPaintJS.getDialog(contextId);
                dialog.setOnClose(this.clearHighlights());
                dialog.setTitle("Collections");
                dialog.setError("");
                dialog.setContent(renderInput() + renderTable());
                dialog.render();
            },

            setCollection: function() {
                let inputId = molPaintJS.getDialog(contextId).getName() + "_input";
                let context = molPaintJS.getContext(contextId);
                let name = document.getElementById(inputId).value;

                // check for invalid name
                if (name.match("[A-Za-z][A-Za-z #$+-;@]*")) {
                    let collection = molPaintJS.Collection(name);
                    let drawing = context.getDrawing();
                    let selection = drawing.getSelected(2);

                    // only create non-empty collections
                    if ((selection.atoms.length > 0) || (selection.bonds.length > 0)) {
                        applySelection(drawing, collection, selection);
                        drawing.replaceCollection(collection);
                        molPaintJS.getDialog(contextId).close();
                    }
                } else {
                    alert('Invalid collection name');
                }
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
