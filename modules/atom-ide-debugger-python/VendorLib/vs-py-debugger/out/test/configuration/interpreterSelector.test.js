"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const inversify_1 = require("inversify");
const TypeMoq = require("typemoq");
const types_1 = require("../../client/common/application/types");
const types_2 = require("../../client/common/platform/types");
const interpreterSelector_1 = require("../../client/interpreter/configuration/interpreterSelector");
const contracts_1 = require("../../client/interpreter/contracts");
const container_1 = require("../../client/ioc/container");
const serviceManager_1 = require("../../client/ioc/serviceManager");
const info = {
    architecture: types_2.Architecture.Unknown,
    companyDisplayName: '',
    displayName: '',
    envName: '',
    path: '',
    type: contracts_1.InterpreterType.Unknown,
    version: '',
    version_info: [0, 0, 0, 'alpha'],
    sysPrefix: '',
    sysVersion: ''
};
class InterpreterQuickPickItem {
    constructor(l, p) {
        this.path = p;
        this.label = l;
    }
}
// tslint:disable-next-line:max-func-body-length
suite('Interpreters - selector', () => {
    let serviceContainer;
    let workspace;
    let appShell;
    let interpreterService;
    let documentManager;
    let fileSystem;
    setup(() => {
        const cont = new inversify_1.Container();
        const serviceManager = new serviceManager_1.ServiceManager(cont);
        serviceContainer = new container_1.ServiceContainer(cont);
        workspace = TypeMoq.Mock.ofType();
        serviceManager.addSingletonInstance(types_1.IWorkspaceService, workspace.object);
        appShell = TypeMoq.Mock.ofType();
        serviceManager.addSingletonInstance(types_1.IApplicationShell, appShell.object);
        interpreterService = TypeMoq.Mock.ofType();
        serviceManager.addSingletonInstance(contracts_1.IInterpreterService, interpreterService.object);
        documentManager = TypeMoq.Mock.ofType();
        serviceManager.addSingletonInstance(types_1.IDocumentManager, documentManager.object);
        fileSystem = TypeMoq.Mock.ofType();
        fileSystem
            .setup(x => x.arePathsSame(TypeMoq.It.isAnyString(), TypeMoq.It.isAnyString()))
            .returns((a, b) => a === b);
        fileSystem
            .setup(x => x.getRealPath(TypeMoq.It.isAnyString()))
            .returns((a) => new Promise(resolve => resolve(a)));
        serviceManager.addSingletonInstance(types_2.IFileSystem, fileSystem.object);
        const commandManager = TypeMoq.Mock.ofType();
        serviceManager.addSingletonInstance(types_1.ICommandManager, commandManager.object);
    });
    test('Suggestions', () => __awaiter(this, void 0, void 0, function* () {
        const initial = [
            { displayName: '1', path: 'c:/path1/path1', type: contracts_1.InterpreterType.Unknown },
            { displayName: '2', path: 'c:/path1/path1', type: contracts_1.InterpreterType.Unknown },
            { displayName: '1', path: 'c:/path1/path1', type: contracts_1.InterpreterType.Unknown },
            { displayName: '2', path: 'c:/path2/path2', type: contracts_1.InterpreterType.Unknown },
            { displayName: '2', path: 'c:/path2/path2', type: contracts_1.InterpreterType.Unknown },
            { displayName: '2 (virtualenv)', path: 'c:/path2/path2', type: contracts_1.InterpreterType.VirtualEnv },
            { displayName: '3', path: 'c:/path2/path2', type: contracts_1.InterpreterType.Unknown },
            { displayName: '4', path: 'c:/path4/path4', type: contracts_1.InterpreterType.Conda }
        ].map(item => { return Object.assign({}, info, item); });
        interpreterService
            .setup(x => x.getInterpreters(TypeMoq.It.isAny()))
            .returns(() => new Promise((resolve) => resolve(initial)));
        const selector = new interpreterSelector_1.InterpreterSelector(serviceContainer);
        const actual = yield selector.getSuggestions();
        const expected = [
            new InterpreterQuickPickItem('1', 'c:/path1/path1'),
            new InterpreterQuickPickItem('2', 'c:/path1/path1'),
            new InterpreterQuickPickItem('2', 'c:/path2/path2'),
            new InterpreterQuickPickItem('2 (virtualenv)', 'c:/path2/path2'),
            new InterpreterQuickPickItem('3', 'c:/path2/path2'),
            new InterpreterQuickPickItem('4', 'c:/path4/path4')
        ];
        assert.equal(actual.length, expected.length, 'Suggestion lengths are different.');
        for (let i = 0; i < expected.length; i += 1) {
            assert.equal(actual[i].label, expected[i].label, `Suggestion label is different at ${i}: exected '${expected[i].label}', found '${actual[i].label}'.`);
            assert.equal(actual[i].path, expected[i].path, `Suggestion path is different at ${i}: exected '${expected[i].path}', found '${actual[i].path}'.`);
        }
    }));
});
//# sourceMappingURL=interpreterSelector.test.js.map