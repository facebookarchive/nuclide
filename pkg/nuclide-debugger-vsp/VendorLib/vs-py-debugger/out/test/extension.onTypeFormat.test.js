"use strict";
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
Object.defineProperty(exports, "__esModule", { value: true });
// Place this right on top
const initialize_1 = require("./initialize");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const path = require("path");
const settings = require("../client/common/configSettings");
const fs = require("fs-extra");
const blockFormatProvider_1 = require("../client/typeFormatters/blockFormatProvider");
let pythonSettings = settings.PythonSettings.getInstance();
let disposable;
let srcPythoFilesPath = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'typeFormatFiles');
let outPythoFilesPath = path.join(__dirname, 'pythonFiles', 'typeFormatFiles');
const tryBlock2OutFilePath = path.join(outPythoFilesPath, 'tryBlocks2.py');
const tryBlock4OutFilePath = path.join(outPythoFilesPath, 'tryBlocks4.py');
const tryBlockTabOutFilePath = path.join(outPythoFilesPath, 'tryBlocksTab.py');
const elseBlock2OutFilePath = path.join(outPythoFilesPath, 'elseBlocks2.py');
const elseBlock4OutFilePath = path.join(outPythoFilesPath, 'elseBlocks4.py');
const elseBlockTabOutFilePath = path.join(outPythoFilesPath, 'elseBlocksTab.py');
const elseBlockFirstLine2OutFilePath = path.join(outPythoFilesPath, 'elseBlocksFirstLine2.py');
const elseBlockFirstLine4OutFilePath = path.join(outPythoFilesPath, 'elseBlocksFirstLine4.py');
const elseBlockFirstLineTabOutFilePath = path.join(outPythoFilesPath, 'elseBlocksFirstLineTab.py');
const provider = new blockFormatProvider_1.BlockFormatProviders();
function testFormatting(fileToFormat, position, expectedEdits, formatOptions) {
    let textDocument;
    return vscode.workspace.openTextDocument(fileToFormat).then(document => {
        textDocument = document;
        return vscode.window.showTextDocument(textDocument);
    }).then(editor => {
        return provider.provideOnTypeFormattingEdits(textDocument, position, ':', formatOptions, null);
    }).then(edits => {
        assert.equal(edits.length, expectedEdits.length, 'Number of edits not the same');
        edits.forEach((edit, index) => {
            const expectedEdit = expectedEdits[index];
            assert.equal(edit.newText, expectedEdit.newText, `newText for edit is not the same for index = ${index}`);
            const providedRange = `${edit.range.start.line},${edit.range.start.character},${edit.range.end.line},${edit.range.end.character}`;
            const expectedRange = `${expectedEdit.range.start.line},${expectedEdit.range.start.character},${expectedEdit.range.end.line},${expectedEdit.range.end.character}`;
            assert.ok(edit.range.isEqual(expectedEdit.range), `range for edit is not the same for index = ${index}, provided ${providedRange}, expected ${expectedRange}`);
        });
    }, reason => {
        assert.fail(reason, undefined, 'Type Formatting failed', '');
    });
}
suite('Else block with if in first line of file', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['elseBlocksFirstLine2.py', 'elseBlocksFirstLine4.py', 'elseBlocksFirstLineTab.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const TAB = '	';
    const testCases = [
        {
            title: 'else block with 2 spaces',
            line: 3, column: 7,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(3, 0, 3, 2))
            ],
            formatOptions: { insertSpaces: true, tabSize: 2 },
            filePath: elseBlockFirstLine2OutFilePath
        },
        {
            title: 'else block with 4 spaces',
            line: 3, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(3, 0, 3, 4))
            ],
            formatOptions: { insertSpaces: true, tabSize: 4 },
            filePath: elseBlockFirstLine4OutFilePath
        },
        {
            title: 'else block with Tab',
            line: 3, column: 6,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(3, 0, 3, 1)),
                vscode.TextEdit.insert(new vscode.Position(3, 0), '')
            ],
            formatOptions: { insertSpaces: false, tabSize: 4 },
            filePath: elseBlockFirstLineTabOutFilePath
        }
    ];
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(testCase.filePath, pos, testCase.expectedEdits, testCase.formatOptions).then(done, done);
        });
    });
});
suite('Try blocks with indentation of 2 spaces', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['tryBlocks2.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const testCases = [
        {
            title: 'except off by tab',
            line: 6, column: 22,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(6, 0, 6, 2))
            ]
        },
        {
            title: 'except off by one should not be formatted',
            line: 15, column: 21,
            expectedEdits: []
        },
        {
            title: 'except off by tab inside a for loop',
            line: 35, column: 13,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(35, 0, 35, 2))
            ]
        },
        {
            title: 'except off by one inside a for loop should not be formatted',
            line: 47, column: 12,
            expectedEdits: []
        },
        {
            title: 'except IOError: off by tab inside a for loop',
            line: 54, column: 19,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(54, 0, 54, 2))
            ]
        },
        {
            title: 'else: off by tab inside a for loop',
            line: 76, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(76, 0, 76, 2))
            ]
        },
        {
            title: 'except ValueError:: off by tab inside a function',
            line: 143, column: 22,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(143, 0, 143, 2))
            ]
        },
        {
            title: 'except ValueError as err: off by one inside a function should not be formatted',
            line: 157, column: 25,
            expectedEdits: []
        },
        {
            title: 'else: off by tab inside function',
            line: 172, column: 11,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(172, 0, 172, 2))
            ]
        },
        {
            title: 'finally: off by tab inside function',
            line: 195, column: 12,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(195, 0, 195, 2))
            ]
        }
    ];
    const formatOptions = {
        insertSpaces: true, tabSize: 2
    };
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(tryBlock2OutFilePath, pos, testCase.expectedEdits, formatOptions).then(done, done);
        });
    });
});
suite('Try blocks with indentation of 4 spaces', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['tryBlocks4.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const testCases = [
        {
            title: 'except off by tab',
            line: 6, column: 22,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(6, 0, 6, 4))
            ]
        },
        {
            title: 'except off by one should not be formatted',
            line: 15, column: 21,
            expectedEdits: []
        },
        {
            title: 'except off by tab inside a for loop',
            line: 35, column: 13,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(35, 0, 35, 4))
            ]
        },
        {
            title: 'except off by one inside a for loop should not be formatted',
            line: 47, column: 12,
            expectedEdits: []
        },
        {
            title: 'except IOError: off by tab inside a for loop',
            line: 54, column: 19,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(54, 0, 54, 4))
            ]
        },
        {
            title: 'else: off by tab inside a for loop',
            line: 76, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(76, 0, 76, 4))
            ]
        },
        {
            title: 'except ValueError:: off by tab inside a function',
            line: 143, column: 22,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(143, 0, 143, 4))
            ]
        },
        {
            title: 'except ValueError as err: off by one inside a function should not be formatted',
            line: 157, column: 25,
            expectedEdits: []
        },
        {
            title: 'else: off by tab inside function',
            line: 172, column: 11,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(172, 0, 172, 4))
            ]
        },
        {
            title: 'finally: off by tab inside function',
            line: 195, column: 12,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(195, 0, 195, 4))
            ]
        }
    ];
    const formatOptions = {
        insertSpaces: true, tabSize: 4
    };
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(tryBlock4OutFilePath, pos, testCase.expectedEdits, formatOptions).then(done, done);
        });
    });
});
suite('Try blocks with indentation of Tab', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['tryBlocksTab.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const TAB = '	';
    const testCases = [
        {
            title: 'except off by tab',
            line: 6, column: 22,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(6, 0, 6, 2)),
                vscode.TextEdit.insert(new vscode.Position(6, 0), TAB)
            ]
        },
        {
            title: 'except off by tab inside a for loop',
            line: 35, column: 13,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(35, 0, 35, 2)),
                vscode.TextEdit.insert(new vscode.Position(35, 0), TAB)
            ]
        },
        {
            title: 'except IOError: off by tab inside a for loop',
            line: 54, column: 19,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(54, 0, 54, 2)),
                vscode.TextEdit.insert(new vscode.Position(54, 0), TAB)
            ]
        },
        {
            title: 'else: off by tab inside a for loop',
            line: 76, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(76, 0, 76, 2)),
                vscode.TextEdit.insert(new vscode.Position(76, 0), TAB)
            ]
        },
        {
            title: 'except ValueError:: off by tab inside a function',
            line: 143, column: 22,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(143, 0, 143, 2)),
                vscode.TextEdit.insert(new vscode.Position(143, 0), TAB)
            ]
        },
        {
            title: 'else: off by tab inside function',
            line: 172, column: 11,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(172, 0, 172, 3)),
                vscode.TextEdit.insert(new vscode.Position(172, 0), TAB + TAB)
            ]
        },
        {
            title: 'finally: off by tab inside function',
            line: 195, column: 12,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(195, 0, 195, 2)),
                vscode.TextEdit.insert(new vscode.Position(195, 0), TAB)
            ]
        }
    ];
    const formatOptions = {
        insertSpaces: false, tabSize: 4
    };
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(tryBlockTabOutFilePath, pos, testCase.expectedEdits, formatOptions).then(done, done);
        });
    });
});
suite('Else blocks with indentation of 2 spaces', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['elseBlocks2.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const testCases = [
        {
            title: 'elif off by tab',
            line: 4, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(4, 0, 4, 2))
            ]
        },
        {
            title: 'elif off by tab',
            line: 7, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(7, 0, 7, 2))
            ]
        },
        {
            title: 'elif off by tab again',
            line: 21, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(21, 0, 21, 2))
            ]
        },
        {
            title: 'else off by tab',
            line: 38, column: 7,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(38, 0, 38, 2))
            ]
        },
        {
            title: 'else: off by tab inside a for loop',
            line: 47, column: 13,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(47, 0, 47, 2))
            ]
        },
        {
            title: 'else: off by tab inside a try',
            line: 57, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(57, 0, 57, 2))
            ]
        },
        {
            title: 'elif off by a tab inside a function',
            line: 66, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(66, 0, 66, 2))
            ]
        },
        {
            title: 'elif off by a tab inside a function should not format',
            line: 69, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(69, 0, 69, 2))
            ]
        },
        {
            title: 'elif off by a tab inside a function',
            line: 83, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(83, 0, 83, 2))
            ]
        },
        {
            title: 'else: off by tab inside if of a for and for in a function',
            line: 109, column: 15,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(109, 0, 109, 2))
            ]
        },
        {
            title: 'else: off by tab inside try in a function',
            line: 119, column: 11,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(119, 0, 119, 2))
            ]
        },
        {
            title: 'else: off by tab inside while in a function',
            line: 134, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(134, 0, 134, 2))
            ]
        },
        {
            title: 'elif: off by tab inside if but inline with elif',
            line: 345, column: 18,
            expectedEdits: []
        },
        {
            title: 'elif: off by tab inside if but inline with if',
            line: 359, column: 18,
            expectedEdits: []
        }
    ];
    const formatOptions = {
        insertSpaces: true, tabSize: 2
    };
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(elseBlock2OutFilePath, pos, testCase.expectedEdits, formatOptions).then(done, done);
        });
    });
});
suite('Else blocks with indentation of 4 spaces', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['elseBlocks4.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const testCases = [
        {
            title: 'elif off by tab',
            line: 4, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(4, 0, 4, 4))
            ]
        },
        {
            title: 'elif off by tab',
            line: 7, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(7, 0, 7, 4))
            ]
        },
        {
            title: 'elif off by tab again',
            line: 21, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(21, 0, 21, 4))
            ]
        },
        {
            title: 'else off by tab',
            line: 38, column: 7,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(38, 0, 38, 4))
            ]
        },
        {
            title: 'else: off by tab inside a for loop',
            line: 47, column: 13,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(47, 0, 47, 4))
            ]
        },
        {
            title: 'else: off by tab inside a try',
            line: 57, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(57, 0, 57, 4))
            ]
        },
        {
            title: 'elif off by a tab inside a function',
            line: 66, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(66, 0, 66, 4))
            ]
        },
        {
            title: 'elif off by a tab inside a function should not format',
            line: 69, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(69, 0, 69, 4))
            ]
        },
        {
            title: 'elif off by a tab inside a function',
            line: 83, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(83, 0, 83, 4))
            ]
        },
        {
            title: 'else: off by tab inside if of a for and for in a function',
            line: 109, column: 15,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(109, 0, 109, 4))
            ]
        },
        {
            title: 'else: off by tab inside try in a function',
            line: 119, column: 11,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(119, 0, 119, 4))
            ]
        },
        {
            title: 'else: off by tab inside while in a function',
            line: 134, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(134, 0, 134, 4))
            ]
        },
        {
            title: 'elif: off by tab inside if but inline with elif',
            line: 345, column: 18,
            expectedEdits: []
        }
    ];
    const formatOptions = {
        insertSpaces: true, tabSize: 2
    };
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(elseBlock4OutFilePath, pos, testCase.expectedEdits, formatOptions).then(done, done);
        });
    });
});
suite('Else blocks with indentation of Tab', () => {
    suiteSetup(done => {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        initialize_1.initialize().then(() => {
            fs.ensureDirSync(path.dirname(outPythoFilesPath));
            ['elseBlocksTab.py'].forEach(file => {
                const targetFile = path.join(outPythoFilesPath, file);
                if (fs.existsSync(targetFile)) {
                    fs.unlinkSync(targetFile);
                }
                fs.copySync(path.join(srcPythoFilesPath, file), targetFile);
            });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    const testCases = [
        {
            title: 'elif off by tab',
            line: 4, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(4, 0, 4, 1))
            ]
        },
        {
            title: 'elif off by tab',
            line: 7, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(7, 0, 7, 1))
            ]
        },
        {
            title: 'elif off by tab again',
            line: 21, column: 18,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(21, 0, 21, 1))
            ]
        },
        {
            title: 'else off by tab',
            line: 38, column: 7,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(38, 0, 38, 1))
            ]
        },
        {
            title: 'else: off by tab inside a for loop',
            line: 47, column: 13,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(47, 0, 47, 1))
            ]
        },
        {
            title: 'else: off by tab inside a try',
            line: 57, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(57, 0, 57, 1))
            ]
        },
        {
            title: 'elif off by a tab inside a function',
            line: 66, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(66, 0, 66, 1))
            ]
        },
        {
            title: 'elif off by a tab inside a function should not format',
            line: 69, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(69, 0, 69, 1))
            ]
        },
        {
            title: 'elif off by a tab inside a function',
            line: 83, column: 20,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(83, 0, 83, 1))
            ]
        },
        {
            title: 'else: off by tab inside if of a for and for in a function',
            line: 109, column: 15,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(109, 0, 109, 1))
            ]
        },
        {
            title: 'else: off by tab inside try in a function',
            line: 119, column: 11,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(119, 0, 119, 1))
            ]
        },
        {
            title: 'else: off by tab inside while in a function',
            line: 134, column: 9,
            expectedEdits: [
                vscode.TextEdit.delete(new vscode.Range(134, 0, 134, 1))
            ]
        },
        {
            title: 'elif: off by tab inside if but inline with elif',
            line: 345, column: 18,
            expectedEdits: []
        }
    ];
    const formatOptions = {
        insertSpaces: true, tabSize: 2
    };
    testCases.forEach((testCase, index) => {
        test(`${index + 1}. ${testCase.title}`, done => {
            const pos = new vscode.Position(testCase.line, testCase.column);
            testFormatting(elseBlockTabOutFilePath, pos, testCase.expectedEdits, formatOptions).then(done, done);
        });
    });
});
//# sourceMappingURL=extension.onTypeFormat.test.js.map