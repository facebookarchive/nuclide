'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const proxy_1 = require("../refactor/proxy");
const editor_1 = require("../common/editor");
const configSettings_1 = require("../common/configSettings");
function activateSimplePythonRefactorProvider(context, outputChannel) {
    let disposable = vscode.commands.registerCommand('python.refactorExtractVariable', () => {
        extractVariable(context.extensionPath, vscode.window.activeTextEditor, vscode.window.activeTextEditor.selection, outputChannel).catch(() => { });
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('python.refactorExtractMethod', () => {
        extractMethod(context.extensionPath, vscode.window.activeTextEditor, vscode.window.activeTextEditor.selection, outputChannel).catch(() => { });
    });
    context.subscriptions.push(disposable);
}
exports.activateSimplePythonRefactorProvider = activateSimplePythonRefactorProvider;
// Exported for unit testing
function extractVariable(extensionDir, textEditor, range, outputChannel, workspaceRoot = vscode.workspace.rootPath, pythonSettings = configSettings_1.PythonSettings.getInstance()) {
    return validateDocumentForRefactor(textEditor).then(() => {
        let newName = 'newvariable' + new Date().getMilliseconds().toString();
        let proxy = new proxy_1.RefactorProxy(extensionDir, pythonSettings, workspaceRoot);
        let rename = proxy.extractVariable(textEditor.document, newName, textEditor.document.uri.fsPath, range, textEditor.options).then(response => {
            return response.results[0].diff;
        });
        return extractName(extensionDir, textEditor, range, newName, rename, outputChannel);
    });
}
exports.extractVariable = extractVariable;
// Exported for unit testing
function extractMethod(extensionDir, textEditor, range, outputChannel, workspaceRoot = vscode.workspace.rootPath, pythonSettings = configSettings_1.PythonSettings.getInstance()) {
    return validateDocumentForRefactor(textEditor).then(() => {
        let newName = 'newmethod' + new Date().getMilliseconds().toString();
        let proxy = new proxy_1.RefactorProxy(extensionDir, pythonSettings, workspaceRoot);
        let rename = proxy.extractMethod(textEditor.document, newName, textEditor.document.uri.fsPath, range, textEditor.options).then(response => {
            return response.results[0].diff;
        });
        return extractName(extensionDir, textEditor, range, newName, rename, outputChannel);
    });
}
exports.extractMethod = extractMethod;
function validateDocumentForRefactor(textEditor) {
    if (!textEditor.document.isDirty) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        vscode.window.showInformationMessage('Please save changes before refactoring', 'Save').then(item => {
            if (item === 'Save') {
                textEditor.document.save().then(resolve, reject);
            }
            else {
                return reject();
            }
        });
    });
}
function extractName(extensionDir, textEditor, range, newName, renameResponse, outputChannel) {
    let changeStartsAtLine = -1;
    return renameResponse.then(diff => {
        if (diff.length === 0) {
            return [];
        }
        let edits = editor_1.getTextEditsFromPatch(textEditor.document.getText(), diff);
        return edits;
    }).then(edits => {
        return textEditor.edit(editBuilder => {
            edits.forEach(edit => {
                if (changeStartsAtLine === -1 || changeStartsAtLine > edit.range.start.line) {
                    changeStartsAtLine = edit.range.start.line;
                }
                editBuilder.replace(edit.range, edit.newText);
            });
        });
    }).then(done => {
        if (done && changeStartsAtLine >= 0) {
            let newWordPosition;
            for (let lineNumber = changeStartsAtLine; lineNumber < textEditor.document.lineCount; lineNumber++) {
                let line = textEditor.document.lineAt(lineNumber);
                let indexOfWord = line.text.indexOf(newName);
                if (indexOfWord >= 0) {
                    newWordPosition = new vscode.Position(line.range.start.line, indexOfWord);
                    break;
                }
            }
            if (newWordPosition) {
                textEditor.selections = [new vscode.Selection(newWordPosition, new vscode.Position(newWordPosition.line, newWordPosition.character + newName.length))];
                textEditor.revealRange(new vscode.Range(textEditor.selection.start, textEditor.selection.end), vscode.TextEditorRevealType.Default);
            }
            return newWordPosition;
        }
        return null;
    }).then(newWordPosition => {
        if (newWordPosition) {
            return textEditor.document.save().then(() => {
                // Now that we have selected the new variable, lets invoke the rename command
                return vscode.commands.executeCommand('editor.action.rename');
            });
        }
    }).catch(error => {
        let errorMessage = error + '';
        if (typeof error === 'string') {
            errorMessage = error;
        }
        if (typeof error === 'object' && error.message) {
            errorMessage = error.message;
        }
        outputChannel.appendLine('#'.repeat(10) + 'Refactor Output' + '#'.repeat(10));
        outputChannel.appendLine('Error in refactoring:\n' + errorMessage);
        vscode.window.showErrorMessage(`Cannot perform refactoring using selected element(s). (${errorMessage})`);
        return Promise.reject(error);
    });
}
//# sourceMappingURL=simpleRefactorProvider.js.map