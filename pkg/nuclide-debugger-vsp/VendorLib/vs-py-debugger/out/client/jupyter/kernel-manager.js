"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const vscode = require("vscode");
const events_1 = require("events");
const configSettings_1 = require("../common/configSettings");
const utils_1 = require("../common/utils");
const jupyter_client_Kernel_1 = require("./jupyter_client-Kernel");
const errors_1 = require("./common/errors");
const pythonSettings = configSettings_1.PythonSettings.getInstance();
class KernelManagerImpl extends events_1.EventEmitter {
    constructor(outputChannel, jupyterClient) {
        super();
        this.outputChannel = outputChannel;
        this.jupyterClient = jupyterClient;
        this.disposables = [];
        this._runningKernels = new Map();
        this._kernelSpecs = {};
    }
    dispose() {
        this.removeAllListeners();
        this._runningKernels.forEach(kernel => {
            kernel.dispose();
        });
        this._runningKernels.clear();
        this.jupyterClient.dispose();
    }
    setRunningKernelFor(language, kernel) {
        kernel.kernelSpec.language = language;
        this._runningKernels.set(language, kernel);
        this.emit('kernelChanged', kernel, language);
        return kernel;
    }
    destroyRunningKernelFor(language) {
        if (!this._runningKernels.has(language)) {
            return;
        }
        const kernel = this._runningKernels.get(language);
        this._runningKernels.delete(language);
        if (kernel) {
            kernel.dispose();
        }
    }
    restartRunningKernelFor(language) {
        const kernel = this._runningKernels.get(language);
        let startupPromise;
        // if (kernel instanceof WSKernel) {
        //     startupPromise = new Promise<Kernel>((resolve, reject) => {
        //         kernel.restart().then(() => {
        //             resolve(kernel);
        //         }, reject.bind(this));
        //     });
        // }
        if (kernel instanceof jupyter_client_Kernel_1.JupyterClientKernel) {
            startupPromise = kernel.shutdown(true).then(() => kernel);
        }
        if (!startupPromise) {
            vscode.window.showWarningMessage('Cannot restart this kernel');
            startupPromise = Promise.resolve(kernel);
        }
        return startupPromise.catch(reason => {
            let message = 'Failed to start the kernel.';
            if (reason && reason.message) {
                message = reason.message;
            }
            vscode.window.showErrorMessage(message);
            this.outputChannel.appendLine(utils_1.formatErrorForLogging(reason));
            return Promise.reject(reason);
        });
    }
    startKernelFor(language) {
        return this.getKernelSpecFor(language).then(kernelSpec => {
            return this.startKernel(kernelSpec, language);
        });
    }
    startExistingKernel(language, connection, connectionFile) {
        throw new Error('Start Existing Kernel not implemented');
    }
    startKernel(kernelSpec, language) {
        return __awaiter(this, void 0, void 0, function* () {
            this.destroyRunningKernelFor(language);
            const kernelInfo = yield this.jupyterClient.startKernel(kernelSpec);
            const kernelUUID = kernelInfo[0];
            const config = kernelInfo[1];
            const connectionFile = kernelInfo[2];
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(kernelSpec, language, config, connectionFile, kernelUUID, this.jupyterClient);
            this.setRunningKernelFor(language, kernel);
            yield this.executeStartupCode(kernel);
            return kernel;
        });
    }
    executeStartupCode(kernel) {
        if (pythonSettings.jupyter.startupCode.length === 0) {
            return Promise.resolve();
        }
        const suffix = ' ' + os.EOL;
        let startupCode = pythonSettings.jupyter.startupCode.join(suffix) + suffix;
        return new Promise((resolve, reject) => {
            let errorMessage = 'Failed to execute kernel startup code. ';
            kernel.execute(startupCode).subscribe(result => {
                if (result.stream === 'error' && result.type === 'text' && typeof result.message === 'string') {
                    errorMessage += 'Details: ' + result.message;
                }
                if (result.stream === 'status' && result.type === 'text' && result.data === 'error') {
                    this.outputChannel.appendLine(errorMessage);
                    vscode.window.showWarningMessage(errorMessage);
                }
            }, reason => {
                if (reason instanceof errors_1.KernelRestartedError || reason instanceof errors_1.KernelShutdownError) {
                    return resolve();
                }
                // It doesn't matter if startup code execution Failed
                // Possible they have placed some stuff that is invalid or we have some missing packages (e.g. matplot lib)
                this.outputChannel.appendLine(utils_1.formatErrorForLogging(reason));
                vscode.window.showWarningMessage(errorMessage);
                resolve();
            }, () => {
                resolve();
            });
        });
    }
    getAllRunningKernels() {
        return this._runningKernels;
    }
    getRunningKernelFor(language) {
        return this._runningKernels.has(language) ? this._runningKernels.get(language) : null;
    }
    getAllKernelSpecs() {
        if (Object.keys(this._kernelSpecs).length === 0) {
            return this.updateKernelSpecs().then(() => {
                return Object.keys(this._kernelSpecs).map(key => this._kernelSpecs[key].spec);
            });
        }
        else {
            const result = Object.keys(this._kernelSpecs).map(key => this._kernelSpecs[key].spec);
            return Promise.resolve(result);
        }
    }
    getAllKernelSpecsFor(language) {
        return this.getAllKernelSpecs().then(kernelSpecs => {
            const lowerLang = language.toLowerCase();
            return kernelSpecs.filter(spec => spec.language.toLowerCase() === lowerLang);
        });
    }
    getKernelSpecFor(language) {
        return this.getAllKernelSpecsFor(language).then(kernelSpecs => {
            if (kernelSpecs.length === 0) {
                throw new Error('Unable to find a kernel for ' + language);
            }
            if (pythonSettings.jupyter.defaultKernel.length > 0) {
                const defaultKernel = kernelSpecs.find(spec => spec.display_name === pythonSettings.jupyter.defaultKernel);
                if (defaultKernel) {
                    return defaultKernel;
                }
            }
            return kernelSpecs[0];
        });
    }
    updateKernelSpecs() {
        this._kernelSpecs = {};
        return this.getKernelSpecsFromJupyter().then(kernelSpecsFromJupyter => {
            this._kernelSpecs = kernelSpecsFromJupyter;
            if (Object.keys(this._kernelSpecs).length === 0) {
                throw new Error('No kernel specs found, Install or update IPython/Jupyter to a later version');
            }
            return this._kernelSpecs;
        });
    }
    getKernelSpecsFromJupyter() {
        return this.jupyterClient.getAllKernelSpecs();
    }
}
exports.KernelManagerImpl = KernelManagerImpl;
//# sourceMappingURL=kernel-manager.js.map