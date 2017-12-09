"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const generator_1 = require("./generator");
const installer_1 = require("../common/installer");
const configSettings_1 = require("../common/configSettings");
const utils_1 = require("../common/utils");
const helpers_1 = require("../common/helpers");
const constants_1 = require("../common/constants");
const provider_1 = require("./provider");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
class WorkspaceSymbols {
    constructor(outputChannel) {
        this.outputChannel = outputChannel;
        this.disposables = [];
        this.disposables.push(this.outputChannel);
        this.generator = new generator_1.Generator(this.outputChannel);
        this.disposables.push(this.generator);
        this.installer = new installer_1.Installer();
        this.disposables.push(this.installer);
        this.registerCommands();
        // The extension has just loaded, so lets rebuild the tags
        vscode.languages.registerWorkspaceSymbolProvider(new provider_1.WorkspaceSymbolProvider(this.generator, this.outputChannel));
        this.buildWorkspaceSymbols(true);
    }
    registerCommands() {
        this.disposables.push(vscode.commands.registerCommand(constants_1.Commands.Build_Workspace_Symbols, this.buildWorkspaceSymbols.bind(this, true)));
    }
    registerOnSaveHandlers() {
        this.disposables.push(vscode.workspace.onDidSaveTextDocument(this.onDidSaveTextDocument.bind(this)));
    }
    onDidSaveTextDocument(textDocument) {
        if (textDocument.languageId === constants_1.PythonLanguage.language) {
            this.rebuildTags();
        }
    }
    rebuildTags() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        this.timeout = setTimeout(() => {
            this.buildWorkspaceSymbols(true);
        }, 5000);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
    disableDocumentLanguageProvider() {
        const pythonConfig = vscode.workspace.getConfiguration('python');
        return pythonConfig.update('python.workspaceSymbols.enabled', false);
    }
    buildWorkspaceSymbols(rebuild = true, token) {
        if (!pythonSettings.workspaceSymbols.enabled || (token && token.isCancellationRequested)) {
            return Promise.resolve([]);
        }
        if (!vscode.workspace || typeof vscode.workspace.rootPath !== 'string' || vscode.workspace.rootPath.length === 0) {
            return Promise.resolve([]);
        }
        return utils_1.fsExistsAsync(pythonSettings.workspaceSymbols.tagFilePath).then(exits => {
            let promise = Promise.resolve();
            // if file doesn't exist, then run the ctag generator
            // Or check if required to rebuild
            if (rebuild || !exits) {
                promise = this.generator.generateWorkspaceTags();
            }
            return promise.catch(reason => {
                if (!helpers_1.isNotInstalledError(reason)) {
                    this.outputChannel.show();
                    return Promise.reject(reason);
                }
                if (!token || token.isCancellationRequested) {
                    return;
                }
                return new Promise((resolve, reject) => {
                    vscode.window.showErrorMessage('CTags needs to be installed to get support for Python workspace symbols', 'Install', `Don't ask again`).then(item => {
                        switch (item) {
                            case 'Install': {
                                this.installer.install(installer_1.Product.ctags).then(() => {
                                    return this.buildWorkspaceSymbols(rebuild, token);
                                }).catch(reason => reject(reason));
                                break;
                            }
                            case `Don't ask again`: {
                                this.disableDocumentLanguageProvider().then(() => resolve(), reason => reject(reason));
                                break;
                            }
                        }
                    });
                });
            });
        });
    }
}
exports.WorkspaceSymbols = WorkspaceSymbols;
//# sourceMappingURL=main.js.map