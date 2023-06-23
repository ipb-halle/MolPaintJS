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

    molpaintjs.Context = function(cid, prop, mp) {

        var molpaint = mp;
        molpaint.createCSS();
        molpaint.createHelpWidget();

        var properties = molPaintJS.DefaultProperties(mp.getProperties()).setProperties(prop).getProperties();
        var changeListener = null;
        var currentElement = molPaintJS.Elements.getElement("C");
        var currentTemplate = mp.getTemplates()[0];

        var tools = null;
        var currentTool = null;
        var currentBondTool = null;

        var history = molPaintJS.History(cid);
        var molecule = molPaintJS.Molecule();

        var view = molPaintJS.View(cid, properties);
        var widget = molPaintJS.Widget(cid, properties, mp);

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
                let d = molPaintJS.Draw(view, molecule);
                d.draw();
                if (changeListener != null) {
                    changeListener.call(this);
                }
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
            getHistory : function () {
                return history;
            },
            getMolecule : function () {
                return molecule;
            },
            getProperties : function () {
                return properties;
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
                    ctx.getView().initRaster(molecule);
                });
                return this;
            },

            /**
             * Paste a molecule (from clipboard) into the
             * current molecule. Update the history accordingly.
             * @param st the molecule string (MDL mol, ...)
             * @param sel the selection bits to set for the pasted molecule
             * @return the already appended (!) actionList
             */
            pasteMolecule : function (st, sel) {
                let mol;
                try {
                    mol = molPaintJS.MDLParser.parse(st, {'logLevel': 5});
                    if (mol.getCollections().length > 0) {
                        console.log("collections not supported during paste");
                    }
                } catch(e) {
                    console.log("Parse error in Context.pasteMolecule(): " + e.message);
                    console.log("start: line "  + e.location.start.line + ", column " + e.location.start.column);
                    console.log("end: line " + e.location.end.line + ", column " + e.location.end.column);
                    return;
                }
                let actionList = molPaintJS.ActionList();

                // add atoms
                let atoms = mol.getAtoms();
                for (let i in atoms) {
                    let a = atoms[i];
                    a.setBonds({});
                    a.setSelected(sel);
                    a.setId(molecule.addAtom(a, null));
                    actionList.addAction(molPaintJS.Action("ADD", "ATOM", a, null));
                }

                // add bonds
                let bonds = mol.getBonds();
                for (let i in bonds) {
                    let b = bonds[i];
                    b.setSelected(sel);
                    molecule.addBond(b, null);
                    actionList.addAction(molPaintJS.Action("ADD", "BOND", b, null));
                }

                // add sgroups
                let sgroups = mol.getSGroups();
                for (let i in sgroups) {
                    let g = sgroups[i];
                    g.setSelected(sel);
                    molecule.addSGroup(g, null);
                    // actionList.addAction(molPaintJS.Action("ADD", "SGROUP", g, null));
                }

                // ToDo: Collections NOT IMPLEMENTED

                history.appendAction(actionList);

                view.initRaster(molecule);
                this.draw();
                return actionList;
            },

            render : function() {
                molpaint.registerContext(this.contextId, this);
                widget.renderWidget();
            },

            /**
             * set a changeListener which is called each time
             * the molecule is changed
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
             * @return this Context instance (useful for method chaining)
             */
            setMolecule : function (st) {
                try {
                    molecule = molPaintJS.MDLParser.parse(st);
                } catch(e) {
                    console.log("Parse error in Context.setMolecule(): " + e.message);
                    console.log("start: line "  + e.location.start.line + ", column " + e.location.start.column);
                    console.log("end: line " + e.location.end.line + ", column " + e.location.end.column);
                    return;
                }

                view.center();
                view.initRaster(molecule);
                view.setDisplayScale(molecule, true);
                this.draw();
                return this;
            },

            setMoleculeObject : function (m) {
                molecule = m;
            }

        };  // return
    }   // Context
    return molpaintjs;
}(molPaintJS || {}));

