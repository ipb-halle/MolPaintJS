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

    molpaintjs.Counter = function() {

        /*
         * context unique counters for objects (atoms, bonds, ...)
         */
        let atomCounter = 0;
        let bondCounter = 0;
        let chemObjectCounter = 0;
        let sGroupCounter = 0;

        return {
            atomCounter : function () {
                return atomCounter++;
            },
            bondCounter : function() {
                return bondCounter++;
            },
            chemObjectCounter : function () {
                return chemObjectCounter++;
            },
            sGroupCounter : function () {
                return sGroupCounter++;
            },

            /**
             * reset all counters for testing purposes
             * to make identifiers predictable to the test code
             */
            reset : function () {
                atomCounter = 0;
                bondCounter = 0;
                chemObjectCounter = 0;
                sGroupCounter = 0;
            },
        };  // return
    }   // Counter
    return molpaintjs;
}(molPaintJS || {}));

