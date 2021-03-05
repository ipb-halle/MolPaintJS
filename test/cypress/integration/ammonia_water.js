/* 
 *  MolPaintJS
 *  (c) Copyright 2021 Leibniz-Institut f. Pflanzenbiochemie
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('MolPaintJS ammonia water test', () => { 

    it('tests hydrogen count on single N and O atoms', () => {

        cy.visit('/');

        // clear the plugin
        cy.get('#mol_clear').click();
        
        cy.get('#mol_oxygen').click();
        cy.get('#mol_canvas').click(100,100);
        cy.get('#mol_nitrogen').click();
        cy.get('#mol_canvas').click(200, 200);
        
        cy.window().then((win) => {
            var mol = win.molPaintJS.getContext('mol').getMolecule();
            mol.reIndex();
            expect(mol.getAtomCount()).to.eq(2);
            expect(mol.getAtom("Atom1").getHydrogenCount(mol)).to.eq(2);
            expect(mol.getAtom("Atom2").getHydrogenCount(mol)).to.eq(3);
        });
    })
})
