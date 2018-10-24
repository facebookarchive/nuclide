"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
const nls = require("vscode-nls");
const errors_1 = require("vscode-chrome-debug-core/out/src/errors");
const localize = nls.loadMessageBundle(__filename);
function runtimeNotFound(_runtime) {
    return new errors_1.ErrorWithMessage({
        id: 2001,
        format: localize(0, null, '{_runtime}'),
        variables: { _runtime }
    });
}
exports.runtimeNotFound = runtimeNotFound;
function cannotLaunchInTerminal(_error) {
    return new errors_1.ErrorWithMessage({
        id: 2011,
        format: localize(1, null, '{_error}'),
        variables: { _error }
    });
}
exports.cannotLaunchInTerminal = cannotLaunchInTerminal;
function cannotLaunchDebugTarget(_error) {
    return new errors_1.ErrorWithMessage({
        id: 2017,
        format: localize(2, null, '{_error}'),
        variables: { _error },
        showUser: true,
        sendTelemetry: true
    });
}
exports.cannotLaunchDebugTarget = cannotLaunchDebugTarget;
function unknownConsoleType(consoleType) {
    return new errors_1.ErrorWithMessage({
        id: 2028,
        format: localize(3, null, consoleType)
    });
}
exports.unknownConsoleType = unknownConsoleType;
function cannotLaunchBecauseSourceMaps(programPath) {
    return new errors_1.ErrorWithMessage({
        id: 2002,
        format: localize(4, null, '{path}'),
        variables: { path: programPath }
    });
}
exports.cannotLaunchBecauseSourceMaps = cannotLaunchBecauseSourceMaps;
function cannotLaunchBecauseOutFiles(programPath) {
    return new errors_1.ErrorWithMessage({
        id: 2003,
        format: localize(5, null, '{path}', 'outFiles'),
        variables: { path: programPath }
    });
}
exports.cannotLaunchBecauseOutFiles = cannotLaunchBecauseOutFiles;
function cannotLaunchBecauseJsNotFound(programPath) {
    return new errors_1.ErrorWithMessage({
        id: 2009,
        format: localize(6, null, '{path}'),
        variables: { path: programPath }
    });
}
exports.cannotLaunchBecauseJsNotFound = cannotLaunchBecauseJsNotFound;
function cannotLoadEnvVarsFromFile(error) {
    return new errors_1.ErrorWithMessage({
        id: 2029,
        format: localize(7, null, '{_error}'),
        variables: { _error: error }
    });
}
exports.cannotLoadEnvVarsFromFile = cannotLoadEnvVarsFromFile;

//# sourceMappingURL=errors.js.map
