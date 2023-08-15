/*
 * MolPaintJS
 * Copyright 2017-2021 Leibniz-Institut f. Pflanzenbiochemie
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

    molpaintjs.Collection = function (n) {

        let name = n;
        let atoms = [];
        let bonds = [];
        let sgroups = [];
        let chemObjectId = null;

        return {
            getAtoms: function () {
                return atoms;
            },

            getBonds: function () {
                return bonds;
            },

            getName: function () {
                return name;
            },

            join: function(col) {
                for (let a in col.getAtoms()) {
                    atoms.push(a);
                }
                for (let b in col.getBonds()) {
                    bonds.push(b);
                }
                // SGroups, Members, ...
            },

            setAtoms: function (a) {
                atoms = a;
                return this;
            },

            setBonds: function (b) {
                bonds = b;
                return this;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
