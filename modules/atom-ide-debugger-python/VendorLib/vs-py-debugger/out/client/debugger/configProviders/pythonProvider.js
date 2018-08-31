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
const types_1 = require("../../ioc/types");
const Contracts_1 = require("../Common/Contracts");
const baseProvider_1 = require("./baseProvider");
const types_2 = require("./types");
let PythonDebugConfigurationProvider = class PythonDebugConfigurationProvider extends baseProvider_1.BaseConfigurationProvider {
    constructor(serviceContainer) {
        super('python', serviceContainer);
    }
    provideLaunchDefaults(workspaceFolder, debugConfiguration) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("provideLaunchDefaults").call(this, workspaceFolder, debugConfiguration);
            // Always redirect output.
            if (debugConfiguration.debugOptions.indexOf(Contracts_1.DebugOptions.RedirectOutput) === -1) {
                debugConfiguration.debugOptions.push(Contracts_1.DebugOptions.RedirectOutput);
            }
            if (debugConfiguration.debugOptions.indexOf(Contracts_1.DebugOptions.Pyramid) >= 0) {
                const utils = this.serviceContainer.get(types_2.IConfigurationProviderUtils);
                debugConfiguration.program = (yield utils.getPyramidStartupScriptFilePath(workspaceFolder));
            }
        });
    }
    provideAttachDefaults(workspaceFolder, debugConfiguration) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("provideAttachDefaults").call(this, workspaceFolder, debugConfiguration);
            const debugOptions = debugConfiguration.debugOptions;
            // Always redirect output.
            if (debugOptions.indexOf(Contracts_1.DebugOptions.RedirectOutput) === -1) {
                debugOptions.push(Contracts_1.DebugOptions.RedirectOutput);
            }
            if (!debugConfiguration.localRoot && workspaceFolder) {
                debugConfiguration.localRoot = workspaceFolder.fsPath;
            }
        });
    }
};
PythonDebugConfigurationProvider = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IServiceContainer))
], PythonDebugConfigurationProvider);
exports.PythonDebugConfigurationProvider = PythonDebugConfigurationProvider;
//# sourceMappingURL=pythonProvider.js.map