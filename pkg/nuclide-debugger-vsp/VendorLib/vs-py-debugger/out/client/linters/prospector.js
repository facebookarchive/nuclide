'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const baseLinter = require("./baseLinter");
const utils_1 = require("./../common/utils");
const installer_1 = require("../common/installer");
class Linter extends baseLinter.BaseLinter {
    constructor(outputChannel, workspaceRootPath) {
        super('prospector', installer_1.Product.prospector, outputChannel, workspaceRootPath);
    }
    isEnabled() {
        return this.pythonSettings.linting.prospectorEnabled;
    }
    runLinter(document, cancellation) {
        if (!this.pythonSettings.linting.prospectorEnabled) {
            return Promise.resolve([]);
        }
        let prospectorPath = this.pythonSettings.linting.prospectorPath;
        let outputChannel = this.outputChannel;
        let prospectorArgs = Array.isArray(this.pythonSettings.linting.prospectorArgs) ? this.pythonSettings.linting.prospectorArgs : [];
        if (prospectorArgs.length === 0 && installer_1.ProductExecutableAndArgs.has(installer_1.Product.prospector) && prospectorPath.toLocaleLowerCase() === 'prospector') {
            prospectorPath = installer_1.ProductExecutableAndArgs.get(installer_1.Product.prospector).executable;
            prospectorArgs = installer_1.ProductExecutableAndArgs.get(installer_1.Product.prospector).args;
        }
        return new Promise((resolve, reject) => {
            utils_1.execPythonFile(prospectorPath, prospectorArgs.concat(['--absolute-paths', '--output-format=json', document.uri.fsPath]), this.workspaceRootPath, false, null, cancellation).then(data => {
                let parsedData;
                try {
                    parsedData = JSON.parse(data);
                }
                catch (ex) {
                    outputChannel.append('#'.repeat(10) + 'Linting Output - ' + this.Id + '#'.repeat(10) + '\n');
                    outputChannel.append(data);
                    return resolve([]);
                }
                let diagnostics = [];
                parsedData.messages.filter((value, index) => index <= this.pythonSettings.linting.maxNumberOfProblems).forEach(msg => {
                    let lineNumber = msg.location.line === null || isNaN(msg.location.line) ? 1 : msg.location.line;
                    diagnostics.push({
                        code: msg.code,
                        message: msg.message,
                        column: msg.location.character,
                        line: lineNumber,
                        type: msg.code,
                        provider: `${this.Id} - ${msg.source}`
                    });
                });
                resolve(diagnostics);
            }).catch(error => {
                this.handleError(this.Id, prospectorPath, error);
                resolve([]);
            });
        });
    }
}
exports.Linter = Linter;
//# sourceMappingURL=prospector.js.map