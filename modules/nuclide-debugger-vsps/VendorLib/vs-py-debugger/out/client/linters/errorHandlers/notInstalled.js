'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../../common/helpers");
const standard_1 = require("./standard");
class NotInstalledErrorHandler extends standard_1.StandardErrorHandler {
    handleError(expectedFileName, fileName, error) {
        if (!helpers_1.isNotInstalledError(error)) {
            return false;
        }
        this.installer.promptToInstall(this.product);
        const customError = `Linting with ${this.id} failed.\nYou could either install the '${this.id}' linter or turn it off in setings.json via "python.linting.${this.id}Enabled = false".`;
        this.outputChannel.appendLine(`\n${customError}\n${error + ''}`);
        return true;
    }
}
exports.NotInstalledErrorHandler = NotInstalledErrorHandler;
//# sourceMappingURL=notInstalled.js.map