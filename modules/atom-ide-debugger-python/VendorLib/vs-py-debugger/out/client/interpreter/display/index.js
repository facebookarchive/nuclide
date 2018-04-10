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
const os_1 = require("os");
const path = require("path");
const vscode_1 = require("vscode");
const types_1 = require("../../common/application/types");
const types_2 = require("../../common/platform/types");
const types_3 = require("../../common/types");
const types_4 = require("../../ioc/types");
const contracts_1 = require("../contracts");
const types_5 = require("../virtualEnvs/types");
// tslint:disable-next-line:completed-docs
let InterpreterDisplay = class InterpreterDisplay {
    constructor(serviceContainer) {
        this.interpreterService = serviceContainer.get(contracts_1.IInterpreterService);
        this.virtualEnvMgr = serviceContainer.get(types_5.IVirtualEnvironmentManager);
        this.versionProvider = serviceContainer.get(contracts_1.IInterpreterVersionService);
        this.fileSystem = serviceContainer.get(types_2.IFileSystem);
        this.configurationService = serviceContainer.get(types_3.IConfigurationService);
        this.helper = serviceContainer.get(contracts_1.IInterpreterHelper);
        this.workspaceService = serviceContainer.get(types_1.IWorkspaceService);
        const application = serviceContainer.get(types_1.IApplicationShell);
        const disposableRegistry = serviceContainer.get(types_3.IDisposableRegistry);
        this.statusBar = application.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        this.statusBar.command = 'python.setInterpreter';
        disposableRegistry.push(this.statusBar);
    }
    refresh(resource) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use the workspace Uri if available
            if (resource && this.workspaceService.getWorkspaceFolder(resource)) {
                resource = this.workspaceService.getWorkspaceFolder(resource).uri;
            }
            if (!resource) {
                const wkspc = this.helper.getActiveWorkspaceUri();
                resource = wkspc ? wkspc.folderUri : undefined;
            }
            yield this.updateDisplay(resource);
        });
    }
    updateDisplay(workspaceFolder) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreters = yield this.interpreterService.getInterpreters(workspaceFolder);
            const interpreter = yield this.interpreterService.getActiveInterpreter(workspaceFolder);
            const pythonPath = interpreter ? interpreter.path : this.configurationService.getSettings(workspaceFolder).pythonPath;
            this.statusBar.color = '';
            this.statusBar.tooltip = pythonPath;
            if (interpreter) {
                // tslint:disable-next-line:no-non-null-assertion
                this.statusBar.text = interpreter.displayName;
                if (interpreter.companyDisplayName) {
                    const toolTipSuffix = `${os_1.EOL}${interpreter.companyDisplayName}`;
                    this.statusBar.tooltip += toolTipSuffix;
                }
            }
            else {
                const defaultDisplayName = `${path.basename(pythonPath)} [Environment]`;
                yield Promise.all([
                    this.fileSystem.fileExistsAsync(pythonPath),
                    this.versionProvider.getVersion(pythonPath, defaultDisplayName),
                    this.getVirtualEnvironmentName(pythonPath).catch(() => '')
                ])
                    .then(([interpreterExists, displayName, virtualEnvName]) => {
                    const dislayNameSuffix = virtualEnvName.length > 0 ? ` (${virtualEnvName})` : '';
                    this.statusBar.text = `${displayName}${dislayNameSuffix}`;
                    if (!interpreterExists && displayName === defaultDisplayName && interpreters.length > 0) {
                        this.statusBar.color = 'yellow';
                        this.statusBar.text = '$(alert) Select Python Environment';
                    }
                });
            }
            this.statusBar.show();
        });
    }
    getVirtualEnvironmentName(pythonPath) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.virtualEnvMgr.getEnvironmentName(pythonPath);
        });
    }
};
InterpreterDisplay = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_4.IServiceContainer))
], InterpreterDisplay);
exports.InterpreterDisplay = InterpreterDisplay;
//# sourceMappingURL=index.js.map