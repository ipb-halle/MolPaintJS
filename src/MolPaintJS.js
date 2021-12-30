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
    var contextRegistry = {};
    var properties = molpaintjs.DefaultProperties();
    var templates = [ 'benzene', 'cyclohexane', 'cyclopentane' ];


    /**
     * load a template 
     * @param t the template
     */
    function loadTemplate (t, url) {
        var that = this;
        var tp = t;
        var request = new XMLHttpRequest();
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
        for (var cfg of templateConfig) {
            molPaintJS.Resources[cfg.key + ".png"] = cfg.iconURL;
            loadTemplate(cfg.key, cfg.molURL);
        }
    }

    molpaintjs.createCSS = function() {
        var e = document.getElementById("MolPaintJS_CSS");
        if (e == null) {
            e = document.createElement("link");
            e.id = "MolPaintJS_CSS";
            e.rel = "stylesheet";
            e.href = molPaintJS.Resources['styles.css'];
            document.head.appendChild(e);
        }
    },

    molpaintjs.createHelpWidget = function() {
        var e = document.getElementById("MolPaintJS_Help_Widget");
        if (e == null) {
            e = document.createElement("div");
            e.id = "MolPaintJS_Help_Widget";
            e.classList.add("molPaintJS-modalHelp");
            document.body.appendChild(e);
        }
    },

    /**
     * replace the content of a HTML element with id "dumpId"
     * by the molecule in MDLv2000 format from the editor with
     * context id "cid".
     */
    molpaintjs.dump = function (cid, dumpId) {
        var o = document.getElementById(dumpId);
        var format = arguments[2] || 'V2000';
        var moltext = '';

        switch(format) {
            case 'V3000':
                moltext = this.getMDLv3000(cid);
                break;
            case 'V2000':
                moltext = this.getMDLv2000(cid);
                break;
            default :
                moltext = "Unknown output format: " + format;
        }
        o.innerHTML = "<pre>" + moltext + "</pre>";
    },

    /**
     * return the context for a given context id
     */
    molpaintjs.getContext = function (cid) {
        return contextRegistry[cid];
    },

    /**
     * return the current date in MMDDYYhhmm format as specified for MDL header line
     */
    molpaintjs.getMDLDateCode = function () {
        var date = new Date();
        var part = date.getMonth() + 1;
        var st = ((part < 10) ? "0" + part : "" + part);
        part = date.getDate();
        st += ((part < 10) ? "0" + part : "" + part);
        part = date.getFullYear();
        st += (part + "").substring(2);
        part = date.getHours();
        st += ((part < 10) ? "0" + part : "" + part);
        part = date.getMinutes();
        st += ((part < 10) ? "0" + part : "" + part);
        return st;
    },

    /**
     * @return the molecule from context cid in MDLv2000 format
     */
    molpaintjs.getMDLv2000 = function (cid) { 
        var w = this.MDLv2000Writer();
        return w.write(contextRegistry[cid].getMolecule());
    },

    /**
     * @return the molecule from context cid in MDLv3000 format
     */
    molpaintjs.getMDLv3000 = function (cid) {
        var w = this.MDLv3000Writer();
        return w.write(contextRegistry[cid].getMolecule());
    },

    /**
     * @return global properties
     */
    molpaintjs.getProperties = function () {
        return properties.getProperties();
    },

    /**
     * @param t the name of the template
     * @return return the molecule string for template t
     */
    molpaintjs.getTemplate = function (t) {
        return atob(molPaintJS.Resources[t + '.mol']);
    },

    /**
     * @return the list of template keys
     */
    molpaintjs.getTemplates = function () {
        return templates;
    },

    /**
     * @return version information
     */
    molpaintjs.getVersion = function () {
        return molPaintJS.Resources['version'];
    },

    /**
     * create a new context
     */
    molpaintjs.newContext = function (cid, prop) {
        var ctx = molPaintJS.Context(cid, prop, this);
        ctx.render();
        return ctx;
    },

    /**
     * register a new context (i.e. for events)
     */
    molpaintjs.registerContext = function (id, ctx) {
        contextRegistry[id] = ctx;
    },


    /**
     * allows to configure the order of templates
     * @param tp  array of template names
     */
    molpaintjs.setTemplates = function (tp) { 
        templates = [];
        for(let t of tp) {
            if (molPaintJS.Resources[t + '.png'] != null) {
                // molecule might be delayed because of asynchronous load
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

