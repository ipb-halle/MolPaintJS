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

    molpaintjs.DrawCanvas = function (v, d) {

        let view = v;
        let drawing = d;
        let currentChemObject;

        function drawChemObject (ctx) {
            drawAtoms(ctx);
            drawBonds(ctx);
            drawSGroups(ctx);
        }

        /**
         * draw all atoms which
         * - are hetero-atoms
         * - have no bonds to other atoms
         */
        function drawAtoms (ctx) {
            let atoms = currentChemObject.getAtoms();
            for (let i in atoms) {
                let a = atoms[i];
                if (a.getSelected()) {
                    drawAtomSelection(ctx, a);
                }
                if ((a.getType().getIsotope().getSymbol() !== "C")
                    || (a.getCharge() !== 0)
                    || (a.getRadical() !== 0)
                    || (a.getType().getIsotope().getIsotope() !== 0)
                    || (Object.keys(a.getBonds()).length === 0)) {
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
            let coord = view.getCoord(atom);
            let r = view.getFontSize() * 0.6;
            ctx.save();
            setAtomStyle(ctx, atom.getSelected());
            ctx.moveTo(coord.x + r, coord.y);
            ctx.arc(coord.x, coord.y, r, 0, 2.0 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
        }

        function drawBonds (ctx) {
            let bonds = currentChemObject.getBonds();
            for (let i in bonds) {
                let b = bonds[i];
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

        function drawBracket (ctx, coords, other) {
            let x1 = coords[0];
            let y1 = coords[1];
            let x2 = coords[3];
            let y2 = coords[4];
            let otherCentroidX = 0.0;
            let otherCentroidY = 0.0;

            if (other !== undefined) {
                otherCentroidX = (other[0] + other[3]) / 2.0;
                otherCentroidY = (other[1] + other[4]) / 2.0;
            }

            // we make no assumptions - compute the direction of the bracket fins
            let centroidX = (x1 + x2) / 2.0;
            let centroidY = (y1 + y2) / 2.0;
            let tickX = 0.1 * (y1 - y2);
            let tickY = 0.1 * (x1 - x2);
            let dx = otherCentroidX - centroidX;
            let dy = otherCentroidY - centroidY;
            if (((tickX * dx) + (tickY * dy)) < 0.0) {
                tickX *= -1.0;
                tickY *= -1.0;
            }

            ctx.moveTo(view.getCoordX(x1 + tickX), view.getCoordY(y1 - tickY));
            ctx.lineTo(view.getCoordX(x1), view.getCoordY(y1));
            ctx.lineTo(view.getCoordX(x2), view.getCoordY(y2));
            ctx.lineTo(view.getCoordX(x2 + tickX), view.getCoordY(y2 - tickY));
            ctx.stroke();
            ctx.beginPath();
        }

        function drawBrackets (ctx, sgroup) {
            let coords = sgroup.getBRKXYZ();
            ctx.save();
            if (sgroup.getSelected()) {
                setBondStyle(ctx, sgroup.getSelected());
            }
            drawBracket(ctx, coords[0].data, coords[1].data);
            if (coords[1] !== undefined) {
                drawBracket(ctx, coords[1].data, coords[0].data);
            }
            ctx.restore();
        }

        function drawSGroups (ctx) {
            let sgroups = currentChemObject.getSGroups();
            for (let idx in sgroups) {
                let sgroup = sgroups[idx];
                if (sgroup.getType() === 'DAT') {
                    let coord = sgroup.getFieldDispositionCoordinates();
                    drawText(ctx, coord.x, coord.y, sgroup.getFieldData());
                }
                if (sgroup.getBRKXYZ() != null) {
                    drawBrackets (ctx, sgroup);
                }
            }
        }

        function drawText (ctx, x, y, text) {
            view.setFont();
            ctx.fillStyle = "#000020";
            ctx.fillText(text, view.getCoordX(x), view.getCoordY(y));
        }

        /**
         * draw a single atom
         */
        function drawSingleAtom (ctx, atom) {
            let sym = atom.getType().getIsotope().getSymbol();

            view.setFont();
            let symbolWidth = ctx.measureText(sym).width;
            let symbolHeight = view.getFontSize();
            let coord = view.getCoord(atom);
            let x = coord.x - (symbolWidth / 2);
            let y = coord.y;

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
            let charge = atom.getCharge();
            let radical = atom.getRadical();
            if ((charge != 0) || (radical != 0)) {
                let chargeX = atom.getBBox().getMaxX();
                let chargeY =  view.getCoord(atom).y - (0.2 * symbolHeight);
                view.setSubscript();
                let label = getChargeLabel(charge, radical);
                let chargeWidth = ctx.measureText(label).width;
                let chargeHeight = view.getSubscriptSize();

                let bx = molPaintJS.Box(chargeX, chargeY, chargeX + chargeWidth + 1, chargeY - chargeHeight - 1);
                atom.getBBox().join(bx);

                ctx.fillText(label, chargeX, chargeY);
            }
        }

        function drawIsotopeMass (ctx, atom, symbolHeight) {
            if (atom.getType().getIsotope().getIsotope() > 0) {
                view.setSubscript();
                let label = atom.getType().getIsotope().getMass();

                let isoWidth = ctx.measureText(label).width;
                let isoHeight = view.getSubscriptSize();
                let isoX = atom.getBBox().getMinX() - isoWidth;
                let isoY = view.getCoord(atom).y - (0.2 * symbolHeight);

                let bx = molPaintJS.Box(isoX, isoY, isoX + isoWidth + 1, isoY - isoHeight - 1);
                atom.getBBox().join(bx);

                ctx.fillText(label, isoX, isoY);
            }
        }

        function drawHydrogen (ctx, atom, symbolHeight) {
            let hCount = atom.getHydrogenCount(currentChemObject);
            if (hCount > 0) {
                let hWidth = ctx.measureText("H").width;
                let hx = atom.getBBox().getMaxX();
                let hy = view.getCoord(atom).y;
                if (getHydrogenLabelPositionRight(atom)) {
                    view.setFont();

                    ctx.fillText("H", hx, (hy + (symbolHeight / 2) - 2));
                    let bx = molPaintJS.Box(hx, hy, hx + hWidth + 1, hy - symbolHeight - 1);
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
                    let bx = molPaintJS.Box(hx, hy, hx + hWidth + 1, hy - symbolHeight - 1);
                    atom.getBBox().join(bx);
                }
            }
        }

        function drawHydrogenCount (ctx, atom, x, y, hCount, isRight) {
            view.setSubscript();
            let label = hCount + " ";
            let lWidth = ctx.measureText(label).width;
            let lHeight = view.getSubscriptSize();
            let lx = isRight ? x : x - lWidth;
            let bx = molPaintJS.Box(lx, y, lx + lWidth, y - lHeight - 1);
            atom.getBBox().join(bx)
            ctx.fillText(label, lx, y);
        }

        function drawDoubleBond (ctx, bond) {

            let atomA = bond.getAtomA();
            let atomB = bond.getAtomB();
            let coord1 = view.getCoord(atomA);
            let coord2 = view.getCoord(atomB);
            let dx = coord1.x - coord2.x;
            let dy = coord1.y - coord2.y;

            let scale = view.getMolScale() / (8 * Math.sqrt(dx*dx + dy*dy));

            let coord3 = {x: (coord1.x - (scale * (dy + dx))), y: (coord1.y + (scale * (dx - dy)))};
            let coord4 = {x: (coord2.x - (scale * (dy - dx))), y: (coord2.y + (scale * (dx + dy)))};

            if (atomA.getBBox() != null) {
                coord1 = atomA.getBBox().clip(coord1, dx, dy);
                coord3 = atomA.getBBox().clip(coord3, dx, dy);
            }
            if (atomB.getBBox() != null) {
                coord2 = atomB.getBBox().clip(coord2, -dx, -dy);
                coord4 = atomB.getBBox().clip(coord4, -dx, -dy);
            }

            ctx.save();
            if (bond.getSelected()) {
                setBondStyle(ctx, bond.getSelected());
            }
            ctx.moveTo(coord1.x, coord1.y);
            ctx.lineTo(coord2.x, coord2.y);
            ctx.moveTo(coord3.x, coord3.y);
            ctx.lineTo(coord4.x, coord4.y);
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
        }

        function drawSingleBond (ctx, bond) {

            let atomA = bond.getAtomA();
            let atomB = bond.getAtomB();
            let coord1 = view.getCoord(atomA);
            let coord2 = view.getCoord(atomB);
            let dx = coord1.x - coord2.x;
            let dy = coord1.y - coord2.y;

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
            let len = Math.sqrt(dx*dx + dy*dy);
            let scale = 0.5 / Math.sqrt(len);
            let x3, x4, y3, y4;

            ctx.save()
            ctx.moveTo(coord1.x, coord1.y);
            if (bond.getSelected()) {
                setBondStyle(ctx, bond.getSelected());
            }
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
                    let l = 0;
                    x3 = coord1.x;
                    y3 = coord1.y;
                    dx = 4 * dx / len;
                    dy = 4 * dy / len;
                    let ddx = 0.5 * dx;
                    let ddy = 0.5 * dy;
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
            ctx.restore();
            ctx.beginPath();
        }

        function drawTripleBond (ctx, bond) {
            let atomA = bond.getAtomA();
            let atomB = bond.getAtomB();
            let coord1 = view.getCoord(atomA);
            let coord2 = view.getCoord(atomB);
            let dx = coord1.x - coord2.x;
            let dy = coord1.y - coord2.y;

            let scale = view.getMolScale() / (8 * Math.sqrt(dx*dx + dy*dy));

            let coord3 = {x: (coord1.x - (scale * (dy + dx))), y: (coord1.y + (scale * (dx - dy)))};
            let coord4 = {x: (coord2.x - (scale * (dy - dx))), y: (coord2.y + (scale * (dx + dy)))};
            let coord5 = {x: (coord1.x + (scale * (dy - dx))), y: (coord1.y - (scale * (dx + dy)))};
            let coord6 = {x: (coord2.x + (scale * (dy + dx))), y: (coord2.y - (scale * (dx - dy)))};

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

            ctx.save();
            if (bond.getSelected()) {
                setBondStyle(ctx, bond.getSelected());
            }
            ctx.moveTo(coord1.x, coord1.y);
            ctx.lineTo(coord2.x, coord2.y);
            ctx.moveTo(coord3.x, coord3.y);
            ctx.lineTo(coord4.x, coord4.y);
            ctx.moveTo(coord5.x, coord5.y);
            ctx.lineTo(coord6.x, coord6.y);
            ctx.stroke();
            ctx.restore();
            ctx.beginPath();
        }

        /**
         * compute the charge and radical label. Triplet radicals are
         * denoted as colon at the atom symbol; singlet radicals are
         * denoted as colon after the (possibly empty) charge label.
         * @return string with charge and radical symbol
         */
        function getChargeLabel (chg, rad) {
            let st = "";
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
            let rightFree = true;
            let leftFree = true;
            for(let id in atom.getBonds()) {
                let bond = currentChemObject.getBond(id);
                let neighbourAtom = bond.getAtomA();
                if (neighbourAtom.getId() == atom.getId()) {
                    neighbourAtom = bond.getAtomB();
                }
                let dx = atom.getX() - neighbourAtom.getX();
                let dy = atom.getY() - neighbourAtom.getY();
                let lenSq = dx*dx + dy*dy;
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

        function setAtomStyle(ctx, sel) {
            if ((sel & 2) != 0) {
                // selected
                ctx.strokeStyle = "#bbffbb";
                ctx.fillStyle = "#bbffbb";
                return;
            }
            if ((sel & 1) != 0) {
                // temp selected
                ctx.strokeStyle = "#ffbbbb";
                ctx.fillStyle = "#ffbbbb";
                return;
            }
            if ((sel & 4) != 0) {
                // highligted
                ctx.strokeStyle = "#bbbbff";
                ctx.fillStyle = "#bbbbff";
                return;
            }
        }


        function setBondStyle(ctx, sel) {
            if ((sel & 2) != 0) {
                // selected
                ctx.strokeStyle = "#22ff22";
                ctx.fillStyle = "#22ff22";
                return;
            }
            if ((sel & 1) != 0) {
                // temp selected
                ctx.strokeStyle = "#ff2222";
                ctx.fillStyle = "#ff2222";
                return;
            }
            if ((sel & 4) != 0) {
                // highligted
                ctx.strokeStyle = "#2222ff";
                ctx.fillStyle = "#2222ff";
                return;
            }
        }

        /**
         * @return a triangular clipping path according to the given coordinates
         */
        function wedgeClipping (x1, y1, x2, y2, x3, y3) {
            let path = new Path2D();
            path.moveTo(x1,y1);
            path.lineTo(x2,y2);
            path.lineTo(x3,y3);
            path.closePath();
            return path;
        }


        function drawReactionArrow (ctx, roleBoundingBoxes) {
            let eductBox = roleBoundingBoxes['educt'];
            let productBox = roleBoundingBoxes['product'];

            if (eductBox && productBox) {
                ctx.fillStyle = "#000000";
                ctx.strokeStyle = "#000000";

                eductBox = view.getBBox(eductBox);
                productBox = view.getBBox(productBox);

                let startX = eductBox.getCenterX();
                let startY = eductBox.getCenterY();
                let endX = productBox.getCenterX();
                let endY = productBox.getCenterY();
                let dx = endX - startX;
                let dy = endY - startY;
                let start = eductBox.clip({x: startX, y: startY}, -dx, -dy);
                let end = productBox.clip({x: endX, y: endY}, dx, dy);
                startX = start.x;
                startY = start.y
                endX = end.x;
                endY = end.y;
                dx = endX - startX;
                dy = endY - startY;
                let l = Math.sqrt((dx * dx) + (dy * dy));
                startX += 0.1 * dx;
                endX -= 0.1 * dx;
                startY += 0.1 * dy;
                endY -= 0.1 * dy;
                ctx.moveTo(startX, startY);
                ctx.lineTo(endX, endY);
                ctx.stroke();
                dx /= l;
                dy /= l;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - 4*dy - 10*dx, endY + 4*dx - 10*dy);
                ctx.lineTo(endX + 4*dy - 10*dx, endY - 4*dx - 10*dy);
                ctx.lineTo(endX, endY);
                ctx.fill();
                ctx.stroke();
            }
        }

        return {

            /**
             * module entry point
             */
            draw : function () {
                view.init();
                let ctx = view.getViewContext();
                ctx.clearRect(0, 0, view.getSizeX(), view.getSizeY());
                let roleBoundingBoxes = {};

                let chemObjectsByRole = drawing.getRoles();
                for (let role in chemObjectsByRole) {
                    for (let cid in chemObjectsByRole[role]) {
                        ctx.beginPath();
                        ctx.fillStyle = "#000000";
                        ctx.strokeStyle = "#000000";
                        ctx.lineWidth = 1;
                        currentChemObject = drawing.getChemObjects()[cid];
                        drawChemObject(ctx);
                        let bbox = currentChemObject.computeBBox(0);
                        roleBoundingBoxes[role] = (roleBoundingBoxes[role] !== undefined) ? roleBoundingBoxes[role].join(bbox) : bbox;
                    }
                }

                drawReactionArrow(ctx, roleBoundingBoxes);

                // begin a new path for subsequent drawing operationsi,
                // e.g. bounding boxes from PointerTool
                ctx.beginPath();
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));
