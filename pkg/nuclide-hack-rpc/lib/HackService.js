'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (hackCommand, logLevel, fileNotifier) {
    (0, (_hackConfig || _load_hackConfig()).setHackCommand)(hackCommand);
    (_hackConfig || _load_hackConfig()).logger.setLogLevel(logLevel);
    yield (0, (_hackConfig || _load_hackConfig()).getHackCommand)();
    return new HackLanguageServiceImpl(fileNotifier);
  });

  return function initialize(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _range;

function _load_range() {
  return _range = require('../../commons-node/range');
}

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

var _hackConfig;

function _load_hackConfig() {
  return _hackConfig = require('./hack-config');
}

var _HackProcess;

function _load_HackProcess() {
  return _HackProcess = require('./HackProcess');
}

var _Definitions;

function _load_Definitions() {
  return _Definitions = require('./Definitions');
}

var _OutlineView;

function _load_OutlineView() {
  return _OutlineView = require('./OutlineView');
}

var _TypedRegions;

function _load_TypedRegions() {
  return _TypedRegions = require('./TypedRegions');
}

var _FindReferences;

function _load_FindReferences() {
  return _FindReferences = require('./FindReferences');
}

var _Diagnostics;

function _load_Diagnostics() {
  return _Diagnostics = require('./Diagnostics');
}

var _SymbolSearch;

function _load_SymbolSearch() {
  return _SymbolSearch = require('./SymbolSearch');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _EvaluationExpression;

function _load_EvaluationExpression() {
  return _EvaluationExpression = require('./EvaluationExpression');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideHackCommon;

function _load_nuclideHackCommon() {
  return _nuclideHackCommon = require('../../nuclide-hack-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class HackLanguageServiceImpl extends (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService {

  constructor(fileNotifier) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    super(fileNotifier, new HackSingleFileLanguageService(fileNotifier));
    this._resources = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const configObserver = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).ConfigObserver(fileNotifier, (_hackConfig || _load_hackConfig()).HACK_FILE_EXTENSIONS, (_hackConfig || _load_hackConfig()).findHackConfigDir);
    this._resources.add(configObserver, configObserver.observeConfigs().subscribe(configs => {
      (0, (_HackProcess || _load_HackProcess()).ensureProcesses)(fileNotifier, configs);
    }));
    this._resources.add(() => {
      (0, (_HackProcess || _load_HackProcess()).closeProcesses)(fileNotifier);
    });
  }

  getAutocompleteSuggestions(fileVersion, position, activatedManually, prefix) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        const process = yield (0, (_HackProcess || _load_HackProcess()).getHackProcess)(_this._fileCache, fileVersion.filePath);
        return process.getAutocompleteSuggestions(fileVersion, position, activatedManually);
      } catch (e) {
        return null;
      }
    })();
  }

  /**
   * Performs a Hack symbol search in the specified directory.
   */
  executeQuery(rootDirectory, queryString) {
    return (0, (_SymbolSearch || _load_SymbolSearch()).executeQuery)(rootDirectory, queryString);
  }

  dispose() {
    (_hackConfig || _load_hackConfig()).logger.logInfo('Disposing HackLanguageServiceImpl');

    this._resources.dispose();
    super.dispose();
  }
}

class HackSingleFileLanguageService {

