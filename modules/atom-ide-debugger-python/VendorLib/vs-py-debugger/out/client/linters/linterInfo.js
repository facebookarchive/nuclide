"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class LinterInfo {
    constructor(product, id, configService, configFileNames = []) {
        this.configService = configService;
        this._product = product;
        this._id = id;
        this._configFileNames = configFileNames;
    }
    get id() {
        return this._id;
    }
    get product() {
        return this._product;
    }
    get pathSettingName() {
        return `${this.id}Path`;
    }
    get argsSettingName() {
        return `${this.id}Args`;
    }
    get enabledSettingName() {
        return `${this.id}Enabled`;
    }
    get configFileNames() {
        return this._configFileNames;
    }
    enableAsync(enabled, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.configService.updateSettingAsync(`linting.${this.enabledSettingName}`, enabled, resource);
        });
    }
    isEnabled(resource) {
        const settings = this.configService.getSettings(resource);
        return settings.linting[this.enabledSettingName];
    }
    pathName(resource) {
        const settings = this.configService.getSettings(resource);
        return settings.linting[this.pathSettingName];
    }
    linterArgs(resource) {
        const settings = this.configService.getSettings(resource);
        const args = settings.linting[this.argsSettingName];
        return Array.isArray(args) ? args : [];
    }
    getExecutionInfo(customArgs, resource) {
        const execPath = this.pathName(resource);
        const args = this.linterArgs(resource).concat(customArgs);
        let moduleName;
        // If path information is not available, then treat it as a module,
        if (path.basename(execPath) === execPath) {
            moduleName = execPath;
        }
        return { execPath, moduleName, args, product: this.product };
    }
}
exports.LinterInfo = LinterInfo;
//# sourceMappingURL=linterInfo.js.map