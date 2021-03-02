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
"use strict";

var molPaintJS = (function (molpaintjs) {

    molpaintjs.Draw = function (v, mol) {

        var view = v;
        var molecule = mol;

        /**
         * draw all atoms which
         * - are hetero-atoms
         * - have no bonds to other atoms
         */
        function drawAtoms (ctx) {
            var atoms = molecule.getAtoms();
            for (var i in atoms) {
                var a = atoms[i];
                if (a.getSelected()) {
                    drawAtomSelection(ctx, a);
                }
                if ((a.getType().getIsotope().getSymbol() != "C")
                    || (a.getCharge() != 0)
                    || (a.getRadical() != 0)
                    || (a.getType().getIsotope().getIsotope() != 0)
                    || (Object.keys(a.getBonds()).length == 0)) {
                    drawSingleAtom(ctx, a);
                } else {
                    a.setBBox(null);
                }
            }
        }

        /**
         * draw a circle around selected atoms
         */
        function drawAtomSelection (ctx, atom) {
            var coord = view.getCoord(atom);
            var r = view.getFontSize() * 0.6;
            ctx.save();
            ctx.lineWidth = 4;
            setStrokeStyle(ctx, atom.getSelected());
            ctx.moveTo(coord.x + r, coord.y);
            ctx.arc(coord.x, coord.y, r, 0, 2.0 * Math.PI);
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
        }

        function drawBonds (ctx) {
            var bonds = molecule.getBonds();
            for (var i in bonds) {
                var b = bonds[i];
                if (b.getSelected()) {
                    drawBondSelection(ctx, b);
                }
                switch (b.getType()) {
                    case 1 :
                        drawSingleBond(ctx, b);
                        break;
                    case 2 :
                        drawDoubleBond(ctx, b);
                        break;
                    case 3 :
                        drawTripleBond(ctx, b);
                        break;
                    default :
                        alert("unknown bond type: " + b.getType());
                }
            }
        }


        function drawBondSelection (ctx, bond) {

            var atomA = bond.getAtomA();
            var atomB = bond.getAtomB();
            var coord1 = view.getCoord(atomA);
            var coord2 = view.getCoord(atomB);
            var dx = coord1.x - coord2.x;
            var dy = coord1.y - coord2.y;

            if (atomA.getBBox() != null) {
                coord1 = atomA.getBBox().clip(coord1, dx, dy);
            }
            if (atomB.getBBox() != null) {
                coord2 = atomB.getBBox().clip(coord2, -dx, -dy);
            }

            ctx.save();
            ctx.lineWidth = 4;
            setStrokeStyle(ctx, bond.getSelected());
            ctx.moveTo(coord1.x, coord1.y);
            ctx.lineTo(coord2.x, coord2.y);
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
        }

        /**
         * draw a single atom
         */
        function drawSingleAtom (ctx, atom) {
            var sym = atom.getType().getIsotope().getSymbol();

            view.setFont();
            var symbolWidth = ctx.measureText(sym).width;
            var symbolHeight = view.getFontSize();
            var coord = view.getCoord(atom);
            var x = coord.x - (symbolWidth / 2);
            var y = coord.y;

            atom.setBBox(molPaintJS.Box(x - 1, y - (symbolHeight / 2), x + symbolWidth + 1, y + (symbolHeight / 2) + 1));
            ctx.fillStyle = atom.getType().getColor();
            ctx.fillText(sym, x, y + (symbolHeight/ 2) - 2);

            drawIsotopeMass(ctx, atom, symbolHeight);
            drawChargeRadical(ctx, atom, symbolHeight);
            if (sym != "C") {
                drawHydrogen(ctx, atom, symbolHeight);
            }
        }

        function drawChargeRadical (ctx, atom, symbolHeight) {
            var charge = atom.getCharge();
            var radical = atom.getRadical();
            if ((charge != 0) || (radical != 0)) {
                var chargeX = atom.getBBox().getMaxX();
                var chargeY =  view.getCoord(atom).y - (0.2 * symbolHeight);
                view.setSubscript();
                var label = getChargeLabel(charge, radical);
                var chargeWidth = ctx.measureText(label).width;
                var chargeHeight = view.getSubscriptSize();

                var bx = molPaintJS.Box(chargeX, chargeY, chargeX + chargeWidth + 1, chargeY - chargeHeight - 1);
                atom.getBBox().join(bx);

                ctx.fillText(label, chargeX, chargeY);
            }
        }

        function drawIsotopeMass (ctx, atom, symbolHeight) {
            if (atom.getType().getIsotope().getIsotope() > 0) {
                view.setSubscript();
                var label = atom.getType().getIsotope().getMass();

                var isoWidth = ctx.measureText(label).width;
                var isoHeight = view.getSubscriptSize();
                var isoX = atom.getBBox().getMinX() - isoWidth;
                var isoY = view.getCoord(atom).y - (0.2 * symbolHeight);

                var bx = molPaintJS.Box(isoX, isoY, isoX + isoWidth + 1, isoY - isoHeight - 1);
                atom.getBBox().join(bx);

                ctx.fillText(label, isoX, isoY);
            }
        }

        function drawHydrogen (ctx, atom, symbolHeight) {
            var hCount = atom.getHydrogenCount(molecule);
            if (hCount > 0) {
                var hWidth = ctx.measureText("H").width;
                var hx = atom.getBBox().getMaxX();
                var hy = view.getCoord(atom).y;
                if (getHydrogenLabelPositionRight(atom)) {
                    view.setFont();

                    ctx.fillText("H", hx, (hy + (symbolHeight / 2) - 2));
                    var bx = molPaintJS.Box(hx, hy, hx + hWidth + 1, hy - symbolHeight - 1);
                    atom.getBBox().join(bx);

                    if (hCount > 1) {
                        hx = atom.getBBox().getMaxX(); 
                        hy += (0.8 * symbolHeight);
                        drawHydrogenCount(ctx, atom, hx, hy, hCount, true);
                    }
                } else {
                    hx = atom.getBBox().getMinX() + 2;
                    if (hCount > 1) {
                        hy += (0.8 * symbolHeight);
                        drawHydrogenCount(ctx, atom, hx, hy, hCount, false);
                    }
                    hx = atom.getBBox().getMinX() - hWidth;
                    hy = view.getCoord(atom).y;
                    view.setFont();
                    ctx.fillText("H", hx, (hy + (symbolHeight / 2) - 2));
                    var bx = molPaintJS.Box(hx, hy, hx + hWidth + 1, hy - symbolHeight - 1);
                    atom.getBBox().join(bx);
                }
            }
        }

        function drawHydrogenCount (ctx, atom, x, y, hCount, isRight) {
            view.setSubscript();
            var label = hCount + " ";
            var lWidth = ctx.measureText(label).width;
            var lHeight = view.getSubscriptSize();
            var lx = isRight ? x : x - lWidth;
            var bx = molPaintJS.Box(lx, y, lx + lWidth, y - lHeight - 1);
            atom.getBBox().join(bx)
            ctx.fillText(label, lx, y);
        }

        function drawDoubleBond (ctx, bond) {

            var atomA = bond.getAtomA();
            var atomB = bond.getAtomB();
            var coord1 = view.getCoord(atomA);
            var coord2 = view.getCoord(atomB);
            var dx = coord1.x - coord2.x;
            var dy = coord1.y - coord2.y;

            var scale = view.getMolScale() / (8 * Math.sqrt(dx*dx + dy*dy));

            var coord3 = {x: (coord1.x - (scale * (dy + dx))), y: (coord1.y + (scale * (dx - dy)))};
            var coord4 = {x: (coord2.x - (scale * (dy - dx))), y: (coord2.y + (scale * (dx + dy)))};

            if (atomA.getBBox() != null) {
                coord1 = atomA.getBBox().clip(coord1, dx, dy);
                coord3 = atomA.getBBox().clip(coord3, dx, dy);
            }
            if (atomB.getBBox() != null) {
                coord2 = atomB.getBBox().clip(coord2, -dx, -dy);
                coord4 = atomB.getBBox().clip(coord4, -dx, -dy);
            }

            ctx.moveTo(coord1.x, coord1.y);
            ctx.lineTo(coord2.x, coord2.y);
            ctx.moveTo(coord3.x, coord3.y);
            ctx.lineTo(coord4.x, coord4.y);
            ctx.stroke();
            ctx.beginPath();
        }

        function drawSingleBond (ctx, bond) {

            var atomA = bond.getAtomA();
            var atomB = bond.getAtomB();
            var coord1 = view.getCoord(atomA);
            var coord2 = view.getCoord(atomB);
            var dx = coord1.x - coord2.x;
            var dy = coord1.y - coord2.y;

            if (atomA.getBBox() != null) {
                //atomA.getBBox().draw(ctx);
                coord1 = atomA.getBBox().clip(coord1, dx, dy);
            }
            if (atomB.getBBox() != null) {
                //atomB.getBBox().draw(ctx);
                coord2 = atomB.getBBox().clip(coord2, -dx, -dy);
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
                    ctx.clip(wedgeClipping(coord1.x, coord1.y, x3, y3, x4, y4));
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
                    ctx.clip(wedgeClipping(coord1.x, coord1.y, x3, y3, x4, y4));
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

        function drawTripleBond (ctx, bond) {
            var atomA = bond.getAtomA();
            var atomB = bond.getAtomB();
            var coord1 = view.getCoord(atomA);
            var coord2 = view.getCoord(atomB);
            var dx = coord1.x - coord2.x;
            var dy = coord1.y - coord2.y;

            var scale = view.getMolScale() / (8 * Math.sqrt(dx*dx + dy*dy));

            var coord3 = {x: (coord1.x - (scale * (dy + dx))), y: (coord1.y + (scale * (dx - dy)))};
            var coord4 = {x: (coord2.x - (scale * (dy - dx))), y: (coord2.y + (scale * (dx + dy)))};
            var coord5 = {x: (coord1.x + (scale * (dy - dx))), y: (coord1.y - (scale * (dx + dy)))};
            var coord6 = {x: (coord2.x + (scale * (dy + dx))), y: (coord2.y - (scale * (dx - dy)))};

            if (atomA.getBBox() != null) {
                coord1 = atomA.getBBox().clip(coord1, dx, dy);
                coord3 = atomA.getBBox().clip(coord3, dx, dy);
                coord5 = atomA.getBBox().clip(coord5, dx, dy);
            }
            if (atomB.getBBox() != null) {
                coord2 = atomB.getBBox().clip(coord2, -dx, -dy);
                coord4 = atomB.getBBox().clip(coord4, -dx, -dy);
                coord6 = atomB.getBBox().clip(coord6, -dx, -dy);
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
        function getChargeLabel (chg, rad) {
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
         * check whether an atom has a bond from right: in this case the hydrogen 
         * label must be displayed on the left, if not bond from left is present
         */
        function getHydrogenLabelPositionRight (atom) {
            var rightFree = true;
            var leftFree = true;
            for(var id in atom.getBonds()) {
                var bond = molecule.getBond(id);
                var neighbourAtom = bond.getAtomA();
                if (neighbourAtom.getId() == atom.getId()) {
                    neighbourAtom = bond.getAtomB();
                }
                var dx = atom.getX() - neighbourAtom.getX();
                var dy = atom.getY() - neighbourAtom.getY();
                var lenSq = dx*dx + dy*dy;
                if ((dy * dy / lenSq) < 0.8) {
                    if (dx < 0) {
                        rightFree = false;
                    } else {
                        leftFree = false;
                    }
                } 
            }
            return rightFree || (! leftFree);
        }

        function setStrokeStyle(ctx, sel) {
            if ((sel & 2) != 0) {
                // selected
                ctx.strokeStyle = "#22ff22";
                return;
            }
            if ((sel & 1) != 0) {
                // temp selected
                ctx.strokeStyle = "#ff2222";
                return;
            }
            if ((sel & 4) != 0) {
                // highligted
                ctx.strokeStyle = "#2222ff";
                return;
            }
        }

        /**
         * @return a triangular clipping path according to the given coordinates
         */
        function wedgeClipping (x1, y1, x2, y2, x3, y3) {
            var path = new Path2D();
            path.moveTo(x1,y1);
            path.lineTo(x2,y2);
            path.lineTo(x3,y3);
            path.closePath();
            return path;
        }

        return {

            /**
             * module entry point
             */
            draw : function () {
                view.init();
                var ctx = view.getViewContext();
                ctx.clearRect(0, 0, view.getSizeX(), view.getSizeY());
                ctx.beginPath();
                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 1;
                drawAtoms(ctx);
                drawBonds(ctx);

                // begin a new path for subsequent drawing operations
                ctx.beginPath();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
