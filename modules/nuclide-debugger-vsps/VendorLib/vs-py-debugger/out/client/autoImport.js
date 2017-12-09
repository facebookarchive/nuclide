'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const autoImportProvider_1 = require("./providers/autoImportProvider");
function activate(context, outChannel) {
    let extension = new autoImportProvider_1.AutoImportProvider();
    context.subscriptions.push(vscode.commands.registerCommand('python.autoImportAtCursor', extension.autoImportAtCursor));
}
exports.activate = activate;
//# sourceMappingURL=autoImport.js.map