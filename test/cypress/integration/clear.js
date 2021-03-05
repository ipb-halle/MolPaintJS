describe('MolPaintJS clear plugin test', () => { 

    it('loads the plugin and empties the workspace', () => {

        cy.visit('/')

        cy.window().then((win) => {
            win.molPaintJS.getContext('mol').getMolecule().reIndex();
            expect(win.molPaintJS.getContext('mol').getMolecule().getAtomCount()).to.eq(14);
        });

        // clear the plugin
        cy.get('#mol_clear').click()
        
        cy.window().then((win) => {
            expect(win.molPaintJS.getContext('mol').getMolecule().getAtomCount()).to.eq(0);
        });

    })
})

