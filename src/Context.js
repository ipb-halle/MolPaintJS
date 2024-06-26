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

    molpaintjs.Context = function(cid, prop, mp) {

        let molpaint = mp;
        let properties = molPaintJS.DefaultProperties(mp.getProperties()).setProperties(prop).getProperties();

        molpaint.createCSS(properties);
        molpaint.createHelpWidget();

        let changeListener = null;
        let currentElement = molPaintJS.Elements.getElement("C");
        let currentTemplate = mp.getTemplates()[0];

        let tools = null;
        let currentTool = null;
        let currentBondTool = null;

        let dialog = molPaintJS.Dialog(cid);
        let drawing = null;             // initialized by init()
        let history = molPaintJS.History(cid);

        let registeredIds = [];
        let view = molPaintJS.View(cid, properties);
        let widget = molPaintJS.Widget(cid, properties, mp);
        let counter = molPaintJS.Counter();                // context unique counter

        /**
         * depending on the value of properties.viewer, set up
         * the individual tools
         */
        function setupTools (ctx, properties) {
            if(properties.viewer != "1") {
                tools = { pointerTool: molPaintJS.PointerTool(ctx, properties),
                  slideTool: molPaintJS.SlideTool(ctx),
                  eraserTool: molPaintJS.EraserTool(ctx, properties),
                  singleBondTool: molPaintJS.BondTool(ctx, properties,  1, 0, "single_bond"),
                  doubleBondTool: molPaintJS.BondTool(ctx, properties,  2, 0, "double_bond"),
                  tripleBondTool: molPaintJS.BondTool(ctx, properties,  3, 0, "triple_bond"),
                  solidWedgeTool: molPaintJS.BondTool(ctx, properties,  1, 1, "solid_wedge"),
                  wavyBondTool: molPaintJS.BondTool(ctx, properties, 1, 2, "wavy_bond"),
                  hashedWedgeTool: molPaintJS.BondTool(ctx, properties, 1, 3, "hashed_wedge"),
                  isotopeTool: molPaintJS.IsotopeTool(ctx, properties),
                  radicalTool: molPaintJS.RadicalTool(ctx, properties),
                  roleTool: molPaintJS.RoleTool(ctx, properties),
                  chainTool: molPaintJS.ChainTool(ctx, properties),
                  chargeIncTool: molPaintJS.ChargeIncTool(ctx, properties),
                  chargeDecTool: molPaintJS.ChargeDecTool(ctx, properties),
                  hydrogenAtomTool: molPaintJS.AtomTool(ctx, properties, "hydrogen"),
                  carbonAtomTool: molPaintJS.AtomTool(ctx, properties, "carbon"),
                  nitrogenAtomTool: molPaintJS.AtomTool(ctx, properties, "nitrogen"),
                  oxygenAtomTool: molPaintJS.AtomTool(ctx, properties, "oxygen"),
                  customElementTool: molPaintJS.AtomTool(ctx, properties, "customElement"),
                  templateTool: molPaintJS.TemplateTool(ctx, properties, "template") };

                currentTool = tools.pointerTool;
                currentBondTool = tools.singleBondTool;
                tools.templateTool.setTemplate(
                    currentTemplate,
                    molpaint.getTemplate(currentTemplate));
            } else {
                tools = { nullTool : molPaintJS.NullTool(this) };
                currentTool = tools.nullTool;
                currentBondTool = tools.nullTool;
            }
        }

        return {
            contextId : cid,

            debug : function (msg) {
                if(properties.debugId != null) {
                    let e = document.getElementById(properties.debugId);
                    e.innerHTML = msg;
                }
            },

            draw : function () {
                let d = molPaintJS.DrawCanvas(view, drawing);
                d.draw();
                if (changeListener != null) {
                    changeListener.call(this);
                }
            },

            getCounter : function () {
                return counter
            },

            getCurrentBondTool : function () {
                return currentBondTool;
            },
            getCurrentElement : function () {
                return currentElement;
            },
            getCurrentTemplate : function() {
                return currentTemplate;
            },
            getCurrentTool : function () {
                return currentTool;
            },
            getDialog: function () {
                return dialog;
            },
            getDrawing : function () {
                return drawing;
            },
            getHistory : function () {
                return history;
            },
            getProperties : function () {
                return properties;
            },
            getRegisteredIds : function () {
                return registeredIds;
            },
            getTools : function () {
                return tools;
            },
            getView : function () {
                return view;
            },
            getWidget : function () {
                return widget;
            },

            /**
             * asynchronous initialization of the mol editor
             */
            init : function () {
                let ctx = this;
                drawing = molPaintJS.Drawing(counter);
                setupTools(ctx, properties);
                let p = new Promise(function (resolve, reject) {
                    window.setTimeout(function () {
                        resolve(ctx);
                    }, 120);
                });
                p.then(function (ctx) {
                    ctx.getView().init();
                    if(ctx.getProperties().viewer != "1") {
                        ctx.getHistory().updateIcons();
                        ctx.setCurrentTool(ctx.getTools().pointerTool);
                        ctx.getWidget().initEvents(ctx);
                    }
                    ctx.getView().initRaster(drawing);
                });
                return this;
            },

            /**
             * Paste a chemical drawing (from clipboard) into the
             * current drawing. Update the history accordingly.
             * @param st the chemical drawing string (MDL mol, ...)
             * @param sel the selection bits to set for the pasted drawing
             * @return an actionList containing the new ChemObjects
             */
            pasteDrawing: function (st, sel) {
                let pasteDrawing;
                try {
                    pasteDrawing = molPaintJS.MDLParser.parse(st, {'counter': counter, 'logLevel': 5});
                } catch(e) {
                    console.log("Parse error in Context.pasteDrawing(): " + e.message);
                    return;
                }
                let actionList = molPaintJS.ActionList();
                let pasteChemObjects = pasteDrawing.getChemObjects();
                for (let chemObject of Object.values(pasteChemObjects)) {
                    chemObject.setSelected(1);
                    drawing.addChemObject(chemObject);
                    actionList.addAction(molPaintJS.Action("ADD", "CHEMOBJECT", chemObject, null));
                }
                view.initRaster(drawing);
                this.draw();
                return actionList;
            },

            registerId : function(id) {
                registeredIds.push(id);
            },

            render : function() {
                molpaint.registerContext(this.contextId, this);
                widget.renderWidget();
            },

            /**
             * set a changeListener which is called each time
             * the drawing is changed
             * @param listener the function to be executed on each change
             */
            setChangeListener : function (listener) {
                changeListener = listener;
                return this;
            },

            setCurrentElement : function(el) {
                currentElement = el;
                return this;
            },

            setCurrentTemplate : function (tp) {
                currentTemplate = tp;
                return this;
            },

            /**
             * call the abort() method of currentTool
             * and set currentTool to the new tool. Initialize
             * the new tool by calling Tools.setup(tool).
             * @param tool the new tool
             * @return this instance of Context
             */
            setCurrentTool : function (tool) {
                currentTool.abort(currentTool);
                currentTool = tool;
                molPaintJS.Tools.setup(tool);
                return this;
            },

            /**
             * @param data PNG with embedded chemical data or MDL file; should
             * be either of type ArrayBuffer or String
             * @return this Context instance (useful for method chaining)
             */
            setDrawing : function (data) {
                try {
                    return this.setDrawingPNG(data);
                } catch (e) {
                    if (typeof data === "object") {
                        return this.setDrawingMDL(new TextDecoder().decode(data));
                    } else {
                        return this.setDrawingMDL(data);
                    }
                }
            },

            setDrawingMDL : function (mdl) {
                if (typeof mdl !== "string") {
                    throw new Error("setDrawingMDL(): string expected");
                }
                try {
                    drawing = molPaintJS.MDLParser.parse(mdl, {'logLevel': 0, 'counter': counter});
                    drawing.setRole('default');
                } catch(e) {
                    console.log("Parse error in Context.setDrawing(): " + e.message);
                    return;
                }

                view.center();
                view.initRaster(drawing);
                view.setDisplayScale(drawing, true);
                this.draw();
                return this;
            },

            setDrawingPNG : function (picture) {
                try {
                    let chemicalData = MetaPNG.getMetadata(new Uint8Array(picture), "ChemicalData");
                    chemicalData = JSON.parse(chemicalData);
                    return this.setDrawingMDL(chemicalData.data);
                } catch (e) {
                    console.log(e);
                    throw new Error("loading of embedded chemical data (PNG) failed");
                }
            },

            setDrawingObject : function (m) {
                drawing = m;
            },

            /**
             * @deprecated
             * Compatibility function; will be removed. Future
             * implementations are planned to include support for
             * chemical reactions etc., therefore the method name
             * seemed inappropriate.
             * @see setDrawing(data)
             */
            setMolecule : function(data) {
                console.log("Encountered deprecated method setMolecule(), use setDrawing() instead!");
                return this.setDrawing(data);
            },

        };  // return
    }   // Context
    return molpaintjs;
}(molPaintJS || {}));

