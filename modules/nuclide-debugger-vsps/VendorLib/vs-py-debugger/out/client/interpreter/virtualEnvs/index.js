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
const types_1 = require("../../common/process/types");
const types_2 = require("../../ioc/types");
let VirtualEnvironmentManager = class VirtualEnvironmentManager {
    constructor(serviceContainer) {
        this.processService = serviceContainer.get(types_1.IProcessService);
    }
    getEnvironmentName(pythonPath) {
        return __awaiter(this, void 0, void 0, function* () {
            // https://stackoverflow.com/questions/1871549/determine-if-python-is-running-inside-virtualenv
            // hasattr(sys, 'real_prefix') works for virtualenv while
            // '(hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix))' works for venv
            const code = 'import sys\nif hasattr(sys, "real_prefix"):\n  print("virtualenv")\nelif hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix:\n  print("venv")';
            const output = yield this.processService.exec(pythonPath, ['-c', code]);
            if (output.stdout.length > 0) {
                return output.stdout.trim();
            }
            return '';
        });
    }
};
VirtualEnvironmentManager = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer))
], VirtualEnvironmentManager);
exports.VirtualEnvironmentManager = VirtualEnvironmentManager;
//# sourceMappingURL=index.js.map