"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
Object.defineProperty(exports, "__esModule", { value: true });
// Place this right on top
const initialize_1 = require("./initialize");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const utils_1 = require("../client/common/utils");
const os_1 = require("os");
const helpers_1 = require("../client/common/helpers");
const vscode = require("vscode");
// Defines a Mocha test suite to group tests of similar kind together
suite('ChildProc', () => {
    setup(done => {
        initialize_1.initialize().then(() => done(), done);
    });
    test('Standard Response', done => {
        utils_1.execPythonFile('python', ['-c', 'print(1)'], __dirname, false).then(data => {
            assert.ok(data === '1' + os_1.EOL);
        }).then(done).catch(done);
    });
    test('Error Response', done => {
        const def = helpers_1.createDeferred();
        utils_1.execPythonFile('python', ['-c', 'print(1'], __dirname, false).then(() => {
            def.reject('Should have failed');
        }).catch(() => {
            def.resolve();
        });
        def.promise.then(done).catch(done);
    });
    test('Stream Stdout', done => {
        const output = [];
        function handleOutput(data) {
            output.push(data);
        }
        utils_1.execPythonFile('python', ['-c', 'print(1)'], __dirname, false, handleOutput).then(() => {
            assert.equal(output.length, 1, 'Ouput length incorrect');
            assert.equal(output[0], '1' + os_1.EOL, 'Ouput value incorrect');
        }).then(done).catch(done);
    });
    test('Stream Stdout with Threads', done => {
        const output = [];
        function handleOutput(data) {
            output.push(data);
        }
        utils_1.execPythonFile('python', ['-c', 'import sys\nprint(1)\nsys.__stdout__.flush()\nimport time\ntime.sleep(5)\nprint(2)'], __dirname, false, handleOutput).then(() => {
            assert.equal(output.length, 2, 'Ouput length incorrect');
            assert.equal(output[0], '1' + os_1.EOL, 'First Ouput value incorrect');
            assert.equal(output[1], '2' + os_1.EOL, 'Second Ouput value incorrect');
        }).then(done).catch(done);
    });
    test('Kill', done => {
        const def = helpers_1.createDeferred();
        const output = [];
        function handleOutput(data) {
            output.push(data);
        }
        const cancellation = new vscode.CancellationTokenSource();
        utils_1.execPythonFile('python', ['-c', 'import sys\nprint(1)\nsys.__stdout__.flush()\nimport time\ntime.sleep(5)\nprint(2)'], __dirname, false, handleOutput, cancellation.token).then(() => {
            def.reject('Should not have completed');
        }).catch(() => {
            def.resolve();
        });
        setTimeout(() => {
            cancellation.cancel();
        }, 1000);
        def.promise.then(done).catch(done);
    });
});
//# sourceMappingURL=extension.common.test.js.map