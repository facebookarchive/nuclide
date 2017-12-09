"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const sinon = require("sinon");
const vscode = require("vscode");
const path = require("path");
const autoImportProvider_1 = require("./../client/providers/autoImportProvider");
let testPath = path.join(__dirname, '../../src/test');
const fileOne = path.join(testPath, 'pythonFiles/autoimport/one.py');
const fileThree = path.join(testPath, 'pythonFiles/autoimport/two/three.py');
let fileOneLoc = new vscode.Location(vscode.Uri.file(fileOne), new vscode.Position(0, 0));
let fileThreeLoc = new vscode.Location(vscode.Uri.file(fileThree), new vscode.Position(0, 0));
suite('Autoimport', () => {
    let autoimp = new autoImportProvider_1.AutoImportProvider();
    let lookupSymbol = sinon.stub(autoimp, 'lookupSymbol');
    let showChoices = sinon.stub(autoimp, 'showChoices');
    suiteSetup(() => {
    });
    setup(() => {
        lookupSymbol.reset();
        showChoices.reset();
        return vscode.workspace.openTextDocument(fileOne).then(vscode.window.showTextDocument);
    });
    test('choices are filtered and displayed"', done => {
        lookupSymbol.resolves([
            new vscode.SymbolInformation('TestClass', vscode.SymbolKind.Class, '', fileOneLoc),
            new vscode.SymbolInformation('TestClassTwo', vscode.SymbolKind.Class, '', fileOneLoc),
            new vscode.SymbolInformation('TestClass', vscode.SymbolKind.Namespace, '', fileOneLoc),
        ]);
        showChoices.resolves(undefined);
        autoimp.autoImport('TestClass').then(function () {
            assert(lookupSymbol.calledWith('TestClass'));
            assert(showChoices.calledWith(['from one import TestClass']));
            done();
        });
    });
    test('module under a package"', done => {
        lookupSymbol.resolves([
            new vscode.SymbolInformation('TestClass', vscode.SymbolKind.Class, '', fileThreeLoc),
        ]);
        showChoices.resolves(undefined);
        autoimp.autoImport('TestClass').then(function () {
            assert(showChoices.calledWith(['from two.three import TestClass']));
            done();
        });
    });
    test('selection is added at line one', done => {
        lookupSymbol.resolves([
            new vscode.SymbolInformation('TestClass', vscode.SymbolKind.Class, '', fileOneLoc),
        ]);
        showChoices.resolves('from one import TestClass');
        autoimp.autoImport('TestClass').then(function () {
            let line0 = vscode.window.activeTextEditor.document.lineAt(0);
            assert.equal(line0.text, 'from one import TestClass');
            done();
        });
    });
});
//# sourceMappingURL=extension.autoimport.test.js.map