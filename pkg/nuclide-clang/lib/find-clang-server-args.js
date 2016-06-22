Object.defineProperty(exports, '__esModule', {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var fbFindClangServerArgs = undefined;

exports.default = _asyncToGenerator(function* () {
  if (fbFindClangServerArgs === undefined) {
    fbFindClangServerArgs = null;
    try {
      // $FlowFB
      fbFindClangServerArgs = require('./fb/find-clang-server-args');
    } catch (e) {
      // Ignore.
    }
  }

  var libClangLibraryFile = undefined;
  if (process.platform === 'darwin') {
    var result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)('xcode-select', ['--print-path']);
    if (result.exitCode === 0) {
      libClangLibraryFile = result.stdout.trim() + '/Toolchains/XcodeDefault.xctoolchain/usr/lib/libclang.dylib';
    }
  }

  var clangServerArgs = {
    libClangLibraryFile: libClangLibraryFile,
    pythonExecutable: 'python',
    pythonPathEnv: (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(__dirname, '../VendorLib')
  };
  if (typeof fbFindClangServerArgs === 'function') {
    var clangServerArgsOverrides = yield fbFindClangServerArgs();
    return _extends({}, clangServerArgs, clangServerArgsOverrides);
  } else {
    return clangServerArgs;
  }
});
module.exports = exports.default;