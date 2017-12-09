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
const vscode = require("vscode");
const configSettings_1 = require("../client/common/configSettings");
const systemVariables_1 = require("../client/common/systemVariables");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
// Defines a Mocha test suite to group tests of similar kind together
suite('Configuration Settings', () => {
    setup(done => {
        initialize_1.initialize().then(() => done(), done);
    });
    if (!initialize_1.IS_TRAVIS) {
        test('Check Values', done => {
            const systemVariables = new systemVariables_1.SystemVariables();
            const pythonConfig = vscode.workspace.getConfiguration('python');
            Object.keys(pythonSettings).forEach(key => {
                let settingValue = pythonConfig.get(key, 'Not a config');
                if (settingValue === 'Not a config') {
                    return;
                }
                if (typeof settingValue === 'object' && settingValue !== null) {
                    settingValue = systemVariables.resolve(settingValue);
                }
                assert.deepEqual(settingValue, pythonSettings[key], `Setting ${key} not the same`);
            });
            done();
        });
    }
});
//# sourceMappingURL=extension.common.configSettings.test.js.map