"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
exports.IOutputChannel = Symbol('IOutputChannel');
exports.IDocumentSymbolProvider = Symbol('IDocumentSymbolProvider');
exports.IsWindows = Symbol('IS_WINDOWS');
exports.Is64Bit = Symbol('Is64Bit');
exports.IDisposableRegistry = Symbol('IDiposableRegistry');
exports.IMemento = Symbol('IGlobalMemento');
exports.GLOBAL_MEMENTO = Symbol('IGlobalMemento');
exports.WORKSPACE_MEMENTO = Symbol('IWorkspaceMemento');
exports.IPersistentStateFactory = Symbol('IPersistentStateFactory');
exports.ILogger = Symbol('ILogger');
var InstallerResponse;
(function (InstallerResponse) {
    InstallerResponse[InstallerResponse["Installed"] = 0] = "Installed";
    InstallerResponse[InstallerResponse["Disabled"] = 1] = "Disabled";
    InstallerResponse[InstallerResponse["Ignore"] = 2] = "Ignore";
})(InstallerResponse = exports.InstallerResponse || (exports.InstallerResponse = {}));
var Product;
(function (Product) {
    Product[Product["pytest"] = 1] = "pytest";
    Product[Product["nosetest"] = 2] = "nosetest";
    Product[Product["pylint"] = 3] = "pylint";
    Product[Product["flake8"] = 4] = "flake8";
    Product[Product["pep8"] = 5] = "pep8";
    Product[Product["pylama"] = 6] = "pylama";
    Product[Product["prospector"] = 7] = "prospector";
    Product[Product["pydocstyle"] = 8] = "pydocstyle";
    Product[Product["yapf"] = 9] = "yapf";
    Product[Product["autopep8"] = 10] = "autopep8";
    Product[Product["mypy"] = 11] = "mypy";
    Product[Product["unittest"] = 12] = "unittest";
    Product[Product["ctags"] = 13] = "ctags";
    Product[Product["rope"] = 14] = "rope";
    Product[Product["isort"] = 15] = "isort";
})(Product = exports.Product || (exports.Product = {}));
var ModuleNamePurpose;
(function (ModuleNamePurpose) {
    ModuleNamePurpose[ModuleNamePurpose["install"] = 1] = "install";
    ModuleNamePurpose[ModuleNamePurpose["run"] = 2] = "run";
})(ModuleNamePurpose = exports.ModuleNamePurpose || (exports.ModuleNamePurpose = {}));
exports.IInstaller = Symbol('IInstaller');
exports.IPathUtils = Symbol('IPathUtils');
exports.ICurrentProcess = Symbol('ICurrentProcess');
exports.IConfigurationService = Symbol('IConfigurationService');
exports.ISocketServer = Symbol('ISocketServer');
//# sourceMappingURL=types.js.map