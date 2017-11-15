"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
// Place this right on top
const initialize_1 = require("./initialize");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const vscode = require("vscode");
const settings = require("../client/common/configSettings");
const path = require("path");
const codeHelper_1 = require("../client/jupyter/common/codeHelper");
const codeLensProvider_1 = require("../client/jupyter/editorIntegration/codeLensProvider");
let pythonSettings = settings.PythonSettings.getInstance();
let disposable = initialize_1.setPythonExecutable(pythonSettings);
const FILE_WITH_CELLS = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'jupyter', 'cells.py');
suite('Jupyter Code Helper', () => {
    suiteSetup(done => {
        initialize_1.initialize().then(() => {
            done();
        });
    });
    const codeLensProvider = new codeLensProvider_1.JupyterCodeLensProvider();
    const codeHelper = new codeHelper_1.CodeHelper(codeLensProvider);
    setup(done => {
        initialize_1.closeActiveWindows().then(() => done()).catch(() => done());
    });
    teardown(done => {
        disposable.dispose();
        initialize_1.closeActiveWindows().then(() => done()).catch(() => done());
    });
    test('Get Line (without any selection)', done => {
        let textDocument;
        vscode.workspace.openTextDocument(FILE_WITH_CELLS).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            editor.selection = new vscode.Selection(2, 0, 2, 0);
            return codeHelper.getSelectedCode().then(code => {
                assert.equal(code, textDocument.lineAt(2).text, 'Text is not the same');
            });
        }).then(done, done);
    });
    test('Get Selected Text', done => {
        let textDocument;
        vscode.workspace.openTextDocument(FILE_WITH_CELLS).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            editor.selection = new vscode.Selection(2, 7, 2, 10);
            return codeHelper.getSelectedCode().then(code => {
                assert.equal(code, textDocument.getText(editor.selection), 'Text is not the same');
            });
        }).then(done, done);
    });
    test('Get Selected Line', done => {
        let textDocument;
        vscode.workspace.openTextDocument(FILE_WITH_CELLS).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            editor.selection = new vscode.Selection(2, 0, 2, 31);
            return codeHelper.getSelectedCode().then(code => {
                assert.equal(code, textDocument.getText(editor.selection), 'Text is not the same');
                assert.equal(code, textDocument.lineAt(2).text, 'Text is not the same as the line contents');
            });
        }).then(done, done);
    });
    test('Get Selected Text (multi-line)', done => {
        let textDocument;
        vscode.workspace.openTextDocument(FILE_WITH_CELLS).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            editor.selection = new vscode.Selection(2, 0, 4, 18);
            return codeHelper.getSelectedCode().then(code => {
                assert.equal(code, textDocument.getText(editor.selection), 'Text is not the same');
            });
        }).then(done, done);
    });
    test('Get Code Block (for in)', done => {
        let textDocument;
        vscode.workspace.openTextDocument(FILE_WITH_CELLS).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            editor.selection = new vscode.Selection(16, 0, 16, 0);
            return codeHelper.getSelectedCode().then(code => {
                const end = textDocument.lineAt(18).range.end;
                const start = editor.selection.start;
                assert.equal(code, textDocument.getText(new vscode.Range(start, end)), 'Text is not the same');
            });
        }).then(done, done);
    });
    // Todo:
    // Add if blocks
    // Add parameters being broken into multiple lines
    //      e.g. x = doSomething(1,2,
    //                           4,5)
});
//# sourceMappingURL=extension.jupyter.comms.jupyter.codeHelper.test.js.map