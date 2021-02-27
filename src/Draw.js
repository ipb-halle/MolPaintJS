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

function Draw(v, mol) {

    this.view = v;
    this.molecule = mol;

    /**
     * module entry point
     */
    this.draw = function () {
        this.view.init();
        var ctx = this.view.getContext();
        ctx.clearRect(0, 0, this.view.getSizeX(), this.view.getSizeY());
        ctx.beginPath();
        ctx.fillStyle = "#000000";
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 1;
        this.drawAtoms();
        this.drawBonds();

        // begin a new path for subsequent drawing operations
        ctx.beginPath();
    }

    /**
     * draw all atoms which
     * - are hetero-atoms
     * - have no bonds to other atoms
     */
    this.drawAtoms = function () {
        var atoms = this.molecule.getAtoms();
        for (var i in atoms) {
            var a = atoms[i];
            if (a.selected) {
                this.drawAtomSelection(a);
            }
            if ((a.getType().getIsotope().getSymbol() != "C")
                || (a.getCharge() != 0)
                || (a.getRadical() != 0)
                || (a.getType().getIsotope().getIsotope() != 0)
                || (Object.keys(a.getBonds()).length == 0)) {
                this.drawSingleAtom(a);
            } else {
                a.bbox = null;
            }
        }
    }

    /**
     * draw a circle around selected atoms
     */
    this.drawAtomSelection = function (atom) {
        var ctx = this.view.getContext();
        var coord = this.view.getCoord(atom);
        var r = this.view.getFontSize() * 0.6;
        ctx.save();
        ctx.lineWidth = 4;
        if (atom.selected == 2) {
            ctx.strokeStyle = "#22ff22";
        } else {
            ctx.strokeStyle = "#ff2222";
        }
        ctx.moveTo(coord.x + r, coord.y);
        ctx.arc(coord.x, coord.y, r, 0, 2.0 * Math.PI);
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
    }

    this.drawBonds = function () {
        var bonds = this.molecule.getBonds();
        for (var i in bonds) {
            var b = bonds[i];
            if (b.selected) {
                this.drawBondSelection(b);
            }
            switch (b.getType()) {
                case 1 :
                    this.drawSingleBond(b);
                    break;
                case 2 :
                    this.drawDoubleBond(b);
                    break;
                case 3 :
                    this.drawTripleBond(b);
                    break;
                default :
                    alert("unknown bond type: " + b.getType());
            }
        }
    }


    this.drawBondSelection = function (bond) {
        var ctx = this.view.getContext();

        var atomA = bond.getAtomA();
        var atomB = bond.getAtomB();
        var coord1 = this.view.getCoord(atomA);
        var coord2 = this.view.getCoord(atomB);
        var dx = coord1.x - coord2.x;
        var dy = coord1.y - coord2.y;

        if (atomA.bbox != null) {
            coord1 = atomA.bbox.clip(coord1, dx, dy);
        }
        if (atomB.bbox != null) {
            coord2 = atomB.bbox.clip(coord2, -dx, -dy);
        }

        ctx.save();
        ctx.lineWidth = 4;
        if (bond.selected == 2) {
            ctx.strokeStyle = "#22ff22";
        } else {
            ctx.strokeStyle = "#ff2222";
        }
        ctx.moveTo(coord1.x, coord1.y);
        ctx.lineTo(coord2.x, coord2.y);
        ctx.stroke();
        ctx.restore();
        ctx.beginPath();
    }

    /**
     * draw a single atom
     */
    this.drawSingleAtom = function (atom) {
        var ctx = this.view.getContext();
        var sym = atom.getType().getIsotope().getSymbol();
        var hcnt = atom.getHydrogenCount(this.molecule);

        this.view.setFont();
        var symbolWidth = ctx.measureText(sym).width;
        var symbolHeight = this.view.getFontSize();
        var coord = this.view.getCoord(atom);
        var x = coord.x - (symbolWidth / 2);
        var y = coord.y;

        atom.bbox = new Box(x - 1, y - (symbolHeight / 2), x + symbolWidth + 1, y + (symbolHeight / 2) + 1);
        ctx.fillStyle = atom.getType().getColor();
        ctx.fillText(sym, x, y + (symbolHeight/ 2) - 2);

        this.drawIsotopeMass(ctx, atom, symbolHeight);
        this.drawChargeRadical(ctx, atom, symbolHeight);

        var hWidth = ctx.measureText("H").width;
        var hHeight = symbolHeight;
        var hx = atom.bbox.maxX;
        var hy = y;

        // this is just a crude approximation!
        if((hcnt > 0) && (sym != "C")) { 
            this.view.setFont();
//          ctx.fillStyle = atom.getType().getColor();
            ctx.fillText("H", hx, (hy + (hHeight / 2) - 2));
            var bx = new Box(hx, hy, hx + hWidth + 1, hy - hHeight -1);
            atom.bbox.join(bx);

            if(hcnt > 1) {
                this.view.setSubscript();
                var label = hcnt + " ";
                hx += hWidth;   // old hWidth
                hy = y + (0.8 * symbolHeight);
                hWidth = ctx.measureText(label).width;
                hHeight = this.view.getSubscriptSize();
                bx = new Box(hx, hy, hx + hWidth , hy - hHeight - 1);
                atom.bbox.join(bx);
//              ctx.fillStyle = atom.getType().getColor();
                ctx.fillText(label, hx, hy);
            }
        }
    }

    this.drawChargeRadical = function (ctx, atom, symbolHeight) {
        var charge = atom.getCharge();
        var radical = atom.getRadical();
        if ((charge != 0) || (radical != 0)) {
            var chargeX = atom.bbox.maxX;
            var chargeY =  this.view.getCoord(atom).y - (0.2 * symbolHeight);
            this.view.setSubscript();
            var label = this.getChargeLabel(charge, radical);
            var chargeWidth = ctx.measureText(label).width;
            var chargeHeight = this.view.getSubscriptSize();

            var bx = new Box(chargeX, chargeY, chargeX + chargeWidth + 1, chargeY - chargeHeight - 1);
            atom.bbox.join(bx);

//          ctx.fillStyle = atom.getType().getColor();
            ctx.fillText(label, chargeX, chargeY);
        }
    }

    this.drawIsotopeMass = function (ctx, atom, symbolHeight) {
        if (atom.getType().getIsotope().getIsotope() > 0) {
            this.view.setSubscript();
            var label = atom.getType().getIsotope().getMass();

            var isoWidth = ctx.measureText(label).width;
            var isoHeight = this.view.getSubscriptSize();
            var isoX = atom.bbox.minX - isoWidth;
            var isoY = this.view.getCoord(atom).y - (0.2 * symbolHeight);

            var bx = new Box(isoX, isoY, isoX + isoWidth + 1, isoY - isoHeight - 1);
            atom.bbox.join(bx);

//          ctx.fillStyle = atom.getType().getColor();
            ctx.fillText(label, isoX, isoY);
        }
    }

    this.drawDoubleBond = function (bond) {
        var ctx = this.view.getContext();

        var atomA = bond.getAtomA();
        var atomB = bond.getAtomB();
        var coord1 = this.view.getCoord(atomA);
        var coord2 = this.view.getCoord(atomB);
        var dx = coord1.x - coord2.x;
        var dy = coord1.y - coord2.y;

        var scale = this.view.molScale / (8 * Math.sqrt(dx*dx + dy*dy));

        var coord3 = {x: (coord1.x - (scale * (dy + dx))), y: (coord1.y + (scale * (dx - dy)))};
        var coord4 = {x: (coord2.x - (scale * (dy - dx))), y: (coord2.y + (scale * (dx + dy)))};

        if (atomA.bbox != null) {
            coord1 = atomA.bbox.clip(coord1, dx, dy);
            coord3 = atomA.bbox.clip(coord3, dx, dy);
        }
        if (atomB.bbox != null) {
            coord2 = atomB.bbox.clip(coord2, -dx, -dy);
            coord4 = atomB.bbox.clip(coord4, -dx, -dy);
        }

        ctx.moveTo(coord1.x, coord1.y);
        ctx.lineTo(coord2.x, coord2.y);
        ctx.moveTo(coord3.x, coord3.y);
        ctx.lineTo(coord4.x, coord4.y);
        ctx.stroke();
        ctx.beginPath();
    }

    this.drawSingleBond = function (bond) {
        var ctx = this.view.getContext();

        var atomA = bond.getAtomA();
        var atomB = bond.getAtomB();
        var coord1 = this.view.getCoord(atomA);
        var coord2 = this.view.getCoord(atomB);
        var dx = coord1.x - coord2.x;
        var dy = coord1.y - coord2.y;

        if (atomA.bbox != null) {
            //atomA.bbox.draw(ctx);
            coord1 = atomA.bbox.clip(coord1, dx, dy);
        }
        if (atomB.bbox != null) {
            //atomB.bbox.draw(ctx);
            coord2 = atomB.bbox.clip(coord2, -dx, -dy);
        }

        dx = coord1.x - coord2.x;
        dy = coord1.y - coord2.y;
        var len = Math.sqrt(dx*dx + dy*dy);
        var scale = 0.5 / Math.sqrt(len);
        var x3, x4, y3, y4; 

        ctx.moveTo(coord1.x, coord1.y);
        switch(bond.getStereo()) {
            case 0: // not stereo
                ctx.lineTo(coord2.x, coord2.y);
                ctx.stroke();
                break;
            case 1: // up - solid wedge
                x3 = coord2.x - (dy * scale); 
                y3 = coord2.y + (dx * scale);
                x4 = coord2.x + (dy * scale);
                y4 = coord2.y - (dx * scale);

                ctx.save();
                ctx.lineWidth = 5 * len * scale;
                ctx.lineTo(coord2.x, coord2.y);
                ctx.clip(this.wedgeClipping(coord1.x, coord1.y, x3, y3, x4, y4));
                ctx.stroke();
                ctx.restore();
                ctx.closePath();
                break;

            case 3: // down - hashed (wedge)
                x3 = coord2.x - (dy * scale);
                y3 = coord2.y + (dx * scale);
                x4 = coord2.x + (dy * scale);
                y4 = coord2.y - (dx * scale);

                ctx.save();
                ctx.setLineDash([2, 3]);
                ctx.lineWidth = 5 * len * scale;
                ctx.lineTo(coord2.x, coord2.y);
                ctx.clip(this.wedgeClipping(coord1.x, coord1.y, x3, y3, x4, y4));
                ctx.stroke();
                ctx.restore();
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                ctx.closePath();
                break;

            case 2: // either (wavy)
                var l = 0;
                x3 = coord1.x;
                y3 = coord1.y;
                dx = 4 * dx / len;
                dy = 4 * dy / len;
                var ddx = 0.5 * dx;
                var ddy = 0.5 * dy;
                do {
                    x4 = x3 - dx;
                    y4 = y3 - dy;
                    ctx.arcTo(x3-ddy, y3+ddx, x4-ddy, y4+ddx, 2);
                    x3 = x4 - dx;
                    y3 = y4 - dy;
                    ctx.arcTo(x4+ddy, y4-ddx, x3+ddy, y3-ddx, 2);
                    l += 8;
                } while (l < (len - 6)); 
                ctx.lineTo(x3-ddy, y3+ddx); 
                ctx.stroke();
                break;

            default: // all others
                ctx.lineTo(coord2.x, coord2.y);
                ctx.stroke();
                break;
        }
        ctx.beginPath();
    }

    this.drawTripleBond = function (bond) {
        var ctx = this.view.getContext();
        var atomA = bond.getAtomA();
        var atomB = bond.getAtomB();
        var coord1 = this.view.getCoord(atomA);
        var coord2 = this.view.getCoord(atomB);
        var dx = coord1.x - coord2.x;
        var dy = coord1.y - coord2.y;

        var scale = this.view.molScale / (8 * Math.sqrt(dx*dx + dy*dy));

        var coord3 = {x: (coord1.x - (scale * (dy + dx))), y: (coord1.y + (scale * (dx - dy)))};
        var coord4 = {x: (coord2.x - (scale * (dy - dx))), y: (coord2.y + (scale * (dx + dy)))};
        var coord5 = {x: (coord1.x + (scale * (dy - dx))), y: (coord1.y - (scale * (dx + dy)))};
        var coord6 = {x: (coord2.x + (scale * (dy + dx))), y: (coord2.y - (scale * (dx - dy)))};

        if (atomA.bbox != null) {
            coord1 = atomA.bbox.clip(coord1, dx, dy);
            coord3 = atomA.bbox.clip(coord3, dx, dy);
            coord5 = atomA.bbox.clip(coord5, dx, dy);
        }
        if (atomB.bbox != null) {
            coord2 = atomB.bbox.clip(coord2, -dx, -dy);
            coord4 = atomB.bbox.clip(coord4, -dx, -dy);
            coord6 = atomB.bbox.clip(coord6, -dx, -dy);
        }

        ctx.moveTo(coord1.x, coord1.y);
        ctx.lineTo(coord2.x, coord2.y);
        ctx.moveTo(coord3.x, coord3.y);
        ctx.lineTo(coord4.x, coord4.y);
        ctx.moveTo(coord5.x, coord5.y);
        ctx.lineTo(coord6.x, coord6.y);
        ctx.stroke();
        ctx.beginPath();
    }

    /**
     * compute the charge and radical label. Triplet radicals are 
     * denoted as colon at the atom symbol; singlet radicals are 
     * denoted as colon after the (possibly empty) charge label.
     * @return string with charge and radical symbol
     */
    this.getChargeLabel = function (chg, rad) {
        var st = "";
        switch (chg) {
            case 1 :
                st = "+";
                break;
            case -1 :
                st = String.fromCharCode(0x2014);
                break;
            case 0:
                break;
            default:
                st = Math.abs(chg) + ((chg > 0) ? "+" : String.fromCharCode(0x2014));
        }
        switch (rad) {
            case 1 :            // singlet radical
                st += ":";
                break;
            case 2 :            // doublet radical
                st += "^";
                break;
            case 3 :            // triplet radical
                st += "^^";
                break;
        }
        return st;
    }


    /**
     * @return a triangular clipping path according to the given coordinates
     */
    this.wedgeClipping = function(x1, y1, x2, y2, x3, y3) {
        path = new Path2D();
        path.moveTo(x1,y1);
        path.lineTo(x2,y2);
        path.lineTo(x3,y3);
        path.closePath();
        return path;
    }
}
