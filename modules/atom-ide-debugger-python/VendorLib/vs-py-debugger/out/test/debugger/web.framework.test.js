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
// tslint:disable:no-suspicious-comment max-func-body-length no-invalid-this no-var-requires no-require-imports no-any no-http-string no-string-literal no-console
const chai_1 = require("chai");
const getFreePort = require("get-port");
const path = require("path");
const constants_1 = require("../../client/common/constants");
const core_utils_1 = require("../../client/common/core.utils");
const stopWatch_1 = require("../../client/common/stopWatch");
const Contracts_1 = require("../../client/debugger/Common/Contracts");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
const constants_2 = require("./common/constants");
const utils_1 = require("./utils");
let testCounter = 0;
const debuggerType = 'pythonExperimental';
suite(`Django and Flask Debugging: ${debuggerType}`, () => {
    let debugClient;
    setup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialize_1.IS_MULTI_ROOT_TEST || !initialize_1.TEST_DEBUGGER) {
                this.skip();
            }
            this.timeout(5 * constants_2.DEBUGGER_TIMEOUT);
            const coverageDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, `debug_coverage_django_flask${testCounter += 1}`);
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
    function buildLaunchArgs(workspaceDirectory) {
        const env = {};
        // tslint:disable-next-line:no-string-literal
        env['PYTHONPATH'] = path.join(constants_1.EXTENSION_ROOT_DIR, 'pythonFiles', 'experimental', 'ptvsd');
        // tslint:disable-next-line:no-unnecessary-local-variable
        const options = {
            cwd: workspaceDirectory,
            program: '',
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
    function buildFlaskLaunchArgs(workspaceDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const port = yield getFreePort({ host: 'localhost' });
            const options = buildLaunchArgs(workspaceDirectory);
            options.env['FLASK_APP'] = 'run.py';
            options.module = 'flask';
            options.debugOptions = [Contracts_1.DebugOptions.RedirectOutput, Contracts_1.DebugOptions.Jinja];
            options.args = [
                'run',
                '--no-debugger',
                '--no-reload',
                '--without-threads',
                '--port',
                `${port}`
            ];
            return { options, port };
        });
    }
    function buildDjangoLaunchArgs(workspaceDirectory) {
        return __awaiter(this, void 0, void 0, function* () {
            const port = yield getFreePort({ host: 'localhost' });
            const options = buildLaunchArgs(workspaceDirectory);
            options.program = path.join(workspaceDirectory, 'manage.py');
            options.debugOptions = [Contracts_1.DebugOptions.RedirectOutput, Contracts_1.DebugOptions.Django];
            options.args = [
                'runserver',
                '--noreload',
                '--nothreading',
                `${port}`
            ];
            return { options, port };
        });
    }
    function waitForWebServerToStart(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                let maxTries = 50;
                const timeout = 10000;
                const start = new stopWatch_1.StopWatch();
                const fn = () => {
                    utils_1.makeHttpRequest(url)
                        .then(resolve)
                        .catch(ex => {
                        maxTries -= 1;
                        if (maxTries === 0 || start.elapsedTime >= timeout) {
                            reject(ex);
                        }
                        else {
                            setTimeout(fn, 100);
                        }
                    });
                };
                fn();
            });
        });
    }
    function testTemplateDebugging(launchArgs, port, viewFile, viewLine, templateFile, templateLine) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                debugClient.configurationSequence(),
                debugClient.launch(launchArgs),
                debugClient.waitForEvent('initialized'),
                debugClient.waitForEvent('process'),
                debugClient.waitForEvent('thread')
            ]);
            const url = `http://localhost:${port}`;
            yield waitForWebServerToStart(url);
            const httpResult = yield utils_1.makeHttpRequest(url);
            chai_1.expect(httpResult).to.contain('Hello this_is_a_value_from_server');
            chai_1.expect(httpResult).to.contain('Hello this_is_another_value_from_server');
            yield utils_1.hitHttpBreakpoint(debugClient, url, viewFile, viewLine);
            yield utils_1.continueDebugging(debugClient);
            yield debugClient.setBreakpointsRequest({ breakpoints: [], lines: [], source: { path: viewFile } });
            // Template debugging.
            const [stackTrace, htmlResultPromise] = yield utils_1.hitHttpBreakpoint(debugClient, url, templateFile, templateLine);
            // Wait for breakpoint to hit
            const expectedVariables = [
                { name: 'value_from_server', type: 'str', value: '\'this_is_a_value_from_server\'' },
                { name: 'another_value_from_server', type: 'str', value: '\'this_is_another_value_from_server\'' }
            ];
            yield utils_1.validateVariablesInFrame(debugClient, stackTrace, expectedVariables, 1);
            yield debugClient.setBreakpointsRequest({ breakpoints: [], lines: [], source: { path: templateFile } });
            yield utils_1.continueDebugging(debugClient);
            const htmlResult = yield htmlResultPromise;
            chai_1.expect(htmlResult).to.contain('Hello this_is_a_value_from_server');
            chai_1.expect(htmlResult).to.contain('Hello this_is_another_value_from_server');
        });
    }
    test('Test Flask Route and Template debugging', () => __awaiter(this, void 0, void 0, function* () {
        const workspaceDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, 'src', 'testMultiRootWkspc', 'workspace5', 'flaskApp');
        const { options, port } = yield buildFlaskLaunchArgs(workspaceDirectory);
        yield testTemplateDebugging(options, port, path.join(workspaceDirectory, 'run.py'), 7, path.join(workspaceDirectory, 'templates', 'index.html'), 6);
    }));
    test('Test Django Route and Template debugging', () => __awaiter(this, void 0, void 0, function* () {
        const workspaceDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, 'src', 'testMultiRootWkspc', 'workspace5', 'djangoApp');
        const { options, port } = yield buildDjangoLaunchArgs(workspaceDirectory);
        yield testTemplateDebugging(options, port, path.join(workspaceDirectory, 'home', 'views.py'), 10, path.join(workspaceDirectory, 'home', 'templates', 'index.html'), 6);
    }));
});
//# sourceMappingURL=web.framework.test.js.map