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
// tslint:disable:no-any max-func-body-length
const chai_1 = require("chai");
const path = require("path");
const semver_1 = require("semver");
const typeMoq = require("typemoq");
const languageServerFolderService_1 = require("../../client/activation/languageServerFolderService");
const types_1 = require("../../client/activation/types");
const constants_1 = require("../../client/common/constants");
const types_2 = require("../../client/common/platform/types");
const types_3 = require("../../client/common/types");
const languageServerFolder = 'languageServer';
suite('Language Server Folder Service', () => {
    let serviceContainer;
    let platform;
    let lsFolderService;
    let settings;
    let packageService;
    let downloadRule;
    setup(() => {
        serviceContainer = typeMoq.Mock.ofType();
        platform = typeMoq.Mock.ofType();
        const configService = typeMoq.Mock.ofType();
        settings = typeMoq.Mock.ofType();
        packageService = typeMoq.Mock.ofType();
        downloadRule = typeMoq.Mock.ofType();
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_2.IPlatformService))).returns(() => platform.object);
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_3.IConfigurationService))).returns(() => configService.object);
        configService.setup(cfg => cfg.getSettings()).returns(() => settings.object);
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_1.ILanguageServerPackageService))).returns(() => packageService.object);
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_1.IDownloadChannelRule), typeMoq.It.isAny()))
            .returns(() => downloadRule.object);
        packageService.setup(p => p.getLanguageServerDownloadChannel())
            .returns(() => 'stable');
        downloadRule.setup(p => p.shouldLookForNewLanguageServer())
            .returns(() => Promise.resolve(true));
        lsFolderService = new languageServerFolderService_1.LanguageServerFolderService(serviceContainer.object);
    });
    test('Get latest language server version', () => __awaiter(this, void 0, void 0, function* () {
        const pkgInfo = { package: 'string', version: new semver_1.SemVer('1.1.1'), uri: 'uri' };
        packageService
            .setup(ls => ls.getLatestNugetPackageVersion())
            .returns(() => Promise.resolve(pkgInfo))
            .verifiable(typeMoq.Times.atLeastOnce());
        yield lsFolderService.getLatestLanguageServerVersion();
        packageService.verifyAll();
    }));
    test('Get folder version', () => __awaiter(this, void 0, void 0, function* () {
        const version = lsFolderService.getFolderVersion(`${languageServerFolder}.${'1.2.3'}`);
        chai_1.expect(version.raw).to.equal('1.2.3');
    }));
    test('Get existing language server directories', () => __awaiter(this, void 0, void 0, function* () {
        const root = path.join('users', 'vsc', 'extensions', 'ms-python.2018.xyz');
        const folders = ['one', `${languageServerFolder}.0.0.1`, `${languageServerFolder}.2.0.1`, `${languageServerFolder}.3.9.1`, 'two'];
        const expectedFolders = folders.filter(f => f.startsWith('languageServer'));
        const fs = typeMoq.Mock.ofType();
        serviceContainer.setup(c => c.get(typeMoq.It.isValue(types_2.IFileSystem))).returns(() => fs.object);
        fs
            .setup(f => f.getSubDirectories(typeMoq.It.isValue(constants_1.EXTENSION_ROOT_DIR)))
            .returns(() => Promise.resolve(folders.map(dirName => path.join(root, dirName))))
            .verifiable(typeMoq.Times.once());
        const existingDirs = yield lsFolderService.getExistingLanguageServerDirectories();
        chai_1.expect(existingDirs).to.be.lengthOf(expectedFolders.length);
        chai_1.expect(existingDirs.map(f => f.path)).to.be.deep.equal(expectedFolders.map(dirName => path.join(root, dirName)));
        chai_1.expect(existingDirs.map(f => f.version.raw)).to.be.deep.equal(['0.0.1', '2.0.1', '3.9.1']);
    }));
    test('Get latest language server directory', () => __awaiter(this, void 0, void 0, function* () {
        const root = path.join('users', 'vsc', 'extensions', 'ms-python.2018.xyz');
        const folders = [`${languageServerFolder}.0.0.1`, `${languageServerFolder}.2.0.1`, `${languageServerFolder}.3.9.1`, `${languageServerFolder}.1.9.1`];
        const expectedFolders = folders.map(f => {
            return {
                path: path.join(root, f),
                version: semver_1.parse(path.basename(f).substring(languageServerFolder.length + 1), true)
            };
        });
        lsFolderService.getExistingLanguageServerDirectories = () => Promise.resolve(expectedFolders);
        const latestFolder = yield lsFolderService.getCurrentLanguageServerDirectory();
        chai_1.expect(latestFolder.path).to.be.equal(path.join(root, 'languageServer.3.9.1'));
        chai_1.expect(latestFolder.version.raw).to.be.equal('3.9.1');
    }));
    test('Get latest language server folder name from nuget package version when there is no local folder', () => __awaiter(this, void 0, void 0, function* () {
        const pkg = { package: 'abc', version: new semver_1.SemVer('1.1.1'), uri: 'xyz' };
        settings.setup(s => s.autoUpdateLanguageServer).returns(() => true).verifiable(typeMoq.Times.once());
        lsFolderService.getCurrentLanguageServerDirectory = () => Promise.resolve(undefined);
        lsFolderService.getLatestLanguageServerVersion = () => Promise.resolve(pkg);
        const folderName = yield lsFolderService.getLanguageServerFolderName();
        chai_1.expect(folderName).to.be.equal(`${languageServerFolder}.${pkg.version.raw}`);
    }));
    test('Get latest language server folder name when local is same as nuget package version', () => __awaiter(this, void 0, void 0, function* () {
        const pkg = { package: 'abc', version: new semver_1.SemVer('1.1.1'), uri: 'xyz' };
        const existingFolder = { path: path.join('1', '2', 'abc'), version: new semver_1.SemVer('1.1.1') };
        settings.setup(s => s.autoUpdateLanguageServer).returns(() => true).verifiable(typeMoq.Times.once());
        lsFolderService.getCurrentLanguageServerDirectory = () => Promise.resolve(existingFolder);
        lsFolderService.getLatestLanguageServerVersion = () => Promise.resolve(pkg);
        const folderName = yield lsFolderService.getLanguageServerFolderName();
        settings.verifyAll();
        chai_1.expect(folderName).to.be.equal('abc');
    }));
    test('Get latest language server folder name when remote version is greater', () => __awaiter(this, void 0, void 0, function* () {
        const pkg = { package: 'abc', version: new semver_1.SemVer('2.1.1'), uri: 'xyz' };
        const existingFolder = { path: path.join('1', '2', 'abc'), version: new semver_1.SemVer('1.1.1') };
        lsFolderService.shouldLookForNewLanguageServer = () => Promise.resolve(true);
        lsFolderService.getCurrentLanguageServerDirectory = () => Promise.resolve(existingFolder);
        lsFolderService.getLatestLanguageServerVersion = () => Promise.resolve(pkg);
        const folderName = yield lsFolderService.getLanguageServerFolderName();
        chai_1.expect(folderName).to.be.equal(`${languageServerFolder}.2.1.1`);
    }));
    test('Get local folder name when remote version is greater and auto download is disabled', () => __awaiter(this, void 0, void 0, function* () {
        const pkg = { package: 'abc', version: new semver_1.SemVer('2.1.1'), uri: 'xyz' };
        const existingFolder = { path: path.join('1', '2', 'abc'), version: new semver_1.SemVer('1.1.1') };
        lsFolderService.shouldLookForNewLanguageServer = () => Promise.resolve(false);
        lsFolderService.getCurrentLanguageServerDirectory = () => Promise.resolve(existingFolder);
        lsFolderService.getLatestLanguageServerVersion = () => Promise.resolve(pkg);
        const folderName = yield lsFolderService.getLanguageServerFolderName();
        chai_1.expect(folderName).to.be.equal('abc');
    }));
    test('Should not check on server if downloading is disabled', () => __awaiter(this, void 0, void 0, function* () {
        const existingFolder = { path: path.join('1', '2', 'abc'), version: new semver_1.SemVer('1.1.1') };
        settings.setup(s => s.downloadLanguageServer).returns(() => false).verifiable(typeMoq.Times.once());
        const check = yield lsFolderService.shouldLookForNewLanguageServer(existingFolder);
        settings.verifyAll();
        chai_1.expect(check).to.be.equal(false, 'invalid value');
    }));
    test('Should not check on server if auto updating is disabled', () => __awaiter(this, void 0, void 0, function* () {
        const existingFolder = { path: path.join('1', '2', 'abc'), version: new semver_1.SemVer('1.1.1') };
        settings.setup(s => s.autoUpdateLanguageServer).returns(() => false).verifiable(typeMoq.Times.once());
        const check = yield lsFolderService.shouldLookForNewLanguageServer(existingFolder);
        settings.verifyAll();
        chai_1.expect(check).to.be.equal(false, 'invalid value');
    }));
    test('Should not check on server if download rule does not require a download', () => __awaiter(this, void 0, void 0, function* () {
        downloadRule.reset();
        downloadRule
            .setup(d => d.shouldLookForNewLanguageServer(typeMoq.It.isAny()))
            .returns(() => Promise.resolve(false))
            .verifiable(typeMoq.Times.once());
        const check = yield lsFolderService.shouldLookForNewLanguageServer();
        downloadRule.verifyAll();
        chai_1.expect(check).to.be.equal(false, 'invalid value');
    }));
    test('Should not check on server if download rule does require a download', () => __awaiter(this, void 0, void 0, function* () {
        downloadRule.reset();
        downloadRule
            .setup(d => d.shouldLookForNewLanguageServer(typeMoq.It.isAny()))
            .returns(() => Promise.resolve(true))
            .verifiable(typeMoq.Times.once());
        const check = yield lsFolderService.shouldLookForNewLanguageServer();
        downloadRule.verifyAll();
        chai_1.expect(check).to.be.equal(true, 'invalid value');
    }));
});
//# sourceMappingURL=languageServerFolderService.unit.test.js.map