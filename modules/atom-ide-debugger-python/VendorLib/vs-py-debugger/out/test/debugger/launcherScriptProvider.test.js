"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs = require("fs");
const path = require("path");
const launcherProvider_1 = require("../../client/debugger/DebugClients/launcherProvider");
suite('Debugger - Launcher Script Provider', () => {
    test('Ensure stable debugger gets the old launcher from PythonTools directory', () => {
        const launcherPath = new launcherProvider_1.DebuggerLauncherScriptProvider().getLauncherFilePath();
        const expectedPath = path.join(path.dirname(__dirname), '..', '..', 'pythonFiles', 'PythonTools', 'visualstudio_py_launcher.py');
        chai_1.expect(launcherPath).to.be.equal(expectedPath);
        chai_1.expect(fs.existsSync(launcherPath)).to.be.equal(true, 'file does not exist');
    });
    test('Ensure stable debugger when not debugging gets the non debnug launcher from PythonTools directory', () => {
        const launcherPath = new launcherProvider_1.NoDebugLauncherScriptProvider().getLauncherFilePath();
        const expectedPath = path.join(path.dirname(__dirname), '..', '..', 'pythonFiles', 'PythonTools', 'visualstudio_py_launcher_nodebug.py');
        chai_1.expect(launcherPath).to.be.equal(expectedPath);
        chai_1.expect(fs.existsSync(launcherPath)).to.be.equal(true, 'file does not exist');
    });
});
//# sourceMappingURL=launcherScriptProvider.test.js.map