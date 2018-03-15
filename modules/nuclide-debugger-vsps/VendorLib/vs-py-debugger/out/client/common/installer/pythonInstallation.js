// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const contracts_1 = require("../../interpreter/contracts");
const helpers_1 = require("../../interpreter/locators/helpers");
const types_1 = require("../application/types");
const types_2 = require("../platform/types");
class PythonInstaller {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
        this.locator = serviceContainer.get(contracts_1.IInterpreterLocatorService, contracts_1.INTERPRETER_LOCATOR_SERVICE);
        this.shell = serviceContainer.get(types_1.IApplicationShell);
    }
    checkPythonInstallation(settings) {
        return __awaiter(this, void 0, void 0, function* () {
            if (settings.disableInstallationChecks === true) {
                return true;
            }
            const interpreters = yield this.locator.getInterpreters();
            if (interpreters.length > 0) {
                const platform = this.serviceContainer.get(types_2.IPlatformService);
                if (platform.isMac && helpers_1.isMacDefaultPythonPath(settings.pythonPath)) {
                    const interpreterService = this.serviceContainer.get(contracts_1.IInterpreterService);
                    const interpreter = yield interpreterService.getActiveInterpreter();
                    if (interpreter && interpreter.type === contracts_1.InterpreterType.Unknown) {
                        yield this.shell.showWarningMessage('Selected interpreter is macOS system Python which is not recommended. Please select different interpreter');
                    }
                }
                return true;
            }
            const download = 'Download';
            if ((yield this.shell.showErrorMessage('Python is not installed. Please download and install Python before using the extension.', download)) === download) {
                this.shell.openUrl('https://www.python.org/downloads');
            }
            return false;
        });
    }
}
exports.PythonInstaller = PythonInstaller;
//# sourceMappingURL=pythonInstallation.js.map