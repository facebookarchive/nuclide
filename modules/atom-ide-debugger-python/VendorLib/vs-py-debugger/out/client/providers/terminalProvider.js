"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../common/application/types");
const constants_1 = require("../common/constants");
const types_2 = require("../common/terminal/types");
class TerminalProvider {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
        this.disposables = [];
        this.registerCommands();
    }
    dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }
    registerCommands() {
        const commandManager = this.serviceContainer.get(types_1.ICommandManager);
        const disposable = commandManager.registerCommand(constants_1.Commands.Create_Terminal, this.onCreateTerminal, this);
        this.disposables.push(disposable);
    }
    onCreateTerminal() {
        return __awaiter(this, void 0, void 0, function* () {
            const terminalService = this.serviceContainer.get(types_2.ITerminalServiceFactory);
            const activeResource = this.getActiveResource();
            yield terminalService.createTerminalService(activeResource, 'Python').show();
        });
    }
    getActiveResource() {
        const documentManager = this.serviceContainer.get(types_1.IDocumentManager);
        if (documentManager.activeTextEditor && !documentManager.activeTextEditor.document.isUntitled) {
            return documentManager.activeTextEditor.document.uri;
        }
        const workspace = this.serviceContainer.get(types_1.IWorkspaceService);
        return Array.isArray(workspace.workspaceFolders) && workspace.workspaceFolders.length > 0 ? workspace.workspaceFolders[0].uri : undefined;
    }
}
exports.TerminalProvider = TerminalProvider;
//# sourceMappingURL=terminalProvider.js.map