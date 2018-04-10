"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../common/constants");
class KernelStatus extends vscode.Disposable {
    constructor() {
        super(() => { });
        this.disposables = [];
        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        this.statusBar.command = 'jupyter.proxyKernelOptionsCmd';
        this.disposables.push(this.statusBar);
        this.disposables.push(vscode.commands.registerCommand('jupyter.proxyKernelOptionsCmd', () => {
            vscode.commands.executeCommand(constants_1.Commands.Jupyter.Kernel_Options, this.activeKernalDetails);
        }));
        this.disposables.push(vscode.window.onDidChangeActiveTextEditor(this.onDidChangeActiveTextEditor.bind(this)));
    }
    onDidChangeActiveTextEditor(editor) {
        const editorsOpened = vscode.workspace.textDocuments.length > 0;
        if ((!editor && editorsOpened) || (editor && editor.document.languageId === constants_1.PythonLanguage.language)) {
            if (this.activeKernalDetails) {
                this.statusBar.show();
            }
        }
        else {
            this.statusBar.hide();
        }
    }
    setActiveKernel(kernelspec) {
        if (!kernelspec) {
            this.activeKernalDetails = null;
            return this.statusBar.hide();
        }
        this.activeKernalDetails = kernelspec;
        this.statusBar.text = `$(flame)${this.activeKernalDetails.display_name} Kernel`;
        this.statusBar.tooltip = `${kernelspec.display_name} Kernel for ${kernelspec.language}\nClick for options`;
        this.statusBar.show();
    }
    setKernelStatus(status) {
        this.statusBar.text = `$(flame)${this.activeKernalDetails.display_name} Kernel (${status})`;
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.KernelStatus = KernelStatus;
//# sourceMappingURL=kernelStatus.js.map