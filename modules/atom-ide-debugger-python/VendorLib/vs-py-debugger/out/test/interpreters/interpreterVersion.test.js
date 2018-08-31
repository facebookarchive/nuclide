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
const chai_1 = require("chai");
const chaiAsPromised = require("chai-as-promised");
require("../../client/common/extensions");
const types_1 = require("../../client/common/process/types");
const contracts_1 = require("../../client/interpreter/contracts");
const interpreterVersion_1 = require("../../client/interpreter/interpreterVersion");
const common_1 = require("../common");
const initialize_1 = require("../initialize");
const serviceRegistry_1 = require("../unittests/serviceRegistry");
chai_1.use(chaiAsPromised);
suite('Interpreters display version', () => {
    let ioc;
    suiteSetup(initialize_1.initialize);
    setup(() => __awaiter(this, void 0, void 0, function* () {
        initializeDI();
        yield initialize_1.initializeTest();
    }));
    teardown(() => ioc.dispose());
    function initializeDI() {
        ioc = new serviceRegistry_1.UnitTestIocContainer();
        ioc.registerCommonTypes();
        ioc.registerProcessTypes();
        ioc.registerVariableTypes();
        ioc.registerInterpreterTypes();
    }
    test('Must return the Python Version', () => __awaiter(this, void 0, void 0, function* () {
        const pythonProcess = yield ioc.serviceContainer.get(types_1.IProcessServiceFactory).create();
        const output = yield pythonProcess.exec(common_1.PYTHON_PATH, ['--version'], { cwd: __dirname, mergeStdOutErr: true });
        const version = output.stdout.splitLines()[0];
        const interpreterVersion = ioc.serviceContainer.get(contracts_1.IInterpreterVersionService);
        const pyVersion = yield interpreterVersion.getVersion(common_1.PYTHON_PATH, 'DEFAULT_TEST_VALUE');
        chai_1.assert.equal(pyVersion, version, 'Incorrect version');
    }));
    test('Must return the default value when Python path is invalid', () => __awaiter(this, void 0, void 0, function* () {
        const interpreterVersion = ioc.serviceContainer.get(contracts_1.IInterpreterVersionService);
        const pyVersion = yield interpreterVersion.getVersion('INVALID_INTERPRETER', 'DEFAULT_TEST_VALUE');
        chai_1.assert.equal(pyVersion, 'DEFAULT_TEST_VALUE', 'Incorrect version');
    }));
    test('Must return the pip Version.', () => __awaiter(this, void 0, void 0, function* () {
        const pythonProcess = yield ioc.serviceContainer.get(types_1.IProcessServiceFactory).create();
        const result = yield pythonProcess.exec(common_1.PYTHON_PATH, ['-m', 'pip', '--version'], { cwd: __dirname, mergeStdOutErr: true });
        const output = result.stdout.splitLines()[0];
        // Take the second part, see below example.
        // pip 9.0.1 from /Users/donjayamanne/anaconda3/lib/python3.6/site-packages (python 3.6).
        const re = new RegExp(interpreterVersion_1.PIP_VERSION_REGEX, 'g');
        const matches = re.exec(output);
        chai_1.assert.isNotNull(matches, 'No matches for version found');
        // tslint:disable-next-line:no-non-null-assertion
        chai_1.assert.isAtLeast(matches.length, 1, 'Version number not found');
        const interpreterVersion = ioc.serviceContainer.get(contracts_1.IInterpreterVersionService);
        const pipVersionPromise = interpreterVersion.getPipVersion(common_1.PYTHON_PATH);
        // tslint:disable-next-line:no-non-null-assertion
        yield chai_1.expect(pipVersionPromise).to.eventually.equal(matches[0].trim());
    }));
    test('Must throw an exception when pip version cannot be determined', () => __awaiter(this, void 0, void 0, function* () {
        const interpreterVersion = ioc.serviceContainer.get(contracts_1.IInterpreterVersionService);
        const pipVersionPromise = interpreterVersion.getPipVersion('INVALID_INTERPRETER');
        yield chai_1.expect(pipVersionPromise).to.be.rejectedWith();
    }));
});
//# sourceMappingURL=interpreterVersion.test.js.map