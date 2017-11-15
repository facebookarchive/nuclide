'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const installer_1 = require("../../common/installer");
const vscode = require("vscode");
class StandardErrorHandler {
    constructor(id, product, installer, outputChannel) {
        this.id = id;
        this.product = product;
        this.installer = installer;
        this.outputChannel = outputChannel;
    }
    displayLinterError() {
        const message = `There was an error in running the linter '${this.id}'`;
        vscode.window.showErrorMessage(message, 'Disable linter', 'View Errors').then(item => {
            switch (item) {
                case 'Disable linter': {
                    installer_1.disableLinter(this.product);
                    break;
                }
                case 'View Errors': {
                    this.outputChannel.show();
                    break;
                }
            }
        });
    }
    handleError(expectedFileName, fileName, error) {
        if (typeof error === 'string' && error.indexOf("OSError: [Errno 2] No such file or directory: '/") > 0) {
            return false;
        }
        console.error('There was an error in running the linter');
        console.error(error);
        this.outputChannel.appendLine(`Linting with ${this.id} failed.\n${error + ''}`);
        this.displayLinterError();
        return true;
    }
}
exports.StandardErrorHandler = StandardErrorHandler;
//# sourceMappingURL=standard.js.map