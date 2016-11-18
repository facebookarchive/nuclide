'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatCode = exports.getDiagnostics = exports.getOutline = exports.getReferences = exports.getDefinitions = exports.getCompletions = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getCompletions = exports.getCompletions = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (src, contents, line, column) {
    const service = yield serverManager.getJediService(src);
    return service.get_completions(src, contents, line, column);
  });

  return function getCompletions(_x, _x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

let getDefinitions = exports.getDefinitions = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (src, contents, line, column) {
    const service = yield serverManager.getJediService(src);
    return service.get_definitions(src, contents, line, column);
  });

  return function getDefinitions(_x5, _x6, _x7, _x8) {
    return _ref2.apply(this, arguments);
  };
})();

let getReferences = exports.getReferences = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (src, contents, line, column) {
    const service = yield serverManager.getJediService(src);
    return service.get_references(src, contents, line, column);
  });

  return function getReferences(_x9, _x10, _x11, _x12) {
    return _ref3.apply(this, arguments);
  };
})();

let getOutline = exports.getOutline = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (src, contents) {
    const service = yield serverManager.getJediService(src);
    return service.get_outline(src, contents);
  });

  return function getOutline(_x13, _x14) {
    return _ref4.apply(this, arguments);
  };
})();

// Set to false if flake8 isn't found, so we don't repeatedly fail.


let getDiagnostics = exports.getDiagnostics = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (src, contents) {
    if (!shouldRunFlake8) {
      return [];
    }

    const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname(src);
    const configDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.flake8', dirName);
    const configPath = configDir ? (_nuclideUri || _load_nuclideUri()).default.join(configDir, '.flake8') : null;

    let result;
    try {
      // $FlowFB
      result = yield require('./fb/run-flake8')(src, contents, configPath);
    } catch (e) {
      // Ignore.
    }

    if (!result) {
      const command = global.atom && atom.config.get('nuclide.nuclide-python.pathToFlake8') || 'flake8';
      const args = [];

      if (configPath) {
        args.push('--config');
        args.push(configPath);
      }

      // Read contents from stdin.
      args.push('-');

      result = yield (0, (_process || _load_process()).asyncExecute)(command, args, { cwd: dirName, stdin: contents });
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
      throw new Error(`flake8 failed with error: ${ (0, (_string || _load_string()).maybeToString)(result.errorMessage) }, ` + `stderr: ${ result.stderr }, stdout: ${ result.stdout }`);
    }
    return (0, (_flake || _load_flake()).parseFlake8Output)(src, result.stdout);
  });

  return function getDiagnostics(_x15, _x16) {
    return _ref5.apply(this, arguments);
  };
})();

let formatCode = exports.formatCode = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (src, contents, start, end) {
    const libCommand = getFormatterPath();
    const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname((_nuclideUri || _load_nuclideUri()).default.getPath(src));

    const result = yield (0, (_process || _load_process()).asyncExecute)(libCommand, ['--line', `${ start }-${ end }`], { cwd: dirName, stdin: contents });

    /*
     * At the moment, yapf outputs 3 possible exit codes:
     * 0 - success, no content change.
     * 2 - success, contents changed.
     * 1 - internal failure, most likely due to syntax errors.
     *
     * See: https://github.com/google/yapf/issues/228#issuecomment-198682079
     */
    if (result.exitCode === 1) {
      throw new Error(`"${ libCommand }" failed, likely due to syntax errors.`);
    } else if (result.exitCode == null) {
      throw new Error(`"${ libCommand }" failed with error: ${ (0, (_string || _load_string()).maybeToString)(result.errorMessage) }, ` + `stderr: ${ result.stderr }, stdout: ${ result.stdout }.`);
    } else if (contents !== '' && result.stdout === '') {
      // Throw error if the yapf output is empty, which is almost never desirable.
      throw new Error('Empty output received from yapf.');
    }

    return result.stdout;
  });

  return function formatCode(_x17, _x18, _x19, _x20) {
    return _ref6.apply(this, arguments);
  };
})();

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _string;

function _load_string() {
  return _string = require('../../commons-node/string');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../commons-node/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _JediServerManager;

function _load_JediServerManager() {
  return _JediServerManager = _interopRequireDefault(require('./JediServerManager'));
}

var _flake;

function _load_flake() {
  return _flake = require('./flake8');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let formatterPath;
function getFormatterPath() {
  if (formatterPath) {
    return formatterPath;
  }

  formatterPath = 'yapf';

  try {
    // $FlowFB
    const overridePath = require('./fb/find-formatter-path')();
    if (overridePath) {
      formatterPath = overridePath;
    }
  } catch (e) {
    // Ignore.
  }

  return formatterPath;
}

const serverManager = new (_JediServerManager || _load_JediServerManager()).default();

let shouldRunFlake8 = true;