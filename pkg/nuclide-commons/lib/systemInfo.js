Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getOsType = getOsType;
exports.isRunningInWindows = isRunningInWindows;
exports.getOsVersion = getOsVersion;

var getFlowVersion = _asyncToGenerator(function* () {
  // $UPFixMe: This should use nuclide-features-config
  var flowPath = global.atom && global.atom.config.get('nuclide-flow.pathToFlow') || 'flow';

  var _ref = yield (0, (_process2 || _process()).asyncExecute)(flowPath, ['--version']);

  var stdout = _ref.stdout;

  return stdout.trim();
});

exports.getFlowVersion = getFlowVersion;

var getClangVersion = _asyncToGenerator(function* () {
  var _ref2 = yield (0, (_process2 || _process()).asyncExecute)('clang', ['--version']);

  var stdout = _ref2.stdout;

  return stdout.trim();
});

exports.getClangVersion = getClangVersion;
exports.getRuntimePath = getRuntimePath;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _process2;

function _process() {
  return _process2 = require('./process');
}

var OS_TYPE = {
  WIN32: 'win32',
  WIN64: 'win64',
  LINUX: 'linux',
  OSX: 'darwin'
};

exports.OS_TYPE = OS_TYPE;

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