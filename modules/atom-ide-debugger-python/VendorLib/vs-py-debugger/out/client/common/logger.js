"use strict";
// tslint:disable:no-console
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
const helpers_1 = require("./helpers");
const PREFIX = 'Python Extension: ';
let Logger = class Logger {
    logError(message, ex) {
        if (ex) {
            console.error(`${PREFIX}${message}`, ex);
        }
        else {
            console.error(`${PREFIX}${message}`);
        }
    }
    logWarning(message, ex) {
        if (ex) {
            console.warn(`${PREFIX}${message}`, ex);
        }
        else {
            console.warn(`${PREFIX}${message}`);
        }
    }
    logInformation(message, ex) {
        if (ex) {
            console.info(`${PREFIX}${message}`, ex);
        }
        else {
            console.info(`${PREFIX}${message}`);
        }
    }
};
__decorate([
    helpers_1.skipIfTest(false)
], Logger.prototype, "logError", null);
__decorate([
    helpers_1.skipIfTest(false)
], Logger.prototype, "logWarning", null);
__decorate([
    helpers_1.skipIfTest(false)
], Logger.prototype, "logInformation", null);
Logger = __decorate([
    inversify_1.injectable()
], Logger);
exports.Logger = Logger;
// tslint:disable-next-line:no-any
function error(title = '', message) {
    new Logger().logError(`${title}, ${message}`);
}
exports.error = error;
// tslint:disable-next-line:no-any
function warn(title = '', message = '') {
    new Logger().logWarning(`${title}, ${message}`);
}
exports.warn = warn;
var LogOptions;
(function (LogOptions) {
    LogOptions[LogOptions["Arguments"] = 0] = "Arguments";
    LogOptions[LogOptions["ReturnValue"] = 1] = "ReturnValue";
})(LogOptions = exports.LogOptions || (exports.LogOptions = {}));
// tslint:disable-next-line:no-any
function argsToLogString(args) {
    try {
        return (args || []).map((item, index) => {
            try {
                return `Arg ${index + 1}: ${JSON.stringify(item)}`;
            }
            catch (_a) {
                return `Arg ${index + 1}: UNABLE TO DETERMINE VALUE`;
            }
        }).join(', ');
    }
    catch (_a) {
        return '';
    }
}
// tslint:disable-next-line:no-any
function returnValueToLogString(returnValue) {
    let returnValueMessage = 'Return Value: ';
    if (returnValue) {
        try {
            returnValueMessage += `${JSON.stringify(returnValue)}`;
        }
        catch (_a) {
            returnValueMessage += 'UNABLE TO DETERMINE VALUE';
        }
    }
    return returnValueMessage;
}
function log(message, options = LogOptions.Arguments | LogOptions.ReturnValue) {
    // tslint:disable-next-line:no-function-expression no-any
    return function (_, __, descriptor) {
        const originalMethod = descriptor.value;
        // tslint:disable-next-line:no-function-expression no-any
        descriptor.value = function (...args) {
            // tslint:disable-next-line:no-any
            function writeSuccess(returnValue) {
                writeToLog(returnValue);
            }
            function writeError(ex) {
                writeToLog(undefined, ex);
            }
            // tslint:disable-next-line:no-any
            function writeToLog(returnValue, ex) {
                const messagesToLog = [message];
                if ((options && LogOptions.Arguments) === LogOptions.Arguments) {
                    messagesToLog.push(argsToLogString(args));
                }
                if ((options & LogOptions.ReturnValue) === LogOptions.ReturnValue) {
                    messagesToLog.push(returnValueToLogString(returnValue));
                }
                if (ex) {
                    new Logger().logError(messagesToLog.join(', '), ex);
                }
                else {
                    new Logger().logInformation(messagesToLog.join(', '));
                }
            }
            try {
                // tslint:disable-next-line:no-invalid-this no-use-before-declare no-unsafe-any
                const result = originalMethod.apply(this, args);
                // If method being wrapped returns a promise then wait for it.
                // tslint:disable-next-line:no-unsafe-any
                if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                    // tslint:disable-next-line:prefer-type-cast
                    result
                        .then(data => {
                        writeSuccess(data);
                        return data;
                    })
                        .catch(ex => {
                        writeError(ex);
                        return Promise.reject(ex);
                    });
                }
                else {
                    writeSuccess(result);
                }
                return result;
            }
            catch (ex) {
                writeError(ex);
                throw ex;
            }
        };
        return descriptor;
    };
}
exports.log = log;
//# sourceMappingURL=logger.js.map