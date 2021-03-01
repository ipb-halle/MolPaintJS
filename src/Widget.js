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
"use strict";

var molPaintJS = (function (molpaintjs) {

    molpaintjs.setElement = function (id, el) {
        var ctx = molPaintJS.getContext(id);
        ctx.currentElement = molPaintJS.Elements.getElement(el);
        ctx.widget.actionCustomElement({target: {id: id}});
    }

    molpaintjs.setCurrentBond = function (id) {
        var ctx = molPaintJS.getContext(id);
        if (ctx != undefined) {
            ctx.setCurrentTool(ctx.currentBondTool);
        }
    }

    molpaintjs.Widget = function(contextId, prop, mp) {

        var distMax = prop.distMax;
        var molpaint = mp;
        var iconSize = prop.iconSize;
        var installPath = prop.installPath;
        var height = prop.sizeY;
        var widgetId = contextId;
        var widgetObject = document.getElementById(contextId);
        var width = prop.sizeX;
        var viewer = (prop.viewer === 1);

        /*
         * Actions
         */
        actionCarbon = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.currentElement = molPaintJS.Elements.getElement("C");
            ctx.setCurrentTool(ctx.getTools().carbonAtomTool);
        }

        actionCenter = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);

        //
        // do not affect (atomic) coordinates -> no need for history
        //
        //  ctx.molecule.center();

            ctx.getView().center();
            ctx.draw();
        }

        actionChain = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chainTool);
        }

        actionChargeDec = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chargeDecTool);
        }

        actionChargeInc = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chargeIncTool);
        }

        actionCopy = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var w = molPaintJS.MDLv2000Writer();

            var dummy = document.createElement("textarea");
            document.body.appendChild(dummy);
            dummy.setAttribute("id", evt.target.id + "dummyId");
            document.getElementById(evt.target.id + "dummyId").value = w.write(ctx.molecule); 
            dummy.select();
            document.execCommand("copy");
            document.body.removeChild(dummy);
        }

        actionClear = function (evt) {
            var id = evt.target.id;
            var ctx = molPaintJS.getContext(evt.target.id);
            var actionList = molPaintJS.ActionList();

            for (var a in ctx.molecule.getAtoms()) {
                actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, ctx.molecule.getAtom(a)));
            }
            for (var b in ctx.molecule.getBonds()) {
                actionList.addAction(molPaintJS.Action("DEL", "BOND", null, ctx.molecule.getBond(b)));
            }

            ctx.getHistory().appendAction(actionList);
            ctx.molecule = molPaintJS.Molecule();
            ctx.draw();
        }

        actionCustomElement = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var sym = ctx.currentElement.getSymbol();
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

        actionEraser = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().eraserTool);
        }

        actionDoubleBond = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().doubleBondTool);
        }
        actionHashedWedge = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().hashedWedgeTool);
        }

        actionHydrogen = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.currentElement = molPaintJS.Elements.getElement("H");
            ctx.setCurrentTool(ctx.getTools().hydrogenAtomTool);
        }

        actionInfo = function (evt) {
    /* 
            Alterinatively could also dynamically add iframe to DOM (see actionCopy method):
            <iframe src="help/index.html" class="helpIframe">Iframe not supported</iframe>
    */
            var ctx = molPaintJS.getContext(evt.target.id);
            var e = document.getElementById('MolPaintJS_Help_Widget');
            var content = decodeURI(molPaintJS_resources['help.html'])
                .replace('data:text/html;charset=UTF-8,','');
            e.innerHTML = content
                .replaceAll('%HELP_URL%', ctx.properties['helpURL']);
            e.style.display = 'block';
        }

        actionIsotope = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var tool = ctx.getTools().isotopeTool;
            var tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp != "isotope") {
                tool.setType(tp);
            }
            ctx.setCurrentTool(tool);
        }

        actionNitrogen = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.currentElement = molPaintJS.Elements.getElement("N");
            ctx.setCurrentTool(ctx.getTools().nitrogenAtomTool);
        }

        actionOxygen = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.currentElement = molPaintJS.Elements.getElement("O");
            ctx.setCurrentTool(ctx.getTools().oxygenAtomTool);
        }

        /**
         * handle paste event of molecular data
         * Currently works only in recent Firefox browsers.
         */
        actionPaste = function (evt) {
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
        actionPasteButton = function (evt) {
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

        actionPointer = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().pointerTool);
        }

        actionRadical = function (evt) {
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

        actionRedo = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getHistory().redo(ctx);
            ctx.draw();
        }

        actionSingleBond = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().singleBondTool);
        }


        actionSlide = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().slideTool);
        }

        actionSolidWedge = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().solidWedgeTool);
        }

        actionTemplate = function(evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var tool = ctx.getTools().templateTool;
            var tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp == "template") {
                tp = ctx.currentTemplate;
            } else {
                ctx.currentTemplate = tp;
            }
            tool.setTemplate(tp, molPaintJS.getTemplate(tp));
            ctx.setCurrentTool(tool); 
        }

        actionTripleBond = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().tripleBondTool);
        }

        actionUndo = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getHistory().undo(ctx);
            ctx.draw();
        }

        actionWavyBond = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().wavyBondTool);
        }

        actionZoomIn = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            ctx.getView().scaleDisplay(1.5);
            ctx.getView().scaleFontSize(1.5);
            ctx.draw();
        }

        actionZoomOut = function (evt) {
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
        item = function (id, img, title, style) {
            return "<img id='" + widgetId + "_" + id
                + "' width='" + iconSize + "' src='"
                + molPaintJS_resources[img + '.png'] + "' title='"
                + title + "' class='" + style + "' />";
        }

        /**
         * element icons ("H", "C", "N", "O", ...)
         */
        itemE = function (id, title, color) {
            return "<tr><td>"
                + "<div id='" + widgetId + "_" + id
                + "' class='inactiveTool' style='height:"
                + iconSize + "px; width:" + iconSize
                + "px; line-height:" + iconSize + "px; color:" + color
                + "'>" + title + "</div></td></tr>";
        }

        itemH = function (id, title, style) {
            return "<td>" + item(id, id, title, style) + "</td>";
        }

        itemV = function (id, title, style) {
            return "<tr>" + itemH(id, title, style) + "</tr>";
        }

        onClick = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var offset = ctx.getView().getOffset();
            var x = evt.clientX - offset.x;
            var y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onClick == 'function') {
                ctx.getCurrentTool().onClick(x, y, evt);
            }
        }

        onMouseDown = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var offset = ctx.getView().getOffset();
            var x = evt.clientX - offset.x;
            var y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onMouseDown == 'function') {
                ctx.getCurrentTool().onMouseDown(x, y, evt);
            }
        }

        onMouseMove = function (evt) {
            var ctx = molPaintJS.getContext(evt.target.id);
            var offset = ctx.getView().getOffset();
            var x = evt.clientX - offset.x;
            var y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onMouseMove == 'function') {
                ctx.getCurrentTool().onMouseMove(x, y, evt);
            }
        }

        registerEvent = function (ctx, evt, w, a) {
            var id = ctx.contextId + w;
            var e = document.getElementById(id);
            molPaintJS.registerContext(id, ctx); 
            e.addEventListener(evt, a, false);
        }

        renderBottomMenu = function () {
            return "";
        }

        renderBondMenu = function () {
            return "<tr><td>"
                + "<div class='leftDropdown'>"
                + "  <a href='javascript:void(0);' class='dropbtn' "
                + "onclick=\"molPaintJS.setCurrentBond('" + widgetId + "');\" >"
                + item("currentBond", "single_bond", "", "inactiveTool")
                + "</a><div class='leftDropdown-content'>"
                + "<table><tr>"
                + itemH("single_bond", "Single bond", "inactiveTool")
                + itemH("double_bond", "Double bond", "inactiveTool")
                + itemH("triple_bond", "Triple bond", "inactiveTool")
                + "    </tr><tr>"
                + itemH("solid_wedge", "Solid wedge", "inactiveTool")
                + itemH("dashed_bond", "Dashed bond", "inactiveTool")
                + itemH("wavy_bond", "Wavy bond", "inactiveTool")
                + "    </tr><tr>"
                + itemH("hashed_wedge", "Hashed Wedge", "inactiveTool")
                + "    <td></td><td></td></tr></table>"
                + "  </div>"
                + "</div>"
                + "</td></tr>";
        }

        renderCanvas = function () {
            return "<canvas id='" + widgetId + "_canvas' width='" + width 
                + "' height='" + height + "' class='canvas' contenteditable='true' >"
                + "Sorry, your browser does not support the canvas element."
                + "</canvas>";
        }

        renderIsotopeMenu = function () {
            return "<tr><td>"
                + "<div class='rightDropdown'>"
                + "  <a href='javascript:void(0);' class='dropbtn'>"
                + item("isotope", "isotope_up", "Isotope menu", "inactiveTool")
                + "</a><div class='rightDropdown-content'>"
                + "<table>"
                + itemV("isotope_up", "Heavier isotope", "inactiveTool")
                + itemV("isotope_down", "Lighter isotope", "inactiveTool")
                + "</table>"
                + "  </div>"
                + "</div>"
                + "</td></tr>";
        }

        renderLeftMenu = function () {
            return itemV("pointer", "Select, Translate, Rotate", "activeTool")
                + itemV("eraser", "Eraser", "inactiveTool")
                + renderBondMenu()
                + itemV("chain", "Chain", "inactiveTool")
                + renderTemplateMenu()
                + itemV("plus", "Increment charge", "inactiveTool")
                + itemV("minus", "Decrement charge", "inactiveTool");
        }

        renderPeriodicTable = function () {
            var header = "<tr><td>"
                + "<div class='rightDropdown'>"
                + "<a href='javascript:void(0);' class='dropbtn'><img id='"
                + widgetId + "_pse' src='" + molPaintJS_resources['pse.png']
                + "' title='Periodic table' "
                + "width='" + iconSize + "' class='inactiveTool' /></a>"
                + "  <div class='rightDropdown-content'>"
                + "  <table class='elementTable'>";

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
                    + "class='elementLink' "
                    + "onclick=\"molPaintJS.setElement('"
                    + widgetId + "','" + el.getSymbol()
                    + "');\"><span style='color: " + el.getColor()
                    + ";'>" + el.getSymbol() + "</span></a></td>";
            }
            tbl += "</tr>";

            return header + tbl + footer;
        }

        renderRadicalMenu = function () {
            return "<tr><td>"
                + "<div class='rightDropdown'>"
                + "  <a href='javascript:void(0);' class='dropbtn' >"
                + item("radical", "radical", "Radicals menu", "inactiveTool")
                + "</a><div class='rightDropdown-content'>"
                + "<table><tr>"
                + itemH("no_radical", "no radical", "inactiveTool")
                + itemH("singlet", "Singlet", "inactiveTool")
                + "</tr><tr>"
                + itemH("doublet", "Doublet", "inactiveTool")
                + itemH("triplet", "Triplet", "inactiveTool")
                + "</tr>"
                + "</table>"
                + "  </div>"
                + "</div>"
                + "</td></tr>";
        }

        renderRightMenu = function () {
            return renderPeriodicTable()
                + itemE("hydrogen", "H", molPaintJS.Elements.getElement("H").getColor())
                + itemE("carbon", "C", molPaintJS.Elements.getElement("C").getColor())
                + itemE("nitrogen", "N", molPaintJS.Elements.getElement("N").getColor())
                + itemE("oxygen", "O", molPaintJS.Elements.getElement("O").getColor())
                + itemE("customElement", "", "#000000")
                + renderIsotopeMenu()
                + renderRadicalMenu();
        }

        renderTemplateMenu = function() {
            var ctx = molPaintJS.getContext(widgetId);
            var currentTemplate = ctx.currentTemplate;

            var header = "<tr><td>"
                + "<div class='leftDropdown'>"
                + " <a href='javascript:void(0);' class='dropbtn' >"
                + item("template", currentTemplate, currentTemplate, "inactiveTool")
                + "</a><div class='leftDropdown-content'>"
                + "<table>";

            var body = "";
            var i = 0;
            for (var t of molPaintJS.getTemplates()) {

                if ((i % 5) == 0) {
                    body += "<tr>";
                }
                i++;
                body += itemH(t, t, "inactiveTool");
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

        renderTopMenu = function () {
            return itemH("clear", "Clear", "defaultTool")
                + itemH("undo", "Undo", "defaultTool")
                + itemH("redo", "Redo", "defaultTool")
                + itemH("center", "Center", "inactiveTool")
                + itemH("slide", "Slide", "inactiveTool")
                + itemH("copy", "Copy", "defaultTool")
                + itemH("paste", "Paste", "defaultTool")
                + itemH("zoom_in", "Zoom in", "defaultTool")
                + itemH("zoom_out", "Zoom out", "defaultTool")
                + itemH("info", "Info", "defaultTool");
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

            /*
             * HTML generation
             */
            renderWidget : function () {
                if (! viewer) {
                    widgetObject.innerHTML = "<table><tr><td colspan=3><table>"
                        + "<tr>" + renderTopMenu() + "</tr></table></td></tr>"
                        + "<tr>"
                        + "<td class='leftMenubar'><table>" + renderLeftMenu() + "</table></td>"
                        + "<td>" + renderCanvas() + "</td>"
                        + "<td class='rightMenubar'><table>" + renderRightMenu() + "</table></td>"
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

