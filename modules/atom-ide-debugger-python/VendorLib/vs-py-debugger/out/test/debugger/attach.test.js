"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable:no-invalid-this max-func-body-length no-empty no-increment-decrement
const chai_1 = require("chai");
const getFreePort = require("get-port");
const path = require("path");
const vscode_debugadapter_testsupport_1 = require("vscode-debugadapter-testsupport");
const helpers_1 = require("../../client/common/helpers");
const decoder_1 = require("../../client/common/process/decoder");
const proc_1 = require("../../client/common/process/proc");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
const constants_1 = require("./common/constants");
const fileToDebug = path.join(__dirname, '..', '..', '..', 'src', 'testMultiRootWkspc', 'workspace5', 'remoteDebugger.py');
const ptvsdPath = path.join(__dirname, '..', '..', '..', 'pythonFiles', 'PythonTools');
const DEBUG_ADAPTER = path.join(__dirname, '..', '..', 'client', 'debugger', 'Main.js');
suite('Attach Debugger', () => {
    let debugClient;
    let procToKill;
    suiteSetup(initialize_1.initialize);
    setup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialize_1.IS_MULTI_ROOT_TEST || !initialize_1.TEST_DEBUGGER) {
                this.skip();
            }
            yield common_1.sleep(1000);
            debugClient = new vscode_debugadapter_testsupport_1.DebugClient('node', DEBUG_ADAPTER, 'python');
            debugClient.defaultTimeout = constants_1.DEBUGGER_TIMEOUT;
            yield debugClient.start();
        });
    });
    teardown(() => __awaiter(this, void 0, void 0, function* () {
        // Wait for a second before starting another test (sometimes, sockets take a while to get closed).
        yield common_1.sleep(1000);
        try {
            yield debugClient.stop().catch(() => { });
        }
        catch (ex) { }
        if (procToKill) {
            try {
                procToKill.kill();
            }
            catch (_a) { }
        }
    }));
    test('Confirm we are able to attach to a running program', () => __awaiter(this, void 0, void 0, function* () {
        // Lets skip this test on AppVeyor (very flaky on AppVeyor).
        if (initialize_1.IS_APPVEYOR) {
            return;
        }
        const port = yield getFreePort({ host: 'localhost', port: 3000 });
        const args = {
            localRoot: path.dirname(fileToDebug),
            remoteRoot: path.dirname(fileToDebug),
            port: port,
            host: 'localhost',
            secret: 'super_secret'
        };
        const customEnv = Object.assign({}, process.env);
        // Set the path for PTVSD to be picked up.
        // tslint:disable-next-line:no-string-literal
        customEnv['PYTHONPATH'] = ptvsdPath;
        const procService = new proc_1.ProcessService(new decoder_1.BufferDecoder());
        const result = procService.execObservable(common_1.PYTHON_PATH, [fileToDebug, port.toString()], { env: customEnv, cwd: path.dirname(fileToDebug) });
        procToKill = result.proc;
        const expectedOutputs = [
            { value: 'start', deferred: helpers_1.createDeferred() },
            { value: 'attached', deferred: helpers_1.createDeferred() },
            { value: 'end', deferred: helpers_1.createDeferred() }
        ];
        const startOutputReceived = expectedOutputs[0].deferred.promise;
        const attachedOutputReceived = expectedOutputs[1].deferred.promise;
        const lastOutputReceived = expectedOutputs[2].deferred.promise;
        result.out.subscribe(output => {
            if (expectedOutputs[0].value === output.out) {
                expectedOutputs.shift().deferred.resolve();
            }
        });
        yield startOutputReceived;
        const initializePromise = debugClient.initializeRequest({
            adapterID: 'python',
            linesStartAt1: true,
            columnsStartAt1: true,
            supportsRunInTerminalRequest: true,
            pathFormat: 'path'
        });
        yield debugClient.attachRequest(args);
        yield initializePromise;
        // Wait till we attach.
        yield attachedOutputReceived;
        // Add a breakpoint.
        const breakpointLocation = { path: fileToDebug, column: 1, line: 16 };
        yield debugClient.setBreakpointsRequest({
            lines: [breakpointLocation.line],
            breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
            source: { path: breakpointLocation.path }
        });
        yield debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
        // Get thread to continue.
        const threads = yield debugClient.threadsRequest();
        chai_1.expect(threads).to.be.not.equal(undefined, 'no threads response');
        chai_1.expect(threads.body.threads).to.be.lengthOf(1);
        // Continue the program.
        yield debugClient.continueRequest({ threadId: threads.body.threads[0].id });
        yield lastOutputReceived;
        yield debugClient.waitForEvent('terminated');
    }));
});
//# sourceMappingURL=attach.test.js.map