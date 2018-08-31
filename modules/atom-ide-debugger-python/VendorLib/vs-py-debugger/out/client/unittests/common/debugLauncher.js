"use strict";
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
const path = require("path");
const vscode_1 = require("vscode");
const types_1 = require("../../common/application/types");
const constants_1 = require("../../common/constants");
const types_2 = require("../../common/types");
const constants_2 = require("../../debugger/Common/constants");
const Contracts_1 = require("../../debugger/Common/Contracts");
const types_3 = require("../../ioc/types");
let DebugLauncher = class DebugLauncher {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    launchDebugger(options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (options.token && options.token.isCancellationRequested) {
                return;
            }
            const cwdUri = options.cwd ? vscode_1.Uri.file(options.cwd) : undefined;
            const workspaceService = this.serviceContainer.get(types_1.IWorkspaceService);
            if (!workspaceService.hasWorkspaceFolders) {
                throw new Error('Please open a workspace');
            }
            let workspaceFolder = workspaceService.getWorkspaceFolder(cwdUri);
            if (!workspaceFolder) {
                workspaceFolder = workspaceService.workspaceFolders[0];
            }
            const cwd = cwdUri ? cwdUri.fsPath : workspaceFolder.uri.fsPath;
            const configSettings = this.serviceContainer.get(types_2.IConfigurationService).getSettings(vscode_1.Uri.file(cwd));
            const useExperimentalDebugger = configSettings.unitTest.useExperimentalDebugger === true;
            const debugManager = this.serviceContainer.get(types_1.IDebugService);
            const debuggerType = useExperimentalDebugger ? constants_2.ExperimentalDebuggerType : 'python';
            const debugArgs = this.fixArgs(options.args, options.testProvider, useExperimentalDebugger);
            const program = this.getTestLauncherScript(options.testProvider, useExperimentalDebugger);
            return debugManager.startDebugging(workspaceFolder, {
                name: 'Debug Unit Test',
                type: debuggerType,
                request: 'launch',
                program,
                cwd,
                args: debugArgs,
                console: 'none',
                envFile: configSettings.envFile,
                debugOptions: [Contracts_1.DebugOptions.RedirectOutput]
            }).then(() => void (0));
        });
    }
    fixArgs(args, testProvider, useExperimentalDebugger) {
        if (testProvider === 'unittest' && useExperimentalDebugger) {
            return args.filter(item => item !== '--debug');
        }
        else {
            return args;
        }
    }
    getTestLauncherScript(testProvider, useExperimentalDebugger) {
        switch (testProvider) {
            case 'unittest': {
                return path.join(constants_1.EXTENSION_ROOT_DIR, 'pythonFiles', 'PythonTools', 'visualstudio_py_testlauncher.py');
            }
            case 'pytest':
            case 'nosetest': {
                if (useExperimentalDebugger) {
                    return path.join(constants_1.EXTENSION_ROOT_DIR, 'pythonFiles', 'experimental', 'testlauncher.py');
                }
                else {
                    return path.join(constants_1.EXTENSION_ROOT_DIR, 'pythonFiles', 'PythonTools', 'testlauncher.py');
                }
            }
            default: {
                throw new Error(`Unknown test provider '${testProvider}'`);
            }
        }
    }
};
DebugLauncher = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_3.IServiceContainer))
], DebugLauncher);
exports.DebugLauncher = DebugLauncher;
//# sourceMappingURL=debugLauncher.js.map