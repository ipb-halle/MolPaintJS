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

    /*
     * this class stores a bounding box
     */
    molpaintjs.Box = function (x1, y1, x2, y2) {

        var minX = (x1 < x2) ? x1 : x2;
        var minY = (y1 < y2) ? y1 : y2;
        var maxX = (x1 < x2) ? x2 : x1;
        var maxY = (y1 < y2) ? y2 : y1;
        var centerX = (x1 + x2) / 2;
        var centerY = (y1 + y2) / 2;

        /**
         * clip in quadrant I
         */
        function clip1 (coord, dx, dy) {
            let cx = coord.x - minX
            let cy = coord.y - minY;
            let d = dx / dy;
            let c = cx / cy;
            if (d < c) {
                return {x: (coord.x - (d * cy)), y: minY};
            }
            return {x: minX, y: (coord.y - (cx / d))};
        }

        /**
         * clip in quadrant II
         */
        function clip2 (coord, dx, dy) {
            let cx = maxX - coord.x;
            let cy = coord.y - minY;
            let d = -dx / dy;
            let c = cx / cy;
            if (d < c) {
                return {x: (coord.x + (d * cy)), y: minY};
            }
            return {x: maxX, y: (coord.y - (cx / d))};
        }

        /**
         * clip in quadrant III
         */
        function clip3 (coord, dx, dy) {
            let cx = maxX - coord.x;
            let cy = maxY - coord.y;
            let d = dx / dy;
            let c = cx / cy;
            if (d < c) {
                return {x: (coord.x + (d * cy)), y: maxY};
            }
            return {x: maxX, y: (coord.y + (cx / d))};
        }

        /**
         * clip in quadrant IV
         */
        function clip4 (coord, dx, dy) {
            let cx = coord.x - minX;
            let cy = maxY - coord.y;
            let d = -dx / dy;
            let c = cx / cy;
            if (d < c) {
                return {x: (coord.x - (d * cy)), y: maxY};
            }
            return {x: minX, y: (coord.y + (cx / d))};
        }

        return {

            /**
             * clip a line segment originated at point coord.
             * coord must be inside the current bounding box; otherwise
             * outcome will be undefined.
             */
            clip : function (coord, dx, dy) {
                let t = 0;
                t += (dx > 0) ? 1 : 0;
                t += (dx == 0) ? 2 : 0;
                t += (dx < 0) ? 4 : 0;
                t += (dy > 0) ? 8 : 0;
                t += (dy == 0) ? 16 : 0;
                t += (dy < 0) ? 32 : 0;
                switch (t) {
                    // dx > 0; dy > 0
                    case 9:
                        return clip1(coord, dx, dy)

                    // dx == 0; dy > 0
                    case 10:
                        return {x: coord.x, y: minY};

                    // dx < 0; dy > 0
                    case 12:
                        return clip2(coord, dx, dy);

                    // dx > 0; dy == 0
                    case 17:
                        return {x: minX, y: coord.y};

                    // dx < 0; dy == 0
                    case 20:
                        return {x: maxX, y: coord.y};

                    // dx > 0; dy < 0
                    case 33:
                        return clip4(coord, dx, dy);

                    // dx == 0; dy < 0
                    case 34:
                        return {x: coord.x, y: maxY};

                    // dx < 0; dy < 0
                    case 36:
                        return clip3(coord, dx, dy);

                    default:
                        alert("Box.clip(): internal error");
                }
            },

            center : function () {
                minX -= centerX;
                maxX -= centerX;
                minY -= centerY;
                maxY -= centerY;
                return this;
            },

            contains : function (x, y) {
                return (minX < x)
                    && (maxX > x)
                    && (minY < y)
                    && (maxY > y);
            },

            /**
             * draw this bounding Box
             */
            draw : function (vctx) {
                vctx.moveTo(minX, minY);
                vctx.lineTo(minX, maxY);
                vctx.lineTo(maxX, maxY);
                vctx.lineTo(maxX, minY);
                vctx.lineTo(minX, minY);
                vctx.stroke();
                vctx.beginPath();
            },

            /**
             * Join two bounding boxes forming a single
             * larger box which contains both boxes
             */
            join : function (box) {
                minX = (minX < box.getMinX()) ? minX : box.getMinX();
                minY = (minY < box.getMinY()) ? minY : box.getMinY();
                maxX = (maxX > box.getMaxX()) ? maxX : box.getMaxX();
                maxY = (maxY > box.getMaxY()) ? maxY : box.getMaxY();
                centerX = (minX + maxX) / 2.0;
                centerY = (minY + maxY) / 2.0;
                return this;
            },

            getCenterX : function() {
                return centerX;
            },

            getCenterY : function() {
                return centerY;
            },

            getDeltaX : function() {
                return maxX - minX;
            },

            getDeltaY : function()  {
                return maxY - minY;
            },

            getMaxX : function() {
                return maxX;
            },

            getMaxY : function() {
                return maxY;
            },

            getMinX : function() {
                return minX;
            },

            getMinY : function() {
                return minY;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
