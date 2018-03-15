// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const path = require("path");
const vscode_1 = require("vscode");
const types_1 = require("../../common/application/types");
const constants_1 = require("../../common/constants");
const types_2 = require("../../common/types");
let BaseConfigurationProvider = class BaseConfigurationProvider {
    constructor(debugType, serviceContainer) {
        this.debugType = debugType;
        this.serviceContainer = serviceContainer;
    }
    resolveDebugConfiguration(folder, debugConfiguration, token) {
        const config = debugConfiguration;
        const numberOfSettings = Object.keys(config);
        const workspaceFolder = this.getWorkspaceFolder(folder, config);
        if ((config.noDebug === true && numberOfSettings.length === 1) || numberOfSettings.length === 0) {
            const defaultProgram = this.getProgram(config);
            config.name = 'Launch';
            config.type = this.debugType;
            config.request = 'launch';
            config.program = defaultProgram ? defaultProgram : '';
            config.env = {};
        }
        this.provideDefaults(workspaceFolder, config);
        return config;
    }
    provideDefaults(workspaceFolder, debugConfiguration) {
        this.resolveAndUpdatePythonPath(workspaceFolder, debugConfiguration);
        if (typeof debugConfiguration.cwd !== 'string' && workspaceFolder) {
            debugConfiguration.cwd = workspaceFolder.fsPath;
        }
        if (typeof debugConfiguration.envFile !== 'string' && workspaceFolder) {
            const envFile = workspaceFolder ? path.join(workspaceFolder.fsPath, '.env') : '';
            debugConfiguration.envFile = envFile;
        }
        if (typeof debugConfiguration.stopOnEntry !== 'boolean') {
            debugConfiguration.stopOnEntry = false;
        }
        if (!debugConfiguration.console) {
            debugConfiguration.console = 'none';
        }
        // If using a terminal, then never open internal console.
        if (debugConfiguration.console !== 'none' && !debugConfiguration.internalConsoleOptions) {
            debugConfiguration.internalConsoleOptions = 'neverOpen';
        }
        if (!Array.isArray(debugConfiguration.debugOptions)) {
            debugConfiguration.debugOptions = [];
        }
        // Always redirect output.
        if (debugConfiguration.debugOptions.indexOf('RedirectOutput') === -1) {
            debugConfiguration.debugOptions.push('RedirectOutput');
        }
    }
    getWorkspaceFolder(folder, config) {
        if (folder) {
            return folder.uri;
        }
        const program = this.getProgram(config);
        const workspaceService = this.serviceContainer.get(types_1.IWorkspaceService);
        if (!Array.isArray(workspaceService.workspaceFolders) || workspaceService.workspaceFolders.length === 0) {
            return program ? vscode_1.Uri.file(path.dirname(program)) : undefined;
        }
        if (workspaceService.workspaceFolders.length === 1) {
            return workspaceService.workspaceFolders[0].uri;
        }
        if (program) {
            const workspaceFolder = workspaceService.getWorkspaceFolder(vscode_1.Uri.file(program));
            if (workspaceFolder) {
                return workspaceFolder.uri;
            }
        }
    }
    getProgram(config) {
        const documentManager = this.serviceContainer.get(types_1.IDocumentManager);
        const editor = documentManager.activeTextEditor;
        if (editor && editor.document.languageId === constants_1.PythonLanguage.language) {
            return editor.document.fileName;
        }
    }
    resolveAndUpdatePythonPath(workspaceFolder, debugConfiguration) {
        if (!debugConfiguration) {
            return;
        }
        if (debugConfiguration.pythonPath === '${config:python.pythonPath}' || !debugConfiguration.pythonPath) {
            const configService = this.serviceContainer.get(types_2.IConfigurationService);
            const pythonPath = configService.getSettings(workspaceFolder).pythonPath;
            debugConfiguration.pythonPath = pythonPath;
        }
    }
};
BaseConfigurationProvider = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.unmanaged())
], BaseConfigurationProvider);
exports.BaseConfigurationProvider = BaseConfigurationProvider;
//# sourceMappingURL=baseProvider.js.map