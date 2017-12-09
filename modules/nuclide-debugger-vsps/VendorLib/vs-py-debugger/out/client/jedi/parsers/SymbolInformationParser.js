"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class SymbolInformationParser {
    static parse(data, document) {
        if (!data || !Array.isArray(data.definitions) || data.definitions.length === 0) {
            return [];
        }
        let symbols = data.definitions.filter(sym => sym.fileName === document.fileName);
        return symbols.map(sym => {
            const symbol = sym.kind;
            const range = new vscode_1.Range(sym.range.startLine, sym.range.startColumn, sym.range.endLine, sym.range.endColumn);
            const uri = vscode_1.Uri.file(sym.fileName);
            const location = new vscode_1.Location(uri, range);
            return new vscode_1.SymbolInformation(sym.text, symbol, sym.container, location);
        });
    }
}
exports.SymbolInformationParser = SymbolInformationParser;
//# sourceMappingURL=SymbolInformationParser.js.map