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
const utils_1 = require("../../client/common/utils");
const helpers_1 = require("../../client/common/helpers");
let pythonSettings = settings.PythonSettings.getInstance();
let disposable;
let autoCompPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'autocomp');
const fileOne = path.join(autoCompPath, 'one.py');
const fileImport = path.join(autoCompPath, 'imp.py');
const fileDoc = path.join(autoCompPath, 'doc.py');
const fileLambda = path.join(autoCompPath, 'lamb.py');
const fileDecorator = path.join(autoCompPath, 'deco.py');
const fileEncoding = path.join(autoCompPath, 'four.py');
const fileEncodingUsed = path.join(autoCompPath, 'five.py');
suite('Autocomplete', () => {
    const isPython3Deferred = helpers_1.createDeferred();
    const isPython3 = isPython3Deferred.promise;
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        disposable = initialize_1.setPythonExecutable(pythonSettings);
        yield initialize_1.initialize();
        let version = yield utils_1.execPythonFile(pythonSettings.pythonPath, ['--version'], __dirname, true);
        isPython3Deferred.resolve(version.indexOf('3.') >= 0);
    }));
    suiteTeardown(done => {
        initialize_1.closeActiveWindows().then(done, done);
    });
    teardown(done => {
        initialize_1.closeActiveWindows().then(done, done);
    });
    test('For "sys."', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(3, 10);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then(list => {
            assert.notEqual(list.items.filter(item => item.label === 'api_version').length, 0, 'api_version not found');
            assert.notEqual(list.items.filter(item => item.label === 'argv').length, 0, 'argv not found');
            assert.notEqual(list.items.filter(item => item.label === 'prefix').length, 0, 'prefix not found');
        }).then(done, done);
    });
    // https://github.com/DonJayamanne/pythonVSCode/issues/975
    test('For "import *"', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileImport);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(1, 4);
        const list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'fstat').length, 0, 'fstat not found');
    }));
    // https://github.com/DonJayamanne/pythonVSCode/issues/898
    test('For "f.readlines()"', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDoc);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(5, 27);
        const list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'capitalize').length, 0, 'capitalize not found (known not to work, Jedi issue)');
        assert.notEqual(list.items.filter(item => item.label === 'upper').length, 0, 'upper not found');
        assert.notEqual(list.items.filter(item => item.label === 'lower').length, 0, 'lower not found');
    }));
    // https://github.com/DonJayamanne/pythonVSCode/issues/265
    test('For "lambda"', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        const textDocument = yield vscode.workspace.openTextDocument(fileLambda);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(1, 19);
        const list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'append').length, 0, 'append not found');
        assert.notEqual(list.items.filter(item => item.label === 'clear').length, 0, 'clear not found');
        assert.notEqual(list.items.filter(item => item.label === 'count').length, 0, 'cound not found');
    }));
    // https://github.com/DonJayamanne/pythonVSCode/issues/630
    test('For "abc.decorators"', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDecorator);
        yield vscode.window.showTextDocument(textDocument);
        let position = new vscode.Position(3, 9);
        let list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'ABCMeta').length, 0, 'ABCMeta not found');
        assert.notEqual(list.items.filter(item => item.label === 'abstractmethod').length, 0, 'abstractmethod not found');
        position = new vscode.Position(4, 9);
        list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'ABCMeta').length, 0, 'ABCMeta not found');
        assert.notEqual(list.items.filter(item => item.label === 'abstractmethod').length, 0, 'abstractmethod not found');
        position = new vscode.Position(2, 30);
        list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'ABCMeta').length, 0, 'ABCMeta not found');
        assert.notEqual(list.items.filter(item => item.label === 'abstractmethod').length, 0, 'abstractmethod not found');
    }));
    // https://github.com/DonJayamanne/pythonVSCode/issues/727
    // https://github.com/DonJayamanne/pythonVSCode/issues/746
    // https://github.com/davidhalter/jedi/issues/859
    test('For "time.slee"', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDoc);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(10, 9);
        const list = yield vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        assert.notEqual(list.items.filter(item => item.label === 'sleep').length, 0, 'sleep not found');
        assert.notEqual(list.items.filter(item => item.documentation.startsWith("Delay execution for a given number of seconds.  The argument may be")).length, 0, 'Documentation incorrect');
    }));
    test('For custom class', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(30, 4);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then(list => {
            assert.notEqual(list.items.filter(item => item.label === 'method1').length, 0, 'method1 not found');
            assert.notEqual(list.items.filter(item => item.label === 'method2').length, 0, 'method2 not found');
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
            const position = new vscode.Position(25, 4);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then(list => {
            assert.equal(list.items.filter(item => item.label === 'bar').length, 1, 'bar not found');
            const documentation = `说明 - keep this line, it works${os_1.EOL}delete following line, it works${os_1.EOL}如果存在需要等待审批或正在执行的任务，将不刷新页面`;
            assert.equal(list.items.filter(item => item.label === 'bar')[0].documentation, documentation, 'unicode documentation is incorrect');
        }).then(done, done);
    });
    test('Across files With Unicode Characters', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileEncodingUsed).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 5);
            return vscode.commands.executeCommand('vscode.executeCompletionItemProvider', textDocument.uri, position);
        }).then(list => {
            assert.equal(list.items.filter(item => item.label === 'Foo').length, 1, 'Foo not found');
            assert.equal(list.items.filter(item => item.label === 'Foo')[0].documentation, '说明', 'Foo unicode documentation is incorrect');
            assert.equal(list.items.filter(item => item.label === 'showMessage').length, 1, 'showMessage not found');
            const documentation = `Кюм ут жэмпэр пошжим льаборэж, коммюны янтэрэсщэт нам ед, декта игнота ныморэ жят эи. ${os_1.EOL}Шэа декам экшырки эи, эи зыд эррэм докэндё, векж факэтэ пэрчыквюэрёж ку.`;
            assert.equal(list.items.filter(item => item.label === 'showMessage')[0].documentation, documentation, 'showMessage unicode documentation is incorrect');
        }).then(done, done);
    });
});
//# sourceMappingURL=base.test.js.map