"use strict";
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// Place this right on top
const initialize_1 = require("../initialize");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const os_1 = require("os");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const path = require("path");
const settings = require("../../client/common/configSettings");
const pythonSettings = settings.PythonSettings.getInstance();
const autoCompPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'autocomp');
const hoverPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'hover');
const fileOne = path.join(autoCompPath, 'one.py');
const fileThree = path.join(autoCompPath, 'three.py');
const fileEncoding = path.join(autoCompPath, 'four.py');
const fileEncodingUsed = path.join(autoCompPath, 'five.py');
const fileHover = path.join(autoCompPath, 'hoverTest.py');
const fileStringFormat = path.join(hoverPath, 'stringFormat.py');
suite('Hover Definition', () => {
    suiteSetup(done => {
        initialize_1.initialize().then(() => {
            pythonSettings.pythonPath = initialize_1.PYTHON_PATH;
            done();
        }, done);
    });
    suiteTeardown(done => {
        initialize_1.closeActiveWindows().then(done, done);
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(done, done);
    });
    test('Method', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(30, 5);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '30,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '30,11', 'End position is incorrect');
            assert.equal(def[0].contents.length, 1, 'Invalid content items');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL + 'def method1()' + os_1.EOL + '```' + os_1.EOL + 'This is method1', 'function signature incorrect');
        }).then(done, done);
    });
    test('Across files', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileThree).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 12);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '1,9', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,12', 'End position is incorrect');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL + 'def fun()' + os_1.EOL + '```' + os_1.EOL + 'This is fun', 'Invalid conents');
        }).then(done, done);
    });
    test('With Unicode Characters', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileEncoding).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(25, 6);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '25,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '25,7', 'End position is incorrect');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL + 'def bar()' + os_1.EOL + '```' + os_1.EOL +
                '说明 - keep this line, it works' + os_1.EOL + 'delete following line, it works' +
                os_1.EOL + '如果存在需要等待审批或正在执行的任务，将不刷新页面', 'Invalid conents');
        }).then(done, done);
    });
    test('Across files with Unicode Characters', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileEncodingUsed).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 11);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '1,5', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,16', 'End position is incorrect');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL +
                'def showMessage()' + os_1.EOL +
                '```' + os_1.EOL +
                'Кюм ут жэмпэр пошжим льаборэж, коммюны янтэрэсщэт нам ед, декта игнота ныморэ жят эи. ' + os_1.EOL +
                'Шэа декам экшырки эи, эи зыд эррэм докэндё, векж факэтэ пэрчыквюэрёж ку.', 'Invalid conents');
        }).then(done, done);
    });
    test('Nothing for keywords (class)', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(5, 1);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 0, 'Definition length is incorrect');
        }).then(done, done);
    });
    test('Nothing for keywords (for)', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(3, 1);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 0, 'Definition length is incorrect');
        }).then(done, done);
    });
    test('Highlighting Class', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(11, 15);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '11,12', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '11,18', 'End position is incorrect');
            let documentation = "```python" + os_1.EOL +
                "class Random(x=None)" + os_1.EOL +
                "```" + os_1.EOL +
                "Random number generator base class used by bound module functions." + os_1.EOL +
                "" + os_1.EOL +
                "Used to instantiate instances of Random to get generators that don't" + os_1.EOL +
                "share state." + os_1.EOL +
                "" + os_1.EOL +
                "Class Random can also be subclassed if you want to use a different basic" + os_1.EOL +
                "generator of your own devising: in that case, override the following" + os_1.EOL + os_1.EOL +
                "`methods` random(), seed(), getstate(), and setstate()." + os_1.EOL + os_1.EOL +
                "Optionally, implement a getrandbits() method so that randrange()" + os_1.EOL +
                "can cover arbitrarily large ranges.";
            assert.equal(def[0].contents[0], documentation, 'Invalid conents');
        }).then(done, done);
    });
    test('Highlight Method', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(12, 10);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '12,5', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '12,12', 'End position is incorrect');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL +
                'def randint(a, b)' + os_1.EOL +
                '```' + os_1.EOL +
                'Return random integer in range [a, b], including both end points.', 'Invalid conents');
        }).then(done, done);
    });
    test('Highlight Function', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(8, 14);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '8,11', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '8,15', 'End position is incorrect');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL +
                'def acos(x)' + os_1.EOL +
                '```' + os_1.EOL +
                'Return the arc cosine (measured in radians) of x.', 'Invalid conents');
        }).then(done, done);
    });
    test('Highlight Multiline Method Signature', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(14, 14);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '14,9', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '14,15', 'End position is incorrect');
            assert.equal(def[0].contents[0], '```python' + os_1.EOL +
                'class Thread(group=None, target=None, name=None, args=(), kwargs=None, verbose=None)' + os_1.EOL +
                '```' + os_1.EOL +
                'Thread(self, group=None, target=None, name=None,' + os_1.EOL +
                'args=(), kwargs=None, verbose=None)' + os_1.EOL +
                '' + os_1.EOL +
                'A class that represents a thread of control.' + os_1.EOL +
                '' + os_1.EOL +
                'This class can be safely subclassed in a limited fashion.', 'Invalid content items');
        }).then(done, done);
    });
    test('Variable', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileHover).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(6, 2);
            return vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(def[0].contents.length, 1, 'Only expected one result');
            if (def[0].contents[0].toString().indexOf("```python") === -1) {
                assert.fail(def[0].contents[0].toString(), "", "First line is incorrect", "compare");
            }
            if (def[0].contents[0].toString().indexOf("Random number generator base class used by bound module functions.") === -1) {
                assert.fail(def[0].contents[0].toString(), "", "'Random number generator' message missing", "compare");
            }
            if (def[0].contents[0].toString().indexOf("Class Random can also be subclassed if you want to use a different basic") === -1) {
                assert.fail(def[0].contents[0].toString(), "", "'Class Random message' missing", "compare");
            }
        }).then(done, done);
    });
    test('format().capitalize()', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileStringFormat);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(5, 41);
        const def = yield vscode.commands.executeCommand('vscode.executeHoverProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect');
        assert.equal(def[0].contents.length, 1, 'Only expected one result');
        if (def[0].contents[0].toString().indexOf("def capitalize") === -1) {
            assert.fail(def[0].contents[0].toString(), "", "'def capitalize' is missing", "compare");
        }
        if (def[0].contents[0].toString().indexOf("Return a capitalized version of S") === -1 &&
            def[0].contents[0].toString().indexOf("Return a copy of the string S with only its first character") === -1) {
            assert.fail(def[0].contents[0].toString(), "", "'Return a capitalized version of S/Return a copy of the string S with only its first character' message missing", "compare");
        }
    }));
});
//# sourceMappingURL=hover.test.js.map