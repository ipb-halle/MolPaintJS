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

function Box(x1, y1, x2, y2) {

    /* 
     * this class stores a bounding box 
     */
    this.minX = (x1 < x2) ? x1 : x2;
    this.minY = (y1 < y2) ? y1 : y2;
    this.maxX = (x1 < x2) ? x2 : x1;
    this.maxY = (y1 < y2) ? y2 : y1;

    /**
     * Join two bounding boxes forming a single
     * larger box which contains both boxes
     */
    this.join = function (box) {
        this.minX = (this.minX < box.minX) ? this.minX : box.minX;
        this.minY = (this.minY < box.minY) ? this.minY : box.minY;
        this.maxX = (this.maxX > box.maxX) ? this.maxX : box.maxX;
        this.maxY = (this.maxY > box.maxY) ? this.maxY : box.maxY;
    }

    /**
     * draw this bounding Box
     */
    this.draw = function (ctx) {
        ctx.moveTo(this.minX, this.minY);
        ctx.lineTo(this.minX, this.maxY);
        ctx.lineTo(this.maxX, this.maxY);
        ctx.lineTo(this.maxX, this.minY);
        ctx.lineTo(this.minX, this.minY);
        ctx.stroke();
        ctx.beginPath();
    }

    /**
     * clip a line segment originated at point coord.
     * coord must be inside the current bounding box; otherwise
     * outcome will be undefined.
     */
    this.clip = function (coord, dx, dy) {
        var t = 0;
        t += (dx > 0) ? 1 : 0;
        t += (dx == 0) ? 2 : 0;
        t += (dx < 0) ? 4 : 0;
        t += (dy > 0) ? 8 : 0;
        t += (dy == 0) ? 16 : 0;
        t += (dy < 0) ? 32 : 0;
        switch (t) {
            // dx > 0; dy > 0
            case 9:
                return this.clip1(coord, dx, dy)

            // dx == 0; dy > 0
            case 10:
                return {x: coord.x, y: this.minY};

            // dx < 0; dy > 0
            case 12:
                return this.clip2(coord, dx, dy);

            // dx > 0; dy == 0
            case 17:
                return {x: this.minX, y: coord.y};

            // dx < 0; dy == 0
            case 20:
                return {x: this.maxX, y: coord.y};

            // dx > 0; dy < 0
            case 33:
                return this.clip4(coord, dx, dy);

            // dx == 0; dy < 0
            case 34:
                return {x: coord.x, y: this.maxY};

            // dx < 0; dy < 0
            case 36:
                return this.clip3(coord, dx, dy);

            default:
                alert("Box.clip(): internal error");
        }
    }

    /**
     * clip in quadrant I
     */
    this.clip1 = function (coord, dx, dy) {
        var cx = coord.x - this.minX
        var cy = coord.y - this.minY;
        var d = dx / dy;
        var c = cx / cy;
        if (d < c) {
            return {x: (coord.x - (d * cy)), y: this.minY};
        }
        return {x: this.minX, y: (coord.y - (cx / d))};
    }

    /**
     * clip in quadrant II
     */
    this.clip2 = function (coord, dx, dy) {
        var cx = this.maxX - coord.x;
        var cy = coord.y - this.minY;
        var d = -dx / dy;
        var c = cx / cy;
        if (d < c) {
            return {x: (coord.x + (d * cy)), y: this.minY};
        }
        return {x: this.maxX, y: (coord.y - (cx / d))};
    }

    /**
     * clip in quadrant III
     */
    this.clip3 = function (coord, dx, dy) {
        var cx = this.maxX - coord.x;
        var cy = this.maxY - coord.y;
        var d = dx / dy;
        var c = cx / cy;
        if (d < c) {
            return {x: (coord.x + (d * cy)), y: this.maxY};
        }
        return {x: this.maxX, y: (coord.y + (cx / d))};
    }

    /**
     * clip in quadrant IV
     */
    this.clip4 = function (coord, dx, dy) {
        var cx = coord.x - this.minX;
        var cy = this.maxY - coord.y;
        var d = -dx / dy;
        var c = cx / cy;
        if (d < c) {
            return {x: (coord.x - (d * cy)), y: this.maxY};
        }
        return {x: this.minX, y: (coord.y + (cx / d))};
    }
}
