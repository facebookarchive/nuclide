// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:max-classes-per-file
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
//# sourceMappingURL=launcherProvider.js.map