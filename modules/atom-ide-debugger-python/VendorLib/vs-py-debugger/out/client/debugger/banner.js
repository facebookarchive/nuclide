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
const crypto = require("crypto");
const inversify_1 = require("inversify");
const types_1 = require("../common/application/types");
require("../common/extensions");
const types_2 = require("../common/types");
const types_3 = require("../ioc/types");
const constants_1 = require("./Common/constants");
var PersistentStateKeys;
(function (PersistentStateKeys) {
    PersistentStateKeys["ShowBanner"] = "ShowBanner";
    PersistentStateKeys["DebuggerLaunchCounter"] = "DebuggerLaunchCounter";
    PersistentStateKeys["DebuggerLaunchThresholdCounter"] = "DebuggerLaunchThresholdCounter";
})(PersistentStateKeys = exports.PersistentStateKeys || (exports.PersistentStateKeys = {}));
let ExperimentalDebuggerBanner = class ExperimentalDebuggerBanner {
    constructor(serviceContainer) {
        this.serviceContainer = serviceContainer;
    }
    get enabled() {
        const factory = this.serviceContainer.get(types_2.IPersistentStateFactory);
        return factory.createGlobalPersistentState(PersistentStateKeys.ShowBanner, true).value;
    }
    initialize() {
        if (this.initialized) {
            return;
        }
        this.initialized = true;
        // Don't even bother adding handlers if banner has been turned off.
        if (!this.enabled) {
            return;
        }
        const debuggerService = this.serviceContainer.get(types_1.IDebugService);
        const disposable = debuggerService.onDidTerminateDebugSession((e) => __awaiter(this, void 0, void 0, function* () {
            if (e.type === constants_1.ExperimentalDebuggerType) {
                const logger = this.serviceContainer.get(types_2.ILogger);
                yield this.onDidTerminateDebugSession()
                    .catch(ex => logger.logError('Error in debugger Banner', ex));
            }
        }));
        this.serviceContainer.get(types_2.IDisposableRegistry).push(disposable);
    }
    showBanner() {
        return __awaiter(this, void 0, void 0, function* () {
            const appShell = this.serviceContainer.get(types_1.IApplicationShell);
            const yes = 'Yes, take survey now';
            const no = 'No thanks';
            const response = yield appShell.showInformationMessage('Can you please take 2 minutes to tell us how the Experimental Debugger is working for you?', yes, no);
            switch (response) {
                case yes:
                    {
                        yield this.launchSurvey();
                        yield this.disable();
                        break;
                    }
                case no: {
                    yield this.disable();
                    break;
                }
                default: {
                    // Disable for the current session.
                    this.disabledInCurrentSession = true;
                }
            }
        });
    }
    shouldShowBanner() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled || this.disabledInCurrentSession) {
                return false;
            }
            const [threshold, debuggerCounter] = yield Promise.all([this.getDebuggerLaunchThresholdCounter(), this.getGetDebuggerLaunchCounter()]);
            return debuggerCounter >= threshold;
        });
    }
    disable() {
        return __awaiter(this, void 0, void 0, function* () {
            const factory = this.serviceContainer.get(types_2.IPersistentStateFactory);
            yield factory.createGlobalPersistentState(PersistentStateKeys.ShowBanner, false).updateValue(false);
        });
    }
    launchSurvey() {
        return __awaiter(this, void 0, void 0, function* () {
            const debuggerLaunchCounter = yield this.getGetDebuggerLaunchCounter();
            const browser = this.serviceContainer.get(types_2.IBrowserService);
            browser.launch(`https://www.research.net/r/N7B25RV?n=${debuggerLaunchCounter}`);
        });
    }
    incrementDebuggerLaunchCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            const factory = this.serviceContainer.get(types_2.IPersistentStateFactory);
            const state = factory.createGlobalPersistentState(PersistentStateKeys.DebuggerLaunchCounter, 0);
            yield state.updateValue(state.value + 1);
        });
    }
    getGetDebuggerLaunchCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            const factory = this.serviceContainer.get(types_2.IPersistentStateFactory);
            const state = factory.createGlobalPersistentState(PersistentStateKeys.DebuggerLaunchCounter, 0);
            return state.value;
        });
    }
    getDebuggerLaunchThresholdCounter() {
        return __awaiter(this, void 0, void 0, function* () {
            const factory = this.serviceContainer.get(types_2.IPersistentStateFactory);
            const state = factory.createGlobalPersistentState(PersistentStateKeys.DebuggerLaunchThresholdCounter, undefined);
            if (state.value === undefined) {
                const hexValue = parseInt(`0x${this.getRandomHex()}`, 16);
                const randomNumber = Math.floor((10 * hexValue) / 16) + 1;
                yield state.updateValue(randomNumber);
            }
            return state.value;
        });
    }
    getRandomHex() {
        const appEnv = this.serviceContainer.get(types_1.IApplicationEnvironment);
        const lastHexValue = appEnv.machineId.slice(-1);
        const num = parseInt(`0x${lastHexValue}`, 16);
        return isNaN(num) ? crypto.randomBytes(1).toString('hex').slice(-1) : lastHexValue;
    }
    onDidTerminateDebugSession() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.enabled) {
                return;
            }
            yield this.incrementDebuggerLaunchCounter();
            const show = yield this.shouldShowBanner();
            if (!show) {
                return;
            }
            yield this.showBanner();
        });
    }
};
ExperimentalDebuggerBanner = __decorate([
    inversify_1.injectable(),
    __param(0, inversify_1.inject(types_3.IServiceContainer))
], ExperimentalDebuggerBanner);
exports.ExperimentalDebuggerBanner = ExperimentalDebuggerBanner;
//# sourceMappingURL=banner.js.map