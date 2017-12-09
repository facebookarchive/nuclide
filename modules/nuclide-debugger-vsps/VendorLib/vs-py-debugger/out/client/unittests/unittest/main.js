'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const configSettings_1 = require("../../common/configSettings");
const contracts_1 = require("../common/contracts");
const runner_1 = require("./runner");
const collector_1 = require("./collector");
const baseTestManager_1 = require("../common/baseTestManager");
const installer_1 = require("../../common/installer");
const settings = configSettings_1.PythonSettings.getInstance();
class TestManager extends baseTestManager_1.BaseTestManager {
    constructor(rootDirectory, outputChannel) {
        super('unitest', installer_1.Product.unittest, rootDirectory, outputChannel);
    }
    configure() {
    }
    discoverTestsImpl(ignoreCache) {
        let args = settings.unitTest.unittestArgs.slice(0);
        return collector_1.discoverTests(this.rootDirectory, args, this.cancellationToken, ignoreCache, this.outputChannel);
    }
    runTestImpl(tests, testsToRun, runFailedTests, debug) {
        let args = settings.unitTest.unittestArgs.slice(0);
        if (runFailedTests === true) {
            testsToRun = { testFile: [], testFolder: [], testSuite: [], testFunction: [] };
            testsToRun.testFunction = tests.testFunctions.filter(fn => {
                return fn.testFunction.status === contracts_1.TestStatus.Error || fn.testFunction.status === contracts_1.TestStatus.Fail;
            }).map(fn => fn.testFunction);
        }
        return runner_1.runTest(this, this.rootDirectory, tests, args, testsToRun, this.cancellationToken, this.outputChannel, debug);
    }
}
exports.TestManager = TestManager;
//# sourceMappingURL=main.js.map