// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const getos = require("getos");
const os = require("os");
const semver = require("semver");
const constants_1 = require("./constants");
const types_1 = require("./types");
let local;
function getLocal() {
    if (!local) {
        local = getOSInfo();
    }
    return local;
}
function getOSType(platform = process.platform) {
    if (/^win/.test(platform)) {
        return types_1.OSType.Windows;
    }
    else if (/^darwin/.test(platform)) {
        return types_1.OSType.OSX;
    }
    else if (/^linux/.test(platform)) {
        return types_1.OSType.Linux;
    }
    else {
        return types_1.OSType.Unknown;
    }
}
exports.getOSType = getOSType;
class OSInfo {
    constructor(type, arch = os.arch(), 
    // See:
    //  https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/semver/index.d.ts#L152
    version = new semver.SemVer('0.0.0'), distro = types_1.OSDistro.Unknown) {
        this.type = type;
        this.arch = arch;
        this.version = version;
        this.distro = distro;
    }
    get is64bit() {
        return this.arch === 'x64';
    }
}
exports.OSInfo = OSInfo;
function getOSInfo(getArch = os.arch, getRelease = os.release, getDistro = getLinuxDistro, platform) {
    const osType = getOSType(platform);
    const arch = getArch();
    switch (osType) {
        case types_1.OSType.Windows:
            return getDefaultOSInfo(osType, arch, getRelease);
        case types_1.OSType.OSX:
            return getDefaultOSInfo(osType, arch, getRelease);
        case types_1.OSType.Linux:
            return getLinuxInfo(arch, getDistro);
        default:
            return new OSInfo(types_1.OSType.Unknown, arch);
    }
}
exports.getOSInfo = getOSInfo;
function getDefaultOSInfo(osType, arch, getRelease) {
    const version = parseVersion(getRelease());
    return new OSInfo(osType, arch, version);
}
function getLinuxInfo(arch, getDistro) {
    const [distro, version] = getDistro();
    return new OSInfo(types_1.OSType.Linux, arch, version, distro);
}
function getLinuxDistro() {
    let distro = types_1.OSDistro.Unknown;
    let version = new semver.SemVer('0.0.0');
    getos((exc, info) => {
        if (exc) {
            throw exc;
        }
        distro = getLinuxDistroFromName(info.dist);
        version = parseVersion(info.release);
    });
    return [distro, version];
}
function getLinuxDistroFromName(name) {
    name = name.toLowerCase();
    // See https://github.com/zyga/os-release-zoo.
    if (/ubuntu/.test(name)) {
        return types_1.OSDistro.Ubuntu;
    }
    else if (/debian/.test(name)) {
        return types_1.OSDistro.Debian;
    }
    else if (/rhel/.test(name) || /red hat/.test(name)) {
        return types_1.OSDistro.RHEL;
    }
    else if (/fedora/.test(name)) {
        return types_1.OSDistro.Fedora;
    }
    else if (/centos/.test(name)) {
        return types_1.OSDistro.CentOS;
    }
    // The remainder aren't officially supported by VS Code.
    if (/suse/.test(name)) {
        return types_1.OSDistro.Suse;
    }
    else if (/gentoo/.test(name)) {
        return types_1.OSDistro.Suse;
    }
    else if (/arch/.test(name)) {
        return types_1.OSDistro.Arch;
    }
    else {
        return types_1.OSDistro.Unknown;
    }
}
// helpers
function isWindows(info) {
    if (!info) {
        info = getLocal();
    }
    return info.type === types_1.OSType.Windows;
}
exports.isWindows = isWindows;
function isMac(info) {
    if (!info) {
        info = getLocal();
    }
    return info.type === types_1.OSType.OSX;
}
exports.isMac = isMac;
function isLinux(info) {
    if (!info) {
        info = getLocal();
    }
    return info.type === types_1.OSType.Linux;
}
exports.isLinux = isLinux;
function is64bit(info) {
    if (!info) {
        info = getLocal();
    }
    return info.arch === 'x64';
}
exports.is64bit = is64bit;
function getPathVariableName(info) {
    return isWindows(info) ? constants_1.WINDOWS_PATH_VARIABLE_NAME : constants_1.NON_WINDOWS_PATH_VARIABLE_NAME;
}
exports.getPathVariableName = getPathVariableName;
function getVirtualEnvBinName(info) {
    return isWindows(info) ? 'scripts' : 'bin';
}
exports.getVirtualEnvBinName = getVirtualEnvBinName;
function parseVersion(raw) {
    raw = raw.replace(/\.00*(?=[1-9]|0\.)/, '.');
    const ver = semver.coerce(raw);
    if (ver === null || !semver.valid(ver)) {
        // tslint:disable-next-line: no-suspicious-comment
        // TODO: Raise an exception instead?
        return new semver.SemVer('0.0.0');
    }
    return ver;
}
exports.parseVersion = parseVersion;

//# sourceMappingURL=osinfo.js.map
