"use strict";
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
const os_1 = require("os");
const path = require("path");
const TypeMoq = require("typemoq");
const vscode_1 = require("vscode");
const types_1 = require("../../client/common/application/types");
const types_2 = require("../../client/common/platform/types");
const types_3 = require("../../client/common/types");
const contracts_1 = require("../../client/interpreter/contracts");
const display_1 = require("../../client/interpreter/display");
const types_4 = require("../../client/interpreter/virtualEnvs/types");
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
suite('Interpreters Display', () => {
    let applicationShell;
    let workspaceService;
    let serviceContainer;
    let interpreterService;
    let virtualEnvMgr;
    let fileSystem;
    let disposableRegistry;
    let statusBar;
    let pythonSettings;
    let configurationService;
    let interpreterDisplay;
    let interpreterHelper;
    setup(() => {
        serviceContainer = TypeMoq.Mock.ofType();
        workspaceService = TypeMoq.Mock.ofType();
        applicationShell = TypeMoq.Mock.ofType();
        interpreterService = TypeMoq.Mock.ofType();
        virtualEnvMgr = TypeMoq.Mock.ofType();
        fileSystem = TypeMoq.Mock.ofType();
        interpreterHelper = TypeMoq.Mock.ofType();
        disposableRegistry = [];
        statusBar = TypeMoq.Mock.ofType();
        pythonSettings = TypeMoq.Mock.ofType();
        configurationService = TypeMoq.Mock.ofType();
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IWorkspaceService))).returns(() => workspaceService.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IApplicationShell))).returns(() => applicationShell.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(contracts_1.IInterpreterService))).returns(() => interpreterService.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_4.IVirtualEnvironmentManager))).returns(() => virtualEnvMgr.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IFileSystem))).returns(() => fileSystem.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_3.IDisposableRegistry))).returns(() => disposableRegistry);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_3.IConfigurationService))).returns(() => configurationService.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(contracts_1.IInterpreterHelper))).returns(() => interpreterHelper.object);
        applicationShell.setup(a => a.createStatusBarItem(TypeMoq.It.isValue(vscode_1.StatusBarAlignment.Left), TypeMoq.It.isValue(undefined))).returns(() => statusBar.object);
        interpreterDisplay = new display_1.InterpreterDisplay(serviceContainer.object);
    });
    function setupWorkspaceFolder(resource, workspaceFolder) {
        if (workspaceFolder) {
            const mockFolder = TypeMoq.Mock.ofType();
            mockFolder.setup(w => w.uri).returns(() => workspaceFolder);
            workspaceService.setup(w => w.getWorkspaceFolder(TypeMoq.It.isValue(resource))).returns(() => mockFolder.object);
        }
        else {
            workspaceService.setup(w => w.getWorkspaceFolder(TypeMoq.It.isValue(resource))).returns(() => undefined);
        }
    }
    test('Sattusbar must be created and have command name initialized', () => {
        statusBar.verify(s => s.command = TypeMoq.It.isValue('python.setInterpreter'), TypeMoq.Times.once());
        chai_1.expect(disposableRegistry).to.be.lengthOf.above(0);
        chai_1.expect(disposableRegistry).contain(statusBar.object);
    });
    test('Display name and tooltip must come from interpreter info', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        const activeInterpreter = Object.assign({}, info, { displayName: 'Dummy_Display_Name', type: contracts_1.InterpreterType.Unknown, path: path.join('user', 'development', 'env', 'bin', 'python') });
        setupWorkspaceFolder(resource, workspaceFolder);
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(activeInterpreter));
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.text = TypeMoq.It.isValue(activeInterpreter.displayName), TypeMoq.Times.once());
        statusBar.verify(s => s.tooltip = TypeMoq.It.isValue(activeInterpreter.path), TypeMoq.Times.once());
    }));
    test('Display name and tooltip must include company display name from interpreter info', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        const activeInterpreter = Object.assign({}, info, { displayName: 'Dummy_Display_Name', type: contracts_1.InterpreterType.Unknown, companyDisplayName: 'Company Name', path: path.join('user', 'development', 'env', 'bin', 'python') });
        setupWorkspaceFolder(resource, workspaceFolder);
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(activeInterpreter));
        const expectedTooltip = `${activeInterpreter.path}${os_1.EOL}${activeInterpreter.companyDisplayName}`;
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.text = TypeMoq.It.isValue(activeInterpreter.displayName), TypeMoq.Times.once());
        statusBar.verify(s => s.tooltip = TypeMoq.It.isValue(expectedTooltip), TypeMoq.Times.once());
    }));
    test('If interpreter is not identified then tooltip should point to python Path and text containing the folder name', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const pythonPath = path.join('user', 'development', 'env', 'bin', 'python');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        setupWorkspaceFolder(resource, workspaceFolder);
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(undefined));
        configurationService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
        pythonSettings.setup(p => p.pythonPath).returns(() => pythonPath);
        virtualEnvMgr.setup(v => v.getEnvironmentName(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(''));
        interpreterHelper.setup(v => v.getInterpreterInformation(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(undefined));
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.tooltip = TypeMoq.It.isValue(pythonPath), TypeMoq.Times.once());
        statusBar.verify(s => s.text = TypeMoq.It.isValue(`${path.basename(pythonPath)} [Environment]`), TypeMoq.Times.once());
    }));
    test('If virtual environment interpreter is not identified then text should contain the type of virtual environment', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const pythonPath = path.join('user', 'development', 'env', 'bin', 'python');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        setupWorkspaceFolder(resource, workspaceFolder);
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(undefined));
        configurationService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
        pythonSettings.setup(p => p.pythonPath).returns(() => pythonPath);
        // tslint:disable-next-line:no-any
        virtualEnvMgr.setup(v => v.getEnvironmentName(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve('Mock Name'));
        interpreterHelper.setup(v => v.getInterpreterInformation(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(undefined));
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.tooltip = TypeMoq.It.isValue(pythonPath), TypeMoq.Times.once());
        statusBar.verify(s => s.text = TypeMoq.It.isValue(`${path.basename(pythonPath)} [Environment] (Mock Name)`), TypeMoq.Times.once());
    }));
    test('If interpreter file does not exist then update status bar accordingly', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const pythonPath = path.join('user', 'development', 'env', 'bin', 'python');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        setupWorkspaceFolder(resource, workspaceFolder);
        // tslint:disable-next-line:no-any
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([{}]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(undefined));
        configurationService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
        pythonSettings.setup(p => p.pythonPath).returns(() => pythonPath);
        fileSystem.setup(f => f.fileExists(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(false));
        interpreterHelper.setup(v => v.getInterpreterInformation(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(undefined));
        virtualEnvMgr.setup(v => v.getEnvironmentName(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(''));
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.color = TypeMoq.It.isValue('yellow'), TypeMoq.Times.once());
        statusBar.verify(s => s.text = TypeMoq.It.isValue('$(alert) Select Python Environment'), TypeMoq.Times.once());
    }));
    test('Suffix display name with the virtual env name', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const pythonPath = path.join('user', 'development', 'env', 'bin', 'python');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        setupWorkspaceFolder(resource, workspaceFolder);
        // tslint:disable-next-line:no-any
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([{}]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(undefined));
        configurationService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
        pythonSettings.setup(p => p.pythonPath).returns(() => pythonPath);
        fileSystem.setup(f => f.fileExists(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(true));
        const defaultDisplayName = `${path.basename(pythonPath)} [Environment]`;
        interpreterHelper.setup(v => v.getInterpreterInformation(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(undefined));
        // tslint:disable-next-line:no-any
        virtualEnvMgr.setup(v => v.getEnvironmentName(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve('Mock Env Name'));
        const expectedText = `${defaultDisplayName} (Mock Env Name)`;
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.text = TypeMoq.It.isValue(expectedText), TypeMoq.Times.once());
    }));
    test('Use version of interpreter instead of a default interpreter name', () => __awaiter(this, void 0, void 0, function* () {
        const resource = vscode_1.Uri.file('x');
        const pythonPath = path.join('user', 'development', 'env', 'bin', 'python');
        const workspaceFolder = vscode_1.Uri.file('workspace');
        setupWorkspaceFolder(resource, workspaceFolder);
        // tslint:disable-next-line:no-any
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve([{}]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(workspaceFolder))).returns(() => Promise.resolve(undefined));
        configurationService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
        pythonSettings.setup(p => p.pythonPath).returns(() => pythonPath);
        fileSystem.setup(f => f.fileExists(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(true));
        const displayName = 'Version from Interperter';
        interpreterHelper.setup(v => v.getInterpreterInformation(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve({ version: displayName }));
        // tslint:disable-next-line:no-any
        virtualEnvMgr.setup(v => v.getEnvironmentName(TypeMoq.It.isValue(pythonPath))).returns(() => Promise.resolve(''));
        yield interpreterDisplay.refresh(resource);
        statusBar.verify(s => s.text = TypeMoq.It.isValue(displayName), TypeMoq.Times.once());
    }));
    test('Ensure we try to identify the active workspace when a resource is not provided ', () => __awaiter(this, void 0, void 0, function* () {
        const workspaceFolder = vscode_1.Uri.file('x');
        const resource = workspaceFolder;
        const activeInterpreter = Object.assign({}, info, { displayName: 'Dummy_Display_Name', type: contracts_1.InterpreterType.Unknown, companyDisplayName: 'Company Name', path: path.join('user', 'development', 'env', 'bin', 'python') });
        interpreterService.setup(i => i.getInterpreters(TypeMoq.It.isValue(resource))).returns(() => Promise.resolve([]));
        interpreterService.setup(i => i.getActiveInterpreter(TypeMoq.It.isValue(resource))).returns(() => Promise.resolve(activeInterpreter));
        interpreterHelper.setup(i => i.getInterpreterInformation(TypeMoq.It.isAny())).returns(() => Promise.resolve(undefined));
        const expectedTooltip = `${activeInterpreter.path}${os_1.EOL}${activeInterpreter.companyDisplayName}`;
        interpreterHelper.setup(i => i.getActiveWorkspaceUri()).returns(() => { return { folderUri: workspaceFolder, configTarget: vscode_1.ConfigurationTarget.Workspace }; });
        yield interpreterDisplay.refresh();
        statusBar.verify(s => s.text = TypeMoq.It.isValue(activeInterpreter.displayName), TypeMoq.Times.once());
        statusBar.verify(s => s.tooltip = TypeMoq.It.isValue(expectedTooltip), TypeMoq.Times.once());
    }));
});
//# sourceMappingURL=display.test.js.map