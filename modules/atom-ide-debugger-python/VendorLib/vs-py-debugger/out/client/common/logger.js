"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const inversify_1 = require("inversify");
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
};
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
function warn(title = '', message) {
    new Logger().logWarning(`${title}, ${message}`);
}
exports.warn = warn;
//# sourceMappingURL=logger.js.map