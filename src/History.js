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

    molpaintjs.History = function (cid) {

        let actions = [];
        let actionPtr = -1;
        let contextId = cid;

        function redoAdd (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getMolecule().addAtom(action.newObject, action.newObject.id);
                    break;
                case "BOND" :
                    ctx.getMolecule().addBond(action.newObject, action.newObject.id);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.redoAdd().");
            }
        }

        function redoDelete (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getMolecule().delAtom(action.oldObject);
                    break;
                case "BOND" :
                    ctx.getMolecule().delBond(action.oldObject);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.redoDelete().");
            }
        }

        function redoUpdate (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getMolecule().replaceAtom(action.newObject);
                    break;
                case "BOND" :
                    ctx.getMolecule().replaceBond(action.newObject);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.redoUpdate().");
            }
        }

        function undoAdd (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getMolecule().delAtom(action.newObject);
                    break;
                case "BOND" :
                    ctx.getMolecule().delBond(action.newObject);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.undoAdd().");
            }
        }

        function undoDelete (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getMolecule().addAtom(action.oldObject, action.oldObject.id);
                    break;
                case "BOND" :
                    ctx.getMolecule().addBond(action.oldObject, action.oldObject.id);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.undoDelete().");
            }
        }

        function undoUpdate (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getMolecule().replaceAtom(action.oldObject);
                    break;
                case "BOND" :
                    ctx.getMolecule().replaceBond(action.oldObject);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.undoUpdate().");
            }
        }

        return {

            appendAction : function (a) {
                actionPtr++;
                actions[actionPtr] = a;
                actions.splice(actionPtr + 1,
                    actions.length - actionPtr - 1);
                this.updateIcons();
            },

            updateIcons : function () {
                let e = document.getElementById(contextId + "_redo");
                if (actionPtr < (actions.length - 1)) {
                    e.src = molPaintJS.Resources['redo.png'];
                } else {
                    e.src = molPaintJS.Resources['redo_inactive.png'];
                }

                e = document.getElementById(contextId + "_undo");
                if (actionPtr > -1) {
                    e.src = molPaintJS.Resources['undo.png'];
                } else {
                    e.src = molPaintJS.Resources['undo_inactive.png'];
                }
            },

            redo : function (ctx) {
                if (actionPtr > (actions.length - 2)) {
                    return;
                }
                actionPtr++;
                let al = actions[actionPtr];	// ActionList

                for (let i = al.getActions().length; i-- > 0;) {	// loop actionList backwards in redo
                    let action = al.getActions()[i];
                    switch (action.actionType) {
                        case "ADD" :
                            redoAdd(ctx, action);
                            break;
                        case "DEL" :
                            redoDelete(ctx, action);
                            break;
                        case "UPD" :
                            redoUpdate(ctx, action);
                            break;
                        default :
                            alert("Unknown actionType " + i.actionType + " of action in History.redo().");
                    }
                }
                this.updateIcons();
            },

            undo : function (ctx) {
                if (actionPtr < 0) {
                    return;
                }
                let al = actions[actionPtr];    // ActionList

                for (let action of al.getActions()) {
                    switch (action.actionType) {
                        case "ADD" :
                            undoAdd(ctx, action);
                            break;
                        case "DEL" :
                            undoDelete(ctx, action);
                            break;
                        case "UPD" :
                            undoUpdate(ctx, action);
                            break;
                        default:
                            alert("Unknown actionType " + action.actionType + " of action in History.undo().");
                    }
                }

                actionPtr--;
                this.updateIcons();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
