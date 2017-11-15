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
const autoPep8Formatter_1 = require("../client/formatters/autoPep8Formatter");
const yapfFormatter_1 = require("../client/formatters/yapfFormatter");
const path = require("path");
const settings = require("../client/common/configSettings");
const fs = require("fs-extra");
const utils_1 = require("../client/common/utils");
let pythonSettings = settings.PythonSettings.getInstance();
let disposable = initialize_1.setPythonExecutable(pythonSettings);
let ch = vscode.window.createOutputChannel('Tests');
let pythoFilesPath = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'formatting');
const originalUnformattedFile = path.join(pythoFilesPath, 'fileToFormat.py');
const autoPep8FileToFormat = path.join(__dirname, 'pythonFiles', 'formatting', 'autoPep8FileToFormat.py');
const autoPep8FileToAutoFormat = path.join(__dirname, 'pythonFiles', 'formatting', 'autoPep8FileToAutoFormat.py');
const yapfFileToFormat = path.join(__dirname, 'pythonFiles', 'formatting', 'yapfFileToFormat.py');
const yapfFileToAutoFormat = path.join(__dirname, 'pythonFiles', 'formatting', 'yapfFileToAutoFormat.py');
let formattedYapf = '';
let formattedAutoPep8 = '';
suite('Formatting', () => {
    suiteSetup(done => {
        initialize_1.initialize().then(() => {
            [autoPep8FileToFormat, autoPep8FileToAutoFormat, yapfFileToFormat, yapfFileToAutoFormat].forEach(file => {
                if (fs.existsSync(file)) {
                    fs.unlinkSync(file);
                }
                fs.copySync(originalUnformattedFile, file);
            });
            fs.ensureDirSync(path.dirname(autoPep8FileToFormat));
            let yapf = utils_1.execPythonFile('yapf', [originalUnformattedFile], pythoFilesPath, false);
            let autoPep8 = utils_1.execPythonFile('autopep8', [originalUnformattedFile], pythoFilesPath, false);
            return Promise.all([yapf, autoPep8]).then(formattedResults => {
                formattedYapf = formattedResults[0];
                formattedAutoPep8 = formattedResults[1];
            }).then(() => { });
        }).then(done).catch(done);
    });
    suiteTeardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    function testFormatting(formatter, formattedContents, fileToFormat) {
        let textEditor;
        let textDocument;
        return vscode.workspace.openTextDocument(fileToFormat).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            return formatter.formatDocument(textDocument, null, null);
        }).then(edits => {
            return textEditor.edit(editBuilder => {
                edits.forEach(edit => editBuilder.replace(edit.range, edit.newText));
            });
        }).then(edited => {
            assert.equal(textEditor.document.getText(), formattedContents, 'Formatted text is not the same');
        }, reason => {
            assert.fail(reason, undefined, 'Formatting failed', '');
        });
    }
    test('AutoPep8', done => {
        testFormatting(new autoPep8Formatter_1.AutoPep8Formatter(ch, pythonSettings, pythoFilesPath), formattedAutoPep8, autoPep8FileToFormat).then(done, done);
    });
    test('Yapf', done => {
        testFormatting(new yapfFormatter_1.YapfFormatter(ch, pythonSettings, pythoFilesPath), formattedYapf, yapfFileToFormat).then(done, done);
    });
    function testAutoFormatting(formatter, formattedContents, fileToFormat) {
        let textDocument;
        pythonSettings.formatting.formatOnSave = true;
        pythonSettings.formatting.provider = formatter;
        return vscode.workspace.openTextDocument(fileToFormat).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            return editor.edit(editBuilder => {
                editBuilder.insert(new vscode.Position(0, 0), '#\n');
            });
        }).then(edited => {
            return textDocument.save();
        }).then(saved => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve();
                }, 5000);
            });
        }).then(() => {
            assert.equal(textDocument.getText(), formattedContents, 'Formatted contents are not the same');
        });
    }
    test('AutoPep8 autoformat on save', done => {
        testAutoFormatting('autopep8', '#\n' + formattedAutoPep8, autoPep8FileToAutoFormat).then(done, done);
    });
    // For some reason doesn't ever work on travis
    if (!initialize_1.IS_TRAVIS) {
        test('Yapf autoformat on save', done => {
            testAutoFormatting('yapf', '#\n' + formattedYapf, yapfFileToAutoFormat).then(done, done);
        });
    }
});
//# sourceMappingURL=extension.format.test.js.map