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

function View(cid, prop) {

    this.displayScale = 1.0;
    this.fontFamily = prop.fontFamily;
    this.fontSize = prop.fontSize;
    this.molScale = prop.molScaleDefault;
    this.sizeX = prop.sizeX;
    this.sizeY = prop.sizeY;
    this.subscriptFactor = prop.subscriptFactor;

    this.centerX = this.sizeX / 2;
    this.centerY = this.sizeY / 2;

    this.contextId = cid + "_canvas";
    this.context = null;
    this.element = null;

    this.computeCoord = function (bbox) {
        this.centerX = (this.sizeX / 2) + (bbox.centerX * this.molScale * this.displayScale);
        this.centerY = (this.sizeY / 2) + (bbox.centerY * this.molScale * this.displayScale);
    }

    /**
     * forward transform coordinates (i.e. from atom 
     * coordinates to canvas coordinates)
     * @param bbox bounding box
     * @return transformed box
     */
    this.getBBox = function (bbox) {
        return new Box((bbox.minX * this.molScale * this.displayScale) + this.centerX,
          (bbox.minY * this.molScale * this.displayScale) + this.centerY,
          (bbox.maxX * this.molScale * this.displayScale) + this.centerX,
          (bbox.maxY * this.molScale * this.displayScale) + this.centerY);
    }

    /**
     * Reverse transform bounding box coordinates,
     * i.e. from canvas coordinates to atom coordinates
     * @param bbox bounding box
     * @return bounding box with transformed coordinates
     */
    this.getBBoxReverse = function (bbox) {
        return new Box((bbox.minX - this.centerX) / (this.molScale * this.displayScale),
            (bbox.minY - this.centerY) / (this.molScale * this.displayScale),
            (bbox.maxX - this.centerX) / (this.molScale * this.displayScale),
            (bbox.maxY - this.centerY) / (this.molScale * this.displayScale));
    }

    /*
     * @return the current context
     */
    this.getContext = function () {
        return this.context;
    }

    /**
     * Forward transform coordinates
     * i.e. from atom coordinates to canvas coordinates
     */
    this.getCoord = function (atom) {
        return {
            x: (this.centerX + (atom.coordX * this.molScale * this.displayScale)),
            y: (this.centerY + (atom.coordY * this.molScale * this.displayScale))
        };
    }

    /**
     * Reverse transform coordinates
     * i.e. from canvas coordinates to atom coordinates
     */
    this.getCoordReverse = function (canvasX, canvasY) {
        return {
            x: ((canvasX - this.centerX) / (this.molScale * this.displayScale)),
            y: ((canvasY - this.centerY) / (this.molScale * this.displayScale))
        };
    }

    /**
     * @return the drawing area DOM element
     */
    this.getElement = function () {
        return this.element;
    }

    /**
     * @return current normal font size
     */
    this.getFontSize = function () {
        return this.fontSize;
    }

    /**
     * @return current font size for subscripts and superscripts
     */
    this.getSubscriptSize = function () {
        return this.fontSize * this.subscriptFactor;
    }

    /**
     */
    this.getOffset = function () {
        var bbox = this.element.getBoundingClientRect();
        // var bdy = document.body.getBoundingClientRect();
        // DO NOT USE: offset.??? = bbox.??? + bdy.???
        return {
            x: bbox.left,
            y: bbox.top
        };
    }

    this.getSizeX = function () {
        return this.sizeX;
    }
    this.getSizeY = function () {
        return this.sizeY;
    }

    /**
     * initialize this  object
     */
    this.init = function () {
        this.element = document.getElementById(this.contextId);
        this.context = this.element.getContext("2d");
        this.context.font = this.fontSize + "px " + this.fontFamily;
    }

    /**
     * scale the font size
     */
    this.scaleFontSize = function (fs) {
        this.fontSize *= fs;
        this.context.font = this.fontSize + "px " + this.fontFamily;
    }

    /**
     * set the context.font property to the default font
     */
    this.setFont = function () {
        this.context.font = this.fontSize + "px " + this.fontFamily;
    }

    /**
     * set the default font size
     */
    this.setFontSize = function (f) {
        this.fontSize = f;
        this.context.font = f + "px " + this.fontFamily;
    }

    /**
     * set the molecule scaling factor
     */
    this.setMolScale = function (s) {
        this.molScale = s;
    }

    /**
     * set superscript / subscript size
     */
    this.setSubscript = function () {
        var fs = this.fontSize * this.subscriptFactor;
        this.context.font = fs + "px " + this.fontFamily;
    }

}
