"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const path_1 = require("path");
const configSettings_1 = require("./common/configSettings");
function activateSingleFileDebug() {
    return vscode.commands.registerCommand('python.python-debug.startSession', config => {
        if (!config.request) {
            config.type = 'python';
            config.name = 'Launch';
            config.request = 'launch';
            config.pythonPath = configSettings_1.PythonSettings.getInstance().pythonPath;
            config.debugOptions = [
                "WaitOnAbnormalExit",
                "WaitOnNormalExit",
                "RedirectOutput"
            ];
            config.stopOnEntry = true;
            config.module = '';
            config.args = [];
            config.console = "none";
            config.exceptionHandling = [];
            config.env = {};
            if (vscode.workspace.rootPath) {
                config.cwd = vscode.workspace.rootPath;
            }
            if (!config.program) {
                const editor = vscode.window.activeTextEditor;
                if (editor && editor.document.languageId === 'python') {
                    config.program = editor.document.fileName;
                }
            }
            if (!config.cwd && config.program) {
                // fall back if 'cwd' not known: derive it from 'program'
                config.cwd = path_1.dirname(config.program);
            }
            if (vscode.workspace && vscode.workspace.rootPath) {
                config.envFile = path_1.join(vscode.workspace.rootPath, '.env');
            }
            if (!config.envFile && typeof config.cwd === 'string' && config.cwd.lengths > 0) {
                config.envFile = path_1.join(config.cwd, '.env');
            }
        }
        vscode.commands.executeCommand('vscode.startDebug', config);
    });
}
exports.activateSingleFileDebug = activateSingleFileDebug;
//# sourceMappingURL=singleFileDebug.js.map