'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const proxy = require("./jediProxy");
const telemetryHelper = require("../common/telemetry");
const telemetryContracts = require("../common/telemetryContracts");
const jediHelpers_1 = require("./jediHelpers");
const configSettings_1 = require("../common/configSettings");
const vscode_1 = require("vscode");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
class PythonCompletionItemProvider {
    constructor(context, jediProxy = null) {
        this.jediProxyHandler = new proxy.JediProxyHandler(context, jediProxy);
    }
    static parseData(data) {
        if (data && data.items.length > 0) {
            return data.items.map(item => {
                const sigAndDocs = jediHelpers_1.extractSignatureAndDocumentation(item);
                let completionItem = new vscode.CompletionItem(item.text);
                completionItem.kind = item.type;
                completionItem.documentation = sigAndDocs[1].length === 0 ? item.description : sigAndDocs[1];
                completionItem.detail = sigAndDocs[0].split(/\r?\n/).join('');
                if (pythonSettings.autoComplete.addBrackets === true &&
                    (item.kind === vscode.SymbolKind.Function || item.kind === vscode.SymbolKind.Method)) {
                    completionItem.insertText = new vscode_1.SnippetString(item.text).appendText("(").appendTabstop().appendText(")");
                }
                // ensure the built in memebers are at the bottom
                completionItem.sortText = (completionItem.label.startsWith('__') ? 'z' : (completionItem.label.startsWith('_') ? 'y' : '__')) + completionItem.label;
                return completionItem;
            });
        }
        return [];
    }
    provideCompletionItems(document, position, token) {
        if (position.character <= 0) {
            return Promise.resolve([]);
        }
        const filename = document.fileName;
        const lineText = document.lineAt(position.line).text;
        if (lineText.match(/^\s*\/\//)) {
            return Promise.resolve([]);
        }
        // If starts with a comment, then return
        if (lineText.trim().startsWith('#')) {
            return Promise.resolve([]);
        }
        // If starts with a """ (possible doc string), then return
        if (lineText.trim().startsWith('"""')) {
            return Promise.resolve([]);
        }
        const type = proxy.CommandType.Completions;
        const columnIndex = position.character;
        const source = document.getText();
        const cmd = {
            command: type,
            fileName: filename,
            columnIndex: columnIndex,
            lineIndex: position.line,
            source: source
        };
        const timer = new telemetryHelper.Delays();
        return this.jediProxyHandler.sendCommand(cmd, token).then(data => {
            timer.stop();
            telemetryHelper.sendTelemetryEvent(telemetryContracts.IDE.Completion, {}, timer.toMeasures());
            const completions = PythonCompletionItemProvider.parseData(data);
            return completions;
        });
    }
}
exports.PythonCompletionItemProvider = PythonCompletionItemProvider;
//# sourceMappingURL=completionProvider.js.map