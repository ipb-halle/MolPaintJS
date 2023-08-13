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

        function renderError (dlgId) {
            return "<center><div id='" + dlgId + "_error' class='.molPaintJS-modalDlgError'></div></center>";
        }

        function renderInput (dlgId) {
            let html = "";
            let selection = molPaintJS.getContext(contextId).getDrawing().getSelected(2);
            if ((selection.atoms.length > 0) || (selection.bonds.length > 0)) {
                html = "Collection name:<br/><center style='margin:10px;'>"
                    + "<input id='" + dlgId + "_input' type='text'/> "
                    + "<input type='button' value='Update / Add' onclick=\"molPaintJS.CollectionHandler('"
                    + contextId
                    + "').setCollection();\" /></center>";
            }
            return html;
        }

        function renderList () {
            let html = "Currently known collections:<br/>";
            let collections = molPaintJS.getContext(contextId).getDrawing().getCollections();
            if (collections.length === 0) {
                return html;
            }

            html += "<ul>";
            for (let c in collections) {
                const name = collections[c].getName();
                html += "<li>"
                    + "<span onclick=\"molPaintJS.CollectionHandler('" + contextId + "').highlight('" + name + "');\">"
                    + name + "</span>"
                    + "<span onclick=\"molPaintJS.CollectionHandler('" + contextId + "').deleteCollection('" + name 
                    + "');\"> <i class='fa-solid fa-trash-can'></i></span>"
                    + "</li>";
            }

            html += "</ul>";
            return html;
        }

        return {

            highlight: function (name) {
                let dlgId = contextId + "_modalDlg";
                let context = molPaintJS.getContext(contextId);
                let mol = context.getDrawing();
                let collection = getCollection(mol, name);
                highlightAtoms(mol, collection.getAtoms());
                highlightBonds(mol, collection.getBonds());
                document.getElementById(dlgId).style.display = 'none';
                context.draw();
            },

            deleteCollection : function (name) {
                let dlgId = contextId + "_modalDlg";
                molPaintJS.getContext(contextId).getDrawing().delCollection(name);
                this.highlight('');
                if (molPaintJS.getContext(contextId).getDrawing().getCollections().length > 0) {
                    this.render();
                } else {
                    document.getElementById(dlgId).style.display = 'none';
                }
            },

            render: function() {
                let dlgId = contextId + "_modalDlg";
                let e = document.getElementById(dlgId);
                e.innerHTML = "<div class='molPaintJS-modalDlgContent'>"
                    + "<span onclick=\"molPaintJS.CollectionHandler('" + contextId + "').highlight(''); "
                    + "document.getElementById('" + dlgId
                    + "').style.display='none'\" class=\"molPaintJS-modalCloseButton\">"
                    + "<i class='fa-solid fa-xmark'></i></span>"
                    + renderInput(dlgId)
                    + renderError(dlgId)
                    + renderList()
                    + "</div>";
                e.style.display = "block";
            },

            setCollection: function() {
                let dlgId = contextId + "_modalDlg";
                let context = molPaintJS.getContext(contextId);
                let name = document.getElementById(dlgId + "_input").value;

                // check for invalid name
                if (name.match("[A-Za-z][A-Za-z #$+-;@]*")) {
                    let collection = molPaintJS.Collection(name);
                    let drawing = context.getDrawing();
                    let selection = drawing.getSelected(2);

                    // only create non-empty collections
                    if ((selection.atoms.length > 0) || (selection.bonds.length > 0)) {
                        applySelection(drawing, collection, selection);
                        drawing.replaceCollection(collection);
                        document.getElementById(dlgId).style.display = 'none';
                    }
                } else {
                    alert('Invalid collection name');
                }
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
