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

        function applySelection(drawing, name) {
            let chemObjects = drawing.getChemObjects();
            let nonEmpty = false;
            for (const cid in chemObjects) {
                let selection = {atoms: [], bonds: []};
                chemObjects[cid].getSelected(selection, 2);
                let collection = molPaintJS.Collection(name);
                if (selection.atoms.length > 0) {
                    collection.setAtoms(selection.atoms)
                    nonEmpty = true;
                }
                if (selection.bonds.length > 0) {
                    collection.setBonds(selection.bonds);
                    nonEmpty = true;
                }
                if (nonEmpty) {
                    chemObjects[cid].replaceCollection(collection);
                }
            }
            return nonEmpty;
        }

        /**
         * return the named collection or coalesce to a fresh and empty collection
         */
        function getCollection(drawing, name) {
            return drawing.getCollections()[name] ?? molPaintJS.Collection("");
        }

        function highlightAtoms(chemObject, atoms) {
            for (let atomId of atoms) {
                let atom = chemObject.getAtom(atomId);
                let sel = atom.getSelected();
                atom.setSelected(sel | 4);
            }
        }

        function highlightBonds(chemObject, bonds) {
            for (let bondId of bonds) {
                let bond = chemObject.getBond(bondId);
                let sel = bond.getSelected();
                bond.setSelected(sel | 4);
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
                let chemObjects = context.getDrawing().getChemObjects();
                for (let cid in chemObjects) {
                    let chemObject = chemObjects[cid];
                    chemObject.clearSelection(4);

                    let collection = chemObject.getCollections()[name];
                    if (collection != null) {
                        highlightAtoms(chemObject, collection.getAtoms());
                        highlightBonds(chemObject, collection.getBonds());
                    }
                }
                context.draw();
            },

            deleteCollection : function (name) {
                molPaintJS.getContext(contextId).getDrawing().delCollection(name);
                this.clearHighlights();
                if (Object.keys(molPaintJS.getContext(contextId).getDrawing().getCollections()).length > 0) {
                    this.render();
                } else {
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
                    let drawing = context.getDrawing();
                    applySelection(drawing, name);
                    molPaintJS.getDialog(contextId).close();
                } else {
                    alert('Invalid collection name');
                }
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
