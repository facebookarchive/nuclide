// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:max-func-body-length no-any no-require-imports no-var-requires
const chai_1 = require("chai");
const TypeMoq = require("typemoq");
const vscode_1 = require("vscode");
const types_1 = require("../../client/common/platform/types");
const jediProxyFactory_1 = require("../../client/languageServices/jediProxyFactory");
const symbolProvider_1 = require("../../client/providers/symbolProvider");
const assertArrays = require('chai-arrays');
chai_1.use(assertArrays);
suite('Symbol Provider', () => {
    let serviceContainer;
    let jediHandler;
    let jediFactory;
    let fileSystem;
    let provider;
    let uri;
    let doc;
    setup(() => {
        serviceContainer = TypeMoq.Mock.ofType();
        jediFactory = TypeMoq.Mock.ofType(jediProxyFactory_1.JediFactory);
        jediHandler = TypeMoq.Mock.ofType();
        fileSystem = TypeMoq.Mock.ofType();
        doc = TypeMoq.Mock.ofType();
        jediFactory.setup(j => j.getJediProxyHandler(TypeMoq.It.isAny()))
            .returns(() => jediHandler.object);
        serviceContainer.setup(c => c.get(types_1.IFileSystem)).returns(() => fileSystem.object);
    });
    function testDocumentation(requestId, fileName, expectedSize, token, isUntitled = false) {
        return __awaiter(this, void 0, void 0, function* () {
            fileSystem.setup(fs => fs.arePathsSame(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                .returns(() => true);
            token = token ? token : new vscode_1.CancellationTokenSource().token;
            const symbolResult = TypeMoq.Mock.ofType();
            const definitions = [
                {
                    container: '', fileName: fileName, kind: vscode_1.SymbolKind.Array,
                    range: { endColumn: 0, endLine: 0, startColumn: 0, startLine: 0 },
                    rawType: '', text: '', type: vscode_1.CompletionItemKind.Class
                }
            ];
            uri = vscode_1.Uri.file(fileName);
            doc.setup(d => d.uri).returns(() => uri);
            doc.setup(d => d.fileName).returns(() => fileName);
            doc.setup(d => d.isUntitled).returns(() => isUntitled);
            doc.setup(d => d.getText(TypeMoq.It.isAny())).returns(() => '');
            symbolResult.setup(c => c.requestId).returns(() => requestId);
            symbolResult.setup(c => c.definitions).returns(() => definitions);
            symbolResult.setup((c) => c.then).returns(() => undefined);
            jediHandler.setup(j => j.sendCommand(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                .returns(() => Promise.resolve(symbolResult.object));
            const items = yield provider.provideDocumentSymbols(doc.object, token);
            chai_1.expect(items).to.be.array();
            chai_1.expect(items).to.be.ofSize(expectedSize);
        });
    }
    test('Ensure symbols are returned', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield testDocumentation(1, __filename, 1);
    }));
    test('Ensure symbols are returned (for untitled documents)', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield testDocumentation(1, __filename, 1, undefined, true);
    }));
    test('Ensure symbols are returned with a debounce of 100ms', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield testDocumentation(1, __filename, 1);
    }));
    test('Ensure symbols are returned with a debounce of 100ms (for untitled documents)', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield testDocumentation(1, __filename, 1, undefined, true);
    }));
    test('Ensure symbols are not returned when cancelled', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        const tokenSource = new vscode_1.CancellationTokenSource();
        tokenSource.cancel();
        yield testDocumentation(1, __filename, 0, tokenSource.token);
    }));
    test('Ensure symbols are not returned when cancelled (for untitled documents)', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        const tokenSource = new vscode_1.CancellationTokenSource();
        tokenSource.cancel();
        yield testDocumentation(1, __filename, 0, tokenSource.token, true);
    }));
    test('Ensure symbols are returned only for the last request', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 100);
        yield Promise.all([
            testDocumentation(1, __filename, 0),
            testDocumentation(2, __filename, 0),
            testDocumentation(3, __filename, 1)
        ]);
    }));
    test('Ensure symbols are returned for all the requests when the doc is untitled', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 100);
        yield Promise.all([
            testDocumentation(1, __filename, 1, undefined, true),
            testDocumentation(2, __filename, 1, undefined, true),
            testDocumentation(3, __filename, 1, undefined, true)
        ]);
    }));
    test('Ensure symbols are returned for multiple documents', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield Promise.all([
            testDocumentation(1, 'file1', 1),
            testDocumentation(2, 'file2', 1)
        ]);
    }));
    test('Ensure symbols are returned for multiple untitled documents ', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield Promise.all([
            testDocumentation(1, 'file1', 1, undefined, true),
            testDocumentation(2, 'file2', 1, undefined, true)
        ]);
    }));
    test('Ensure symbols are returned for multiple documents with a debounce of 100ms', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 100);
        yield Promise.all([
            testDocumentation(1, 'file1', 1),
            testDocumentation(2, 'file2', 1)
        ]);
    }));
    test('Ensure symbols are returned for multiple untitled documents with a debounce of 100ms', () => __awaiter(this, void 0, void 0, function* () {
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 100);
        yield Promise.all([
            testDocumentation(1, 'file1', 1, undefined, true),
            testDocumentation(2, 'file2', 1, undefined, true)
        ]);
    }));
    test('Ensure IFileSystem.arePathsSame is used', () => __awaiter(this, void 0, void 0, function* () {
        doc.setup(d => d.getText())
            .returns(() => '')
            .verifiable(TypeMoq.Times.once());
        doc.setup(d => d.isDirty)
            .returns(() => true)
            .verifiable(TypeMoq.Times.once());
        doc.setup(d => d.fileName)
            .returns(() => __filename);
        const symbols = TypeMoq.Mock.ofType();
        symbols.setup((s) => s.then).returns(() => undefined);
        const definitions = [];
        for (let counter = 0; counter < 3; counter += 1) {
            const def = TypeMoq.Mock.ofType();
            def.setup(d => d.fileName).returns(() => counter.toString());
            definitions.push(def.object);
            fileSystem.setup(fs => fs.arePathsSame(TypeMoq.It.isValue(counter.toString()), TypeMoq.It.isValue(__filename)))
                .returns(() => false)
                .verifiable(TypeMoq.Times.exactly(1));
        }
        symbols.setup(s => s.definitions)
            .returns(() => definitions)
            .verifiable(TypeMoq.Times.atLeastOnce());
        jediHandler.setup(j => j.sendCommand(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
            .returns(() => Promise.resolve(symbols.object))
            .verifiable(TypeMoq.Times.once());
        provider = new symbolProvider_1.PythonSymbolProvider(serviceContainer.object, jediFactory.object, 0);
        yield provider.provideDocumentSymbols(doc.object, new vscode_1.CancellationTokenSource().token);
        doc.verifyAll();
        symbols.verifyAll();
        fileSystem.verifyAll();
        jediHandler.verifyAll();
    }));
});
//# sourceMappingURL=symbolProvider.unit.test.js.map