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

function Widget(contextId, prop, mp) {

    this.distMax = prop.distMax;
    this.molpaint = mp;
    this.iconSize = prop.iconSize;
    this.installPath = prop.installPath;
    this.height = prop.sizeY;
    this.widgetId = contextId;
    this.widgetObject = document.getElementById(contextId);
    this.width = prop.sizeX;
    this.viewer = (prop.viewer === 1);


    /*
     * Actions
     */
    this.actionCarbon = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.currentElement = Elements.instance.getElement("C");
        ctx.setCurrentTool(ctx.tools.carbonAtomTool);
    }

    this.actionCenter = function (evt) {
        var ctx = contextRegistry[evt.target.id];

    //
    // do not affect (atomic) coordinates -> no need for history
    //
    //  ctx.molecule.center();

        ctx.view.center();
        ctx.draw();
    }

    this.actionChain = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.chainTool);
    }

    this.actionChargeDec = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.chargeDecTool);
    }

    this.actionChargeInc = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.chargeIncTool);
    }

    this.actionCopy = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var w = new MDLv2000Writer();

        var dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.setAttribute("id", evt.target.id + "dummyId");
        document.getElementById(evt.target.id + "dummyId").value = w.write(ctx.molecule); 
        dummy.select();
        document.execCommand("copy");
        document.body.removeChild(dummy);
    }

    this.actionClear = function (evt) {
        var id = evt.target.id;
        var ctx = contextRegistry[id];
        var actionList = new ActionList();

        for (var a in ctx.molecule.getAtoms()) {
            actionList.addAction(new Action("DEL", "ATOM", null, ctx.molecule.getAtom(a)));
        }
        for (var b in ctx.molecule.getBonds()) {
            actionList.addAction(new Action("DEL", "BOND", null, ctx.molecule.getBond(b)));
        }

        ctx.history.appendAction(actionList);
        ctx.molecule = new Molecule();
        ctx.draw();
    }

    this.actionCustomElement = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var sym = ctx.currentElement.getSymbol();
        switch (sym) {
            case "H":
                ctx.setCurrentTool(ctx.tools.hydrogenAtomTool);
                break;
            case "C":
                ctx.setCurrentTool(ctx.tools.carbonAtomTool);
                break;
            case "N":
                ctx.setCurrentTool(ctx.tools.nitrogenAtomTool);
                break;
            case "O":
                ctx.setCurrentTool(ctx.tools.oxygenAtomTool);
                break;
            default:
                ctx.setCurrentTool(ctx.tools.customElementTool);
        }
    }

    this.actionEraser = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.eraserTool);
    }

    this.actionDoubleBond = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.doubleBondTool);
    }
    this.actionHashedWedge = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.hashedWedgeTool);
    }

    this.actionHydrogen = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.currentElement = Elements.instance.getElement("H");
        ctx.setCurrentTool(ctx.tools.hydrogenAtomTool);
    }

    this.actionInfo = function (evt) {
/* 
        Alterinatively could also dynamically add iframe to DOM (see actionCopy method):
        <iframe src="help/index.html" class="helpIframe">Iframe not supported</iframe>
*/
        window.open("help/index.html");
    }

    this.actionIsotope = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var tool = ctx.tools.isotopeTool;
        var tp = evt.target.id.replace(ctx.contextId + "_", "");
        if (tp != "isotope") {
            tool.setType(tp);
        }
        ctx.setCurrentTool(tool);
    }

    this.actionNitrogen = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.currentElement = Elements.instance.getElement("N");
        ctx.setCurrentTool(ctx.tools.nitrogenAtomTool);
    }

    this.actionOxygen = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.currentElement = Elements.instance.getElement("O");
        ctx.setCurrentTool(ctx.tools.oxygenAtomTool);
    }

    /**
     * handle paste event of molecular data
     * Currently works only in recent Firefox browsers.
     */
    this.actionPaste = function (evt) {
        var ctx = contextRegistry[evt.currentTarget.id];

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
    this.actionPasteButton = function (evt) {
        try {
            var ctx = contextRegistry[evt.target.id];
            var clp = new AllowClipboard.Client.ClipboardClient();
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

    this.actionPointer = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.pointerTool);
    }

    this.actionRadical = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var tool = ctx.tools.radicalTool;
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

    this.actionRedo = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.history.redo(ctx);
        ctx.draw();
    }

    this.actionSingleBond = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.singleBondTool);
    }


    this.actionSlide = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.slideTool);
    }

    this.actionSolidWedge = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.solidWedgeTool);
    }

    this.actionTemplate = function(evt) {
        var ctx = contextRegistry[evt.target.id];
        var tool = ctx.tools.templateTool;
        var tp = evt.target.id.replace(ctx.contextId + "_", "");
        if (tp == "template") {
            tp = ctx.currentTemplate;
        } else {
            ctx.currentTemplate = tp;
        }
        tool.setTemplate(tp, ctx.molpaint.getTemplate(tp));
        ctx.setCurrentTool(tool); 
    }

    this.actionTripleBond = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.setCurrentTool(ctx.tools.tripleBondTool);
    }

    this.actionUndo = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.history.undo(ctx);
        ctx.draw();
    }

    this.actionZoomIn = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.view.displayScale *= 1.5;
        ctx.view.scaleFontSize(1.5);
        ctx.draw();
    }

    this.actionZoomOut = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        ctx.view.displayScale /= 1.5;
        ctx.view.scaleFontSize(1.0 / 1.5);
        ctx.draw();
    }

    this.onClick = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var offset = ctx.view.getOffset();
        var x = evt.clientX - offset.x;
        var y = evt.clientY - offset.y;
        ctx.currentTool.onClick(x, y, evt);
    }

    this.onMouseDown = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var offset = ctx.view.getOffset();
        var x = evt.clientX - offset.x;
        var y = evt.clientY - offset.y;
        ctx.currentTool.onMouseDown(x, y, evt);
    }

    this.onMouseMove = function (evt) {
        var ctx = contextRegistry[evt.target.id];
        var offset = ctx.view.getOffset();
        var x = evt.clientX - offset.x;
        var y = evt.clientY - offset.y;
        ctx.currentTool.onMouseMove(x, y, evt);
    }

    /*
     * Event initialization
     */
    this.initEvents = function (ctx) {
        ctx.widget.registerEvent(ctx, "click", "_center", this.actionCenter);
        ctx.widget.registerEvent(ctx, "click", "_chain", this.actionChain);
        ctx.widget.registerEvent(ctx, "click", "_minus", this.actionChargeDec);
        ctx.widget.registerEvent(ctx, "click", "_plus", this.actionChargeInc);
        ctx.widget.registerEvent(ctx, "click", "_copy", this.actionCopy);
        ctx.widget.registerEvent(ctx, "click", "_clear", this.actionClear);
        ctx.widget.registerEvent(ctx, "click", "_double_bond", this.actionDoubleBond);
        ctx.widget.registerEvent(ctx, "click", "_eraser", this.actionEraser);
        ctx.widget.registerEvent(ctx, "click", "_hashed_wedge", this.actionHashedWedge);
        ctx.widget.registerEvent(ctx, "click", "_info", this.actionInfo);
        ctx.widget.registerEvent(ctx, "click", "_isotope", this.actionIsotope);
        ctx.widget.registerEvent(ctx, "click", "_isotope_down", this.actionIsotope);
        ctx.widget.registerEvent(ctx, "click", "_isotope_up", this.actionIsotope);
        ctx.widget.registerEvent(ctx, "click", "_paste", this.actionPasteButton);
        ctx.widget.registerEvent(ctx, "click", "_pointer", this.actionPointer);
        ctx.widget.registerEvent(ctx, "click", "_redo", this.actionRedo);
        ctx.widget.registerEvent(ctx, "click", "_no_radical", this.actionRadical);
        ctx.widget.registerEvent(ctx, "click", "_radical", this.actionRadical);
        ctx.widget.registerEvent(ctx, "click", "_doublet", this.actionRadical);
        ctx.widget.registerEvent(ctx, "click", "_singlet", this.actionRadical);
        ctx.widget.registerEvent(ctx, "click", "_triplet", this.actionRadical);
        ctx.widget.registerEvent(ctx, "click", "_single_bond", this.actionSingleBond);
        ctx.widget.registerEvent(ctx, "click", "_slide", this.actionSlide);
        ctx.widget.registerEvent(ctx, "click", "_solid_wedge", this.actionSolidWedge);
        ctx.widget.registerEvent(ctx, "click", "_triple_bond", this.actionTripleBond);
        ctx.widget.registerEvent(ctx, "click", "_template", this.actionTemplate);
        ctx.widget.registerEvent(ctx, "click", "_undo", this.actionUndo);
        ctx.widget.registerEvent(ctx, "click", "_zoom_in", this.actionZoomIn);
        ctx.widget.registerEvent(ctx, "click", "_zoom_out", this.actionZoomOut);
        ctx.widget.registerEvent(ctx, "click", "_canvas", this.onClick);
        ctx.widget.registerEvent(ctx, "click", "_hydrogen", this.actionHydrogen);
        ctx.widget.registerEvent(ctx, "click", "_carbon", this.actionCarbon);
        ctx.widget.registerEvent(ctx, "click", "_nitrogen", this.actionNitrogen);
        ctx.widget.registerEvent(ctx, "click", "_oxygen", this.actionOxygen);
        ctx.widget.registerEvent(ctx, "click", "_customElement", this.actionCustomElement);
        ctx.widget.registerEvent(ctx, "mousedown", "_canvas", this.onMouseDown);
        ctx.widget.registerEvent(ctx, "mousemove", "_canvas", this.onMouseMove);
        ctx.widget.registerEvent(ctx, "paste", "_canvas", this.actionPaste);

        for(var t in this.molpaint.getTemplates()) {
            ctx.widget.registerEvent(ctx, "click", "_" + t, this.actionTemplate);
        }
    }

    this.registerEvent = function (ctx, evt, w, a) {
        var id = this.widgetId + w;
        var e = document.getElementById(id);
        contextRegistry[id] = ctx;
        e.addEventListener(evt, a, false);
    }

    /*
     * HTML generation
     */
    this.renderWidget = function () {
        if (! this.viewer) {
            this.widgetObject.innerHTML = "<table><tr><td colspan=3><table>"
                + "<tr>" + this.renderTopMenu() + "</tr></table></td></tr>"
                + "<tr>"
                + "<td class='leftMenubar'><table>" + this.renderLeftMenu() + "</table></td>"
                + "<td>" + this.renderCanvas() + "</td>"
                + "<td class='rightMenubar'><table>" + this.renderRightMenu() + "</table></td>"
                + "</tr>"
                + "<tr><td colspan=3><table>"
                + "<tr>" + this.renderBottomMenu() + "</tr></table></td></tr>"
                + "</table>"
        } else {
            this.widgetObject.innerHTML = this.renderCanvas();
        }
    }

    /**
     * this method generates an img tag bearing id,
     * src, title and style. Usually this method will
     * be called with id and img being identical, submenu
     * buttons (bond menu) being an exception.
     */
    this.item = function (id, img, title, style) {
        return "<img id='" + this.widgetId + "_" + id
            + "' width='" + this.iconSize + "' src='"
            + this.installPath + "img/" + img + ".png' title='"
            + title + "' class='" + style + "' />";
    }

    /**
     * element icons ("H", "C", "N", "O", ...)
     */
    this.eItem = function (id, title, color) {
        return "<tr><td>"
            + "<div id='" + this.widgetId + "_" + id
            + "' class='inactiveTool' style='height:"
            + this.iconSize + "px; width:" + this.iconSize
            + "px; line-height:" + this.iconSize + "px; color:" + color
            + "'>" + title + "</div></td></tr>";
    }

    this.hItem = function (id, title, style) {
        return "<td>" + this.item(id, id, title, style) + "</td>";
    }

    this.vItem = function (id, title, style) {
        return "<tr>" + this.hItem(id, title, style) + "</tr>";
    }

    this.renderBottomMenu = function () {
        return "";
    }

    this.renderBondMenu = function () {
        return "<tr><td>"
            + "<div class='leftDropdown'>"
            + "  <a href='javascript:void(0);' class='dropbtn' "
            + "onclick=\"Widget.prototype.setCurrentBond('" + this.widgetId + "');\" >"
            + this.item("currentBond", "single_bond", "", "inactiveTool")
            + "</a><div class='leftDropdown-content'>"
            + "<table><tr>"
            + this.hItem("single_bond", "Single bond", "inactiveTool")
            + this.hItem("double_bond", "Double bond", "inactiveTool")
            + this.hItem("triple_bond", "Triple bond", "inactiveTool")
            + "    </tr><tr>"
            + this.hItem("solid_wedge", "Solid wedge", "inactiveTool")
            + this.hItem("dashed_bond", "Dashed bond", "inactiveTool")
            + this.hItem("wavy_bond", "Wavy bond", "inactiveTool")
            + "    </tr><tr>"
            + this.hItem("hashed_wedge", "Hashed Wedge", "inactiveTool")
            + "    <td></td><td></td></tr></table>"
            + "  </div>"
            + "</div>"
            + "</td></tr>";
    }

    this.renderCanvas = function () {
        return "<canvas id='" + this.widgetId + "_canvas' width='" + this.width 
            + "' height='" + this.height + "' class='canvas' contenteditable='true' >"
            + "Sorry, your browser does not support the canvas element."
            + "</canvas>";
    }

    this.renderIsotopeMenu = function () {
        return "<tr><td>"
            + "<div class='rightDropdown'>"
            + "  <a href='javascript:void(0);' class='dropbtn'>"
            + this.item("isotope", "isotope_up", "Isotope menu", "inactiveTool")
            + "</a><div class='rightDropdown-content'>"
            + "<table>"
            + this.vItem("isotope_up", "Heavier isotope", "inactiveTool")
            + this.hItem("isotope_down", "Lighter isotope", "inactiveTool")
            + "</table>"
            + "  </div>"
            + "</div>"
            + "</td></tr>";
    }

    this.renderLeftMenu = function () {
        return this.vItem("pointer", "Select, Translate, Rotate", "activeTool")
            + this.vItem("eraser", "Eraser", "inactiveTool")
            + this.renderBondMenu()
            + this.vItem("chain", "Chain", "inactiveTool")
            + this.renderTemplateMenu()
            + this.vItem("plus", "Increment charge", "inactiveTool")
            + this.vItem("minus", "Decrement charge", "inactiveTool");
    }

    this.renderPeriodicTable = function () {
        var header = "<tr><td>"
            + "<div class='rightDropdown'>"
            + "<a href='javascript:void(0);' class='dropbtn'><img id='"
            + this.widgetId + "_pse' src='img/pse.png' title='Periodic table' "
            + "width='" + this.iconSize + "' class='inactiveTool' /></a>"
            + "  <div class='rightDropdown-content'>"
            + "  <table class='elementTable'>";

        var footer = "</table>"
            + "</div>"
            + "</div>"
            + "</td></tr>";

        var tbl = "<tr>";
        var period = 1;
        var group = 1;
        for (var e in Elements.instance.elements) {
            var el = Elements.instance.elements[e][0];
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
                + "onclick=\"Widget.prototype.setElement('"
                + this.widgetId + "','" + el.getSymbol()
                + "');\"><span style='color: " + el.getColor()
                + ";'>" + el.getSymbol() + "</span></a></td>";
        }
        tbl += "</tr>";

        return header + tbl + footer;
    }

    this.renderRadicalMenu = function () {
        return "<tr><td>"
            + "<div class='rightDropdown'>"
            + "  <a href='javascript:void(0);' class='dropbtn' >"
            + this.item("radical", "radical", "Radicals menu", "inactiveTool")
            + "</a><div class='rightDropdown-content'>"
            + "<table><tr>"
            + this.hItem("no_radical", "no radical", "inactiveTool")
            + this.hItem("singlet", "Singlet", "inactiveTool")
            + "</tr><tr>"
            + this.hItem("doublet", "Doublet", "inactiveTool")
            + this.hItem("triplet", "Triplet", "inactiveTool")
            + "</tr>"
            + "</table>"
            + "  </div>"
            + "</div>"
            + "</td></tr>";
    }

    this.renderRightMenu = function () {
        return this.renderPeriodicTable()
            + this.eItem("hydrogen", "H", Elements.instance.getElement("H").getColor())
            + this.eItem("carbon", "C", Elements.instance.getElement("C").getColor())
            + this.eItem("nitrogen", "N", Elements.instance.getElement("N").getColor())
            + this.eItem("oxygen", "O", Elements.instance.getElement("O").getColor())
            + this.eItem("customElement", "", "#000000")
            + this.renderIsotopeMenu()
            + this.renderRadicalMenu();
    }

    this.renderTemplateMenu = function() {
        var ctx = contextRegistry[this.widgetId];
        var currentTemplate = ctx.currentTemplate;

        var header = "<tr><td>"
            + "<div class='leftDropdown'>"
            + " <a href='javascript:void(0);' class='dropbtn' >"
            + this.item("template", currentTemplate, currentTemplate, "inactiveTool")
            + "</a><div class='leftDropdown-content'>"
            + "<table>";

        var body = "";
        var i = 0;
        for (var t in this.molpaint.getTemplates()) {

            if ((i % 5) == 0) {
                body += "<tr>";
            }
            i++;
            body += this.hItem(t, t, "inactiveTool");
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

    this.renderTopMenu = function () {
        return this.hItem("clear", "Clear", "defaultTool")
            + this.hItem("undo", "Undo", "defaultTool")
            + this.hItem("redo", "Redo", "defaultTool")
            + this.hItem("center", "Center", "inactiveTool")
            + this.hItem("slide", "Slide", "inactiveTool")
            + this.hItem("copy", "Copy", "defaultTool")
            + this.hItem("paste", "Paste", "defaultTool")
            + this.hItem("zoom_in", "Zoom in", "defaultTool")
            + this.hItem("zoom_out", "Zoom out", "defaultTool")
            + this.hItem("info", "Info", "defaultTool");
    }

}

/*
 * static functions
 */
Widget.prototype.setElement = function (id, el) {
    var ctx = contextRegistry[id];
    ctx.currentElement = Elements.instance.getElement(el);
    ctx.widget.actionCustomElement({target: {id: id}});
    // alert(id + " ---> " + el);
}

Widget.prototype.setCurrentBond = function (id) {
    var ctx = contextRegistry[id];
    ctx.setCurrentTool(ctx.currentBondTool);
}

