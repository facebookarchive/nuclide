"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const jediHelpers_1 = require("../../providers/jediHelpers");
const configSettings_1 = require("../../common/configSettings");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
class CompletionParser {
    static parse(data) {
        if (!data || data.items.length === 0) {
            return [];
        }
        return data.items.map(item => {
            const sigAndDocs = jediHelpers_1.extractSignatureAndDocumentation(item);
            let completionItem = new vscode_1.CompletionItem(item.text);
            completionItem.kind = item.type;
            completionItem.documentation = sigAndDocs[1].length === 0 ? item.description : sigAndDocs[1];
            completionItem.detail = sigAndDocs[0].split(/\r?\n/).join('');
            if (pythonSettings.autoComplete.addBrackets === true &&
                (item.kind === vscode_1.SymbolKind.Function || item.kind === vscode_1.SymbolKind.Method)) {
                completionItem.insertText = new vscode_1.SnippetString(item.text).appendText("(").appendTabstop().appendText(")");
            }
            // ensure the built in memebers are at the bottom
            completionItem.sortText = (completionItem.label.startsWith('__') ? 'z' : (completionItem.label.startsWith('_') ? 'y' : '__')) + completionItem.label;
            return completionItem;
        });
    }
}
exports.CompletionParser = CompletionParser;
//# sourceMappingURL=CompletionParser.js.map