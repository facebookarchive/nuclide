"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
class LocationParser {
    static parse(data) {
        if (!data || !Array(data.references) || data.references.length === 0) {
            return [];
        }
        var references = data.references.filter(ref => {
            if (!ref || typeof ref.columnIndex !== 'number' || typeof ref.lineIndex !== 'number'
                || typeof ref.fileName !== 'string' || ref.columnIndex === -1 || ref.lineIndex === -1 || ref.fileName.length === 0) {
                return false;
            }
            return true;
        }).map(ref => {
            var definitionResource = vscode_1.Uri.file(ref.fileName);
            var range = new vscode_1.Range(ref.lineIndex, ref.columnIndex, ref.lineIndex, ref.columnIndex);
            return new vscode_1.Location(definitionResource, range);
        });
        return references;
    }
}
exports.LocationParser = LocationParser;
//# sourceMappingURL=LocationParser.js.map