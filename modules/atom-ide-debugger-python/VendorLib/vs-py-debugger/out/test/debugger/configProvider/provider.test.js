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
// tslint:disable:max-func-body-length no-invalid-template-strings no-any no-object-literal-type-assertion
const chai_1 = require("chai");
const path = require("path");
const TypeMoq = require("typemoq");
const vscode_1 = require("vscode");
const types_1 = require("../../../client/common/application/types");
const constants_1 = require("../../../client/common/constants");
const types_2 = require("../../../client/common/platform/types");
const types_3 = require("../../../client/common/process/types");
const types_4 = require("../../../client/common/types");
const debugger_1 = require("../../../client/debugger");
const Contracts_1 = require("../../../client/debugger/Common/Contracts");
const configurationProviderUtils_1 = require("../../../client/debugger/configProviders/configurationProviderUtils");
const types_5 = require("../../../client/debugger/configProviders/types");
[
    { debugType: 'pythonExperimental', class: debugger_1.PythonV2DebugConfigurationProvider },
    { debugType: 'python', class: debugger_1.PythonDebugConfigurationProvider }
].forEach(provider => {
    suite(`Debugging - Config Provider ${provider.debugType}`, () => {
        let serviceContainer;
        let debugProvider;
        let platformService;
        let fileSystem;
        let appShell;
        let pythonExecutionService;
        let logger;
        setup(() => {
            serviceContainer = TypeMoq.Mock.ofType();
            debugProvider = new provider.class(serviceContainer.object);
        });
        function createMoqWorkspaceFolder(folderPath) {
            const folder = TypeMoq.Mock.ofType();
            folder.setup(f => f.uri).returns(() => vscode_1.Uri.file(folderPath));
            return folder.object;
        }
        function setupIoc(pythonPath, isWindows = false, isMac = false, isLinux = false) {
            const confgService = TypeMoq.Mock.ofType();
            platformService = TypeMoq.Mock.ofType();
            fileSystem = TypeMoq.Mock.ofType();
            appShell = TypeMoq.Mock.ofType();
            logger = TypeMoq.Mock.ofType();
            pythonExecutionService = TypeMoq.Mock.ofType();
            pythonExecutionService.setup((x) => x.then).returns(() => undefined);
            const factory = TypeMoq.Mock.ofType();
            factory.setup(f => f.create(TypeMoq.It.isAny())).returns(() => Promise.resolve(pythonExecutionService.object));
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_3.IPythonExecutionFactory))).returns(() => factory.object);
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_4.IConfigurationService))).returns(() => confgService.object);
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IPlatformService))).returns(() => platformService.object);
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IFileSystem))).returns(() => fileSystem.object);
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IApplicationShell))).returns(() => appShell.object);
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_5.IConfigurationProviderUtils))).returns(() => new configurationProviderUtils_1.ConfigurationProviderUtils(serviceContainer.object));
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_4.ILogger))).returns(() => logger.object);
            const settings = TypeMoq.Mock.ofType();
            settings.setup(s => s.pythonPath).returns(() => pythonPath);
            confgService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => settings.object);
            setupOs(isWindows, isMac, isLinux);
        }
        function setupActiveEditor(fileName, languageId) {
            const documentManager = TypeMoq.Mock.ofType();
            if (fileName) {
                const textEditor = TypeMoq.Mock.ofType();
                const document = TypeMoq.Mock.ofType();
                document.setup(d => d.languageId).returns(() => languageId);
                document.setup(d => d.fileName).returns(() => fileName);
                textEditor.setup(t => t.document).returns(() => document.object);
                documentManager.setup(d => d.activeTextEditor).returns(() => textEditor.object);
            }
            else {
                documentManager.setup(d => d.activeTextEditor).returns(() => undefined);
            }
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IDocumentManager))).returns(() => documentManager.object);
        }
        function setupWorkspaces(folders) {
            const workspaceService = TypeMoq.Mock.ofType();
            const workspaceFolders = folders.map(createMoqWorkspaceFolder);
            workspaceService.setup(w => w.workspaceFolders).returns(() => workspaceFolders);
            serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IWorkspaceService))).returns(() => workspaceService.object);
        }
        function setupOs(isWindows, isMac, isLinux) {
            platformService.setup(p => p.isWindows).returns(() => isWindows);
            platformService.setup(p => p.isMac).returns(() => isMac);
            platformService.setup(p => p.isLinux).returns(() => isLinux);
        }
        test('Defaults should be returned when an empty object is passed with a Workspace Folder and active file', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, {});
            chai_1.expect(Object.keys(debugConfig)).to.have.lengthOf.above(3);
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
            chai_1.expect(debugConfig).to.have.property('type', provider.debugType);
            chai_1.expect(debugConfig).to.have.property('request', 'launch');
            chai_1.expect(debugConfig).to.have.property('program', pythonFile);
            chai_1.expect(debugConfig).to.have.property('cwd');
            chai_1.expect(debugConfig.cwd.toLowerCase()).to.be.equal(__dirname.toLowerCase());
            chai_1.expect(debugConfig).to.have.property('envFile');
            chai_1.expect(debugConfig.envFile.toLowerCase()).to.be.equal(path.join(__dirname, '.env').toLowerCase());
            chai_1.expect(debugConfig).to.have.property('env');
            // tslint:disable-next-line:no-any
            chai_1.expect(Object.keys(debugConfig.env)).to.have.lengthOf(0);
        }));
        test('Defaults should be returned when an object with \'noDebug\' property is passed with a Workspace Folder and active file', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, { noDebug: true });
            chai_1.expect(Object.keys(debugConfig)).to.have.lengthOf.above(3);
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
            chai_1.expect(debugConfig).to.have.property('type', provider.debugType);
            chai_1.expect(debugConfig).to.have.property('request', 'launch');
            chai_1.expect(debugConfig).to.have.property('program', pythonFile);
            chai_1.expect(debugConfig).to.have.property('cwd');
            chai_1.expect(debugConfig.cwd.toLowerCase()).to.be.equal(__dirname.toLowerCase());
            chai_1.expect(debugConfig).to.have.property('envFile');
            chai_1.expect(debugConfig.envFile.toLowerCase()).to.be.equal(path.join(__dirname, '.env').toLowerCase());
            chai_1.expect(debugConfig).to.have.property('env');
            // tslint:disable-next-line:no-any
            chai_1.expect(Object.keys(debugConfig.env)).to.have.lengthOf(0);
        }));
        test('Defaults should be returned when an empty object is passed without Workspace Folder, no workspaces and active file', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            setupWorkspaces([]);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(undefined, {});
            const filePath = vscode_1.Uri.file(path.dirname('')).fsPath;
            chai_1.expect(Object.keys(debugConfig)).to.have.lengthOf.above(3);
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
            chai_1.expect(debugConfig).to.have.property('type', provider.debugType);
            chai_1.expect(debugConfig).to.have.property('request', 'launch');
            chai_1.expect(debugConfig).to.have.property('program', pythonFile);
            chai_1.expect(debugConfig).to.have.property('cwd');
            chai_1.expect(debugConfig.cwd.toLowerCase()).to.be.equal(filePath.toLowerCase());
            chai_1.expect(debugConfig).to.have.property('envFile');
            chai_1.expect(debugConfig.envFile.toLowerCase()).to.be.equal(path.join(filePath, '.env').toLowerCase());
            chai_1.expect(debugConfig).to.have.property('env');
            // tslint:disable-next-line:no-any
            chai_1.expect(Object.keys(debugConfig.env)).to.have.lengthOf(0);
        }));
        test('Defaults should be returned when an empty object is passed without Workspace Folder, no workspaces and no active file', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            setupIoc(pythonPath);
            setupActiveEditor(undefined, constants_1.PYTHON_LANGUAGE);
            setupWorkspaces([]);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(undefined, {});
            chai_1.expect(Object.keys(debugConfig)).to.have.lengthOf.above(3);
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
            chai_1.expect(debugConfig).to.have.property('type', provider.debugType);
            chai_1.expect(debugConfig).to.have.property('request', 'launch');
            chai_1.expect(debugConfig).to.have.property('program', '');
            chai_1.expect(debugConfig).not.to.have.property('cwd');
            chai_1.expect(debugConfig).not.to.have.property('envFile');
            chai_1.expect(debugConfig).to.have.property('env');
            // tslint:disable-next-line:no-any
            chai_1.expect(Object.keys(debugConfig.env)).to.have.lengthOf(0);
        }));
        test('Defaults should be returned when an empty object is passed without Workspace Folder, no workspaces and non python file', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const activeFile = 'xyz.js';
            setupIoc(pythonPath);
            setupActiveEditor(activeFile, 'javascript');
            setupWorkspaces([]);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(undefined, {});
            chai_1.expect(Object.keys(debugConfig)).to.have.lengthOf.above(3);
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
            chai_1.expect(debugConfig).to.have.property('type', provider.debugType);
            chai_1.expect(debugConfig).to.have.property('request', 'launch');
            chai_1.expect(debugConfig).to.have.property('program', '');
            chai_1.expect(debugConfig).not.to.have.property('cwd');
            chai_1.expect(debugConfig).not.to.have.property('envFile');
            chai_1.expect(debugConfig).to.have.property('env');
            // tslint:disable-next-line:no-any
            chai_1.expect(Object.keys(debugConfig.env)).to.have.lengthOf(0);
        }));
        test('Defaults should be returned when an empty object is passed without Workspace Folder, with a workspace and an active python file', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const activeFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(activeFile, constants_1.PYTHON_LANGUAGE);
            const defaultWorkspace = path.join('usr', 'desktop');
            setupWorkspaces([defaultWorkspace]);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(undefined, {});
            const filePath = vscode_1.Uri.file(defaultWorkspace).fsPath;
            chai_1.expect(Object.keys(debugConfig)).to.have.lengthOf.above(3);
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
            chai_1.expect(debugConfig).to.have.property('type', provider.debugType);
            chai_1.expect(debugConfig).to.have.property('request', 'launch');
            chai_1.expect(debugConfig).to.have.property('program', activeFile);
            chai_1.expect(debugConfig).to.have.property('cwd');
            chai_1.expect(debugConfig.cwd.toLowerCase()).to.be.equal(filePath.toLowerCase());
            chai_1.expect(debugConfig).to.have.property('envFile');
            chai_1.expect(debugConfig.envFile.toLowerCase()).to.be.equal(path.join(filePath, '.env').toLowerCase());
            chai_1.expect(debugConfig).to.have.property('env');
            // tslint:disable-next-line:no-any
            chai_1.expect(Object.keys(debugConfig.env)).to.have.lengthOf(0);
        }));
        test('Ensure `${config:python.pythonPath}` is replaced with actual pythonPath', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const activeFile = 'xyz.py';
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            setupIoc(pythonPath);
            setupActiveEditor(activeFile, constants_1.PYTHON_LANGUAGE);
            const defaultWorkspace = path.join('usr', 'desktop');
            setupWorkspaces([defaultWorkspace]);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, { pythonPath: '${config:python.pythonPath}' });
            chai_1.expect(debugConfig).to.have.property('pythonPath', pythonPath);
        }));
        test('Ensure hardcoded pythonPath is left unaltered', () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const activeFile = 'xyz.py';
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            setupIoc(pythonPath);
            setupActiveEditor(activeFile, constants_1.PYTHON_LANGUAGE);
            const defaultWorkspace = path.join('usr', 'desktop');
            setupWorkspaces([defaultWorkspace]);
            const debugPythonPath = `Debug_PythonPath_${new Date().toString()}`;
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, { pythonPath: debugPythonPath });
            chai_1.expect(debugConfig).to.have.property('pythonPath', debugPythonPath);
        }));
        test('Test defaults of experimental debugger', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType !== 'pythonExperimental') {
                return;
            }
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, {});
            chai_1.expect(debugConfig).to.have.property('console', 'integratedTerminal');
            chai_1.expect(debugConfig).to.have.property('stopOnEntry', false);
            chai_1.expect(debugConfig).to.have.property('debugOptions');
            chai_1.expect(debugConfig.debugOptions).to.be.deep.equal(['RedirectOutput']);
        }));
        test('Test defaults of python debugger', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType !== 'python') {
                return;
            }
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, {});
            chai_1.expect(debugConfig).to.have.property('stopOnEntry', false);
            chai_1.expect(debugConfig).to.have.property('debugOptions');
            chai_1.expect(debugConfig.debugOptions).to.be.deep.equal([Contracts_1.DebugOptions.RedirectOutput]);
        }));
        test('Test overriding defaults of experimental debugger', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType !== 'pythonExperimental') {
                return;
            }
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, { redirectOutput: false });
            chai_1.expect(debugConfig).to.have.property('console', 'integratedTerminal');
            chai_1.expect(debugConfig).to.have.property('stopOnEntry', false);
            chai_1.expect(debugConfig).to.have.property('debugOptions');
            chai_1.expect(debugConfig.debugOptions).to.be.deep.equal([]);
        }));
        function testFixFilePathCase(isWindows, isMac, isLinux) {
            return __awaiter(this, void 0, void 0, function* () {
                const pythonPath = `PythonPath_${new Date().toString()}`;
                const workspaceFolder = createMoqWorkspaceFolder(__dirname);
                const pythonFile = 'xyz.py';
                setupIoc(pythonPath, isWindows, isMac, isLinux);
                setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
                const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, {});
                if (isWindows) {
                    chai_1.expect(debugConfig).to.have.property('debugOptions').contains(Contracts_1.DebugOptions.FixFilePathCase);
                }
                else {
                    chai_1.expect(debugConfig).to.have.property('debugOptions').not.contains(Contracts_1.DebugOptions.FixFilePathCase);
                }
            });
        }
        test('Test fixFilePathCase for Windows', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType === 'python') {
                return;
            }
            yield testFixFilePathCase(true, false, false);
        }));
        test('Test fixFilePathCase for Linux', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType === 'python') {
                return;
            }
            yield testFixFilePathCase(false, false, true);
        }));
        test('Test fixFilePathCase for Mac', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType === 'python') {
                return;
            }
            yield testFixFilePathCase(false, true, false);
        }));
        function testPyramidConfiguration(isWindows, isLinux, isMac, addPyramidDebugOption = true, pyramidExists = true, shouldWork = true) {
            return __awaiter(this, void 0, void 0, function* () {
                const workspacePath = path.join('usr', 'development', 'wksp1');
                const pythonPath = path.join(workspacePath, 'env', 'bin', 'python');
                const pyramidFilePath = path.join(path.dirname(pythonPath), 'lib', 'site_packages', 'pyramid', '__init__.py');
                const pserveFilePath = path.join(path.dirname(pyramidFilePath), 'scripts', 'pserve.py');
                const args = ['-c', 'import pyramid;print(pyramid.__file__)'];
                const workspaceFolder = createMoqWorkspaceFolder(workspacePath);
                const pythonFile = 'xyz.py';
                setupIoc(pythonPath, isWindows, isMac, isLinux);
                setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
                if (pyramidExists) {
                    pythonExecutionService.setup(e => e.exec(TypeMoq.It.isValue(args), TypeMoq.It.isAny()))
                        .returns(() => Promise.resolve({ stdout: pyramidFilePath }))
                        .verifiable(TypeMoq.Times.exactly(addPyramidDebugOption ? 1 : 0));
                }
                else {
                    pythonExecutionService.setup(e => e.exec(TypeMoq.It.isValue(args), TypeMoq.It.isAny()))
                        .returns(() => Promise.reject('No Module Available'))
                        .verifiable(TypeMoq.Times.exactly(addPyramidDebugOption ? 1 : 0));
                }
                fileSystem.setup(f => f.fileExists(TypeMoq.It.isValue(pserveFilePath)))
                    .returns(() => Promise.resolve(pyramidExists))
                    .verifiable(TypeMoq.Times.exactly(pyramidExists && addPyramidDebugOption ? 1 : 0));
                appShell.setup(a => a.showErrorMessage(TypeMoq.It.isAny()))
                    .verifiable(TypeMoq.Times.exactly(pyramidExists || !addPyramidDebugOption ? 0 : 1));
                logger.setup(a => a.logError(TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                    .verifiable(TypeMoq.Times.exactly(pyramidExists || !addPyramidDebugOption ? 0 : 1));
                const options = addPyramidDebugOption ? { debugOptions: [Contracts_1.DebugOptions.Pyramid], pyramid: true } : {};
                const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, options);
                if (shouldWork) {
                    chai_1.expect(debugConfig).to.have.property('program', pserveFilePath);
                    if (provider.debugType === 'pythonExperimental') {
                        chai_1.expect(debugConfig).to.have.property('debugOptions');
                        chai_1.expect(debugConfig.debugOptions).contains(Contracts_1.DebugOptions.Jinja);
                    }
                }
                else {
                    chai_1.expect(debugConfig.program).to.be.not.equal(pserveFilePath);
                }
                pythonExecutionService.verifyAll();
                fileSystem.verifyAll();
                appShell.verifyAll();
                logger.verifyAll();
            });
        }
        test('Program is set for Pyramid (windows)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(true, false, false);
        }));
        test('Program is set for Pyramid (Linux)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(false, true, false);
        }));
        test('Program is set for Pyramid (Mac)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(false, false, true);
        }));
        test('Program is not set for Pyramid when DebugOption is not set (windows)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(true, false, false, false, false, false);
        }));
        test('Program is not set for Pyramid when DebugOption is not set (Linux)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(false, true, false, false, false, false);
        }));
        test('Program is not set for Pyramid when DebugOption is not set (Mac)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(false, false, true, false, false, false);
        }));
        test('Message is displayed when pyramid script does not exist (windows)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(true, false, false, true, false, false);
        }));
        test('Message is displayed when pyramid script does not exist (Linux)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(false, true, false, true, false, false);
        }));
        test('Message is displayed when pyramid script does not exist (Mac)', () => __awaiter(this, void 0, void 0, function* () {
            yield testPyramidConfiguration(false, false, true, true, false, false);
        }));
        test('Auto detect flask debugging', () => __awaiter(this, void 0, void 0, function* () {
            if (provider.debugType === 'python') {
                return;
            }
            const pythonPath = `PythonPath_${new Date().toString()}`;
            const workspaceFolder = createMoqWorkspaceFolder(__dirname);
            const pythonFile = 'xyz.py';
            setupIoc(pythonPath);
            setupActiveEditor(pythonFile, constants_1.PYTHON_LANGUAGE);
            const debugConfig = yield debugProvider.resolveDebugConfiguration(workspaceFolder, { module: 'flask' });
            chai_1.expect(debugConfig).to.have.property('debugOptions');
            chai_1.expect(debugConfig.debugOptions).contains(Contracts_1.DebugOptions.RedirectOutput);
            chai_1.expect(debugConfig.debugOptions).contains(Contracts_1.DebugOptions.Jinja);
        }));
    });
});
//# sourceMappingURL=provider.test.js.map