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

    /*
     * variables and constructor 
     */
    let contextRegistry = {};
    let properties = molpaintjs.DefaultProperties();
    let templates = [ 'benzene', 'cyclohexane', 'cyclopentane' ];

    /**
     * load a template 
     * @param t the template
     */
    function loadTemplate (t, url) {
        let that = this;
        let tp = t;
        let request = new XMLHttpRequest();
        request.open('GET',url, true);
        request.overrideMimeType('text/html');
        request.send(null);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                molPaintJS.Resources[tp + ".mol"] = btoa(request.responseText);
            } 
        }
    }

    molpaintjs.Elements = molPaintJS.Elements().initElements();

    /**
     * add a list of templates to the current instance
     * @param templateConfig an array of config objects [ {key:"Asn", molURL:"asparagine.mol", iconURL:"asparagine.png"} , ... ]
     */
    molpaintjs.addTemplates = function (templateConfig) {
        for (let cfg of templateConfig) {
            molPaintJS.Resources[cfg.key + ".png"] = cfg.iconURL;
            loadTemplate(cfg.key, cfg.molURL);
        }
    }

    molpaintjs.createCSS = function(prop) {
        let e = document.getElementById("MolPaintJS_CSS");
        if (e == null) {
            e = document.createElement("link");
            e.id = "MolPaintJS_CSS";
            e.rel = "stylesheet";
            e.href = molPaintJS.Resources['styles.css'];
            document.head.appendChild(e);
            // optionally add FontAwesome Icons
            let fontAwesomePath = properties.getProperty("FontAwesomePath");
            if (fontAwesomePath != null) {
                e = document.createElement("link");
                e.id = "MolPaintJS_FontAwesome";
                e.rel = "stylesheet";
                e.href = fontAwesomePath + "fontawesome.min.css";
                document.head.appendChild(e);
                e = document.createElement("link");
                e.id = "MolPaintJS_FontAwesome";
                e.rel = "stylesheet";
                e.href = fontAwesomePath + "solid.min.css";
                document.head.appendChild(e);

            }
        }
    }

    molpaintjs.createHelpWidget = function() {
        let e = document.getElementById("MolPaintJS_Help_Widget");
        if (e == null) {
            e = document.createElement("div");
            e.id = "MolPaintJS_Help_Widget";
            e.classList.add("molPaintJS-modalHelp");
            document.body.appendChild(e);
        }
    }

    /**
     * destroy the context and do clean up
     */
    molpaintjs.destroy = function (cid) {
        let context = contextRegistry[cid];
        for (let id of context.getRegisteredIds()) {
            delete contextRegistry[id];
        }
        let o = document.getElementById(context.contextId);
        o.innerHTML = "";
    }

    /**
     * replace the content of a HTML element with id "dumpId"
     * by the chemical drawing in MDLv2000 format from the editor with
     * context id "cid".
     */
    molpaintjs.dump = function (cid, dumpId) {
        let o = document.getElementById(dumpId);
        let format = arguments[2] || 'V2000';
        let moltext = '';

        try {
            switch(format) {
                case 'V3000':
                    moltext = this.getMDLv3000(cid) + "\n";
                    break;
                case 'V2000':
                    moltext = this.getMDLv2000(cid) + "\n";
                    break;
                default :
                    moltext = "Unknown output format: " + format;
            }
        } catch (e) {
            moltext = e.message;
        }
        o.innerHTML = "<pre>\n" + moltext + "\n</pre>";
    }

    /**
     * return the context for a given context id
     */
    molpaintjs.getContext = function (cid) {
        return contextRegistry[cid];
    }

    molpaintjs.getDialog = function (cid) {
        return contextRegistry[cid].getDialog();
    }

    /**
     * return the current date in MMDDYYhhmm format as specified for MDL header line
     */
    molpaintjs.getMDLDateCode = function () {
        let date = new Date();
        let part = date.getMonth() + 1;
        let st = ((part < 10) ? "0" + part : "" + part);
        part = date.getDate();
        st += ((part < 10) ? "0" + part : "" + part);
        part = date.getFullYear();
        st += (part + "").substring(2);
        part = date.getHours();
        st += ((part < 10) ? "0" + part : "" + part);
        part = date.getMinutes();
        st += ((part < 10) ? "0" + part : "" + part);
        return st;
    }

    /**
     * @return the drawing from context cid in MDLv2000 format
     */
    molpaintjs.getMDLv2000 = function (cid) { 
        let w = this.MDLv2000Writer();
        return w.write(contextRegistry[cid].getDrawing());
    }

    /**
     * @return the drawing from context cid in MDLv3000 format
     */
    molpaintjs.getMDLv3000 = function (cid) {
        let w = this.MDLv3000Writer();
        return w.write(contextRegistry[cid].getDrawing());
    }

    /**
     * @return global properties
     */
    molpaintjs.getProperties = function () {
        return properties.getProperties();
    }

    /**
     * @param t the name of the template
     * @return return the formatted input string for template t
     */
    molpaintjs.getTemplate = function (t) {
        return atob(molPaintJS.Resources[t + '.mol']);
    }

    /**
     * @return the list of template keys
     */
    molpaintjs.getTemplates = function () {
        return templates;
    }

    /**
     * @return version information
     */
    molpaintjs.getVersion = function () {
        return molPaintJS.Resources['version'];
    }

    /**
     * create a new context
     */
    molpaintjs.newContext = function (cid, prop) {
        let ctx = molPaintJS.Context(cid, prop, this);
        ctx.render();
        return ctx;
    }

    /**
     * register a new context (i.e. for events)
     */
    molpaintjs.registerContext = function (id, ctx) {
        contextRegistry[id] = ctx;
        ctx.registerId(id);
    }

    /**
     * set a global (default) property
     */
    molpaintjs.setProperty = function (prop, value) {
        properties.setProperty(prop, value);
    }

    /**
     * allows to configure the order of templates
     * @param tp  array of template names
     */
    molpaintjs.setTemplates = function (tp) { 
        templates = [];
        for(let t of tp) {
            if (molPaintJS.Resources[t + '.png'] != null) {
                // drawing might be delayed because of asynchronous load
                templates.push(t);
            } else {
                console.log("Missing resources for template key: " + t);
            }
        }
    }

    if (typeof module === "object" && module.exports) {
        module.exports = molPaintJS;
    }
    
    return molpaintjs;
}(molPaintJS || {}));

