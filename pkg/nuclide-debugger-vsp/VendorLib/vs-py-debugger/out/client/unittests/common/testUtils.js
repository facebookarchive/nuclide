"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const contracts_1 = require("./contracts");
const vscode = require("vscode");
const path = require("path");
const constants = require("../../common/constants");
let discoveredTests;
function displayTestErrorMessage(message) {
    vscode.window.showErrorMessage(message, constants.Button_Text_Tests_View_Output).then(action => {
        if (action === constants.Button_Text_Tests_View_Output) {
            vscode.commands.executeCommand(constants.Commands.Tests_ViewOutput);
        }
    });
}
exports.displayTestErrorMessage = displayTestErrorMessage;
function getDiscoveredTests() {
    return discoveredTests;
}
exports.getDiscoveredTests = getDiscoveredTests;
function storeDiscoveredTests(tests) {
    discoveredTests = tests;
}
exports.storeDiscoveredTests = storeDiscoveredTests;
function resolveValueAsTestToRun(name, rootDirectory) {
    // TODO: We need a better way to match (currently we have raw name, name, xmlname, etc = which one do we
    // use to identify a file given the full file name, similary for a folder and function
    // Perhaps something like a parser or methods like TestFunction.fromString()... something)
    let tests = getDiscoveredTests();
    if (!tests) {
        return null;
    }
    const absolutePath = path.isAbsolute(name) ? name : path.resolve(rootDirectory, name);
    let testFolders = tests.testFolders.filter(folder => folder.nameToRun === name || folder.name === name || folder.name === absolutePath);
    if (testFolders.length > 0) {
        return { testFolder: testFolders };
    }
    ;
    let testFiles = tests.testFiles.filter(file => file.nameToRun === name || file.name === name || file.fullPath === absolutePath);
    if (testFiles.length > 0) {
        return { testFile: testFiles };
    }
    ;
    let testFns = tests.testFunctions.filter(fn => fn.testFunction.nameToRun === name || fn.testFunction.name === name).map(fn => fn.testFunction);
    if (testFns.length > 0) {
        return { testFunction: testFns };
    }
    ;
    // Just return this as a test file
    return { testFile: [{ name: name, nameToRun: name, functions: [], suites: [], xmlName: name, fullPath: '', time: 0 }] };
}
exports.resolveValueAsTestToRun = resolveValueAsTestToRun;
function extractBetweenDelimiters(content, startDelimiter, endDelimiter) {
    content = content.substring(content.indexOf(startDelimiter) + startDelimiter.length);
    return content.substring(0, content.lastIndexOf(endDelimiter));
}
exports.extractBetweenDelimiters = extractBetweenDelimiters;
function convertFileToPackage(filePath) {
    let lastIndex = filePath.lastIndexOf('.');
    return filePath.substring(0, lastIndex).replace(/\//g, '.').replace(/\\/g, '.');
}
exports.convertFileToPackage = convertFileToPackage;
function updateResults(tests) {
    tests.testFiles.forEach(updateResultsUpstream);
    tests.testFolders.forEach(updateFolderResultsUpstream);
}
exports.updateResults = updateResults;
function updateFolderResultsUpstream(testFolder) {
    let allFilesPassed = true;
    let allFilesRan = true;
    testFolder.testFiles.forEach(fl => {
        if (allFilesPassed && typeof fl.passed === 'boolean') {
            if (!fl.passed) {
                allFilesPassed = false;
            }
        }
        else {
            allFilesRan = false;
        }
        testFolder.functionsFailed += fl.functionsFailed;
        testFolder.functionsPassed += fl.functionsPassed;
    });
    let allFoldersPassed = true;
    let allFoldersRan = true;
    testFolder.folders.forEach(folder => {
        updateFolderResultsUpstream(folder);
        if (allFoldersPassed && typeof folder.passed === 'boolean') {
            if (!folder.passed) {
                allFoldersPassed = false;
            }
        }
        else {
            allFoldersRan = false;
        }
        testFolder.functionsFailed += folder.functionsFailed;
        testFolder.functionsPassed += folder.functionsPassed;
    });
    if (allFilesRan && allFoldersRan) {
        testFolder.passed = allFilesPassed && allFoldersPassed;
        testFolder.status = testFolder.passed ? contracts_1.TestStatus.Idle : contracts_1.TestStatus.Fail;
    }
    else {
        testFolder.passed = null;
        testFolder.status = contracts_1.TestStatus.Unknown;
    }
}
exports.updateFolderResultsUpstream = updateFolderResultsUpstream;
function updateResultsUpstream(test) {
    let totalTime = 0;
    let allFunctionsPassed = true;
    let allFunctionsRan = true;
    test.functions.forEach(fn => {
        totalTime += fn.time;
        if (typeof fn.passed === 'boolean') {
            if (fn.passed) {
                test.functionsPassed += 1;
            }
            else {
                test.functionsFailed += 1;
                allFunctionsPassed = false;
            }
        }
        else {
            allFunctionsRan = false;
        }
    });
    let allSuitesPassed = true;
    let allSuitesRan = true;
    test.suites.forEach(suite => {
        updateResultsUpstream(suite);
        totalTime += suite.time;
        if (allSuitesRan && typeof suite.passed === 'boolean') {
            if (!suite.passed) {
                allSuitesPassed = false;
            }
        }
        else {
            allSuitesRan = false;
        }
        test.functionsFailed += suite.functionsFailed;
        test.functionsPassed += suite.functionsPassed;
    });
    test.time = totalTime;
    if (allSuitesRan && allFunctionsRan) {
        test.passed = allFunctionsPassed && allSuitesPassed;
        test.status = test.passed ? contracts_1.TestStatus.Idle : contracts_1.TestStatus.Error;
    }
    else {
        test.passed = null;
        test.status = contracts_1.TestStatus.Unknown;
    }
}
exports.updateResultsUpstream = updateResultsUpstream;
function placeTestFilesInFolders(tests) {
    // First get all the unique folders
    const folders = [];
    tests.testFiles.forEach(file => {
        let dir = path.dirname(file.name);
        if (folders.indexOf(dir) === -1) {
            folders.push(dir);
        }
    });
    tests.testFolders = [];
    const folderMap = new Map();
    folders.sort();
    folders.forEach(dir => {
        dir.split(path.sep).reduce((parentPath, currentName, index, values) => {
            let newPath = currentName;
            let parentFolder;
            if (parentPath.length > 0) {
                parentFolder = folderMap.get(parentPath);
                newPath = path.join(parentPath, currentName);
            }
            if (!folderMap.has(newPath)) {
                const testFolder = { name: newPath, testFiles: [], folders: [], nameToRun: newPath, time: 0 };
                folderMap.set(newPath, testFolder);
                if (parentFolder) {
                    parentFolder.folders.push(testFolder);
                }
                else {
                    tests.rootTestFolders.push(testFolder);
                }
                tests.testFiles.filter(fl => path.dirname(fl.name) === newPath).forEach(testFile => {
                    testFolder.testFiles.push(testFile);
                });
                tests.testFolders.push(testFolder);
            }
            return newPath;
        }, '');
    });
}
exports.placeTestFilesInFolders = placeTestFilesInFolders;
function flattenTestFiles(testFiles) {
    let fns = [];
    let suites = [];
    testFiles.forEach(testFile => {
        // sample test_three (file name without extension and all / replaced with ., meaning this is the package)
        const packageName = convertFileToPackage(testFile.name);
        testFile.functions.forEach(fn => {
            fns.push({ testFunction: fn, xmlClassName: packageName, parentTestFile: testFile });
        });
        testFile.suites.forEach(suite => {
            suites.push({ parentTestFile: testFile, testSuite: suite, xmlClassName: suite.xmlName });
            flattenTestSuites(fns, suites, testFile, suite);
        });
    });
    let tests = {
        testFiles: testFiles,
        testFunctions: fns, testSuits: suites,
        testFolders: [],
        rootTestFolders: [],
        summary: { passed: 0, failures: 0, errors: 0, skipped: 0 }
    };
    placeTestFilesInFolders(tests);
    return tests;
}
exports.flattenTestFiles = flattenTestFiles;
function flattenTestSuites(flattenedFns, flattenedSuites, testFile, testSuite) {
    testSuite.functions.forEach(fn => {
        flattenedFns.push({ testFunction: fn, xmlClassName: testSuite.xmlName, parentTestFile: testFile, parentTestSuite: testSuite });
    });
    // We may have child classes
    testSuite.suites.forEach(suite => {
        flattenedSuites.push({ parentTestFile: testFile, testSuite: suite, xmlClassName: suite.xmlName });
        flattenTestSuites(flattenedFns, flattenedSuites, testFile, suite);
    });
}
exports.flattenTestSuites = flattenTestSuites;
function resetTestResults(tests) {
    tests.testFolders.forEach(f => {
        f.functionsDidNotRun = 0;
        f.functionsFailed = 0;
        f.functionsPassed = 0;
        f.passed = null;
        f.status = contracts_1.TestStatus.Unknown;
    });
    tests.testFunctions.forEach(fn => {
        fn.testFunction.passed = null;
        fn.testFunction.time = 0;
        fn.testFunction.message = '';
        fn.testFunction.traceback = '';
        fn.testFunction.status = contracts_1.TestStatus.Unknown;
        fn.testFunction.functionsFailed = 0;
        fn.testFunction.functionsPassed = 0;
        fn.testFunction.functionsDidNotRun = 0;
    });
    tests.testSuits.forEach(suite => {
        suite.testSuite.passed = null;
        suite.testSuite.time = 0;
        suite.testSuite.status = contracts_1.TestStatus.Unknown;
        suite.testSuite.functionsFailed = 0;
        suite.testSuite.functionsPassed = 0;
        suite.testSuite.functionsDidNotRun = 0;
    });
    tests.testFiles.forEach(testFile => {
        testFile.passed = null;
        testFile.time = 0;
        testFile.status = contracts_1.TestStatus.Unknown;
        testFile.functionsFailed = 0;
        testFile.functionsPassed = 0;
        testFile.functionsDidNotRun = 0;
    });
}
exports.resetTestResults = resetTestResults;
//# sourceMappingURL=testUtils.js.map