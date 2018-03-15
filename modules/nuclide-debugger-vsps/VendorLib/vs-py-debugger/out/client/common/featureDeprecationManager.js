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
const browser_1 = require("./net/browser");
const deprecatedFeatures = [
    {
        doNotDisplayPromptStateKey: 'SHOW_DEPRECATED_FEATURE_PROMPT_FORMAT_ON_SAVE',
        message: 'The setting \'python.formatting.formatOnSave\' is deprecated, please use \'editor.formatOnSave\'.',
        moreInfoUrl: 'https://github.com/Microsoft/vscode-python/issues/309',
        setting: { setting: 'formatting.formatOnSave', values: ['true', true] }
    },
    {
        doNotDisplayPromptStateKey: 'SHOW_DEPRECATED_FEATURE_PROMPT_LINT_ON_TEXT_CHANGE',
        message: 'The setting \'python.linting.lintOnTextChange\' is deprecated, please enable \'python.linting.lintOnSave\' and \'files.autoSave\'.',
        moreInfoUrl: 'https://github.com/Microsoft/vscode-python/issues/313',
        setting: { setting: 'linting.lintOnTextChange', values: ['true', true] }
    }
];
class FeatureDeprecationManager {
    constructor(persistentStateFactory, jupyterExtensionInstalled) {
        this.persistentStateFactory = persistentStateFactory;
        this.jupyterExtensionInstalled = jupyterExtensionInstalled;
        this.disposables = [];
    }
    dispose() {
        this.disposables.forEach(disposable => disposable.dispose());
    }
    initialize() {
        deprecatedFeatures.forEach(this.registerDeprecation.bind(this));
    }
    registerDeprecation(deprecatedInfo) {
        if (Array.isArray(deprecatedInfo.commands)) {
            deprecatedInfo.commands.forEach(cmd => {
                this.disposables.push(vscode_1.commands.registerCommand(cmd, () => this.notifyDeprecation(deprecatedInfo), this));
            });
        }
        if (deprecatedInfo.setting) {
            this.checkAndNotifyDeprecatedSetting(deprecatedInfo);
        }
    }
    checkAndNotifyDeprecatedSetting(deprecatedInfo) {
        let notify = false;
        if (Array.isArray(vscode_1.workspace.workspaceFolders) && vscode_1.workspace.workspaceFolders.length > 0) {
            vscode_1.workspace.workspaceFolders.forEach(workspaceFolder => {
                if (notify) {
                    return;
                }
                notify = this.isDeprecatedSettingAndValueUsed(vscode_1.workspace.getConfiguration('python', workspaceFolder.uri), deprecatedInfo.setting);
            });
        }
        else {
            notify = this.isDeprecatedSettingAndValueUsed(vscode_1.workspace.getConfiguration('python'), deprecatedInfo.setting);
        }
        if (notify) {
            this.notifyDeprecation(deprecatedInfo)
                .catch(ex => console.error('Python Extension: notifyDeprecation', ex));
        }
    }
    isDeprecatedSettingAndValueUsed(pythonConfig, deprecatedSetting) {
        if (!pythonConfig.has(deprecatedSetting.setting)) {
            return false;
        }
        if (!Array.isArray(deprecatedSetting.values) || deprecatedSetting.values.length === 0) {
            return true;
        }
        return deprecatedSetting.values.indexOf(pythonConfig.get(deprecatedSetting.setting)) >= 0;
    }
    notifyDeprecation(deprecatedInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            const notificationPromptEnabled = this.persistentStateFactory.createGlobalPersistentState(deprecatedInfo.doNotDisplayPromptStateKey, true);
            if (!notificationPromptEnabled.value) {
                return;
            }
            const moreInfo = 'Learn more';
            const doNotShowAgain = 'Never show again';
            const option = yield vscode_1.window.showInformationMessage(deprecatedInfo.message, moreInfo, doNotShowAgain);
            if (!option) {
                return;
            }
            switch (option) {
                case moreInfo: {
                    browser_1.launch(deprecatedInfo.moreInfoUrl);
                    break;
                }
                case doNotShowAgain: {
                    yield notificationPromptEnabled.updateValue(false);
                    break;
                }
                default: {
                    throw new Error('Selected option not supported.');
                }
            }
        });
    }
}
exports.FeatureDeprecationManager = FeatureDeprecationManager;
//# sourceMappingURL=featureDeprecationManager.js.map