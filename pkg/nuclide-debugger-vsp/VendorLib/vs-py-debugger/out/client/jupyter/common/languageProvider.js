"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const os_1 = require("os");
class LanguageProviders {
    static registerLanguageProvider(language, provider) {
        if (typeof language !== 'string' || language.length === 0) {
            throw new Error(`Argument 'language' is invalid`);
        }
        if (typeof provider !== 'object' || language === null) {
            throw new Error(`Argument 'provider' is invalid`);
        }
        LanguageProviders.providers.set(language, provider);
    }
    static cellIdentifier(language) {
        return LanguageProviders.providers.has(language) ?
            LanguageProviders.providers.get(language).cellIdentifier : null;
    }
    static getSelectedCode(language, selectedCode, currentCell) {
        return LanguageProviders.providers.has(language) ?
            LanguageProviders.providers.get(language).getSelectedCode(selectedCode, currentCell) :
            Promise.resolve(selectedCode);
    }
    static getFirstLineOfExecutableCode(language, defaultRange, document, range) {
        return LanguageProviders.providers.has(language) ?
            LanguageProviders.providers.get(language).getFirstLineOfExecutableCode(document, range) :
            Promise.resolve(defaultRange);
    }
    static getLanguageSetting(language) {
        let jupyterConfig = vscode_1.workspace.getConfiguration('jupyter');
        let langSettings = jupyterConfig.get('languages');
        let lowerLang = language.toLowerCase();
        return langSettings.find(setting => setting.languageId.toLowerCase() === lowerLang);
    }
    static getDefaultKernel(language) {
        let langSetting = LanguageProviders.getLanguageSetting(language);
        return langSetting ? langSetting.defaultKernel : null;
    }
    static getStartupCode(language) {
        let langSetting = LanguageProviders.getLanguageSetting(language);
        if (!langSetting || langSetting.startupCode.length === 0) {
            return null;
        }
        return langSetting.startupCode.join(os_1.EOL);
    }
}
LanguageProviders.providers = new Map();
exports.LanguageProviders = LanguageProviders;
//# sourceMappingURL=languageProvider.js.map