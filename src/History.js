/*
 * MolPaintJS
 * Copyright 2024 Leibniz-Institut f. Pflanzenbiochemie
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

        let history = [];
        let historyPtr = -1;
        let contextId = cid;

        function redoAdd (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getDrawing().addAtom(action.newObject, false);
                    break;
                case "BOND" :
                    ctx.getDrawing().addBond(action.newObject, false);
                    break;
                case "CHEMOBJECT" :
                    ctx.getDrawing().addChemObject(action.newObject, false);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.redoAdd().");
            }
        }

        function redoDelete (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getDrawing().delAtom(action.oldObject, false);
                    break;
                case "BOND" :
                    ctx.getDrawing().delBond(action.oldObject, false);
                    break;
                case "CHEMOBJECT" :
                    ctx.getDrawing().delChemObject(action.oldObject, false);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.redoDelete().");
            }
        }

        function redoUpdate (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getDrawing().replaceAtom(action.newObject, false);
                    break;
                case "BOND" :
                    ctx.getDrawing().replaceBond(action.newObject, false);
                    break;
                case "CHEMOBJECT" :
                    ctx.getDrawing().replaceChemObject(action.newObject, false);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.redoUpdate().");
            }
        }

        function undoAdd (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getDrawing().delAtom(action.newObject, false);
                    break;
                case "BOND" :
                    ctx.getDrawing().delBond(action.newObject, false);
                    break;
                case "CHEMOBJECT" :
                    ctx.getDrawing().delChemObject(action.newObject, false);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.undoAdd().");
            }
        }

        function undoDelete (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getDrawing().addAtom(action.oldObject, false);
                    break;
                case "BOND" :
                    ctx.getDrawing().addBond(action.oldObject, false);
                    break;
                case "CHEMOBJECT" :
                    ctx.getDrawing().addChemObject(action.oldObject, false);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.undoDelete().");
            }
        }

        function undoUpdate (ctx, action) {
            switch (action.objectType) {
                case "ATOM" :
                    ctx.getDrawing().replaceAtom(action.oldObject, false);
                    break;
                case "BOND" :
                    ctx.getDrawing().replaceBond(action.oldObject, false);
                    break;
                case "CHEMOBJECT" :
                    ctx.getDrawing().replaceChemObject(action.oldObject, false);
                    break;
                default :
                    alert("Unknown objectType " + action.objectType + " in History.undoUpdate().");
            }
        }

        return {

            appendAction : function (a) {
                historyPtr++;
                history[historyPtr] = a;
                history.splice(historyPtr + 1,
                    history.length - historyPtr - 1);
                this.updateIcons();
            },

            updateIcons : function () {
                let e = document.getElementById(contextId + "_redo");
                if (historyPtr < (history.length - 1)) {
                    e.src = molPaintJS.Resources['redo.png'];
                } else {
                    e.src = molPaintJS.Resources['redo_inactive.png'];
                }

                e = document.getElementById(contextId + "_undo");
                if (historyPtr > -1) {
                    e.src = molPaintJS.Resources['undo.png'];
                } else {
                    e.src = molPaintJS.Resources['undo_inactive.png'];
                }
            },

            redo : function (ctx) {
                if (historyPtr > (history.length - 2)) {
                    return;
                }
                historyPtr++;
                let actionList = history[historyPtr];	// ActionList

                for (let action of actionList.getActions()) {
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

            /**
             * function to support integration testing
             */
            spy : function () {
                return history[historyPtr].getActions();
            },


            undoActionList : function(ctx, actionList) {
                // loop actionList backwards in undo
                for (let i = actionList.getActions().length; i-- > 0;) {
                    let action = actionList.getActions()[i];
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
            },

            undo : function (ctx) {
                if (historyPtr < 0) {
                    return;
                }
                undoActionList(ctx, history[historyPtr]);
                historyPtr--;
                this.updateIcons();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
