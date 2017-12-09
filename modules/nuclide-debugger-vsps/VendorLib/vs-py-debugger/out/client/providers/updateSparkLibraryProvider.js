"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../common/constants");
const vscode = require("vscode");
const path = require("path");
function activateUpdateSparkLibraryProvider() {
    return vscode.commands.registerCommand(constants_1.Commands.Update_SparkLibrary, updateSparkLibrary);
}
exports.activateUpdateSparkLibraryProvider = activateUpdateSparkLibraryProvider;
function updateSparkLibrary() {
    const pythonConfig = vscode.workspace.getConfiguration('python');
    const extraLibPath = 'autoComplete.extraPaths';
    let sparkHomePath = '${env.SPARK_HOME}';
    pythonConfig.update(extraLibPath, [path.join(sparkHomePath, 'python'),
        path.join(sparkHomePath, 'python/pyspark')]).then(() => {
        //Done
    }, reason => {
        vscode.window.showErrorMessage(`Failed to update ${extraLibPath}. Error: ${reason.message}`);
        console.error(reason);
    });
    vscode.window.showInformationMessage(`Make sure you have SPARK_HOME environment variable set to the root path of the local spark installation!`);
}
//# sourceMappingURL=updateSparkLibraryProvider.js.map