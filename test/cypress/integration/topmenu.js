describe('MolPaintJS top menu test', () => {

    it('tests clear, undo and redo buttons', () => {

        cy.visit('/');
        cy.wait(200);

        // check start condition
        cy.window().then((win) => {
            win.molPaintJS.getContext('mol').getDrawing().reIndex();
            expect(win.molPaintJS.getContext('mol').getDrawing().getAtomCount()).to.eq(14);

            // undo icon is inactive
            cy.get("#mol_undo").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['undo_inactive.png']);
            });

            cy.get("#mol_redo").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['redo_inactive.png']);
            });
        });

        // clear the plugin
        cy.get('#mol_clear').click()

        // check clear outcome
        cy.window().then((win) => {
            expect(win.molPaintJS.getContext('mol').getDrawing().getAtomCount()).to.eq(0);

            // undo icon is active
            cy.get("#mol_undo").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['undo.png']);
            });

            // redo icon is still inactive
            cy.get("#mol_redo").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['redo_inactive.png']);
            });
        });

        // undo
        cy.get('#mol_undo').click();

        // check undo outcome
        cy.window().then((win) => {
            win.molPaintJS.getContext('mol').getDrawing().reIndex();
            expect(win.molPaintJS.getContext('mol').getDrawing().getAtomCount()).to.eq(14);

            // undo icon is inactive
            cy.get("#mol_undo").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['undo_inactive.png']);
            });

            cy.get("#mol_redo").invoke('attr', 'src').then((src) => {
                expect(src).to.equal(win.molPaintJS.Resources['redo.png']);
            });
        });
    });


    it('tests the "slide" and "center drawing" buttons', () => {

        cy.visit('/');
        cy.wait(200);

        cy.get('#mol_clear').click();
        cy.get('#mol_oxygen').click();
        cy.get('#mol_canvas').click(20, 20);

        cy.window().then((win) => {
            var ctx =  win.molPaintJS.getContext('mol');
            var view = ctx.getView();
            var coord = view.getCoord(ctx.getDrawing().getAtom('Atom1'));

            expect(coord.x).to.be.closeTo(20, 0.5);
            expect(coord.y).to.be.closeTo(20, 0.5);
        });

        cy.get('#mol_slide').click();
        cy.get('#mol_canvas').trigger('mousedown', 40, 40)
                .trigger('mousemove', 120, 40)
                .trigger('mouseup');

        cy.window().then((win) => {
            var ctx = win.molPaintJS.getContext('mol');
            var view = ctx.getView();
            var coord = view.getCoord(ctx.getDrawing().getAtom('Atom1'));

            expect(coord.x).to.be.closeTo(100, 0.5);
            expect(coord.y).to.be.closeTo(20, 0.5);
        });

        cy.get('#mol_center').click();
        cy.window().then((win) => {
            var ctx = win.molPaintJS.getContext('mol');
            var view = ctx.getView();
            var coord = view.getCoord(ctx.getDrawing().getAtom('Atom1'));

            expect(coord.x).to.be.closeTo(20, 0.5);
            expect(coord.y).to.be.closeTo(20, 0.5);
        });

    });

});

