'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../common/helpers");
const vscode = require("vscode");
const standard_1 = require("./standard");
class InvalidArgumentsErrorHandler extends standard_1.StandardErrorHandler {
    hasInvalidArgs(expectedFileName, fileName) {
        // Check if we have some custom arguments such as "pylint --load-plugins pylint_django"
        // Such settings are no longer supported
        let stuffAfterFileName = fileName.substring(fileName.toUpperCase().lastIndexOf(expectedFileName) + expectedFileName.length);
        return stuffAfterFileName.trim().indexOf(' ') > 0;
    }
    displayInvalidArgsError() {
        // Ok if we have a space after the file name, this means we have some arguments defined and this isn't supported
        vscode.window.showErrorMessage(`Unsupported configuration for '${this.id}'`, 'View Errors').then(item => {
            if (item === 'View Errors') {
                this.outputChannel.show();
            }
        });
    }
    handleError(expectedFileName, fileName, error) {
        if (!helpers_1.isNotInstalledError(error)) {
            return false;
        }
        if (!this.hasInvalidArgs(expectedFileName, fileName)) {
            return false;
        }
        const customError = `Linting failed, custom arguments in the 'python.linting.${this.id}Path' is not supported.\n` +
            `Custom arguments to the linters can be defined in 'python.linting.${this.id}Args' setting of settings.json.\n` +
            'For further details, please see https://github.com/DonJayamanne/pythonVSCode/wiki/Troubleshooting-Linting#2-linting-with-xxx-failed-';
        this.outputChannel.appendLine(`\n${customError}\n${error + ''}`);
        this.displayInvalidArgsError();
        return true;
    }
}
exports.InvalidArgumentsErrorHandler = InvalidArgumentsErrorHandler;
//# sourceMappingURL=invalidArgs.js.map