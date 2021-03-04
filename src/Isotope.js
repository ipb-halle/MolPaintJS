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

    molpaintjs.Isotope = function (n, p, g, s, m, i, me, c) {

        var atomicNumber = n;
        var color = c;
        var group = g;
        var isotope = i;
        var mass = m;
        var massExact = me;
        var period = p;
        var symbol = s;

        return {

            getAtomicNumber : function () {
                return atomicNumber;
            },

            getColor : function () {
                return color;
            },

            getGroup : function () {
                return group;
            },

            getIsotope : function () {
                return isotope;
            },

            getMass : function () {
                return mass;
            },

            getMassExact : function () {
                return massExact;
            },

            getPeriod : function () {
                return period;
            },

            getSymbol : function () {
                return symbol;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
