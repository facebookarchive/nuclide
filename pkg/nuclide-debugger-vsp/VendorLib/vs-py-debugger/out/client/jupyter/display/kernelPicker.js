"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const constants_1 = require("../../common/constants");
class KernelPicker extends vscode.Disposable {
    constructor() {
        super(() => { });
        this.disposables = [];
        this.registerCommands();
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Jupyter.Select_Kernel, this.selectkernel.bind(this, constants_1.PythonLanguage.language)));
    }
    selectkernel(language) {
        return new Promise(resolve => {
            const command = language ? constants_1.Commands.Jupyter.Get_All_KernelSpecs_For_Language : constants_1.Commands.Jupyter.Get_All_KernelSpecs;
            vscode.commands.executeCommand(command, language).then((kernelSpecs) => {
                if (kernelSpecs.length === 0) {
                    return resolve();
                }
                this.displayKernelPicker(kernelSpecs).then((kernelSpec) => {
                    if (kernelSpec) {
                        vscode.commands.executeCommand(constants_1.Commands.Jupyter.StartKernelForKernelSpeck, kernelSpec, kernelSpec.language);
                    }
                });
            });
        });
    }
    displayKernelPicker(kernelspecs) {
        const items = kernelspecs.map(spec => {
            return {
                label: spec.display_name,
                description: spec.language,
                detail: spec.argv.join(' '),
                kernelspec: spec
            };
        });
        return new Promise(resolve => {
            vscode.window.showQuickPick(items, { placeHolder: 'Select a Kernel' }).then(item => {
                if (item) {
                    resolve(item.kernelspec);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.KernelPicker = KernelPicker;
//# sourceMappingURL=kernelPicker.js.map