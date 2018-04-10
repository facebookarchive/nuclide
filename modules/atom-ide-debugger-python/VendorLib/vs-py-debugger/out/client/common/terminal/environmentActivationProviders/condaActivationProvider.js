"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
const contracts_1 = require("../../../interpreter/contracts");
require("../../extensions");
const types_1 = require("../../platform/types");
const types_2 = require("../../types");
const types_3 = require("../types");
let CondaActivationCommandProvider = class CondaActivationCommandProvider {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    isShellSupported(_targetShell) {
        return true;
    }
    getActivationCommands(resource, targetShell) {
        return __awaiter(this, void 0, void 0, function* () {
            const condaService = this.serviceContainer.get(contracts_1.ICondaService);
            const pythonPath = this.serviceContainer.get(types_2.IConfigurationService).getSettings(resource).pythonPath;
            const envInfo = yield condaService.getCondaEnvironment(pythonPath);
            if (!envInfo) {
                return;
            }
            const isWindows = this.serviceContainer.get(types_1.IPlatformService).isWindows;
            if (targetShell === types_3.TerminalShellType.powershell || targetShell === types_3.TerminalShellType.powershellCore) {
                // https://github.com/conda/conda/issues/626
                return;
            }
            else if (targetShell === types_3.TerminalShellType.fish) {
                // https://github.com/conda/conda/blob/be8c08c083f4d5e05b06bd2689d2cd0d410c2ffe/shell/etc/fish/conf.d/conda.fish#L18-L28
                return [`conda activate ${envInfo.name.toCommandArgument()}`];
            }
            else if (isWindows) {
                return [`activate ${envInfo.name.toCommandArgument()}`];
            }
            else {
                return [`source activate ${envInfo.name.toCommandArgument()}`];
            }
        });
    }
};
CondaActivationCommandProvider = __decorate([
    inversify_1.injectable()
], CondaActivationCommandProvider);
exports.CondaActivationCommandProvider = CondaActivationCommandProvider;
//# sourceMappingURL=condaActivationProvider.js.map