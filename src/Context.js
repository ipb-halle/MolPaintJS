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

var contextRegistry = {};

function Context(cid, prop, mp) {

    /* this is the main class */

    this.contextId = cid;
    this.molpaint = mp;
    this.properties = new DefaultProperties(prop);
    this.changeListener = null;
    this.currentElement = Elements.instance.getElement("C");
    this.currentTemplate = Object.keys(mp.getTemplates())[0]; 

    this.medianBondLength = 1.5;
    this.rasterX = [];
    this.rasterY = [];

    this.tools = null;
    this.currentTool = null;
    this.currentBondTool = null;

    this.history = new History(cid, this.properties);
    this.molecule = new Molecule();

    contextRegistry[cid] = this;

    this.view = new View(cid, this.properties);
    this.widget = new Widget(cid, this.properties, mp);
    this.widget.renderWidget();

    /*
     * Method definitions
     */
    this.debug = function (msg) {
        if(this.properties.debugId != null) {
            var e = document.getElementById(this.properties.debugId);
            e.innerHTML = msg;
        }
    }

    this.draw = function () {
        var d = new Draw(this.view, this.molecule);
        d.draw();
        if (this.changeListener != null) {
            changeListener();
        }
    }

    this.getHistory = function () {
        return this.history;
    }
    this.getMolecule = function () {
        return this.molecule;
    }
    this.getView = function () {
        return this.view;
    }

    /**
     * asynchronous initialization of the mol editor
     */
    this.init = function () {
        var ctx = this;
        this.setupTools(this.properties);
        var p = new Promise(function (resolve, reject) {
            window.setTimeout(function () {
                resolve(ctx);
            }, 120);
        });
        p.then(function (ctx) {
            ctx.view.init();
            if(ctx.properties.viewer != "1") {
                ctx.history.updateIcons();
                ctx.setCurrentTool(ctx.tools.pointerTool);
                ctx.widget.initEvents(ctx);
            }
            ctx.initRaster();
            ctx.draw();
        });
    }

    /**
     * compute median bond length and init raster of bond angles
     */
    this.initRaster = function() {
        this.medianBondLength = this.molecule.computeBondLengths();

        for(var i=0; i<15; i++) {
            this.rasterX[i] = Math.cos(i * Math.PI / 6.0) * this.medianBondLength;
            this.rasterY[i] = Math.sin(i * Math.PI / 6.0) * this.medianBondLength;
        }
    }


    /**
     * Paste a molecule (from clipboard) into the
     * current molecule. Update the history accordingly.
     * @param st the molecule string (MDL mol, ...)
     * @param sel the selection bits to set for the pasted molecule
     * @return the already appended (!) actionList 
     */
    this.pasteMolecule = function (st, sel) {
        var mol = MDLParser.parse(st);
        var actionList = new ActionList();

        // add atoms
        var atoms = mol.getAtoms();
        for (var i in atoms) {
            var a = atoms[i];
            a.selected = sel;
            this.molecule.addAtom(a, null);
            actionList.addAction(new Action("ADD", "ATOM", a, null));
        }

        // add bonds
        var bonds = mol.getBonds();
        for (var i in bonds) {
            var b = bonds[i];
            b.selected = sel;
            this.molecule.addBond(b, null);
            actionList.addAction(new Action("ADD", "BOND", b, null));
        }
        this.history.appendAction(actionList);
    
        this.initRaster();
        this.draw();
        return actionList;
    }

    /**
     * set a changeListener which is called each time 
     * the molecule is changed
     * @param listener the function to be executed on each change
     */
    this.setChangeListener = function (listener) {
        this.changeListener = listener;
        return this;
    }

    /**
     * call the abort() method of currentTool
     * and set currentTool to the new tool. Initialize
     * the new tool by calling Tools.setup(tool).
     * @param tool the new tool
     * @return this instance of Context
     */
    this.setCurrentTool = function (tool) {
        this.currentTool.abort();
        this.currentTool = tool;
        Tools.setup(tool);
    }

    /**
     * @return this Context instance (useful for method chaining)
     */
    this.setMolecule = function (st) {
        this.molecule = MDLParser.parse(st);

        this.molecule.center();
        this.view.center();

        this.initRaster();
        this.view.setMolScale(this.properties.molScaleDefault / this.medianBondLength);
        return this;
    }

    /**
     * depending on the value of properties.viewer, set up 
     * the individual tools
     */
    this.setupTools = function () {
        if(this.properties.viewer != "1") {
            this.tools = { pointerTool: new PointerTool(this, this.properties),
              slideTool: new SlideTool(this),
              eraserTool: new EraserTool(this, this.properties),
              singleBondTool: new BondTool(this, this.properties, 1, "0", "single_bond"),
              doubleBondTool: new BondTool(this, this.properties, 2, "0", "double_bond"),
              tripleBondTool: new BondTool(this, this.properties, 3, "0", "triple_bond"),
              solidWedgeTool: new BondTool(this, this.properties, 1, "1", "solid_wedge"),
              hashedWedgeTool: new BondTool(this, this.properties, 1, "6", "hashed_wedge"),
              isotopeTool: new IsotopeTool(this, this.properties),
              radicalTool: new RadicalTool(this, this.properties), 
              chainTool: new ChainTool(this, this.properties),
              chargeIncTool: new ChargeIncTool(this, this.properties),
              chargeDecTool: new ChargeDecTool(this, this.properties),
              hydrogenAtomTool: new AtomTool(this, this.properties, "hydrogen"),
              carbonAtomTool: new AtomTool(this, this.properties, "carbon"),
              nitrogenAtomTool: new AtomTool(this, this.properties, "nitrogen"),
              oxygenAtomTool: new AtomTool(this, this.properties, "oxygen"),
              customElementTool: new AtomTool(this, this.properties, "customElement"), 
              templateTool: new TemplateTool(this, this.properties, "template") };

            this.currentTool = this.tools.pointerTool;
            this.currentBondTool = this.tools.singleBondTool;
            this.tools.templateTool.setTemplate(
                this.currentTemplate, 
                this.molpaint.getTemplate(this.currentTemplate));
        } else {
            this.tools = { nullTool : new NullTool(this) };
            this.currentTool = this.tools.nullTool;
            this.currentBondTool = this.tools.nullTool;
        }
    }
}
