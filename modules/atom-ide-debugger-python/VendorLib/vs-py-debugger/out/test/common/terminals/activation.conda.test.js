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
// tslint:disable:max-func-body-length no-any
const chai_1 = require("chai");
const path = require("path");
const TypeMoq = require("typemoq");
const enumUtils_1 = require("../../../client/common/enumUtils");
require("../../../client/common/extensions");
const types_1 = require("../../../client/common/platform/types");
const types_2 = require("../../../client/common/process/types");
const condaActivationProvider_1 = require("../../../client/common/terminal/environmentActivationProviders/condaActivationProvider");
const helper_1 = require("../../../client/common/terminal/helper");
const types_3 = require("../../../client/common/terminal/types");
const types_4 = require("../../../client/common/types");
const contracts_1 = require("../../../client/interpreter/contracts");
suite('Terminal Environment Activation conda', () => {
    let terminalHelper;
    let disposables = [];
    let terminalSettings;
    let platformService;
    let fileSystem;
    let pythonSettings;
    let serviceContainer;
    let processService;
    let procServiceFactory;
    let condaService;
    setup(() => {
        serviceContainer = TypeMoq.Mock.ofType();
        disposables = [];
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_4.IDisposableRegistry), TypeMoq.It.isAny())).returns(() => disposables);
        fileSystem = TypeMoq.Mock.ofType();
        platformService = TypeMoq.Mock.ofType();
        processService = TypeMoq.Mock.ofType();
        condaService = TypeMoq.Mock.ofType();
        processService.setup((x) => x.then).returns(() => undefined);
        procServiceFactory = TypeMoq.Mock.ofType();
        procServiceFactory.setup(p => p.create(TypeMoq.It.isAny())).returns(() => Promise.resolve(processService.object));
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IPlatformService), TypeMoq.It.isAny())).returns(() => platformService.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IFileSystem), TypeMoq.It.isAny())).returns(() => fileSystem.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IProcessServiceFactory), TypeMoq.It.isAny())).returns(() => procServiceFactory.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(contracts_1.ICondaService), TypeMoq.It.isAny())).returns(() => condaService.object);
        const configService = TypeMoq.Mock.ofType();
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_4.IConfigurationService))).returns(() => configService.object);
        pythonSettings = TypeMoq.Mock.ofType();
        configService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
        terminalSettings = TypeMoq.Mock.ofType();
        pythonSettings.setup(s => s.terminal).returns(() => terminalSettings.object);
        terminalHelper = new helper_1.TerminalHelper(serviceContainer.object);
    });
    teardown(() => {
        disposables.forEach(disposable => {
            if (disposable) {
                disposable.dispose();
            }
        });
    });
    test('Ensure no activation commands are returned if the feature is disabled', () => __awaiter(this, void 0, void 0, function* () {
        terminalSettings.setup(t => t.activateEnvironment).returns(() => false);
        const activationCommands = yield terminalHelper.getEnvironmentActivationCommands(types_3.TerminalShellType.bash, undefined);
        chai_1.expect(activationCommands).to.equal(undefined, 'Activation commands should be undefined');
    }));
    function expectNoCondaActivationCommandForPowershell(isWindows, isOsx, isLinux, pythonPath, shellType, hasSpaceInEnvironmentName = false) {
        return __awaiter(this, void 0, void 0, function* () {
            terminalSettings.setup(t => t.activateEnvironment).returns(() => true);
            platformService.setup(p => p.isLinux).returns(() => isLinux);
            platformService.setup(p => p.isWindows).returns(() => isWindows);
            platformService.setup(p => p.isMac).returns(() => isOsx);
            condaService.setup(c => c.isCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve(true));
            pythonSettings.setup(s => s.pythonPath).returns(() => pythonPath);
            const envName = hasSpaceInEnvironmentName ? 'EnvA' : 'Env A';
            condaService.setup(c => c.getCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve({ name: envName, path: path.dirname(pythonPath) }));
            const activationCommands = yield new condaActivationProvider_1.CondaActivationCommandProvider(serviceContainer.object).getActivationCommands(undefined, shellType);
            let expectedActivationCommamnd;
            switch (shellType) {
                case types_3.TerminalShellType.powershell:
                case types_3.TerminalShellType.powershellCore: {
                    const powershellExe = shellType === types_3.TerminalShellType.powershell ? 'powershell' : 'pwsh';
                    const envNameForCmd = envName.toCommandArgument().replace(/"/g, '""');
                    expectedActivationCommamnd = isWindows ? [`& cmd /k \"activate ${envNameForCmd} & ${powershellExe}\"`] : undefined;
                    break;
                }
                case types_3.TerminalShellType.fish: {
                    expectedActivationCommamnd = [`conda activate ${envName.toCommandArgument()}`];
                    break;
                }
                default: {
                    expectedActivationCommamnd = isWindows ? [`activate ${envName.toCommandArgument()}`] : [`source activate ${envName.toCommandArgument()}`];
                    break;
                }
            }
            chai_1.expect(activationCommands).to.deep.equal(expectedActivationCommamnd, 'Incorrect Activation command');
        });
    }
    enumUtils_1.EnumEx.getNamesAndValues(types_3.TerminalShellType).forEach(shellType => {
        test(`Conda activation command for shell ${shellType.name} on (windows)`, () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = path.join('c', 'users', 'xyz', '.conda', 'envs', 'enva', 'python.exe');
            yield expectNoCondaActivationCommandForPowershell(true, false, false, pythonPath, shellType.value);
        }));
        test(`Conda activation command for shell ${shellType.name} on (linux)`, () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
            yield expectNoCondaActivationCommandForPowershell(false, false, true, pythonPath, shellType.value);
        }));
        test(`Conda activation command for shell ${shellType.name} on (mac)`, () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
            yield expectNoCondaActivationCommandForPowershell(false, true, false, pythonPath, shellType.value);
        }));
    });
    enumUtils_1.EnumEx.getNamesAndValues(types_3.TerminalShellType).forEach(shellType => {
        test(`Conda activation command for shell ${shellType.name} on (windows), containing spaces in environment name`, () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = path.join('c', 'users', 'xyz', '.conda', 'envs', 'enva', 'python.exe');
            yield expectNoCondaActivationCommandForPowershell(true, false, false, pythonPath, shellType.value, true);
        }));
        test(`Conda activation command for shell ${shellType.name} on (linux), containing spaces in environment name`, () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
            yield expectNoCondaActivationCommandForPowershell(false, false, true, pythonPath, shellType.value, true);
        }));
        test(`Conda activation command for shell ${shellType.name} on (mac), containing spaces in environment name`, () => __awaiter(this, void 0, void 0, function* () {
            const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
            yield expectNoCondaActivationCommandForPowershell(false, true, false, pythonPath, shellType.value, true);
        }));
    });
    function expectCondaActivationCommand(isWindows, isOsx, isLinux, pythonPath) {
        return __awaiter(this, void 0, void 0, function* () {
            terminalSettings.setup(t => t.activateEnvironment).returns(() => true);
            platformService.setup(p => p.isLinux).returns(() => isLinux);
            platformService.setup(p => p.isWindows).returns(() => isWindows);
            platformService.setup(p => p.isMac).returns(() => isOsx);
            condaService.setup(c => c.isCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve(true));
            pythonSettings.setup(s => s.pythonPath).returns(() => pythonPath);
            condaService.setup(c => c.getCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve({ name: 'EnvA', path: path.dirname(pythonPath) }));
            const expectedActivationCommand = isWindows ? ['activate EnvA'] : ['source activate EnvA'];
            const activationCommands = yield terminalHelper.getEnvironmentActivationCommands(types_3.TerminalShellType.bash, undefined);
            chai_1.expect(activationCommands).to.deep.equal(expectedActivationCommand, 'Incorrect Activation command');
        });
    }
    test('If environment is a conda environment, ensure conda activation command is sent (windows)', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('c', 'users', 'xyz', '.conda', 'envs', 'enva', 'python.exe');
        fileSystem.setup(f => f.directoryExists(TypeMoq.It.isValue(path.join(path.dirname(pythonPath), 'conda-meta')))).returns(() => Promise.resolve(true));
        yield expectCondaActivationCommand(true, false, false, pythonPath);
    }));
    test('If environment is a conda environment, ensure conda activation command is sent (linux)', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
        fileSystem.setup(f => f.directoryExists(TypeMoq.It.isValue(path.join(path.dirname(pythonPath), '..', 'conda-meta')))).returns(() => Promise.resolve(true));
        yield expectCondaActivationCommand(false, false, true, pythonPath);
    }));
    test('If environment is a conda environment, ensure conda activation command is sent (osx)', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
        fileSystem.setup(f => f.directoryExists(TypeMoq.It.isValue(path.join(path.dirname(pythonPath), '..', 'conda-meta')))).returns(() => Promise.resolve(true));
        yield expectCondaActivationCommand(false, true, false, pythonPath);
    }));
    test('Get activation script command if environment is not a conda environment', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'bin', 'python');
        terminalSettings.setup(t => t.activateEnvironment).returns(() => true);
        condaService.setup(c => c.isCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve(false));
        pythonSettings.setup(s => s.pythonPath).returns(() => pythonPath);
        const mockProvider = TypeMoq.Mock.ofType();
        serviceContainer.setup(c => c.getAll(TypeMoq.It.isValue(types_3.ITerminalActivationCommandProvider), TypeMoq.It.isAny())).returns(() => [mockProvider.object]);
        mockProvider.setup(p => p.isShellSupported(TypeMoq.It.isAny())).returns(() => true);
        mockProvider.setup(p => p.getActivationCommands(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(['mock command']));
        const expectedActivationCommand = ['mock command'];
        const activationCommands = yield terminalHelper.getEnvironmentActivationCommands(types_3.TerminalShellType.bash, undefined);
        chai_1.expect(activationCommands).to.deep.equal(expectedActivationCommand, 'Incorrect Activation command');
    }));
    function expectActivationCommandIfCondaDetectionFails(isWindows, isOsx, isLinux, pythonPath, condaEnvsPath) {
        return __awaiter(this, void 0, void 0, function* () {
            terminalSettings.setup(t => t.activateEnvironment).returns(() => true);
            platformService.setup(p => p.isLinux).returns(() => isLinux);
            platformService.setup(p => p.isWindows).returns(() => isWindows);
            platformService.setup(p => p.isMac).returns(() => isOsx);
            condaService.setup(c => c.isCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve(true));
            condaService.setup(c => c.isCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve(false));
            pythonSettings.setup(s => s.pythonPath).returns(() => pythonPath);
            const mockProvider = TypeMoq.Mock.ofType();
            serviceContainer.setup(c => c.getAll(TypeMoq.It.isValue(types_3.ITerminalActivationCommandProvider), TypeMoq.It.isAny())).returns(() => [mockProvider.object]);
            mockProvider.setup(p => p.isShellSupported(TypeMoq.It.isAny())).returns(() => true);
            mockProvider.setup(p => p.getActivationCommands(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(['mock command']));
            const expectedActivationCommand = ['mock command'];
            const activationCommands = yield terminalHelper.getEnvironmentActivationCommands(types_3.TerminalShellType.bash, undefined);
            chai_1.expect(activationCommands).to.deep.equal(expectedActivationCommand, 'Incorrect Activation command');
        });
    }
    test('If environment is a conda environment and environment detection fails, ensure activatino of script is sent (windows)', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('c', 'users', 'xyz', '.conda', 'envs', 'enva', 'python.exe');
        const condaEnvDir = path.join('c', 'users', 'xyz', '.conda', 'envs');
        fileSystem.setup(f => f.directoryExists(TypeMoq.It.isValue(path.join(path.dirname(pythonPath), 'conda-meta')))).returns(() => Promise.resolve(true));
        yield expectActivationCommandIfCondaDetectionFails(true, false, false, pythonPath, condaEnvDir);
    }));
    test('If environment is a conda environment and environment detection fails, ensure activatino of script is sent (osx)', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'python');
        const condaEnvDir = path.join('users', 'xyz', '.conda', 'envs');
        fileSystem.setup(f => f.directoryExists(TypeMoq.It.isValue(path.join(path.dirname(pythonPath), '..', 'conda-meta')))).returns(() => Promise.resolve(true));
        yield expectActivationCommandIfCondaDetectionFails(false, true, false, pythonPath, condaEnvDir);
    }));
    test('If environment is a conda environment and environment detection fails, ensure activatino of script is sent (linux)', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('users', 'xyz', '.conda', 'envs', 'enva', 'python');
        const condaEnvDir = path.join('users', 'xyz', '.conda', 'envs');
        fileSystem.setup(f => f.directoryExists(TypeMoq.It.isValue(path.join(path.dirname(pythonPath), '..', 'conda-meta')))).returns(() => Promise.resolve(true));
        yield expectActivationCommandIfCondaDetectionFails(false, false, true, pythonPath, condaEnvDir);
    }));
    test('Return undefined if unable to get activation command', () => __awaiter(this, void 0, void 0, function* () {
        const pythonPath = path.join('c', 'users', 'xyz', '.conda', 'envs', 'enva', 'python.exe');
        terminalSettings.setup(t => t.activateEnvironment).returns(() => true);
        condaService.setup(c => c.isCondaEnvironment(TypeMoq.It.isAny())).returns(() => Promise.resolve(false));
        pythonSettings.setup(s => s.pythonPath).returns(() => pythonPath);
        const mockProvider = TypeMoq.Mock.ofType();
        serviceContainer.setup(c => c.getAll(TypeMoq.It.isValue(types_3.ITerminalActivationCommandProvider), TypeMoq.It.isAny())).returns(() => [mockProvider.object]);
        mockProvider.setup(p => p.isShellSupported(TypeMoq.It.isAny())).returns(() => true);
        mockProvider.setup(p => p.getActivationCommands(TypeMoq.It.isAny(), TypeMoq.It.isAny())).returns(() => Promise.resolve(undefined));
        const activationCommands = yield terminalHelper.getEnvironmentActivationCommands(types_3.TerminalShellType.bash, undefined);
        chai_1.expect(activationCommands).to.equal(undefined, 'Incorrect Activation command');
    }));
});
//# sourceMappingURL=activation.conda.test.js.map