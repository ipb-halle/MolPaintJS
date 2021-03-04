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

    molpaintjs.setElement = function (id, el) {
        var ctx = molPaintJS.getContext(id);
        ctx.setCurrentElement(molPaintJS.Elements.getElement(el));
        ctx.getWidget().onCustomElement({target: {id: id}});
    }

    molpaintjs.setCurrentBond = function (id) {
        var ctx = molPaintJS.getContext(id);
        if (ctx != undefined) {
            ctx.setCurrentTool(ctx.getCurrentBondTool());
        }
    }

    molpaintjs.Widget = function(contextId, prop, mp) {

        var distMax = prop.distMax;
        var molpaint = mp;
        var iconSize = prop.iconSize;
        var height = prop.sizeY;
        var helpURL = prop.helpURL;
        var widgetId = contextId;
        var widgetObject = document.getElementById(contextId);
        var width = prop.sizeX;
        var viewer = (prop.viewer === 1);

        /*
         * Actions
         */
        function actionCarbon (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("C"));
            ctx.setCurrentTool(ctx.getTools().carbonAtomTool);
        }

        function actionCenter (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);

        //
        // do not affect (atomic) coordinates -> no need for history
        //
        //  ctx.molecule.center();

            ctx.getView().center();
            ctx.draw();
        }

        function actionChain (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chainTool);
        }

        function actionChargeDec (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chargeDecTool);
        }

        function actionChargeInc (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chargeIncTool);
        }

        function actionCopy (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var w = molPaintJS.MDLv2000Writer();

            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.setAttribute("id", evt.target.id + "dummyId");
            document.getElementById(evt.target.id + "dummyId").value = w.write(ctx.getMolecule()); 
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }

        function actionClear (evt) {
            var id = evt.target.id;
            var ctx = molPaintJS.getContext(evt.target.id);
            var actionList = molPaintJS.ActionList();

            var molecule = ctx.getMolecule();
            for (var a in molecule.getAtoms()) {
                actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, molecule.getAtom(a)));
            }
            for (var b in molecule.getBonds()) {
                actionList.addAction(molPaintJS.Action("DEL", "BOND", null, molecule.getBond(b)));
            }

            ctx.getHistory().appendAction(actionList);
            ctx.setMoleculeObject(molPaintJS.Molecule());
            ctx.draw();
        }

        function actionCustomElement (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var sym = ctx.getCurrentElement().getSymbol();
            switch (sym) {
                case "H":
                    ctx.setCurrentTool(ctx.getTools().hydrogenAtomTool);
                    break;
                case "C":
                    ctx.setCurrentTool(ctx.getTools().carbonAtomTool);
                    break;
                case "N":
                    ctx.setCurrentTool(ctx.getTools().nitrogenAtomTool);
                    break;
                case "O":
                    ctx.setCurrentTool(ctx.getTools().oxygenAtomTool);
                    break;
                default:
                    ctx.setCurrentTool(ctx.getTools().customElementTool);
            }
        }

        function actionEraser (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().eraserTool);
        }

        function actionDoubleBond (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().doubleBondTool);
        }
        function actionHashedWedge (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().hashedWedgeTool);
        }

        function actionHydrogen (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("H"));
            ctx.setCurrentTool(ctx.getTools().hydrogenAtomTool);
        }

        function actionInfo (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var e = document.getElementById('MolPaintJS_Help_Widget');
            var content = decodeURI(molPaintJS.Resources['help.html'])
                .replace('data:text/html;charset=UTF-8,','');
            e.innerHTML = content
                .replaceAll('%HELP_URL%', helpURL); 
            e.style.display = 'block';
        }

        function actionIsotope (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var tool = ctx.getTools().isotopeTool;
            var tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp != "isotope") {
                tool.setType(tp);
            }
            ctx.setCurrentTool(tool);
        }

        function actionNitrogen (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("N"));
            ctx.setCurrentTool(ctx.getTools().nitrogenAtomTool);
        }

        function actionOxygen (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("O"));
            ctx.setCurrentTool(ctx.getTools().oxygenAtomTool);
        }

        /**
         * handle paste event of molecular data
         * Currently works only in recent Firefox browsers.
         */
        function actionPaste (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);;

            // Stop data actually being pasted into div
            evt.stopPropagation();
            evt.preventDefault();

            // Get pasted data via clipboard API
            var clipboardData = evt.clipboardData || window.clipboardData;
            if (clipboardData == null) {
                alert("Clipboard not supported in this browser.\n"
                    + "You might want to try the paste icon");
            }
            var pastedData = clipboardData.getData("text");
            ctx.pasteMolecule(pastedData, 2);
        }

        /**
         * Paste via paste icon.
         * Currently only supported in Chrome with AllowClipboard.
         */
        function actionPasteButton (evt) {
            try {
                var ctx = molPaintJS.getContext(evt.target.id);
                var clp = AllowClipboard.Client.ClipboardClient();
                clp.read(function (x, pastedData) {
                    ctx.pasteMolecule(pastedData);
                    // alert(pastedData); 
                });
            } catch (e) {
                console.log(e.message);
                alert("In Chrome, please install the 'AllowClipboard' extension.\n"
                    + "In other browsers, please try Ctrl+V in the drawing area.");
            }
        }

        function actionPointer (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().pointerTool);
        }

        function actionRadical (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var tool = ctx.getTools().radicalTool;
            ctx.setCurrentTool(tool);
            var tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp != "radical") {
                tool.setType(tp);
            }
            // ignore clicks to the radical icon if no radical type has been 
            // selected previously
            if (tool.getType() != "radical") {
                ctx.setCurrentTool(tool);
            }
        }

        function actionRedo (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getHistory().redo(ctx);
            ctx.draw();
        }

        function actionSingleBond (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().singleBondTool);
        }


        function actionSlide (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().slideTool);
        }

        function actionSolidWedge (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().solidWedgeTool);
        }

        function actionTemplate (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var tool = ctx.getTools().templateTool;
            var tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp == "template") {
                tp = ctx.getCurrentTemplate();
            } else {
                ctx.setCurrentTemplate(tp);
            }
            tool.setTemplate(tp, molPaintJS.getTemplate(tp));
            ctx.setCurrentTool(tool); 
        }

        function actionTripleBond (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().tripleBondTool);
        }

        function actionUndo (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getHistory().undo(ctx);
            ctx.draw();
        }

        function actionWavyBond (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().wavyBondTool);
        }

        function actionZoomIn (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getView().scaleDisplay(1.5);
            ctx.getView().scaleFontSize(1.5);
            ctx.draw();
        }

        function actionZoomOut (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getView().scaleDisplay(1.0/1.5);
            ctx.getView().scaleFontSize(1.0 / 1.5);
            ctx.draw();
        }


        /**
         * this method generates an img tag bearing id,
         * src, title and style. Usually this method will
         * be called with id and img being identical, submenu
         * buttons (bond menu) being an exception.
         */
        function item (id, img, title, style) {
            return "<img id='" + widgetId + "_" + id
                + "' width='" + iconSize + "' src='"
                + molPaintJS.Resources[img + '.png'] + "' title='"
                + title + "' class='" + style + "' />";
        }

        /**
         * element icons ("H", "C", "N", "O", ...)
         */
        function itemE (id, title, color) {
            return "<tr><td>"
                + "<div id='" + widgetId + "_" + id
                + "' class='molPaintJS-inactiveTool' style='height:"
                + iconSize + "px; width:" + iconSize
                + "px; line-height:" + iconSize + "px; color:" + color
                + "'>" + title + "</div></td></tr>";
        }

        function itemH (id, title, style) {
            return "<td>" + item(id, id, title, style) + "</td>";
        }

        function itemV (id, title, style) {
            return "<tr>" + itemH(id, title, style) + "</tr>";
        }

        function onClick (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var offset = ctx.getView().getOffset();
            var x = evt.clientX - offset.x;
            var y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onClick == 'function') {
                ctx.getCurrentTool().onClick(x, y, evt);
            }
        }

        function onMouseDown (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var offset = ctx.getView().getOffset();
            var x = evt.clientX - offset.x;
            var y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onMouseDown == 'function') {
                ctx.getCurrentTool().onMouseDown(x, y, evt);
            }
        }

        function onMouseMove (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var offset = ctx.getView().getOffset();
            var x = evt.clientX - offset.x;
            var y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onMouseMove == 'function') {
                ctx.getCurrentTool().onMouseMove(x, y, evt);
            }
        }

        function registerEvent (ctx, evt, w, a) {
            var id = ctx.contextId + w;
            var e = document.getElementById(id);
            molPaintJS.registerContext(id, ctx); 
            e.addEventListener(evt, a, false);
        }

        function renderBottomMenu () {
            return "";
        }

        function renderBondMenu () {
            return "<tr><td>"
                + "<div class='molPaintJS-leftDropdown'>"
                + "  <a href='javascript:void(0);' class='molPaintJS-dropbtn' "
                + "onclick=\"molPaintJS.setCurrentBond('" + widgetId + "');\" >"
                + item("currentBond", "single_bond", "", "molPaintJS-inactiveTool")
                + "</a><div class='molPaintJS-leftDropdown-content'>"
                + "<table><tr>"
                + itemH("single_bond", "Single bond", "molPaintJS-inactiveTool")
                + itemH("double_bond", "Double bond", "molPaintJS-inactiveTool")
                + itemH("triple_bond", "Triple bond", "molPaintJS-inactiveTool")
                + "    </tr><tr>"
                + itemH("solid_wedge", "Solid wedge", "molPaintJS-inactiveTool")
                + itemH("dashed_bond", "Dashed bond", "molPaintJS-inactiveTool")
                + itemH("wavy_bond", "Wavy bond", "molPaintJS-inactiveTool")
                + "    </tr><tr>"
                + itemH("hashed_wedge", "Hashed Wedge", "molPaintJS-inactiveTool")
                + "    <td></td><td></td></tr></table>"
                + "  </div>"
                + "</div>"
                + "</td></tr>";
        }

        function renderCanvas () {
            return "<canvas id='" + widgetId + "_canvas' width='" + width 
                + "' height='" + height + "' class='molPaintJS-canvas' contenteditable='true' >"
                + "Sorry, your browser does not support the canvas element."
                + "</canvas>";
        }

        function renderIsotopeMenu () {
            return "<tr><td>"
                + "<div class='molPaintJS-rightDropdown'>"
                + "  <a href='javascript:void(0);' class='molPaintJS-dropbtn'>"
                + item("isotope", "isotope_up", "Isotope menu", "molPaintJS-inactiveTool")
                + "</a><div class='molPaintJS-rightDropdown-content'>"
                + "<table>"
                + itemV("isotope_up", "Heavier isotope", "molPaintJS-inactiveTool")
                + itemV("isotope_down", "Lighter isotope", "molPaintJS-inactiveTool")
                + "</table>"
                + "  </div>"
                + "</div>"
                + "</td></tr>";
        }

        function renderLeftMenu () {
            return itemV("pointer", "Select, Translate, Rotate", "molPaintJS-activeTool")
                + itemV("eraser", "Eraser", "molPaintJS-inactiveTool")
                + renderBondMenu()
                + itemV("chain", "Chain", "molPaintJS-inactiveTool")
                + renderTemplateMenu()
                + itemV("plus", "Increment charge", "molPaintJS-inactiveTool")
                + itemV("minus", "Decrement charge", "molPaintJS-inactiveTool");
        }

        function renderPeriodicTable () {
            var header = "<tr><td>"
                + "<div class='molPaintJS-rightDropdown'>"
                + "<a href='javascript:void(0);' class='molPaintJS-dropbtn'><img id='"
                + widgetId + "_pse' src='" + molPaintJS.Resources['pse.png']
                + "' title='Periodic table' "
                + "width='" + iconSize + "' class='molPaintJS-inactiveTool' /></a>"
                + "  <div class='molPaintJS-rightDropdown-content'>"
                + "  <table class='molPaintJS-elementTable'>";

            var footer = "</table>"
                + "</div>"
                + "</div>"
                + "</td></tr>";

            var tbl = "<tr>";
            var period = 1;
            var group = 1;
            for (var isotopes of molPaintJS.Elements.getAllElements()) {
                if (isotopes.length == 0) {
                    // skip atomic number 0 (reserved for '*', 'R', ...)
                    continue;
                }
                var el = isotopes[0];
                if (el.getPeriod() > period) {
                    period = el.getPeriod();
                    group = 1;
                    tbl += "</tr><tr>";
                    if (period > 7) {
                        if (period == 8) {
                            tbl += "<td colspan='18' style='height:8px'></td></tr><tr>";
                        }
                        tbl += "<td colspan=2></td>";
                        group = 2;
                    }
                }
                var colspan = el.getGroup() - group - 1;
                group = el.getGroup();
                if (colspan > 0) {
                    tbl += "<td colspan='" + colspan + "'></td>";
                }
                tbl += "<td><a href='javascript:void(0)' "
                    + "class='molPaintJS-elementLink' "
                    + "onclick=\"molPaintJS.setElement('"
                    + widgetId + "','" + el.getSymbol()
                    + "');\"><span style='color: " + el.getColor()
                    + ";'>" + el.getSymbol() + "</span></a></td>";
            }
            tbl += "</tr>";

            return header + tbl + footer;
        }

        function renderRadicalMenu () {
            return "<tr><td>"
                + "<div class='molPaintJS-rightDropdown'>"
                + "  <a href='javascript:void(0);' class='molPaintJS-dropbtn' >"
                + item("radical", "radical", "Radicals menu", "molPaintJS-inactiveTool")
                + "</a><div class='molPaintJS-rightDropdown-content'>"
                + "<table><tr>"
                + itemH("no_radical", "no radical", "molPaintJS-inactiveTool")
                + itemH("singlet", "Singlet", "molPaintJS-inactiveTool")
                + "</tr><tr>"
                + itemH("doublet", "Doublet", "molPaintJS-inactiveTool")
                + itemH("triplet", "Triplet", "molPaintJS-inactiveTool")
                + "</tr>"
                + "</table>"
                + "  </div>"
                + "</div>"
                + "</td></tr>";
        }

        function renderRightMenu () {
            return renderPeriodicTable()
                + itemE("hydrogen", "H", molPaintJS.Elements.getElement("H").getColor())
                + itemE("carbon", "C", molPaintJS.Elements.getElement("C").getColor())
                + itemE("nitrogen", "N", molPaintJS.Elements.getElement("N").getColor())
                + itemE("oxygen", "O", molPaintJS.Elements.getElement("O").getColor())
                + itemE("customElement", "", "#000000")
                + renderIsotopeMenu()
                + renderRadicalMenu();
        }

        function renderTemplateMenu () {
            var ctx = molPaintJS.getContext(widgetId);
            var currentTemplate = ctx.getCurrentTemplate();

            var header = "<tr><td>"
                + "<div class='molPaintJS-leftDropdown'>"
                + " <a href='javascript:void(0);' class='molPaintJS-dropbtn' >"
                + item("template", currentTemplate, currentTemplate, "molPaintJS-inactiveTool")
                + "</a><div class='molPaintJS-leftDropdown-content'>"
                + "<table>";

            var body = "";
            var i = 0;
            for (var t of molPaintJS.getTemplates()) {

                if ((i % 5) == 0) {
                    body += "<tr>";
                }
                i++;
                body += itemH(t, t, "molPaintJS-inactiveTool");
                if ((i % 5) == 0) {
                    body += "</tr>";
                }
            }
            if ((i % 5) != 0) {
                while(i % 5) {
                    i++;
                    body += "<td></td>";
                }
                body += "</tr>";
            }

            var footer = "</table></div>"
                + "</div>"
                + "</td></tr>";

            return header + body + footer;
        }

        function renderTopMenu () {
            return itemH("clear", "Clear", "molPaintJS-defaultTool")
                + itemH("undo", "Undo", "molPaintJS-defaultTool")
                + itemH("redo", "Redo", "molPaintJS-defaultTool")
                + itemH("center", "Center", "molPaintJS-inactiveTool")
                + itemH("slide", "Slide", "molPaintJS-inactiveTool")
                + itemH("copy", "Copy", "molPaintJS-defaultTool")
                + itemH("paste", "Paste", "molPaintJS-defaultTool")
                + itemH("zoom_in", "Zoom in", "molPaintJS-defaultTool")
                + itemH("zoom_out", "Zoom out", "molPaintJS-defaultTool")
                + itemH("info", "Info", "molPaintJS-defaultTool");
        }

        return {
            /*
             * Event initialization
             */
            initEvents : function (ctx) {
                registerEvent(ctx, "click", "_center", actionCenter);
                registerEvent(ctx, "click", "_chain", actionChain);
                registerEvent(ctx, "click", "_minus", actionChargeDec);
                registerEvent(ctx, "click", "_plus", actionChargeInc);
                registerEvent(ctx, "click", "_copy", actionCopy);
                registerEvent(ctx, "click", "_clear", actionClear);
                registerEvent(ctx, "click", "_double_bond", actionDoubleBond);
                registerEvent(ctx, "click", "_eraser", actionEraser);
                registerEvent(ctx, "click", "_hashed_wedge", actionHashedWedge);
                registerEvent(ctx, "click", "_info", actionInfo);
                registerEvent(ctx, "click", "_isotope", actionIsotope);
                registerEvent(ctx, "click", "_isotope_down", actionIsotope);
                registerEvent(ctx, "click", "_isotope_up", actionIsotope);
                registerEvent(ctx, "click", "_paste", actionPasteButton);
                registerEvent(ctx, "click", "_pointer", actionPointer);
                registerEvent(ctx, "click", "_redo", actionRedo);
                registerEvent(ctx, "click", "_no_radical", actionRadical);
                registerEvent(ctx, "click", "_radical", actionRadical);
                registerEvent(ctx, "click", "_doublet", actionRadical);
                registerEvent(ctx, "click", "_singlet", actionRadical);
                registerEvent(ctx, "click", "_triplet", actionRadical);
                registerEvent(ctx, "click", "_single_bond", actionSingleBond);
                registerEvent(ctx, "click", "_slide", actionSlide);
                registerEvent(ctx, "click", "_solid_wedge", actionSolidWedge);
                registerEvent(ctx, "click", "_triple_bond", actionTripleBond);
                registerEvent(ctx, "click", "_template", actionTemplate);
                registerEvent(ctx, "click", "_undo", actionUndo);
                registerEvent(ctx, "click", "_wavy_bond", actionWavyBond);
                registerEvent(ctx, "click", "_zoom_in", actionZoomIn);
                registerEvent(ctx, "click", "_zoom_out", actionZoomOut);
                registerEvent(ctx, "click", "_canvas", onClick);
                registerEvent(ctx, "click", "_hydrogen", actionHydrogen);
                registerEvent(ctx, "click", "_carbon", actionCarbon);
                registerEvent(ctx, "click", "_nitrogen", actionNitrogen);
                registerEvent(ctx, "click", "_oxygen", actionOxygen);
                registerEvent(ctx, "click", "_customElement", actionCustomElement);
                registerEvent(ctx, "mousedown", "_canvas", onMouseDown);
                registerEvent(ctx, "mousemove", "_canvas", onMouseMove);
                registerEvent(ctx, "paste", "_canvas", actionPaste);

                for(var t of molpaint.getTemplates()) {
                    registerEvent(ctx, "click", "_" + t, actionTemplate);
                }
            },

            onCustomElement : function(evt) {
                actionCustomElement(evt);
            },

            /*
             * HTML generation
             */
            renderWidget : function () {
                if (! viewer) {
                    widgetObject.innerHTML = "<table><tr><td colspan=3><table>"
                        + "<tr>" + renderTopMenu() + "</tr></table></td></tr>"
                        + "<tr>"
                        + "<td class='molPaintJS-leftMenubar'><table>" + renderLeftMenu() + "</table></td>"
                        + "<td>" + renderCanvas() + "</td>"
                        + "<td class='molPaintJS-rightMenubar'><table>" + renderRightMenu() + "</table></td>"
                        + "</tr>"
                        + "<tr><td colspan=3><table>"
                        + "<tr>" + renderBottomMenu() + "</tr></table></td></tr>"
                        + "</table>"
                } else {
                    widgetObject.innerHTML = renderCanvas();
                }
            }
        };
    }
    return molpaintjs;
} (molPaintJS || {}));

