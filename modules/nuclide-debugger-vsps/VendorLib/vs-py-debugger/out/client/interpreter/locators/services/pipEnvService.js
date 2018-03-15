"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
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
const types_1 = require("../../../common/application/types");
const types_2 = require("../../../common/platform/types");
const types_3 = require("../../../common/process/types");
const Utils_1 = require("../../../debugger/Common/Utils");
const types_4 = require("../../../ioc/types");
const contracts_1 = require("../../contracts");
const cacheableLocatorService_1 = require("./cacheableLocatorService");
const execName = 'pipenv';
let PipEnvService = class PipEnvService extends cacheableLocatorService_1.CacheableLocatorService {
    constructor(serviceContainer) {
        super('PipEnvService', serviceContainer);
        this.versionService = this.serviceContainer.get(contracts_1.IInterpreterVersionService);
        this.process = this.serviceContainer.get(types_3.IProcessService);
        this.workspace = this.serviceContainer.get(types_1.IWorkspaceService);
        this.fs = this.serviceContainer.get(types_2.IFileSystem);
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getInterpretersImplementation(resource) {
        const pipenvCwd = this.getPipenvWorkingDirectory(resource);
        if (!pipenvCwd) {
            return Promise.resolve([]);
        }
        return this.getInterpreterFromPipenv(pipenvCwd)
            .then(item => item ? [item] : [])
            .catch(() => []);
    }
    getInterpreterFromPipenv(pipenvCwd) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreterPath = yield this.getInterpreterPathFromPipenv(pipenvCwd);
            if (!interpreterPath) {
                return;
            }
            const pythonExecutablePath = Utils_1.getPythonExecutable(interpreterPath);
            const ver = yield this.versionService.getVersion(pythonExecutablePath, '');
            return {
                path: pythonExecutablePath,
                displayName: `${ver} (${execName})`,
                type: contracts_1.InterpreterType.VirtualEnv,
                version: ver
            };
        });
    }
    getPipenvWorkingDirectory(resource) {
        // The file is not in a workspace. However, workspace may be opened
        // and file is just a random file opened from elsewhere. In this case
        // we still want to provide interpreter associated with the workspace.
        // Otherwise if user tries and formats the file, we may end up using
        // plain pip module installer to bring in the formatter and it is wrong.
        const wsFolder = resource ? this.workspace.getWorkspaceFolder(resource) : undefined;
        return wsFolder ? wsFolder.uri.fsPath : this.workspace.rootPath;
    }
    getInterpreterPathFromPipenv(cwd) {
        return __awaiter(this, void 0, void 0, function* () {
            // Quick check before actually running pipenv
            if (!(yield this.fs.fileExistsAsync(path.join(cwd, 'Pipfile')))) {
                return;
            }
            const venvFolder = yield this.invokePipenv('--venv', cwd);
            return venvFolder && (yield this.fs.directoryExistsAsync(venvFolder)) ? venvFolder : undefined;
        });
    }
    invokePipenv(arg, rootPath) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield this.process.exec(execName, [arg], { cwd: rootPath });
                if (result && result.stdout) {
                    return result.stdout.trim();
                }
                // tslint:disable-next-line:no-empty
            }
            catch (error) {
                const appShell = this.serviceContainer.get(types_1.IApplicationShell);
                appShell.showWarningMessage(`Workspace contains pipfile but attempt to run 'pipenv --venv' failed with ${error}. Make sure pipenv is on the PATH.`);
            }
        });
    }
};
PipEnvService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_4.IServiceContainer))
], PipEnvService);
exports.PipEnvService = PipEnvService;
//# sourceMappingURL=pipEnvService.js.map