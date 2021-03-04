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

    molpaintjs.View = function (cid, prop) {

        var displayScale = 1.0;
        var fontFamily = prop.fontFamily;
        var fontSize = prop.fontSize;
        var molScale = prop.molScaleDefault;
        var sizeX = prop.sizeX;
        var sizeY = prop.sizeY;
        var subscriptFactor = prop.subscriptFactor;

        var centerX = sizeX / 2;
        var centerY = sizeY / 2;

        var contextId = cid + "_canvas";
        var viewContext = null;
        var element = null;

        return {

            /**
             * center the View. Changes centerX and centerY.
             */
            center : function () {
                centerX = sizeX / 2;
                centerY = sizeY / 2;
            },

            /**
             * forward transform coordinates (i.e. from atom 
             * coordinates to canvas coordinates)
             * @param bbox bounding box
             * @return transformed box
             */
            getBBox : function (bbox) {
                return molPaintJS.Box((bbox.getMinX() * molScale * displayScale) + centerX,
                  (bbox.getMinY() * molScale * displayScale) + centerY,
                  (bbox.getMaxX() * molScale * displayScale) + centerX,
                  (bbox.getMaxY() * molScale * displayScale) + centerY);
            },

            /**
             * Reverse transform bounding box coordinates,
             * i.e. from canvas coordinates to atom coordinates
             * @param bbox bounding box
             * @return bounding box with transformed coordinates
             */
            getBBoxReverse : function (bbox) {
                return molPaintJS.Box((bbox.getMinX() - centerX) / (molScale * displayScale),
                    (bbox.getMinY() - centerY) / (molScale * displayScale),
                    (bbox.getMaxX() - centerX) / (molScale * displayScale),
                    (bbox.getMaxY() - centerY) / (molScale * displayScale));
            },

            /**
             * Forward transform coordinates
             * i.e. from atom coordinates to canvas coordinates
             */
            getCoord : function (atom) {
                return {
                    x: (centerX + (atom.getX() * molScale * displayScale)),
                    y: (centerY + (atom.getY() * molScale * displayScale))
                };
            },

            /**
             * Reverse transform coordinates
             * i.e. from canvas coordinates to atom coordinates
             */
            getCoordReverse : function (canvasX, canvasY) {
                return {
                    x: ((canvasX - centerX) / (molScale * displayScale)),
                    y: ((canvasY - centerY) / (molScale * displayScale))
                };
            },

            /**
             * @return the drawing area DOM element
             */
            getElement : function () {
                return element;
            },

            /**
             * @return current normal font size
             */
            getFontSize : function () {
                return fontSize;
            },

            getMolScale : function () {
                return molScale;
            },

            getOffset : function () {
                var bbox = element.getBoundingClientRect();
                // var bdy = document.body.getBoundingClientRect();
                // DO NOT USE: offset.??? = bbox.??? + bdy.???
                return {
                    x: bbox.left,
                    y: bbox.top
                };
            },

            getSizeX : function () {
                return sizeX;
            },

            getSizeY : function () {
                return sizeY;
            },

            /**
             * @return current font size for subscripts and superscripts
             */
            getSubscriptSize : function () {
                return fontSize * subscriptFactor;
            },

            /*
             * @return the current viewContext
             */
            getViewContext : function () {
                return viewContext;
            },

            /**
             * initialize  object
             */
            init : function () {
                element = document.getElementById(contextId);
                viewContext = element.getContext("2d");
                viewContext.font = fontSize + "px " + fontFamily;
            },

            scaleDisplay : function (s) {
                displayScale *= s;
            },

            /**
             * scale the font size
             */
            scaleFontSize : function (fs) {
                fontSize *= fs;
                viewContext.font = fontSize + "px " + fontFamily;
            },

            /**
             * set the viewContext.font property to the default font
             */
            setFont : function () {
                viewContext.font = fontSize + "px " + fontFamily;
            },

            /**
             * set the default font size
             */
            setFontSize : function (f) {
                fontSize = f;
                viewContext.font = f + "px " + fontFamily;
            },

            /**
             * set the molecule scaling factor
             */
            setMolScale : function (s) {
                molScale = s;
            },

            /**
             * set superscript / subscript size
             */
            setSubscript : function () {
                var fs = fontSize * subscriptFactor;
                viewContext.font = fs + "px " + fontFamily;
            },

            /**
             * slide the view (i.e. move the center)
             */
            slide : function (x, y) {
                centerX += x;
                centerY += y;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
