"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const stopWatch_1 = require("../common/stopWatch");
const telemetry_1 = require("./telemetry");
function sendTelemetryEvent(eventName, durationMs, properties) {
    const reporter = telemetry_1.getTelemetryReporter();
    const measures = typeof durationMs === 'number' ? { duration: durationMs } : undefined;
    // tslint:disable-next-line:no-any
    const customProperties = {};
    if (properties) {
        // tslint:disable-next-line:prefer-type-cast no-any
        const data = properties;
        Object.getOwnPropertyNames(data).forEach(prop => {
            if (data[prop] === undefined || data[prop] === null) {
                return;
            }
            // tslint:disable-next-line:prefer-type-cast no-any  no-unsafe-any
            customProperties[prop] = typeof data[prop] === 'string' ? data[prop] : data[prop].toString();
        });
    }
    reporter.sendTelemetryEvent(eventName, properties ? customProperties : undefined, measures);
}
exports.sendTelemetryEvent = sendTelemetryEvent;
// tslint:disable-next-line:no-any function-name
function captureTelemetry(eventName, properties, captureDuration = true) {
    // tslint:disable-next-line:no-function-expression no-any
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        // tslint:disable-next-line:no-function-expression no-any
        descriptor.value = function (...args) {
            if (!captureDuration) {
                sendTelemetryEvent(eventName, undefined, properties);
                // tslint:disable-next-line:no-invalid-this
                return originalMethod.apply(this, args);
            }
            const stopWatch = new stopWatch_1.StopWatch();
            // tslint:disable-next-line:no-invalid-this no-use-before-declare no-unsafe-any
            const result = originalMethod.apply(this, args);
            // If method being wrapped returns a promise then wait for it.
            // tslint:disable-next-line:no-unsafe-any
            if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                // tslint:disable-next-line:prefer-type-cast
                result
                    .then(data => {
                    sendTelemetryEvent(eventName, stopWatch.elapsedTime, properties);
                    return data;
                })
                    // tslint:disable-next-line:promise-function-async
                    .catch(ex => {
                    sendTelemetryEvent(eventName, stopWatch.elapsedTime, properties);
                    return Promise.reject(ex);
                });
            }
            else {
                sendTelemetryEvent(eventName, stopWatch.elapsedTime, properties);
            }
            return result;
        };
        return descriptor;
    };
}
exports.captureTelemetry = captureTelemetry;
// tslint:disable-next-line:no-any function-name
function sendTelemetryWhenDone(eventName, promise, stopWatch, properties) {
    stopWatch = stopWatch ? stopWatch : new stopWatch_1.StopWatch();
    if (typeof promise.then === 'function') {
        // tslint:disable-next-line:prefer-type-cast no-any
        promise
            .then(data => {
            // tslint:disable-next-line:no-non-null-assertion
            sendTelemetryEvent(eventName, stopWatch.elapsedTime, properties);
            return data;
            // tslint:disable-next-line:promise-function-async
        }, ex => {
            // tslint:disable-next-line:no-non-null-assertion
            sendTelemetryEvent(eventName, stopWatch.elapsedTime, properties);
            return Promise.reject(ex);
        });
    }
    else {
        throw new Error('Method is neither a Promise nor a Theneable');
    }
}
exports.sendTelemetryWhenDone = sendTelemetryWhenDone;
//# sourceMappingURL=index.js.map