// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const channelManager_1 = require("./channelManager");
const condaInstaller_1 = require("./condaInstaller");
const pipEnvInstaller_1 = require("./pipEnvInstaller");
const pipInstaller_1 = require("./pipInstaller");
const types_1 = require("./types");
function registerTypes(serviceManager) {
    serviceManager.addSingleton(types_1.IModuleInstaller, condaInstaller_1.CondaInstaller);
    serviceManager.addSingleton(types_1.IModuleInstaller, pipInstaller_1.PipInstaller);
    serviceManager.addSingleton(types_1.IModuleInstaller, pipEnvInstaller_1.PipEnvInstaller);
    serviceManager.addSingleton(types_1.IInstallationChannelManager, channelManager_1.InstallationChannelManager);
}
exports.registerTypes = registerTypes;
//# sourceMappingURL=serviceRegistry.js.map