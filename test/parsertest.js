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
var parser = require("./ctab");

v2molecule = `Cyclopentane

MolPaintJS Template
  5  5  0  0  0  0            999
   -0.4125   -0.6348    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.4125   -0.6348    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.6674    0.1498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000    0.6348    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
   -0.6674    0.1498    0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  1  0
  2  3  1  0
  3  4  1  0
  4  5  1  0
  5  1  1  0
M  END
`;

v3molecule = `
  ChemDraw02032110452D

  0  0  0     0  0              0 V3000
M  V30 BEGIN CTAB
M  V30 COUNTS 6 5 0 0 0
M  V30 BEGIN ATOM
M  V30 1 C -0.714471 -0.206250 0.000000 0-
M  V30 CHG=1 RAD=2
M  V30 2 C -1.428942 -0.618750 0.000000 0
M  V30 3 O -0.714471 0.618750 0.000000 0-
M  V30 RAD=0
M  V30 4 O 0.000000 -0.618750 0.000000 0
M  V30 5 C 0.714471 -0.206250 0.000000 0
M  V30 6 C 1.428942 -0.618750 0.000000 0
M  V30 END ATOM
M  V30 BEGIN BOND
M  V30 1 1 1 2
M  V30 2 2 1 3
M  V30 3 1 1 4
M  V30 4 1 5 6
M  V30 5 1 4 5
M  V30 END BOND
M  V30 END CTAB
M  END
`;

//console.log(molecule);
parser.parse(v2molecule);
parser.parse(v3molecule);
