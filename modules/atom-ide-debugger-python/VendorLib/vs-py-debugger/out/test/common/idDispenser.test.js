"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const idDispenser_1 = require("../../client/common/idDispenser");
// Defines a Mocha test suite to group tests of similar kind together
suite('IdDispenser', () => {
    test('Sequential generation', done => {
        const idDispenser = new idDispenser_1.IdDispenser();
        Array.from(new Array(50).keys()).forEach(i => {
            let id = idDispenser.Allocate();
            assert.equal(i, id, `Allocated Id is not ${id}`);
        });
        done();
    });
    test('Test reuse and new generation', done => {
        const idDispenser = new idDispenser_1.IdDispenser();
        Array.from(new Array(50).keys()).forEach(i => {
            idDispenser.Allocate();
        });
        // Free up the numbers 25 to 29
        // The new numbers allocated must be 25,26,27,28,29,50,51,52,53,54,55, etc
        const idsToFree = [25, 26, 27, 28, 29];
        idsToFree.forEach(id => idDispenser.Free(id));
        // Now generate again
        Array.from(new Array(10).keys()).forEach(i => {
            let id = idDispenser.Allocate();
            if (i < 5) {
                assert.notEqual(idsToFree.indexOf(id), -1, 'Freed id not regenerated');
            }
            else {
                assert.equal(id, 50 + i - idsToFree.length, 'Generated id not following expected pattern');
            }
        });
        done();
    });
});
//# sourceMappingURL=idDispenser.test.js.map