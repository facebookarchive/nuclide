"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const configSettings_1 = require("../client/common/configSettings");
// import { IS_APPVEYOR, IS_CI_SERVER, IS_CI_SERVER_TEST_DEBUGGER,
//     IS_TRAVIS, IS_VSTS, MOCHA_CI_PROPERTIES, MOCHA_CI_REPORTFILE,
//     MOCHA_REPORTER_JUNIT } from './ciConstants';
const ciConstants_1 = require("./ciConstants");
exports.TEST_TIMEOUT = 25000;
exports.IS_MULTI_ROOT_TEST = isMultitrootTest();
// If running on CI server, then run debugger tests ONLY if the corresponding flag is enabled.
exports.TEST_DEBUGGER = ciConstants_1.IS_CI_SERVER ? ciConstants_1.IS_CI_SERVER_TEST_DEBUGGER : true;
// export { IS_APPVEYOR, IS_CI_SERVER, IS_CI_SERVER_TEST_DEBUGGER,
//     IS_TRAVIS, IS_VSTS, MOCHA_CI_PROPERTIES, MOCHA_CI_REPORTFILE,
//     MOCHA_REPORTER_JUNIT };
function isMultitrootTest() {
    return Array.isArray(vscode_1.workspace.workspaceFolders) && vscode_1.workspace.workspaceFolders.length > 1;
}
exports.IsLanguageServerTest = () => !ciConstants_1.IS_TRAVIS && (process.env.VSC_PYTHON_LANGUAGE_SERVER === '1' || !configSettings_1.PythonSettings.getInstance().jediEnabled);
//# sourceMappingURL=constants.js.map