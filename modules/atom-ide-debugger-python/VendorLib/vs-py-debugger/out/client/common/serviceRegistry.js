"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const applicationEnvironment_1 = require("./application/applicationEnvironment");
const applicationShell_1 = require("./application/applicationShell");
const commandManager_1 = require("./application/commandManager");
const debugService_1 = require("./application/debugService");
const documentManager_1 = require("./application/documentManager");
const terminalManager_1 = require("./application/terminalManager");
const types_1 = require("./application/types");
const workspace_1 = require("./application/workspace");
const service_1 = require("./configuration/service");
const productInstaller_1 = require("./installer/productInstaller");
const logger_1 = require("./logger");
const browser_1 = require("./net/browser");
const persistentState_1 = require("./persistentState");
const constants_1 = require("./platform/constants");
const pathUtils_1 = require("./platform/pathUtils");
const currentProcess_1 = require("./process/currentProcess");
const bash_1 = require("./terminal/environmentActivationProviders/bash");
const commandPrompt_1 = require("./terminal/environmentActivationProviders/commandPrompt");
const factory_1 = require("./terminal/factory");
const helper_1 = require("./terminal/helper");
const types_2 = require("./terminal/types");
const types_3 = require("./types");
function registerTypes(serviceManager) {
    serviceManager.addSingletonInstance(types_3.IsWindows, constants_1.IS_WINDOWS);
    serviceManager.addSingletonInstance(types_3.Is64Bit, constants_1.IS_64_BIT);
    serviceManager.addSingleton(types_3.IPersistentStateFactory, persistentState_1.PersistentStateFactory);
    serviceManager.addSingleton(types_3.ILogger, logger_1.Logger);
    serviceManager.addSingleton(types_2.ITerminalServiceFactory, factory_1.TerminalServiceFactory);
    serviceManager.addSingleton(types_3.IPathUtils, pathUtils_1.PathUtils);
    serviceManager.addSingleton(types_1.IApplicationShell, applicationShell_1.ApplicationShell);
    serviceManager.addSingleton(types_3.ICurrentProcess, currentProcess_1.CurrentProcess);
    serviceManager.addSingleton(types_3.IInstaller, productInstaller_1.ProductInstaller);
    serviceManager.addSingleton(types_1.ICommandManager, commandManager_1.CommandManager);
    serviceManager.addSingleton(types_3.IConfigurationService, service_1.ConfigurationService);
    serviceManager.addSingleton(types_1.IWorkspaceService, workspace_1.WorkspaceService);
    serviceManager.addSingleton(types_1.IDocumentManager, documentManager_1.DocumentManager);
    serviceManager.addSingleton(types_1.ITerminalManager, terminalManager_1.TerminalManager);
    serviceManager.addSingleton(types_1.IDebugService, debugService_1.DebugService);
    serviceManager.addSingleton(types_1.IApplicationEnvironment, applicationEnvironment_1.ApplicationEnvironment);
    serviceManager.addSingleton(types_3.IBrowserService, browser_1.BrowserService);
    serviceManager.addSingleton(types_2.ITerminalHelper, helper_1.TerminalHelper);
    serviceManager.addSingleton(types_2.ITerminalActivationCommandProvider, bash_1.Bash, 'bashCShellFish');
    serviceManager.addSingleton(types_2.ITerminalActivationCommandProvider, commandPrompt_1.CommandPromptAndPowerShell, 'commandPromptAndPowerShell');
}
exports.registerTypes = registerTypes;
//# sourceMappingURL=serviceRegistry.js.map