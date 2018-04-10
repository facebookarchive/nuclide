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
const types_1 = require("../../common/platform/types");
const types_2 = require("../../ioc/types");
const baseProvider_1 = require("./baseProvider");
let PythonV2DebugConfigurationProvider = class PythonV2DebugConfigurationProvider extends baseProvider_1.BaseConfigurationProvider {
    constructor(serviceContainer) {
        super('pythonExperimental', serviceContainer);
    }
    provideDefaults(workspaceFolder, debugConfiguration) {
        super.provideDefaults(workspaceFolder, debugConfiguration);
        debugConfiguration.stopOnEntry = false;
        if (debugConfiguration.console !== 'externalTerminal' && debugConfiguration.console !== 'integratedTerminal') {
            debugConfiguration.console = 'integratedTerminal';
        }
        // Add PTVSD specific flags.
        const ptvsdDebugConfigurationFlags = debugConfiguration;
        ptvsdDebugConfigurationFlags.redirectOutput = Array.isArray(debugConfiguration.debugOptions) && debugConfiguration.debugOptions.indexOf('RedirectOutput') >= 0;
        ptvsdDebugConfigurationFlags.fixFilePathCase = this.serviceContainer.get(types_1.IPlatformService).isWindows;
    }
};
PythonV2DebugConfigurationProvider = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer))
], PythonV2DebugConfigurationProvider);
exports.PythonV2DebugConfigurationProvider = PythonV2DebugConfigurationProvider;
//# sourceMappingURL=pythonV2Provider.js.map