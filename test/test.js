/*
 * Unit test for the MDL parser
 */
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var util = require('util');

var molpaint = require('../dist/js/molpaint');

var testMolecules = [ {
        'name': 'v2000_14C_cyclopentane.mol',
        'nAtoms': 5,
        'nBonds': 5
    }, {
        'name': 'v3000_ethyl_acetate.mol',
        'nAtoms': 6,
        'nBonds': 5
    }, {
        'name': 'v3000_benzene.mol',
        'nAtoms': 6,
        'nBonds': 6
    }, {
        'name': 'v3000_(R)-2-chloroheptane.mol',
        'nAtoms': 8,
        'nBonds': 7
    }, {
        'name': 'v3000_(S)-2-chloroheptane.mol',
        'nAtoms': 8,
        'nBonds': 7
    } ];


var atomCounts = { };
var bondCounts = { };

function readFile(name) {
    return fs.readFileSync(path.join(path.dirname(__filename), 'molecules', name), {'encoding':'UTF-8'});
}

describe('Parser', function() {
    it('should parse the list of molecules', function() {
        for(var entry of testMolecules) {
            var mol = molpaint.MDLParser.parse(readFile(entry.name)); 
//          console.log(util.inspect(mol, {showHidden: false, depth: null}));
            assert(mol, 'Parse error for ' + entry.name);
            mol.reIndex();
            atomCounts[entry.name] = mol.getAtomCount();
            bondCounts[entry.name] = mol.getBondCount();
        }
    });
    it('should match the number of atoms', function() {
        for(var entry of testMolecules) {
            assert.equal(entry.nAtoms, atomCounts[entry.name], 'Mismatch for ' + entry.name);
        }
    });
    it('should match the number of bonds', function() {
        for(var entry of testMolecules) {
            assert.equal(entry.nBonds, bondCounts[entry.name], 'Mismatch for ' + entry.name);
        }
    });
});
