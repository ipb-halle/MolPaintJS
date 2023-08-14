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

    molpaintjs.Dialog = function(ctxId) {


        const contextId = ctxId;
        const dialogId = ctxId + "_dialog";

        let dialogActive = false;
        let dialogEventX = 0;
        let dialogEventY = 0;
        let dialogPosX = 0;
        let dialogPosY = 0;

      
        let content = "";
        let errorMessage = "";
        let onClose = null;
        let title = "";

        return {
            dialogMouseDown : function (event) {
                dialogActive = true;
                let e = document.getElementById(dialogId);
                let x = parseFloat(e.style.left, 10);
                let y = parseFloat(e.style.top, 10);
                dialogPosX = (x) ? x : 0;
                dialogPosY = (y) ? y : 0;
                dialogEventX = event.clientX;
                dialogEventY = event.clientY;
            },

            dialogMouseMove : function (event) {
                if (dialogActive) {
                    let e = document.getElementById(dialogId);
                    e.style.left = (dialogPosX + event.clientX - dialogEventX) + "px";
                    e.style.top = (dialogPosY + event.clientY - dialogEventY) + "px";
                }
            },

            dialogMouseOut : function (event) {
                dialogActive = false;
            },

            close : function () {
                if (onClose != null) {
                    onClose();
                    onClose = null;
                }
                document.getElementById(dialogId).style.display='none';
            },

            getName : function () {
                return dialogId;
            },

            render : function () {
                let e = document.getElementById(dialogId);
                e.innerHTML = "<div class='molPaintJS-dialogBox'>"
                    + "<div class='molPaintJS-dialogHeader'>"
                        + "<i class='molPaintJS-dialogHeaderLeft fa-solid fa-arrows-up-down-left-right' "
                        + "onmousedown='molPaintJS.getDialog(\"" + contextId + "\").dialogMouseDown(event);' "
                        + "onmousemove='molPaintJS.getDialog(\"" + contextId + "\").dialogMouseMove(event);' "
                        + "onmouseout='molPaintJS.getDialog(\"" + contextId + "\").dialogMouseOut(event);' "
                        + "onclick='molPaintJS.getDialog(\"" + contextId + "\").dialogMouseOut(event);'></i>"
                        + "<span class='molPaintJS-dialogTitle'>" + title + "</span>" 
                        + "<i class='molPaintJS-dialogHeaderRight fa-solid fa-xmark' "
                        + "onclick='molPaintJS.getDialog(\"" + contextId + "\").close();'></i>"
                    + "</div>"
                    + "<div class='molPaintJS-dialogError'>" + errorMessage + "</div>"
                    + "<div class='molPaintJS-dialogContent'>" + content + "</div>"
                    + "</div>";
                e.style.display = "block";
            },

            setContent : function (html) {
                content = html;
            },

            setError : function (msg) {
                errorMessage = msg;
            },

            setOnClose : function (f) {
                onClose = f;
            },

            setTitle : function (t) {
                title = t;
            },

        }; // return
    }
    return molpaintjs;
}(molPaintJS || {}));

