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

function DefaultProperties(prop) {

    this.bondLength = 1.5;
    this.distMax = 0.1;
    this.fontFamily = "SansSerif";
    this.fontSize = 16;
    this.helpURL = "https://ipb-halle.github.io/MolPaintJS/help";
    this.iconSize = 32;
    this.installPath = "";
    this.molScaleDefault = 33;	// pixel per Angstrom
    this.sizeX = 400;
    this.sizeY = 400;
    this.subscriptFactor = 0.7;	// subscript fontsize = fontSize * subscriptFactor

    /**
     * override current properties
     * @param p the new properties
     */
    this.setProperties = function (p) {
        if (p != null) {
            for (var i in p) {
                this[i] = p[i];
            }
        }
    }

    /**
     * Override default properties with custom settings
     */
    this.setProperties(prop);
}
