'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseLinter = require("./baseLinter");
const installer_1 = require("../common/installer");
class Linter extends baseLinter.BaseLinter {
    constructor(outputChannel, workspaceRootPath) {
        super('pep8', installer_1.Product.pep8, outputChannel, workspaceRootPath);
        this._columnOffset = 1;
    }
    isEnabled() {
        return this.pythonSettings.linting.pep8Enabled;
    }
    runLinter(document, cancellation) {
        if (!this.pythonSettings.linting.pep8Enabled) {
            return Promise.resolve([]);
        }
        let pep8Path = this.pythonSettings.linting.pep8Path;
        let pep8Args = Array.isArray(this.pythonSettings.linting.pep8Args) ? this.pythonSettings.linting.pep8Args : [];
        if (pep8Args.length === 0 && installer_1.ProductExecutableAndArgs.has(installer_1.Product.pep8) && pep8Path.toLocaleLowerCase() === 'pep8') {
            pep8Path = installer_1.ProductExecutableAndArgs.get(installer_1.Product.pep8).executable;
            pep8Args = installer_1.ProductExecutableAndArgs.get(installer_1.Product.pep8).args;
        }
        return new Promise(resolve => {
            this.run(pep8Path, pep8Args.concat(['--format=%(row)d,%(col)d,%(code).1s,%(code)s:%(text)s', document.uri.fsPath]), document, this.workspaceRootPath, cancellation).then(messages => {
                messages.forEach(msg => {
                    msg.severity = this.parseMessagesSeverity(msg.type, this.pythonSettings.linting.pep8CategorySeverity);
                });
                resolve(messages);
            });
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=pep8Linter.js.map