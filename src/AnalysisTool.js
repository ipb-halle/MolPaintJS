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

        const electronMass = 5.48579909065e-4;
        let contextId = ctx;
        let analysisTotal = {role: 'Total', counts: {}, formula: "", mass: 0.0, massExact: 0.0 };

        function addTotal (data) {
            analysisTotal.mass += data.mass;
            analysisTotal.massExact += data.massExact;
            for (let sym in data.counts) {
                countElement(analysisTotal.counts, sym, data.counts[sym]);
            }
        }

        function analyse (chemObject) {
            let data = { };
            data.role = chemObject.getRole();
            data.counts = { };
            data.formula = "";
            data.mass = 0.0;
            data.massExact = 0.0;
            const atoms = chemObject.getAtoms();
            for (let idx in atoms) {
                let atom = atoms[idx];
                let isotope = atom.getType().getIsotope();
                if (isotope.getAtomicNumber() > 0) {
                    let symbol = isotope.getSymbol();

                    // xxxxx mass computations and hydrogen count are NOT exact!
                    let implicitHs = atom.getHydrogenCount(chemObject, true);
                    data.mass += isotope.getMass();
                    data.mass += implicitHs * 1.008;
                    data.massExact += isotope.getMassExact();
                    data.massExact += implicitHs * 1.00782503223;
                    data.massExact -= atom.getCharge() * electronMass;

                    countElement (data.counts, symbol, 1);
                    countElement (data.counts, "H", implicitHs);
                }
            }
            addTotal(data);
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
                + sprintf("%.3f", analysis.mass)
                + "</td><td>"
                + sprintf("%.8f", analysis.massExact)
                + "</td></tr>";
            return html;
        }

        function countElement (counts, symbol, count) {
            if (counts[symbol] != null) {
                counts[symbol] += count;
            } else {
                counts[symbol] = count;
            }
        }

        function getFormula (counts) {
            let html = "";
            if (counts['C'] != null) {
                html += "C" + getFormulaSubScript(counts['C']);
                delete counts['C'];

                // count['H'] may be 0 from implicit H computation
                if (counts ['H'] > 0) {     
                    html += "H" + getFormulaSubScript(counts['H']);
                    delete counts['H'];
                }
            }
            for (let sym of Object.keys(counts).sort()) {
                // may contain 'H' = 0 from implicit H count computation
                if (counts[sym] > 0) {
                    html += sym + getFormulaSubScript(counts[sym]);
                }
            }
            return html;
        }

        function getFormulaSubScript (count) {
            return (count > 1) ? "<sub>" + count + "</sub>" : "";
        }

        function renderTable () {
            let html = "<table><tr><td>Role</td><td>Formula</td><td>Mass</td><td>Exact Mass</td></tr>"
            let drawing = molPaintJS.getContext(contextId).getDrawing();
            let chemObjects = drawing.getChemObjects();
            for (let cid in chemObjects) {
                let analysis = analyse(chemObjects[cid]);
                analysis.formula = getFormula(analysis.counts);
                html += convertToHtml(analysis, cid);
            }
            analysisTotal.formula = getFormula(analysisTotal.counts);
            html += convertToHtml(analysisTotal, null);
            html += "</table>"
            return html;
        }

        return {

            highlight : function (chemObjectId) {
                let context = molPaintJS.getContext(contextId);
                let chemObject = context
                    .getDrawing()
                    .getChemObjects()[chemObjectId]
                    .setSelected(4);
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
                dialog.setError("Warning! Data will be correct only for most simple cases! Proceed with care!");
                dialog.setContent(renderTable());
                dialog.render();
            },

        };
    }
    return molpaintjs;
}(molPaintJS || {}));
