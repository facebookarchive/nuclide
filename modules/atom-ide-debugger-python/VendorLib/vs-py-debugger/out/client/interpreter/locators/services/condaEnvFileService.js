"use strict";
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
const path = require("path");
const types_1 = require("../../../common/platform/types");
const types_2 = require("../../../common/types");
const types_3 = require("../../../ioc/types");
const contracts_1 = require("../../contracts");
const cacheableLocatorService_1 = require("./cacheableLocatorService");
const conda_1 = require("./conda");
let CondaEnvFileService = class CondaEnvFileService extends cacheableLocatorService_1.CacheableLocatorService {
    constructor(versionService, condaService, fileSystem, serviceContainer, logger) {
        super('CondaEnvFileService', serviceContainer);
        this.versionService = versionService;
        this.condaService = condaService;
        this.fileSystem = fileSystem;
        this.logger = logger;
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getInterpretersImplementation(resource) {
        return this.getSuggestionsFromConda();
    }
    getSuggestionsFromConda() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.condaService.condaEnvironmentsFile) {
                return [];
            }
            return this.fileSystem.fileExistsAsync(this.condaService.condaEnvironmentsFile)
                .then(exists => exists ? this.getEnvironmentsFromFile(this.condaService.condaEnvironmentsFile) : Promise.resolve([]));
        });
    }
    getEnvironmentsFromFile(envFile) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const fileContents = yield this.fileSystem.readFile(envFile);
                const environmentPaths = fileContents.split(/\r?\n/g)
                    .map(environmentPath => environmentPath.trim())
                    .filter(environmentPath => environmentPath.length > 0);
                const interpreters = (yield Promise.all(environmentPaths
                    .map(environmentPath => this.getInterpreterDetails(environmentPath))))
                    .filter(item => !!item)
                    .map(item => item);
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
            catch (err) {
                this.logger.logError('Python Extension (getEnvironmentsFromFile.readFile):', err);
                // Ignore errors in reading the file.
                return [];
            }
        });
    }
    getInterpreterDetails(environmentPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const interpreter = this.condaService.getInterpreterPath(environmentPath);
            if (!interpreter || !(yield this.fileSystem.fileExistsAsync(interpreter))) {
                return;
            }
            const version = yield this.versionService.getVersion(interpreter, path.basename(interpreter));
            const versionWithoutCompanyName = this.stripCompanyName(version);
            return {
                displayName: `${conda_1.AnacondaDisplayName} ${versionWithoutCompanyName}`,
                path: interpreter,
                companyDisplayName: conda_1.AnacondaCompanyName,
                version: version,
                type: contracts_1.InterpreterType.Conda,
                envPath: environmentPath
            };
        });
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
};
CondaEnvFileService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(contracts_1.IInterpreterVersionService)),
    __param(1, inversify_1.inject(contracts_1.ICondaService)),
    __param(2, inversify_1.inject(types_1.IFileSystem)),
    __param(3, inversify_1.inject(types_3.IServiceContainer)),
    __param(4, inversify_1.inject(types_2.ILogger))
], CondaEnvFileService);
exports.CondaEnvFileService = CondaEnvFileService;
//# sourceMappingURL=condaEnvFileService.js.map