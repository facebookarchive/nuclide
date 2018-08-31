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
// tslint:disable:no-suspicious-comment max-func-body-length no-invalid-this no-var-requires no-require-imports no-any
const path = require("path");
const constants_1 = require("../../client/common/constants");
const core_utils_1 = require("../../client/common/core.utils");
const constants_2 = require("../../client/debugger/Common/constants");
const Contracts_1 = require("../../client/debugger/Common/Contracts");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
const utils_1 = require("./utils");
const workspaceDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, 'src', 'testMultiRootWkspc', 'workspace5');
const debuggerType = 'pythonExperimental';
suite(`Module Debugging - Misc tests: ${debuggerType}`, () => {
    let debugClient;
    setup(function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (!initialize_1.IS_MULTI_ROOT_TEST || !initialize_1.TEST_DEBUGGER) {
                this.skip();
            }
            const coverageDirectory = path.join(constants_1.EXTENSION_ROOT_DIR, 'debug_coverage_module');
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
    function buildLaunchArgs() {
        // tslint:disable-next-line:no-unnecessary-local-variable
        const options = {
            module: 'mymod',
            program: '',
            cwd: workspaceDirectory,
            debugOptions: [Contracts_1.DebugOptions.RedirectOutput],
            pythonPath: common_1.PYTHON_PATH,
            args: [],
            env: { PYTHONPATH: `${constants_2.PTVSD_PATH}` },
            envFile: '',
            logToFile: false,
            type: debuggerType
        };
        return options;
    }
    test('Test stdout output', () => __awaiter(this, void 0, void 0, function* () {
        yield Promise.all([
            debugClient.configurationSequence(),
            debugClient.launch(buildLaunchArgs()),
            debugClient.waitForEvent('initialized'),
            debugClient.assertOutput('stdout', 'Hello world!'),
            debugClient.waitForEvent('exited'),
            debugClient.waitForEvent('terminated')
        ]);
    }));
});
//# sourceMappingURL=module.test.js.map