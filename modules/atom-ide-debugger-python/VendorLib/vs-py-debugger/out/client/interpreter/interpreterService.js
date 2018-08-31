"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const path = require("path");
const vscode_1 = require("vscode");
const types_1 = require("../common/application/types");
const types_2 = require("../common/process/types");
const types_3 = require("../common/types");
const utils = require("../common/utils");
const types_4 = require("../ioc/types");
const types_5 = require("./configuration/types");
const contracts_1 = require("./contracts");
const types_6 = require("./virtualEnvs/types");
let InterpreterService = class InterpreterService {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
        this.didChangeInterpreterEmitter = new vscode_1.EventEmitter();
        this.onConfigChanged = () => {
            this.didChangeInterpreterEmitter.fire();
            const interpreterDisplay = this.serviceContainer.get(contracts_1.IInterpreterDisplay);
            interpreterDisplay.refresh()
                .catch(ex => console.error('Python Extension: display.refresh', ex));
        };
        this.locator = serviceContainer.get(contracts_1.IInterpreterLocatorService, contracts_1.INTERPRETER_LOCATOR_SERVICE);
        this.helper = serviceContainer.get(contracts_1.IInterpreterHelper);
        this.pythonPathUpdaterService = this.serviceContainer.get(types_5.IPythonPathUpdaterServiceManager);
    }
    refresh(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreterDisplay = this.serviceContainer.get(contracts_1.IInterpreterDisplay);
            return interpreterDisplay.refresh(resource);
        });
    }
    initialize() {
        const disposables = this.serviceContainer.get(types_3.IDisposableRegistry);
        const documentManager = this.serviceContainer.get(types_1.IDocumentManager);
        disposables.push(documentManager.onDidChangeActiveTextEditor((e) => e ? this.refresh(e.document.uri) : undefined));
        const configService = this.serviceContainer.get(types_3.IConfigurationService);
        configService.getSettings().addListener('change', this.onConfigChanged);
    }
    getInterpreters(resource) {
        return this.locator.getInterpreters(resource);
    }
    autoSetInterpreter() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield this.shouldAutoSetInterpreter())) {
                return;
            }
            const activeWorkspace = this.helper.getActiveWorkspaceUri();
            if (!activeWorkspace) {
                return;
            }
            // Check pipenv first
            const pipenvService = this.serviceContainer.get(contracts_1.IInterpreterLocatorService, contracts_1.PIPENV_SERVICE);
            let interpreters = yield pipenvService.getInterpreters(activeWorkspace.folderUri);
            if (interpreters.length > 0) {
                yield this.pythonPathUpdaterService.updatePythonPath(interpreters[0].path, activeWorkspace.configTarget, 'load', activeWorkspace.folderUri);
                return;
            }
            // Now check virtual environments under the workspace root
            const virtualEnvInterpreterProvider = this.serviceContainer.get(contracts_1.IInterpreterLocatorService, contracts_1.WORKSPACE_VIRTUAL_ENV_SERVICE);
            interpreters = yield virtualEnvInterpreterProvider.getInterpreters(activeWorkspace.folderUri);
            const workspacePathUpper = activeWorkspace.folderUri.fsPath.toUpperCase();
            const interpretersInWorkspace = interpreters.filter(interpreter => interpreter.path.toUpperCase().startsWith(workspacePathUpper));
            if (interpretersInWorkspace.length === 0) {
                return;
            }
            // Always pick the highest version by default.
            const pythonPath = interpretersInWorkspace.sort((a, b) => a.version > b.version ? 1 : -1)[0].path;
            // Ensure this new environment is at the same level as the current workspace.
            // In windows the interpreter is under scripts/python.exe on linux it is under bin/python.
            // Meaning the sub directory must be either scripts, bin or other (but only one level deep).
            const relativePath = path.dirname(pythonPath).substring(activeWorkspace.folderUri.fsPath.length);
            if (relativePath.split(path.sep).filter(l => l.length > 0).length === 2) {
                yield this.pythonPathUpdaterService.updatePythonPath(pythonPath, activeWorkspace.configTarget, 'load', activeWorkspace.folderUri);
            }
        });
    }
    dispose() {
        this.locator.dispose();
        const configService = this.serviceContainer.get(types_3.IConfigurationService);
        configService.getSettings().removeListener('change', this.onConfigChanged);
        this.didChangeInterpreterEmitter.dispose();
    }
    get onDidChangeInterpreter() {
        return this.didChangeInterpreterEmitter.event;
    }
    getActiveInterpreter(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const pythonExecutionFactory = this.serviceContainer.get(types_2.IPythonExecutionFactory);
            const pythonExecutionService = yield pythonExecutionFactory.create({ resource });
            const fullyQualifiedPath = yield pythonExecutionService.getExecutablePath().catch(() => undefined);
            // Python path is invalid or python isn't installed.
            if (!fullyQualifiedPath) {
                return;
            }
            return this.getInterpreterDetails(fullyQualifiedPath, resource);
        });
    }
    getInterpreterDetails(pythonPath, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreters = yield this.getInterpreters(resource);
            const interpreter = interpreters.find(i => utils.arePathsSame(i.path, pythonPath));
            if (interpreter) {
                return interpreter;
            }
            const interpreterHelper = this.serviceContainer.get(contracts_1.IInterpreterHelper);
            const virtualEnvManager = this.serviceContainer.get(types_6.IVirtualEnvironmentManager);
            const [details, virtualEnvName, type] = yield Promise.all([
                interpreterHelper.getInterpreterInformation(pythonPath),
                virtualEnvManager.getEnvironmentName(pythonPath),
                virtualEnvManager.getEnvironmentType(pythonPath)
            ]);
            if (details) {
                return;
            }
            const dislayNameSuffix = virtualEnvName.length > 0 ? ` (${virtualEnvName})` : '';
            const displayName = `${details.version}${dislayNameSuffix}`;
            return Object.assign({}, details, { displayName, path: pythonPath, envName: virtualEnvName, type: type });
        });
    }
    shouldAutoSetInterpreter() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeWorkspace = this.helper.getActiveWorkspaceUri();
            if (!activeWorkspace) {
                return false;
            }
            const workspaceService = this.serviceContainer.get(types_1.IWorkspaceService);
            const pythonConfig = workspaceService.getConfiguration('python', activeWorkspace.folderUri);
            const pythonPathInConfig = pythonConfig.inspect('pythonPath');
            // If we have a value in user settings, then don't auto set the interpreter path.
            if (pythonPathInConfig && pythonPathInConfig.globalValue !== undefined && pythonPathInConfig.globalValue !== 'python') {
                return false;
            }
            if (activeWorkspace.configTarget === vscode_1.ConfigurationTarget.Workspace) {
                return pythonPathInConfig.workspaceValue === undefined || pythonPathInConfig.workspaceValue === 'python';
            }
            if (activeWorkspace.configTarget === vscode_1.ConfigurationTarget.WorkspaceFolder) {
                return pythonPathInConfig.workspaceFolderValue === undefined || pythonPathInConfig.workspaceFolderValue === 'python';
            }
            return false;
        });
    }
};
InterpreterService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_4.IServiceContainer))
], InterpreterService);
exports.InterpreterService = InterpreterService;
//# sourceMappingURL=interpreterService.js.map