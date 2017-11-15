'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseLinter = require("./baseLinter");
const installer_1 = require("../common/installer");
class Linter extends baseLinter.BaseLinter {
    constructor(outputChannel, workspaceRootPath) {
        super('flake8', installer_1.Product.flake8, outputChannel, workspaceRootPath);
        this._columnOffset = 1;
    }
    isEnabled() {
        return this.pythonSettings.linting.flake8Enabled;
    }
    runLinter(document, cancellation) {
        if (!this.pythonSettings.linting.flake8Enabled) {
            return Promise.resolve([]);
        }
        let flake8Path = this.pythonSettings.linting.flake8Path;
        let flake8Args = Array.isArray(this.pythonSettings.linting.flake8Args) ? this.pythonSettings.linting.flake8Args : [];
        if (flake8Args.length === 0 && installer_1.ProductExecutableAndArgs.has(installer_1.Product.flake8) && flake8Path.toLocaleLowerCase() === 'flake8') {
            flake8Path = installer_1.ProductExecutableAndArgs.get(installer_1.Product.flake8).executable;
            flake8Args = installer_1.ProductExecutableAndArgs.get(installer_1.Product.flake8).args;
        }
        return new Promise((resolve, reject) => {
            this.run(flake8Path, flake8Args.concat(['--format=%(row)d,%(col)d,%(code).1s,%(code)s:%(text)s', document.uri.fsPath]), document, this.workspaceRootPath, cancellation).then(messages => {
                messages.forEach(msg => {
                    msg.severity = this.parseMessagesSeverity(msg.type, this.pythonSettings.linting.flake8CategorySeverity);
                });
                resolve(messages);
            }, reject);
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=flake8.js.map