"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class KernelRestartedError extends Error {
    constructor() {
        super('Kernel has been restarted');
        this.message = 'Kernel has been restarted';
    }
}
exports.KernelRestartedError = KernelRestartedError;
class KernelShutdownError extends Error {
    constructor() {
        super('Kernel has been shutdown');
        this.message = 'Kernel has been shutdown';
    }
}
exports.KernelShutdownError = KernelShutdownError;
//# sourceMappingURL=errors.js.map