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
const chai_1 = require("chai");
const events_1 = require("events");
const inversify_1 = require("inversify");
const path = require("path");
const TypeMoq = require("typemoq");
const vscode_1 = require("vscode");
const types_1 = require("../../client/common/application/types");
const core_utils_1 = require("../../client/common/core.utils");
const types_2 = require("../../client/common/platform/types");
const types_3 = require("../../client/common/types");
const types_4 = require("../../client/interpreter/configuration/types");
const contracts_1 = require("../../client/interpreter/contracts");
const interpreterService_1 = require("../../client/interpreter/interpreterService");
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
// tslint:disable-next-line:max-func-body-length
suite('Interpreters service', () => {
    let serviceManager;
    let serviceContainer;
    let updater;
    let helper;
    let locator;
    let workspace;
    let config;
    let pipenvLocator;
    let wksLocator;
    let fileSystem;
    let interpreterDisplay;
    setup(() => __awaiter(this, void 0, void 0, function* () {
        const cont = new inversify_1.Container();
        serviceManager = new serviceManager_1.ServiceManager(cont);
        serviceContainer = new container_1.ServiceContainer(cont);
        updater = TypeMoq.Mock.ofType();
        helper = TypeMoq.Mock.ofType();
        locator = TypeMoq.Mock.ofType();
        workspace = TypeMoq.Mock.ofType();
        config = TypeMoq.Mock.ofType();
        fileSystem = TypeMoq.Mock.ofType();
        interpreterDisplay = TypeMoq.Mock.ofType();
        workspace.setup(x => x.getConfiguration('python', TypeMoq.It.isAny())).returns(() => config.object);
        serviceManager.addSingletonInstance(types_3.IDisposableRegistry, []);
        serviceManager.addSingletonInstance(contracts_1.IInterpreterHelper, helper.object);
        serviceManager.addSingletonInstance(types_4.IPythonPathUpdaterServiceManager, updater.object);
        serviceManager.addSingletonInstance(types_1.IWorkspaceService, workspace.object);
        serviceManager.addSingletonInstance(contracts_1.IInterpreterLocatorService, locator.object, contracts_1.INTERPRETER_LOCATOR_SERVICE);
        serviceManager.addSingletonInstance(types_2.IFileSystem, fileSystem.object);
        serviceManager.addSingletonInstance(contracts_1.IInterpreterDisplay, interpreterDisplay.object);
        pipenvLocator = TypeMoq.Mock.ofType();
        wksLocator = TypeMoq.Mock.ofType();
    }));
    test('autoset interpreter - no workspace', () => __awaiter(this, void 0, void 0, function* () {
        yield verifyUpdateCalled(TypeMoq.Times.never());
    }));
    test('autoset interpreter - global pythonPath in config', () => __awaiter(this, void 0, void 0, function* () {
        setupWorkspace('folder');
        config.setup(x => x.inspect('pythonPath')).returns(() => {
            return { key: 'python', globalValue: 'global' };
        });
        yield verifyUpdateCalled(TypeMoq.Times.never());
    }));
    test('autoset interpreter - workspace has no pythonPath in config', () => __awaiter(this, void 0, void 0, function* () {
        setupWorkspace('folder');
        config.setup(x => x.inspect('pythonPath')).returns(() => {
            return { key: 'python' };
        });
        const interpreter = Object.assign({}, info, { path: path.join(path.sep, 'folder', 'py1', 'bin', 'python.exe'), type: contracts_1.InterpreterType.Unknown });
        setupLocators([interpreter], []);
        yield verifyUpdateCalled(TypeMoq.Times.once());
    }));
    test('autoset interpreter - workspace has default pythonPath in config', () => __awaiter(this, void 0, void 0, function* () {
        setupWorkspace('folder');
        config.setup(x => x.inspect('pythonPath')).returns(() => {
            return { key: 'python', workspaceValue: 'python' };
        });
        setupLocators([], []);
        yield verifyUpdateCalled(TypeMoq.Times.never());
    }));
    test('autoset interpreter - pipenv workspace', () => __awaiter(this, void 0, void 0, function* () {
        setupWorkspace('folder');
        config.setup(x => x.inspect('pythonPath')).returns(() => {
            return { key: 'python', workspaceValue: 'python' };
        });
        const interpreter = Object.assign({}, info, { path: 'python', type: contracts_1.InterpreterType.VirtualEnv });
        setupLocators([], [interpreter]);
        yield verifyUpdateCallData('python', vscode_1.ConfigurationTarget.Workspace, 'folder');
    }));
    test('autoset interpreter - workspace without interpreter', () => __awaiter(this, void 0, void 0, function* () {
        setupWorkspace('root');
        config.setup(x => x.inspect('pythonPath')).returns(() => {
            return { key: 'python', workspaceValue: 'elsewhere' };
        });
        const interpreter = Object.assign({}, info, { path: 'elsewhere', type: contracts_1.InterpreterType.Unknown });
        setupLocators([interpreter], []);
        yield verifyUpdateCalled(TypeMoq.Times.never());
    }));
    test('autoset interpreter - workspace with interpreter', () => __awaiter(this, void 0, void 0, function* () {
        setupWorkspace('root');
        config.setup(x => x.inspect('pythonPath')).returns(() => {
            return { key: 'python' };
        });
        const intPath = path.join(path.sep, 'root', 'under', 'bin', 'python.exe');
        const interpreter = Object.assign({}, info, { path: intPath, type: contracts_1.InterpreterType.Unknown });
        setupLocators([interpreter], []);
        yield verifyUpdateCallData(intPath, vscode_1.ConfigurationTarget.Workspace, 'root');
    }));
    function verifyUpdateCalled(times) {
        return __awaiter(this, void 0, void 0, function* () {
            const service = new interpreterService_1.InterpreterService(serviceContainer);
            yield service.autoSetInterpreter();
            updater
                .verify(x => x.updatePythonPath(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()), times);
        });
    }
    function verifyUpdateCallData(pythonPath, target, wksFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            let pp;
            let confTarget;
            let trigger;
            let wks;
            updater
                .setup(x => x.updatePythonPath(TypeMoq.It.isAnyString(), TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                // tslint:disable-next-line:no-any
                .callback((p, c, t, w) => {
                pp = p;
                confTarget = c;
                trigger = t;
                wks = w;
            })
                .returns(() => Promise.resolve());
            const service = new interpreterService_1.InterpreterService(serviceContainer);
            yield service.autoSetInterpreter();
            chai_1.expect(pp).not.to.be.equal(undefined, 'updatePythonPath not called');
            chai_1.expect(pp).to.be.equal(pythonPath, 'invalid Python path');
            chai_1.expect(confTarget).to.be.equal(target, 'invalid configuration target');
            chai_1.expect(trigger).to.be.equal('load', 'invalid trigger');
            chai_1.expect(wks.fsPath).to.be.equal(`${path.sep}${wksFolder}`, 'invalid workspace Uri');
        });
    }
    function setupWorkspace(folder) {
        const wsPath = {
            folderUri: vscode_1.Uri.file(folder),
            configTarget: vscode_1.ConfigurationTarget.Workspace
        };
        helper.setup(x => x.getActiveWorkspaceUri()).returns(() => wsPath);
    }
    function setupLocators(wks, pipenv) {
        pipenvLocator.setup(x => x.getInterpreters(TypeMoq.It.isAny())).returns(() => Promise.resolve(pipenv));
        serviceManager.addSingletonInstance(contracts_1.IInterpreterLocatorService, pipenvLocator.object, contracts_1.PIPENV_SERVICE);
        wksLocator.setup(x => x.getInterpreters(TypeMoq.It.isAny())).returns(() => Promise.resolve(wks));
        serviceManager.addSingletonInstance(contracts_1.IInterpreterLocatorService, wksLocator.object, contracts_1.WORKSPACE_VIRTUAL_ENV_SERVICE);
    }
    test('Changes to active document should invoke intrepreter.refresh method', () => __awaiter(this, void 0, void 0, function* () {
        const service = new interpreterService_1.InterpreterService(serviceContainer);
        const configService = TypeMoq.Mock.ofType();
        const documentManager = TypeMoq.Mock.ofType();
        let activeTextEditorChangeHandler;
        documentManager.setup(d => d.onDidChangeActiveTextEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(handler => {
            activeTextEditorChangeHandler = handler;
            return { dispose: core_utils_1.noop };
        });
        serviceManager.addSingletonInstance(types_3.IConfigurationService, configService.object);
        serviceManager.addSingletonInstance(types_1.IDocumentManager, documentManager.object);
        // tslint:disable-next-line:no-any
        configService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => new events_1.EventEmitter());
        service.initialize();
        const textEditor = TypeMoq.Mock.ofType();
        const uri = vscode_1.Uri.file(path.join('usr', 'file.py'));
        const document = TypeMoq.Mock.ofType();
        textEditor.setup(t => t.document).returns(() => document.object);
        document.setup(d => d.uri).returns(() => uri);
        activeTextEditorChangeHandler(textEditor.object);
        interpreterDisplay.verify(i => i.refresh(TypeMoq.It.isValue(uri)), TypeMoq.Times.once());
    }));
    test('If there is no active document then intrepreter.refresh should not be invoked', () => __awaiter(this, void 0, void 0, function* () {
        const service = new interpreterService_1.InterpreterService(serviceContainer);
        const configService = TypeMoq.Mock.ofType();
        const documentManager = TypeMoq.Mock.ofType();
        let activeTextEditorChangeHandler;
        documentManager.setup(d => d.onDidChangeActiveTextEditor(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(handler => {
            activeTextEditorChangeHandler = handler;
            return { dispose: core_utils_1.noop };
        });
        serviceManager.addSingletonInstance(types_3.IConfigurationService, configService.object);
        serviceManager.addSingletonInstance(types_1.IDocumentManager, documentManager.object);
        // tslint:disable-next-line:no-any
        configService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => new events_1.EventEmitter());
        service.initialize();
        activeTextEditorChangeHandler();
        interpreterDisplay.verify(i => i.refresh(TypeMoq.It.isValue(undefined)), TypeMoq.Times.never());
    }));
});
//# sourceMappingURL=interpreterService.test.js.map