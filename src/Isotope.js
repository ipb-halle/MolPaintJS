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

function Isotope(n, p, g, s, m, i, me, c) {

    this.atomicNumber = n;
    this.color = c;
    this.group = g;
    this.isotope = i;
    this.mass = m;
    this.massExact = me;
    this.period = p;
    this.symbol = s;

    this.getAtomicNumber = function () {
        return this.atomicNumber;
    }
    this.getColor = function () {
        return this.color;
    }
    this.getGroup = function () {
        return this.group;
    }
    this.getIsotope = function () {
        return this.isotope;
    }
    this.getMass = function () {
        return this.mass;
    }
    this.getMassExact = function () {
        return this.massExact;
    }
    this.getPeriod = function () {
        return this.period;
    }
    this.getSymbol = function () {
        return this.symbol;
    }

}
