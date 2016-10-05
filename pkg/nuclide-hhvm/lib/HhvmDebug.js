Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var debug = _asyncToGenerator(function* (debugMode, currentFilePath, target) {
  var processInfo = null;
  if (debugMode === 'script') {
    processInfo = new (_nuclideDebuggerPhpLibLaunchProcessInfo2 || _nuclideDebuggerPhpLibLaunchProcessInfo()).LaunchProcessInfo(currentFilePath, target);
  } else {
    processInfo = new (_nuclideDebuggerPhpLibAttachProcessInfo2 || _nuclideDebuggerPhpLibAttachProcessInfo()).AttachProcessInfo(currentFilePath);
  }

  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
  yield debuggerService.startDebugging(processInfo);
});

exports.debug = debug;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerPhpLibLaunchProcessInfo2;

function _nuclideDebuggerPhpLibLaunchProcessInfo() {
  return _nuclideDebuggerPhpLibLaunchProcessInfo2 = require('../../nuclide-debugger-php/lib/LaunchProcessInfo');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerPhpLibAttachProcessInfo2;

function _nuclideDebuggerPhpLibAttachProcessInfo() {
  return _nuclideDebuggerPhpLibAttachProcessInfo2 = require('../../nuclide-debugger-php/lib/AttachProcessInfo');
}