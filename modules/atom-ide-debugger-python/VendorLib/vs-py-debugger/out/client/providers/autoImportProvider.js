"use strict";
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
const fs = require("fs");
const path = require("path");
class AutoImportProvider {
    constructor() {
    }
    autoImportAtCursor() {
        let ed = vscode.window.activeTextEditor;
        let range = ed.selection;
        if (range.start.line !== range.end.line) {
            return;
        }
        if (range.start.character === range.end.character) {
            range = ed.document.getWordRangeAtPosition(range.end);
        }
        const symbol = vscode.window.activeTextEditor.document.getText(range);
        if (!symbol) {
            return;
        }
        return this.autoImport(symbol);
    }
    autoImport(symbol) {
        return __awaiter(this, void 0, void 0, function* () {
            let editor = vscode.window.activeTextEditor;
            let result = yield this.lookupSymbol(symbol);
            result = result.filter((s) => s.name === symbol &&
                s.kind !== vscode.SymbolKind.Namespace // only declarations should be considered for import
            );
            if (result.length === 0) {
                vscode.window.showInformationMessage('No matching symbols found');
                return;
            }
            else {
                var import_choices = result.map(s => `from ${pathAsPyModule(s.location)} import ${s.name}`);
                let s = yield this.showChoices(import_choices);
                if (s) {
                    return addImport(editor, s);
                }
            }
        });
    }
    lookupSymbol(symbol) {
        return vscode.commands.executeCommand('vscode.executeWorkspaceSymbolProvider', symbol);
    }
    showChoices(import_choices) {
        return vscode.window.showQuickPick(import_choices);
    }
}
exports.AutoImportProvider = AutoImportProvider;
function pathAsPyModule(l) {
    var pymodule = path.basename(l.uri.fsPath).replace(/\.py$/, '');
    var location = path.dirname(l.uri.fsPath);
    while (fs.existsSync(path.join(location, '__init__.py'))) {
        pymodule = path.basename(location) + '.' + pymodule;
        location = path.dirname(location);
    }
    return pymodule;
}
exports.pathAsPyModule = pathAsPyModule;
function addImport(ed, import_string) {
    return ed.edit((b) => b.insert(getPositionForNewImport(import_string), import_string + '\n'));
}
exports.addImport = addImport;
function getPositionForNewImport(import_string) {
    // TODO: figure out better position:
    return new vscode.Position(0, 0);
}
exports.getPositionForNewImport = getPositionForNewImport;
//# sourceMappingURL=autoImportProvider.js.map