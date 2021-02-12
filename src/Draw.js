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
        var type = atom.getType();
        var sym = type.getIsotope().getSymbol();
        var chg = atom.getCharge();
        var rad = atom.getRadical();
        var hcnt = atom.getHydrogenCount(this.molecule);

        this.view.setFont();
        var dx = ctx.measureText(sym).width;
        var dy = this.view.getFontSize();
        var coord = this.view.getCoord(atom);
        var x = coord.x - (dx / 2);
        var y = coord.y;

        atom.bbox = new Box(x - 1, y - (dy / 2), x + dx + 1, y + (dy / 2) + 1);
        ctx.fillStyle = type.getColor();
        ctx.fillText(sym, x, y + (dy / 2) - 2);

        var chgdx = 0;
        var chgdy = 0;
        var chgx = x + dx;
        var chgy = y - (0.2 * dy);

        // isotope mass
        if (atom.getType().getIsotope().getIsotope() > 0) {
            this.view.setSubscript();
            var lbl = atom.getType().getIsotope().getMass();

            var isodx = ctx.measureText(lbl).width;
            var isody = this.view.getSubscriptSize();
            var isox = x - isodx;
            var isoy = chgy;

            var bx = new Box(isox, isoy, isox + isodx + 1, isoy - isody - 1);
            atom.bbox.join(bx);

            ctx.fillStyle = type.getColor();
            ctx.fillText(lbl, isox, isoy);
        }

        // charge and radical indicators
        if ((chg != 0) || (rad != 0)) {
            this.view.setSubscript();
            var lbl = this.getChargeLabel(chg, rad);
            chgdx = ctx.measureText(lbl).width;
            chgdy = this.view.getSubscriptSize();

            var bx = new Box(chgx, chgy, chgx + chgdx + 1, chgy - chgdy - 1);
            //	bx.draw(ctx);
            //	atom.bbox.draw(ctx);
            atom.bbox.join(bx);

            ctx.fillStyle = type.getColor();
            ctx.fillText(lbl, chgx, chgy);
        }

        var hdx = ctx.measureText("H").width;
        var hdy = dy;
        var hx = chgx + chgdx;
        var hy = y;

        // this is just a crude approximation!
        if((hcnt > 0) && (sym != "C")) { 
            this.view.setFont();
            hdx = ctx.measureText("H").width;
            ctx.fillStyle = type.getColor();
            ctx.fillText("H", hx, (hy + (hdy / 2) - 2));
            var bx = new Box(hx, hy, hx + hdx + 1, hy - hdy -1);
            atom.bbox.join(bx);

            if(hcnt > 1) {
                this.view.setSubscript();
                var lbl = hcnt + " ";
                hx += hdx;      // old hdx
                hy = y + (0.8 * dy);
                hdx = ctx.measureText(lbl).width;
                hdy = this.view.getSubscriptSize();
                bx = new Box(hx, hy, hx + hdx, hy - hdy - 1);
                atom.bbox.join(bx);
                ctx.fillStyle = type.getColor();
                ctx.fillText(lbl, hx, hy);
            }
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

        var  scale = this.view.molScale / (12 * Math.sqrt(dx*dx + dy*dy));

        if (atomA.bbox != null) {
            //atomA.bbox.draw(ctx);
            coord1 = atomA.bbox.clip(coord1, dx, dy);
        }
        if (atomB.bbox != null) {
            //atomB.bbox.draw(ctx);
            coord2 = atomB.bbox.clip(coord2, -dx, -dy);
        }

        ctx.moveTo(coord1.x, coord1.y);
        switch(bond.getStereo()) {
            case 0: // not stereo
                ctx.lineTo(coord2.x, coord2.y);
                ctx.stroke();
                break;
            case 1: // up - solid wedge
                var coord3 = {x: (coord2.x - (scale * dy)), y: (coord2.y + (scale * dx))};
                var coord4 = {x: (coord2.x + (scale * dy)), y: (coord2.y - (scale * dx))};
                ctx.lineTo(coord3.x, coord3.y);
                ctx.lineTo(coord4.x, coord4.y);
                ctx.lineTo(coord1.x, coord1.y);
                ctx.fillStyle = "#000000";
                ctx.fill();
                break;
            case 3: // down - hashed (wedge)
                ctx.setLineDash([2, 3]);
                ctx.lineWidth = 6;
                ctx.lineTo(coord2.x, coord2.y);
                ctx.stroke();
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                break;
            case 2: // either (wavy)
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
                st = "-";
                break;
            case 0:
                break;
            default:
                st = Math.abs(chg) + ((chg > 0) ? "+" : "-");
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

}
