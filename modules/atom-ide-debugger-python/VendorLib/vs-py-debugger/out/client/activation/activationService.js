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
const types_1 = require("../common/application/types");
const constants_1 = require("../common/constants");
require("../common/extensions");
const types_2 = require("../common/types");
const types_3 = require("../ioc/types");
const types_4 = require("./types");
const jediEnabledSetting = 'jediEnabled';
let ExtensionActivationService = class ExtensionActivationService {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
        this.workspaceService = this.serviceContainer.get(types_1.IWorkspaceService);
        this.output = this.serviceContainer.get(types_2.IOutputChannel, constants_1.STANDARD_OUTPUT_CHANNEL);
        this.appShell = this.serviceContainer.get(types_1.IApplicationShell);
        const disposables = serviceContainer.get(types_2.IDisposableRegistry);
        disposables.push(this);
        disposables.push(this.workspaceService.onDidChangeConfiguration(this.onDidChangeConfiguration.bind(this)));
    }
    activate() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.currentActivator) {
                return;
            }
            const jedi = this.useJedi();
            const engineName = jedi ? 'Jedi Python language engine' : 'Microsoft Python language server';
            this.output.appendLine(`Starting ${engineName}.`);
            const activatorName = jedi ? types_4.ExtensionActivators.Jedi : types_4.ExtensionActivators.DotNet;
            const activator = this.serviceContainer.get(types_4.IExtensionActivator, activatorName);
            this.currentActivator = { jedi, activator };
            yield activator.activate();
        });
    }
    dispose() {
        if (this.currentActivator) {
            this.currentActivator.activator.deactivate().ignoreErrors();
        }
    }
    onDidChangeConfiguration(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const workspacesUris = this.workspaceService.hasWorkspaceFolders ? this.workspaceService.workspaceFolders.map(workspace => workspace.uri) : [undefined];
            if (workspacesUris.findIndex(uri => event.affectsConfiguration(`python.${jediEnabledSetting}`, uri)) === -1) {
                return;
            }
            const jedi = this.useJedi();
            if (this.currentActivator && this.currentActivator.jedi === jedi) {
                return;
            }
            const item = yield this.appShell.showInformationMessage('Please reload the window switching between language engines.', 'Reload');
            if (item === 'Reload') {
                this.serviceContainer.get(types_1.ICommandManager).executeCommand('workbench.action.reloadWindow');
            }
        });
    }
    useJedi() {
        const workspacesUris = this.workspaceService.hasWorkspaceFolders ? this.workspaceService.workspaceFolders.map(item => item.uri) : [undefined];
        const configuraionService = this.serviceContainer.get(types_2.IConfigurationService);
        const jediEnabledForAnyWorkspace = workspacesUris.filter(uri => configuraionService.getSettings(uri).jediEnabled).length > 0;
        return !constants_1.isLanguageServerTest() && jediEnabledForAnyWorkspace;
    }
};
ExtensionActivationService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_3.IServiceContainer))
], ExtensionActivationService);
exports.ExtensionActivationService = ExtensionActivationService;
//# sourceMappingURL=activationService.js.map