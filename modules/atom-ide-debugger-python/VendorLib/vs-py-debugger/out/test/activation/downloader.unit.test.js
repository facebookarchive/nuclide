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
// tslint:disable:no-unused-variable
const assert = require("assert");
const TypeMoq = require("typemoq");
const downloader_1 = require("../../client/activation/downloader");
const platformData_1 = require("../../client/activation/platformData");
const types_1 = require("../../client/common/platform/types");
const types_2 = require("../../client/common/types");
suite('Activation - Downloader', () => {
    let languageServerDownloader;
    let serviceContainer;
    let platformService;
    setup(() => {
        serviceContainer = TypeMoq.Mock.ofType();
        platformService = TypeMoq.Mock.ofType();
        const fs = TypeMoq.Mock.ofType();
        const output = TypeMoq.Mock.ofType();
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_2.IOutputChannel), TypeMoq.It.isAny())).returns(() => output.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IPlatformService))).returns(() => platformService.object);
        serviceContainer.setup(c => c.get(TypeMoq.It.isValue(types_1.IFileSystem))).returns(() => fs.object);
        languageServerDownloader = new downloader_1.LanguageServerDownloader(serviceContainer.object, '');
    });
    function setupPlatform(platform) {
        platformService.setup(x => x.isWindows).returns(() => platform.windows === true);
        platformService.setup(x => x.isMac).returns(() => platform.mac === true);
        platformService.setup(x => x.isLinux).returns(() => platform.linux === true);
        platformService.setup(x => x.is64bit).returns(() => platform.is64Bit === true);
    }
    test('Windows 32Bit', () => __awaiter(this, void 0, void 0, function* () {
        setupPlatform({ windows: true });
        const link = yield languageServerDownloader.getDownloadUri();
        assert.equal(link, downloader_1.DownloadLinks[platformData_1.PlatformName.Windows32Bit]);
    }));
    test('Windows 64Bit', () => __awaiter(this, void 0, void 0, function* () {
        setupPlatform({ windows: true, is64Bit: true });
        const link = yield languageServerDownloader.getDownloadUri();
        assert.equal(link, downloader_1.DownloadLinks[platformData_1.PlatformName.Windows64Bit]);
    }));
    test('Mac 64Bit', () => __awaiter(this, void 0, void 0, function* () {
        setupPlatform({ mac: true, is64Bit: true });
        const link = yield languageServerDownloader.getDownloadUri();
        assert.equal(link, downloader_1.DownloadLinks[platformData_1.PlatformName.Mac64Bit]);
    }));
    test('Linux 64Bit', () => __awaiter(this, void 0, void 0, function* () {
        setupPlatform({ linux: true, is64Bit: true });
        const link = yield languageServerDownloader.getDownloadUri();
        assert.equal(link, downloader_1.DownloadLinks[platformData_1.PlatformName.Linux64Bit]);
    }));
});
//# sourceMappingURL=downloader.unit.test.js.map