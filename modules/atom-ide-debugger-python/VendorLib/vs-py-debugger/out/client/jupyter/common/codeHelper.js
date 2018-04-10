"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const cellHelper_1 = require("./cellHelper");
class CodeHelper {
    constructor(cellCodeLenses) {
        this.cellCodeLenses = cellCodeLenses;
        this.cellHelper = new cellHelper_1.CellHelper(cellCodeLenses);
    }
    getSelectedCode() {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor || !activeEditor.document) {
            return Promise.resolve('');
        }
        if (activeEditor.selection.isEmpty) {
            const lineText = activeEditor.document.lineAt(activeEditor.selection.start.line).text;
            if (!CodeHelper.isCodeBlock(lineText)) {
                return Promise.resolve(lineText);
            }
            // ok we're in a block, look for the end of the block untill the last line in the cell (if there are any cells)
            return new Promise((resolve, reject) => {
                this.cellHelper.getActiveCell().then(activeCell => {
                    const endLineNumber = activeCell ? activeCell.cell.end.line : activeEditor.document.lineCount - 1;
                    const startIndent = lineText.indexOf(lineText.trim());
                    const nextStartLine = activeEditor.selection.start.line + 1;
                    for (let lineNumber = nextStartLine; lineNumber <= endLineNumber; lineNumber++) {
                        const line = activeEditor.document.lineAt(lineNumber);
                        const nextLine = line.text;
                        const nextLineIndent = nextLine.indexOf(nextLine.trim());
                        if (nextLine.trim().indexOf('#') === 0) {
                            continue;
                        }
                        if (nextLineIndent === startIndent) {
                            // Return code untill previous line
                            const endRange = activeEditor.document.lineAt(lineNumber - 1).range.end;
                            resolve(activeEditor.document.getText(new vscode.Range(activeEditor.selection.start, endRange)));
                        }
                    }
                    resolve(activeEditor.document.getText(activeCell.cell));
                }, reject);
            });
            //return activeEditor.document.getText(new vscode.Range(activeEditor.selection.start, activeEditor.selection.))
        }
        else {
            return Promise.resolve(activeEditor.document.getText(activeEditor.selection));
        }
    }
    static isCodeBlock(code) {
        return code.trim().endsWith(':') && code.indexOf('#') === -1;
    }
}
exports.CodeHelper = CodeHelper;
//# sourceMappingURL=codeHelper.js.map