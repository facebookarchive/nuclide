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
}

// Set to false if flake8 isn't found, so we don't repeatedly fail.
);

exports.getOutline = getOutline;

var getDiagnostics = _asyncToGenerator(function* (src, contents) {
  if (!shouldRunFlake8) {
    return [];
  }

  var dirName = (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.dirname(src);
  var configDir = yield (_commonsNodeFsPromise2 || _commonsNodeFsPromise()).default.findNearestFile('.flake8', dirName);
  var configPath = configDir ? (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.join(configDir, '.flake8') : null;

  var result = undefined;
  try {
    result = yield require('./fb/run-flake8')(src, contents, configPath);
  } catch (e) {
    // Ignore.
  }

  if (!result) {
    var command = global.atom && atom.config.get('nuclide.nuclide-python.pathToFlake8') || 'flake8';
    var args = [];

    if (configPath) {
      args.push('--config');
      args.push(configPath);
    }

    // Read contents from stdin.
    args.push('-');

    result = yield (0, (_commonsNodeProcess2 || _commonsNodeProcess()).asyncExecute)(command, args, { cwd: dirName, stdin: contents });
  }
  // 1 indicates unclean lint result (i.e. has errors/warnings).
  // A non-successful exit code can result in some cases that we want to ignore,
  // for example when an incorrect python version is specified for a source file.
  if (result.exitCode && result.exitCode > 1) {
    return [];
  } else if (result.exitCode == null) {
    // Don't throw if flake8 is not found on the user's system.
    if (result.errorCode === 'ENOENT') {
      // Don't retry again.
      shouldRunFlake8 = false;
      return [];
    }
    throw new Error('flake8 failed with error: ' + (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(result.errorMessage) + ', ' + ('stderr: ' + result.stderr + ', stdout: ' + result.stdout));
  }
  return (0, (_flake82 || _flake8()).parseFlake8Output)(src, result.stdout);
});

exports.getDiagnostics = getDiagnostics;

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
    throw new Error('"' + libCommand + '" failed with error: ' + (0, (_commonsNodeString2 || _commonsNodeString()).maybeToString)(result.errorMessage) + ', ' + ('stderr: ' + result.stderr + ', stdout: ' + result.stdout + '.'));
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

var _commonsNodeString2;

function _commonsNodeString() {
  return _commonsNodeString2 = require('../../commons-node/string');
}

var _commonsNodeFsPromise2;

function _commonsNodeFsPromise() {
  return _commonsNodeFsPromise2 = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _JediServerManager2;

function _JediServerManager() {
  return _JediServerManager2 = _interopRequireDefault(require('./JediServerManager'));
}

var _flake82;

function _flake8() {
  return _flake82 = require('./flake8');
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

var shouldRunFlake8 = true;

// Class params, i.e. superclasses.