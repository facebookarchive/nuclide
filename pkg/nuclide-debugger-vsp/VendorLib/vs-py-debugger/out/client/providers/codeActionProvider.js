'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class PythonCodeActionsProvider {
    constructor(context) {
    }
    provideCodeActions(document, range, context, token) {
        return new Promise((resolve, reject) => {
            let commands = [
                {
                    command: 'python.sortImports',
                    title: 'Sort Imports'
                }
            ];
            if (vscode.window.activeTextEditor.document === document && !vscode.window.activeTextEditor.selection.isEmpty) {
                let wordRange = document.getWordRangeAtPosition(range.start);
                // If no word has been selected by the user, then don't display rename
                // If something has been selected, then ensure we have selected a word (i.e. end and start matches the word range) 
                if (wordRange && !wordRange.isEmpty && wordRange.isEqual(vscode.window.activeTextEditor.selection)) {
                    let word = document.getText(wordRange).trim();
                    if (word.length > 0) {
                        commands.push({ command: 'editor.action.rename', title: 'Rename Symbol' });
                    }
                }
            }
            if (!range.isEmpty) {
                let word = document.getText(range).trim();
                if (word.trim().length > 0) {
                    commands.push({ command: 'python.refactorExtractVariable', title: 'Extract Variable', arguments: [range] });
                    commands.push({ command: 'python.refactorExtractMethod', title: 'Extract Method', arguments: [range] });
                }
            }
            resolve(commands);
        });
    }
}
exports.PythonCodeActionsProvider = PythonCodeActionsProvider;
//# sourceMappingURL=codeActionProvider.js.map