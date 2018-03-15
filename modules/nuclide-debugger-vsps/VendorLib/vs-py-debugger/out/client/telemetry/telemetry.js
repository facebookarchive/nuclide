// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line:no-reference
/// <reference path="./vscode-extension-telemetry.d.ts" />
const vscode_1 = require("vscode");
// tslint:disable-next-line:import-name
const vscode_extension_telemetry_1 = require("vscode-extension-telemetry");
// tslint:disable-next-line:no-any
let telemetryReporter;
function getTelemetryReporter() {
    if (telemetryReporter) {
        return telemetryReporter;
    }
    const extensionId = 'ms-python.python';
    // tslint:disable-next-line:no-non-null-assertion
    const extension = vscode_1.extensions.getExtension(extensionId);
    // tslint:disable-next-line:no-unsafe-any
    const extensionVersion = extension.packageJSON.version;
    // tslint:disable-next-line:no-unsafe-any
    const aiKey = extension.packageJSON.contributes.debuggers[0].aiKey;
    // tslint:disable-next-line:no-unsafe-any
    return telemetryReporter = new vscode_extension_telemetry_1.default(extensionId, extensionVersion, aiKey);
}
exports.getTelemetryReporter = getTelemetryReporter;
//# sourceMappingURL=telemetry.js.map