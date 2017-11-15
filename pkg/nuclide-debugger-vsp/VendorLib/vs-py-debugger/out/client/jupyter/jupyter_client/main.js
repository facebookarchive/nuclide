"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jupyterSocketClient_1 = require("./jupyterSocketClient");
const socketServer_1 = require("../../common/comms/socketServer");
const child_process = require("child_process");
const path = require("path");
const helpers_1 = require("../../common/helpers");
const contracts_1 = require("./contracts");
const configSettings_1 = require("../../common/configSettings");
const Rx = require("rx");
const events_1 = require("events");
const utils_1 = require("../../common/utils");
class JupyterClientAdapter extends events_1.EventEmitter {
    constructor(outputChannel, rootDir) {
        super();
        this.outputChannel = outputChannel;
        this.rootDir = rootDir;
    }
    dispose() {
        try {
            if (this.process) {
                this.process.stdin.write(this.lastStartedKernelUUID ? this.lastStartedKernelUUID : '');
                this.process.stdin.write('\n');
            }
        }
        catch (ex) {
        }
        try {
            this.ipythonAdapter.dispose();
        }
        catch (ex) {
        }
        try {
            this.socketServer.Stop();
        }
        catch (ex) {
        }
        this.ipythonAdapter = null;
        this.process = null;
        this.socketServer = null;
        this.startDef = null;
    }
    start(envVariables) {
        if (this.startDef) {
            return this.startDef.promise;
        }
        this.startDef = helpers_1.createDeferred();
        const pyFile = path.join(__dirname, '..', '..', '..', '..', 'pythonFiles', 'PythonTools', 'ipythonServer.py');
        const newEnv = {};
        // const newEnv = {'DEBUG_DJAYAMANNE_IPYTHON':'1'};
        Object.assign(newEnv, envVariables);
        Object.assign(newEnv, process.env);
        this.startSocketServer().then(port => {
            const def = helpers_1.createDeferred();
            const options = { env: newEnv, cwd: this.rootDir };
            this.process = child_process.spawn(configSettings_1.PythonSettings.getInstance().pythonPath, [pyFile, port.toString()], options);
            this.process.stdout.setEncoding('utf8');
            this.process.stderr.setEncoding('utf8');
            let processStarted = false;
            let handshakeDone = false;
            let isInTestRun = newEnv['PYTHON_DONJAYAMANNE_TEST'] === "1";
            const testDef = helpers_1.createDeferred();
            const promiseToResolve = isInTestRun ? testDef.resolve.bind(testDef) : def.resolve.bind(def);
            this.process.stdout.on('data', (data) => {
                if (!processStarted && data.split(/\r?\n/g).some(line => line === 'Started')) {
                    processStarted = true;
                    if (processStarted && handshakeDone) {
                        promiseToResolve();
                    }
                    return;
                }
                this.outputChannel.append(data);
            });
            this.process.stderr.on('data', (data) => {
                this.outputChannel.append(data);
            });
            this.ipythonAdapter.on('handshake', () => {
                handshakeDone = true;
                if (processStarted && handshakeDone) {
                    promiseToResolve();
                }
            });
            // If we're testing, then test the ping and the pong
            if (isInTestRun) {
                testDef.promise.then(() => {
                    // Ok everything has started, now test ping
                    const msg1 = 'Hello world from Type Script - Функция проверки ИНН и КПП - 长城!1';
                    const msg2 = 'Hello world from Type Script - Функция проверки ИНН и КПП - 长城!2';
                    Promise.all([this.ipythonAdapter.ping(msg1), this.ipythonAdapter.ping(msg2)]).then(msgs => {
                        if (msgs.indexOf(msg1) === -1 || msgs.indexOf(msg2) === -1) {
                            def.reject('msg1 or msg2 not returned');
                        }
                        else {
                            def.resolve();
                        }
                    }).catch(reason => def.reject(reason));
                });
            }
            return def.promise;
        }).then(() => {
            this.startDef.resolve();
        }).catch(reason => {
            this.startDef.reject(reason);
        });
        return this.startDef.promise;
    }
    startSocketServer() {
        this.socketServer = new socketServer_1.SocketServer();
        this.ipythonAdapter = new jupyterSocketClient_1.JupyterSocketClient(this.socketServer, this.outputChannel);
        this.ipythonAdapter.on('status', status => {
            this.emit('status', status);
        });
        this.ipythonAdapter.on('error', error => {
            this.emit('error', error);
            console.error(error);
            this.outputChannel.appendLine('Error received: ' + error);
        });
        this.ipythonAdapter.on('commanderror', (commandError) => {
            this.outputChannel.appendLine(`Unhandled command Error from Jupyter. '${JSON.stringify(commandError)}'`);
        });
        this.ipythonAdapter.on('iopubmessagepareerror', (error, jsonResult) => {
            const errorToLog = utils_1.formatErrorForLogging(error);
            this.outputChannel.appendLine(`Error in handling IO message. ${errorToLog}, JSON Message = ${jsonResult}`);
        });
        this.ipythonAdapter.on('shellmessagepareerror', (error, jsonResult) => {
            const errorToLog = utils_1.formatErrorForLogging(error);
            this.outputChannel.appendLine(`Error in handling Shell message. ${errorToLog}, JSON Message = ${jsonResult}`);
        });
        return this.socketServer.Start();
    }
    getAllKernelSpecs() {
        return this.start().then(() => this.ipythonAdapter.listKernelSpecs());
    }
    startKernel(kernelSpec) {
        return this.start().then(() => this.getAllKernelSpecs()).then(specks => {
            // ok given the specks, find the name of the kernelspec
            const kernelSpecName = Object.keys(specks).find(kernelSpecName => {
                const spec = specks[kernelSpecName];
                return spec.spec.display_name === kernelSpec.display_name;
            });
            return this.ipythonAdapter.startKernel(kernelSpecName).then(info => {
                this.lastStartedKernelUUID = info[0];
                return info;
            });
        });
    }
    shutdownkernel(kernelUUID) {
        return this.start().then(() => this.ipythonAdapter.sendKernelCommand(kernelUUID, contracts_1.KernelCommand.shutdown));
    }
    interruptKernel(kernelUUID) {
        return this.start().then(() => this.ipythonAdapter.sendKernelCommand(kernelUUID, contracts_1.KernelCommand.interrupt));
    }
    restartKernel(kernelUUID) {
        return this.start().then(() => this.ipythonAdapter.sendKernelCommand(kernelUUID, contracts_1.KernelCommand.restart));
    }
    runCode(code) {
        const subject = new Rx.Subject();
        this.start().then(() => {
            const runnerObservable = this.ipythonAdapter.runCode(code);
            runnerObservable.subscribe(data => {
                subject.onNext(data);
            }, reason => {
                subject.onError(reason);
            }, () => {
                subject.onCompleted();
            });
        }).catch(reason => {
            subject.onError(reason);
        });
        return subject;
    }
}
exports.JupyterClientAdapter = JupyterClientAdapter;
//# sourceMappingURL=main.js.map