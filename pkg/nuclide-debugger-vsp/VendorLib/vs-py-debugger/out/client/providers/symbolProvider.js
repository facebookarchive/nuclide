'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const proxy = require("./jediProxy");
class PythonSymbolProvider {
    constructor(context, jediProxy = null) {
        this.jediProxyHandler = new proxy.JediProxyHandler(context, jediProxy);
    }
    static parseData(document, data) {
        if (data) {
            let symbols = data.definitions.filter(sym => sym.fileName === document.fileName);
            return symbols.map(sym => {
                const symbol = sym.kind;
                const range = new vscode.Range(sym.range.startLine, sym.range.startColumn, sym.range.endLine, sym.range.endColumn);
                const uri = vscode.Uri.file(sym.fileName);
                const location = new vscode.Location(uri, range);
                return new vscode.SymbolInformation(sym.text, symbol, sym.container, location);
            });
        }
        return [];
    }
    provideDocumentSymbols(document, token) {
        var filename = document.fileName;
        var cmd = {
            command: proxy.CommandType.Symbols,
            fileName: filename,
            columnIndex: 0,
            lineIndex: 0
        };
        if (document.isDirty) {
            cmd.source = document.getText();
        }
        return this.jediProxyHandler.sendCommand(cmd, token).then(data => {
            return PythonSymbolProvider.parseData(document, data);
        });
    }
    provideDocumentSymbolsForInternalUse(document, token) {
        var filename = document.fileName;
        var cmd = {
            command: proxy.CommandType.Symbols,
            fileName: filename,
            columnIndex: 0,
            lineIndex: 0
        };
        if (document.isDirty) {
            cmd.source = document.getText();
        }
        return this.jediProxyHandler.sendCommandNonCancellableCommand(cmd, token).then(data => {
            return PythonSymbolProvider.parseData(document, data);
        });
    }
}
exports.PythonSymbolProvider = PythonSymbolProvider;
//# sourceMappingURL=symbolProvider.js.map