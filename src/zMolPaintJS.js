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
        return this.templates[t];
    }

    /**
     * @return the list of templates
     */
    this.getTemplates = function () {
        return this.templates;
    }


    /**
     * allows to configure a list of templates
     * @param tp  array of template names
     */
    this.setTemplates = function (tp) { 
        for(t of tp) {
            this.templates[t] = "";     // synchronous
            this.loadTemplate(t);       // asynchronous
        }
    }
    
    /**
     * replace the content of a HTML element with id "dumpId" 
     * by the molecule in MDLv2000 format from the editor with 
     * context id "cid".
     */
    this.dump = function (cid, dumpId) {
        var o = document.getElementById(dumpId);
        o.innerHTML = "<pre>" + this.getMDLv2000(cid) + "</pre>";
    }

    /**
     * load a template 
     * @param t the template
     */
    this.loadTemplate = function (t) {
        var that = this;
        var tp = t;
        var request = new XMLHttpRequest();
        var url =  this.properties.installPath + 'templates/' + t +  ".mol";
        request.open('GET',url, true);
        request.overrideMimeType('text/html');
        request.send(null);
        request.onreadystatechange = function () {
            if (request.readyState === 4 && request.status === 200) {
                that.templates[tp] = request.responseText;
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
    this.templates = {};

    this.setTemplates([ 'benzene', 'cyclohexane', 'cyclopentane']);

}
