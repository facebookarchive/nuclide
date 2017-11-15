"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const kernelPicker_1 = require("./kernelPicker");
const constants_1 = require("../../common/constants");
const resultView_1 = require("./resultView");
const cellOptions_1 = require("./cellOptions");
const server_1 = require("./server");
const configSettings_1 = require("../../common/configSettings");
const jupyterSchema = 'jupyter-result-viewer';
const previewUri = vscode.Uri.parse(jupyterSchema + '://authority/jupyter');
class JupyterDisplay extends vscode.Disposable {
    constructor(cellCodeLenses) {
        super(() => { });
        this.displayed = false;
        this.appendResults = configSettings_1.PythonSettings.getInstance().jupyter.appendResults;
        this.disposables = [];
        this.server = new server_1.Server();
        this.disposables.push(this.server);
        this.disposables.push(new kernelPicker_1.KernelPicker());
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Kernel_Options, this.showKernelOptions.bind(this)));
        this.previewWindow = new resultView_1.TextDocumentContentProvider();
        this.disposables.push(vscode.workspace.registerTextDocumentContentProvider(jupyterSchema, this.previewWindow));
        this.cellOptions = new cellOptions_1.CellOptions(cellCodeLenses);
        this.disposables.push(this.cellOptions);
        this.server.on('appendResults', appendResults => {
            this.appendResults = appendResults === true;
        });
    }
    showResults(results) {
        return this.server.start().then(port => {
            this.previewWindow.ServerPort = port;
            // If we need to append the results, then do so if we have any result windows open
            let sendDataToResultView = this.server.clientsConnected(2000);
            return sendDataToResultView.then(clientConnected => {
                // vscode.commands.executeCommand('_webview.openDevTools');
                if (clientConnected) {
                    return this.server.sendResults(results);
                }
                this.previewWindow.setResult(results);
                this.previewWindow.AppendResults = this.appendResults;
                // Dirty hack to support instances when document has been closed
                if (this.displayed) {
                    this.previewWindow.update();
                }
                this.displayed = true;
                return vscode.commands.executeCommand('vscode.previewHtml', previewUri, vscode.ViewColumn.Two, 'Results')
                    .then(() => {
                    // Do nothing
                }, reason => {
                    vscode.window.showErrorMessage(reason);
                });
            });
        });
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    showKernelOptions(selectedKernel) {
        let description = '';
        if (selectedKernel.display_name.toLowerCase().indexOf(selectedKernel.language.toLowerCase()) === -1) {
            description = selectedKernel.language;
        }
        const options = [
            {
                label: `Interrupt ${selectedKernel.display_name} Kernel`,
                description: description,
                command: constants_1.Commands.Jupyter.Kernel.Kernel_Interrupt,
                args: [selectedKernel]
            },
            {
                label: `Restart ${selectedKernel.display_name} Kernel`,
                description: description,
                command: constants_1.Commands.Jupyter.Kernel.Kernel_Restart,
                args: [selectedKernel]
            },
            {
                label: `Shut Down ${selectedKernel.display_name} Kernel`,
                description: description,
                command: constants_1.Commands.Jupyter.Kernel.Kernel_Shut_Down,
                args: [selectedKernel]
            },
            {
                label: ` `,
                description: ' ',
                command: '',
                args: []
            },
            {
                label: `Select another ${selectedKernel.language} Kernel`,
                description: ` `,
                command: constants_1.Commands.Jupyter.Select_Kernel,
                args: [selectedKernel.language]
            }
        ];
        vscode.window.showQuickPick(options).then(option => {
            if (!option || !option.command || option.command.length === 0) {
                return;
            }
            vscode.commands.executeCommand(option.command, ...option.args);
        });
    }
}
exports.JupyterDisplay = JupyterDisplay;
//# sourceMappingURL=main.js.map