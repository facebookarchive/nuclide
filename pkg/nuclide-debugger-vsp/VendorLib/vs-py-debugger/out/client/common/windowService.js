"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class WindowService {
    createOutputChannel(name) {
        return vscode.window.createOutputChannel(name);
    }
    createStatusBarItem(alignment, priority) {
        return vscode.window.createStatusBarItem.apply(vscode.window, arguments);
    }
    showInformationMessage(message, ...items) {
        return vscode.window.showInformationMessage.apply(vscode.window, arguments);
    }
    showWarningMessage(message, ...items) {
        return vscode.window.showWarningMessage.apply(vscode.window, arguments);
    }
    showErrorMessage(message, ...items) {
        return vscode.window.showErrorMessage.apply(vscode.window, arguments);
    }
}
exports.WindowService = WindowService;
//# sourceMappingURL=windowService.js.map