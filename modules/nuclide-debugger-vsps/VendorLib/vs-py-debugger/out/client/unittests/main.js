'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const contracts_1 = require("./common/contracts");
const nosetests = require("./nosetest/main");
const pytest = require("./pytest/main");
const unittest = require("./unittest/main");
const testUtils_1 = require("./common/testUtils");
const configSettings_1 = require("../common/configSettings");
const main_1 = require("./display/main");
const picker_1 = require("./display/picker");
const constants = require("../common/constants");
const main_2 = require("./codeLenses/main");
const configuration_1 = require("./configuration");
const settings = configSettings_1.PythonSettings.getInstance();
let testManager;
let pyTestManager;
let unittestManager;
let nosetestManager;
let testResultDisplay;
let testDisplay;
let outChannel;
let onDidChange = new vscode.EventEmitter();
function activate(context, outputChannel, symboldProvider) {
    context.subscriptions.push({ dispose: dispose });
    outChannel = outputChannel;
    let disposables = registerCommands();
    context.subscriptions.push(...disposables);
    if (settings.unitTest.nosetestsEnabled || settings.unitTest.pyTestEnabled || settings.unitTest.unittestEnabled) {
        // Ignore the exceptions returned
        // This function is invoked via a command which will be invoked else where in the extension
        discoverTests(true).catch(() => {
            // Ignore the errors
        });
    }
    settings.addListener('change', onConfigChanged);
    context.subscriptions.push(main_2.activateCodeLenses(onDidChange, symboldProvider));
    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(onDocumentSaved));
}
exports.activate = activate;
let timeoutId;
function onDocumentSaved(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        let testManager = getTestRunner();
        if (!testManager) {
            return;
        }
        let tests = yield testManager.discoverTests(false, true);
        if (!tests || !Array.isArray(tests.testFiles) || tests.testFiles.length === 0) {
            return;
        }
        if (tests.testFiles.findIndex(f => f.fullPath === doc.uri.fsPath) === -1) {
            return;
        }
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => { discoverTests(true); }, 1000);
    });
}
function dispose() {
    if (pyTestManager) {
        pyTestManager.dispose();
    }
    if (nosetestManager) {
        nosetestManager.dispose();
    }
    if (unittestManager) {
        unittestManager.dispose();
    }
}
function registerCommands() {
    const disposables = [];
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Discover, () => {
        // Ignore the exceptions returned
        // This command will be invoked else where in the extension
        discoverTests(true).catch(() => { return null; });
    }));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Run_Failed, () => runTestsImpl(true)));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Run, (testId) => runTestsImpl(testId)));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Debug, (testId) => runTestsImpl(testId, true)));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_View_UI, () => displayUI()));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Picker_UI, (file, testFunctions) => displayPickerUI(file, testFunctions)));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Picker_UI_Debug, (file, testFunctions) => displayPickerUI(file, testFunctions, true)));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Stop, () => stopTests()));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_ViewOutput, () => outChannel.show()));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Ask_To_Stop_Discovery, () => displayStopUI('Stop discovering tests')));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Ask_To_Stop_Test, () => displayStopUI('Stop running tests')));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Select_And_Run_Method, () => selectAndRunTestMethod()));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Select_And_Debug_Method, () => selectAndRunTestMethod(true)));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Select_And_Run_File, () => selectAndRunTestFile()));
    disposables.push(vscode.commands.registerCommand(constants.Commands.Tests_Run_Current_File, () => runCurrentTestFile()));
    return disposables;
}
function displayUI() {
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    testDisplay = testDisplay ? testDisplay : new picker_1.TestDisplay();
    testDisplay.displayTestUI(vscode.workspace.rootPath);
}
function displayPickerUI(file, testFunctions, debug) {
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    testDisplay = testDisplay ? testDisplay : new picker_1.TestDisplay();
    testDisplay.displayFunctionTestPickerUI(vscode.workspace.rootPath, file, testFunctions, debug);
}
function selectAndRunTestMethod(debug) {
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    testManager.discoverTests(true, true).then(() => {
        const tests = testUtils_1.getDiscoveredTests();
        testDisplay = testDisplay ? testDisplay : new picker_1.TestDisplay();
        testDisplay.selectTestFunction(vscode.workspace.rootPath, tests).then(testFn => {
            runTestsImpl(testFn, debug);
        }).catch(() => { });
    });
}
function selectAndRunTestFile() {
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    testManager.discoverTests(true, true).then(() => {
        const tests = testUtils_1.getDiscoveredTests();
        testDisplay = testDisplay ? testDisplay : new picker_1.TestDisplay();
        testDisplay.selectTestFile(vscode.workspace.rootPath, tests).then(testFile => {
            runTestsImpl({ testFile: [testFile] });
        }).catch(() => { });
    });
}
function runCurrentTestFile() {
    if (!vscode.window.activeTextEditor) {
        return;
    }
    const currentFilePath = vscode.window.activeTextEditor.document.fileName;
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    testManager.discoverTests(true, true).then(() => {
        const tests = testUtils_1.getDiscoveredTests();
        const testFiles = tests.testFiles.filter(testFile => {
            return testFile.fullPath === currentFilePath;
        });
        if (testFiles.length < 1) {
            return;
        }
        runTestsImpl({ testFile: [testFiles[0]] });
    });
}
function displayStopUI(message) {
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    testDisplay = testDisplay ? testDisplay : new picker_1.TestDisplay();
    testDisplay.displayStopTestUI(message);
}
let uniTestSettingsString = JSON.stringify(settings.unitTest);
function onConfigChanged() {
    // Possible that a test framework has been enabled or some settings have changed
    // Meaning we need to re-load the discovered tests (as something could have changed)
    const newSettings = JSON.stringify(settings.unitTest);
    if (uniTestSettingsString === newSettings) {
        return;
    }
    uniTestSettingsString = newSettings;
    if (!settings.unitTest.nosetestsEnabled && !settings.unitTest.pyTestEnabled && !settings.unitTest.unittestEnabled) {
        if (testResultDisplay) {
            testResultDisplay.enabled = false;
        }
        if (testManager) {
            testManager.stop();
            testManager = null;
        }
        if (pyTestManager) {
            pyTestManager.dispose();
            pyTestManager = null;
        }
        if (nosetestManager) {
            nosetestManager.dispose();
            nosetestManager = null;
        }
        if (unittestManager) {
            unittestManager.dispose();
            unittestManager = null;
        }
        return;
    }
    if (testResultDisplay) {
        testResultDisplay.enabled = true;
    }
    // No need to display errors
    if (settings.unitTest.nosetestsEnabled || settings.unitTest.pyTestEnabled || settings.unitTest.unittestEnabled) {
        discoverTests(true);
    }
}
function getTestRunner() {
    const rootDirectory = vscode.workspace.rootPath;
    if (settings.unitTest.nosetestsEnabled) {
        return nosetestManager = nosetestManager ? nosetestManager : new nosetests.TestManager(rootDirectory, outChannel);
    }
    else if (settings.unitTest.pyTestEnabled) {
        return pyTestManager = pyTestManager ? pyTestManager : new pytest.TestManager(rootDirectory, outChannel);
    }
    else if (settings.unitTest.unittestEnabled) {
        return unittestManager = unittestManager ? unittestManager : new unittest.TestManager(rootDirectory, outChannel);
    }
    return null;
}
function stopTests() {
    let testManager = getTestRunner();
    if (testManager) {
        testManager.stop();
    }
}
function discoverTests(ignoreCache) {
    let testManager = getTestRunner();
    if (!testManager) {
        configuration_1.displayTestFrameworkError(outChannel);
        return Promise.resolve(null);
    }
    if (testManager && (testManager.status !== contracts_1.TestStatus.Discovering && testManager.status !== contracts_1.TestStatus.Running)) {
        testResultDisplay = testResultDisplay ? testResultDisplay : new main_1.TestResultDisplay(outChannel, onDidChange);
        return testResultDisplay.DisplayDiscoverStatus(testManager.discoverTests(ignoreCache));
    }
    else {
        return Promise.resolve(null);
    }
}
function isTestsToRun(arg) {
    if (arg && arg.testFunction && Array.isArray(arg.testFunction)) {
        return true;
    }
    if (arg && arg.testSuite && Array.isArray(arg.testSuite)) {
        return true;
    }
    if (arg && arg.testFile && Array.isArray(arg.testFile)) {
        return true;
    }
    return false;
}
function isUri(arg) {
    return arg && arg.fsPath && typeof arg.fsPath === 'string';
}
function isFlattenedTestFunction(arg) {
    return arg && arg.testFunction && typeof arg.xmlClassName === 'string' &&
        arg.parentTestFile && typeof arg.testFunction.name === 'string';
}
function identifyTestType(rootDirectory, arg) {
    if (typeof arg === 'boolean') {
        return arg === true;
    }
    if (isTestsToRun(arg)) {
        return arg;
    }
    if (isFlattenedTestFunction(arg)) {
        return { testFunction: [arg.testFunction] };
    }
    if (isUri(arg)) {
        return testUtils_1.resolveValueAsTestToRun(arg.fsPath, rootDirectory);
    }
    return null;
}
function runTestsImpl(arg, debug = false) {
    let testManager = getTestRunner();
    if (!testManager) {
        return configuration_1.displayTestFrameworkError(outChannel);
    }
    // lastRanTests = testsToRun;
    let runInfo = identifyTestType(vscode.workspace.rootPath, arg);
    testResultDisplay = testResultDisplay ? testResultDisplay : new main_1.TestResultDisplay(outChannel, onDidChange);
    let ret = typeof runInfo === 'boolean' ? testManager.runTest(runInfo, debug) : testManager.runTest(runInfo, debug);
    let runPromise = ret.catch(reason => {
        if (reason !== contracts_1.CANCELLATION_REASON) {
            outChannel.appendLine('Error: ' + reason);
        }
        return Promise.reject(reason);
    });
    testResultDisplay.DisplayProgressStatus(runPromise, debug);
}
//# sourceMappingURL=main.js.map