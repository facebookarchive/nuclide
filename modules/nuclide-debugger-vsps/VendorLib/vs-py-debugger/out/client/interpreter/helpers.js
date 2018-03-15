"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const vscode_1 = require("vscode");
const types_1 = require("../common/application/types");
const types_2 = require("../ioc/types");
function getFirstNonEmptyLineFromMultilineString(stdout) {
    if (!stdout) {
        return '';
    }
    const lines = stdout.split(/\r?\n/g).map(line => line.trim()).filter(line => line.length > 0);
    return lines.length > 0 ? lines[0] : '';
}
exports.getFirstNonEmptyLineFromMultilineString = getFirstNonEmptyLineFromMultilineString;
let InterpreterHelper = class InterpreterHelper {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    getActiveWorkspaceUri() {
        const workspaceService = this.serviceContainer.get(types_1.IWorkspaceService);
        const documentManager = this.serviceContainer.get(types_1.IDocumentManager);
        if (!Array.isArray(workspaceService.workspaceFolders) || workspaceService.workspaceFolders.length === 0) {
            return;
        }
        if (workspaceService.workspaceFolders.length === 1) {
            return { folderUri: workspaceService.workspaceFolders[0].uri, configTarget: vscode_1.ConfigurationTarget.Workspace };
        }
        if (documentManager.activeTextEditor) {
            const workspaceFolder = workspaceService.getWorkspaceFolder(documentManager.activeTextEditor.document.uri);
            if (workspaceFolder) {
                return { configTarget: vscode_1.ConfigurationTarget.WorkspaceFolder, folderUri: workspaceFolder.uri };
            }
        }
    }
};
InterpreterHelper = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer))
], InterpreterHelper);
exports.InterpreterHelper = InterpreterHelper;
//# sourceMappingURL=helpers.js.map