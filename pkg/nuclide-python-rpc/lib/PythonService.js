'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDiagnostics = exports.getReferences = exports.initialize = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileNotifier, config) {
    return new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService(fileNotifier, new PythonSingleFileLanguageService(fileNotifier, config));
  });

  return function initialize(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getReferences = exports.getReferences = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (src, contents, line, column) {
    const service = yield serverManager.getJediService(src);
    return service.get_references(src, contents, line, column);
  });

  return function getReferences(_x3, _x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
})();

// Set to false if flake8 isn't found, so we don't repeatedly fail.


let getDiagnostics = exports.getDiagnostics = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (src, contents) {
    if (!shouldRunFlake8) {
      return [];
    }

    const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname(src);
    const configDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.flake8', dirName);
    const configPath = configDir ? (_nuclideUri || _load_nuclideUri()).default.join(configDir, '.flake8') : null;

    let result;
    try {
      // $FlowFB
      const runFlake8 = require('./fb/run-flake8').default;
      result = yield runFlake8(src, contents, configPath);
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
      throw new Error(`flake8 failed with error: ${(0, (_string || _load_string()).maybeToString)(result.errorMessage)}, ` + `stderr: ${result.stderr}, stdout: ${result.stdout}`);
    }
    return (0, (_flake || _load_flake()).parseFlake8Output)(src, result.stdout);
  });

  return function getDiagnostics(_x7, _x8) {
    return _ref3.apply(this, arguments);
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

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _outline;

function _load_outline() {
  return _outline = require('./outline');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _AutocompleteHelpers;

function _load_AutocompleteHelpers() {
  return _AutocompleteHelpers = require('./AutocompleteHelpers');
}

var _DefinitionHelpers;

function _load_DefinitionHelpers() {
  return _DefinitionHelpers = require('./DefinitionHelpers');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const serverManager = new (_JediServerManager || _load_JediServerManager()).default();

class PythonSingleFileLanguageService {

  constructor(fileNotifier, config) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    this._fileCache = fileNotifier;
    this._showGlobalVariables = config.showGlobalVariables;
    this._autocompleteArguments = config.autocompleteArguments;
    this._includeOptionalArguments = config.includeOptionalArguments;
  }

  getDiagnostics(filePath, buffer) {
    throw new Error('Not Yet Implemented');
  }

  observeDiagnostics() {
    throw new Error('Not Yet Implemented');
  }

  getAutocompleteSuggestions(filePath, buffer, position, activatedManually) {
    return (0, (_AutocompleteHelpers || _load_AutocompleteHelpers()).getAutocompleteSuggestions)(serverManager, filePath, buffer, position, activatedManually, this._autocompleteArguments, this._includeOptionalArguments);
  }

  getDefinition(filePath, buffer, position) {
    return (0, (_DefinitionHelpers || _load_DefinitionHelpers()).getDefinition)(serverManager, filePath, buffer, position);
  }

  getDefinitionById(file, id) {
    return Promise.resolve(null);
  }

  findReferences(filePath, buffer, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield getReferences(filePath, buffer.getText(), position.row, position.column);

      if (!result || result.length === 0) {
        return { type: 'error', message: 'No usages were found.' };
      }

      const symbolName = result[0].text;

      // Process this into the format nuclide-find-references expects.
      const references = result.map(function (ref) {
        return {
          uri: ref.file,
          name: ref.parentName,
          range: new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(ref.line, ref.column), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(ref.line, ref.column + ref.text.length))
        };
      });

      // Choose the project root as baseUri, or if no project exists,
      // use the dirname of the src file.
      const baseUri = _this._fileCache.getContainingDirectory(filePath) || (_nuclideUri || _load_nuclideUri()).default.dirname(filePath);

      return {
        type: 'data',
        baseUri,
        referencedSymbolName: symbolName,
        references
      };
    })();
  }

  getCoverage(filePath) {
    throw new Error('Not Yet Implemented');
  }

  getOutline(filePath, buffer) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const service = yield serverManager.getJediService(filePath);
      const items = yield service.get_outline(filePath, buffer.getText());

      if (items == null) {
        return null;
      }

      const mode = _this2._showGlobalVariables ? 'all' : 'constants';
      return {
        outlineTrees: (0, (_outline || _load_outline()).itemsToOutline)(mode, items)
      };
    })();
  }

  typeHint(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  highlight(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  formatSource(filePath, buffer, range) {
    throw new Error('Not Yet Implemented');
  }

  formatEntireFile(filePath, buffer, range) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();
      const start = range.start.row + 1;
      const end = range.end.row + 1;
      const libCommand = getFormatterPath();
      const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname((_nuclideUri || _load_nuclideUri()).default.getPath(filePath));

      const result = yield (0, (_process || _load_process()).asyncExecute)(libCommand, ['--line', `${start}-${end}`], { cwd: dirName, stdin: contents });

      /*
       * At the moment, yapf outputs 3 possible exit codes:
       * 0 - success, no content change.
       * 2 - success, contents changed.
       * 1 - internal failure, most likely due to syntax errors.
       *
       * See: https://github.com/google/yapf/issues/228#issuecomment-198682079
       */
      if (result.exitCode === 1) {
        throw new Error(`"${libCommand}" failed, likely due to syntax errors.`);
      } else if (result.exitCode == null) {
        throw new Error(`"${libCommand}" failed with error: ${(0, (_string || _load_string()).maybeToString)(result.errorMessage)}, ` + `stderr: ${result.stderr}, stdout: ${result.stdout}.`);
      } else if (contents !== '' && result.stdout === '') {
        // Throw error if the yapf output is empty, which is almost never desirable.
        throw new Error('Empty output received from yapf.');
      }

      return { formatted: result.stdout };
    })();
  }

  getEvaluationExpression(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  getProjectRoot(fileUri) {
    throw new Error('Not Yet Implemented');
  }

  isFileInProject(fileUri) {
    throw new Error('Not Yet Implemented');
  }

  dispose() {}
}

let formatterPath;
function getFormatterPath() {
  if (formatterPath) {
    return formatterPath;
  }

  formatterPath = 'yapf';

  try {
    // $FlowFB
    const findFormatterPath = require('./fb/find-formatter-path').default;
    const overridePath = findFormatterPath();
    if (overridePath) {
      formatterPath = overridePath;
    }
  } catch (e) {
    // Ignore.
  }

  return formatterPath;
}

let shouldRunFlake8 = true;