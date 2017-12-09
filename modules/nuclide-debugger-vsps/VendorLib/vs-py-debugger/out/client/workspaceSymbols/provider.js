"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const configSettings_1 = require("../common/configSettings");
const parser_1 = require("./parser");
const utils_1 = require("../common/utils");
const constants_1 = require("../common/constants");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
class WorkspaceSymbolProvider {
    constructor(tagGenerator, outputChannel) {
        this.tagGenerator = tagGenerator;
        this.outputChannel = outputChannel;
    }
    provideWorkspaceSymbols(query, token) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!pythonSettings.workspaceSymbols.enabled) {
                return [];
            }
            if (!vscode.workspace || typeof vscode.workspace.rootPath !== 'string' || vscode.workspace.rootPath.length === 0) {
                return Promise.resolve([]);
            }
            // check whether tag file needs to be built
            const tagFileExists = yield utils_1.fsExistsAsync(pythonSettings.workspaceSymbols.tagFilePath);
            if (!tagFileExists) {
                yield vscode.commands.executeCommand(constants_1.Commands.Build_Workspace_Symbols, false, token);
            }
            // load tags
            const items = yield parser_1.parseTags(query, token);
            if (!Array.isArray(items)) {
                return [];
            }
            return items.map(item => new vscode.SymbolInformation(item.symbolName, item.symbolKind, '', new vscode.Location(vscode.Uri.file(item.fileName), item.position)));
        });
    }
}
exports.WorkspaceSymbolProvider = WorkspaceSymbolProvider;
//# sourceMappingURL=provider.js.map