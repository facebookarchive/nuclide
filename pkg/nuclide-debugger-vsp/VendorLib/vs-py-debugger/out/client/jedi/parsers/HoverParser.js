"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const jediHelpers_1 = require("../../providers/jediHelpers");
const os_1 = require("os");
class HoverParser {
    static parse(data, currentWord) {
        if (!data || !Array.isArray(data.items) || data.items.length === 0) {
            return new vscode_1.Hover([]);
        }
        let results = [];
        let capturedInfo = [];
        data.items.forEach(item => {
            let { signature } = item;
            switch (item.kind) {
                case vscode_1.SymbolKind.Constructor:
                case vscode_1.SymbolKind.Function:
                case vscode_1.SymbolKind.Method: {
                    signature = 'def ' + signature;
                    break;
                }
                case vscode_1.SymbolKind.Class: {
                    signature = 'class ' + signature;
                    break;
                }
                default: {
                    signature = typeof item.text === 'string' && item.text.length > 0 ? item.text : currentWord;
                }
            }
            if (item.docstring) {
                let lines = item.docstring.split(/\r?\n/);
                // If the docstring starts with the signature, then remove those lines from the docstring
                if (lines.length > 0 && item.signature.indexOf(lines[0]) === 0) {
                    lines.shift();
                    let endIndex = lines.findIndex(line => item.signature.endsWith(line));
                    if (endIndex >= 0) {
                        lines = lines.filter((line, index) => index > endIndex);
                    }
                }
                if (lines.length > 0 && item.signature.startsWith(currentWord) && lines[0].startsWith(currentWord) && lines[0].endsWith(')')) {
                    lines.shift();
                }
                let descriptionWithHighlightedCode = jediHelpers_1.highlightCode(lines.join(os_1.EOL));
                let hoverInfo = ['```python', signature, '```', descriptionWithHighlightedCode].join(os_1.EOL);
                let key = signature + lines.join('');
                // Sometimes we have duplicate documentation, one with a period at the end
                if (capturedInfo.indexOf(key) >= 0 || capturedInfo.indexOf(key + '.') >= 0) {
                    return;
                }
                capturedInfo.push(key);
                capturedInfo.push(key + '.');
                results.push(hoverInfo);
                return;
            }
            if (item.description) {
                let descriptionWithHighlightedCode = jediHelpers_1.highlightCode(item.description);
                let hoverInfo = '```python' + os_1.EOL + signature + os_1.EOL + '```' + os_1.EOL + descriptionWithHighlightedCode;
                let lines = item.description.split(os_1.EOL);
                let key = signature + lines.join('');
                // Sometimes we have duplicate documentation, one with a period at the end
                if (capturedInfo.indexOf(key) >= 0 || capturedInfo.indexOf(key + '.') >= 0) {
                    return;
                }
                capturedInfo.push(key);
                capturedInfo.push(key + '.');
                results.push(hoverInfo);
            }
        });
        return new vscode_1.Hover(results);
    }
}
exports.HoverParser = HoverParser;
//# sourceMappingURL=HoverParser.js.map