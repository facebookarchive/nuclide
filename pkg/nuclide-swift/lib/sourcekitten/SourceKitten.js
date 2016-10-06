Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getSourceKittenPath = getSourceKittenPath;

/**
 * Executes a SourceKitten request asyncrhonously.
 * If an error occurs, displays an error and returns null.
 * Otherwise, returns the stdout from SourceKitten.
 */

var asyncExecuteSourceKitten = _asyncToGenerator(function* (command, args) {
  // SourceKitten does not yet support any platform besides macOS.
  // It may soon support Linux; see: https://github.com/jpsim/SourceKitten/pull/223.
  if (process.platform !== 'darwin') {
    return null;
  }

  var sourceKittenPath = getSourceKittenPath();
  var result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)(sourceKittenPath, [command].concat(args));
  if (result.exitCode == null) {
    var errorCode = result.errorCode ? result.errorCode : '';
    var errorMessage = result.errorMessage ? result.errorMessage : '';
    atom.notifications.addError('Could not invoke SourceKitten at path `' + sourceKittenPath + '`', {
      description: 'Please double-check that the path you have set for the ' + '`nuclide-swift.sourceKittenPath` config setting is correct.<br>' + ('**Error code:** `' + errorCode + '`<br>') + ('**Error message:** <pre>' + errorMessage + '</pre>')
    });
    return null;
  } else if (result.exitCode !== 0 || result.stdout.length === 0) {
    atom.notifications.addError('An error occured when invoking SourceKitten', {
      description: 'Please file a bug.<br>' + ('**exit code:** `' + String(result.exitCode) + '`<br>') + ('**stdout:** <pre>' + String(result.stdout) + '</pre><br>') + ('**stderr:** <pre>' + String(result.stderr) + '</pre><br>') + ('**command:** <pre>' + String(result.command ? result.command : '') + '</pre><br>')
    });
    return null;
  }

  return result.stdout;
});

exports.asyncExecuteSourceKitten = asyncExecuteSourceKitten;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../../commons-node/process');
}

var _commonsAtomFeatureConfig2;

function _commonsAtomFeatureConfig() {
  return _commonsAtomFeatureConfig2 = _interopRequireDefault(require('../../../commons-atom/featureConfig'));
}

/**
 * Commands that SourceKitten implements and nuclide-swift supports, such as
 * "complete" for autocompletion.
 */

/**
 * Returns the path to SourceKitten, based on the user's Nuclide config.
 */

function getSourceKittenPath() {
  return (_commonsAtomFeatureConfig2 || _commonsAtomFeatureConfig()).default.get('nuclide-swift.sourceKittenPath');
}