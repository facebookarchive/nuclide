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
const fs = require("fs-extra");
const inversify_1 = require("inversify");
const _ = require("lodash");
const path = require("path");
const types_1 = require("../../../common/platform/types");
const types_2 = require("../../../common/types");
const types_3 = require("../../../ioc/types");
const contracts_1 = require("../../contracts");
const cacheableLocatorService_1 = require("./cacheableLocatorService");
const conda_1 = require("./conda");
// tslint:disable-next-line:variable-name
const DefaultPythonExecutable = 'python.exe';
// tslint:disable-next-line:variable-name
const CompaniesToIgnore = ['PYLAUNCHER'];
// tslint:disable-next-line:variable-name
const PythonCoreCompanyDisplayName = 'Python Software Foundation';
// tslint:disable-next-line:variable-name
const PythonCoreComany = 'PYTHONCORE';
let WindowsRegistryService = class WindowsRegistryService extends cacheableLocatorService_1.CacheableLocatorService {
    constructor(registry, is64Bit, serviceContainer) {
        super('WindowsRegistryService', serviceContainer);
        this.registry = registry;
        this.is64Bit = is64Bit;
    }
    // tslint:disable-next-line:no-empty
    dispose() { }
    getInterpretersImplementation(resource) {
        return this.getInterpretersFromRegistry();
    }
    getInterpretersFromRegistry() {
        return __awaiter(this, void 0, void 0, function* () {
            // https://github.com/python/peps/blob/master/pep-0514.txt#L357
            const hkcuArch = this.is64Bit ? undefined : types_1.Architecture.x86;
            const promises = [
                this.getCompanies(types_1.RegistryHive.HKCU, hkcuArch),
                this.getCompanies(types_1.RegistryHive.HKLM, types_1.Architecture.x86)
            ];
            // https://github.com/Microsoft/PTVS/blob/ebfc4ca8bab234d453f15ee426af3b208f3c143c/Python/Product/Cookiecutter/Shared/Interpreters/PythonRegistrySearch.cs#L44
            if (this.is64Bit) {
                promises.push(this.getCompanies(types_1.RegistryHive.HKLM, types_1.Architecture.x64));
            }
            const companies = yield Promise.all(promises);
            // tslint:disable-next-line:underscore-consistent-invocation
            const companyInterpreters = yield Promise.all(_.flatten(companies)
                .filter(item => item !== undefined && item !== null)
                .map(company => {
                return this.getInterpretersForCompany(company.companyKey, company.hive, company.arch);
            }));
            // tslint:disable-next-line:underscore-consistent-invocation
            return _.flatten(companyInterpreters)
                .filter(item => item !== undefined && item !== null)
                .map(item => item)
                .reduce((prev, current) => {
                if (prev.findIndex(item => item.path.toUpperCase() === current.path.toUpperCase()) === -1) {
                    prev.push(current);
                }
                return prev;
            }, []);
        });
    }
    getCompanies(hive, arch) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.registry.getKeys('\\Software\\Python', hive, arch)
                .then(companyKeys => companyKeys
                .filter(companyKey => CompaniesToIgnore.indexOf(path.basename(companyKey).toUpperCase()) === -1)
                .map(companyKey => {
                return { companyKey, hive, arch };
            }));
        });
    }
    getInterpretersForCompany(companyKey, hive, arch) {
        return __awaiter(this, void 0, void 0, function* () {
            const tagKeys = yield this.registry.getKeys(companyKey, hive, arch);
            return Promise.all(tagKeys.map(tagKey => this.getInreterpreterDetailsForCompany(tagKey, companyKey, hive, arch)));
        });
    }
    getInreterpreterDetailsForCompany(tagKey, companyKey, hive, arch) {
        const key = `${tagKey}\\InstallPath`;
        return this.registry.getValue(key, hive, arch)
            .then(installPath => {
            // Install path is mandatory.
            if (!installPath) {
                return Promise.resolve(null);
            }
            // Check if 'ExecutablePath' exists.
            // Remember Python 2.7 doesn't have 'ExecutablePath' (there could be others).
            // Treat all other values as optional.
            return Promise.all([
                Promise.resolve(installPath),
                this.registry.getValue(key, hive, arch, 'ExecutablePath'),
                // tslint:disable-next-line:no-non-null-assertion
                this.getInterpreterDisplayName(tagKey, companyKey, hive, arch),
                this.registry.getValue(tagKey, hive, arch, 'SysVersion'),
                this.getCompanyDisplayName(companyKey, hive, arch)
            ])
                .then(([installedPath, executablePath, displayName, version, companyDisplayName]) => {
                companyDisplayName = conda_1.AnacondaCompanyNames.indexOf(companyDisplayName) === -1 ? companyDisplayName : conda_1.AnacondaCompanyName;
                // tslint:disable-next-line:prefer-type-cast
                return { installPath: installedPath, executablePath, displayName, version, companyDisplayName };
            });
        })
            .then((interpreterInfo) => {
            if (!interpreterInfo) {
                return;
            }
            const executablePath = interpreterInfo.executablePath && interpreterInfo.executablePath.length > 0 ? interpreterInfo.executablePath : path.join(interpreterInfo.installPath, DefaultPythonExecutable);
            const displayName = interpreterInfo.displayName;
            const version = interpreterInfo.version ? path.basename(interpreterInfo.version) : path.basename(tagKey);
            // tslint:disable-next-line:prefer-type-cast
            return {
                architecture: arch,
                displayName,
                path: executablePath,
                version,
                companyDisplayName: interpreterInfo.companyDisplayName,
                type: contracts_1.InterpreterType.Unknown
            };
        })
            .then(interpreter => interpreter ? fs.pathExists(interpreter.path).catch(() => false).then(exists => exists ? interpreter : null) : null)
            .catch(error => {
            console.error(`Failed to retrieve interpreter details for company ${companyKey},tag: ${tagKey}, hive: ${hive}, arch: ${arch}`);
            console.error(error);
            return null;
        });
    }
    getInterpreterDisplayName(tagKey, companyKey, hive, arch) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = yield this.registry.getValue(tagKey, hive, arch, 'DisplayName');
            if (displayName && displayName.length > 0) {
                return displayName;
            }
        });
    }
    getCompanyDisplayName(companyKey, hive, arch) {
        return __awaiter(this, void 0, void 0, function* () {
            const displayName = yield this.registry.getValue(companyKey, hive, arch, 'DisplayName');
            if (displayName && displayName.length > 0) {
                return displayName;
            }
            const company = path.basename(companyKey);
            return company.toUpperCase() === PythonCoreComany ? PythonCoreCompanyDisplayName : company;
        });
    }
};
WindowsRegistryService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IRegistry)),
    __param(1, inversify_1.inject(types_2.Is64Bit)),
    __param(2, inversify_1.inject(types_3.IServiceContainer))
], WindowsRegistryService);
exports.WindowsRegistryService = WindowsRegistryService;
//# sourceMappingURL=windowsRegistryService.js.map