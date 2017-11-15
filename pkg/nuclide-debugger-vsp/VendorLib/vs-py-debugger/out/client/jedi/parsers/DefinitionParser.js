"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class DefinitionParser {
    static parse(data, possibleWord) {
        if (!data || !Array.isArray(data.definitions) || data.definitions.length === 0) {
            return null;
        }
        const definitions = data.definitions.filter(d => d.text === possibleWord);
        const definition = definitions.length > 0 ? definitions[0] : data.definitions[data.definitions.length - 1];
        const definitionResource = vscode_1.Uri.file(definition.fileName);
        const range = new vscode_1.Range(definition.range.startLine, definition.range.startColumn, definition.range.endLine, definition.range.endColumn);
        return new vscode_1.Location(definitionResource, range);
    }
}
exports.DefinitionParser = DefinitionParser;
//# sourceMappingURL=DefinitionParser.js.map