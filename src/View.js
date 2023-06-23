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

        let displayScale = 1.0;
        let fontFamily = prop.fontFamily;
        let fontSize = prop.fontSize;
        let medianBondLength = 1.5;
        let molScaleDefault = prop.molScaleDefault;
        let molScale = molScaleDefault / medianBondLength;
        let rasterX = [];
        let rasterY = [];
        let sizeX = prop.sizeX;
        let sizeY = prop.sizeY;
        let subscriptFactor = prop.subscriptFactor;

        let centerX = sizeX / 2;
        let centerY = sizeY / 2;

        let contextId = cid + "_canvas";
        let viewContext = null;
        let element = null;

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

            /*
             * @return tranformed X coordinate
             */
            getCoordX : function (x) {
                return centerX + (x * molScale * displayScale);
            },

            /**
             * @return transformed Y coordinate
             */
            getCoordY : function (y) {
                return centerY + (y * molScale * displayScale);
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
                let bbox = element.getBoundingClientRect();
                // let bdy = document.body.getBoundingClientRect();
                // DO NOT USE: offset.??? = bbox.??? + bdy.???
                return {
                    x: bbox.left,
                    y: bbox.top
                };
            },

            getRasterX : function(i) {
                return rasterX[i];
            },

            getRasterY : function(i) {
                return rasterY[i];
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

            /**
             * compute median bond length and init raster of bond angles
             */
            initRaster : function(mol) {
                medianBondLength = mol.computeBondLengths();

                for(let i=0; i<15; i++) {
                    rasterX[i] = Math.cos(i * Math.PI / 6.0) * medianBondLength;
                    rasterY[i] = Math.sin(i * Math.PI / 6.0) * medianBondLength;
                }
                molScale = molScaleDefault / medianBondLength;
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
             * set the display scaling factor
             * @param mol the current molecule
             * @param center true if molecule should be centered
             */
            setDisplayScale : function (mol, center) {

                let molbox;
                let x = sizeX - 40;     // leave some margin
                let y = sizeY - 40;

                if (center) {
                    molbox = this.getBBox(mol.center());
                } else {
                    molbox = this.getBBox(mol.computeBBox(0));
                }
                displayScale = 1.0;

                if (molbox.getDeltaX() > x) {
                    displayScale = x / molbox.getDeltaX();
                }
                if (molbox.getDeltaY() > y) {
                    let f = y / molbox.getDeltaY();
                    displayScale = (f < displayScale) ? f : displayScale;
                }
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
             * set superscript / subscript size
             */
            setSubscript : function () {
                let fs = fontSize * subscriptFactor;
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
