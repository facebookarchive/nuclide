Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.isRunningInTest = isRunningInTest;
exports.isRunningInClient = isRunningInClient;
exports.getAtomNuclideDir = getAtomNuclideDir;
exports.getAtomVersion = getAtomVersion;
exports.getNuclideVersion = getNuclideVersion;
exports.getNuclideRealDir = getNuclideRealDir;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _once = require('./once');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var NUCLIDE_PACKAGE_JSON_PATH = require.resolve('../../../package.json');
var NUCLIDE_BASEDIR = _path2['default'].dirname(NUCLIDE_PACKAGE_JSON_PATH);

var pkgJson = JSON.parse(_fs2['default'].readFileSync(NUCLIDE_PACKAGE_JSON_PATH));

// "Development" is defined as working from source - not packaged code.
// apm/npm and internal releases don't package the base `.flowconfig`, so
// we use this to figure if we're packaged or not.
var isDevelopment = (0, _once.once)(function () {
  try {
    _fs2['default'].statSync(_path2['default'].join(NUCLIDE_BASEDIR, '.flowconfig'));
    return true;
  } catch (err) {
    return false;
  }
});

exports.isDevelopment = isDevelopment;

function isRunningInTest() {
  if (isRunningInClient()) {
    return atom.inSpecMode();
  } else {
    return process.env.NODE_ENV === 'test';
  }
}

function isRunningInClient() {
  return typeof atom !== 'undefined';
}

// This path may be a symlink.

function getAtomNuclideDir() {
  if (!isRunningInClient()) {
    throw Error('Not running in Atom.');
  }
  var nuclidePackageModule = atom.packages.getLoadedPackage('nuclide');
  (0, _assert2['default'])(nuclidePackageModule);
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