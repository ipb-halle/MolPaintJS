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

    molpaintjs.DefaultProperties = function (prop) {

        var properties = {
            bondLength: 1.5,
            distMax: 0.08,
            fontFamily: "SansSerif",
            fontSize: 16,
            helpURL: "https://ipb-halle.github.io/MolPaintJS/help",
            iconSize: 32,
            molScaleDefault: 33,  // pixel per Angstrom
            sizeX: 400,
            sizeY: 400,
            subscriptFactor: 0.7, // subscript fontsize = fontSize * subscriptFactor
        }
 
        /**
         * override current properties
         * @param p the new properties
         */
        function setProp(p) {
            if (p != null) {
                for (var i in p) {
                    properties[i] = p[i];
                }
            }
        }

        setProp(prop);

        return {

            getProperties : function () {
                return properties;
            },

            getProperty : function (p) {
                return properties[p];
            },

            /**
             * override current properties
             * @param p the new properties
             */
            setProperties : function (p) {
                setProp(p);
                return this;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
