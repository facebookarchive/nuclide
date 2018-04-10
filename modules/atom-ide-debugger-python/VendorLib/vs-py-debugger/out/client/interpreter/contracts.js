"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERPRETER_LOCATOR_SERVICE = 'IInterpreterLocatorService';
exports.WINDOWS_REGISTRY_SERVICE = 'WindowsRegistryService';
exports.CONDA_ENV_FILE_SERVICE = 'CondaEnvFileService';
exports.CONDA_ENV_SERVICE = 'CondaEnvService';
exports.CURRENT_PATH_SERVICE = 'CurrentPathService';
exports.KNOWN_PATH_SERVICE = 'KnownPathsService';
exports.GLOBAL_VIRTUAL_ENV_SERVICE = 'VirtualEnvService';
exports.WORKSPACE_VIRTUAL_ENV_SERVICE = 'WorkspaceVirtualEnvService';
exports.PIPENV_SERVICE = 'PipEnvService';
exports.IInterpreterVersionService = Symbol('IInterpreterVersionService');
exports.IKnownSearchPathsForInterpreters = Symbol('IKnownSearchPathsForInterpreters');
exports.IVirtualEnvironmentsSearchPathProvider = Symbol('IVirtualEnvironmentsSearchPathProvider');
exports.IInterpreterLocatorService = Symbol('IInterpreterLocatorService');
exports.ICondaService = Symbol('ICondaService');
var InterpreterType;
(function (InterpreterType) {
    InterpreterType[InterpreterType["Unknown"] = 1] = "Unknown";
    InterpreterType[InterpreterType["Conda"] = 2] = "Conda";
    InterpreterType[InterpreterType["VirtualEnv"] = 4] = "VirtualEnv";
})(InterpreterType = exports.InterpreterType || (exports.InterpreterType = {}));
exports.IInterpreterService = Symbol('IInterpreterService');
exports.IInterpreterDisplay = Symbol('IInterpreterDisplay');
exports.IShebangCodeLensProvider = Symbol('IShebangCodeLensProvider');
exports.IInterpreterHelper = Symbol('IInterpreterHelper');
//# sourceMappingURL=contracts.js.map