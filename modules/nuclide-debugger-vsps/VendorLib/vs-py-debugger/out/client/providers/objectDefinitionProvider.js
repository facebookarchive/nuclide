'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const defProvider = require("./definitionProvider");
function activateGoToObjectDefinitionProvider(context) {
    let def = new PythonObjectDefinitionProvider(context);
    return vscode.commands.registerCommand("python.goToPythonObject", () => def.goToObjectDefinition());
}
exports.activateGoToObjectDefinitionProvider = activateGoToObjectDefinitionProvider;
class PythonObjectDefinitionProvider {
    constructor(context) {
        this._defProvider = new defProvider.PythonDefinitionProvider(context);
    }
    goToObjectDefinition() {
        return __awaiter(this, void 0, void 0, function* () {
            let pathDef = yield this.getObjectDefinition();
            if (typeof pathDef !== 'string' || pathDef.length === 0) {
                return;
            }
            let parts = pathDef.split('.');
            let source = '';
            let startColumn = 0;
            if (parts.length === 1) {
                source = `import ${parts[0]}`;
                startColumn = 'import '.length;
            }
            else {
                let mod = parts.shift();
                source = `from ${mod} import ${parts.join('.')}`;
                startColumn = `from ${mod} import `.length;
            }
            const range = new vscode.Range(0, startColumn, 0, source.length - 1);
            let doc = {
                fileName: 'test.py',
                lineAt: (line) => {
                    return { text: source };
                },
                getWordRangeAtPosition: (position) => range,
                isDirty: true,
                getText: () => source
            };
            let tokenSource = new vscode.CancellationTokenSource();
            let defs = yield this._defProvider.provideDefinition(doc, range.start, tokenSource.token);
            if (defs === null) {
                yield vscode.window.showInformationMessage(`Definition not found for '${pathDef}'`);
                return;
            }
            let uri;
            let lineNumber;
            if (Array.isArray(defs) && defs.length > 0) {
                uri = defs[0].uri;
                lineNumber = defs[0].range.start.line;
            }
            if (!Array.isArray(defs) && defs.uri) {
                uri = defs.uri;
                lineNumber = defs.range.start.line;
            }
            if (uri) {
                let doc = yield vscode.workspace.openTextDocument(uri);
                yield vscode.window.showTextDocument(doc);
                yield vscode.commands.executeCommand('revealLine', { lineNumber: lineNumber, 'at': 'top' });
            }
            else {
                yield vscode.window.showInformationMessage(`Definition not found for '${pathDef}'`);
            }
        });
    }
    intputValidation(value) {
        if (typeof value !== 'string') {
            return '';
        }
        value = value.trim();
        if (value.length === 0) {
            return '';
        }
        return null;
    }
    getObjectDefinition() {
        return __awaiter(this, void 0, void 0, function* () {
            let value = yield vscode.window.showInputBox({ prompt: "Enter Object Path", validateInput: this.intputValidation });
            return value;
        });
    }
}
exports.PythonObjectDefinitionProvider = PythonObjectDefinitionProvider;
//# sourceMappingURL=objectDefinitionProvider.js.map