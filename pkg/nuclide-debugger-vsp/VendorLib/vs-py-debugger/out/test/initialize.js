"use strict";
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
//First thing to be executed
process.env['PYTHON_DONJAYAMANNE_TEST'] = "1";
// The module 'assert' provides assertion methods from node
const assert = require("assert");
const fs = require("fs");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const vscode = require("vscode");
const path = require("path");
let dummyPythonFile = path.join(__dirname, "..", "..", "src", "test", "pythonFiles", "dummy.py");
function initialize() {
    return new Promise((resolve, reject) => {
        vscode.workspace.openTextDocument(dummyPythonFile).then(resolve, reject);
    });
}
exports.initialize = initialize;
function closeActiveWindows() {
    return __awaiter(this, void 0, void 0, function* () {
        // https://github.com/Microsoft/vscode/blob/master/extensions/vscode-api-tests/src/utils.ts
        return new Promise((c, e) => {
            if (vscode.window.visibleTextEditors.length === 0) {
                return c();
            }
            // TODO: the visibleTextEditors variable doesn't seem to be
            // up to date after a onDidChangeActiveTextEditor event, not
            // even using a setTimeout 0... so we MUST poll :(
            let interval = setInterval(() => {
                if (vscode.window.visibleTextEditors.length > 0) {
                    return;
                }
                clearInterval(interval);
                c();
            }, 10);
            setTimeout(() => {
                if (vscode.window.visibleTextEditors.length === 0) {
                    return c();
                }
                vscode.commands.executeCommand('workbench.action.closeAllEditors')
                    .then(() => null, (err) => {
                    clearInterval(interval);
                    //e(err);
                    c();
                });
            }, 50);
        }).then(() => {
            assert.equal(vscode.window.visibleTextEditors.length, 0);
            // assert(!vscode.window.activeTextEditor);
        });
    });
}
exports.closeActiveWindows = closeActiveWindows;
exports.IS_TRAVIS = (process.env['TRAVIS'] + '') === 'true';
exports.TEST_TIMEOUT = 25000;
function getPythonPath() {
    const pythonPaths = ['/home/travis/virtualenv/python3.5.2/bin/python',
        '/Users/travis/.pyenv/versions/3.5.1/envs/MYVERSION/bin/python',
        '/Users/donjayamanne/Projects/PythonEnvs/p361/bin/python',
        '/Users/donjayamanne/Projects/PythonEnvs/p27/bin/python'];
    for (let counter = 0; counter < pythonPaths.length; counter++) {
        if (fs.existsSync(pythonPaths[counter])) {
            return pythonPaths[counter];
        }
    }
    return 'python';
}
// export const PYTHON_PATH = IS_TRAVIS ? getPythonPath() : 'python';
exports.PYTHON_PATH = getPythonPath();
function setPythonExecutable(pythonSettings) {
    pythonSettings.pythonPath = exports.PYTHON_PATH;
    return vscode.workspace.onDidChangeConfiguration(() => {
        pythonSettings.pythonPath = exports.PYTHON_PATH;
    });
}
exports.setPythonExecutable = setPythonExecutable;
//# sourceMappingURL=initialize.js.map