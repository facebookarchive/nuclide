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
const semver_1 = require("semver");
const platform_1 = require("../../utils/platform");
const constants_1 = require("../common/constants");
const logger_1 = require("../common/logger");
const types_1 = require("../common/nuget/types");
const types_2 = require("../common/platform/types");
const types_3 = require("../common/types");
const types_4 = require("../ioc/types");
const platformData_1 = require("./platformData");
const downloadBaseFileName = 'Python-Language-Server';
exports.maxMajorVersion = 0;
exports.PackageNames = {
    [platformData_1.PlatformName.Windows32Bit]: `${downloadBaseFileName}-${platformData_1.PlatformName.Windows32Bit}`,
    [platformData_1.PlatformName.Windows64Bit]: `${downloadBaseFileName}-${platformData_1.PlatformName.Windows64Bit}`,
    [platformData_1.PlatformName.Linux64Bit]: `${downloadBaseFileName}-${platformData_1.PlatformName.Linux64Bit}`,
    [platformData_1.PlatformName.Mac64Bit]: `${downloadBaseFileName}-${platformData_1.PlatformName.Mac64Bit}`
};
let LanguageServerPackageService = class LanguageServerPackageService {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
        this.maxMajorVersion = exports.maxMajorVersion;
    }
    getNugetPackageName() {
        const plaform = this.serviceContainer.get(types_2.IPlatformService);
        switch (plaform.info.type) {
            case platform_1.OSType.Windows: {
                const is64Bit = plaform.info.architecture === platform_1.Architecture.x64;
                return exports.PackageNames[is64Bit ? platformData_1.PlatformName.Windows64Bit : platformData_1.PlatformName.Windows32Bit];
            }
            case platform_1.OSType.OSX: {
                return exports.PackageNames[platformData_1.PlatformName.Mac64Bit];
            }
            default: {
                return exports.PackageNames[platformData_1.PlatformName.Linux64Bit];
            }
        }
    }
    getLatestNugetPackageVersion() {
        return __awaiter(this, void 0, void 0, function* () {
            const downloadChannel = this.getLanguageServerDownloadChannel();
            const nugetRepo = this.serviceContainer.get(types_1.INugetRepository, downloadChannel);
            const nugetService = this.serviceContainer.get(types_1.INugetService);
            const packageName = this.getNugetPackageName();
            logger_1.log(`Listing packages for ${downloadChannel} for ${packageName}`);
            const packages = yield nugetRepo.getPackages(packageName);
            const validPackages = packages
                .filter(item => item.version.major === this.maxMajorVersion)
                .filter(item => nugetService.isReleaseVersion(item.version))
                .sort((a, b) => a.version.compare(b.version));
            return validPackages[validPackages.length - 1];
        });
    }
    getLanguageServerDownloadChannel() {
        const configService = this.serviceContainer.get(types_3.IConfigurationService);
        const settings = configService.getSettings();
        if (settings.analysis.downloadChannel) {
            return settings.analysis.downloadChannel;
        }
        const isAlphaVersion = this.isAlphaVersionOfExtension();
        return isAlphaVersion ? 'beta' : 'stable';
    }
    isAlphaVersionOfExtension() {
        const extensions = this.serviceContainer.get(types_3.IExtensions);
        const extension = extensions.getExtension(constants_1.PVSC_EXTENSION_ID);
        const version = semver_1.parse(extension.packageJSON.version);
        return version.prerelease === ['alpha'];
    }
};
__decorate([
    logger_1.log('Get latest language server nuget package version')
], LanguageServerPackageService.prototype, "getLatestNugetPackageVersion", null);
LanguageServerPackageService = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_4.IServiceContainer))
], LanguageServerPackageService);
exports.LanguageServerPackageService = LanguageServerPackageService;
//# sourceMappingURL=languageServerPackageService.js.map