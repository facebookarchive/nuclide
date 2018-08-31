// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
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
const types_1 = require("../../common/platform/types");
const types_2 = require("../../ioc/types");
const telemetry_1 = require("../../telemetry");
const constants_1 = require("../../telemetry/constants");
const Contracts_1 = require("../Common/Contracts");
const baseProvider_1 = require("./baseProvider");
const types_3 = require("./types");
let PythonV2DebugConfigurationProvider = class PythonV2DebugConfigurationProvider extends baseProvider_1.BaseConfigurationProvider {
    constructor(serviceContainer) {
        super('pythonExperimental', serviceContainer);
    }
    provideLaunchDefaults(workspaceFolder, debugConfiguration) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("provideLaunchDefaults").call(this, workspaceFolder, debugConfiguration);
            const debugOptions = debugConfiguration.debugOptions;
            if (debugConfiguration.debugStdLib) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.DebugStdLib);
            }
            if (debugConfiguration.django) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Django);
            }
            if (debugConfiguration.jinja) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Jinja);
            }
            if (debugConfiguration.redirectOutput || debugConfiguration.redirectOutput === undefined) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.RedirectOutput);
            }
            if (debugConfiguration.sudo) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Sudo);
            }
            if (this.serviceContainer.get(types_1.IPlatformService).isWindows) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.FixFilePathCase);
            }
            const isFlask = this.isDebuggingFlask(debugConfiguration);
            if ((debugConfiguration.pyramid || isFlask)
                && debugOptions.indexOf(Contracts_1.DebugOptions.Jinja) === -1
                && debugConfiguration.jinja !== false) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Jinja);
            }
            if (debugConfiguration.pyramid) {
                const utils = this.serviceContainer.get(types_3.IConfigurationProviderUtils);
                debugConfiguration.program = (yield utils.getPyramidStartupScriptFilePath(workspaceFolder));
            }
            this.sendTelemetry('launch', debugConfiguration);
        });
    }
    // tslint:disable-next-line:cyclomatic-complexity
    provideAttachDefaults(workspaceFolder, debugConfiguration) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            yield _super("provideAttachDefaults").call(this, workspaceFolder, debugConfiguration);
            const debugOptions = debugConfiguration.debugOptions;
            if (debugConfiguration.debugStdLib) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.DebugStdLib);
            }
            if (debugConfiguration.django) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Django);
            }
            if (debugConfiguration.jinja) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Jinja);
            }
            if (debugConfiguration.pyramid
                && debugOptions.indexOf(Contracts_1.DebugOptions.Jinja) === -1
                && debugConfiguration.jinja !== false) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.Jinja);
            }
            if (debugConfiguration.redirectOutput || debugConfiguration.redirectOutput === undefined) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.RedirectOutput);
            }
            // We'll need paths to be fixed only in the case where local and remote hosts are the same
            // I.e. only if hostName === 'localhost' or '127.0.0.1' or ''
            const isLocalHost = this.isLocalHost(debugConfiguration.host);
            if (this.serviceContainer.get(types_1.IPlatformService).isWindows && isLocalHost) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.FixFilePathCase);
            }
            if (this.serviceContainer.get(types_1.IPlatformService).isWindows) {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.WindowsClient);
            }
            else {
                this.debugOption(debugOptions, Contracts_1.DebugOptions.UnixClient);
            }
            if (!debugConfiguration.pathMappings) {
                debugConfiguration.pathMappings = [];
            }
            // This is for backwards compatibility.
            if (debugConfiguration.localRoot && debugConfiguration.remoteRoot) {
                debugConfiguration.pathMappings.push({
                    localRoot: debugConfiguration.localRoot,
                    remoteRoot: debugConfiguration.remoteRoot
                });
            }
            // If attaching to local host, then always map local root and remote roots.
            if (workspaceFolder && debugConfiguration.host &&
                debugConfiguration.pathMappings.length === 0 &&
                ['LOCALHOST', '127.0.0.1', '::1'].indexOf(debugConfiguration.host.toUpperCase()) >= 0) {
                debugConfiguration.pathMappings.push({
                    localRoot: workspaceFolder.fsPath,
                    remoteRoot: workspaceFolder.fsPath
                });
            }
            this.sendTelemetry('attach', debugConfiguration);
        });
    }
    debugOption(debugOptions, debugOption) {
        if (debugOptions.indexOf(debugOption) >= 0) {
            return;
        }
        debugOptions.push(debugOption);
    }
    isLocalHost(hostName) {
        const LocalHosts = ['localhost', '127.0.0.1', '::1'];
        return (hostName && LocalHosts.indexOf(hostName.toLowerCase()) >= 0) ? true : false;
    }
    isDebuggingFlask(debugConfiguration) {
        return (debugConfiguration.module && debugConfiguration.module.toUpperCase() === 'FLASK') ? true : false;
    }
    sendTelemetry(trigger, debugConfiguration) {
        const telemetryProps = {
            trigger,
            console: debugConfiguration.console,
            hasEnvVars: typeof debugConfiguration.env === 'object' && Object.keys(debugConfiguration.env).length > 0,
            django: !!debugConfiguration.django,
            flask: this.isDebuggingFlask(debugConfiguration),
            hasArgs: Array.isArray(debugConfiguration.args) && debugConfiguration.args.length > 0,
            isLocalhost: this.isLocalHost(debugConfiguration.host),
            isModule: typeof debugConfiguration.module === 'string' && debugConfiguration.module.length > 0,
            isSudo: !!debugConfiguration.sudo,
            jinja: !!debugConfiguration.jinja,
            pyramid: !!debugConfiguration.pyramid,
            stopOnEntry: !!debugConfiguration.stopOnEntry
        };
        telemetry_1.sendTelemetryEvent(constants_1.DEBUGGER, undefined, telemetryProps);
    }
};
PythonV2DebugConfigurationProvider = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_2.IServiceContainer))
], PythonV2DebugConfigurationProvider);
exports.PythonV2DebugConfigurationProvider = PythonV2DebugConfigurationProvider;
//# sourceMappingURL=pythonV2Provider.js.map