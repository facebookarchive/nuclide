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
// tslint:disable:no-suspicious-comment max-func-body-length no-invalid-this no-var-requires no-require-imports no-any
const chai_1 = require("chai");
const path = require("path");
const vscode_debugadapter_testsupport_1 = require("vscode-debugadapter-testsupport");
const constants_1 = require("../../client/common/constants");
const core_utils_1 = require("../../client/common/core.utils");
const constants_2 = require("../../client/common/platform/constants");
const fileSystem_1 = require("../../client/common/platform/fileSystem");
const platformService_1 = require("../../client/common/platform/platformService");
const constants_3 = require("../../client/debugger/Common/constants");
const Contracts_1 = require("../../client/debugger/Common/Contracts");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
const constants_4 = require("./common/constants");
const debugClient_1 = require("./debugClient");
const utils_1 = require("./utils");
const isProcessRunning = require('is-running');
const debugFilesPath = path.join(__dirname, '..', '..', '..', 'src', 'test', 'pythonFiles', 'debugging');
const DEBUG_ADAPTER = path.join(__dirname, '..', '..', 'client', 'debugger', 'Main.js');
const MAX_SIGNED_INT32 = Math.pow(2, 31) - 1;
const EXPERIMENTAL_DEBUG_ADAPTER = path.join(__dirname, '..', '..', 'client', 'debugger', 'mainV2.js');
let testCounter = 0;
[DEBUG_ADAPTER, EXPERIMENTAL_DEBUG_ADAPTER].forEach(testAdapterFilePath => {
    const debugAdapterFileName = path.basename(testAdapterFilePath);
    const debuggerType = debugAdapterFileName === 'Main.js' ? 'python' : 'pythonExperimental';
    suite(`Standard Debugging - Misc tests: ${debuggerType}`, () => {
        let debugClient;
        setup(function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (!initialize_1.IS_MULTI_ROOT_TEST || !initialize_1.TEST_DEBUGGER) {
                    this.skip();
                }
                yield new Promise(resolve => setTimeout(resolve, 1000));
                debugClient = createDebugAdapter();
                debugClient.defaultTimeout = constants_4.DEBUGGER_TIMEOUT;
                yield debugClient.start();
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
        /**
         * Creates the debug adapter.
         * We do not need to support code coverage on AppVeyor, lets use the standard test adapter.
         * @returns {DebugClient}
         */
        function createDebugAdapter() {
            if (constants_2.IS_WINDOWS) {
                return new vscode_debugadapter_testsupport_1.DebugClient('node', testAdapterFilePath, debuggerType);
            }
            else {
                const coverageDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, `debug_coverage${testCounter += 1}`);
                return new debugClient_1.DebugClientEx(testAdapterFilePath, debuggerType, coverageDirectory, { cwd: constants_1.EXTENSION_ROOT_DIR });
            }
        }
        function buildLaunchArgs(pythonFile, stopOnEntry = false) {
            const env = debuggerType === 'pythonExperimental' ? { PYTHONPATH: constants_3.PTVSD_PATH } : {};
            // tslint:disable-next-line:no-unnecessary-local-variable
            const options = {
                program: path.join(debugFilesPath, pythonFile),
                cwd: debugFilesPath,
                stopOnEntry,
                debugOptions: [Contracts_1.DebugOptions.RedirectOutput],
                pythonPath: common_1.PYTHON_PATH,
                args: [],
                env,
                envFile: '',
                logToFile: false,
                type: debuggerType
            };
            return options;
        }
        test('Should run program to the end', () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('simplePrint.py', false)),
                debugClient.waitForEvent('initialized'),
                debugClient.waitForEvent('terminated')
            ]);
        }));
        test('Should stop on entry', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'python') {
                    return this.skip();
                }
                yield Promise.all([
                    debugClient.configurationSequence(),
                    debugClient.launch(buildLaunchArgs('simplePrint.py', true)),
                    debugClient.waitForEvent('initialized'),
                    debugClient.waitForEvent('stopped')
                ]);
            });
        });
        test('test stderr output for Python', () => __awaiter(this, void 0, void 0, function* () {
            const output = debuggerType === 'python' ? 'stdout' : 'stderr';
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('stdErrOutput.py', false)),
                debugClient.waitForEvent('initialized'),
                //TODO: ptvsd does not differentiate.
                debugClient.assertOutput(output, 'error output'),
                debugClient.waitForEvent('terminated')
            ]);
        }));
        test('Test stdout output', () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('stdOutOutput.py', false)),
                debugClient.waitForEvent('initialized'),
                debugClient.assertOutput('stdout', 'normal output'),
                debugClient.waitForEvent('terminated')
            ]);
        }));
        test('Should run program to the end (with stopOnEntry=true and continue)', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'python') {
                    return this.skip();
                }
                const threadIdPromise = debugClient.waitForEvent('thread');
                yield Promise.all([
                    debugClient.configurationSequence(),
                    debugClient.launch(buildLaunchArgs('simplePrint.py', true)),
                    debugClient.waitForEvent('initialized'),
                    debugClient.waitForEvent('stopped')
                ]);
                const threadId = (yield threadIdPromise).body.threadId;
                yield Promise.all([
                    debugClient.continueRequest({ threadId }),
                    debugClient.waitForEvent('terminated')
                ]);
            });
        });
        test('Ensure threadid is int32', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'python') {
                    return this.skip();
                }
                const threadIdPromise = debugClient.waitForEvent('thread');
                yield Promise.all([
                    debugClient.configurationSequence(),
                    debugClient.launch(buildLaunchArgs('simplePrint.py', true)),
                    debugClient.waitForEvent('initialized'),
                    debugClient.waitForEvent('stopped')
                ]);
                const threadId = (yield threadIdPromise).body.threadId;
                chai_1.expect(threadId).to.be.lessThan(MAX_SIGNED_INT32 + 1, 'ThreadId is not an integer');
                yield Promise.all([
                    debugClient.continueRequest({ threadId }),
                    debugClient.waitForEvent('terminated')
                ]);
            });
        });
        test('Should break at print statement (line 3)', () => __awaiter(this, void 0, void 0, function* () {
            const launchArgs = buildLaunchArgs('sample2.py', false);
            const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
            yield debugClient.hitBreakpoint(launchArgs, breakpointLocation);
        }));
        test('Should kill python process when ending debug session', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType === 'python') {
                    return this.skip();
                }
                const launchArgs = buildLaunchArgs('sample2.py', false);
                const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
                const processPromise = debugClient.waitForEvent('process');
                yield debugClient.hitBreakpoint(launchArgs, breakpointLocation);
                const processInfo = yield processPromise;
                const processId = processInfo.body.systemProcessId;
                chai_1.expect(processId).to.be.greaterThan(0, 'Invalid process id');
                yield debugClient.stop();
                yield common_1.sleep(1000);
                // Confirm the process is dead
                chai_1.expect(isProcessRunning(processId)).to.be.equal(false, 'Python (debugee) Process is still alive');
            });
        });
        test('Test conditional breakpoints', () => __awaiter(this, void 0, void 0, function* () {
            const threadIdPromise = debugClient.waitForEvent('thread');
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('forever.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const breakpointLocation = { path: path.join(debugFilesPath, 'forever.py'), column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column, condition: 'i == 3' }],
                source: { path: breakpointLocation.path }
            });
            yield common_1.sleep(1);
            yield threadIdPromise;
            const frames = yield debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            // Wait for breakpoint to hit
            const frameId = frames.body.stackFrames[0].id;
            const scopes = yield debugClient.scopesRequest({ frameId });
            chai_1.expect(scopes.body.scopes).of.length(1, 'Incorrect number of scopes');
            const variablesReference = scopes.body.scopes[0].variablesReference;
            const variables = yield debugClient.variablesRequest({ variablesReference });
            const vari = variables.body.variables.find(item => item.name === 'i');
            chai_1.expect(vari).to.be.not.equal('undefined', 'variable \'i\' is undefined');
            chai_1.expect(vari.value).to.be.equal('3');
        }));
        test('Test variables', () => __awaiter(this, void 0, void 0, function* () {
            const threadIdPromise = debugClient.waitForEvent('thread');
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('sample2.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            yield threadIdPromise;
            const stackFramesPromise = debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            // Wait for breakpoint to hit
            const frameId = (yield stackFramesPromise).body.stackFrames[0].id;
            const scopes = yield debugClient.scopesRequest({ frameId });
            chai_1.expect(scopes.body.scopes).of.length(1, 'Incorrect number of scopes');
            const variablesReference = scopes.body.scopes[0].variablesReference;
            const variables = yield debugClient.variablesRequest({ variablesReference });
            const vara = variables.body.variables.find(item => item.name === 'a');
            const varb = variables.body.variables.find(item => item.name === 'b');
            const varfile = variables.body.variables.find(item => item.name === '__file__');
            const vardoc = variables.body.variables.find(item => item.name === '__doc__');
            chai_1.expect(vara).to.be.not.equal('undefined', 'variable \'a\' is undefined');
            chai_1.expect(vara.value).to.be.equal('1');
            chai_1.expect(varb).to.be.not.equal('undefined', 'variable \'b\' is undefined');
            chai_1.expect(varb.value).to.be.equal('2');
            chai_1.expect(varfile).to.be.not.equal('undefined', 'variable \'__file__\' is undefined');
            chai_1.expect(path.normalize(varfile.value)).to.be.equal(`'${path.normalize(path.join(debugFilesPath, 'sample2.py'))}'`);
            chai_1.expect(vardoc).to.be.not.equal('undefined', 'variable \'__doc__\' is undefined');
        }));
        test('Test editing variables', () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('sample2.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            // const threadId = ((await threadIdPromise) as ThreadEvent).body.threadId;
            const stackFramesPromise = debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            // Wait for breakpoint to hit
            const frameId = (yield stackFramesPromise).body.stackFrames[0].id;
            const scopes = yield debugClient.scopesRequest({ frameId });
            chai_1.expect(scopes.body.scopes).of.length(1, 'Incorrect number of scopes');
            const variablesReference = scopes.body.scopes[0].variablesReference;
            const variables = yield debugClient.variablesRequest({ variablesReference });
            const vara = variables.body.variables.find(item => item.name === 'a');
            chai_1.expect(vara).to.be.not.equal('undefined', 'variable \'a\' is undefined');
            chai_1.expect(vara.value).to.be.equal('1');
            const response = yield debugClient.setVariableRequest({ variablesReference, name: 'a', value: '1234' });
            chai_1.expect(response.success).to.be.equal(true, 'settting variable failed');
            chai_1.expect(response.body.value).to.be.equal('1234');
        }));
        test('Test evaluating expressions', () => __awaiter(this, void 0, void 0, function* () {
            const threadIdPromise = debugClient.waitForEvent('thread');
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('sample2.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            yield threadIdPromise;
            const stackFramesPromise = debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            // Wait for breakpoint to hit
            const frameId = (yield stackFramesPromise).body.stackFrames[0].id;
            const response = yield debugClient.evaluateRequest({ frameId, expression: '(a+b)*2' });
            chai_1.expect(response.success).to.be.equal(true, 'variable evaluation failed');
            chai_1.expect(response.body.result).to.be.equal('6', 'expression value is incorrect');
        }));
        test('Test stepover', () => __awaiter(this, void 0, void 0, function* () {
            const threadIdPromise = debugClient.waitForEvent('thread');
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('sample2.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            // hit breakpoint.
            const threadId = (yield threadIdPromise).body.threadId;
            yield debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            const functionLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 7 };
            yield Promise.all([
                debugClient.nextRequest({ threadId }),
                debugClient.assertStoppedLocation('step', functionLocation)
            ]);
            const functionInvocationLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 11 };
            yield Promise.all([
                debugClient.nextRequest({ threadId }),
                debugClient.assertStoppedLocation('step', functionInvocationLocation)
            ]);
            const printLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 13 };
            yield Promise.all([
                debugClient.nextRequest({ threadId }),
                debugClient.assertStoppedLocation('step', printLocation)
            ]);
        }));
        test('Test stepin and stepout', () => __awaiter(this, void 0, void 0, function* () {
            const threadIdPromise = debugClient.waitForEvent('thread');
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('sample2.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const breakpointLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            // hit breakpoint.
            yield debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            const threadId = (yield threadIdPromise).body.threadId;
            const functionLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 7 };
            yield Promise.all([
                debugClient.nextRequest({ threadId }),
                debugClient.assertStoppedLocation('step', functionLocation)
            ]);
            const functionInvocationLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 11 };
            yield Promise.all([
                debugClient.nextRequest({ threadId }),
                debugClient.assertStoppedLocation('step', functionInvocationLocation)
            ]);
            const loopPrintLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 8 };
            yield Promise.all([
                debugClient.stepInRequest({ threadId }),
                debugClient.assertStoppedLocation('step', loopPrintLocation)
            ]);
            yield Promise.all([
                debugClient.stepOutRequest({ threadId }),
                debugClient.assertStoppedLocation('step', functionInvocationLocation)
            ]);
            const printLocation = { path: path.join(debugFilesPath, 'sample2.py'), column: 1, line: 13 };
            yield Promise.all([
                debugClient.nextRequest({ threadId }),
                debugClient.assertStoppedLocation('step', printLocation)
            ]);
        }));
        test('Test pausing', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'pythonExperimental') {
                    return this.skip();
                }
                yield Promise.all([
                    debugClient.configurationSequence(),
                    debugClient.launch(buildLaunchArgs('forever.py', false)),
                    debugClient.waitForEvent('initialized'),
                    debugClient.waitForEvent('process')
                ]);
                yield common_1.sleep(3);
                const pauseLocation = { path: path.join(debugFilesPath, 'forever.py'), line: 5 };
                const pausePromise = debugClient.assertStoppedLocation('pause', pauseLocation);
                const threads = yield debugClient.threadsRequest();
                chai_1.expect(threads).to.be.not.equal(undefined, 'no threads response');
                chai_1.expect(threads.body.threads).to.be.lengthOf(1);
                yield debugClient.pauseRequest({ threadId: threads.body.threads[0].id });
                yield pausePromise;
            });
        });
        test('Test pausing on exceptions', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'python') {
                    return this.skip();
                }
                yield Promise.all([
                    debugClient.configurationSequence(),
                    debugClient.launch(buildLaunchArgs('sample3WithEx.py', false)),
                    debugClient.waitForEvent('initialized')
                ]);
                const pauseLocation = { path: path.join(debugFilesPath, 'sample3WithEx.py'), line: 5 };
                yield debugClient.assertStoppedLocation('exception', pauseLocation);
            });
        });
        test('Test pausing on assert failures', () => __awaiter(this, void 0, void 0, function* () {
            const pauseLocation = { path: path.join(debugFilesPath, 'sampleWithAssertEx.py'), line: 1 };
            function waitToStopDueToException() {
                return new Promise((resolve, reject) => {
                    debugClient.once('stopped', (event) => {
                        if (event.body.reason === 'exception' &&
                            event.body.text && event.body.text.startsWith('AssertionError')) {
                            resolve();
                        }
                        else {
                            reject(new Error('Stopped for some other reason'));
                        }
                    });
                    setTimeout(() => {
                        reject(new Error(`waitToStopDueToException not received after ${debugClient.defaultTimeout} ms`));
                    }, debugClient.defaultTimeout);
                });
            }
            function setBreakpointFilter() {
                if (debuggerType === 'python') {
                    return Promise.resolve();
                }
                else {
                    return debugClient.waitForEvent('initialized')
                        .then(() => debugClient.setExceptionBreakpointsRequest({ filters: ['uncaught'] }))
                        .then(() => debugClient.configurationDoneRequest());
                }
            }
            yield Promise.all([
                debugClient.configurationSequence(),
                setBreakpointFilter(),
                debugClient.launch(buildLaunchArgs('sampleWithAssertEx.py', false)),
                waitToStopDueToException(),
                debugClient.assertStoppedLocation('exception', pauseLocation)
            ]);
        }));
        test('Test multi-threaded debugging', () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('multiThread.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            // Add a delay for debugger to start (sometimes it takes a long time for new debugger to break).
            yield common_1.sleep(3000);
            const pythonFile = path.join(debugFilesPath, 'multiThread.py');
            const breakpointLocation = { path: pythonFile, column: 1, line: 11 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            yield debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            const threads = yield debugClient.threadsRequest();
            chai_1.expect(threads.body.threads).of.lengthOf(2, 'incorrect number of threads');
            for (const thread of threads.body.threads) {
                chai_1.expect(thread.id).to.be.lessThan(MAX_SIGNED_INT32 + 1, 'ThreadId is not an integer');
            }
        }));
        test('Test multi-threaded debugging', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(30000);
                yield Promise.all([
                    debugClient.launch(buildLaunchArgs('multiThread.py', false)),
                    debugClient.waitForEvent('initialized')
                ]);
                const pythonFile = path.join(debugFilesPath, 'multiThread.py');
                const breakpointLocation = { path: pythonFile, column: 1, line: 11 };
                const breakpointRequestArgs = {
                    lines: [breakpointLocation.line],
                    breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                    source: { path: breakpointLocation.path }
                };
                function waitForStoppedEventFromTwoThreads() {
                    return new Promise((resolve, reject) => {
                        let numberOfStops = 0;
                        debugClient.addListener('stopped', (event) => {
                            numberOfStops += 1;
                            if (numberOfStops < 2) {
                                return;
                            }
                            resolve(event);
                        });
                        setTimeout(() => reject(new Error('Timeout waiting for two threads to stop at breakpoint')), constants_4.DEBUGGER_TIMEOUT);
                    });
                }
                yield Promise.all([
                    debugClient.setBreakpointsRequest(breakpointRequestArgs),
                    debugClient.setExceptionBreakpointsRequest({ filters: [] }),
                    debugClient.configurationDoneRequest(),
                    waitForStoppedEventFromTwoThreads(),
                    debugClient.assertStoppedLocation('breakpoint', breakpointLocation)
                ]);
                const threads = yield debugClient.threadsRequest();
                chai_1.expect(threads.body.threads).of.lengthOf(2, 'incorrect number of threads');
                for (const thread of threads.body.threads) {
                    chai_1.expect(thread.id).to.be.lessThan(MAX_SIGNED_INT32 + 1, 'ThreadId is not an integer');
                }
            });
        });
        test('Test stack frames', () => __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(buildLaunchArgs('stackFrame.py', false)),
                debugClient.waitForEvent('initialized')
            ]);
            const pythonFile = path.join(debugFilesPath, 'stackFrame.py');
            const breakpointLocation = { path: pythonFile, column: 1, line: 5 };
            yield debugClient.setBreakpointsRequest({
                lines: [breakpointLocation.line],
                breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                source: { path: breakpointLocation.path }
            });
            // hit breakpoint.
            const stackframes = yield debugClient.assertStoppedLocation('breakpoint', breakpointLocation);
            const fileSystem = new fileSystem_1.FileSystem(new platformService_1.PlatformService());
            chai_1.expect(stackframes.body.stackFrames[0].line).to.be.equal(5);
            chai_1.expect(fileSystem.arePathsSame(stackframes.body.stackFrames[0].source.path, pythonFile)).to.be.equal(true, 'paths do not match');
            chai_1.expect(stackframes.body.stackFrames[0].name).to.be.equal('foo');
            chai_1.expect(stackframes.body.stackFrames[1].line).to.be.equal(8);
            chai_1.expect(fileSystem.arePathsSame(stackframes.body.stackFrames[1].source.path, pythonFile)).to.be.equal(true, 'paths do not match');
            chai_1.expect(stackframes.body.stackFrames[1].name).to.be.equal('bar');
            chai_1.expect(stackframes.body.stackFrames[2].line).to.be.equal(10);
            chai_1.expect(fileSystem.arePathsSame(stackframes.body.stackFrames[2].source.path, pythonFile)).to.be.equal(true, 'paths do not match');
        }));
        test('Test Evaluation of Expressions', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'pythonExperimental') {
                    return this.skip();
                }
                const breakpointLocation = { path: path.join(debugFilesPath, 'sample2WithoutSleep.py'), column: 1, line: 5 };
                const breakpointArgs = {
                    lines: [breakpointLocation.line],
                    breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column }],
                    source: { path: breakpointLocation.path }
                };
                yield Promise.all([
                    debugClient.launch(buildLaunchArgs('sample2WithoutSleep.py', false)),
                    debugClient.waitForEvent('initialized')
                        .then(() => debugClient.setBreakpointsRequest(breakpointArgs))
                        .then(() => debugClient.configurationDoneRequest())
                        .then(() => debugClient.threadsRequest()),
                    debugClient.waitForEvent('thread'),
                    debugClient.assertStoppedLocation('breakpoint', breakpointLocation)
                ]);
                //Do not remove this, this is required to ensure PTVSD is ready to accept other requests.
                yield debugClient.threadsRequest();
                const evaluateResponse = yield debugClient.evaluateRequest({ context: 'repl', expression: 'a+b+2', frameId: 1 });
                chai_1.expect(evaluateResponse.body.type).to.equal('int');
                chai_1.expect(evaluateResponse.body.result).to.equal('5');
                yield utils_1.continueDebugging(debugClient);
            });
        });
        test('Test Passing custom args to python file', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'pythonExperimental') {
                    return this.skip();
                }
                const options = buildLaunchArgs('printSysArgv.py', false);
                options.args = ['1', '2', '3'];
                yield Promise.all([
                    debugClient.configurationSequence(),
                    debugClient.launch(options),
                    debugClient.assertOutput('stdout', options.args.join(',')),
                    debugClient.waitForEvent('terminated')
                ]);
            });
        });
        test('Test Logpoints', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'pythonExperimental') {
                    return this.skip();
                }
                const breakpointLocation = { path: path.join(debugFilesPath, 'logMessage.py'), line: 4 };
                const breakpointArgs = {
                    lines: [breakpointLocation.line],
                    breakpoints: [{ line: breakpointLocation.line, logMessage: 'Sum of {a} and {b} is 3' }],
                    source: { path: breakpointLocation.path }
                };
                yield Promise.all([
                    debugClient.launch(buildLaunchArgs('logMessage.py', false)),
                    debugClient.waitForEvent('initialized')
                        .then(() => debugClient.setBreakpointsRequest(breakpointArgs))
                        .then(() => debugClient.configurationDoneRequest())
                        .then(() => debugClient.threadsRequest()),
                    debugClient.waitForEvent('thread')
                        .then(() => debugClient.threadsRequest()),
                    debugClient.assertOutput('stdout', 'Sum of 1 and 2 is 3'),
                    debugClient.waitForEvent('terminated')
                ]);
            });
        });
        test('Test Hit Count Breakpoints', function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (debuggerType !== 'pythonExperimental') {
                    return this.skip();
                }
                const breakpointLocation = { path: path.join(debugFilesPath, 'loopyTest.py'), column: 1, line: 2 };
                const breakpointArgs = {
                    lines: [breakpointLocation.line],
                    breakpoints: [{ line: breakpointLocation.line, column: breakpointLocation.column, hitCondition: '5' }],
                    source: { path: breakpointLocation.path }
                };
                yield Promise.all([
                    debugClient.launch(buildLaunchArgs('loopyTest.py', false)),
                    debugClient.waitForEvent('initialized')
                        .then(() => debugClient.setBreakpointsRequest(breakpointArgs))
                        .then(() => debugClient.configurationDoneRequest())
                        .then(() => debugClient.threadsRequest()),
                    debugClient.waitForEvent('thread'),
                    debugClient.assertStoppedLocation('breakpoint', breakpointLocation)
                ]);
                //Do not remove this, this is required to ensure PTVSD is ready to accept other requests.
                yield debugClient.threadsRequest();
                const evaluateResponse = yield debugClient.evaluateRequest({ context: 'repl', expression: 'i', frameId: 1 });
                chai_1.expect(evaluateResponse.body.type).to.equal('int');
                chai_1.expect(evaluateResponse.body.result).to.equal('4');
                yield utils_1.continueDebugging(debugClient);
            });
        });
    });
});
//# sourceMappingURL=misc.test.js.map