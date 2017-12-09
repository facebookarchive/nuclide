"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import {TestFolder, TestsToRun, Tests, TestFile, TestSuite, TestFunction, TestStatus, FlattenedTestFunction, FlattenedTestSuite, CANCELLATION_REASON} from './contracts';
const contracts_1 = require("./contracts");
const vscode = require("vscode");
const testUtils_1 = require("./testUtils");
const installer_1 = require("../../common/installer");
const helpers_1 = require("../../common/helpers");
class BaseTestManager {
    constructor(testProvider, product, rootDirectory, outputChannel) {
        this.testProvider = testProvider;
        this.product = product;
        this.rootDirectory = rootDirectory;
        this.outputChannel = outputChannel;
        this._status = contracts_1.TestStatus.Unknown;
        this._status = contracts_1.TestStatus.Unknown;
        this.installer = new installer_1.Installer();
    }
    get cancellationToken() {
        if (this.cancellationTokenSource) {
            return this.cancellationTokenSource.token;
        }
    }
    dispose() {
    }
    get status() {
        return this._status;
    }
    stop() {
        if (this.cancellationTokenSource) {
            this.cancellationTokenSource.cancel();
        }
    }
    reset() {
        this._status = contracts_1.TestStatus.Unknown;
        this.tests = null;
    }
    resetTestResults() {
        if (!this.tests) {
            return;
        }
        testUtils_1.resetTestResults(this.tests);
    }
    createCancellationToken() {
        this.disposeCancellationToken();
        this.cancellationTokenSource = new vscode.CancellationTokenSource();
    }
    disposeCancellationToken() {
        if (this.cancellationTokenSource) {
            this.cancellationTokenSource.dispose();
        }
        this.cancellationTokenSource = null;
    }
    discoverTests(ignoreCache = false, quietMode = false) {
        if (this.discoverTestsPromise) {
            return this.discoverTestsPromise;
        }
        if (!ignoreCache && this.tests && this.tests.testFunctions.length > 0) {
            this._status = contracts_1.TestStatus.Idle;
            return Promise.resolve(this.tests);
        }
        this._status = contracts_1.TestStatus.Discovering;
        this.createCancellationToken();
        return this.discoverTestsPromise = this.discoverTestsImpl(ignoreCache)
            .then(tests => {
            this.tests = tests;
            this._status = contracts_1.TestStatus.Idle;
            this.resetTestResults();
            this.discoverTestsPromise = null;
            // have errors in Discovering
            let haveErrorsInDiscovering = false;
            tests.testFiles.forEach(file => {
                if (file.errorsWhenDiscovering && file.errorsWhenDiscovering.length > 0) {
                    haveErrorsInDiscovering = true;
                    this.outputChannel.append('_'.repeat(10));
                    this.outputChannel.append(`There was an error in identifying unit tests in ${file.nameToRun}`);
                    this.outputChannel.appendLine('_'.repeat(10));
                    this.outputChannel.appendLine(file.errorsWhenDiscovering);
                }
            });
            if (haveErrorsInDiscovering && !quietMode) {
                testUtils_1.displayTestErrorMessage('There were some errors in disovering unit tests');
            }
            testUtils_1.storeDiscoveredTests(tests);
            this.disposeCancellationToken();
            return tests;
        }).catch(reason => {
            if (helpers_1.isNotInstalledError(reason) && !quietMode) {
                this.installer.promptToInstall(this.product);
            }
            this.tests = null;
            this.discoverTestsPromise = null;
            if (this.cancellationToken && this.cancellationToken.isCancellationRequested) {
                reason = contracts_1.CANCELLATION_REASON;
                this._status = contracts_1.TestStatus.Idle;
            }
            else {
                this._status = contracts_1.TestStatus.Error;
                this.outputChannel.appendLine('Test Disovery failed: ');
                this.outputChannel.appendLine('' + reason);
            }
            testUtils_1.storeDiscoveredTests(null);
            this.disposeCancellationToken();
            return Promise.reject(reason);
        });
    }
    runTest(args, debug) {
        let runFailedTests = false;
        let testsToRun = null;
        let moreInfo = {
            Test_Provider: this.testProvider,
            Run_Failed_Tests: 'false',
            Run_Specific_File: 'false',
            Run_Specific_Class: 'false',
            Run_Specific_Function: 'false'
        };
        if (typeof args === 'boolean') {
            runFailedTests = args === true;
            moreInfo.Run_Failed_Tests = runFailedTests + '';
        }
        if (typeof args === 'object' && args !== null) {
            testsToRun = args;
            if (Array.isArray(testsToRun.testFile) && testsToRun.testFile.length > 0) {
                moreInfo.Run_Specific_File = 'true';
            }
            if (Array.isArray(testsToRun.testSuite) && testsToRun.testSuite.length > 0) {
                moreInfo.Run_Specific_Class = 'true';
            }
            if (Array.isArray(testsToRun.testFunction) && testsToRun.testFunction.length > 0) {
                moreInfo.Run_Specific_Function = 'true';
            }
        }
        if (runFailedTests === false && testsToRun === null) {
            this.resetTestResults();
        }
        this._status = contracts_1.TestStatus.Running;
        this.createCancellationToken();
        // If running failed tests, then don't clear the previously build UnitTests
        // If we do so, then we end up re-discovering the unit tests and clearing previously cached list of failed tests
        // Similarly, if running a specific test or test file, don't clear the cache (possible tests have some state information retained)
        const clearDiscoveredTestCache = runFailedTests || moreInfo.Run_Specific_File || moreInfo.Run_Specific_Class || moreInfo.Run_Specific_Function ? false : true;
        return this.discoverTests(clearDiscoveredTestCache, true)
            .catch(reason => {
            if (this.cancellationToken && this.cancellationToken.isCancellationRequested) {
                return Promise.reject(reason);
            }
            testUtils_1.displayTestErrorMessage('Errors in discovering tests, continuing with tests');
            return {
                rootTestFolders: [], testFiles: [], testFolders: [], testFunctions: [], testSuits: [],
                summary: { errors: 0, failures: 0, passed: 0, skipped: 0 }
            };
        })
            .then(tests => {
            return this.runTestImpl(tests, testsToRun, runFailedTests, debug);
        }).then(() => {
            this._status = contracts_1.TestStatus.Idle;
            this.disposeCancellationToken();
            return this.tests;
        }).catch(reason => {
            if (this.cancellationToken && this.cancellationToken.isCancellationRequested) {
                reason = contracts_1.CANCELLATION_REASON;
                this._status = contracts_1.TestStatus.Idle;
            }
            else {
                this._status = contracts_1.TestStatus.Error;
            }
            this.disposeCancellationToken();
            return Promise.reject(reason);
        });
    }
}
exports.BaseTestManager = BaseTestManager;
//# sourceMappingURL=baseTestManager.js.map