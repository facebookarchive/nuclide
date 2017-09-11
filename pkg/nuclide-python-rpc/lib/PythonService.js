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

    let result;
    try {
      result = yield runLinterCommand(src, contents);
    } catch (err) {
      // A non-successful exit code can result in some cases that we want to ignore,
      // for example when an incorrect python version is specified for a source file.
      if (err instanceof (_process || _load_process()).ProcessExitError) {
        return [];
      } else if (err.errorCode === 'ENOENT') {
        // Don't throw if flake8 is not found on the user's system.
        // Don't retry again.
        shouldRunFlake8 = false;
        return [];
      }
      throw new Error(`flake8 failed with error: ${(0, (_string || _load_string()).maybeToString)(err.message)}`);
    }

    return (0, (_flake || _load_flake()).parseFlake8Output)(src, result);
  });

  return function getDiagnostics(_x7, _x8) {
    return _ref3.apply(this, arguments);
  };
})();

let runLinterCommand = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (src, contents) {
    const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname(src);
    const configDir = yield (_fsPromise || _load_fsPromise()).default.findNearestFile('.flake8', dirName);
    // flowlint-next-line sketchy-null-string:off
    const configPath = configDir ? (_nuclideUri || _load_nuclideUri()).default.join(configDir, '.flake8') : null;

    let result;
    let runFlake8;
    try {
      // $FlowFB
      runFlake8 = require('./fb/run-flake8').default;
    } catch (e) {
      // Ignore.
    }

    if (runFlake8 != null) {
      result = yield runFlake8(src, contents, configPath);
      if (result != null) {
        return result;
      }
    }

    const command = global.atom && atom.config.get('nuclide.nuclide-python.pathToFlake8') || 'flake8';
    const args = [];

    // flowlint-next-line sketchy-null-string:off
    if (configPath) {
      args.push('--config');
      args.push(configPath);
    }

    // Read contents from stdin.
    args.push('-');

    if (!(typeof command === 'string')) {
      throw new Error('Invariant violation: "typeof command === \'string\'"');
    }

    return (0, (_process || _load_process()).runCommand)(command, args, {
      cwd: dirName,
      input: contents,
      // 1 indicates unclean lint result (i.e. has errors/warnings).
      isExitError: function (exit) {
        return exit.exitCode == null || exit.exitCode > 1;
      }
    }).toPromise();
  });

  return function runLinterCommand(_x9, _x10) {
    return _ref4.apply(this, arguments);
  };
})();

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _string;

function _load_string() {
  return _string = require('nuclide-commons/string');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('../../commons-node/once'));
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

const serverManager = new (_JediServerManager || _load_JediServerManager()).default(); /**
                                                                                        * Copyright (c) 2015-present, Facebook, Inc.
                                                                                        * All rights reserved.
                                                                                        *
                                                                                        * This source code is licensed under the license found in the LICENSE file in
                                                                                        * the root directory of this source tree.
                                                                                        *
                                                                                        * 
                                                                                        * @format
                                                                                        */

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

  getCodeActions(filePath, range, diagnostics) {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('Not implemented');
    })();
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
      const { command, args } = yield getFormatterCommandImpl()(filePath, range);
      const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname((_nuclideUri || _load_nuclideUri()).default.getPath(filePath));

      let stdout;
      try {
        stdout = yield (0, (_process || _load_process()).runCommand)(command, args, {
          cwd: dirName,
          input: contents,
          // At the moment, yapf outputs 3 possible exit codes:
          // 0 - success, no content change.
          // 2 - success, contents changed.
          // 1 - internal failure, most likely due to syntax errors.
          //
          // See: https://github.com/google/yapf/issues/228#issuecomment-198682079
          isExitError: function (exit) {
            return exit.exitCode === 1;
          }
        }).toPromise();
      } catch (err) {
        throw new Error(`"${command}" failed, likely due to syntax errors.`);
      }

      if (contents !== '' && stdout === '') {
        // Throw error if the yapf output is empty, which is almost never desirable.
        throw new Error('Empty output received from yapf.');
      }

      return { formatted: stdout };
    })();
  }

  formatAtPosition(filePath, buffer, position, triggerCharacter) {
    throw new Error('Not Yet Implemented');
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

const getFormatterCommandImpl = (0, (_once || _load_once()).default)(() => {
  try {
    // $FlowFB
    return require('./fb/get-formatter-command').default;
  } catch (e) {
    return (filePath, range) => ({
      command: 'yapf',
      args: ['--lines', `${range.start.row + 1}-${range.end.row + 1}`]
    });
  }
});

let shouldRunFlake8 = true;