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
        let ctx = molPaintJS.getContext(id);
        ctx.setCurrentElement(molPaintJS.Elements.getElement(el));
        ctx.getWidget().onCustomElement({target: {id: id}});
    }

    molpaintjs.setCurrentBond = function (id) {
        let ctx = molPaintJS.getContext(id);
        if (ctx != undefined) {
            ctx.setCurrentTool(ctx.getCurrentBondTool());
        }
    }

    molpaintjs.Widget = function(contextId, prop, mp) {

        let distMax = prop.distMax;
        let molpaint = mp;
        let iconSize = prop.iconSize;
        let height = prop.sizeY;
        let helpURL = prop.helpURL;
        let widgetId = contextId;
        let widgetObject = document.getElementById(contextId);
        let width = prop.sizeX;
        let viewer = (prop.viewer === 1);

        /*
         * Actions
         */
        function actionCarbon (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("C"));
            ctx.setCurrentTool(ctx.getTools().carbonAtomTool);
        }

        function actionCenter (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.getView().center();
            ctx.draw();
        }

        function actionChain (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chainTool);
        }

        function actionChargeDec (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chargeDecTool);
        }

        function actionChargeInc (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().chargeIncTool);
        }

        function actionCollection (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            molPaintJS.CollectionHandler(ctx.contextId).render();
        }

        function actionCopy (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let w = molPaintJS.MDLv2000Writer();

            let tempObj = document.createElement("textarea");
            document.body.appendChild(tempObj);
            tempObj.setAttribute("id", evt.target.id + "tempObjId");
            document.getElementById(evt.target.id + "tempObjId").value = w.write(ctx.getDrawing()); 
            tempObj.select();
            document.execCommand("copy");
            document.body.removeChild(tempObj);
        }

        function actionClear (evt) {
            let id = evt.target.id;
            let ctx = molPaintJS.getContext(evt.target.id);
            let actionList = molPaintJS.ActionList();

            let drawing = ctx.getDrawing();
            for (let a in drawing.getAtoms()) {
                actionList.addAction(molPaintJS.Action("DEL", "ATOM", null, drawing.getAtom(a)));
            }
            for (let b in drawing.getBonds()) {
                actionList.addAction(molPaintJS.Action("DEL", "BOND", null, drawing.getBond(b)));
            }

            ctx.getHistory().appendAction(actionList);
            ctx.setDrawingObject(molPaintJS.Drawing());
            ctx.draw();
        }

        function actionCustomElement (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let sym = ctx.getCurrentElement().getSymbol();
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
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().eraserTool);
        }

        function actionDoubleBond (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().doubleBondTool);
        }
        function actionHashedWedge (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().hashedWedgeTool);
        }

        function actionHydrogen (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("H"));
            ctx.setCurrentTool(ctx.getTools().hydrogenAtomTool);
        }

        function actionInfo (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let e = document.getElementById('MolPaintJS_Help_Widget');
            let content = decodeURI(molPaintJS.Resources['help.html'])
                .replace('data:text/html;charset=UTF-8,','');
            e.innerHTML = content
                .replaceAll('%HELP_URL%', helpURL)
                .replaceAll('%VERSION%', molPaintJS.Resources['version']); 
            e.style.display = 'block';
        }

        function actionIsotope (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let tool = ctx.getTools().isotopeTool;
            let tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp != "isotope") {
                tool.setType(tp);
            }
            ctx.setCurrentTool(tool);
        }

        function actionNitrogen (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("N"));
            ctx.setCurrentTool(ctx.getTools().nitrogenAtomTool);
        }

        function actionOxygen (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentElement(molPaintJS.Elements.getElement("O"));
            ctx.setCurrentTool(ctx.getTools().oxygenAtomTool);
        }

        /**
         * handle paste event of molecular data
         * Currently works only in recent Firefox browsers.
         */
        function actionPaste (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);;

            // Stop data actually being pasted into div
            evt.stopPropagation();
            evt.preventDefault();

            // Get pasted data via clipboard API
            let clipboardData = evt.clipboardData || window.clipboardData;
            if (clipboardData == null) {
                alert("Clipboard not supported in this browser.\n"
                    + "You might want to try the paste icon");
            }
            let pastedData = clipboardData.getData("text");
            ctx.pasteDrawing(pastedData, 2);
        }

        /**
         * Paste via paste icon.
         * Currently only supported in Chrome with AllowClipboard.
         */
        function actionPasteButton (evt) {
            try {
                let ctx = molPaintJS.getContext(evt.target.id);
                let clp = AllowClipboard.Client.ClipboardClient();
                clp.read(function (x, pastedData) {
                    ctx.pasteDrawing(pastedData);
                    // alert(pastedData); 
                });
            } catch (e) {
                console.log(e.message);
                alert("In Chrome, please install the 'AllowClipboard' extension.\n"
                    + "In other browsers, please try Ctrl+V in the drawing area.");
            }
        }

        function actionPointer (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().pointerTool);
        }

        function actionRadical (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let tool = ctx.getTools().radicalTool;
            ctx.setCurrentTool(tool);
            let tp = evt.target.id.replace(ctx.contextId + "_", "");
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
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.getHistory().redo(ctx);
            ctx.draw();
        }

        function actionSingleBond (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().singleBondTool);
        }


        function actionSlide (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().slideTool);
        }

        function actionSolidWedge (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().solidWedgeTool);
        }

        function actionTemplate (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let tool = ctx.getTools().templateTool;
            let tp = evt.target.id.replace(ctx.contextId + "_", "");
            if (tp == "template") {
                tp = ctx.getCurrentTemplate();
            } else {
                ctx.setCurrentTemplate(tp);
            }
            tool.setTemplate(tp, molPaintJS.getTemplate(tp));
            ctx.setCurrentTool(tool); 
        }

        function actionTripleBond (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().tripleBondTool);
        }

        function actionUndo (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.getHistory().undo(ctx);
            ctx.draw();
        }

        function actionWavyBond (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.setCurrentTool(ctx.getTools().wavyBondTool);
        }

        function actionZoomIn (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            ctx.getView().scaleDisplay(1.5);
            ctx.getView().scaleFontSize(1.5);
            ctx.draw();
        }

        function actionZoomOut (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
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
            let ctx = molPaintJS.getContext(evt.target.id);
            let offset = ctx.getView().getOffset();
            let x = evt.clientX - offset.x;
            let y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onClick == 'function') {
                ctx.getCurrentTool().onClick(x, y, evt);
            }
        }

        function onMouseDown (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let offset = ctx.getView().getOffset();
            let x = evt.clientX - offset.x;
            let y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onMouseDown == 'function') {
                ctx.getCurrentTool().onMouseDown(x, y, evt);
            }
        }

        function onMouseMove (evt) {
            let ctx = molPaintJS.getContext(evt.target.id);
            let offset = ctx.getView().getOffset();
            let x = evt.clientX - offset.x;
            let y = evt.clientY - offset.y;
            if (typeof ctx.getCurrentTool().onMouseMove == 'function') {
                ctx.getCurrentTool().onMouseMove(x, y, evt);
            }
        }

        function registerEvent (ctx, evt, w, a) {
            let id = ctx.contextId + w;
            let e = document.getElementById(id);
            molPaintJS.registerContext(id, ctx); 
            e.addEventListener(evt, a, false);
        }

        function renderAdvancedMenu () {
            return "<tr><td>"
                + "<div class='molPaintJS-leftDropdown'>"
                + "  <a href='javascript:void(0);' class='molPaintJS-dropbtn'>"
                + item("advanced", "advanced", "Advanced functions", "molPaintJS-inactiveTool")
                + "</a><div id='" + widgetId + "_advancedMenu' class='molPaintJS-leftDropdown-content'>"
                + "<table><tr>"

                + itemH("label", "Label tool", "molPaintJS-inactiveTool")
                + itemH("polymer", "Polymer tool", "molPaintJS-inactiveTool")
                + itemH("collection", "Manage collections", "molPaintJS-inactiveTool")

                + "</tr></table>"
                + "</div></div>"
                + "</td></tr>";
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
                + "</a><div id='" + widgetId + "_bondMenu' class='molPaintJS-leftDropdown-content'>"
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
                + "</a><div id='" + widgetId + "_isotopeMenu' class='molPaintJS-rightDropdown-content'>"
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
                + itemV("minus", "Decrement charge", "molPaintJS-inactiveTool")
                + renderAdvancedMenu();
        }

        function renderPeriodicTable () {
            let header = "<tr><td>"
                + "<div class='molPaintJS-rightDropdown'>"
                + "<a href='javascript:void(0);' class='molPaintJS-dropbtn'><img id='"
                + widgetId + "_pse' src='" + molPaintJS.Resources['pse.png']
                + "' title='Periodic table' "
                + "width='" + iconSize + "' class='molPaintJS-inactiveTool' /></a>"
                + "  <div  id='" + widgetId + "_pseMenu' class='molPaintJS-rightDropdown-content'>"
                + "  <table class='molPaintJS-elementTable'>";

            let footer = "</table>"
                + "</div>"
                + "</div>"
                + "</td></tr>";

            let tbl = "<tr>";
            let period = 1;
            let group = 1;
            for (let isotopes of molPaintJS.Elements.getAllElements()) {
                let el = isotopes[0];
                if (el.getAtomicNumber() == 0) {
                    // skip atomic number 0 (reserved for '*', 'R', ...)
                    continue;
                }
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
                let colspan = el.getGroup() - group - 1;
                group = el.getGroup();
                if (colspan > 0) {
                    tbl += "<td colspan='" + colspan + "'></td>";
                }
                tbl += "<td><a href='javascript:void(0)' "
                    + "id='" + widgetId + "_pse_" + el.getSymbol() + "' "
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
                + "</a><div id='" + widgetId + "_radicalMenu' class='molPaintJS-rightDropdown-content'>"
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
            let ctx = molPaintJS.getContext(widgetId);
            let currentTemplate = ctx.getCurrentTemplate();

            let header = "<tr><td>"
                + "<div class='molPaintJS-leftDropdown'>"
                + " <a href='javascript:void(0);' class='molPaintJS-dropbtn' >"
                + item("template", currentTemplate, currentTemplate, "molPaintJS-inactiveTool")
                + "</a><div id='" + widgetId + "_templateMenu' class='molPaintJS-leftDropdown-content'>"
                + "<table>";

            let body = "";
            let i = 0;
            for (let t of molPaintJS.getTemplates()) {

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

            let footer = "</table></div>"
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
                registerEvent(ctx, "click", "_collection", actionCollection);
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

                for(let t of molpaint.getTemplates()) {
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
                    widgetObject.innerHTML = "<div style='position: relative;'>"
                        + "<div id='" + widgetId + "_modalDlg' class='molPaintJS-modalDlg'></div>"
                        + "<table><tr><td colspan=3><table>"
                        + "<tr>" + renderTopMenu() + "</tr></table></td></tr>"
                        + "<tr>"
                        + "<td class='molPaintJS-leftMenubar'><table>" + renderLeftMenu() + "</table></td>"
                        + "<td>" + renderCanvas() + "</td>"
                        + "<td class='molPaintJS-rightMenubar'><table>" + renderRightMenu() + "</table></td>"
                        + "</tr>"
                        + "<tr><td colspan=3><table>"
                        + "<tr>" + renderBottomMenu() + "</tr></table></td></tr>"
                        + "</table>"
                        + "</div>"
                } else {
                    widgetObject.innerHTML = "<div id='" + widgetId + "_modalDlg' class='molPaintJS-modalDlg'></div>"
                        + renderCanvas();
                }
            }
        };
    }
    return molpaintjs;
} (molPaintJS || {}));

