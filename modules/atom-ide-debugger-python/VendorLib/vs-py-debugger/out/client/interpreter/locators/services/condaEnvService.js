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
const types_1 = require("../../../common/platform/types");
const types_2 = require("../../../common/types");
const types_3 = require("../../../ioc/types");
const contracts_1 = require("../../contracts");
const cacheableLocatorService_1 = require("./cacheableLocatorService");
const conda_1 = require("./conda");
const condaHelper_1 = require("./condaHelper");
let CondaEnvService = class CondaEnvService extends cacheableLocatorService_1.CacheableLocatorService {
    constructor(condaService, versionService, logger, serviceContainer, fileSystem) {
        super('CondaEnvService', serviceContainer);
        this.condaService = condaService;
        this.versionService = versionService;
        this.logger = logger;
        this.fileSystem = fileSystem;
        this.condaHelper = new condaHelper_1.CondaHelper();
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    parseCondaInfo(info) {
        return __awaiter(this, void 0, void 0, function* () {
            const condaDisplayName = this.condaHelper.getDisplayName(info);
            // The root of the conda environment is itself a Python interpreter
            // envs reported as e.g.: /Users/bob/miniconda3/envs/someEnv.
            const envs = Array.isArray(info.envs) ? info.envs : [];
            if (info.default_prefix && info.default_prefix.length > 0) {
                envs.push(info.default_prefix);
            }
            const promises = envs
                .map((envPath) => __awaiter(this, void 0, void 0, function* () {
                const pythonPath = this.condaService.getInterpreterPath(envPath);
                const existsPromise = pythonPath ? this.fileSystem.fileExistsAsync(pythonPath) : Promise.resolve(false);
                const versionPromise = this.versionService.getVersion(pythonPath, '');
                const [exists, version] = yield Promise.all([existsPromise, versionPromise]);
                if (!exists) {
                    return;
                }
                const versionWithoutCompanyName = this.stripCondaDisplayName(this.stripCompanyName(version), condaDisplayName);
                const displayName = `${condaDisplayName} ${versionWithoutCompanyName}`.trim();
                // tslint:disable-next-line:no-unnecessary-local-variable
                const interpreter = {
                    path: pythonPath,
                    displayName,
                    companyDisplayName: conda_1.AnacondaCompanyName,
                    type: contracts_1.InterpreterType.Conda,
                    envPath
                };
                return interpreter;
            }));
            return Promise.all(promises)
                .then(interpreters => interpreters.filter(interpreter => interpreter !== null && interpreter !== undefined))
                .then(interpreters => interpreters.map(interpreter => interpreter));
        });
    }
    getInterpretersImplementation(resource) {
        return this.getSuggestionsFromConda();
    }
    stripCompanyName(content) {
        // Strip company name from version.
        const startOfCompanyName = conda_1.AnacondaCompanyNames.reduce((index, companyName) => {
            if (index > 0) {
                return index;
            }
            return content.indexOf(`:: ${companyName}`);
        }, -1);
        return startOfCompanyName > 0 ? content.substring(0, startOfCompanyName).trim() : content;
    }
    stripCondaDisplayName(content, condaDisplayName) {
        // Strip company name from version.
        if (content.endsWith(condaDisplayName)) {
            let updatedContent = content.substr(0, content.indexOf(condaDisplayName)).trim();
            if (updatedContent.endsWith('::')) {
                updatedContent = updatedContent.substr(0, content.indexOf('::')).trim();
            }
            return updatedContent;
        }
        else {
            return content;
        }
    }
    getSuggestionsFromConda() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const info = yield this.condaService.getCondaInfo();
                if (!info) {
                    return [];
                }
                const interpreters = yield this.parseCondaInfo(info);
                const environments = yield this.condaService.getCondaEnvironments(true);
                if (Array.isArray(environments) && environments.length > 0) {
                    interpreters
                        .forEach(interpreter => {
                        const environment = environments.find(item => this.fileSystem.arePathsSame(item.path, interpreter.envPath));
                        if (environment) {
                            interpreter.envName = environment.name;
                            interpreter.displayName = `${interpreter.displayName} (${environment.name})`;
                        }
                    });
                }
                return interpreters;
            }
            catch (ex) {
                // Failed because either:
                //   1. conda is not installed.
                //   2. `conda info --json` has changed signature.
                //   3. output of `conda info --json` has changed in structure.
                // In all cases, we can't offer conda pythonPath suggestions.
                this.logger.logError('Failed to get Suggestions from conda', ex);
                return [];
            }
        });
    }
};
CondaEnvService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(contracts_1.ICondaService)),
    __param(1, inversify_1.inject(contracts_1.IInterpreterVersionService)),
    __param(2, inversify_1.inject(types_2.ILogger)),
    __param(3, inversify_1.inject(types_3.IServiceContainer)),
    __param(4, inversify_1.inject(types_1.IFileSystem))
], CondaEnvService);
exports.CondaEnvService = CondaEnvService;
//# sourceMappingURL=condaEnvService.js.map