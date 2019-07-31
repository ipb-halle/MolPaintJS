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

function History(cid, prop) {

    this.actions = [];
    this.actionPtr = -1;
    this.contextId = cid;
    this.installPath = prop.installPath;

    this.appendAction = function (a) {
        this.actionPtr++;
        this.actions[this.actionPtr] = a;
        this.actions.splice(this.actionPtr + 1,
            this.actions.length - this.actionPtr - 1);
        this.updateIcons();
    }

    this.updateIcons = function () {
        var e = document.getElementById(this.contextId + "_redo");
        if (this.actionPtr < (this.actions.length - 1)) {
            e.src = this.installPath + "img/redo.png";
        } else {
            e.src = this.installPath + "img/redo_inactive.png";
        }

        e = document.getElementById(this.contextId + "_undo");
        if (this.actionPtr > -1) {
            e.src = this.installPath + "img/undo.png";
        } else {
            e.src = this.installPath + "img/undo_inactive.png";
        }
    }

    this.redo = function (ctx) {
        if (this.actionPtr > (this.actions.length - 2)) {
            return;
        }
        this.actionPtr++;
        var al = this.actions[this.actionPtr];	// ActionList

        for (var i = al.actions.length; i-- > 0;) {	// loop actionList backwards in redo 
            var action = al.actions[i];
            switch (action.actionType) {
                case "ADD" :
                    this.redoAdd(ctx, action);
                    break;
                case "DEL" :
                    this.redoDelete(ctx, action);
                    break;
                case "UPD" :
                    this.redoUpdate(ctx, action);
                    break;
                default :
                    alert("Unknown actionType " + i.actionType + " of action in History.redo().");
            }
        }
        this.updateIcons();
    }

    this.redoAdd = function (ctx, action) {
        switch (action.objectType) {
            case "ATOM" :
                ctx.molecule.addAtom(action.newObject, action.newObject.id);
                break;
            case "BOND" :
                ctx.molecule.addBond(action.newObject, action.newObject.id);
                break;
            default :
                alert("Unknown objectType " + action.objectType + " in History.redoAdd().");
        }
    }

    this.redoDelete = function (ctx, action) {
        switch (action.objectType) {
            case "ATOM" :
                ctx.molecule.delAtom(action.oldObject);
                break;
            case "BOND" :
                ctx.molecule.delBond(action.oldObject);
                break;
            default :
                alert("Unknown objectType " + action.objectType + " in History.redoDelete().");
        }
    }

    this.redoUpdate = function (ctx, action) {
        switch (action.objectType) {
            case "ATOM" :
                ctx.molecule.replaceAtom(action.newObject);
                break;
            case "BOND" :
                ctx.molecule.replaceBond(action.newObject);
                break;
            default :
                alert("Unknown objectType " + action.objectType + " in History.redoUpdate().");
        }
    }

    this.undo = function (ctx) {
        if (this.actionPtr < 0) {
            return;
        }
        var al = this.actions[this.actionPtr];    // ActionList

        for (var i in al.actions) {
            var action = al.actions[i];
            switch (action.actionType) {
                case "ADD" :
                    this.undoAdd(ctx, action);
                    break;
                case "DEL" :
                    this.undoDelete(ctx, action);
                    break;
                case "UPD" :
                    this.undoUpdate(ctx, action);
                    break;
                default:
                    alert("Unknown actionType " + i.actionType + " of action in History.undo().");
            }
        }

        this.actionPtr--;
        this.updateIcons();
    }

    this.undoAdd = function (ctx, action) {
        switch (action.objectType) {
            case "ATOM" :
                ctx.molecule.delAtom(action.newObject);
                break;
            case "BOND" :
                ctx.molecule.delBond(action.newObject);
                break;
            default :
                alert("Unknown objectType " + action.objectType + " in History.undoAdd().");
        }
    }

    this.undoDelete = function (ctx, action) {
        switch (action.objectType) {
            case "ATOM" :
                ctx.molecule.addAtom(action.oldObject, action.oldObject.id);
                break;
            case "BOND" :
                ctx.molecule.addBond(action.oldObject, action.oldObject.id);
                break;
            default :
                alert("Unknown objectType " + action.objectType + " in History.undoDelete().");
        }
    }

    this.undoUpdate = function (ctx, action) {
        switch (action.objectType) {
            case "ATOM" :
                ctx.molecule.replaceAtom(action.oldObject);
                break;
            case "BOND" :
                ctx.molecule.replaceBond(action.oldObject);
                break;
            default :
                alert("Unknown objectType " + action.objectType + " in History.undoUpdate().");
        }
    }
}
