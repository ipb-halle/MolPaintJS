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
 * 
 * Small debugging tool for development
 */
var mp = require('../molpaintjs/js/molpaint');

var fs = require('fs');
var path = require('path');
var util = require('util');


function readFile(name) {
    return fs.readFileSync(path.join(path.dirname(__filename), 'molecules', name), {'encoding':'UTF-8'});
}

// console.log(util.inspect(mp, {showHidden: true, depth: null}));

var atom = mp.Atom();
atom.setX(5.0);
atom.addX(1.0);
console.log(atom.getX());


var mol = mp.MDLParser.parse(readFile('../../molpaintjs/examples/cholecalciferol.mol'), {'counter': mp.Counter(), 'logLevel':2});
// var mol = mp.MDLParser.parse(readFile('v3000_benzene.mol') /* , {'logLevel':2} */);
// console.log(util.inspect(mol.getAtoms(), {showHidden: false, depth: null}));
