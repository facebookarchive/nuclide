"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs-extra");
const path = require("path");
const vscode_1 = require("vscode");
const configSettings_1 = require("../client/common/configSettings");
const constants_1 = require("../client/common/constants");
const core_1 = require("./core");
const initialize_1 = require("./initialize");
__export(require("./core"));
// tslint:disable:no-non-null-assertion no-unsafe-any await-promise no-any no-use-before-declare no-string-based-set-timeout no-unsafe-any no-any no-invalid-this
const fileInNonRootWorkspace = path.join(constants_1.EXTENSION_ROOT_DIR, 'src', 'test', 'pythonFiles', 'dummy.py');
exports.rootWorkspaceUri = getWorkspaceRoot();
exports.PYTHON_PATH = getPythonPath();
function updateSetting(setting, value, resource, configTarget) {
    return __awaiter(this, void 0, void 0, function* () {
        const settings = vscode_1.workspace.getConfiguration('python', resource);
        const currentValue = settings.inspect(setting);
        if (currentValue !== undefined && ((configTarget === vscode_1.ConfigurationTarget.Global && currentValue.globalValue === value) ||
            (configTarget === vscode_1.ConfigurationTarget.Workspace && currentValue.workspaceValue === value) ||
            (configTarget === vscode_1.ConfigurationTarget.WorkspaceFolder && currentValue.workspaceFolderValue === value))) {
            configSettings_1.PythonSettings.dispose();
            return;
        }
        yield settings.update(setting, value, configTarget);
        yield core_1.sleep(2000);
        configSettings_1.PythonSettings.dispose();
    });
}
exports.updateSetting = updateSetting;
function getWorkspaceRoot() {
    if (!Array.isArray(vscode_1.workspace.workspaceFolders) || vscode_1.workspace.workspaceFolders.length === 0) {
        return vscode_1.Uri.file(path.join(constants_1.EXTENSION_ROOT_DIR, 'src', 'test'));
    }
    if (vscode_1.workspace.workspaceFolders.length === 1) {
        return vscode_1.workspace.workspaceFolders[0].uri;
    }
    const workspaceFolder = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(fileInNonRootWorkspace));
    return workspaceFolder ? workspaceFolder.uri : vscode_1.workspace.workspaceFolders[0].uri;
}
function retryAsync(wrapped, retryCount = 2) {
    return (...args) => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const reasons = [];
            const makeCall = () => {
                wrapped.call(this, ...args)
                    .then(resolve, (reason) => {
                    reasons.push(reason);
                    if (reasons.length >= retryCount) {
                        reject(reasons);
                    }
                    else {
                        // If failed once, lets wait for some time before trying again.
                        setTimeout(makeCall, 500);
                    }
                });
            };
            makeCall();
        });
    });
}
exports.retryAsync = retryAsync;
function setPythonPathInWorkspace(resource, config, pythonPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (config === vscode_1.ConfigurationTarget.WorkspaceFolder && !initialize_1.IS_MULTI_ROOT_TEST) {
            return;
        }
        const resourceUri = typeof resource === 'string' ? vscode_1.Uri.file(resource) : resource;
        const settings = vscode_1.workspace.getConfiguration('python', resourceUri);
        const value = settings.inspect('pythonPath');
        const prop = config === vscode_1.ConfigurationTarget.Workspace ? 'workspaceValue' : 'workspaceFolderValue';
        if (value && value[prop] !== pythonPath) {
            yield settings.update('pythonPath', pythonPath, config);
            configSettings_1.PythonSettings.dispose();
        }
    });
}
function restoreGlobalPythonPathSetting() {
    return __awaiter(this, void 0, void 0, function* () {
        const pythonConfig = vscode_1.workspace.getConfiguration('python', null);
        const currentGlobalPythonPathSetting = pythonConfig.inspect('pythonPath').globalValue;
        if (globalPythonPathSetting !== currentGlobalPythonPathSetting) {
            yield pythonConfig.update('pythonPath', undefined, true);
        }
        configSettings_1.PythonSettings.dispose();
    });
}
function deleteDirectory(dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield fs.pathExists(dir);
        if (exists) {
            yield fs.remove(dir);
        }
    });
}
exports.deleteDirectory = deleteDirectory;
function deleteFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield fs.pathExists(file);
        if (exists) {
            yield fs.remove(file);
        }
    });
}
exports.deleteFile = deleteFile;
// In some tests we will be mocking VS Code API (mocked classes)
const globalPythonPathSetting = vscode_1.workspace.getConfiguration('python') ? vscode_1.workspace.getConfiguration('python').inspect('pythonPath').globalValue : 'python';
exports.clearPythonPathInWorkspaceFolder = (resource) => __awaiter(this, void 0, void 0, function* () { return retryAsync(setPythonPathInWorkspace)(resource, vscode_1.ConfigurationTarget.WorkspaceFolder); });
exports.setPythonPathInWorkspaceRoot = (pythonPath) => __awaiter(this, void 0, void 0, function* () { return retryAsync(setPythonPathInWorkspace)(undefined, vscode_1.ConfigurationTarget.Workspace, pythonPath); });
exports.resetGlobalPythonPathSetting = () => __awaiter(this, void 0, void 0, function* () { return retryAsync(restoreGlobalPythonPathSetting)(); });
function getPythonPath() {
    if (process.env.CI_PYTHON_PATH && fs.existsSync(process.env.CI_PYTHON_PATH)) {
        return process.env.CI_PYTHON_PATH;
    }
    return 'python';
}
//# sourceMappingURL=common.js.map