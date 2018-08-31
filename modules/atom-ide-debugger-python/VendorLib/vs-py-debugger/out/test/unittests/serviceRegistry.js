"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("../../client/common/process/types");
const types_2 = require("../../client/ioc/types");
const constants_1 = require("../../client/unittests/common/constants");
const storageService_1 = require("../../client/unittests/common/services/storageService");
const testManagerService_1 = require("../../client/unittests/common/services/testManagerService");
const testResultsService_1 = require("../../client/unittests/common/services/testResultsService");
const testUtils_1 = require("../../client/unittests/common/testUtils");
const flatteningVisitor_1 = require("../../client/unittests/common/testVisitors/flatteningVisitor");
const folderGenerationVisitor_1 = require("../../client/unittests/common/testVisitors/folderGenerationVisitor");
const resultResetVisitor_1 = require("../../client/unittests/common/testVisitors/resultResetVisitor");
const types_3 = require("../../client/unittests/common/types");
// tslint:disable-next-line:no-duplicate-imports
const types_4 = require("../../client/unittests/common/types");
const main_1 = require("../../client/unittests/nosetest/main");
const discoveryService_1 = require("../../client/unittests/nosetest/services/discoveryService");
const parserService_1 = require("../../client/unittests/nosetest/services/parserService");
const main_2 = require("../../client/unittests/pytest/main");
const discoveryService_2 = require("../../client/unittests/pytest/services/discoveryService");
const parserService_2 = require("../../client/unittests/pytest/services/parserService");
const main_3 = require("../../client/unittests/unittest/main");
const discoveryService_3 = require("../../client/unittests/unittest/services/discoveryService");
const parserService_3 = require("../../client/unittests/unittest/services/parserService");
const serviceRegistry_1 = require("../serviceRegistry");
const mocks_1 = require("./mocks");
class UnitTestIocContainer extends serviceRegistry_1.IocContainer {
    constructor() {
        super();
    }
    getPythonMajorVersion(resource) {
        return this.serviceContainer.get(types_1.IPythonExecutionFactory).create({ resource })
            .then(pythonProcess => pythonProcess.exec(['-c', 'import sys;print(sys.version_info[0])'], {}))
            .then(output => parseInt(output.stdout.trim(), 10));
    }
    getPythonMajorMinorVersionString(resource) {
        return this.serviceContainer.get(types_1.IPythonExecutionFactory).create({ resource })
            .then(pythonProcess => pythonProcess.exec(['-c', 'import sys;print("{0}.{1}".format(*sys.version_info[:2]))'], {}))
            .then(output => output.stdout.trim());
    }
    getPythonMajorMinorVersion(resource) {
        return this.serviceContainer.get(types_1.IPythonExecutionFactory).create({ resource })
            .then(pythonProcess => pythonProcess.exec(['-c', 'import sys;print("{0}|{1}".format(*sys.version_info[:2]))'], {}))
            .then(output => {
            const versionString = output.stdout.trim();
            const versionInfo = versionString.split('|');
            return {
                major: parseInt(versionInfo[0].trim(), 10),
                minor: parseInt(versionInfo[1].trim(), 10)
            };
        });
    }
    registerTestVisitors() {
        this.serviceManager.add(types_3.ITestVisitor, flatteningVisitor_1.TestFlatteningVisitor, 'TestFlatteningVisitor');
        this.serviceManager.add(types_3.ITestVisitor, folderGenerationVisitor_1.TestFolderGenerationVisitor, 'TestFolderGenerationVisitor');
        this.serviceManager.add(types_3.ITestVisitor, resultResetVisitor_1.TestResultResetVisitor, 'TestResultResetVisitor');
    }
    registerTestStorage() {
        this.serviceManager.addSingleton(types_4.ITestCollectionStorageService, storageService_1.TestCollectionStorageService);
    }
    registerTestsHelper() {
        this.serviceManager.addSingleton(types_3.ITestsHelper, testUtils_1.TestsHelper);
    }
    registerTestResultsHelper() {
        this.serviceManager.add(types_3.ITestResultsService, testResultsService_1.TestResultsService);
    }
    registerTestParsers() {
        this.serviceManager.add(types_3.ITestsParser, parserService_3.TestsParser, constants_1.UNITTEST_PROVIDER);
        this.serviceManager.add(types_3.ITestsParser, parserService_2.TestsParser, constants_1.PYTEST_PROVIDER);
        this.serviceManager.add(types_3.ITestsParser, parserService_1.TestsParser, constants_1.NOSETEST_PROVIDER);
    }
    registerTestDiscoveryServices() {
        this.serviceManager.add(types_4.ITestDiscoveryService, discoveryService_3.TestDiscoveryService, constants_1.UNITTEST_PROVIDER);
        this.serviceManager.add(types_4.ITestDiscoveryService, discoveryService_2.TestDiscoveryService, constants_1.PYTEST_PROVIDER);
        this.serviceManager.add(types_4.ITestDiscoveryService, discoveryService_1.TestDiscoveryService, constants_1.NOSETEST_PROVIDER);
    }
    registerTestManagers() {
        this.serviceManager.addFactory(types_4.ITestManagerFactory, (context) => {
            return (testProvider, workspaceFolder, rootDirectory) => {
                const serviceContainer = context.container.get(types_2.IServiceContainer);
                switch (testProvider) {
                    case constants_1.NOSETEST_PROVIDER: {
                        return new main_1.TestManager(workspaceFolder, rootDirectory, serviceContainer);
                    }
                    case constants_1.PYTEST_PROVIDER: {
                        return new main_2.TestManager(workspaceFolder, rootDirectory, serviceContainer);
                    }
                    case constants_1.UNITTEST_PROVIDER: {
                        return new main_3.TestManager(workspaceFolder, rootDirectory, serviceContainer);
                    }
                    default: {
                        throw new Error(`Unrecognized test provider '${testProvider}'`);
                    }
                }
            };
        });
    }
    registerTestManagerService() {
        this.serviceManager.addFactory(types_4.ITestManagerServiceFactory, (context) => {
            return (workspaceFolder) => {
                const serviceContainer = context.container.get(types_2.IServiceContainer);
                const testsHelper = context.container.get(types_3.ITestsHelper);
                return new testManagerService_1.TestManagerService(workspaceFolder, testsHelper, serviceContainer);
            };
        });
    }
    registerMockUnitTestSocketServer() {
        this.serviceManager.addSingleton(types_3.IUnitTestSocketServer, mocks_1.MockUnitTestSocketServer);
    }
}
exports.UnitTestIocContainer = UnitTestIocContainer;
//# sourceMappingURL=serviceRegistry.js.map