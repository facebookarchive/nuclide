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
const vscode = require("vscode");
// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
const main_1 = require("../client/jupyter/jupyter_client/main");
const kernel_manager_1 = require("../client/jupyter/kernel-manager");
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
suite('Kernel Manager', () => {
    suiteSetup(done => {
        initialize_1.initialize().then(() => {
            done();
        });
    });
    suiteTeardown(() => {
        disposable.dispose();
    });
    setup(() => {
        process.env['PYTHON_DONJAYAMANNE_TEST'] = '0';
        process.env['DEBUG_DJAYAMANNE_IPYTHON'] = '1';
        disposables = [];
        output = new MockOutputChannel('Jupyter');
        disposables.push(output);
        jupyter = new main_1.JupyterClientAdapter(output, __dirname);
        disposables.push(jupyter);
        // Hack hack hack hack hack :)
        cmds.registerCommand = function () { };
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
        cmds.registerCommand = oldRegisterCommand;
    });
    let output;
    let jupyter;
    let disposables;
    const cmds = vscode.commands;
    const oldRegisterCommand = vscode.commands.registerCommand;
    test('GetAllKernelSpecsFor python', done => {
        process.env['PYTHON_DONJAYAMANNE_TEST'] = '0';
        const mgr = new kernel_manager_1.KernelManagerImpl(output, jupyter);
        disposables.push(mgr);
        mgr.getAllKernelSpecsFor('python').then(specMetadata => {
            assert.notEqual(specMetadata.length, 0, 'No spec metatadata');
            done();
        }).catch(reason => {
            assert.fail(reason, null, 'Some error', '');
        });
    });
    test('Start a kernel', done => {
        const mgr = new kernel_manager_1.KernelManagerImpl(output, jupyter);
        disposables.push(mgr);
        mgr.getAllKernelSpecsFor('python').then(specMetadata => {
            assert.notEqual(specMetadata.length, 0, 'No spec metatadata');
            return mgr.startKernel(specMetadata[0], 'python');
        }).then(kernel => {
            assert.equal(typeof kernel === 'object' && kernel !== null, true, 'Kernel instance not returned');
            done();
        }).catch(reason => {
            assert.fail(reason, null, 'Some error', '');
        });
    });
    test('Start any kernel for Python', done => {
        const mgr = new kernel_manager_1.KernelManagerImpl(output, jupyter);
        disposables.push(mgr);
        mgr.startKernelFor('python').then(kernel => {
            assert.equal(typeof kernel === 'object' && kernel !== null, true, 'Kernel instance not returned');
            done();
        }).catch(reason => {
            assert.fail(reason, null, 'Some error', '');
            done();
        });
    });
});
//# sourceMappingURL=extension.jupyter.comms.jupyterKernelManager.test.js.map