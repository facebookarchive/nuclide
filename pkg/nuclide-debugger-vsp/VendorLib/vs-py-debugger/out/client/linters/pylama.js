'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseLinter = require("./baseLinter");
const installer_1 = require("../common/installer");
const REGEX = '(?<file>.py):(?<line>\\d+):(?<column>\\d+): \\[(?<type>\\w+)\\] (?<code>\\w\\d+):? (?<message>.*)\\r?(\\n|$)';
class Linter extends baseLinter.BaseLinter {
    constructor(outputChannel, workspaceRootPath) {
        super('pylama', installer_1.Product.pylama, outputChannel, workspaceRootPath);
        this._columnOffset = 1;
    }
    isEnabled() {
        return this.pythonSettings.linting.pylamaEnabled;
    }
    runLinter(document, cancellation) {
        if (!this.pythonSettings.linting.pylamaEnabled) {
            return Promise.resolve([]);
        }
        let pylamaPath = this.pythonSettings.linting.pylamaPath;
        let pylamaArgs = Array.isArray(this.pythonSettings.linting.pylamaArgs) ? this.pythonSettings.linting.pylamaArgs : [];
        if (pylamaArgs.length === 0 && installer_1.ProductExecutableAndArgs.has(installer_1.Product.pylama) && pylamaPath.toLocaleLowerCase() === 'pylama') {
            pylamaPath = installer_1.ProductExecutableAndArgs.get(installer_1.Product.pylama).executable;
            pylamaArgs = installer_1.ProductExecutableAndArgs.get(installer_1.Product.pylama).args;
        }
        return new Promise(resolve => {
            this.run(pylamaPath, pylamaArgs.concat(['--format=parsable', document.uri.fsPath]), document, this.workspaceRootPath, cancellation, REGEX).then(messages => {
                // All messages in pylama are treated as warnings for now
                messages.forEach(msg => {
                    msg.severity = baseLinter.LintMessageSeverity.Information;
                });
                resolve(messages);
            });
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=pylama.js.map