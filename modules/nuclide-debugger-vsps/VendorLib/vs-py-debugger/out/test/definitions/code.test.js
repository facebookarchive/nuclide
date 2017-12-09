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
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const path = require("path");
const settings = require("../../client/common/configSettings");
const utils_1 = require("../../client/common/utils");
const helpers_1 = require("../../client/common/helpers");
let pythonSettings = settings.PythonSettings.getInstance();
let disposable;
let autoCompPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'definition');
const fileOne = path.join(autoCompPath, 'one.py');
const fileTwo = path.join(autoCompPath, 'two.py');
const fileThree = path.join(autoCompPath, 'three.py');
const fileDecorator = path.join(autoCompPath, 'decorators.py');
const fileAwait = path.join(autoCompPath, 'await.test.py');
const fileEncoding = path.join(autoCompPath, 'four.py');
const fileEncodingUsed = path.join(autoCompPath, 'five.py');
suite('Code Definition', () => {
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
    test('Go to method', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(30, 5);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(def[0].uri.fsPath, fileOne, 'Incorrect file');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '17,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '21,11', 'End position is incorrect');
        }).then(done, done);
    });
    test('Go to function', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileOne).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(45, 5);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(def[0].uri.fsPath, fileOne, 'Incorrect file');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '32,0', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '33,21', 'End position is incorrect');
        }).then(done, done);
    });
    test('Go to function with decorator', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDecorator);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(7, 2);
        const def = yield vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect');
        assert.equal(def[0].uri.fsPath, fileDecorator, 'Incorrect file');
        assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '4,0', 'Start position is incorrect');
        assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '5,22', 'End position is incorrect');
    }));
    test('Go to function with decorator (jit)', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDecorator);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(27, 2);
        const def = yield vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect');
        assert.equal(def[0].uri.fsPath, fileDecorator, 'Incorrect file');
        assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '19,0', 'Start position is incorrect');
        assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '26,42', 'End position is incorrect');
    }));
    test('Go to function with decorator (fabric)', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDecorator);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(13, 2);
        const def = yield vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect');
        if (!def[0].uri.fsPath.endsWith('operations.py')) {
            assert.fail(def[0].uri.fsPath, 'operations.py', 'Source of sudo is incorrect', 'file source');
        }
        assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '1094,0', 'Start position is incorrect (3rd part operations.py could have changed)');
        assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1148,4', 'End position is incorrect (3rd part operations.py could have changed)');
    }));
    test('Go to function decorator', () => __awaiter(this, void 0, void 0, function* () {
        const textDocument = yield vscode.workspace.openTextDocument(fileDecorator);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(3, 3);
        const def = yield vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect');
        assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '0,0', 'Start position is incorrect');
        assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,12', 'End position is incorrect');
    }));
    test('Go to async method', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        const textDocument = yield vscode.workspace.openTextDocument(fileAwait);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(10, 22);
        const def = yield vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect (currently not working)');
        assert.equal(def[0].uri.fsPath, fileAwait, 'Wrong file (currently not working)');
        assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '6,10', 'Start position is incorrect (currently not working)');
        assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,12', 'End position is incorrect (currently not working)');
    }));
    test('Go to async function', () => __awaiter(this, void 0, void 0, function* () {
        if (!(yield isPython3)) {
            return;
        }
        const textDocument = yield vscode.workspace.openTextDocument(fileAwait);
        yield vscode.window.showTextDocument(textDocument);
        const position = new vscode.Position(18, 12);
        const def = yield vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        assert.equal(def.length, 1, 'Definition length is incorrect (currently not working)');
        assert.equal(def[0].uri.fsPath, fileAwait, 'Wrong file (currently not working)');
        assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '6,10', 'Start position is incorrect (currently not working)');
        assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '1,12', 'End position is incorrect (currently not working)');
    }));
    test('Across files', done => {
        let textEditor;
        let textDocument;
        vscode.workspace.openTextDocument(fileThree).then(document => {
            textDocument = document;
            return vscode.window.showTextDocument(textDocument);
        }).then(editor => {
            assert(vscode.window.activeTextEditor, 'No active editor');
            textEditor = editor;
            const position = new vscode.Position(1, 5);
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '0,0', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '5,11', 'End position is incorrect');
            assert.equal(def[0].uri.fsPath, fileTwo, 'File is incorrect');
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
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '10,4', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '16,35', 'End position is incorrect');
            assert.equal(def[0].uri.fsPath, fileEncoding, 'File is incorrect');
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
            return vscode.commands.executeCommand('vscode.executeDefinitionProvider', textDocument.uri, position);
        }).then(def => {
            assert.equal(def.length, 1, 'Definition length is incorrect');
            assert.equal(`${def[0].range.start.line},${def[0].range.start.character}`, '18,0', 'Start position is incorrect');
            assert.equal(`${def[0].range.end.line},${def[0].range.end.character}`, '23,16', 'End position is incorrect');
            assert.equal(def[0].uri.fsPath, fileEncoding, 'File is incorrect');
        }).then(done, done);
    });
});
//# sourceMappingURL=code.test.js.map