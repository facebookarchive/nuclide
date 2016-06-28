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

var getCompletions = _asyncToGenerator(function* (src, contents, line, column) {
  var service = yield serverManager.getJediService(src);
  return service.get_completions(src, contents, line, column);
});

exports.getCompletions = getCompletions;

var getDefinitions = _asyncToGenerator(function* (src, contents, line, column) {
  var service = yield serverManager.getJediService(src);
  return service.get_definitions(src, contents, line, column);
});

exports.getDefinitions = getDefinitions;

var getReferences = _asyncToGenerator(function* (src, contents, line, column) {
  var service = yield serverManager.getJediService(src);
  return service.get_references(src, contents, line, column);
});

exports.getReferences = getReferences;

var getOutline = _asyncToGenerator(function* (src, contents) {
  var service = yield serverManager.getJediService(src);
  return service.get_outline(src, contents);
});

exports.getOutline = getOutline;

var formatCode = _asyncToGenerator(function* (src, contents, start, end) {
  var libCommand = getFormatterPath();
  var dirName = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname((_nuclideRemoteUri2 || _nuclideRemoteUri()).default.getPath(src));

  var result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)(libCommand, ['--line', start + '-' + end], { cwd: dirName, stdin: contents });

  /*
   * At the moment, yapf outputs 3 possible exit codes:
   * 0 - success, no content change.
   * 2 - success, contents changed.
   * 1 - internal failure, most likely due to syntax errors.
   *
   * See: https://github.com/google/yapf/issues/228#issuecomment-198682079
   */
  if (result.exitCode === 1) {
    throw new Error('"' + libCommand + '" failed, likely due to syntax errors.');
  } else if (result.exitCode == null) {
    throw new Error('"' + libCommand + '" failed with error: ' + result.errorMessage + ', ' + ('stderr: ' + result.stderr + ', stdout: ' + result.stdout + '.'));
  } else if (contents !== '' && result.stdout === '') {
    // Throw error if the yapf output is empty, which is almost never desirable.
    throw new Error('Empty output received from yapf.');
  }

  return result.stdout;
});

exports.formatCode = formatCode;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _JediServerManager2;

function _JediServerManager() {
  return _JediServerManager2 = _interopRequireDefault(require('./JediServerManager'));
}

var formatterPath = undefined;
function getFormatterPath() {
  if (formatterPath) {
    return formatterPath;
  }

  formatterPath = 'yapf';

  try {
    var overridePath = require('./fb/find-formatter-path')();
    if (overridePath) {
      formatterPath = overridePath;
    }
  } catch (e) {
    // Ignore.
  }

  return formatterPath;
}

var serverManager = new (_JediServerManager2 || _JediServerManager()).default();

// Class params, i.e. superclasses.