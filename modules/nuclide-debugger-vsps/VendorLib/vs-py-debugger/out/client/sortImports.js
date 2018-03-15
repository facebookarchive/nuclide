"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const vscode = require("vscode");
const types_1 = require("./common/process/types");
const sortProvider = require("./providers/importSortProvider");
function activate(context, outChannel, serviceContainer) {
    const rootDir = context.asAbsolutePath('.');
    const disposable = vscode.commands.registerCommand('python.sortImports', () => {
        const activeEditor = vscode.window.activeTextEditor;
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
            // tslint:disable-next-line:no-any
            emptyLineAdded = new Promise((resolve, reject) => {
                activeEditor.edit(builder => {
                    builder.insert(lastLine.range.end, os.EOL);
                }).then(resolve, reject);
            });
        }
        return emptyLineAdded.then(() => {
            const processService = serviceContainer.get(types_1.IProcessService);
            const pythonExecutionFactory = serviceContainer.get(types_1.IPythonExecutionFactory);
            return new sortProvider.PythonImportSortProvider(pythonExecutionFactory, processService).sortImports(rootDir, activeEditor.document);
        }).then(changes => {
            if (!changes || changes.length === 0) {
                return;
            }
            return new Promise((resolve, reject) => activeEditor.edit(builder => changes.forEach(change => builder.replace(change.range, change.newText))).then(resolve, reject));
        }).catch(error => {
            const message = typeof error === 'string' ? error : (error.message ? error.message : error);
            outChannel.appendLine(error);
            outChannel.show();
            vscode.window.showErrorMessage(message);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
//# sourceMappingURL=sortImports.js.map