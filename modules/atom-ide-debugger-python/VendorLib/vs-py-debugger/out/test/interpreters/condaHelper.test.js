"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const conda_1 = require("../../client/interpreter/locators/services/conda");
const condaHelper_1 = require("../../client/interpreter/locators/services/condaHelper");
const initialize_1 = require("../initialize");
// tslint:disable-next-line:max-func-body-length
suite('Interpreters display name from Conda Environments', () => {
    const condaHelper = new condaHelper_1.CondaHelper();
    suiteSetup(initialize_1.initialize);
    setup(initialize_1.initializeTest);
    test('Must return default display name for invalid Conda Info', () => {
        assert.equal(condaHelper.getDisplayName(), conda_1.AnacondaDisplayName, 'Incorrect display name');
        assert.equal(condaHelper.getDisplayName({}), conda_1.AnacondaDisplayName, 'Incorrect display name');
    });
    test('Must return at least Python Version', () => {
        const info = {
            python_version: '3.6.1.final.10'
        };
        const displayName = condaHelper.getDisplayName(info);
        assert.equal(displayName, conda_1.AnacondaDisplayName, 'Incorrect display name');
    });
    test('Must return info without first part if not a python version', () => {
        const info = {
            'sys.version': '3.6.1 |Anaconda 4.4.0 (64-bit)| (default, May 11 2017, 13:25:24) [MSC v.1900 64 bit (AMD64)]'
        };
        const displayName = condaHelper.getDisplayName(info);
        assert.equal(displayName, 'Anaconda 4.4.0 (64-bit)', 'Incorrect display name');
    });
    test('Must return info without prefixing with word \'Python\'', () => {
        const info = {
            python_version: '3.6.1.final.10',
            'sys.version': '3.6.1 |Anaconda 4.4.0 (64-bit)| (default, May 11 2017, 13:25:24) [MSC v.1900 64 bit (AMD64)]'
        };
        const displayName = condaHelper.getDisplayName(info);
        assert.equal(displayName, 'Anaconda 4.4.0 (64-bit)', 'Incorrect display name');
    });
    test('Must include Ananconda name if Company name not found', () => {
        const info = {
            python_version: '3.6.1.final.10',
            'sys.version': '3.6.1 |4.4.0 (64-bit)| (default, May 11 2017, 13:25:24) [MSC v.1900 64 bit (AMD64)]'
        };
        const displayName = condaHelper.getDisplayName(info);
        assert.equal(displayName, `4.4.0 (64-bit) : ${conda_1.AnacondaDisplayName}`, 'Incorrect display name');
    });
});
//# sourceMappingURL=condaHelper.test.js.map