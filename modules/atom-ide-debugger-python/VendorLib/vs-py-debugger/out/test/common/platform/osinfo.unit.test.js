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
const chai_1 = require("chai");
const semver = require("semver");
const osinfo_1 = require("../../../client/common/platform/osinfo");
const types_1 = require("../../../client/common/platform/types");
const stub_1 = require("../../../test/stub");
// Windows
exports.WIN_10 = new osinfo_1.OSInfo(types_1.OSType.Windows, 'x64', new semver.SemVer('10.0.1'));
exports.WIN_7 = new osinfo_1.OSInfo(types_1.OSType.Windows, 'x64', new semver.SemVer('6.1.3'));
exports.WIN_XP = new osinfo_1.OSInfo(types_1.OSType.Windows, 'x64', new semver.SemVer('5.1.7'));
// OS X
exports.MAC_HIGH_SIERRA = new osinfo_1.OSInfo(types_1.OSType.OSX, 'x64', new semver.SemVer('10.13.1'));
exports.MAC_SIERRA = new osinfo_1.OSInfo(types_1.OSType.OSX, 'x64', new semver.SemVer('10.12.2'));
exports.MAC_EL_CAPITAN = new osinfo_1.OSInfo(types_1.OSType.OSX, 'x64', new semver.SemVer('10.11.5'));
// Linux
exports.UBUNTU_BIONIC = new osinfo_1.OSInfo(types_1.OSType.Linux, 'x64', osinfo_1.parseVersion('18.04'), 
//semver.coerce('18.04') || new semver.SemVer('0.0.0'),
types_1.OSDistro.Ubuntu);
exports.UBUNTU_PRECISE = new osinfo_1.OSInfo(types_1.OSType.Linux, 'x64', osinfo_1.parseVersion('14.04'), 
//semver.coerce('14.04') || new semver.SemVer('0.0.0'),
types_1.OSDistro.Ubuntu);
exports.FEDORA = new osinfo_1.OSInfo(types_1.OSType.Linux, 'x64', osinfo_1.parseVersion('24'), 
//semver.coerce('24') || new semver.SemVer('0.0.0'),
types_1.OSDistro.Fedora);
exports.ARCH = new osinfo_1.OSInfo(types_1.OSType.Linux, 'x64', new semver.SemVer('0.0.0'), // rolling vs. 2018.08.01
types_1.OSDistro.Arch);
exports.OLD = new osinfo_1.OSInfo(types_1.OSType.Windows, 'x86', new semver.SemVer('5.1.7'));
class StubDeps {
    constructor(stub = new stub_1.Stub()) {
        this.stub = stub;
        this.returnGetArch = '';
        this.returnGetRelease = '';
        this.returnGetLinuxDistro = [types_1.OSDistro.Unknown, new semver.SemVer('0.0.0')];
    }
    getArch() {
        this.stub.addCall('getArch');
        this.stub.maybeErr();
        return this.returnGetArch;
    }
    getRelease() {
        this.stub.addCall('getRelease');
        this.stub.maybeErr();
        return this.returnGetRelease;
    }
    getLinuxDistro() {
        this.stub.addCall('getLinuxDistro');
        this.stub.maybeErr();
        return this.returnGetLinuxDistro;
    }
}
suite('OS Info - getOSInfo()', () => {
    let stub;
    let deps;
    setup(() => {
        stub = new stub_1.Stub();
        deps = new StubDeps(stub);
    });
    const NOT_LINUX = [types_1.OSDistro.Unknown, ''];
    const tests = [
        ['windows', 'x64', '10.0.1', NOT_LINUX, exports.WIN_10],
        ['windows', 'x64', '6.1.3', NOT_LINUX, exports.WIN_7],
        ['windows', 'x64', '5.1.7', NOT_LINUX, exports.WIN_XP],
        ['darwin', 'x64', '10.13.1', NOT_LINUX, exports.MAC_HIGH_SIERRA],
        ['darwin', 'x64', '10.12.2', NOT_LINUX, exports.MAC_SIERRA],
        ['darwin', 'x64', '10.11.5', NOT_LINUX, exports.MAC_EL_CAPITAN],
        ['linux', 'x64', '4.1.4', [types_1.OSDistro.Ubuntu, '18.04'], exports.UBUNTU_BIONIC],
        ['linux', 'x64', '4.1.4', [types_1.OSDistro.Ubuntu, '14.04'], exports.UBUNTU_PRECISE],
        ['linux', 'x64', '4.1.4', [types_1.OSDistro.Fedora, '24'], exports.FEDORA],
        ['linux', 'x64', '4.1.4', [types_1.OSDistro.Arch, ''], exports.ARCH],
        ['windows', 'x86', '5.1.7', NOT_LINUX, exports.OLD] // WinXP
    ];
    let i = 0;
    for (const [platform, arch, release, [distro, version], expected] of tests) {
        test(`${i} - ${platform} ${arch} ${release}`, () => __awaiter(this, void 0, void 0, function* () {
            deps.returnGetArch = arch;
            deps.returnGetRelease = release;
            deps.returnGetLinuxDistro = [distro, osinfo_1.parseVersion(version)];
            const result = osinfo_1.getOSInfo(() => deps.getArch(), () => deps.getRelease(), () => deps.getLinuxDistro(), platform);
            chai_1.expect(result).to.deep.equal(expected);
            if (distro === types_1.OSDistro.Unknown) {
                stub.checkCalls([
                    { funcName: 'getArch', args: [] },
                    { funcName: 'getRelease', args: [] }
                ]);
            }
            else {
                stub.checkCalls([
                    { funcName: 'getArch', args: [] },
                    { funcName: 'getLinuxDistro', args: [] }
                ]);
            }
        }));
        i = i + 1;
    }
});
suite('OS Info - getOSType()', () => {
    const tests = [
        ['windows', types_1.OSType.Windows],
        ['darwin', types_1.OSType.OSX],
        ['linux', types_1.OSType.Linux],
        ['win32', types_1.OSType.Windows],
        ['darwin ++', types_1.OSType.OSX],
        ['linux!', types_1.OSType.Linux]
    ];
    for (const [platform, expected] of tests) {
        test(`platform: ${platform}`, () => __awaiter(this, void 0, void 0, function* () {
            const result = osinfo_1.getOSType(platform);
            chai_1.expect(result).to.be.equal(expected);
        }));
    }
});
suite('OS Info - helpers', () => {
    test('isWindows', () => __awaiter(this, void 0, void 0, function* () {
        for (const info of [exports.WIN_10]) {
            const result = osinfo_1.isWindows(info);
            chai_1.expect(result).to.be.equal(true, 'invalid value');
        }
        for (const info of [exports.MAC_HIGH_SIERRA, exports.UBUNTU_BIONIC, exports.FEDORA]) {
            const result = osinfo_1.isWindows(info);
            chai_1.expect(result).to.be.equal(false, 'invalid value');
        }
    }));
    test('isMac', () => __awaiter(this, void 0, void 0, function* () {
        for (const info of [exports.MAC_HIGH_SIERRA]) {
            const result = osinfo_1.isMac(info);
            chai_1.expect(result).to.be.equal(true, 'invalid value');
        }
        for (const info of [exports.WIN_10, exports.UBUNTU_BIONIC, exports.FEDORA]) {
            const result = osinfo_1.isMac(info);
            chai_1.expect(result).to.be.equal(false, 'invalid value');
        }
    }));
    test('isLinux', () => __awaiter(this, void 0, void 0, function* () {
        for (const info of [exports.UBUNTU_BIONIC, exports.FEDORA]) {
            const result = osinfo_1.isLinux(info);
            chai_1.expect(result).to.be.equal(true, 'invalid value');
        }
        for (const info of [exports.WIN_10, exports.MAC_HIGH_SIERRA]) {
            const result = osinfo_1.isLinux(info);
            chai_1.expect(result).to.be.equal(false, 'invalid value');
        }
    }));
    test('is64bit', () => __awaiter(this, void 0, void 0, function* () {
        const result1 = osinfo_1.is64bit(exports.WIN_10);
        const result2 = osinfo_1.is64bit(exports.OLD);
        chai_1.expect(result1).to.be.equal(true, 'invalid value');
        chai_1.expect(result2).to.be.equal(false, 'invalid value');
    }));
    test('getPathVariableName - Windows', () => __awaiter(this, void 0, void 0, function* () {
        const result = osinfo_1.getPathVariableName(exports.WIN_10);
        chai_1.expect(result).to.be.equal('Path', 'invalid value');
    }));
    test('getPathVariableName - Mac', () => __awaiter(this, void 0, void 0, function* () {
        const result = osinfo_1.getPathVariableName(exports.MAC_HIGH_SIERRA);
        chai_1.expect(result).to.be.equal('PATH', 'invalid value');
    }));
    test('getPathVariableName - Linux', () => __awaiter(this, void 0, void 0, function* () {
        const result = osinfo_1.getPathVariableName(exports.UBUNTU_BIONIC);
        chai_1.expect(result).to.be.equal('PATH', 'invalid value');
    }));
    test('getVirtualEnvBinName - Windows', () => __awaiter(this, void 0, void 0, function* () {
        const result = osinfo_1.getVirtualEnvBinName(exports.WIN_10);
        chai_1.expect(result).to.be.equal('scripts', 'invalid value');
    }));
    test('getVirtualEnvBinName - Mac', () => __awaiter(this, void 0, void 0, function* () {
        const result = osinfo_1.getVirtualEnvBinName(exports.MAC_HIGH_SIERRA);
        chai_1.expect(result).to.be.equal('bin', 'invalid value');
    }));
    test('getVirtualEnvBinName - Linux', () => __awaiter(this, void 0, void 0, function* () {
        const result = osinfo_1.getVirtualEnvBinName(exports.UBUNTU_BIONIC);
        chai_1.expect(result).to.be.equal('bin', 'invalid value');
    }));
});

//# sourceMappingURL=osinfo.unit.test.js.map
