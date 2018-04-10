"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const os_1 = require("os");
const vscode_1 = require("vscode");
const types_1 = require("../../common/application/types");
const constants_1 = require("../../common/constants");
require("../../common/extensions");
let CodeExecutionHelper = class CodeExecutionHelper {
    constructor(documentManager, applicationShell) {
        this.documentManager = documentManager;
        this.applicationShell = applicationShell;
    }
    normalizeLines(code) {
        const codeLines = code.splitLines({ trim: false, removeEmptyEntries: false });
        const codeLinesWithoutEmptyLines = codeLines.filter(line => line.trim().length > 0);
        return codeLinesWithoutEmptyLines.join(os_1.EOL);
    }
    getFileToExecute() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeEditor = this.documentManager.activeTextEditor;
            if (!activeEditor) {
                this.applicationShell.showErrorMessage('No open file to run in terminal');
                return;
            }
            if (activeEditor.document.isUntitled) {
                this.applicationShell.showErrorMessage('The active file needs to be saved before it can be run');
                return;
            }
            if (activeEditor.document.languageId !== constants_1.PythonLanguage.language) {
                this.applicationShell.showErrorMessage('The active file is not a Python source file');
                return;
            }
            return activeEditor.document.uri;
        });
    }
    getSelectedTextToExecute(textEditor) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!textEditor) {
                return;
            }
            const selection = textEditor.selection;
            let code;
            if (selection.isEmpty) {
                code = textEditor.document.lineAt(selection.start.line).text;
            }
            else {
                const textRange = new vscode_1.Range(selection.start, selection.end);
                code = textEditor.document.getText(textRange);
            }
            return code;
        });
    }
};
CodeExecutionHelper = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_1.IDocumentManager)),
    __param(1, inversify_1.inject(types_1.IApplicationShell))
], CodeExecutionHelper);
exports.CodeExecutionHelper = CodeExecutionHelper;
//# sourceMappingURL=helper.js.map