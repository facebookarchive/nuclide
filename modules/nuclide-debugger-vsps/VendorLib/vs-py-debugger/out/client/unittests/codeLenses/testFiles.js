'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const contracts_1 = require("../common/contracts");
const constants = require("../../common/constants");
const testUtils_1 = require("../common/testUtils");
class TestFileCodeLensProvider {
    constructor(_onDidChange, symbolProvider) {
        this._onDidChange = _onDidChange;
        this.symbolProvider = symbolProvider;
    }
    get onDidChangeCodeLenses() {
        return this._onDidChange.event;
    }
    provideCodeLenses(document, token) {
        let testItems = testUtils_1.getDiscoveredTests();
        if (!testItems || testItems.testFiles.length === 0 || testItems.testFunctions.length === 0) {
            return Promise.resolve([]);
        }
        let cancelTokenSrc = new vscode.CancellationTokenSource();
        token.onCancellationRequested(() => { cancelTokenSrc.cancel(); });
        // Strop trying to build the code lenses if unable to get a list of
        // symbols in this file afrer x time
        setTimeout(() => {
            if (!cancelTokenSrc.token.isCancellationRequested) {
                cancelTokenSrc.cancel();
            }
        }, constants.Delays.MaxUnitTestCodeLensDelay);
        return getCodeLenses(document, token, this.symbolProvider);
    }
    resolveCodeLens(codeLens, token) {
        codeLens.command = { command: 'python.runtests', title: 'Test' };
        return Promise.resolve(codeLens);
    }
}
exports.TestFileCodeLensProvider = TestFileCodeLensProvider;
function getCodeLenses(document, token, symbolProvider) {
    const documentUri = document.uri;
    const tests = testUtils_1.getDiscoveredTests();
    if (!tests) {
        return null;
    }
    const file = tests.testFiles.find(file => file.fullPath === documentUri.fsPath);
    if (!file) {
        return Promise.resolve([]);
    }
    const allFuncsAndSuites = getAllTestSuitesAndFunctionsPerFile(file);
    return symbolProvider.provideDocumentSymbolsForInternalUse(document, token)
        .then((symbols) => {
        return symbols.filter(symbol => {
            return symbol.kind === vscode.SymbolKind.Function ||
                symbol.kind === vscode.SymbolKind.Method ||
                symbol.kind === vscode.SymbolKind.Class;
        }).map(symbol => {
            // This is bloody crucial, if the start and end columns are the same
            // then vscode goes bonkers when ever you edit a line (start scrolling magically)
            const range = new vscode.Range(symbol.location.range.start, new vscode.Position(symbol.location.range.end.line, symbol.location.range.end.character + 1));
            return getCodeLens(documentUri.fsPath, allFuncsAndSuites, range, symbol.name, symbol.kind);
        }).reduce((previous, current) => previous.concat(current), []).filter(codeLens => codeLens !== null);
    }, reason => {
        if (token.isCancellationRequested) {
            return [];
        }
        return Promise.reject(reason);
    });
}
function getCodeLens(fileName, allFuncsAndSuites, range, symbolName, symbolKind) {
    switch (symbolKind) {
        case vscode.SymbolKind.Function:
        case vscode.SymbolKind.Method: {
            return getFunctionCodeLens(fileName, allFuncsAndSuites, symbolName, range);
        }
        case vscode.SymbolKind.Class: {
            const cls = allFuncsAndSuites.suites.find(cls => cls.name === symbolName);
            if (!cls) {
                return null;
            }
            return [
                new vscode_1.CodeLens(range, {
                    title: getTestStatusIcon(cls.status) + constants.Text.CodeLensRunUnitTest,
                    command: constants.Commands.Tests_Run,
                    arguments: [{ testSuite: [cls] }]
                }),
                new vscode_1.CodeLens(range, {
                    title: getTestStatusIcon(cls.status) + constants.Text.CodeLensDebugUnitTest,
                    command: constants.Commands.Tests_Debug,
                    arguments: [{ testSuite: [cls] }]
                })
            ];
        }
    }
    return null;
}
function getTestStatusIcon(status) {
    switch (status) {
        case contracts_1.TestStatus.Pass: {
            return '✔ ';
        }
        case contracts_1.TestStatus.Error:
        case contracts_1.TestStatus.Fail: {
            return '✘ ';
        }
        case contracts_1.TestStatus.Skipped: {
            return '⃠ ';
        }
        default: {
            return '';
        }
    }
}
function getTestStatusIcons(fns) {
    let statuses = [];
    let count = fns.filter(fn => fn.status === contracts_1.TestStatus.Pass).length;
    if (count > 0) {
        statuses.push(`✔ ${count}`);
    }
    count = fns.filter(fn => fn.status === contracts_1.TestStatus.Error || fn.status === contracts_1.TestStatus.Fail).length;
    if (count > 0) {
        statuses.push(`✘ ${count}`);
    }
    count = fns.filter(fn => fn.status === contracts_1.TestStatus.Skipped).length;
    if (count > 0) {
        statuses.push(`⃠ ${count}`);
    }
    return statuses.join(' ');
}
function getFunctionCodeLens(filePath, functionsAndSuites, symbolName, range) {
    const fn = functionsAndSuites.functions.find(fn => fn.name === symbolName);
    if (fn) {
        return [
            new vscode_1.CodeLens(range, {
                title: getTestStatusIcon(fn.status) + constants.Text.CodeLensRunUnitTest,
                command: constants.Commands.Tests_Run,
                arguments: [{ testFunction: [fn] }]
            }),
            new vscode_1.CodeLens(range, {
                title: getTestStatusIcon(fn.status) + constants.Text.CodeLensDebugUnitTest,
                command: constants.Commands.Tests_Debug,
                arguments: [{ testFunction: [fn] }]
            })
        ];
    }
    // Ok, possible we're dealing with parameterized unit tests
    // If we have [ in the name, then this is a parameterized function
    let functions = functionsAndSuites.functions.filter(fn => fn.name.startsWith(symbolName + '[') && fn.name.endsWith(']'));
    if (functions.length === 0) {
        return null;
    }
    if (functions.length === 0) {
        return [
            new vscode_1.CodeLens(range, {
                title: constants.Text.CodeLensRunUnitTest,
                command: constants.Commands.Tests_Run,
                arguments: [{ testFunction: functions }]
            }),
            new vscode_1.CodeLens(range, {
                title: constants.Text.CodeLensDebugUnitTest,
                command: constants.Commands.Tests_Debug,
                arguments: [{ testFunction: functions }]
            })
        ];
    }
    // Find all flattened functions
    return [
        new vscode_1.CodeLens(range, {
            title: getTestStatusIcons(functions) + constants.Text.CodeLensRunUnitTest + ' (Multiple)',
            command: constants.Commands.Tests_Picker_UI,
            arguments: [filePath, functions]
        }),
        new vscode_1.CodeLens(range, {
            title: getTestStatusIcons(functions) + constants.Text.CodeLensDebugUnitTest + ' (Multiple)',
            command: constants.Commands.Tests_Picker_UI_Debug,
            arguments: [filePath, functions]
        })
    ];
}
function getAllTestSuitesAndFunctionsPerFile(testFile) {
    const all = { functions: testFile.functions, suites: [] };
    testFile.suites.forEach(suite => {
        all.suites.push(suite);
        const allChildItems = getAllTestSuitesAndFunctions(suite);
        all.functions.push(...allChildItems.functions);
        all.suites.push(...allChildItems.suites);
    });
    return all;
}
function getAllTestSuitesAndFunctions(testSuite) {
    const all = { functions: [], suites: [] };
    testSuite.functions.forEach(fn => {
        all.functions.push(fn);
    });
    testSuite.suites.forEach(suite => {
        all.suites.push(suite);
        const allChildItems = getAllTestSuitesAndFunctions(suite);
        all.functions.push(...allChildItems.functions);
        all.suites.push(...allChildItems.suites);
    });
    return all;
}
//# sourceMappingURL=testFiles.js.map