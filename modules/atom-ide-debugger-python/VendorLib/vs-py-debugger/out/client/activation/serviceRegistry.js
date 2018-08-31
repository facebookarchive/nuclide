// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../common/types");
const languageServerSurveyBanner_1 = require("../languageServices/languageServerSurveyBanner");
const proposeLanguageServerBanner_1 = require("../languageServices/proposeLanguageServerBanner");
const activationService_1 = require("./activationService");
const jedi_1 = require("./jedi");
const languageServer_1 = require("./languageServer");
const types_2 = require("./types");
function registerTypes(serviceManager) {
    serviceManager.addSingleton(types_2.IExtensionActivationService, activationService_1.ExtensionActivationService);
    serviceManager.add(types_2.IExtensionActivator, jedi_1.JediExtensionActivator, types_2.ExtensionActivators.Jedi);
    serviceManager.add(types_2.IExtensionActivator, languageServer_1.LanguageServerExtensionActivator, types_2.ExtensionActivators.DotNet);
    serviceManager.addSingleton(types_1.IPythonExtensionBanner, languageServerSurveyBanner_1.LanguageServerSurveyBanner, types_1.BANNER_NAME_LS_SURVEY);
    serviceManager.addSingleton(types_1.IPythonExtensionBanner, proposeLanguageServerBanner_1.ProposeLanguageServerBanner, types_1.BANNER_NAME_PROPOSE_LS);
}
exports.registerTypes = registerTypes;
//# sourceMappingURL=serviceRegistry.js.map