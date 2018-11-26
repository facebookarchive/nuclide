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
const types_1 = require("../common/platform/types");
const types_2 = require("../common/process/types");
const types_3 = require("../ioc/types");
let ExcutableValidator = class ExcutableValidator {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    /**
     * Checks the validity of the executable.
     * Do not use `<python> --version` as the output in 2.7 comes in stderr.
     * Check if either one of the following is true:
     * 1. Use `<python> -c print('1')` as the executable could python.
     * 2. Check if the executable file exists (in case of `spark-submit`)
     * @param {string} exePath
     * @returns {Promise<boolean>}
     * @memberof DebuggerExcutableValidator
     */
    validateExecutable(exePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const processFactory = this.serviceContainer.get(types_2.IProcessServiceFactory);
            const fs = this.serviceContainer.get(types_1.IFileSystem);
            const processService = yield processFactory.create();
            const [valid, execuableExists] = yield Promise.all([
                processService.exec(exePath, ['-c', 'print("1")'])
                    .then(output => output.stdout.trim() === '1')
                    .catch(() => false),
                fs.fileExists(exePath)
            ]);
            return valid || execuableExists;
        });
    }
};
ExcutableValidator = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_3.IServiceContainer))
], ExcutableValidator);
exports.ExcutableValidator = ExcutableValidator;
//# sourceMappingURL=executableValidator.js.map