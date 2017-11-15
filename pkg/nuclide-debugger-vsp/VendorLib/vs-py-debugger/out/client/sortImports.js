'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const sortProvider = require("./providers/importSortProvider");
const os = require("os");
function activate(context, outChannel) {
    let rootDir = context.asAbsolutePath('.');
    let disposable = vscode.commands.registerCommand('python.sortImports', () => {
        let activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || activeEditor.document.languageId !== 'python') {
            vscode.window.showErrorMessage('Please open a Python source file to sort the imports.');
            return Promise.resolve();
        }
        if (activeEditor.document.lineCount <= 1) {
            return Promise.resolve();
        }
        // Hack, if the document doesn't contain an empty line at the end, then add it
        // Else the library strips off the last line
        const lastLine = activeEditor.document.lineAt(activeEditor.document.lineCount - 1);
        let emptyLineAdded = Promise.resolve(true);
        if (lastLine.text.trim().length > 0) {
            emptyLineAdded = new Promise((resolve, reject) => {
                activeEditor.edit(builder => {
                    builder.insert(lastLine.range.end, os.EOL);
                }).then(resolve, reject);
            });
        }
        return emptyLineAdded.then(() => {
            return new sortProvider.PythonImportSortProvider().sortImports(rootDir, activeEditor.document);
        }).then(changes => {
            if (changes.length === 0) {
                return;
            }
            return activeEditor.edit(builder => {
                changes.forEach(change => builder.replace(change.range, change.newText));
            });
        }).catch(error => {
            let message = typeof error === 'string' ? error : (error.message ? error.message : error);
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage(message);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=sortImports.js.map