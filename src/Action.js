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

    molpaintjs.Action = function (at, ot, newObj, oldObj) {

        return {

            /* 
             * this class stores an atomic action which is part of 
             * an user action. The type of action can be "ADD", 
             * "DEL", and "UPD". In case of "ADD", the only the new 
             * object is stored (oldObject is null), in case of "DEL" 
             * only the old object is stored and in case of "UPD" 
             * both objects (old and new) are stored.
             * 
             * objectType so far can be "ATOM" and "BOND"
             */
            actionType : at,
            newObject : newObj,
            oldObject : oldObj,
            objectType : ot
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
