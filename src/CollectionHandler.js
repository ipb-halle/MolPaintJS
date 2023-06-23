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

    molpaintjs.CollectionHandler = function (cid) {

        var contextId = cid;

        function applySelection(collection, selection) {
            let atoms = {};
            let bonds = {};
            for (let atom of selection.atoms) {
                atoms[atom] = atom;
            }
            for (let bond of selection.bonds) {
                bonds[bond] = bond;
            }
            collection.setAtoms(atoms);
            collection.setBonds(bonds);
        }

        function getCollection(mol, name) {
            for (let collection of mol.getCollections()) {
                if (collection.getName() == name) {
                    return collection;
                }
            }
            return molPaintJS.Collection("");
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

        function renderInput (dlgId) {
            let html = "";
            let selection = molPaintJS.getContext(contextId).getMolecule().getSelected(2);
            if ((selection.atoms.length > 0) || (selection.bonds.length > 0)) {
                html = "Collection name:<br/><center style='margin:10px;'>"
                    + "<input id='" + dlgId + "_input' type='text'/>"
                    + "<input type='button' value='Update / Add' onclick=\"molPaintJS.CollectionHandler('"
                    + contextId
                    + "').setCollection();\" /></center>";
            }
            return html;
        }

        function renderList () {
            let html = "Currently known collections:<br/>";
            let collections = molPaintJS.getContext(contextId).getMolecule().getCollections();
            if (collections.length === 0) {
                return html;
            }

            html += "<ul>";
            for (let c of collections) {
                const name = c.getName();
                html += "<li>"
                    + "<span onclick=\"molPaintJS.CollectionHandler('" + contextId + "').highlight('" + name + "');\">"
                    + name + "</span>"
                    + "<span onclick=\"molPaintJS.CollectionHandler('" + contextId + "').deleteCollection('" + name + "');\"> &#x1f5d1;</span>"
                    + "</li>";
            }

            html += "</ul>";
            return html;
        }

        return {

            highlight: function (name) {
                let dlgId = contextId + "_modalDlg";
                let context = molPaintJS.getContext(contextId);
                let mol = context.getMolecule();
                let collection = getCollection(mol, name);
                highlightAtoms(mol, collection.getAtoms());
                highlightBonds(mol, collection.getBonds());
                document.getElementById(dlgId).style.display = 'none';
                context.draw();
            },

            deleteCollection : function (name) {
                let dlgId = contextId + "_modalDlg";
                molPaintJS.getContext(contextId).getMolecule().delCollection(name);
                this.highlight('');
                if (molPaintJS.getContext(contextId).getMolecule().getCollections().length > 0) {
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
                    + "').style.display='none'\" class=\"molPaintJS-modalCloseButton\">&times;</span>"
                    + renderInput(dlgId)
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
                    let molecule = context.getMolecule();
                    let selection = molecule.getSelected(2);

                    // only create non-empty collections
                    if ((selection.atoms.length > 0) || (selection.bonds.length > 0)) {
                        applySelection(collection, selection);
                        molecule.setCollection(collection);
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
