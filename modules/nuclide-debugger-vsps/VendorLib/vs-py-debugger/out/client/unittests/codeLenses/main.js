"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants = require("../../common/constants");
const testFiles_1 = require("./testFiles");
function activateCodeLenses(onDidChange, symboldProvider) {
    const disposables = [];
    disposables.push(vscode.languages.registerCodeLensProvider(constants.PythonLanguage, new testFiles_1.TestFileCodeLensProvider(onDidChange, symboldProvider)));
    return {
        dispose: function () {
            disposables.forEach(d => d.dispose());
        }
    };
}
exports.activateCodeLenses = activateCodeLenses;
//# sourceMappingURL=main.js.map