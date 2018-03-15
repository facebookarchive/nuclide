"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
var TerminalShellType;
(function (TerminalShellType) {
    TerminalShellType[TerminalShellType["powershell"] = 1] = "powershell";
    TerminalShellType[TerminalShellType["powershellCore"] = 2] = "powershellCore";
    TerminalShellType[TerminalShellType["commandPrompt"] = 3] = "commandPrompt";
    TerminalShellType[TerminalShellType["bash"] = 4] = "bash";
    TerminalShellType[TerminalShellType["fish"] = 5] = "fish";
    TerminalShellType[TerminalShellType["cshell"] = 6] = "cshell";
    TerminalShellType[TerminalShellType["other"] = 7] = "other";
})(TerminalShellType = exports.TerminalShellType || (exports.TerminalShellType = {}));
exports.ITerminalServiceFactory = Symbol('ITerminalServiceFactory');
exports.ITerminalHelper = Symbol('ITerminalHelper');
exports.ITerminalActivationCommandProvider = Symbol('ITerminalActivationCommandProvider');
//# sourceMappingURL=types.js.map