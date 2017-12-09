'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./../../common/utils");
const os = require("os");
const testUtils_1 = require("../common/testUtils");
const path = require("path");
const configSettings_1 = require("../../common/configSettings");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
const argsToExcludeForDiscovery = ['-x', '--exitfirst',
    '--fixtures-per-test', '--pdb', '--runxfail',
    '--lf', '--last-failed', '--ff', '--failed-first',
    '--cache-show', '--cache-clear',
    '-v', '--verbose', '-q', '-quiet',
    '--disable-pytest-warnings', '-l', '--showlocals'];
const settingsInArgsToExcludeForDiscovery = [];
function discoverTests(rootDirectory, args, token, ignoreCache, outChannel) {
    let logOutputLines = [''];
    let testFiles = [];
    let parentNodes = [];
    const errorLine = /==*( *)ERRORS( *)=*/;
    const errorFileLine = /__*( *)ERROR collecting (.*)/;
    const lastLineWithErrors = /==*.*/;
    let haveErrors = false;
    // Remove unwanted arguments
    args = args.filter(arg => {
        if (argsToExcludeForDiscovery.indexOf(arg.trim()) !== -1) {
            return false;
        }
        if (settingsInArgsToExcludeForDiscovery.some(setting => setting.indexOf(arg.trim()) === 0)) {
            return false;
        }
        return true;
    });
    if (ignoreCache && args.indexOf('--cache-clear') === -1) {
        args.push('--cache-clear');
    }
    function processOutput(output) {
        output.split(/\r?\n/g).forEach((line, index, lines) => {
            if (token && token.isCancellationRequested) {
                return;
            }
            if (line.trim().startsWith('<Module \'') || index === lines.length - 1) {
                // process the previous lines
                parsePyTestModuleCollectionResult(rootDirectory, logOutputLines, testFiles, parentNodes);
                logOutputLines = [''];
            }
            if (errorLine.test(line)) {
                haveErrors = true;
                logOutputLines = [''];
                return;
            }
            if (errorFileLine.test(line)) {
                haveErrors = true;
                if (logOutputLines.length !== 1 && logOutputLines[0].length !== 0) {
                    parsePyTestModuleCollectionError(rootDirectory, logOutputLines, testFiles, parentNodes);
                    logOutputLines = [''];
                }
            }
            if (lastLineWithErrors.test(line) && haveErrors) {
                parsePyTestModuleCollectionError(rootDirectory, logOutputLines, testFiles, parentNodes);
                logOutputLines = [''];
            }
            if (index === 0) {
                if (output.startsWith(os.EOL) || lines.length > 1) {
                    logOutputLines[logOutputLines.length - 1] += line;
                    logOutputLines.push('');
                    return;
                }
                logOutputLines[logOutputLines.length - 1] += line;
                return;
            }
            if (index === lines.length - 1) {
                logOutputLines[logOutputLines.length - 1] += line;
                return;
            }
            logOutputLines[logOutputLines.length - 1] += line;
            logOutputLines.push('');
            return;
        });
    }
    return utils_1.execPythonFile(pythonSettings.unitTest.pyTestPath, args.concat(['--collect-only']), rootDirectory, false, null, token)
        .then(data => {
        outChannel.appendLine(data);
        processOutput(data);
        if (token && token.isCancellationRequested) {
            return Promise.reject('cancelled');
        }
        return testUtils_1.flattenTestFiles(testFiles);
    });
}
exports.discoverTests = discoverTests;
const DELIMITER = '\'';
function parsePyTestModuleCollectionError(rootDirectory, lines, testFiles, parentNodes) {
    lines = lines.filter(line => line.trim().length > 0);
    if (lines.length <= 1) {
        return;
    }
    let errorFileLine = lines[0];
    let fileName = errorFileLine.substring(errorFileLine.indexOf('ERROR collecting') + 'ERROR collecting'.length).trim();
    fileName = fileName.substr(0, fileName.lastIndexOf(' '));
    const currentPackage = testUtils_1.convertFileToPackage(fileName);
    const fullyQualifiedName = path.isAbsolute(fileName) ? fileName : path.resolve(rootDirectory, fileName);
    const testFile = {
        functions: [], suites: [], name: fileName, fullPath: fullyQualifiedName,
        nameToRun: fileName, xmlName: currentPackage, time: 0, errorsWhenDiscovering: lines.join('\n')
    };
    testFiles.push(testFile);
    parentNodes.push({ indent: 0, item: testFile });
    return;
}
function parsePyTestModuleCollectionResult(rootDirectory, lines, testFiles, parentNodes) {
    let currentPackage = '';
    lines.forEach(line => {
        const trimmedLine = line.trim();
        const name = testUtils_1.extractBetweenDelimiters(trimmedLine, DELIMITER, DELIMITER);
        const indent = line.indexOf('<');
        if (trimmedLine.startsWith('<Module \'')) {
            currentPackage = testUtils_1.convertFileToPackage(name);
            const fullyQualifiedName = path.isAbsolute(name) ? name : path.resolve(rootDirectory, name);
            const testFile = {
                functions: [], suites: [], name: name, fullPath: fullyQualifiedName,
                nameToRun: name, xmlName: currentPackage, time: 0
            };
            testFiles.push(testFile);
            parentNodes.push({ indent: indent, item: testFile });
            return;
        }
        const parentNode = findParentOfCurrentItem(indent, parentNodes);
        if (trimmedLine.startsWith('<Class \'') || trimmedLine.startsWith('<UnitTestCase \'')) {
            const isUnitTest = trimmedLine.startsWith('<UnitTestCase \'');
            const rawName = parentNode.item.nameToRun + `::${name}`;
            const xmlName = parentNode.item.xmlName + `.${name}`;
            const testSuite = { name: name, nameToRun: rawName, functions: [], suites: [], isUnitTest: isUnitTest, isInstance: false, xmlName: xmlName, time: 0 };
            parentNode.item.suites.push(testSuite);
            parentNodes.push({ indent: indent, item: testSuite });
            return;
        }
        if (trimmedLine.startsWith('<Instance \'')) {
            let suite = parentNode.item;
            // suite.rawName = suite.rawName + '::()';
            // suite.xmlName = suite.xmlName + '.()';
            suite.isInstance = true;
            return;
        }
        if (trimmedLine.startsWith('<TestCaseFunction \'') || trimmedLine.startsWith('<Function \'')) {
            const rawName = parentNode.item.nameToRun + '::' + name;
            const fn = { name: name, nameToRun: rawName, time: 0 };
            parentNode.item.functions.push(fn);
            return;
        }
    });
}
function findParentOfCurrentItem(indentOfCurrentItem, parentNodes) {
    while (parentNodes.length > 0) {
        let parentNode = parentNodes[parentNodes.length - 1];
        if (parentNode.indent < indentOfCurrentItem) {
            return parentNode;
        }
        parentNodes.pop();
        continue;
    }
    return null;
}
//# sourceMappingURL=collector.js.map