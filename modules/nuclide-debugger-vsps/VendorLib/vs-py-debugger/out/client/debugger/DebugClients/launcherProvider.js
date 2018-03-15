"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
class NoDebugLauncherScriptProvider {
    getLauncherFilePath() {
        return path.join(path.dirname(__dirname), '..', '..', '..', 'pythonFiles', 'PythonTools', 'visualstudio_py_launcher_nodebug.py');
    }
}
exports.NoDebugLauncherScriptProvider = NoDebugLauncherScriptProvider;
class DebuggerLauncherScriptProvider {
    getLauncherFilePath() {
        return path.join(path.dirname(__dirname), '..', '..', '..', 'pythonFiles', 'PythonTools', 'visualstudio_py_launcher.py');
    }
}
exports.DebuggerLauncherScriptProvider = DebuggerLauncherScriptProvider;
class DebuggerV2LauncherScriptProvider {
    getLauncherFilePath() {
        return path.join(path.dirname(__dirname), '..', '..', '..', 'pythonFiles', 'experimental', 'ptvsd_launcher.py');
    }
}
exports.DebuggerV2LauncherScriptProvider = DebuggerV2LauncherScriptProvider;
//# sourceMappingURL=launcherProvider.js.map