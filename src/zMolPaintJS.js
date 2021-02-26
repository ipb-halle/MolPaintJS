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

function MolPaintJS (prop) {

    /*
     * Note: constructor code and instance variables at end of file
     */

    /**
     * add a list of templates to the current instance
     * @param templateConfig an array of config objects [ {key:"Asn", molURL:"asparagine.mol", iconURL:"asparagine.png"} , ... ]
     */
    this.addTemplates = function (templateConfig) {
        for (var cfg of templateConfig) {
            molPaintJS_resources[cfg.key + ".png"] = cfg.iconURL;
            this.loadTemplate(cfg.key, cfg.molURL);
        }
    }

    this.createCSS = function() {
        var e = document.getElementById("MolPaintJS_CSS");
        if (e == null) {
            e = document.createElement("link");
            e.id = "MolPaintJS_CSS";
            e.rel = "stylesheet";
            e.href = molPaintJS_resources['styles.css'];
            document.head.appendChild(e);
        }
    }

    this.createHelpWidget = function() {
        var e = document.getElementById("MolPaintJS_Help_Widget");
        if (e == null) {
            e = document.createElement("div");
            e.id = "MolPaintJS_Help_Widget";
            e.classList.add("helpModal");
            document.body.appendChild(e);
        }
    }

    /**
     * return the context for a given context id
     */
    this.getContext = function (cid) {
        return contextRegistry[cid];
    }

    /**
     * @return the molecule from context cid in MDLv2000 format
     */
    this.getMDLv2000 = function (cid) { 
        var w = new MDLv2000Writer();
        return w.write(contextRegistry[cid].molecule);
    }

    /**
     * @return the molecule from context cid in MDLv3000 format
     */
    this.getMDLv3000 = function (cid) {
        var w = new MDLv3000Writer();
        return w.write(contextRegistry[cid].molecule);
    }


    /**
     * @return global properties
     */
    this.getProperties = function () {
        return this.properties;
    }

    /**
     * @param t the name of the template
     * @return return the molecule string for template t
     */
    this.getTemplate = function (t) {
        return atob(molPaintJS_resources[t + '.mol']);
    }

    /**
     * @return the list of template keys
     */
    this.getTemplates = function () {
        return this.templates;
    }


    /**
     * allows to configure the order of templates
     * @param tp  array of template names
     */
    this.setTemplates = function (tp) { 
        this.templates = tp;
        this.templates = [];
        for(t of tp) {
            if (molPaintJS_resources[t + '.png'] != null) {
                // molecule might be delayed because of asynchronous load
                this.templates.push(t);
            } else {
                console.log("Missing resources for template key: " + t);
            }
        }
    }
    
    /**
     * replace the content of a HTML element with id "dumpId" 
     * by the molecule in MDLv2000 format from the editor with 
     * context id "cid".
     */
    this.dump = function (cid, dumpId) {
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
    }

    /**
     * load a template 
     * @param t the template
     */
    this.loadTemplate = function (t, url) {
        var that = this;
        var tp = t;
        var request = new XMLHttpRequest();
        request.open('GET',url, true);
        request.overrideMimeType('text/html');
        request.send(null);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                molPaintJS_resources[tp + ".mol"] = btoa(request.responseText);
            } 
        }
    }

    /**
     * create a new context
     */
    this.newContext = function (cid, prop) {
        var p = new DefaultProperties(this.properties);
        p.setProperties(prop);
        var ctx = new Context(cid, p, this);
        return ctx;
    }

    /*
     * variables and constructor 
     */

    this.properties = new DefaultProperties(prop);
    this.templates = [];

    // set of internal templates
    this.setTemplates([ 'benzene', 'cyclohexane', 'cyclopentane' ]);

}
