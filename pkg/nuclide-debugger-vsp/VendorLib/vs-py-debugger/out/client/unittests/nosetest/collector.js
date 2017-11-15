'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const utils_1 = require("./../../common/utils");
const os = require("os");
const testUtils_1 = require("../common/testUtils");
const configSettings_1 = require("../../common/configSettings");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
const NOSE_WANT_FILE_PREFIX = 'nose.selector: DEBUG: wantFile ';
const NOSE_WANT_FILE_SUFFIX = '.py? True';
const NOSE_WANT_FILE_SUFFIX_WITHOUT_EXT = '? True';
const argsToExcludeForDiscovery = ['-v', '--verbose',
    '-q', '--quiet', '-x', '--stop',
    '--with-coverage', '--cover-erase', '--cover-tests',
    '--cover-inclusive', '--cover-html', '--cover-branches', '--cover-xml',
    '--pdb', '--pdb-failures', '--pdb-errors',
    '--failed', '--process-restartworker', '--with-xunit'];
const settingsInArgsToExcludeForDiscovery = ['--verbosity'];
function discoverTests(rootDirectory, args, token, ignoreCache, outChannel) {
    let logOutputLines = [''];
    let testFiles = [];
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
    function appendLine(line) {
        const lastLineIndex = logOutputLines.length - 1;
        logOutputLines[lastLineIndex] += line;
        // Check whether the previous line is something that we need
        // What we need is a line that ends with ? True
        //  and starts with nose.selector: DEBUG: want
        if (logOutputLines[lastLineIndex].endsWith('? True')) {
            logOutputLines.push('');
        }
        else {
            // We don't need this line
            logOutputLines[lastLineIndex] = '';
        }
    }
    function processOutput(output) {
        output.split(/\r?\n/g).forEach((line, index, lines) => {
            if ((line.startsWith(NOSE_WANT_FILE_PREFIX) && line.endsWith(NOSE_WANT_FILE_SUFFIX)) ||
                index === lines.length - 1) {
                // process the previous lines
                parseNoseTestModuleCollectionResult(rootDirectory, logOutputLines, testFiles);
                logOutputLines = [''];
            }
            if (index === 0) {
                if (output.startsWith(os.EOL) || lines.length > 1) {
                    appendLine(line);
                    return;
                }
                logOutputLines[logOutputLines.length - 1] += line;
                return;
            }
            if (index === lines.length - 1) {
                logOutputLines[logOutputLines.length - 1] += line;
                return;
            }
            appendLine(line);
            return;
        });
    }
    return utils_1.execPythonFile(pythonSettings.unitTest.nosetestPath, args.concat(['--collect-only', '-vvv']), rootDirectory, true)
        .then(data => {
        outChannel.appendLine(data);
        processOutput(data);
        // Exclude tests that don't have any functions or test suites
        testFiles = testFiles.filter(testFile => testFile.suites.length > 0 || testFile.functions.length > 0);
        return testUtils_1.flattenTestFiles(testFiles);
    });
}
exports.discoverTests = discoverTests;
function parseNoseTestModuleCollectionResult(rootDirectory, lines, testFiles) {
    let currentPackage = '';
    let fileName = '';
    let testFile;
    lines.forEach(line => {
        if (line.startsWith(NOSE_WANT_FILE_PREFIX) && line.endsWith(NOSE_WANT_FILE_SUFFIX)) {
            fileName = line.substring(NOSE_WANT_FILE_PREFIX.length);
            fileName = fileName.substring(0, fileName.lastIndexOf(NOSE_WANT_FILE_SUFFIX_WITHOUT_EXT));
            // We need to display the path relative to the current directory
            fileName = fileName.substring(rootDirectory.length + 1);
            // we don't care about the compiled file
            if (path.extname(fileName) === '.pyc') {
                fileName = fileName.substring(0, fileName.length - 1);
            }
            currentPackage = testUtils_1.convertFileToPackage(fileName);
            const fullyQualifiedName = path.isAbsolute(fileName) ? fileName : path.resolve(rootDirectory, fileName);
            testFile = {
                functions: [], suites: [], name: fileName, nameToRun: fileName,
                xmlName: currentPackage, time: 0, functionsFailed: 0, functionsPassed: 0,
                fullPath: fullyQualifiedName
            };
            testFiles.push(testFile);
            return;
        }
        if (line.startsWith('nose.selector: DEBUG: wantClass <class \'')) {
            let name = testUtils_1.extractBetweenDelimiters(line, 'nose.selector: DEBUG: wantClass <class \'', '\'>? True');
            const testSuite = {
                name: path.extname(name).substring(1), nameToRun: fileName + `:${name}`,
                functions: [], suites: [], xmlName: name, time: 0, isUnitTest: false,
                isInstance: false, functionsFailed: 0, functionsPassed: 0
            };
            testFile.suites.push(testSuite);
            return;
        }
        if (line.startsWith('nose.selector: DEBUG: wantClass ')) {
            let name = testUtils_1.extractBetweenDelimiters(line, 'nose.selector: DEBUG: wantClass ', '? True');
            const testSuite = {
                name: path.extname(name).substring(1), nameToRun: `${fileName}:.${name}`,
                functions: [], suites: [], xmlName: name, time: 0, isUnitTest: false,
                isInstance: false, functionsFailed: 0, functionsPassed: 0
            };
            testFile.suites.push(testSuite);
            return;
        }
        if (line.startsWith('nose.selector: DEBUG: wantMethod <unbound method ')) {
            const name = testUtils_1.extractBetweenDelimiters(line, 'nose.selector: DEBUG: wantMethod <unbound method ', '>? True');
            const fnName = path.extname(name).substring(1);
            const clsName = path.basename(name, path.extname(name));
            const fn = {
                name: fnName, nameToRun: `${fileName}:${clsName}.${fnName}`,
                time: 0, functionsFailed: 0, functionsPassed: 0
            };
            let cls = testFile.suites.find(suite => suite.name === clsName);
            cls.functions.push(fn);
            return;
        }
        if (line.startsWith('nose.selector: DEBUG: wantFunction <function ')) {
            const name = testUtils_1.extractBetweenDelimiters(line, 'nose.selector: DEBUG: wantFunction <function ', ' at ');
            const fn = {
                name: name, nameToRun: `${fileName}:${name}`,
                time: 0, functionsFailed: 0, functionsPassed: 0
            };
            testFile.functions.push(fn);
            return;
        }
    });
}
//# sourceMappingURL=collector.js.map