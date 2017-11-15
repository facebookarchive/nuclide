'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const invalidArgs_1 = require("./invalidArgs");
const standard_1 = require("./standard");
const notInstalled_1 = require("./notInstalled");
class ErrorHandler {
    constructor(id, product, installer, outputChannel) {
        this.id = id;
        this.product = product;
        this.installer = installer;
        this.outputChannel = outputChannel;
        this._errorHandlers = [];
        this._errorHandlers = [
            new invalidArgs_1.InvalidArgumentsErrorHandler(this.id, this.product, this.installer, this.outputChannel),
            new notInstalled_1.NotInstalledErrorHandler(this.id, this.product, this.installer, this.outputChannel),
            new standard_1.StandardErrorHandler(this.id, this.product, this.installer, this.outputChannel)
        ];
    }
    handleError(expectedFileName, fileName, error) {
        this._errorHandlers.some(handler => handler.handleError(expectedFileName, fileName, error));
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=main.js.map