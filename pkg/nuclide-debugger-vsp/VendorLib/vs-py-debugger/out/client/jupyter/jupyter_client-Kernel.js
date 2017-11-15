"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const kernel_1 = require("./kernel");
class JupyterClientKernel extends kernel_1.Kernel {
    constructor(kernelSpec, language, connection, connectionFile, kernelUUID, jupyterClient) {
        super(kernelSpec, language);
        this.connection = connection;
        this.connectionFile = connectionFile;
        this.kernelUUID = kernelUUID;
        this.jupyterClient = jupyterClient;
        this.jupyterClient.on('status', status => {
            this.raiseOnStatusChange(status);
        });
    }
    dispose() {
        this.shutdown().catch(() => { });
        super.dispose();
    }
    ;
    interrupt() {
        this.jupyterClient.interruptKernel(this.kernelUUID);
    }
    ;
    shutdown(restart) {
        if (restart === true) {
            return this.jupyterClient.restartKernel(this.kernelUUID);
        }
        return this.jupyterClient.shutdownkernel(this.kernelUUID);
    }
    ;
    execute(code) {
        return this.jupyterClient.runCode(code);
    }
    ;
}
exports.JupyterClientKernel = JupyterClientKernel;
//# sourceMappingURL=jupyter_client-Kernel.js.map