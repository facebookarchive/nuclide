"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isRunningInServer = isRunningInServer;
exports.getAtomNuclideDir = getAtomNuclideDir;
exports.getAtomVersion = getAtomVersion;
exports.getNuclideVersion = getNuclideVersion;
exports.getNuclideRealDir = getNuclideRealDir;
exports.getOsType = getOsType;
exports.isRunningInWindows = isRunningInWindows;
exports.getOsVersion = getOsVersion;
exports.getRuntimePath = getRuntimePath;
exports.isRunningInTest = exports.OS_TYPE = void 0;

var _fs = _interopRequireDefault(require("fs"));

function _once() {
  const data = _interopRequireDefault(require("./once"));

  _once = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
const NUCLIDE_PACKAGE_JSON_PATH = require.resolve("../../package.json");

const NUCLIDE_BASEDIR = _nuclideUri().default.dirname(NUCLIDE_PACKAGE_JSON_PATH);

const pkgJson = JSON.parse(_fs.default.readFileSync(NUCLIDE_PACKAGE_JSON_PATH, 'utf8'));
const OS_TYPE = {
  WIN32: 'win32',
  WIN64: 'win64',
  LINUX: 'linux',
  OSX: 'darwin'
}; // Prior to Atom v1.7.0, `atom.inSpecMode` had a chance of performing an IPC call that could be
// expensive depending on how much work the other process was doing. Because this value will not
// change during run time, memoize the value to ensure the IPC call is performed only once.
//
// See [`getWindowLoadSettings`][1] for the sneaky getter and `remote` call that this memoization
// ensures happens only once.
//
// [1]: https://github.com/atom/atom/blob/v1.6.2/src/window-load-settings-helpers.coffee#L10-L14

exports.OS_TYPE = OS_TYPE;
const isRunningInTest = (0, _once().default)(() => {
  if (typeof atom === 'object') {
    return atom.inSpecMode();
  } else {
    return process.env.NODE_ENV === 'test';
  }
}); // Nuclide code can run in one of three situations:
//
// 1) Inside of Atom (just checking the Atom global is enough)
// 2) Inside of a forked Atom Helper (which has ELECTRON_RUN_AS_NODE)
// 3) Inside of the Nuclide server, or another plain Node script
//
// It's hard to explicitly check 3) so this checks for the absence of 1/2.

exports.isRunningInTest = isRunningInTest;

function isRunningInServer() {
  return typeof atom === 'undefined' && process.env.ELECTRON_RUN_AS_NODE !== '1';
} // This path may be a symlink.


function getAtomNuclideDir() {
  if (typeof atom !== 'object') {
    throw new Error('Not running in Atom.');
  }

  const nuclidePackageModule = atom.packages.getLoadedPackage('nuclide');

  if (!nuclidePackageModule) {
    throw new Error("Invariant violation: \"nuclidePackageModule\"");
  }

  return nuclidePackageModule.path;
}

function getAtomVersion() {
  if (typeof atom !== 'object') {
    throw new Error('Not running in Atom.');
  }

  return atom.getVersion();
}

function getNuclideVersion() {
  return pkgJson.version;
}

function getNuclideRealDir() {
  return NUCLIDE_BASEDIR;
}

function getOsType() {
  return _os.default.platform();
}

function isRunningInWindows() {
  return getOsType() === OS_TYPE.WIN32 || getOsType() === OS_TYPE.WIN64;
}

function getOsVersion() {
  return _os.default.release();
}

function getRuntimePath() {
  // "resourcesPath" only exists in Atom. It's as close as you can get to
  // Atom's path. In the general case, it looks like this:
  // Mac: "/Applications/Atom.app/Contents/Resources"
  // Linux: "/usr/share/atom/resources"
  // Windows: "C:\\Users\\asuarez\\AppData\\Local\\atom\\app-1.6.2\\resources"
  //          "C:\Atom\resources"
  // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
  if (global.atom && typeof process.resourcesPath === 'string') {
    const resourcesPath = process.resourcesPath;

    if (_os.default.platform() === 'darwin') {
      return resourcesPath.replace(/\/Contents\/Resources$/, '');
    } else if (_os.default.platform() === 'linux') {
      return resourcesPath.replace(/\/resources$/, '');
    } else {
      return resourcesPath.replace(/[\\]+resources$/, '');
    }
  } else {
    return process.execPath;
  }
}