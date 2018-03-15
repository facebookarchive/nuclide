"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
var Architecture;
(function (Architecture) {
    Architecture[Architecture["Unknown"] = 1] = "Unknown";
    Architecture[Architecture["x86"] = 2] = "x86";
    Architecture[Architecture["x64"] = 3] = "x64";
})(Architecture = exports.Architecture || (exports.Architecture = {}));
var RegistryHive;
(function (RegistryHive) {
    RegistryHive[RegistryHive["HKCU"] = 0] = "HKCU";
    RegistryHive[RegistryHive["HKLM"] = 1] = "HKLM";
})(RegistryHive = exports.RegistryHive || (exports.RegistryHive = {}));
exports.IRegistry = Symbol('IRegistry');
exports.IPlatformService = Symbol('IPlatformService');
exports.IFileSystem = Symbol('IFileSystem');
//# sourceMappingURL=types.js.map