"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
/**
 * Debounces a function execution. Function must return either a void or a promise that resolves to a void.
 * @export
 * @param {number} [wait] Wait time.
 * @returns void
 */
function debounce(wait) {
    // tslint:disable-next-line:no-any no-function-expression
    return function (_target, _propertyName, descriptor) {
        const originalMethod = descriptor.value;
        // tslint:disable-next-line:no-invalid-this no-any
        descriptor.value = _.debounce(function () { return originalMethod.apply(this, arguments); }, wait);
    };
}
exports.debounce = debounce;
/**
 * Swallows exceptions thrown by a function. Function must return either a void or a promise that resolves to a void.
 * @export
 * @param {string} [scopeName] Scope for the error message to be logged along with the error.
 * @returns void
 */
function swallowExceptions(scopeName) {
    // tslint:disable-next-line:no-any no-function-expression
    return function (_target, propertyName, descriptor) {
        const originalMethod = descriptor.value;
        const errorMessage = `Python Extension (Error in ${scopeName}, method:${propertyName}):`;
        // tslint:disable-next-line:no-any no-function-expression
        descriptor.value = function (...args) {
            try {
                // tslint:disable-next-line:no-invalid-this no-use-before-declare no-unsafe-any
                const result = originalMethod.apply(this, args);
                // If method being wrapped returns a promise then wait and swallow errors.
                if (result && typeof result.then === 'function' && typeof result.catch === 'function') {
                    return result.catch(error => console.error(errorMessage, error));
                }
            }
            catch (error) {
                console.error(errorMessage, error);
            }
        };
    };
}
exports.swallowExceptions = swallowExceptions;
//# sourceMappingURL=decorators.js.map