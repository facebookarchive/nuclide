'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseLinter = require("./baseLinter");
const installer_1 = require("../common/installer");
const REGEX = '(?<file>.py):(?<line>\\d+): (?<type>\\w+): (?<message>.*)\\r?(\\n|$)';
class Linter extends baseLinter.BaseLinter {
    constructor(outputChannel, workspaceRootPath) {
        super('mypy', installer_1.Product.mypy, outputChannel, workspaceRootPath);
    }
    isEnabled() {
        return this.pythonSettings.linting.mypyEnabled;
    }
    runLinter(document, cancellation) {
        if (!this.pythonSettings.linting.mypyEnabled) {
            return Promise.resolve([]);
        }
        let mypyPath = this.pythonSettings.linting.mypyPath;
        let mypyArgs = Array.isArray(this.pythonSettings.linting.mypyArgs) ? this.pythonSettings.linting.mypyArgs : [];
        if (mypyArgs.length === 0 && installer_1.ProductExecutableAndArgs.has(installer_1.Product.mypy) && mypyPath.toLocaleLowerCase() === 'mypy') {
            mypyPath = installer_1.ProductExecutableAndArgs.get(installer_1.Product.mypy).executable;
            mypyArgs = installer_1.ProductExecutableAndArgs.get(installer_1.Product.mypy).args;
        }
        return new Promise((resolve, reject) => {
            this.run(mypyPath, mypyArgs.concat([document.uri.fsPath]), document, this.workspaceRootPath, cancellation, REGEX).then(messages => {
                messages.forEach(msg => {
                    msg.severity = this.parseMessagesSeverity(msg.type, this.pythonSettings.linting.mypyCategorySeverity);
                    msg.code = msg.type;
                });
                resolve(messages);
            }, reject);
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=mypy.js.map