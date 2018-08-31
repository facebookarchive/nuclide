"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-function-expression no-any no-invalid-this no-use-before-declare
const vscode_debugadapter_1 = require("vscode-debugadapter");
const stopWatch_1 = require("../../common/stopWatch");
const constants_1 = require("../../telemetry/constants");
const Contracts_1 = require("./Contracts");
const executionStack = [];
var PerformanceTelemetryCondition;
(function (PerformanceTelemetryCondition) {
    PerformanceTelemetryCondition[PerformanceTelemetryCondition["always"] = 0] = "always";
    PerformanceTelemetryCondition[PerformanceTelemetryCondition["stoppedEvent"] = 1] = "stoppedEvent";
})(PerformanceTelemetryCondition = exports.PerformanceTelemetryCondition || (exports.PerformanceTelemetryCondition = {}));
function capturePerformanceTelemetry(action) {
    return function (target, _propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            executionStack.push({ action, timer: new stopWatch_1.StopWatch() });
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.capturePerformanceTelemetry = capturePerformanceTelemetry;
function sendPerformanceTelemetry(condition) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (...args) {
            if (propertyKey === 'sendEvent' && args.length === 1 && args[0] instanceof Contracts_1.TelemetryEvent) {
                return originalMethod.apply(this, args);
            }
            try {
                const data = getPerformanceTelemetryData(condition, args);
                if (data) {
                    this.sendEvent(new Contracts_1.TelemetryEvent(constants_1.DEBUGGER_PERFORMANCE, data));
                }
            }
            catch (_a) {
                // We don't want errors here interfering the user's work, hence swallow exceptions.
            }
            return originalMethod.apply(this, args);
        };
        return descriptor;
    };
}
exports.sendPerformanceTelemetry = sendPerformanceTelemetry;
function getPerformanceTelemetryData(condition, functionArgs) {
    if (executionStack.length === 0) {
        return;
    }
    let item;
    switch (condition) {
        case PerformanceTelemetryCondition.always: {
            item = executionStack.pop();
        }
        case PerformanceTelemetryCondition.stoppedEvent: {
            if (functionArgs.length > 0 && functionArgs[0] instanceof vscode_debugadapter_1.StoppedEvent) {
                item = executionStack.pop();
            }
            break;
        }
        default: {
            return;
        }
    }
    if (item) {
        return { action: item.action, duration: item.timer.elapsedTime };
    }
}
//# sourceMappingURL=telemetry.js.map