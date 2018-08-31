// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-invalid-this no-require-imports no-require-imports no-var-requires
const chai_1 = require("chai");
const path = require("path");
const constants_1 = require("../../client/common/constants");
const core_utils_1 = require("../../client/common/core.utils");
const constants_2 = require("../../client/debugger/Common/constants");
const Contracts_1 = require("../../client/debugger/Common/Contracts");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
const utils_1 = require("./utils");
const isProcessRunning = require('is-running');
const debugFilesPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'debugging');
const debuggerType = 'pythonExperimental';
suite('Run without Debugging', () => {
    let debugClient;
    setup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialize_1.IS_MULTI_ROOT_TEST || !initialize_1.TEST_DEBUGGER) {
                this.skip();
            }
            yield new Promise(resolve => setTimeout(resolve, 1000));
            const coverageDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, `debug_coverage_nodebug${this.currentTest.title}`);
            debugClient = yield utils_1.createDebugAdapter(coverageDirectory);
        });
    });
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        // Wait for a second before starting another test (sometimes, sockets take a while to get closed).
        yield common_1.sleep(1000);
        try {
            yield debugClient.stop().catch(core_utils_1.noop);
            // tslint:disable-next-line:no-empty
        }
        catch (ex) { }
        yield common_1.sleep(1000);
    }));
    function buildLauncArgs(pythonFile, stopOnEntry = false) {
        // tslint:disable-next-line:no-unnecessary-local-variable
        const options = {
            program: path.join(debugFilesPath, pythonFile),
            cwd: debugFilesPath,
            stopOnEntry,
            noDebug: true,
            debugOptions: [Contracts_1.DebugOptions.RedirectOutput],
            pythonPath: common_1.PYTHON_PATH,
            args: [],
            env: { PYTHONPATH: constants_2.PTVSD_PATH },
            envFile: '',
            logToFile: false,
            type: debuggerType
        };
        return options;
    }
    test('Should run program to the end', () => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            debugClient.configurationSequence(),
            debugClient.launch(buildLauncArgs('simplePrint.py', false)),
            debugClient.waitForEvent('initialized'),
            debugClient.waitForEvent('terminated')
        ]);
    }));
    test('test stderr output for Python', () => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            debugClient.configurationSequence(),
            debugClient.launch(buildLauncArgs('stdErrOutput.py', false)),
            debugClient.waitForEvent('initialized'),
            debugClient.assertOutput('stderr', 'error output'),
            debugClient.waitForEvent('terminated')
        ]);
    }));
    test('Test stdout output', () => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            debugClient.configurationSequence(),
            debugClient.launch(buildLauncArgs('stdOutOutput.py', false)),
            debugClient.waitForEvent('initialized'),
            debugClient.assertOutput('stdout', 'normal output'),
            debugClient.waitForEvent('terminated')
        ]);
    }));
    test('Should kill python process when ending debug session', () => __awaiter(this, void 0, void 0, function* () {
        const processIdOutput = new Promise(resolve => {
            debugClient.on('output', (event) => {
                if (event.event === 'output' && event.body.category === 'stdout') {
                    resolve(parseInt(event.body.output.trim(), 10));
                }
            });
        });
        yield Promise.all([
            debugClient.configurationSequence(),
            debugClient.launch(buildLauncArgs('sampleWithSleep.py', false)),
            debugClient.waitForEvent('initialized'),
            processIdOutput
        ]);
        const processId = yield processIdOutput;
        chai_1.expect(processId).to.be.greaterThan(0, 'Invalid process id');
        yield debugClient.stop();
        yield common_1.sleep(1000);
        // Confirm the process is dead
        chai_1.expect(isProcessRunning(processId)).to.be.equal(false, 'Python program is still alive');
    }));
});
//# sourceMappingURL=run.test.js.map