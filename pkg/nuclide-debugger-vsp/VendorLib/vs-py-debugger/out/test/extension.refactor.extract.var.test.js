"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Place this right on top
const initialize_1 = require("./initialize");
/// <reference path="../../node_modules/@types/mocha/index.d.ts" />
const assert = require("assert");
// You can import and use all API from the \'vscode\' module
// as well as import your extension to test it
const vscode = require("vscode");
const path = require("path");
const settings = require("../client/common/configSettings");
const fs = require("fs-extra");
const simpleRefactorProvider_1 = require("../client/providers/simpleRefactorProvider");
const proxy_1 = require("../client/refactor/proxy");
const editor_1 = require("../client/common/editor");
const mockClasses_1 = require("./mockClasses");
let EXTENSION_DIR = path.join(__dirname, '..', '..');
let pythonSettings = settings.PythonSettings.getInstance();
const disposable = initialize_1.setPythonExecutable(pythonSettings);
const refactorSourceFile = path.join(__dirname, '..', '..', 'src', 'test', 'pythonFiles', 'refactoring', 'standAlone', 'refactor.py');
const refactorTargetFile = path.join(__dirname, '..', '..', 'out', 'test', 'pythonFiles', 'refactoring', 'standAlone', 'refactor.py');
class MockTextDocument {
    constructor(sourceFile) {
        this.sourceFile = sourceFile;
        this.lineCount = fs.readFileSync(this.sourceFile, 'utf8').split(/\r?\n/g).length;
        this.offsets = [
            { position: new vscode.Position(234, 20), offset: 8191 },
            { position: new vscode.Position(234, 29), offset: 8200 },
            { position: new vscode.Position(234, 38), offset: 8209 }
        ];
    }
    save() {
        return Promise.resolve(true);
    }
    lineAt(position) {
        let lineNumber = position;
        if (position.line) {
            lineNumber = position.line;
        }
        let line = fs.readFileSync(this.sourceFile, 'utf8').split(/\r?\n/g)[lineNumber];
        return { isEmptyOrWhitespace: line.trim().length > 0 };
    }
    offsetAt(position) {
        return this.offsets.filter(item => item.position.isEqual(position))[0].offset;
    }
    positionAt(offset) {
        return null;
    }
    getText(range) {
        return fs.readFileSync(this.sourceFile, 'utf8');
    }
    getWordRangeAtPosition(position) {
        return null;
    }
    validateRange(range) {
        return null;
    }
    validatePosition(position) {
        return null;
    }
}
suite('Variable Extraction', () => {
    // Hack hac hack
    const oldExecuteCommand = vscode.commands.executeCommand;
    const options = { cursorStyle: vscode.TextEditorCursorStyle.Line, insertSpaces: true, lineNumbers: vscode.TextEditorLineNumbersStyle.Off, tabSize: 4 };
    suiteSetup(done => {
        fs.copySync(refactorSourceFile, refactorTargetFile, { clobber: true });
        initialize_1.initialize().then(() => done(), () => done());
    });
    suiteTeardown(done => {
        disposable.dispose();
        vscode.commands.executeCommand = oldExecuteCommand;
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    setup(done => {
        if (fs.existsSync(refactorTargetFile)) {
            fs.unlinkSync(refactorTargetFile);
        }
        fs.copySync(refactorSourceFile, refactorTargetFile, { clobber: true });
        initialize_1.closeActiveWindows().then(() => {
            vscode.commands.executeCommand = (cmd) => Promise.resolve();
            done();
        }).catch(done);
    });
    teardown(done => {
        vscode.commands.executeCommand = oldExecuteCommand;
        initialize_1.closeActiveWindows().then(() => done(), () => done());
    });
    function testingVariableExtraction(shouldError, pythonSettings, startPos, endPos) {
        let rangeOfTextToExtract = new vscode.Range(startPos, endPos);
        let proxy = new proxy_1.RefactorProxy(EXTENSION_DIR, pythonSettings, path.dirname(refactorTargetFile));
        let mockTextDoc = new MockTextDocument(refactorTargetFile);
        let ignoreErrorHandling = false;
        const DIFF = '--- a/refactor.py\n+++ b/refactor.py\n@@ -232,7 +232,8 @@\n         sys.stdout.flush()\n \n     def watch(self):\n-        self._write_response("STARTED")\n+        myNewVariable = "STARTED"\n+        self._write_response(myNewVariable)\n         while True:\n             try:\n                 self._process_request(self._input.readline())\n';
        let expectedTextEdits = editor_1.getTextEditsFromPatch(mockTextDoc.getText(), DIFF);
        return proxy.extractVariable(mockTextDoc, 'myNewVariable', refactorTargetFile, rangeOfTextToExtract, options)
            .then(response => {
            if (shouldError) {
                ignoreErrorHandling = true;
                assert.fail(null, null, 'Extraction should fail with an error', '');
            }
            let textEdits = editor_1.getTextEditsFromPatch(mockTextDoc.getText(), DIFF);
            assert.equal(response.results.length, 1, 'Invalid number of items in response');
            assert.equal(textEdits.length, expectedTextEdits.length, 'Invalid number of Text Edits');
            textEdits.forEach(edit => {
                let foundEdit = expectedTextEdits.filter(item => item.newText === edit.newText && item.range.isEqual(edit.range));
                assert.equal(foundEdit.length, 1, 'Edit not found');
            });
        }).catch(error => {
            if (ignoreErrorHandling) {
                return Promise.reject(error);
            }
            if (shouldError) {
                // Wait a minute this shouldn't work, what's going on
                assert.equal(true, true, 'Error raised as expected');
                return;
            }
            return Promise.reject(error);
        });
    }
    test('Extract Variable', done => {
        let startPos = new vscode.Position(234, 29);
        let endPos = new vscode.Position(234, 38);
        testingVariableExtraction(false, pythonSettings, startPos, endPos).then(() => done(), done);
    });
    test('Extract Variable fails if whole string not selected', done => {
        let startPos = new vscode.Position(234, 20);
        let endPos = new vscode.Position(234, 38);
        testingVariableExtraction(true, pythonSettings, startPos, endPos).then(() => done(), done);
    });
    function testingVariableExtractionEndToEnd(shouldError, pythonSettings, startPos, endPos) {
        let ch = new mockClasses_1.MockOutputChannel('Python');
        let textDocument;
        let textEditor;
        let rangeOfTextToExtract = new vscode.Range(startPos, endPos);
        let ignoreErrorHandling = false;
        return vscode.workspace.openTextDocument(refactorTargetFile).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            editor.selections = [new vscode.Selection(rangeOfTextToExtract.start, rangeOfTextToExtract.end)];
            editor.selection = new vscode.Selection(rangeOfTextToExtract.start, rangeOfTextToExtract.end);
            textEditor = editor;
            return;
        }).then(() => {
            return simpleRefactorProvider_1.extractVariable(EXTENSION_DIR, textEditor, rangeOfTextToExtract, ch, path.dirname(refactorTargetFile), pythonSettings).then(() => {
                if (shouldError) {
                    ignoreErrorHandling = true;
                    assert.fail('No error', 'Error', 'Extraction should fail with an error', '');
                }
                return textEditor.document.save();
            }).then(() => {
                assert.equal(ch.output.length, 0, 'Output channel is not empty');
                assert.equal(textDocument.lineAt(234).text.trim().indexOf('newvariable'), 0, 'New Variable not created');
                assert.equal(textDocument.lineAt(234).text.trim().endsWith('= "STARTED"'), true, 'Started Text Assigned to variable');
                assert.equal(textDocument.lineAt(235).text.indexOf('(newvariable') >= 0, true, 'New Variable not being used');
            }).catch(error => {
                if (ignoreErrorHandling) {
                    return Promise.reject(error);
                }
                if (shouldError) {
                    // Wait a minute this shouldn't work, what's going on
                    assert.equal(true, true, 'Error raised as expected');
                    return;
                }
                return Promise.reject(error);
            });
        }, error => {
            if (ignoreErrorHandling) {
                return Promise.reject(error);
            }
            if (shouldError) {
                // Wait a minute this shouldn't work, what's going on
                assert.equal(true, true, 'Error raised as expected');
            }
            else {
                assert.fail(error + '', null, 'Variable extraction failed\n' + ch.output, '');
                return Promise.reject(error);
            }
        });
    }
    // This test fails on linux (text document not getting updated in time)
    if (!initialize_1.IS_TRAVIS) {
        test('Extract Variable (end to end)', done => {
            let startPos = new vscode.Position(234, 29);
            let endPos = new vscode.Position(234, 38);
            testingVariableExtractionEndToEnd(false, pythonSettings, startPos, endPos).then(() => done(), done);
        });
    }
    test('Extract Variable fails if whole string not selected (end to end)', done => {
        let startPos = new vscode.Position(234, 20);
        let endPos = new vscode.Position(234, 38);
        testingVariableExtractionEndToEnd(true, pythonSettings, startPos, endPos).then(() => done(), done);
    });
});
//# sourceMappingURL=extension.refactor.extract.var.test.js.map