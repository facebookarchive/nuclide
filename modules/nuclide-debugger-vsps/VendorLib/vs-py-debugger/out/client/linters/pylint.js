'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseLinter = require("./baseLinter");
const installer_1 = require("../common/installer");
class Linter extends baseLinter.BaseLinter {
    constructor(outputChannel, workspaceRootPath) {
        super('pylint', installer_1.Product.pylint, outputChannel, workspaceRootPath);
    }
    isEnabled() {
        return this.pythonSettings.linting.pylintEnabled;
    }
    runLinter(document, cancellation) {
        if (!this.pythonSettings.linting.pylintEnabled) {
            return Promise.resolve([]);
        }
        let pylintPath = this.pythonSettings.linting.pylintPath;
        let pylintArgs = Array.isArray(this.pythonSettings.linting.pylintArgs) ? this.pythonSettings.linting.pylintArgs : [];
        if (pylintArgs.length === 0 && installer_1.ProductExecutableAndArgs.has(installer_1.Product.pylint) && pylintPath === 'pylint') {
            pylintPath = installer_1.ProductExecutableAndArgs.get(installer_1.Product.pylint).executable;
            pylintArgs = installer_1.ProductExecutableAndArgs.get(installer_1.Product.pylint).args;
        }
        return new Promise((resolve, reject) => {
            this.run(pylintPath, pylintArgs.concat(['--msg-template=\'{line},{column},{category},{msg_id}:{msg}\'', '--reports=n', '--output-format=text', document.uri.fsPath]), document, this.workspaceRootPath, cancellation).then(messages => {
                messages.forEach(msg => {
                    msg.severity = this.parseMessagesSeverity(msg.type, this.pythonSettings.linting.pylintCategorySeverity);
                });
                resolve(messages);
            }, reject);
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=pylint.js.map