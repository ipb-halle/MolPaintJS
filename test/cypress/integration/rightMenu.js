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

describe('test mostly the right menu (elements, charges, isotopes, radicals)', () => {

    it('tests hydrogen count on single N and O atoms', () => {

        cy.visit('/');
        cy.wait(200);

        // clear the plugin
        cy.get('#mol_clear').click();
        
        cy.get('#mol_oxygen').click();
        cy.get('#mol_canvas').click(100,100);
        let atom1 = null;
        cy.getAtomFromHistory().then(atom => (atom1 = atom));
        cy.get('#mol_nitrogen').click();
        cy.get('#mol_canvas').click(200, 200);
        let atom2 = null;
        cy.getAtomFromHistory().then(atom => (atom2 = atom));
        
        cy.window().then((win) => {
            let drawing = win.molPaintJS.getContext('mol').getDrawing();
            let chemObjects = drawing.getChemObjects();
            expect(Object.keys(chemObjects).length).to.eq(2);

            for (let cid in chemObjects) {
                chemObjects[cid].reIndex();
            }
            expect(drawing.getAtomCount()).to.eq(2);
            let chemObject = chemObjects[atom1.getChemObjectId()];
            expect(chemObject.getAtomCount()).to.eq(1);
            expect(chemObject.getAtom(atom1.getId()).getHydrogenCount(chemObject, false)).to.eq(2);
            chemObject = chemObjects[atom2.getChemObjectId()];
            expect(chemObject.getAtomCount()).to.eq(1);
            expect(chemObject.getAtom(atom2.getId()).getHydrogenCount(chemObject, false)).to.eq(3);
        });
    });

    it('tests increment (+) and decrement (-) of charges', () => {
        cy.visit('/');
        cy.wait(200);

        cy.get('#mol_clear').click();

        cy.get('#mol_oxygen').click();
        cy.get('#mol_canvas').click(100,100);
        let atom1 = null;
        cy.getAtomFromHistory().then(atom => (atom1 = atom));


        cy.get('#mol_plus').click();
        cy.get('#mol_canvas').click(100,100);
        cy.window().then((win) => {
            let drawing = win.molPaintJS.getContext('mol').getDrawing();
            let chemObject = drawing.getChemObjects()[atom1.getChemObjectId()];
            expect(drawing.getAtom(atom1.getId()).getHydrogenCount(chemObject, false)).to.eq(3);
        });

        cy.get('#mol_minus').click();
        cy.get('#mol_canvas').click(100,100);
        cy.get('#mol_canvas').click(100,100);
        cy.window().then((win) => {
            let drawing = win.molPaintJS.getContext('mol').getDrawing();
            let chemObject = drawing.getChemObjects()[atom1.getChemObjectId()];
            expect(drawing.getAtom(atom1.getId()).getHydrogenCount(chemObject, false)).to.eq(1);
        });
    });

    it('tests changes of atom mass / isotope', () => {
        cy.visit('/');
        cy.wait(200);

        cy.get('#mol_clear').click();
        cy.get('#mol_pseMenu').should('be.hidden').invoke('show');
        cy.get('#mol_pse_Cl').click();
        cy.get('#mol_pseMenu').invoke('hide');
        cy.get('#mol_canvas').click(100, 100);
        let atom1 = null;
        cy.getAtomFromHistory().then(atom => (atom1 = atom));

        cy.window().then((win) => {

            cy.get("#mol_isotope").invoke('attr', 'src').then((src) => {
                    expect(src).to.equal(win.molPaintJS.Resources['isotope_up.png']);
            });

            var drawing = win.molPaintJS.getContext('mol').getDrawing();
            expect(drawing.getAtom(atom1.getId()).getType().getIsotope().getMassExact()).to.be.closeTo(35.45, 0.002);
        });

        cy.get('#mol_isotope').click();
        cy.get('#mol_canvas').click(100, 100);

        cy.window().then((win) => {
            let drawing = win.molPaintJS.getContext('mol').getDrawing();
            expect(drawing.getAtom(atom1.getId()).getType().getIsotope().getMassExact()).to.be.closeTo(35.96830698, 0.00001);
        });

        cy.get('#mol_isotopeMenu').should('be.hidden').invoke('show');
        cy.get('#mol_isotope_down').click();
        cy.get('#mol_isotopeMenu').invoke('hide');

        cy.get('#mol_canvas').click(100, 100);
        cy.get('#mol_canvas').click(100, 100);

        cy.window().then((win) => {

            cy.get("#mol_isotope").invoke('attr', 'src').then((src) => {
                    expect(src).to.equal(win.molPaintJS.Resources['isotope_down.png']);
            });

            let drawing = win.molPaintJS.getContext('mol').getDrawing();
            expect(drawing.getAtom(atom1.getId()).getType().getIsotope().getMassExact()).to.be.closeTo(34.96885268, 0.00001);
        });
    });

    it('tests change of electronic state (singlet, doublet, triplet - chemically invalid) ', () => {
        cy.visit('/');
        cy.wait(200);

        cy.get('#mol_clear').click();
        cy.get('#mol_carbon').click();
        cy.get('#mol_canvas').click(100,100);


        // check icon
        cy.window().then((win) => {
            cy.get("#mol_radical").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['radical.png']);
            });
        });

        for (const cfg of [
                {"control":"singlet", "outcome":/ RAD=1/},
                {"control":"doublet", "outcome":/ RAD=2/},
                {"control":"triplet", "outcome":/ RAD=3/},
                {"control":"no_radical", "outcome": /^(?!.*RAD=).*$/} ]) {

            cy.get('#mol_radicalMenu').should('be.hidden').invoke('show');
            cy.get('#mol_' + cfg.control).click();
            cy.get('#mol_radicalMenu').invoke('hide');
            cy.get('#mol_canvas').click(100, 100);
            cy.window().then((win) => {

                // check icon
                cy.get("#mol_radical").invoke('attr', 'src').then((src) => {
                    expect(src).to.equal(win.molPaintJS.Resources[cfg.control + '.png']);
                });

                let mdl = win.molPaintJS.getMDLv3000('mol').replace(/\n/g, "\\n");
                expect(mdl).to.match(cfg.outcome);
            });
        }

    });
})