  constructor(fileNotifier) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    this._fileCache = fileNotifier;
  }

  getDiagnostics(filePath, buffer) {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('replaced by observeDiagnstics');
    })();
  }

  observeDiagnostics() {
    (_hackConfig || _load_hackConfig()).logger.log('observeDiagnostics');
    return (0, (_HackProcess || _load_HackProcess()).observeConnections)(this._fileCache).mergeMap(connection => {
      (_hackConfig || _load_hackConfig()).logger.log('notifyDiagnostics');
      return (0, (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ensureInvalidations)((_hackConfig || _load_hackConfig()).logger, connection.notifyDiagnostics().refCount().catch(error => {
        (_hackConfig || _load_hackConfig()).logger.logError(`Error: notifyDiagnostics ${error}`);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }).filter(hackDiagnostics => {
        // This is passed over RPC as NuclideUri, which is not allowed
        // to be an empty string. It's better to silently skip a
        // (most likely) useless error, than crash the entire connection.
        // TODO: figure out a better way to display those errors
        return hackDiagnostics.filename !== '';
      }).map(hackDiagnostics => {
        (_hackConfig || _load_hackConfig()).logger.log(`Got hack error in ${hackDiagnostics.filename}`);
        return {
          filePath: hackDiagnostics.filename,
          messages: hackDiagnostics.errors.map(diagnostic => (0, (_Diagnostics || _load_Diagnostics()).hackMessageToDiagnosticMessage)(diagnostic.message))
        };
      }));
    }).catch(error => {
      (_hackConfig || _load_hackConfig()).logger.logError(`Error: observeDiagnostics ${error}`);
      throw error;
    });
  }

  getAutocompleteSuggestions(filePath, buffer, position, activatedManually) {
    return (0, _asyncToGenerator.default)(function* () {
      throw new Error('replaced by persistent connection');
    })();
  }

  getDefinition(filePath, buffer, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();

      const result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-get-definition', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* cwd */filePath);
      if (result == null) {
        return null;
      }
      const projectRoot = result.hackRoot;

      if (!(typeof projectRoot === 'string')) {
        throw new Error('Invariant violation: "typeof projectRoot === \'string\'"');
      }

      const hackDefinitions = Array.isArray(result) ? result : [result];
      return (0, (_Definitions || _load_Definitions()).convertDefinitions)(hackDefinitions, filePath, projectRoot);
    })();
  }

  getDefinitionById(file, id) {
    return (0, _asyncToGenerator.default)(function* () {
      const definition = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--get-definition-by-id', id],
      /* errorStream */false,
      /* processInput */null,
      /* cwd */file);
      if (definition == null) {
        return null;
      }

      const result = {
        path: definition.position.filename,
        position: (0, (_HackHelpers || _load_HackHelpers()).atomPointOfHackRangeStart)(definition.position),
        name: definition.name,
        language: 'php',
        // TODO: range
        projectRoot: definition.hackRoot
      };
      if (typeof definition.id === 'string') {
        return Object.assign({}, result, {
          id: definition.id
        });
      } else {
        return result;
      }
    })();
  }

  findReferences(filePath, buffer, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();

      const result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-find-refs', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* cwd */filePath);
      if (result == null || result.length === 0) {
        return { type: 'error', message: 'No references found.' };
      }

      const projectRoot = result.hackRoot;

      return (0, (_FindReferences || _load_FindReferences()).convertReferences)(result, projectRoot);
    })();
  }

  getCoverage(filePath) {
    return (0, _asyncToGenerator.default)(function* () {
      const result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--colour', filePath],
      /* errorStream */false,
      /* processInput */null,
      /* file */filePath);

      return (0, (_TypedRegions || _load_TypedRegions()).convertCoverage)(filePath, result);
    })();
  }

  getOutline(filePath, buffer) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();

      const result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-outline'],
      /* errorStream */false,
      /* processInput */contents, filePath);
      if (result == null) {
        return null;
      }

      return (0, (_OutlineView || _load_OutlineView()).outlineFromHackIdeOutline)(result);
    })();
  }

  typeHint(filePath, buffer, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();

      const match = getIdentifierAndRange(buffer, position);
      if (match == null) {
        return null;
      }

      const result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--type-at-pos', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);

      if (result == null || result.type == null || result.type === '_') {
        return null;
      } else {
        return {
          hint: result.type,
          // TODO: Use hack range for type hints, not nuclide range.
          range: match.range
        };
      }
    })();
  }

  highlight(filePath, buffer, position) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();

      const id = getIdentifierAtPosition(buffer, position);
      if (id == null) {
        return null;
      }

      const result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-highlight-refs', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);
      return result == null ? null : result.map((_HackHelpers || _load_HackHelpers()).hackRangeToAtomRange);
    })();
  }

  formatSource(filePath, buffer, range) {
    return (0, _asyncToGenerator.default)(function* () {
      const contents = buffer.getText();
      const startOffset = buffer.characterIndexForPosition(range.start) + 1;
      const endOffset = buffer.characterIndexForPosition(range.end) + 1;

      const response = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--format', startOffset, endOffset],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);

      if (response == null) {
        throw new Error('Error formatting hack source.');
      } else if (response.internal_error) {
        throw new Error('Internal error formatting hack source.');
      } else if (response.error_message !== '') {
        throw new Error(`Error formatting hack source: ${response.error_message}`);
      }
      return response.result;
    })();
  }

  formatEntireFile(filePath, buffer, range) {
    throw new Error('Not implemented');
  }

  getEvaluationExpression(filePath, buffer, position) {
    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_EvaluationExpression || _load_EvaluationExpression()).getEvaluationExpression)(filePath, buffer, position);
    })();
  }

  getProjectRoot(fileUri) {
    return (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(fileUri);
  }

  /**
   * @param fileUri a file path.  It cannot be a directory.
   * @return whether the file represented by fileUri is inside of a Hack project.
   */
  isFileInProject(fileUri) {
    return (0, _asyncToGenerator.default)(function* () {
      const hhconfigPath = yield (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(fileUri);
      return hhconfigPath != null;
    })();
  }

  dispose() {}
}

function formatAtomLineColumn(position) {
  return formatLineColumn(position.row + 1, position.column + 1);
}

function formatLineColumn(line, column) {
  return `${line}:${column}`;
}

function getIdentifierAndRange(buffer, position) {
  const matchData = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_WORD_REGEX);
  return matchData == null || matchData.wordMatch.length === 0 ? null : { id: matchData.wordMatch[0], range: matchData.range };
}

function getIdentifierAtPosition(buffer, position) {
  const result = getIdentifierAndRange(buffer, position);
  return result == null ? null : result.id;
}