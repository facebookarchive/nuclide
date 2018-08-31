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
// tslint:disable:max-func-body-length
const chai_1 = require("chai");
const TypeMoq = require("typemoq");
const vscode_1 = require("vscode");
const enumUtils_1 = require("../../../client/common/enumUtils");
const types_1 = require("../../../client/common/platform/types");
const types_2 = require("../../../client/common/types");
const contracts_1 = require("../../../client/interpreter/contracts");
const locators_1 = require("../../../client/interpreter/locators");
var OS;
(function (OS) {
    OS[OS["Windows"] = 0] = "Windows";
    OS[OS["Linux"] = 1] = "Linux";
    OS[OS["Mac"] = 2] = "Mac";
})(OS || (OS = {}));
suite('Interpreters - Locators Index', () => {
    let serviceContainer;
    let platform;
    let helper;
    let locator;
    setup(() => {
        serviceContainer = TypeMoq.Mock.ofType();
        platform = TypeMoq.Mock.ofType();
        helper = TypeMoq.Mock.ofType();
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IDisposableRegistry))).returns(() => []);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IPlatformService))).returns(() => platform.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(contracts_1.IInterpreterLocatorHelper))).returns(() => helper.object);
        locator = new locators_1.PythonInterpreterLocatorService(serviceContainer.object);
    });
    [undefined, vscode_1.Uri.file('Something')].forEach(resource => {
        enumUtils_1.EnumEx.getNamesAndValues(OS).forEach(os => {
            const testSuffix = `(on ${os.name}, with${resource ? '' : 'out'} a resource)`;
            test(`All Interpreter Sources are used ${testSuffix}`, () => __awaiter(this, void 0, void 0, function* () {
                const locatorsTypes = [];
                if (os.value === OS.Windows) {
                    locatorsTypes.push(contracts_1.WINDOWS_REGISTRY_SERVICE);
                }
                platform.setup(p => p.isWindows).returns(() => os.value === OS.Windows);
                platform.setup(p => p.isLinux).returns(() => os.value === OS.Linux);
                platform.setup(p => p.isMac).returns(() => os.value === OS.Mac);
                locatorsTypes.push(contracts_1.CONDA_ENV_SERVICE);
                locatorsTypes.push(contracts_1.CONDA_ENV_FILE_SERVICE);
                locatorsTypes.push(contracts_1.PIPENV_SERVICE);
                locatorsTypes.push(contracts_1.GLOBAL_VIRTUAL_ENV_SERVICE);
                locatorsTypes.push(contracts_1.WORKSPACE_VIRTUAL_ENV_SERVICE);
                if (os.value !== OS.Windows) {
                    locatorsTypes.push(contracts_1.KNOWN_PATH_SERVICE);
                }
                locatorsTypes.push(contracts_1.CURRENT_PATH_SERVICE);
                const locatorsWithInterpreters = locatorsTypes.map(typeName => {
                    const interpreter = {
                        architecture: types_1.Architecture.Unknown,
                        displayName: typeName,
                        path: typeName,
                        sysPrefix: typeName,
                        sysVersion: typeName,
                        type: contracts_1.InterpreterType.Unknown,
                        version: typeName,
                        version_info: [0, 0, 0, 'alpha']
                    };
                    const typeLocator = TypeMoq.Mock.ofType();
                    typeLocator
                        .setup(l => l.getInterpreters(TypeMoq.It.isValue(resource)))
                        .returns(() => Promise.resolve([interpreter]))
                        .verifiable(TypeMoq.Times.once());
                    serviceContainer
                        .setup(c => c.get(TypeMoq.It.isValue(contracts_1.IInterpreterLocatorService), TypeMoq.It.isValue(typeName)))
                        .returns(() => typeLocator.object);
                    return {
                        type: typeName,
                        locator: typeLocator,
                        interpreters: [interpreter]
                    };
                });
                helper
                    .setup(h => h.mergeInterpreters(TypeMoq.It.isAny()))
                    .returns(() => locatorsWithInterpreters.map(item => item.interpreters[0]))
                    .verifiable(TypeMoq.Times.once());
                yield locator.getInterpreters(resource);
                locatorsWithInterpreters.forEach(item => item.locator.verifyAll());
                helper.verifyAll();
            }));
            test(`Interpreter Sources are sorted correctly and merged ${testSuffix}`, () => __awaiter(this, void 0, void 0, function* () {
                const locatorsTypes = [];
                if (os.value === OS.Windows) {
                    locatorsTypes.push(contracts_1.WINDOWS_REGISTRY_SERVICE);
                }
                platform.setup(p => p.isWindows).returns(() => os.value === OS.Windows);
                platform.setup(p => p.isLinux).returns(() => os.value === OS.Linux);
                platform.setup(p => p.isMac).returns(() => os.value === OS.Mac);
                locatorsTypes.push(contracts_1.CONDA_ENV_SERVICE);
                locatorsTypes.push(contracts_1.CONDA_ENV_FILE_SERVICE);
                locatorsTypes.push(contracts_1.PIPENV_SERVICE);
                locatorsTypes.push(contracts_1.GLOBAL_VIRTUAL_ENV_SERVICE);
                locatorsTypes.push(contracts_1.WORKSPACE_VIRTUAL_ENV_SERVICE);
                if (os.value !== OS.Windows) {
                    locatorsTypes.push(contracts_1.KNOWN_PATH_SERVICE);
                }
                locatorsTypes.push(contracts_1.CURRENT_PATH_SERVICE);
                const locatorsWithInterpreters = locatorsTypes.map(typeName => {
                    const interpreter = {
                        architecture: types_1.Architecture.Unknown,
                        displayName: typeName,
                        path: typeName,
                        sysPrefix: typeName,
                        sysVersion: typeName,
                        type: contracts_1.InterpreterType.Unknown,
                        version: typeName,
                        version_info: [0, 0, 0, 'alpha']
                    };
                    const typeLocator = TypeMoq.Mock.ofType();
                    typeLocator
                        .setup(l => l.getInterpreters(TypeMoq.It.isValue(resource)))
                        .returns(() => Promise.resolve([interpreter]))
                        .verifiable(TypeMoq.Times.once());
                    serviceContainer
                        .setup(c => c.get(TypeMoq.It.isValue(contracts_1.IInterpreterLocatorService), TypeMoq.It.isValue(typeName)))
                        .returns(() => typeLocator.object);
                    return {
                        type: typeName,
                        locator: typeLocator,
                        interpreters: [interpreter]
                    };
                });
                const expectedInterpreters = locatorsWithInterpreters.map(item => item.interpreters[0]);
                helper
                    .setup(h => h.mergeInterpreters(TypeMoq.It.isAny()))
                    .returns(() => expectedInterpreters)
                    .verifiable(TypeMoq.Times.once());
                const interpreters = yield locator.getInterpreters(resource);
                locatorsWithInterpreters.forEach(item => item.locator.verifyAll());
                helper.verifyAll();
                chai_1.expect(interpreters).to.be.lengthOf(locatorsTypes.length);
                chai_1.expect(interpreters).to.be.deep.equal(expectedInterpreters);
            }));
        });
    });
});

//# sourceMappingURL=index.unit.test.js.map
