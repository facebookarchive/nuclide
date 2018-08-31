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
const inversify_1 = require("inversify");
const os = require("os");
const path = require("path");
const TypeMoq = require("typemoq");
const vscode_1 = require("vscode");
const types_1 = require("../../client/common/application/types");
const types_2 = require("../../client/common/types");
const globalVirtualEnvService_1 = require("../../client/interpreter/locators/services/globalVirtualEnvService");
const workspaceVirtualEnvService_1 = require("../../client/interpreter/locators/services/workspaceVirtualEnvService");
const container_1 = require("../../client/ioc/container");
const serviceManager_1 = require("../../client/ioc/serviceManager");
suite('Virtual environments', () => {
    let serviceManager;
    let serviceContainer;
    let settings;
    let config;
    let workspace;
    let process;
    setup(() => __awaiter(this, void 0, void 0, function* () {
        const cont = new inversify_1.Container();
        serviceManager = new serviceManager_1.ServiceManager(cont);
        serviceContainer = new container_1.ServiceContainer(cont);
        settings = TypeMoq.Mock.ofType();
        config = TypeMoq.Mock.ofType();
        workspace = TypeMoq.Mock.ofType();
        process = TypeMoq.Mock.ofType();
        config.setup(x => x.getSettings(TypeMoq.It.isAny())).returns(() => settings.object);
        serviceManager.addSingletonInstance(types_2.IConfigurationService, config.object);
        serviceManager.addSingletonInstance(types_1.IWorkspaceService, workspace.object);
        serviceManager.addSingletonInstance(types_2.ICurrentProcess, process.object);
    }));
    test('Global search paths', () => __awaiter(this, void 0, void 0, function* () {
        const pathProvider = new globalVirtualEnvService_1.GlobalVirtualEnvironmentsSearchPathProvider(serviceContainer);
        const homedir = os.homedir();
        const folders = ['Envs', '.virtualenvs', '.pyenv'];
        settings.setup(x => x.venvFolders).returns(() => folders);
        let paths = pathProvider.getSearchPaths();
        let expected = folders.map(item => path.join(homedir, item));
        expected.push(path.join(homedir, '.pyenv', 'versions'));
        chai_1.expect(paths).to.deep.equal(expected, 'Global search folder list is incorrect.');
        const envMap = {};
        process.setup(x => x.env).returns(() => envMap);
        const customFolder = path.join(homedir, 'some_folder');
        // tslint:disable-next-line:no-string-literal
        envMap['PYENV_ROOT'] = customFolder;
        paths = pathProvider.getSearchPaths();
        expected = folders.map(item => path.join(homedir, item));
        expected.push(customFolder);
        expected.push(path.join(customFolder, 'versions'));
        chai_1.expect(paths).to.deep.equal(expected, 'PYENV_ROOT not resolved correctly.');
    }));
    test('Workspace search paths', () => __awaiter(this, void 0, void 0, function* () {
        settings.setup(x => x.venvPath).returns(() => `~${path.sep}foo`);
        const wsRoot = TypeMoq.Mock.ofType();
        wsRoot.setup(x => x.uri).returns(() => vscode_1.Uri.file('root'));
        const folder1 = TypeMoq.Mock.ofType();
        folder1.setup(x => x.uri).returns(() => vscode_1.Uri.file('dir1'));
        workspace.setup(x => x.getWorkspaceFolder(TypeMoq.It.isAny())).returns(() => wsRoot.object);
        workspace.setup(x => x.workspaceFolders).returns(() => [wsRoot.object, folder1.object]);
        const pathProvider = new workspaceVirtualEnvService_1.WorkspaceVirtualEnvironmentsSearchPathProvider(serviceContainer);
        const paths = pathProvider.getSearchPaths(vscode_1.Uri.file(''));
        const homedir = os.homedir();
        const expected = [path.join(homedir, 'foo'), `${path.sep}root`, `${path.sep}root${path.sep}.direnv`];
        chai_1.expect(paths).to.deep.equal(expected, 'Workspace venv folder search list does not match.');
    }));
});
//# sourceMappingURL=venv.test.js.map