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
    processInfo = new (_nuclideDebuggerPhpLibLaunchProcessInfo || _load_nuclideDebuggerPhpLibLaunchProcessInfo()).LaunchProcessInfo(currentFilePath, target);
  } else {
    processInfo = new (_nuclideDebuggerPhpLibAttachProcessInfo || _load_nuclideDebuggerPhpLibAttachProcessInfo()).AttachProcessInfo(currentFilePath);
  }

  // Use commands here to trigger package activation.
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  var debuggerService = yield (0, (_commonsAtomConsumeFirstProvider || _load_commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
  yield debuggerService.startDebugging(processInfo);
});

exports.debug = debug;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomConsumeFirstProvider;

function _load_commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerPhpLibLaunchProcessInfo;

function _load_nuclideDebuggerPhpLibLaunchProcessInfo() {
  return _nuclideDebuggerPhpLibLaunchProcessInfo = require('../../nuclide-debugger-php/lib/LaunchProcessInfo');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerPhpLibAttachProcessInfo;

function _load_nuclideDebuggerPhpLibAttachProcessInfo() {
  return _nuclideDebuggerPhpLibAttachProcessInfo = require('../../nuclide-debugger-php/lib/AttachProcessInfo');
}