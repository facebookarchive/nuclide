"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const helpers_1 = require("../../client/common/helpers");
// Defines a Mocha test suite to group tests of similar kind together
suite('Deferred', () => {
    test('Resolve', done => {
        const valueToSent = new Date().getTime();
        const def = helpers_1.createDeferred();
        def.promise.then(value => {
            assert.equal(value, valueToSent);
            assert.equal(def.resolved, true, 'resolved property value is not `true`');
        }).then(done).catch(done);
        assert.equal(def.resolved, false, 'Promise is resolved even when it should not be');
        assert.equal(def.rejected, false, 'Promise is rejected even when it should not be');
        assert.equal(def.completed, false, 'Promise is completed even when it should not be');
        def.resolve(valueToSent);
        assert.equal(def.resolved, true, 'Promise is not resolved even when it should not be');
        assert.equal(def.rejected, false, 'Promise is rejected even when it should not be');
        assert.equal(def.completed, true, 'Promise is not completed even when it should not be');
    });
    test('Reject', done => {
        const errorToSend = new Error('Something');
        const def = helpers_1.createDeferred();
        def.promise.then(value => {
            assert.fail(value, 'Error', 'Was expecting promise to get rejected, however it was resolved', '');
            done();
        }).catch(reason => {
            assert.equal(reason, errorToSend, 'Error received is not the same');
            done();
        }).catch(done);
        assert.equal(def.resolved, false, 'Promise is resolved even when it should not be');
        assert.equal(def.rejected, false, 'Promise is rejected even when it should not be');
        assert.equal(def.completed, false, 'Promise is completed even when it should not be');
        def.reject(errorToSend);
        assert.equal(def.resolved, false, 'Promise is resolved even when it should not be');
        assert.equal(def.rejected, true, 'Promise is not rejected even when it should not be');
        assert.equal(def.completed, true, 'Promise is not completed even when it should not be');
    });
    test('isNotInstalledError', done => {
        const error = new Error('something is not installed');
        assert.equal(helpers_1.isNotInstalledError(error), false, 'Standard error');
        // tslint:disable-next-line:no-any
        error.code = 'ENOENT';
        assert.equal(helpers_1.isNotInstalledError(error), true, 'ENOENT error code not detected');
        // tslint:disable-next-line:no-any
        error.code = 127;
        assert.equal(helpers_1.isNotInstalledError(error), true, '127 error code not detected');
        done();
    });
});
//# sourceMappingURL=helpers.test.js.map