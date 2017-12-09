"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Solution for auto-formatting borrowed from the "go" language VSCode extension.
const vscode = require("vscode");
const yapfFormatter_1 = require("./../formatters/yapfFormatter");
const autoPep8Formatter_1 = require("./../formatters/autoPep8Formatter");
function activateFormatOnSaveProvider(languageFilter, settings, outputChannel, workspaceRootPath) {
    let formatters = new Map();
    let pythonSettings = settings;
    let yapfFormatter = new yapfFormatter_1.YapfFormatter(outputChannel, settings, workspaceRootPath);
    let autoPep8 = new autoPep8Formatter_1.AutoPep8Formatter(outputChannel, settings, workspaceRootPath);
    formatters.set(yapfFormatter.Id, yapfFormatter);
    formatters.set(autoPep8.Id, autoPep8);
    return vscode.workspace.onWillSaveTextDocument(e => {
        const document = e.document;
        if (document.languageId !== languageFilter.language) {
            return;
        }
        let textEditor = vscode.window.activeTextEditor;
        let editorConfig = vscode.workspace.getConfiguration('editor');
        const globalEditorFormatOnSave = editorConfig && editorConfig.has('formatOnSave') && editorConfig.get('formatOnSave') === true;
        if ((pythonSettings.formatting.formatOnSave || globalEditorFormatOnSave) && textEditor.document === document) {
            let formatter = formatters.get(pythonSettings.formatting.provider);
            e.waitUntil(formatter.formatDocument(document, null, null));
        }
    }, null, null);
}
exports.activateFormatOnSaveProvider = activateFormatOnSaveProvider;
//# sourceMappingURL=formatOnSaveProvider.js.map