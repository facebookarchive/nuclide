/// <reference path="../../../../typings/globals/xml2js/index.d.ts" />
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../common/helpers");
const testUtils_1 = require("../common/testUtils");
const xUnitParser_1 = require("../common/xUnitParser");
const runner_1 = require("../common/runner");
const configSettings_1 = require("../../common/configSettings");
const vscode = require("vscode");
const utils_1 = require("./../../common/utils");
const helpers_2 = require("./../../common/helpers");
const os = require("os");
const path = require("path");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
function runTest(rootDirectory, tests, args, testsToRun, token, outChannel, debug) {
    let testPaths = [];
    if (testsToRun && testsToRun.testFolder) {
        testPaths = testPaths.concat(testsToRun.testFolder.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testFile) {
        testPaths = testPaths.concat(testsToRun.testFile.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testSuite) {
        testPaths = testPaths.concat(testsToRun.testSuite.map(f => f.nameToRun));
    }
    if (testsToRun && testsToRun.testFunction) {
        testPaths = testPaths.concat(testsToRun.testFunction.map(f => f.nameToRun));
    }
    let xmlLogFile = '';
    let xmlLogFileCleanup = null;
    return helpers_1.createTemporaryFile('.xml').then(xmlLogResult => {
        xmlLogFile = xmlLogResult.filePath;
        xmlLogFileCleanup = xmlLogResult.cleanupCallback;
        if (testPaths.length > 0) {
            // Ignore the test directories, as we're running a specific test
            args = args.filter(arg => arg.trim().startsWith('-'));
        }
        const testArgs = testPaths.concat(args, [`--junitxml=${xmlLogFile}`]);
        if (debug) {
            const def = helpers_2.createDeferred();
            const launchDef = helpers_2.createDeferred();
            const testLauncherFile = path.join(__dirname, '..', '..', '..', '..', 'pythonFiles', 'PythonTools', 'testlauncher.py');
            // start the debug adapter only once we have started the debug process
            // pytestlauncherargs
            const pytestlauncherargs = [rootDirectory, 'my_secret', pythonSettings.unitTest.debugPort.toString(), 'pytest'];
            let outputChannelShown = false;
            utils_1.execPythonFile(pythonSettings.pythonPath, [testLauncherFile].concat(pytestlauncherargs).concat(testArgs), rootDirectory, true, (data) => {
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
            launchDef.promise.then(() => {
                return vscode.commands.executeCommand('vscode.startDebug', {
                    "name": "Debug Unit Test",
                    "type": "python",
                    "request": "attach",
                    "localRoot": rootDirectory,
                    "remoteRoot": rootDirectory,
                    "port": pythonSettings.unitTest.debugPort,
                    "secret": "my_secret",
                    "host": "localhost"
                });
            }).catch(reason => {
                if (!def.rejected && !def.resolved) {
                    def.reject(reason);
                }
            });
            return def.promise;
        }
        else {
            return runner_1.run(pythonSettings.unitTest.pyTestPath, testArgs, rootDirectory, token, outChannel);
        }
    }).then(() => {
        return updateResultsFromLogFiles(tests, xmlLogFile);
    }).then(result => {
        xmlLogFileCleanup();
        return result;
    }).catch(reason => {
        xmlLogFileCleanup();
        return Promise.reject(reason);
    });
}
exports.runTest = runTest;
function updateResultsFromLogFiles(tests, outputXmlFile) {
    return xUnitParser_1.updateResultsFromXmlLogFile(tests, outputXmlFile, xUnitParser_1.PassCalculationFormulae.pytest).then(() => {
        testUtils_1.updateResults(tests);
        return tests;
    });
}
exports.updateResultsFromLogFiles = updateResultsFromLogFiles;
//# sourceMappingURL=runner.js.map