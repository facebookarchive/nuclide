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
const vscode_1 = require("vscode");
const helpers_1 = require("../common/helpers");
class ProgressReporting {
    constructor(languageClient) {
        this.languageClient = languageClient;
        this.languageClient.onNotification('python/setStatusBarMessage', (m) => {
            if (this.statusBarMessage) {
                this.statusBarMessage.dispose();
            }
            this.statusBarMessage = vscode_1.window.setStatusBarMessage(m);
        });
        this.languageClient.onNotification('python/beginProgress', (_) => __awaiter(this, void 0, void 0, function* () {
            this.progressDeferred = helpers_1.createDeferred();
            vscode_1.window.withProgress({
                location: vscode_1.ProgressLocation.Window,
                title: ''
            }, progress => {
                this.progress = progress;
                return this.progressDeferred.promise;
            });
        }));
        this.languageClient.onNotification('python/reportProgress', (m) => {
            if (!this.progress) {
                return;
            }
            this.progress.report({ message: m });
        });
        this.languageClient.onNotification('python/endProgress', _ => {
            if (this.progressDeferred) {
                this.progressDeferred.resolve();
                this.progressDeferred = undefined;
            }
        });
    }
}
exports.ProgressReporting = ProgressReporting;
//# sourceMappingURL=progress.js.map