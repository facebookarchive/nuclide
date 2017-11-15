"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//
// Place this right on top
const initialize_1 = require("./initialize");
// The module 'assert' provides assertion methods from node
const assert = require("assert");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const main_1 = require("../client/jupyter/jupyter_client/main");
const errors_1 = require("../client/jupyter/common/errors");
const helpers_1 = require("../client/common/helpers");
const jupyter_client_Kernel_1 = require("../client/jupyter/jupyter_client-Kernel");
const settings = require("../client/common/configSettings");
let pythonSettings = settings.PythonSettings.getInstance();
const disposable = initialize_1.setPythonExecutable(pythonSettings);
class MockOutputChannel {
    constructor(name) {
        this.name = name;
        this.output = '';
        this.timeOut = setTimeout(() => {
            console.log(this.output);
            this.writeToConsole = true;
            this.timeOut = null;
        }, initialize_1.TEST_TIMEOUT - 1000);
    }
    append(value) {
        this.output += value;
        if (this.writeToConsole) {
            console.log(value);
        }
    }
    appendLine(value) {
        this.append(value);
        this.append('\n');
        if (this.writeToConsole) {
            console.log(value);
            console.log('\n');
        }
    }
    clear() { }
    show(x, y) {
        this.isShown = true;
    }
    hide() {
        this.isShown = false;
    }
    dispose() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
            this.timeOut = null;
        }
    }
}
exports.MockOutputChannel = MockOutputChannel;
suite('Jupyter Kernel', () => {
    suiteSetup(done => {
        initialize_1.initialize().then(() => {
            done();
        });
    });
    setup(() => {
        process.env['PYTHON_DONJAYAMANNE_TEST'] = '0';
        process.env['DEBUG_DJAYAMANNE_IPYTHON'] = '1';
        disposables = [];
        output = new MockOutputChannel('Jupyter');
        disposables.push(output);
        jupyter = new main_1.JupyterClientAdapter(output, __dirname);
        disposables.push(jupyter);
    });
    teardown(() => {
        process.env['PYTHON_DONJAYAMANNE_TEST'] = '1';
        process.env['DEBUG_DJAYAMANNE_IPYTHON'] = '0';
        output.dispose();
        jupyter.dispose();
        disposables.forEach(d => {
            try {
                d.dispose();
            }
            catch (error) {
            }
        });
    });
    suiteTeardown(() => {
        disposable.dispose();
    });
    let output;
    let jupyter;
    let disposables;
    test('Start and Shutdown Kernel', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            return kernel.shutdown();
        }).then(() => {
            done();
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to start Kernel', '');
        });
    });
    test('Restart Kernel', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            return kernel.shutdown(true);
        }).then(() => {
            done();
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to restart Kernel', '');
        });
    });
    test('Interrupt Kernel', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            return kernel.interrupt();
        }).then(() => {
            done();
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Execute Code (success)', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output = [];
            kernel.execute('1+2').subscribe(data => {
                output.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
            }, () => {
                assert.equal(output.some(d => d.stream === 'pyout' && d.type === 'text' && d.data['text/plain'] === '3'), true, 'pyout not found in output');
                assert.equal(output.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'ok'), true, 'status not found in output');
                done();
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Execute Code (with threads)', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output = [];
            kernel.execute('print(2)\nimport time\ntime.sleep(5)\nprint(3)').subscribe(data => {
                output.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
            }, () => {
                assert.equal(output.some(d => d.stream === 'stdout' && d.type === 'text' && d.data['text/plain'] === '2'), true, 'stdout (2) not found in output');
                assert.equal(output.some(d => d.stream === 'stdout' && d.type === 'text' && d.data['text/plain'] === '3'), true, 'stdout (3) not found in output');
                assert.equal(output.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'ok'), true, 'status not found in output');
                done();
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Execute Code (failure)', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output = [];
            kernel.execute('print(x)').subscribe(data => {
                output.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
            }, () => {
                assert.equal(output.some(d => d.stream === 'error' && d.type === 'text'), true, 'error not found in output');
                assert.equal(output.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'error'), true, 'status not found in output');
                done();
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Shutdown while executing code', done => {
        let selectedKernelSpec;
        let kernelUUID;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            kernelUUID = startInfo[0];
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output = [];
            let runFailedWithError = false;
            kernel.execute('print(2)\nimport time\ntime.sleep(5)\nprint(3)').subscribe(data => {
                output.push(data);
                if (output.length === 1) {
                    // Shutdown this kernel immediately
                    jupyter.shutdownkernel(kernelUUID).then(() => {
                        assert.equal(runFailedWithError, true, 'Error event not raised in observale');
                        done();
                    }, reason => {
                        assert.fail(reason, null, 'Failed to shutdown the kernel', '');
                    });
                }
            }, reason => {
                if (reason instanceof errors_1.KernelShutdownError) {
                    runFailedWithError = true;
                }
                else {
                    assert.fail(reason, null, 'Code execution failed in jupyter with invalid error', '');
                }
            }, () => {
                assert.fail('Complete event fired', 'none', 'Completed fired for observable', '');
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Interrupt Kernel while executing code', done => {
        let selectedKernelSpec;
        let kernelUUID;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            kernelUUID = startInfo[0];
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output = [];
            jupyter.runCode('print(2)\nimport time\ntime.sleep(5)\nprint(3)').subscribe(data => {
                output.push(data);
                if (output.length === 1) {
                    // interrupt this kernel immediately
                    jupyter.interruptKernel(kernelUUID).then(() => {
                        // Do nothing
                    }, reason => {
                        assert.fail(reason, null, 'Failed to interrupt the kernel', '');
                    });
                }
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter with invalid error', '');
            }, () => {
                assert.equal(output.some(d => d.stream === 'stdout' && d.type === 'text' && d.data['text/plain'] === '2'), true, 'stdout not found in output');
                assert.equal(output.some(d => d.stream === 'error' && d.type === 'text'), true, 'error (KeyboardInterrupt) not found');
                assert.equal(output.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'error'), true, 'status not found in output');
                jupyter.dispose();
                done();
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Restart Kernel while executing code', done => {
        let selectedKernelSpec;
        let kernelUUID;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            kernelUUID = startInfo[0];
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output1 = [];
            const output2 = [];
            const output3 = [];
            const def1 = helpers_1.createDeferred();
            const def2 = helpers_1.createDeferred();
            const def3 = helpers_1.createDeferred();
            kernel.execute('1+2').subscribe(data => {
                output1.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
            }, () => {
                assert.equal(output1.some(d => d.stream === 'pyout' && d.type === 'text' && d.data['text/plain'] === '3'), true, 'pyout not found in output');
                assert.equal(output1.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'ok'), true, 'status not found in output');
                def1.resolve();
            });
            kernel.execute('print(2)\nimport time\ntime.sleep(5)\nprint(3)').subscribe(data => {
                output2.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
            }, () => {
                assert.equal(output2.some(d => d.stream === 'stdout' && d.type === 'text' && d.data['text/plain'] === '2'), true, 'stdout (2) not found in output');
                assert.equal(output2.some(d => d.stream === 'stdout' && d.type === 'text' && d.data['text/plain'] === '3'), true, 'stdout (3) not found in output');
                assert.equal(output2.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'ok'), true, 'status not found in output');
                def2.resolve();
            });
            kernel.execute('print(1)').subscribe(data => {
                output3.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
            }, () => {
                assert.equal(output3.some(d => d.stream === 'stdout' && d.type === 'text' && d.data['text/plain'] === '1'), true, 'pyout not found in output');
                assert.equal(output3.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'ok'), true, 'status not found in output');
                def3.resolve();
            });
            Promise.all([def1.promise, def2.promise, def3.promise]).then(() => {
                done();
            }).catch(reason => {
                assert.fail(reason, null, 'One of the code executions failed', '');
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
        });
    });
    test('Status Change', done => {
        let selectedKernelSpec;
        jupyter.getAllKernelSpecs().then(kernelSpecs => {
            const kernelNames = Object.keys(kernelSpecs);
            assert.notEqual(kernelNames.length, 0, 'kernelSpecs not found');
            selectedKernelSpec = kernelSpecs[kernelNames[0]].spec;
            return jupyter.startKernel(selectedKernelSpec);
        }).then(startInfo => {
            const kernel = new jupyter_client_Kernel_1.JupyterClientKernel(selectedKernelSpec, 'python', startInfo[1], startInfo[2], startInfo[0], jupyter);
            disposables.push(kernel);
            const output = [];
            const statuses = [];
            kernel.onStatusChange(info => {
                statuses.push(info[1]);
            });
            kernel.execute('1+2').subscribe(data => {
                output.push(data);
            }, reason => {
                assert.fail(reason, null, 'Code execution failed in jupyter', '');
                done();
            }, () => {
                assert.equal(output.some(d => d.stream === 'pyout' && d.type === 'text' && d.data['text/plain'] === '3'), true, 'pyout not found in output');
                assert.equal(output.some(d => d.stream === 'status' && d.type === 'text' && d.data === 'ok'), true, 'status not found in output');
                assert.equal(statuses.indexOf('busy'), 0, 'busy status not the first status');
                assert.equal(statuses.indexOf('idle'), 1, 'idle status not the last status');
                done();
            });
        }).catch(reason => {
            assert.fail(reason, undefined, 'Failed to interrupt Kernel', '');
            done();
        });
    });
});
//# sourceMappingURL=extension.jupyter.comms.jupyterKernel.test.js.map