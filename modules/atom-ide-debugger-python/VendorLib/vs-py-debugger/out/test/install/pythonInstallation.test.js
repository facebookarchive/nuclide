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
const assert = require("assert");
const inversify_1 = require("inversify");
const TypeMoq = require("typemoq");
const types_1 = require("../../client/common/application/types");
const pythonInstallation_1 = require("../../client/common/installer/pythonInstallation");
const types_2 = require("../../client/common/platform/types");
const contracts_1 = require("../../client/interpreter/contracts");
const container_1 = require("../../client/ioc/container");
const serviceManager_1 = require("../../client/ioc/serviceManager");
const initialize_1 = require("../initialize");
const info = {
    architecture: types_2.Architecture.Unknown,
    companyDisplayName: '',
    displayName: '',
    envName: '',
    path: '',
    type: contracts_1.InterpreterType.Unknown,
    version: '',
    version_info: [0, 0, 0, 'alpha'],
    sysPrefix: '',
    sysVersion: ''
};
class TestContext {
    constructor(isMac) {
        const cont = new inversify_1.Container();
        this.serviceManager = new serviceManager_1.ServiceManager(cont);
        this.serviceContainer = new container_1.ServiceContainer(cont);
        this.platform = TypeMoq.Mock.ofType();
        this.appShell = TypeMoq.Mock.ofType();
        this.locator = TypeMoq.Mock.ofType();
        this.settings = TypeMoq.Mock.ofType();
        const activeInterpreter = Object.assign({}, info, { type: contracts_1.InterpreterType.Unknown, path: '' });
        const interpreterService = TypeMoq.Mock.ofType();
        interpreterService
            .setup(x => x.getActiveInterpreter(TypeMoq.It.isAny()))
            .returns(() => new Promise((resolve, reject) => resolve(activeInterpreter)));
        this.serviceManager.addSingletonInstance(types_2.IPlatformService, this.platform.object);
        this.serviceManager.addSingletonInstance(types_1.IApplicationShell, this.appShell.object);
        this.serviceManager.addSingletonInstance(contracts_1.IInterpreterLocatorService, this.locator.object);
        this.serviceManager.addSingletonInstance(contracts_1.IInterpreterService, interpreterService.object);
        this.pythonInstaller = new pythonInstallation_1.PythonInstaller(this.serviceContainer);
        this.platform.setup(x => x.isMac).returns(() => isMac);
        this.platform.setup(x => x.isWindows).returns(() => !isMac);
    }
}
// tslint:disable-next-line:max-func-body-length
suite('Installation', () => {
    suiteSetup(() => __awaiter(this, void 0, void 0, function* () {
        yield initialize_1.initialize();
    }));
    setup(initialize_1.initializeTest);
    suiteTeardown(initialize_1.closeActiveWindows);
    teardown(initialize_1.closeActiveWindows);
    test('Disable checks', () => __awaiter(this, void 0, void 0, function* () {
        const c = new TestContext(false);
        let showErrorMessageCalled = false;
        c.settings.setup(s => s.disableInstallationChecks).returns(() => true);
        c.appShell.setup(x => x.showErrorMessage(TypeMoq.It.isAnyString())).callback(() => showErrorMessageCalled = true);
        const passed = yield c.pythonInstaller.checkPythonInstallation(c.settings.object);
        assert.equal(passed, true, 'Disabling checks has no effect');
        assert.equal(showErrorMessageCalled, false, 'Disabling checks has no effect');
    }));
    test('Python missing', () => __awaiter(this, void 0, void 0, function* () {
        const c = new TestContext(false);
        let showErrorMessageCalled = false;
        let openUrlCalled = false;
        let url;
        const download = 'Download';
        c.appShell
            .setup(x => x.showErrorMessage(TypeMoq.It.isAnyString(), download))
            .callback(() => showErrorMessageCalled = true)
            .returns(() => Promise.resolve(download));
        c.appShell.setup(x => x.openUrl(TypeMoq.It.isAnyString())).callback((s) => {
            openUrlCalled = true;
            url = s;
        });
        c.locator.setup(x => x.getInterpreters()).returns(() => Promise.resolve([]));
        const passed = yield c.pythonInstaller.checkPythonInstallation(c.settings.object);
        assert.equal(passed, false, 'Python reported as present');
        assert.equal(showErrorMessageCalled, true, 'Error message not shown');
        assert.equal(openUrlCalled, true, 'Python download page not opened');
        assert.equal(url, 'https://www.python.org/downloads', 'Python download page is incorrect');
        showErrorMessageCalled = false;
        openUrlCalled = false;
        c.appShell
            .setup(x => x.showErrorMessage(TypeMoq.It.isAnyString(), download))
            .callback(() => showErrorMessageCalled = true)
            .returns(() => Promise.resolve(''));
        yield c.pythonInstaller.checkPythonInstallation(c.settings.object);
        assert.equal(showErrorMessageCalled, true, 'Error message not shown');
        assert.equal(openUrlCalled, false, 'Python download page was opened');
    }));
    test('Mac: Default Python warning', () => __awaiter(this, void 0, void 0, function* () {
        const c = new TestContext(true);
        let called = false;
        c.appShell.setup(x => x.showWarningMessage(TypeMoq.It.isAnyString())).callback(() => called = true);
        c.settings.setup(x => x.pythonPath).returns(() => 'python');
        const interpreter = Object.assign({}, info, { path: 'python', type: contracts_1.InterpreterType.Unknown });
        c.locator.setup(x => x.getInterpreters()).returns(() => Promise.resolve([interpreter]));
        const passed = yield c.pythonInstaller.checkPythonInstallation(c.settings.object);
        assert.equal(passed, true, 'Default MacOS Python not accepted');
        assert.equal(called, true, 'Warning not shown');
    }));
});
//# sourceMappingURL=pythonInstallation.test.js.map