'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const proxy = require("./jediProxy");
class PythonDefinitionProvider {
    get JediProxy() {
        return this.jediProxyHandler.JediProxy;
    }
    constructor(context) {
        this.jediProxyHandler = new proxy.JediProxyHandler(context);
    }
    static parseData(data, possibleWord) {
        if (data && Array.isArray(data.definitions) && data.definitions.length > 0) {
            const definitions = data.definitions.filter(d => d.text === possibleWord);
            const definition = definitions.length > 0 ? definitions[0] : data.definitions[data.definitions.length - 1];
            const definitionResource = vscode.Uri.file(definition.fileName);
            const range = new vscode.Range(definition.range.startLine, definition.range.startColumn, definition.range.endLine, definition.range.endColumn);
            return new vscode.Location(definitionResource, range);
        }
        return null;
    }
    provideDefinition(document, position, token) {
        var filename = document.fileName;
        if (document.lineAt(position.line).text.match(/^\s*\/\//)) {
            return Promise.resolve(null);
        }
        if (position.character <= 0) {
            return Promise.resolve(null);
        }
        var range = document.getWordRangeAtPosition(position);
        var columnIndex = range.isEmpty ? position.character : range.end.character;
        var cmd = {
            command: proxy.CommandType.Definitions,
            fileName: filename,
            columnIndex: columnIndex,
            lineIndex: position.line
        };
        if (document.isDirty) {
            cmd.source = document.getText();
        }
        let possibleWord = document.getText(range);
        return this.jediProxyHandler.sendCommand(cmd, token).then(data => {
            return PythonDefinitionProvider.parseData(data, possibleWord);
        });
    }
}
exports.PythonDefinitionProvider = PythonDefinitionProvider;
//# sourceMappingURL=definitionProvider.js.map