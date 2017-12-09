/// <reference path="../../../../typings/globals/xml2js/index.d.ts" />
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const contracts_1 = require("../common/contracts");
const testUtils_1 = require("../common/testUtils");
const runner_1 = require("../common/runner");
const socketServer_1 = require("./socketServer");
const configSettings_1 = require("../../common/configSettings");
const vscode = require("vscode");
const utils_1 = require("./../../common/utils");
const helpers_1 = require("./../../common/helpers");
const os = require("os");
const settings = configSettings_1.PythonSettings.getInstance();
const outcomeMapping = new Map();
outcomeMapping.set('passed', { status: contracts_1.TestStatus.Pass, summaryProperty: 'passed' });
outcomeMapping.set('failed', { status: contracts_1.TestStatus.Fail, summaryProperty: 'failures' });
outcomeMapping.set('error', { status: contracts_1.TestStatus.Error, summaryProperty: 'errors' });
outcomeMapping.set('skipped', { status: contracts_1.TestStatus.Skipped, summaryProperty: 'skipped' });
function runTest(testManager, rootDirectory, tests, args, testsToRun, token, outChannel, debug) {
    tests.summary.errors = 0;
    tests.summary.failures = 0;
    tests.summary.passed = 0;
    tests.summary.skipped = 0;
    let failFast = false;
    const testLauncherFile = path.join(__dirname, '..', '..', '..', '..', 'pythonFiles', 'PythonTools', 'visualstudio_py_testlauncher.py');
    const server = new socketServer_1.Server();
    server.on('error', (message, ...data) => {
        console.log(`${message} ${data.join(' ')}`);
    });
    server.on('log', (message, ...data) => {
    });
    server.on('connect', (data) => {
    });
    server.on('start', (data) => {
    });
    server.on('result', (data) => {
        const test = tests.testFunctions.find(t => t.testFunction.nameToRun === data.test);
        const statusDetails = outcomeMapping.get(data.outcome);
        if (test) {
            test.testFunction.status = statusDetails.status;
            test.testFunction.message = data.message;
            test.testFunction.traceback = data.traceback;
            tests.summary[statusDetails.summaryProperty] += 1;
            if (failFast && (statusDetails.summaryProperty === 'failures' || statusDetails.summaryProperty === 'errors')) {
                testManager.stop();
            }
        }
        else {
            if (statusDetails) {
                tests.summary[statusDetails.summaryProperty] += 1;
            }
        }
    });
    server.on('socket.disconnected', (data) => {
    });
    return server.start().then(port => {
        let testPaths = getIdsOfTestsToRun(tests, testsToRun);
        for (let counter = 0; counter < testPaths.length; counter++) {
            testPaths[counter] = '-t' + testPaths[counter].trim();
        }
        const startTestDiscoveryDirectory = getStartDirectory(args);
        function runTest(testFile = '', testId = '') {
            let testArgs = buildTestArgs(args);
            failFast = testArgs.indexOf('--uf') >= 0;
            testArgs = testArgs.filter(arg => arg !== '--uf');
            testArgs.push(`--result-port=${port}`);
            if (debug === true) {
                testArgs.push(...[`--secret=my_secret`, `--port=3000`]);
            }
            testArgs.push(`--us=${startTestDiscoveryDirectory}`);
            if (testId.length > 0) {
                testArgs.push(`-t${testId}`);
            }
            if (testFile.length > 0) {
                testArgs.push(`--testFile=${testFile}`);
            }
            if (debug === true) {
                const def = helpers_1.createDeferred();
                const launchDef = helpers_1.createDeferred();
                let outputChannelShown = false;
                // start the debug adapter only once we have started the debug process
                utils_1.execPythonFile(settings.pythonPath, [testLauncherFile].concat(testArgs), rootDirectory, true, (data) => {
                    if (data.startsWith('READY' + os.EOL)) {
                        // debug socket server has started
                        launchDef.resolve();
                        data = data.substring(('READY' + os.EOL).length);
                    }
                    if (!outputChannelShown) {
                        outputChannelShown = true;
                        outChannel.show();
                    }
                    outChannel.append(data);
                }, token).catch(reason => {
                    if (!def.rejected && !def.resolved) {
                        def.reject(reason);
                    }
                }).then(() => {
                    if (!def.rejected && !def.resolved) {
                        def.resolve();
                    }
                }).catch(reason => {
                    if (!def.rejected && !def.resolved) {
                        def.reject(reason);
                    }
                });
                launchDef.promise
                    .then(() => {
                    return vscode.commands.executeCommand('vscode.startDebug', {
                        "name": "Debug Unit Test",
                        "type": "python",
                        "request": "attach",
                        "localRoot": rootDirectory,
                        "remoteRoot": rootDirectory,
                        "port": settings.unitTest.debugPort,
                        "secret": "my_secret",
                        "host": "localhost"
                    });
                })
                    .catch(reason => {
                    if (!def.rejected && !def.resolved) {
                        def.reject(reason);
                    }
                });
                return def.promise;
            }
            else {
                return runner_1.run(settings.pythonPath, [testLauncherFile].concat(testArgs), rootDirectory, token, outChannel);
            }
        }
        // Test everything
        if (testPaths.length === 0) {
            return runTest();
        }
        // Ok, the ptvs test runner can only work with one test at a time
        let promise = Promise.resolve('');
        if (Array.isArray(testsToRun.testFile)) {
            testsToRun.testFile.forEach(testFile => {
                promise = promise.then(() => runTest(testFile.fullPath, testFile.nameToRun));
            });
        }
        if (Array.isArray(testsToRun.testSuite)) {
            testsToRun.testSuite.forEach(testSuite => {
                const testFileName = tests.testSuits.find(t => t.testSuite === testSuite).parentTestFile.fullPath;
                promise = promise.then(() => runTest(testFileName, testSuite.nameToRun));
            });
        }
        if (Array.isArray(testsToRun.testFunction)) {
            testsToRun.testFunction.forEach(testFn => {
                const testFileName = tests.testFunctions.find(t => t.testFunction === testFn).parentTestFile.fullPath;
                promise = promise.then(() => runTest(testFileName, testFn.nameToRun));
            });
        }
        return promise;
    }).then(() => {
        testUtils_1.updateResults(tests);
        return tests;
    }).catch(reason => {
        return Promise.reject(reason);
    });
}
exports.runTest = runTest;
function getStartDirectory(args) {
    let startDirectory = '.';
    const indexOfStartDir = args.findIndex(arg => arg.indexOf('-s') === 0 || arg.indexOf('--start-directory') === 0);
    if (indexOfStartDir >= 0) {
        const startDir = args[indexOfStartDir].trim();
        if ((startDir.trim() === '-s' || startDir.trim() === '--start-directory') && args.length >= indexOfStartDir) {
            // Assume the next items is the directory
            startDirectory = args[indexOfStartDir + 1];
        }
        else {
            const lenToStartFrom = startDir.startsWith('-s') ? '-s'.length : '--start-directory'.length;
            startDirectory = startDir.substring(lenToStartFrom).trim();
            if (startDirectory.startsWith('=')) {
                startDirectory = startDirectory.substring(1);
            }
        }
    }
    return startDirectory;
}
function buildTestArgs(args) {
    const startTestDiscoveryDirectory = getStartDirectory(args);
    let pattern = 'test*.py';
    const indexOfPattern = args.findIndex(arg => arg.indexOf('-p') === 0 || arg.indexOf('--pattern') === 0);
    if (indexOfPattern >= 0) {
        const patternValue = args[indexOfPattern].trim();
        if ((patternValue.trim() === '-p' || patternValue.trim() === '--pattern') && args.length >= indexOfPattern) {
            // Assume the next items is the directory
            pattern = args[indexOfPattern + 1];
        }
        else {
            const lenToStartFrom = patternValue.startsWith('-p') ? '-p'.length : '--pattern'.length;
            pattern = patternValue.substring(lenToStartFrom).trim();
            if (pattern.startsWith('=')) {
                pattern = pattern.substring(1);
            }
        }
    }
    const failFast = args.some(arg => arg.trim() === '-f' || arg.trim() === '--failfast');
    const verbosity = args.some(arg => arg.trim().indexOf('-v') === 0) ? 2 : 1;
    const testArgs = [`--us=${startTestDiscoveryDirectory}`, `--up=${pattern}`, `--uvInt=${verbosity}`];
    if (failFast) {
        testArgs.push('--uf');
    }
    return testArgs;
}
function getIdsOfTestsToRun(tests, testsToRun) {
    const testIds = [];
    if (testsToRun && testsToRun.testFolder) {
        // Get test ids of files in these folders
        testsToRun.testFolder.map(folder => {
            tests.testFiles.forEach(f => {
                if (f.fullPath.startsWith(folder.name)) {
                    testIds.push(f.nameToRun);
                }
            });
        });
    }
    if (testsToRun && testsToRun.testFile) {
        testIds.push(...testsToRun.testFile.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testSuite) {
        testIds.push(...testsToRun.testSuite.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testFunction) {
        testIds.push(...testsToRun.testFunction.map(f => f.nameToRun));
    }
    return testIds;
}
//# sourceMappingURL=runner.js.map