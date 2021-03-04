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

    /**
     * List of elements and Isotopes
     * Includes isotopes with at least one day half live time.
     * Must be initialized before use
     */

    molpaintjs.Elements = function() {

        var elements = [];
        var elementsByName = {};

        function init() {
            // atomicNumber, period, group, symbol, mass, iso, massExact, color
            elements = [[],
                [molPaintJS.Isotope(1, 1, 1, "H", 1, 0, 1.008, "#666666"),
                    molPaintJS.Isotope(1, 1, 1, "H", 1, 1, 1.00782503223, "#666666"),
                    molPaintJS.Isotope(1, 1, 1, "D", 2, 1, 2.01410177812, "#666666"),
                    molPaintJS.Isotope(1, 1, 1, "T", 3, 1, 3.01604927791, "#666666")],
                [molPaintJS.Isotope(2, 1, 18, "He", 4, 0, 4.002602, "#000000"),
                    molPaintJS.Isotope(2, 1, 18, "He", 3, 1, 3.0160293191, "#000000"),
                    molPaintJS.Isotope(2, 1, 18, "He", 4, 1, 4.00260325415, "#000000")],
                [molPaintJS.Isotope(3, 2, 1, "Li", 7, 0, 6.94, "#ff0000"),
                    molPaintJS.Isotope(3, 2, 1, "Li", 6, 1, 6.015122795, "#ff0000"),
                    molPaintJS.Isotope(3, 2, 1, "Li", 7, 1, 7.016004555, "#ff0000")],
                [molPaintJS.Isotope(4, 2, 2, "Be", 9, 0, 9.0121831, "#ff0000"),
                    molPaintJS.Isotope(4, 2, 2, "Be", 7, 1, 7.01692983, "#ff0000"),
                    molPaintJS.Isotope(4, 2, 2, "Be", 9, 1, 9.012182, "#ff0000"),
                    molPaintJS.Isotope(4, 2, 2, "Be", 10, 1, 10.0135338, "#ff0000")],
                [molPaintJS.Isotope(5, 2, 13, "B", 11, 0, 10.81, "#000000"),
                    molPaintJS.Isotope(5, 2, 13, "B", 10, 1, 10.01293695, "#000000"),
                    molPaintJS.Isotope(5, 2, 13, "B", 11, 1, 11.00930536, "#000000")],
                [molPaintJS.Isotope(6, 2, 14, "C", 12, 0, 12.011, "#000000"),
                    molPaintJS.Isotope(6, 2, 14, "C", 12, 1, 12.0000000000, "#000000"),
                    molPaintJS.Isotope(6, 2, 14, "C", 13, 1, 13.00335483507, "#000000"),
                    molPaintJS.Isotope(6, 2, 14, "C", 14, 1, 14.0032419884, "#000000")],
                [molPaintJS.Isotope(7, 2, 15, "N", 14, 0, 14.0067, "#007700"),
                    molPaintJS.Isotope(7, 2, 15, "N", 14, 1, 14.0030740048, "#007700"),
                    molPaintJS.Isotope(7, 2, 15, "N", 15, 1, 15.0001088982, "#007700")],
                [molPaintJS.Isotope(8, 2, 16, "O", 16, 0, 15.999, "#0000aa"),
                    molPaintJS.Isotope(8, 2, 16, "O", 16, 1, 15.99491461956, "#0000aa"),
                    molPaintJS.Isotope(8, 2, 16, "O", 17, 1, 16.99913170, "#0000aa"),
                    molPaintJS.Isotope(8, 2, 16, "O", 18, 1, 17.9991610, "#0000aa")],
                [molPaintJS.Isotope(9, 2, 17, "F", 19, 0, 18.998403163, "#00ee00")],
                [molPaintJS.Isotope(10, 2, 18, "Ne", 20, 0, 20.1797, "#000000"),
                    molPaintJS.Isotope(10, 2, 18, "Ne", 20, 1, 19.9924401754, "#000000"),
                    molPaintJS.Isotope(10, 2, 18, "Ne", 21, 1, 20.99384668, "#000000"),
                    molPaintJS.Isotope(10, 2, 18, "Ne", 22, 1, 21.991385114, "#000000")],
                [molPaintJS.Isotope(11, 3, 1, "Na", 23, 0, 22.98976928, "#ff0000"),
                    molPaintJS.Isotope(11, 3, 1, "Na", 22, 1, 21.9944364, "#ff0000"),
                    molPaintJS.Isotope(11, 3, 1, "Na", 23, 1, 22.9897692809, "#ff0000")],
                [molPaintJS.Isotope(12, 3, 2, "Mg", 24, 0, 24.305, "#ff0000"),
                    molPaintJS.Isotope(12, 3, 2, "Mg", 24, 1, 23.985041700, "#ff0000"),
                    molPaintJS.Isotope(12, 3, 2, "Mg", 25, 1, 24.98583692, "#ff0000"),
                    molPaintJS.Isotope(12, 3, 2, "Mg", 26, 1, 25.982592929, "#ff0000")],
                [molPaintJS.Isotope(13, 3, 13, "Al", 27, 0, 26.9815385, "#ff0000"),
                    molPaintJS.Isotope(13, 3, 13, "Al", 26, 1, 25.98689169, "#ff0000"),
                    molPaintJS.Isotope(13, 3, 13, "Al", 27, 1, 26.98153863, "#ff0000")],
                [molPaintJS.Isotope(14, 3, 14, "Si", 28, 0, 28.085, "#ff0000"),
                    molPaintJS.Isotope(14, 3, 14, "Si", 28, 1, 27.9769265325, "#ff0000"),
                    molPaintJS.Isotope(14, 3, 14, "Si", 29, 1, 28.976494700, "#ff0000"),
                    molPaintJS.Isotope(14, 3, 14, "Si", 30, 1, 29.97377017, "#ff0000"),
                    molPaintJS.Isotope(14, 3, 14, "Si", 32, 1, 31.97414808, "#ff0000")],
                [molPaintJS.Isotope(15, 3, 15, "P", 31, 0, 30.973761998, "#ff0000"),
                    molPaintJS.Isotope(15, 3, 15, "P", 31, 1, 30.973761998, "#ff0000"),
                    molPaintJS.Isotope(15, 3, 15, "P", 32, 1, 31.97390727, "#ff0000"),
                    molPaintJS.Isotope(15, 3, 15, "P", 33, 1, 32.9717255, "#ff0000")],
                [molPaintJS.Isotope(16, 3, 16, "S", 32, 0, 32.06, "#ff0000"),
                    molPaintJS.Isotope(16, 3, 16, "S", 32, 1, 31.97207100, "#ff0000"),
                    molPaintJS.Isotope(16, 3, 16, "S", 33, 1, 32.97145876, "#ff0000"),
                    molPaintJS.Isotope(16, 3, 16, "S", 34, 1, 33.96786690, "#ff0000"),
                    molPaintJS.Isotope(16, 3, 16, "S", 35, 1, 34.96903216, "#ff0000"),
                    molPaintJS.Isotope(16, 3, 16, "S", 36, 1, 35.96708076, "#ff0000")],
                [molPaintJS.Isotope(17, 3, 17, "Cl", 35, 0, 35.45, "#00ee00"),
                    molPaintJS.Isotope(17, 3, 17, "Cl", 35, 1, 34.96885268, "#00ee00"),
                    molPaintJS.Isotope(17, 3, 17, "Cl", 36, 1, 35.96830698, "#00ee00"),
                    molPaintJS.Isotope(17, 3, 17, "Cl", 37, 1, 36.96590259, "#00ee00")],
                [molPaintJS.Isotope(18, 3, 18, "Ar", 40, 0, 39.948, "#000000"),
                    molPaintJS.Isotope(18, 3, 18, "Ar", 36, 1, 35.967545106, "#000000"),
                    molPaintJS.Isotope(18, 3, 18, "Ar", 37, 1, 36.96677632, "#000000"),
                    molPaintJS.Isotope(18, 3, 18, "Ar", 38, 1, 37.9627324, "#000000"),
                    molPaintJS.Isotope(18, 3, 18, "Ar", 39, 1, 38.964313, "#000000"),
                    molPaintJS.Isotope(18, 3, 18, "Ar", 40, 1, 39.9623831225, "#000000"),
                    molPaintJS.Isotope(18, 3, 18, "Ar", 42, 1, 41.963046, "#000000")],
                [molPaintJS.Isotope(19, 4, 1, "K", 39, 0, 39.0983, "#ff0000"),
                    molPaintJS.Isotope(19, 4, 1, "K", 39, 1, 38.96370649, "#ff0000"),
                    molPaintJS.Isotope(19, 4, 1, "K", 40, 1, 39.9639982, "#ff0000"),
                    molPaintJS.Isotope(19, 4, 1, "K", 41, 1, 40.96182526, "#ff0000")],
                [molPaintJS.Isotope(20, 4, 2, "Ca", 40, 0, 40.078, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 40, 1, 39.9625909, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 41, 1, 41.0, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 42, 1, 41.958618, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 43, 1, 42.958766, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 44, 1, 43.955482, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 45, 1, 45.0, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 46, 1, 45.95369, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 47, 1, 47.0, "#ff0000"),
                    molPaintJS.Isotope(20, 4, 2, "Ca", 48, 1, 47.9525228, "#ff0000")],
                [molPaintJS.Isotope(21, 4, 3, "Sc", 45, 0, 44.955908, "#000000"),
                    molPaintJS.Isotope(21, 4, 3, "Sc", 45, 1, 44.955908, "#000000")],
                [molPaintJS.Isotope(22, 4, 4, "Ti", 48, 0, 47.867, "#000000")],
                [molPaintJS.Isotope(23, 4, 5, "V", 51, 0, 50.9415, "#000000")],
                [molPaintJS.Isotope(24, 4, 6, "Cr", 52, 0, 51.9961, "#000000")],
                [molPaintJS.Isotope(25, 4, 7, "Mn", 55, 0, 54.938044, "#000000")],
                [molPaintJS.Isotope(26, 4, 8, "Fe", 56, 0, 55.845, "#000000")],
                [molPaintJS.Isotope(27, 4, 9, "Co", 59, 0, 58.933194, "#000000")],
                [molPaintJS.Isotope(28, 4, 10, "Ni", 58, 0, 58.6934, "#000000")],
                [molPaintJS.Isotope(29, 4, 11, "Cu", 63, 0, 63.546, "#000000")],
                [molPaintJS.Isotope(30, 4, 12, "Zn", 64, 0, 65.38, "#000000")],
                [molPaintJS.Isotope(31, 4, 13, "Ga", 69, 0, 69.723, "#000000")],
                [molPaintJS.Isotope(32, 4, 14, "Ge", 74, 0, 72.630, "#000000")],
                [molPaintJS.Isotope(33, 4, 15, "As", 75, 0, 74.921595, "#000000")],
                [molPaintJS.Isotope(34, 4, 16, "Se", 80, 0, 78.971, "#000000")],
                [molPaintJS.Isotope(35, 4, 17, "Br", 79, 0, 79.904, "#00ee00")],
                [molPaintJS.Isotope(36, 4, 18, "Kr", 84, 0, 83.798, "#000000")],
                [molPaintJS.Isotope(37, 5, 1, "Rb", 85, 0, 85.4678, "#ff0000")],
                [molPaintJS.Isotope(38, 5, 2, "Sr", 88, 0, 87.62, "#ff0000")],
                [molPaintJS.Isotope(39, 5, 3, "Y", 89, 0, 88.90584, "#000000")],
                [molPaintJS.Isotope(40, 5, 4, "Zr", 90, 0, 91.224, "#000000")],
                [molPaintJS.Isotope(41, 5, 5, "Nb", 93, 0, 92.90637, "#000000")],
                [molPaintJS.Isotope(42, 5, 6, "Mo", 98, 0, 95.95, "#000000")],
                [molPaintJS.Isotope(43, 5, 7, "Tc", 98, 0, 98.9063, "#000000")],
                [molPaintJS.Isotope(44, 5, 8, "Ru", 102, 0, 101.07, "#000000")],
                [molPaintJS.Isotope(45, 5, 9, "Rh", 103, 0, 102.90550, "#000000")],
                [molPaintJS.Isotope(46, 5, 10, "Pd", 106, 0, 106.42, "#000000")],
                [molPaintJS.Isotope(47, 5, 11, "Ag", 107, 0, 107.8682, "#000000")],
                [molPaintJS.Isotope(48, 5, 12, "Cd", 114, 0, 112.414, "#000000")],
                [molPaintJS.Isotope(49, 5, 13, "In", 115, 0, 114.818, "#000000")],
                [molPaintJS.Isotope(50, 5, 14, "Sn", 120, 0, 118.710, "#000000")],
                [molPaintJS.Isotope(51, 5, 15, "Sb", 121, 0, 121.760, "#000000")],
                [molPaintJS.Isotope(52, 5, 16, "Te", 130, 0, 127.60, "#000000")],
                [molPaintJS.Isotope(53, 5, 17, "I", 127, 0, 126.90447, "#00ee00")],
                [molPaintJS.Isotope(54, 5, 18, "Xe", 132, 0, 131.293, "#000000")],
                [molPaintJS.Isotope(55, 6, 1, "Cs", 133, 0, 132.90545196, "#ff0000")],
                [molPaintJS.Isotope(56, 6, 2, "Ba", 138, 0, 137.327, "#ff0000")],
                /* Lanthanoids: see below*/
                [molPaintJS.Isotope(72, 6, 4, "Hf", 180, 0, 178.49, "#000000")],
                [molPaintJS.Isotope(73, 6, 5, "Ta", 181, 0, 180.94788, "#000000")],
                [molPaintJS.Isotope(74, 6, 6, "W", 184, 0, 183.84, "#000000")],
                [molPaintJS.Isotope(75, 6, 7, "Re", 187, 0, 186.207, "#000000")],
                [molPaintJS.Isotope(76, 6, 8, "Os", 192, 0, 190.23, "#000000")],
                [molPaintJS.Isotope(77, 6, 9, "Ir", 193, 0, 192.217, "#000000")],
                [molPaintJS.Isotope(78, 6, 10, "Pt", 195, 0, 195.084, "#000000")],
                [molPaintJS.Isotope(79, 6, 11, "Au", 197, 0, 196.966569, "#000000")],
                [molPaintJS.Isotope(80, 6, 12, "Hg", 202, 0, 200.592, "#000000")],
                [molPaintJS.Isotope(81, 6, 13, "Tl", 205, 0, 204.38, "#000000")],
                [molPaintJS.Isotope(82, 6, 14, "Pb", 208, 0, 207.2, "#000000")],
                [molPaintJS.Isotope(83, 6, 15, "Bi", 209, 0, 208.98040, "#000000")],
                [molPaintJS.Isotope(84, 6, 16, "Po", 210, 0, 209.98, "#000000")],
                [molPaintJS.Isotope(85, 6, 17, "At", 210, 0, 209.9871, "#00ee00")],
                [molPaintJS.Isotope(86, 6, 18, "Rn", 222, 0, 222.0, "#000000")],
                [molPaintJS.Isotope(87, 7, 1, "Fr", 223, 0, 223.0197, "#ff0000")],
                [molPaintJS.Isotope(88, 7, 2, "Ra", 226, 0, 226.0254, "#ff0000")],
                /* Actinoids see below */
                [molPaintJS.Isotope(104, 7, 4, "Rf", 261, 0, 261.0, "#a0a0a0")],
                [molPaintJS.Isotope(105, 7, 5, "Db", 262, 0, 262.0, "#a0a0a0")],
                [molPaintJS.Isotope(106, 7, 6, "Sg", 266, 0, 266.0, "#a0a0a0")],
                [molPaintJS.Isotope(107, 7, 7, "Bh", 262, 0, 262.0, "#a0a0a0")],
                [molPaintJS.Isotope(108, 7, 8, "Hs", 270, 0, 270.0, "#a0a0a0")],
                [molPaintJS.Isotope(109, 7, 9, "Mt", 268, 0, 268.0, "#a0a0a0")],
                [molPaintJS.Isotope(110, 7, 10, "Ds", 281, 0, 281.0, "#a0a0a0")],
                [molPaintJS.Isotope(111, 7, 11, "Rg", 280, 0, 280.0, "#a0a0a0")],
                [molPaintJS.Isotope(112, 7, 12, "Cn", 285, 0, 285.0, "#a0a0a0")],
                [molPaintJS.Isotope(113, 7, 13, "Nh", 284, 0, 284.0, "#a0a0a0")],
                [molPaintJS.Isotope(114, 7, 14, "Fl", 285, 0, 285.0, "#a0a0a0")],
                [molPaintJS.Isotope(115, 7, 15, "Mc", 289, 0, 289.0, "#a0a0a0")],
                [molPaintJS.Isotope(116, 7, 16, "Lv", 293, 0, 293.0, "#a0a0a0")],
                [molPaintJS.Isotope(117, 7, 17, "Ts", 294, 0, 294.0, "#a0a0a0")],
                [molPaintJS.Isotope(118, 7, 18, "Og", 294, 0, 294.0, "#a0a0a0")],
                /* Lanthanoids: */
                [molPaintJS.Isotope(57, 8, 3, "La", 139, 0, 138.90547, "#000000")],
                [molPaintJS.Isotope(58, 8, 4, "Ce", 140, 0, 140.116, "#000000")],
                [molPaintJS.Isotope(59, 8, 5, "Pr", 141, 0, 140.90766, "#000000")],
                [molPaintJS.Isotope(60, 8, 6, "Nd", 142, 0, 144.242, "#000000")],
                [molPaintJS.Isotope(61, 8, 7, "Pm", 147, 0, 146.9151, "#000000")],
                [molPaintJS.Isotope(62, 8, 8, "Sm", 152, 0, 150.36, "#000000")],
                [molPaintJS.Isotope(63, 8, 9, "Eu", 153, 0, 151.964, "#000000")],
                [molPaintJS.Isotope(64, 8, 10, "Gd", 158, 0, 157.25, "#000000")],
                [molPaintJS.Isotope(65, 8, 11, "Tb", 159, 0, 158.92535, "#000000")],
                [molPaintJS.Isotope(66, 8, 12, "Dy", 164, 0, 162.500, "#000000")],
                [molPaintJS.Isotope(67, 8, 13, "Ho", 165, 0, 164.93033, "#000000")],
                [molPaintJS.Isotope(68, 8, 14, "Er", 166, 0, 167.259, "#000000")],
                [molPaintJS.Isotope(69, 8, 15, "Tm", 169, 0, 168.93422, "#000000")],
                [molPaintJS.Isotope(70, 8, 16, "Yb", 174, 0, 173.045, "#000000")],
                [molPaintJS.Isotope(71, 8, 17, "Lu", 175, 0, 174.9668, "#000000")],
                /* Actinoids */
                [molPaintJS.Isotope(89, 9, 3, "Ac", 227, 0, 227.0278, "#000000")],
                [molPaintJS.Isotope(90, 9, 4, "Th", 232, 0, 232.0377, "#000000")],
                [molPaintJS.Isotope(91, 9, 5, "Pa", 231, 0, 231.03588, "#000000")],
                [molPaintJS.Isotope(92, 9, 6, "U", 238, 0, 238.02891, "#000000")],
                [molPaintJS.Isotope(93, 9, 7, "Np", 237, 0, 237.0482, "#000000")],
                [molPaintJS.Isotope(94, 9, 8, "Pu", 244, 0, 244.0642, "#000000")],
                [molPaintJS.Isotope(95, 9, 9, "Am", 243, 0, 243.061375, "#000000")],
                [molPaintJS.Isotope(96, 9, 10, "Cm", 247, 0, 247.0703, "#000000")],
                [molPaintJS.Isotope(97, 9, 11, "Bk", 247, 0, 247.0, "#000000")],
                [molPaintJS.Isotope(98, 9, 12, "Cf", 251, 0, 251.0, "#000000")],
                [molPaintJS.Isotope(99, 9, 13, "Es", 252, 0, 252.0, "#000000")],
                [molPaintJS.Isotope(100, 9, 14, "Fm", 257, 0, 257.0951, "#000000")],
                [molPaintJS.Isotope(101, 9, 15, "Md", 258, 0, 258.0, "#000000")],
                [molPaintJS.Isotope(102, 9, 16, "No", 259, 0, 259.0, "#000000")],
                [molPaintJS.Isotope(103, 9, 17, "Lr", 266, 0, 266.0, "#000000")]
            ];

            elementsByName["D"] = elements[0][2];
            elementsByName["T"] = elements[0][3];

            for (var i = 1; i < elements.length; i++) {
                var iso = elements[i][0];
                elementsByName[iso.getSymbol()] = iso;
            }
        }

        return {
            getElement : function (sym) {
                return elementsByName[sym.trim()];
            },

            getAllElements : function() {
                return elements;
            },

            getIsotopes : function (z) {
                return elements[z];
            },
        
            initElements : function () {
                init();
                return this;
            }
        };
    }
    return molpaintjs;
}(molPaintJS || {}));

