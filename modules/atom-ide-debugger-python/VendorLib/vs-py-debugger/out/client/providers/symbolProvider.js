'use strict';
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const helpers_1 = require("../common/helpers");
const types_1 = require("../common/platform/types");
const telemetry_1 = require("../telemetry");
const constants_1 = require("../telemetry/constants");
const proxy = require("./jediProxy");
class PythonSymbolProvider {
    constructor(serviceContainer, jediFactory, debounceTimeoutMs = 500) {
        this.jediFactory = jediFactory;
        this.debounceTimeoutMs = debounceTimeoutMs;
        this.debounceRequest = new Map();
        this.fs = serviceContainer.get(types_1.IFileSystem);
    }
    provideDocumentSymbols(document, token) {
        const key = `${document.uri.fsPath}`;
        if (this.debounceRequest.has(key)) {
            const item = this.debounceRequest.get(key);
            clearTimeout(item.timer);
            item.deferred.resolve([]);
        }
        const deferred = helpers_1.createDeferred();
        const timer = setTimeout(() => {
            if (token.isCancellationRequested) {
                return deferred.resolve([]);
            }
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
            this.jediFactory.getJediProxyHandler(document.uri).sendCommand(cmd, token)
                .then(data => this.parseData(document, data))
                .then(items => deferred.resolve(items))
                .catch(ex => deferred.reject(ex));
        }, this.debounceTimeoutMs);
        token.onCancellationRequested(() => {
            clearTimeout(timer);
            deferred.resolve([]);
            this.debounceRequest.delete(key);
        });
        // When a document is not saved on FS, we cannot uniquely identify it, so lets not debounce, but delay the symbol provider.
        if (!document.isUntitled) {
            this.debounceRequest.set(key, { timer, deferred });
        }
        return deferred.promise;
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
        return this.jediFactory.getJediProxyHandler(document.uri).sendCommandNonCancellableCommand(cmd, token)
            .then(data => this.parseData(document, data));
    }
    parseData(document, data) {
        if (data) {
            const symbols = data.definitions.filter(sym => this.fs.arePathsSame(sym.fileName, document.fileName));
            return symbols.map(sym => {
                const symbol = sym.kind;
                const range = new vscode_1.Range(sym.range.startLine, sym.range.startColumn, sym.range.endLine, sym.range.endColumn);
                const uri = vscode_1.Uri.file(sym.fileName);
                const location = new vscode_1.Location(uri, range);
                return new vscode_1.SymbolInformation(sym.text, symbol, sym.container, location);
            });
        }
        return [];
    }
}
__decorate([
    telemetry_1.captureTelemetry(constants_1.SYMBOL)
], PythonSymbolProvider.prototype, "provideDocumentSymbols", null);
exports.PythonSymbolProvider = PythonSymbolProvider;
//# sourceMappingURL=symbolProvider.js.map