'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const configSettings_1 = require("../../common/configSettings");
const runner_1 = require("./runner");
const collector_1 = require("./collector");
const baseTestManager_1 = require("../common/baseTestManager");
const installer_1 = require("../../common/installer");
const settings = configSettings_1.PythonSettings.getInstance();
class TestManager extends baseTestManager_1.BaseTestManager {
    constructor(rootDirectory, outputChannel) {
        super('pytest', installer_1.Product.pytest, rootDirectory, outputChannel);
    }
    discoverTestsImpl(ignoreCache) {
        let args = settings.unitTest.pyTestArgs.slice(0);
        return collector_1.discoverTests(this.rootDirectory, args, this.cancellationToken, ignoreCache, this.outputChannel);
    }
    runTestImpl(tests, testsToRun, runFailedTests, debug) {
        let args = settings.unitTest.pyTestArgs.slice(0);
        if (runFailedTests === true && args.indexOf('--lf') === -1 && args.indexOf('--last-failed') === -1) {
            args.push('--last-failed');
        }
        return runner_1.runTest(this.rootDirectory, tests, args, testsToRun, this.cancellationToken, this.outputChannel, debug);
    }
}
exports.TestManager = TestManager;
//# sourceMappingURL=main.js.map