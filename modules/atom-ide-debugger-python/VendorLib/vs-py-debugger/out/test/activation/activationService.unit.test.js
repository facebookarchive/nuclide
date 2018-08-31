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
const TypeMoq = require("typemoq");
const activationService_1 = require("../../client/activation/activationService");
const types_1 = require("../../client/activation/types");
const types_2 = require("../../client/common/application/types");
const constants_1 = require("../../client/common/constants");
const types_3 = require("../../client/common/types");
suite('Activation - ActivationService', () => {
    [true, false].forEach(jediIsEnabled => {
        suite(`Jedi is ${jediIsEnabled ? 'enabled' : 'disabled'}`, () => {
            let serviceContainer;
            let pythonSettings;
            let appShell;
            let cmdManager;
            let workspaceService;
            setup(function () {
                if (constants_1.isLanguageServerTest()) {
                    // tslint:disable-next-line:no-invalid-this
                    return this.skip();
                }
                serviceContainer = TypeMoq.Mock.ofType();
                appShell = TypeMoq.Mock.ofType();
                workspaceService = TypeMoq.Mock.ofType();
                cmdManager = TypeMoq.Mock.ofType();
                const configService = TypeMoq.Mock.ofType();
                pythonSettings = TypeMoq.Mock.ofType();
                workspaceService.setup(w => w.hasWorkspaceFolders).returns(() => false);
                workspaceService.setup(w => w.workspaceFolders).returns(() => []);
                configService.setup(c => c.getSettings(TypeMoq.It.isAny())).returns(() => pythonSettings.object);
                const output = TypeMoq.Mock.ofType();
                serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_3.IOutputChannel), TypeMoq.It.isAny())).returns(() => output.object);
                serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IWorkspaceService))).returns(() => workspaceService.object);
                serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IApplicationShell))).returns(() => appShell.object);
                serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_3.IDisposableRegistry))).returns(() => []);
                serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_3.IConfigurationService))).returns(() => configService.object);
                serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.ICommandManager))).returns(() => cmdManager.object);
            });
            function testActivation(activationService, activator) {
                return __awaiter(this, void 0, void 0, function* () {
                    activator
                        .setup(a => a.activate()).returns(() => Promise.resolve(true))
                        .verifiable(TypeMoq.Times.once());
                    const activatorName = jediIsEnabled ? types_1.ExtensionActivators.Jedi : types_1.ExtensionActivators.DotNet;
                    serviceContainer
                        .setup(c => c.get(TypeMoq.It.isValue(types_1.IExtensionActivator), TypeMoq.It.isValue(activatorName)))
                        .returns(() => activator.object)
                        .verifiable(TypeMoq.Times.once());
                    yield activationService.activate();
                    activator.verifyAll();
                    serviceContainer.verifyAll();
                });
            }
            test('Activatory must be activated', () => __awaiter(this, void 0, void 0, function* () {
                pythonSettings.setup(p => p.jediEnabled).returns(() => jediIsEnabled);
                const activator = TypeMoq.Mock.ofType();
                const activationService = new activationService_1.ExtensionActivationService(serviceContainer.object);
                yield testActivation(activationService, activator);
            }));
            test('Activatory must be deactivated', () => __awaiter(this, void 0, void 0, function* () {
                pythonSettings.setup(p => p.jediEnabled).returns(() => jediIsEnabled);
                const activator = TypeMoq.Mock.ofType();
                const activationService = new activationService_1.ExtensionActivationService(serviceContainer.object);
                yield testActivation(activationService, activator);
                activator
                    .setup(a => a.deactivate()).returns(() => Promise.resolve())
                    .verifiable(TypeMoq.Times.once());
                activationService.dispose();
                activator.verifyAll();
            }));
            test('Prompt user to reload VS Code and reload, when setting is toggled', () => __awaiter(this, void 0, void 0, function* () {
                let callbackHandler;
                let jediIsEnabledValueInSetting = jediIsEnabled;
                workspaceService
                    .setup(w => w.onDidChangeConfiguration(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                    .callback(cb => callbackHandler = cb)
                    .returns(() => TypeMoq.Mock.ofType().object)
                    .verifiable(TypeMoq.Times.once());
                pythonSettings.setup(p => p.jediEnabled).returns(() => jediIsEnabledValueInSetting);
                const activator = TypeMoq.Mock.ofType();
                const activationService = new activationService_1.ExtensionActivationService(serviceContainer.object);
                workspaceService.verifyAll();
                yield testActivation(activationService, activator);
                const event = TypeMoq.Mock.ofType();
                event.setup(e => e.affectsConfiguration(TypeMoq.It.isValue('python.jediEnabled'), TypeMoq.It.isAny()))
                    .returns(() => true)
                    .verifiable(TypeMoq.Times.atLeastOnce());
                appShell.setup(a => a.showInformationMessage(TypeMoq.It.isAny(), TypeMoq.It.isValue('Reload')))
                    .returns(() => Promise.resolve('Reload'))
                    .verifiable(TypeMoq.Times.once());
                cmdManager.setup(c => c.executeCommand(TypeMoq.It.isValue('workbench.action.reloadWindow')))
                    .verifiable(TypeMoq.Times.once());
                // Toggle the value in the setting and invoke the callback.
                jediIsEnabledValueInSetting = !jediIsEnabledValueInSetting;
                yield callbackHandler(event.object);
                event.verifyAll();
                appShell.verifyAll();
                cmdManager.verifyAll();
            }));
            test('Prompt user to reload VS Code and do not reload, when setting is toggled', () => __awaiter(this, void 0, void 0, function* () {
                let callbackHandler;
                let jediIsEnabledValueInSetting = jediIsEnabled;
                workspaceService
                    .setup(w => w.onDidChangeConfiguration(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                    .callback(cb => callbackHandler = cb)
                    .returns(() => TypeMoq.Mock.ofType().object)
                    .verifiable(TypeMoq.Times.once());
                pythonSettings.setup(p => p.jediEnabled).returns(() => jediIsEnabledValueInSetting);
                const activator = TypeMoq.Mock.ofType();
                const activationService = new activationService_1.ExtensionActivationService(serviceContainer.object);
                workspaceService.verifyAll();
                yield testActivation(activationService, activator);
                const event = TypeMoq.Mock.ofType();
                event.setup(e => e.affectsConfiguration(TypeMoq.It.isValue('python.jediEnabled'), TypeMoq.It.isAny()))
                    .returns(() => true)
                    .verifiable(TypeMoq.Times.atLeastOnce());
                appShell.setup(a => a.showInformationMessage(TypeMoq.It.isAny(), TypeMoq.It.isValue('Reload')))
                    .returns(() => Promise.resolve(undefined))
                    .verifiable(TypeMoq.Times.once());
                cmdManager.setup(c => c.executeCommand(TypeMoq.It.isValue('workbench.action.reloadWindow')))
                    .verifiable(TypeMoq.Times.never());
                // Toggle the value in the setting and invoke the callback.
                jediIsEnabledValueInSetting = !jediIsEnabledValueInSetting;
                yield callbackHandler(event.object);
                event.verifyAll();
                appShell.verifyAll();
                cmdManager.verifyAll();
            }));
            test('Do not prompt user to reload VS Code when setting is not toggled', () => __awaiter(this, void 0, void 0, function* () {
                let callbackHandler;
                workspaceService
                    .setup(w => w.onDidChangeConfiguration(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                    .callback(cb => callbackHandler = cb)
                    .returns(() => TypeMoq.Mock.ofType().object)
                    .verifiable(TypeMoq.Times.once());
                pythonSettings.setup(p => p.jediEnabled).returns(() => jediIsEnabled);
                const activator = TypeMoq.Mock.ofType();
                const activationService = new activationService_1.ExtensionActivationService(serviceContainer.object);
                workspaceService.verifyAll();
                yield testActivation(activationService, activator);
                const event = TypeMoq.Mock.ofType();
                event.setup(e => e.affectsConfiguration(TypeMoq.It.isValue('python.jediEnabled'), TypeMoq.It.isAny()))
                    .returns(() => true)
                    .verifiable(TypeMoq.Times.atLeastOnce());
                appShell.setup(a => a.showInformationMessage(TypeMoq.It.isAny(), TypeMoq.It.isValue('Reload')))
                    .returns(() => Promise.resolve(undefined))
                    .verifiable(TypeMoq.Times.never());
                cmdManager.setup(c => c.executeCommand(TypeMoq.It.isValue('workbench.action.reloadWindow')))
                    .verifiable(TypeMoq.Times.never());
                // Invoke the config changed callback.
                yield callbackHandler(event.object);
                event.verifyAll();
                appShell.verifyAll();
                cmdManager.verifyAll();
            }));
            test('Do not prompt user to reload VS Code when setting is not changed', () => __awaiter(this, void 0, void 0, function* () {
                let callbackHandler;
                workspaceService
                    .setup(w => w.onDidChangeConfiguration(TypeMoq.It.isAny(), TypeMoq.It.isAny(), TypeMoq.It.isAny()))
                    .callback(cb => callbackHandler = cb)
                    .returns(() => TypeMoq.Mock.ofType().object)
                    .verifiable(TypeMoq.Times.once());
                pythonSettings.setup(p => p.jediEnabled).returns(() => jediIsEnabled);
                const activator = TypeMoq.Mock.ofType();
                const activationService = new activationService_1.ExtensionActivationService(serviceContainer.object);
                workspaceService.verifyAll();
                yield testActivation(activationService, activator);
                const event = TypeMoq.Mock.ofType();
                event.setup(e => e.affectsConfiguration(TypeMoq.It.isValue('python.jediEnabled'), TypeMoq.It.isAny()))
                    .returns(() => false)
                    .verifiable(TypeMoq.Times.atLeastOnce());
                appShell.setup(a => a.showInformationMessage(TypeMoq.It.isAny(), TypeMoq.It.isValue('Reload')))
                    .returns(() => Promise.resolve(undefined))
                    .verifiable(TypeMoq.Times.never());
                cmdManager.setup(c => c.executeCommand(TypeMoq.It.isValue('workbench.action.reloadWindow')))
                    .verifiable(TypeMoq.Times.never());
                // Invoke the config changed callback.
                yield callbackHandler(event.object);
                event.verifyAll();
                appShell.verifyAll();
                cmdManager.verifyAll();
            }));
        });
    });
});
//# sourceMappingURL=activationService.unit.test.js.map