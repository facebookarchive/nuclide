// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const os_1 = require("os");
const constants_1 = require("./constants");
let PlatformService = class PlatformService {
    constructor() {
        this._isWindows = /^win/.test(process.platform);
        this._isMac = /^darwin/.test(process.platform);
    }
    get isWindows() {
        return this._isWindows;
    }
    get isMac() {
        return this._isMac;
    }
    get isLinux() {
        return !(this.isWindows || this.isMac);
    }
    get is64bit() {
        return os_1.arch() === 'x64';
    }
    get pathVariableName() {
        return this.isWindows ? constants_1.WINDOWS_PATH_VARIABLE_NAME : constants_1.NON_WINDOWS_PATH_VARIABLE_NAME;
    }
    get virtualEnvBinName() {
        return this.isWindows ? 'scripts' : 'bin';
    }
};
PlatformService = __decorate([
    inversify_1.injectable()
], PlatformService);
exports.PlatformService = PlatformService;
//# sourceMappingURL=platformService.js.map