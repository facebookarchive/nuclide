Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isRunningInClient = isRunningInClient;
exports.getAtomNuclideDir = getAtomNuclideDir;
exports.getAtomVersion = getAtomVersion;
exports.getNuclideVersion = getNuclideVersion;
exports.getNuclideRealDir = getNuclideRealDir;
exports.getOsType = getOsType;
exports.isRunningInWindows = isRunningInWindows;
exports.getOsVersion = getOsVersion;
exports.getRuntimePath = getRuntimePath;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _once2;

function _once() {
  return _once2 = _interopRequireDefault(require('./once'));
}

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _nuclideUri2;

function _nuclideUri() {
  return _nuclideUri2 = _interopRequireDefault(require('./nuclideUri'));
}

var NUCLIDE_PACKAGE_JSON_PATH = require.resolve('../../package.json');
var NUCLIDE_BASEDIR = (_nuclideUri2 || _nuclideUri()).default.dirname(NUCLIDE_PACKAGE_JSON_PATH);

var pkgJson = JSON.parse((_fs2 || _fs()).default.readFileSync(NUCLIDE_PACKAGE_JSON_PATH, 'utf8'));

var OS_TYPE = {
  WIN32: 'win32',
  WIN64: 'win64',
  LINUX: 'linux',
  OSX: 'darwin'
};

exports.OS_TYPE = OS_TYPE;
// "Development" is defined as working from source - not packaged code.
// apm/npm and internal releases don't package the base `.flowconfig`, so
// we use this to figure if we're packaged or not.
var isDevelopment = (0, (_once2 || _once()).default)(function () {
  try {
    (_fs2 || _fs()).default.statSync((_nuclideUri2 || _nuclideUri()).default.join(NUCLIDE_BASEDIR, '.flowconfig'));
    return true;
  } catch (err) {
    return false;
  }
});

exports.isDevelopment = isDevelopment;
// Prior to Atom v1.7.0, `atom.inSpecMode` had a chance of performing an IPC call that could be
// expensive depending on how much work the other process was doing. Because this value will not
// change during run time, memoize the value to ensure the IPC call is performed only once.
//
// See [`getWindowLoadSettings`][1] for the sneaky getter and `remote` call that this memoization
// ensures happens only once.
//
// [1]: https://github.com/atom/atom/blob/v1.6.2/src/window-load-settings-helpers.coffee#L10-L14
var isRunningInTest = (0, (_once2 || _once()).default)(function () {
  if (isRunningInClient()) {
    return atom.inSpecMode();
  } else {
    return process.env.NODE_ENV === 'test';
  }
});

exports.isRunningInTest = isRunningInTest;

function isRunningInClient() {
  return typeof atom !== 'undefined';
}

// This path may be a symlink.

function getAtomNuclideDir() {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  var nuclidePackageModule = atom.packages.getLoadedPackage('nuclide');
  (0, (_assert2 || _assert()).default)(nuclidePackageModule);
  return nuclidePackageModule.path;
}

function getAtomVersion() {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
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
  return (_os2 || _os()).default.platform();
}

function isRunningInWindows() {
  return getOsType() === OS_TYPE.WIN32 || getOsType() === OS_TYPE.WIN64;
}

function getOsVersion() {
  return (_os2 || _os()).default.release();
}

function getRuntimePath() {
  // "resourcesPath" only exists in Atom. It's as close as you can get to
  // Atom's path. In the general case, it looks like this:
  // Mac: "/Applications/Atom.app/Contents/Resources"
  // Linux: "/usr/share/atom/resources"
  // Windows: "C:\\Users\\asuarez\\AppData\\Local\\atom\\app-1.6.2\\resources"
  //          "C:\Atom\resources"
  if (global.atom && typeof process.resourcesPath === 'string') {
    var resourcesPath = process.resourcesPath;
    if ((_os2 || _os()).default.platform() === 'darwin') {
      return resourcesPath.replace(/\/Contents\/Resources$/, '');
    } else if ((_os2 || _os()).default.platform() === 'linux') {
      return resourcesPath.replace(/\/resources$/, '');
    } else {
      return resourcesPath.replace(/[\\]+resources$/, '');
    }
  } else {
    return process.execPath;
  }
}