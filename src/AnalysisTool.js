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

    molpaintjs.AnalysisTool = function (ctx) {

        let contextId = ctx;
        let analysisTotal = {role: 'Total', formula: '', mass: 0.0, exactMass: 0.0 };
        const tableHeader = {role: 'Role', formula: 'Formula', mass: 'Mass', exactMass: 'exactMass' };

        function analyse (chemObject) {
            let data = { };
            data.role = chemObject.getRole();
            data.formula = "";
            data.mass = 0.0;
            data.exactMass = 0.0;

            return data;
        }

        function convertToHtml (analysis, chemObjectId) {
            let html = "<tr>";
            if (chemObjectId) {
                html = "<tr onmouseover='molPaintJS.AnalysisTool(\""
                + contextId + "\").highlight(\"" + chemObjectId + "\");'"
                + " onmouseout='molPaintJS.AnalysisTool(\""
                + contextId + "\").unselect(\"" + chemObjectId + "\");'>";
            }
            html += "<td>"
                + analysis.role
                + "</td><td>"
                + analysis.formula
                + "</td><td>"
                + analysis.mass
                + "</td><td>"
                + analysis.exactMass
                + "</td></tr>";
            return html;
        }

        function renderTable () {
            let html = "<table>"
                + convertToHtml(tableHeader, null);
            let drawing = molPaintJS.getContext(contextId).getDrawing();
            let chemObjects = drawing.getChemObjects();
            for (let cid in chemObjects) {
                let analysis = analyse(chemObjects[cid]);
                html += convertToHtml(analysis, cid);
            }
            html += convertToHtml(analysisTotal, null);
            html += "</table>"
            return html;
        }

        return {

            highlight : function (chemObjectId) {
                let context = molPaintJS.getContext(contextId);
                let chemObject = context
                    .getDrawing()
                    .getChemObjects()[chemObjectId];

                let atoms = chemObject.getAtoms();
                for (let atomId in atoms) {
                    atoms[atomId].setSelected(4);
                }

                let bonds = chemObject.getBonds();
                for (let bondId in bonds) {
                    bonds[bondId].setSelected(4);
                }
                context.draw();
            },

            unselect : function (chemObjectId) {
                let context = molPaintJS.getContext(contextId);
                context.getDrawing()
                    .getChemObjects()[chemObjectId]
                    .clearSelection(4);
                context.draw();
            },

            render: function() {
                let dialog = molPaintJS.getDialog(contextId);
                dialog.setOnClose(null);
                dialog.setTitle("Analysis");
                dialog.setError("");
                dialog.setContent(renderTable());
                dialog.render();
            },

        };
    }
    return molpaintjs;
}(molPaintJS || {}));
