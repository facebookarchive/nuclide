"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
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
// tslint:disable-next-line:no-require-imports no-var-requires
const sudo = require('sudo-prompt');
const fs = require("fs");
const inversify_1 = require("inversify");
const path = require("path");
const vscode = require("vscode");
const contracts_1 = require("../../interpreter/contracts");
const configSettings_1 = require("../configSettings");
const constants_1 = require("../constants");
const types_1 = require("../platform/types");
const types_2 = require("../terminal/types");
const types_3 = require("../types");
let ModuleInstaller = class ModuleInstaller {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    installModule(name, resource) {
        return __awaiter(this, void 0, void 0, function* () {
            const executionInfo = yield this.getExecutionInfo(name, resource);
            const terminalService = this.serviceContainer.get(types_2.ITerminalServiceFactory).getTerminalService();
            if (executionInfo.moduleName) {
                const settings = configSettings_1.PythonSettings.getInstance(resource);
                const args = ['-m', 'pip'].concat(executionInfo.args);
                const pythonPath = settings.pythonPath;
                const locator = this.serviceContainer.get(contracts_1.IInterpreterLocatorService, contracts_1.INTERPRETER_LOCATOR_SERVICE);
                const fileSystem = this.serviceContainer.get(types_1.IFileSystem);
                const interpreters = yield locator.getInterpreters(resource);
                const currentInterpreter = interpreters.length > 1
                    ? interpreters.filter(x => fileSystem.arePathsSame(x.path, pythonPath))[0]
                    : interpreters[0];
                if (!currentInterpreter || currentInterpreter.type !== contracts_1.InterpreterType.Unknown) {
                    yield terminalService.sendCommand(pythonPath, args);
                }
                else if (settings.globalModuleInstallation) {
                    if (yield this.isPathWritableAsync(path.dirname(pythonPath))) {
                        yield terminalService.sendCommand(pythonPath, args);
                    }
                    else {
                        this.elevatedInstall(pythonPath, args);
                    }
                }
                else {
                    yield terminalService.sendCommand(pythonPath, args.concat(['--user']));
                }
            }
            else {
                yield terminalService.sendCommand(executionInfo.execPath, executionInfo.args);
            }
        });
    }
    isPathWritableAsync(directoryPath) {
        return __awaiter(this, void 0, void 0, function* () {
            const filePath = `${directoryPath}${path.sep}___vscpTest___`;
            return new Promise(resolve => {
                fs.open(filePath, fs.constants.O_CREAT | fs.constants.O_RDWR, (error, fd) => {
                    if (!error) {
                        fs.close(fd, (e) => {
                            fs.unlink(filePath);
                        });
                    }
                    return resolve(!error);
                });
            });
        });
    }
    elevatedInstall(execPath, args) {
        const options = {
            name: 'VS Code Python'
        };
        const outputChannel = this.serviceContainer.get(types_3.IOutputChannel, constants_1.STANDARD_OUTPUT_CHANNEL);
        const command = `"${execPath.replace(/\\/g, '/')}" ${args.join(' ')}`;
        outputChannel.appendLine('');
        outputChannel.appendLine(`[Elevated] ${command}`);
        sudo.exec(command, options, (error, stdout, stderr) => {
            if (error) {
                vscode.window.showErrorMessage(error);
            }
            else {
                outputChannel.show();
                if (stdout) {
                    outputChannel.appendLine('');
                    outputChannel.append(stdout);
                }
                if (stderr) {
                    outputChannel.appendLine('');
                    outputChannel.append(`Warning: ${stderr}`);
                }
            }
        });
    }
};
ModuleInstaller = __decorate([
    inversify_1.injectable()
], ModuleInstaller);
exports.ModuleInstaller = ModuleInstaller;
//# sourceMappingURL=moduleInstaller.js.map