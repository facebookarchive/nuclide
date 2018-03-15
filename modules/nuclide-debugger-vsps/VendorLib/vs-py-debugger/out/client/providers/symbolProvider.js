'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const telemetry_1 = require("../telemetry");
const constants_1 = require("../telemetry/constants");
const proxy = require("./jediProxy");
class PythonSymbolProvider {
    constructor(jediFactory) {
        this.jediFactory = jediFactory;
    }
    static parseData(document, data) {
        if (data) {
            const symbols = data.definitions.filter(sym => sym.fileName === document.fileName);
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
        const filename = document.fileName;
        const cmd = {
            command: proxy.CommandType.Symbols,
            fileName: filename,
            columnIndex: 0,
            lineIndex: 0
        };
        if (document.isDirty) {
            cmd.source = document.getText();
        }
        return this.jediFactory.getJediProxyHandler(document.uri).sendCommand(cmd, token).then(data => {
            return PythonSymbolProvider.parseData(document, data);
        });
    }
    provideDocumentSymbolsForInternalUse(document, token) {
        const filename = document.fileName;
        const cmd = {
            command: proxy.CommandType.Symbols,
            fileName: filename,
            columnIndex: 0,
            lineIndex: 0
        };
        if (document.isDirty) {
            cmd.source = document.getText();
        }
        return this.jediFactory.getJediProxyHandler(document.uri).sendCommandNonCancellableCommand(cmd, token).then(data => {
            return PythonSymbolProvider.parseData(document, data);
        });
    }
}
__decorate([
    telemetry_1.captureTelemetry(constants_1.SYMBOL)
], PythonSymbolProvider.prototype, "provideDocumentSymbols", null);
exports.PythonSymbolProvider = PythonSymbolProvider;
//# sourceMappingURL=symbolProvider.js.map