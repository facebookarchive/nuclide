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
// tslint:disable:no-any
const chai_1 = require("chai");
const inversify_1 = require("inversify");
const TypeMoq = require("typemoq");
const types_1 = require("../../client/common/application/types");
const fileSystem_1 = require("../../client/common/platform/fileSystem");
const platformService_1 = require("../../client/common/platform/platformService");
const types_2 = require("../../client/common/platform/types");
const decoder_1 = require("../../client/common/process/decoder");
const proc_1 = require("../../client/common/process/proc");
const types_3 = require("../../client/common/process/types");
const contracts_1 = require("../../client/interpreter/contracts");
const virtualEnvs_1 = require("../../client/interpreter/virtualEnvs");
const container_1 = require("../../client/ioc/container");
const serviceManager_1 = require("../../client/ioc/serviceManager");
const common_1 = require("../common");
suite('Virtual environment manager', () => {
    let serviceManager;
    let serviceContainer;
    setup(() => __awaiter(this, void 0, void 0, function* () {
        const cont = new inversify_1.Container();
        serviceManager = new serviceManager_1.ServiceManager(cont);
        serviceContainer = new container_1.ServiceContainer(cont);
    }));
    test('Plain Python environment suffix', () => __awaiter(this, void 0, void 0, function* () { return testSuffix(''); }));
    test('Venv environment suffix', () => __awaiter(this, void 0, void 0, function* () { return testSuffix('venv'); }));
    test('Virtualenv Python environment suffix', () => __awaiter(this, void 0, void 0, function* () { return testSuffix('virtualenv'); }));
    test('Run actual virtual env detection code', () => __awaiter(this, void 0, void 0, function* () {
        const processServiceFactory = TypeMoq.Mock.ofType();
        processServiceFactory.setup(f => f.create(TypeMoq.It.isAny())).returns(() => Promise.resolve(new proc_1.ProcessService(new decoder_1.BufferDecoder(), process.env)));
        serviceManager.addSingletonInstance(types_3.IProcessServiceFactory, processServiceFactory.object);
        serviceManager.addSingleton(types_3.IBufferDecoder, decoder_1.BufferDecoder);
        serviceManager.addSingleton(types_2.IFileSystem, fileSystem_1.FileSystem);
        serviceManager.addSingleton(types_2.IPlatformService, platformService_1.PlatformService);
        serviceManager.addSingletonInstance(contracts_1.IPipEnvService, TypeMoq.Mock.ofType().object);
        serviceManager.addSingletonInstance(types_1.IWorkspaceService, TypeMoq.Mock.ofType().object);
        const venvManager = new virtualEnvs_1.VirtualEnvironmentManager(serviceContainer);
        const name = yield venvManager.getEnvironmentName(common_1.PYTHON_PATH);
        const result = name === '' || name === 'venv' || name === 'virtualenv';
        chai_1.expect(result).to.be.equal(true, 'Running venv detection code failed.');
    }));
    function testSuffix(expectedName) {
        return __awaiter(this, void 0, void 0, function* () {
            const processService = TypeMoq.Mock.ofType();
            const processServiceFactory = TypeMoq.Mock.ofType();
            processService.setup((x) => x.then).returns(() => undefined);
            processServiceFactory.setup(f => f.create(TypeMoq.It.isAny())).returns(() => Promise.resolve(processService.object));
            serviceManager.addSingletonInstance(types_3.IProcessServiceFactory, processServiceFactory.object);
            serviceManager.addSingletonInstance(types_2.IFileSystem, TypeMoq.Mock.ofType().object);
            serviceManager.addSingletonInstance(contracts_1.IPipEnvService, TypeMoq.Mock.ofType().object);
            serviceManager.addSingletonInstance(types_1.IWorkspaceService, TypeMoq.Mock.ofType().object);
            const venvManager = new virtualEnvs_1.VirtualEnvironmentManager(serviceContainer);
            processService
                .setup(x => x.exec(common_1.PYTHON_PATH, TypeMoq.It.isAny()))
                .returns(() => Promise.resolve({
                stdout: expectedName,
                stderr: ''
            }));
            const name = yield venvManager.getEnvironmentName(common_1.PYTHON_PATH);
            chai_1.expect(name).to.be.equal(expectedName, 'Virtual envrironment name suffix is incorrect.');
        });
    }
});
//# sourceMappingURL=virtualEnvManager.test.js.map