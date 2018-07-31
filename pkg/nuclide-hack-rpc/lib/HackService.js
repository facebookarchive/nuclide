"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initializeLsp = initializeLsp;
exports.initialize = initialize;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _range() {
  const data = require("../../../modules/nuclide-commons/range");

  _range = function () {
    return data;
  };

  return data;
}

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
    return data;
  };

  return data;
}

function _nuclideVscodeLanguageServiceRpc() {
  const data = require("../../nuclide-vscode-language-service-rpc");

  _nuclideVscodeLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("../../nuclide-hack-common/lib/constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _HackHelpers() {
  const data = require("./HackHelpers");

  _HackHelpers = function () {
    return data;
  };

  return data;
}

function _hackConfig() {
  const data = require("./hack-config");

  _hackConfig = function () {
    return data;
  };

  return data;
}

function _HackProcess() {
  const data = require("./HackProcess");

  _HackProcess = function () {
    return data;
  };

  return data;
}

function _Definitions() {
  const data = require("./Definitions");

  _Definitions = function () {
    return data;
  };

  return data;
}

function _OutlineView() {
  const data = require("./OutlineView");

  _OutlineView = function () {
    return data;
  };

  return data;
}

function _TypedRegions() {
  const data = require("./TypedRegions");

  _TypedRegions = function () {
    return data;
  };

  return data;
}

function _FindReferences() {
  const data = require("./FindReferences");

  _FindReferences = function () {
    return data;
  };

  return data;
}

function _Diagnostics() {
  const data = require("./Diagnostics");

  _Diagnostics = function () {
    return data;
  };

  return data;
}

function _SymbolSearch() {
  const data = require("./SymbolSearch");

  _SymbolSearch = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _nuclideLanguageServiceRpc() {
  const data = require("../../nuclide-language-service-rpc");

  _nuclideLanguageServiceRpc = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _nuclideHackCommon() {
  const data = require("../../nuclide-hack-common");

  _nuclideHackCommon = function () {
    return data;
  };

  return data;
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
 * @format
 */
async function initializeLsp(command, args, projectFileNames, fileExtensions, logLevel, fileNotifier, host, initializationOptions) {
  const cmd = command === '' ? await (0, _hackConfig().getHackCommand)() : command;

  if (cmd === '') {
    return null;
  }

  return (0, _nuclideVscodeLanguageServiceRpc().createMultiLspLanguageService)('hack', cmd, args, {
    logCategory: _hackConfig().HACK_LOGGER_CATEGORY,
    logLevel,
    fileNotifier,
    host,
    initializationOptions,
    projectFileNames,
    fileExtensions,
    additionalLogFilesRetentionPeriod: 5 * 60 * 1000 // 5 minutes

  });
}

async function initialize(hackCommand, logLevel, fileNotifier) {
  (0, _hackConfig().setHackCommand)(hackCommand);

  _hackConfig().logger.setLevel(logLevel);

  await (0, _hackConfig().getHackCommand)();
  return new HackLanguageServiceImpl(fileNotifier);
}

class HackLanguageServiceImpl extends _nuclideLanguageServiceRpc().ServerLanguageService {
  constructor(fileNotifier) {
    if (!(fileNotifier instanceof _nuclideOpenFilesRpc().FileCache)) {
      throw new Error("Invariant violation: \"fileNotifier instanceof FileCache\"");
    }

    super(fileNotifier, new HackSingleFileLanguageService(fileNotifier));
    this._resources = new (_UniversalDisposable().default)();
    const configObserver = new (_nuclideOpenFilesRpc().ConfigObserver)(fileNotifier, _constants().HACK_FILE_EXTENSIONS, _hackConfig().findHackConfigDir);

    this._resources.add(configObserver, configObserver.observeConfigs().subscribe(configs => {
      (0, _HackProcess().ensureProcesses)(fileNotifier, configs);
    }));

    this._resources.add(() => {
      (0, _HackProcess().closeProcesses)(fileNotifier);
    });
  }

  async getAutocompleteSuggestions(fileVersion, position, request) {
    try {
      const process = await (0, _HackProcess().getHackProcess)(this._fileCache, fileVersion.filePath);
      return process.getAutocompleteSuggestions(fileVersion, position, request.activatedManually);
    } catch (e) {
      return null;
    }
  }

  resolveAutocompleteSuggestion(suggestion) {
    return Promise.resolve(null);
  }
  /**
   * Does this service want the symbol-search tab to appear in quick-open?
   */


  async supportsSymbolSearch(directories) {
    const promises = directories.map(directory => (0, _hackConfig().findHackConfigDir)(directory));
    const hackRoots = await Promise.all(promises);
    return (0, _collection().arrayCompact)(hackRoots).length > 0;
  }
  /**
   * Performs a Hack symbol search over all hack projects we manage
   */


  async symbolSearch(queryString, directories) {
    const promises = directories.map(directory => (0, _SymbolSearch().executeQuery)(directory, queryString));
    const results = await Promise.all(promises);
    return (0, _collection().arrayFlatten)(results);
  }

  dispose() {
    _hackConfig().logger.info('Disposing HackLanguageServiceImpl');

    this._resources.dispose();

    super.dispose();
  }

}

class HackSingleFileLanguageService {
  constructor(fileNotifier) {
    if (!(fileNotifier instanceof _nuclideOpenFilesRpc().FileCache)) {
      throw new Error("Invariant violation: \"fileNotifier instanceof FileCache\"");
    }

    this._fileCache = fileNotifier;
  }

  async getDiagnostics(filePath, buffer) {
    throw new Error('replaced by observeDiagnstics');
  }

  async getCodeActions(filePath, range, diagnostics) {
    throw new Error('Not implemented');
  }

  observeDiagnostics() {
    _hackConfig().logger.debug('observeDiagnostics');

    return (0, _HackProcess().observeConnections)(this._fileCache).mergeMap(connection => {
      _hackConfig().logger.debug('notifyDiagnostics');

      return (0, _nuclideLanguageServiceRpc().ensureInvalidations)(_hackConfig().logger, connection.notifyDiagnostics().refCount().catch(error => {
        _hackConfig().logger.error('Error: notifyDiagnostics', error);

        return _RxMin.Observable.empty();
      }).filter(hackDiagnostics => {
        // This is passed over RPC as NuclideUri, which is not allowed
        // to be an empty string. It's better to silently skip a
        // (most likely) useless error, than crash the entire connection.
        // TODO: figure out a better way to display those errors
        return hackDiagnostics.filename !== '';
      }).map(hackDiagnostics => {
        _hackConfig().logger.debug(`Got hack error in ${hackDiagnostics.filename}`);

        return new Map([[hackDiagnostics.filename, hackDiagnostics.errors.map(diagnostic => (0, _Diagnostics().hackMessageToDiagnosticMessage)(diagnostic.message))]]);
      }));
    }).catch(error => {
      _hackConfig().logger.error(`Error: observeDiagnostics ${error}`);

      throw error;
    });
  }

  async getAutocompleteSuggestions(filePath, buffer, position, activatedManually) {
    throw new Error('replaced by persistent connection');
  }

  resolveAutocompleteSuggestion(suggestion) {
    return Promise.resolve(null);
  }

  async getDefinition(filePath, buffer, position) {
    const contents = buffer.getText();
    const result = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--ide-get-definition', formatAtomLineColumn(position)],
    /* errorStream */
    false,
    /* processInput */
    contents,
    /* cwd */
    filePath);

    if (result == null) {
      return null;
    }

    const projectRoot = result.hackRoot;

    if (!(typeof projectRoot === 'string')) {
      throw new Error("Invariant violation: \"typeof projectRoot === 'string'\"");
    }

    const hackDefinitions = Array.isArray(result) ? result : [result];
    return (0, _Definitions().convertDefinitions)(hackDefinitions, filePath, projectRoot);
  }

  findReferences(filePath, buffer, position) {
    return _RxMin.Observable.fromPromise(this._findReferences(filePath, buffer, position));
  }

  async _findReferences(filePath, buffer, position) {
    const contents = buffer.getText();
    const result = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--ide-find-refs', formatAtomLineColumn(position)],
    /* errorStream */
    false,
    /* processInput */
    contents,
    /* cwd */
    filePath);

    if (result == null || result.length === 0) {
      return {
        type: 'error',
        message: 'No references found.'
      };
    }

    const projectRoot = result.hackRoot;
    return (0, _FindReferences().convertReferences)(result, projectRoot);
  }

  rename(filePath, buffer, position, newName) {
    throw new Error('Not implemented');
  }

  async getCoverage(filePath) {
    const result = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--colour', filePath],
    /* errorStream */
    false,
    /* processInput */
    null,
    /* file */
    filePath);
    return (0, _TypedRegions().convertCoverage)(filePath, result);
  }

  async onToggleCoverage(set) {
    return;
  }

  async getOutline(filePath, buffer) {
    const contents = buffer.getText();
    const result = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--ide-outline'],
    /* errorStream */
    false,
    /* processInput */
    contents, filePath);

    if (result == null) {
      return null;
    }

    return (0, _OutlineView().outlineFromHackIdeOutline)(result);
  }

  async typeHint(filePath, buffer, position) {
    const contents = buffer.getText();
    const match = getIdentifierAndRange(buffer, position);

    if (match == null) {
      return null;
    }

    const result = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--type-at-pos', formatAtomLineColumn(position)],
    /* errorStream */
    false,
    /* processInput */
    contents,
    /* file */
    filePath);

    if (result == null || result.type == null || result.type === '_') {
      return null;
    } else {
      // TODO: Use hack range for type hints, not nuclide range.
      return (0, _nuclideLanguageServiceRpc().typeHintFromSnippet)(result.type, match.range);
    }
  }

  async highlight(filePath, buffer, position) {
    const contents = buffer.getText();
    const id = getIdentifierAtPosition(buffer, position);

    if (id == null) {
      return null;
    }

    const result = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--ide-highlight-refs', formatAtomLineColumn(position)],
    /* errorStream */
    false,
    /* processInput */
    contents,
    /* file */
    filePath);
    return result == null ? null : result.map(_HackHelpers().hackRangeToAtomRange);
  }

  async formatSource(filePath, buffer, range, options) {
    const contents = buffer.getText();
    const startOffset = buffer.characterIndexForPosition(range.start) + 1;
    const endOffset = buffer.characterIndexForPosition(range.end) + 1;
    const response = await (0, _HackHelpers().callHHClient)(
    /* args */
    ['--format', startOffset, endOffset],
    /* errorStream */
    false,
    /* processInput */
    contents,
    /* file */
    filePath);

    if (response == null) {
      throw new Error('Error formatting hack source.');
    } else if (response.internal_error) {
      throw new Error('Internal error formatting hack source.');
    } else if (response.error_message !== '') {
      throw new Error(`Error formatting hack source: ${response.error_message}`);
    }

    return [{
      oldRange: range,
      newText: response.result
    }];
  }

  formatEntireFile(filePath, buffer, range, options) {
    throw new Error('Not implemented');
  }

  formatAtPosition(filePath, buffer, position, triggerCharacter, options) {
    throw new Error('Not implemented');
  }

  signatureHelp(filePath, buffer, position) {
    throw new Error('Not implemented');
  }

  getProjectRoot(fileUri) {
    return (0, _hackConfig().findHackConfigDir)(fileUri);
  }
  /**
   * @param fileUri a file path.  It cannot be a directory.
   * @return whether the file represented by fileUri is inside of a Hack project.
   */


  async isFileInProject(fileUri) {
    const hhconfigPath = await (0, _hackConfig().findHackConfigDir)(fileUri);
    return hhconfigPath != null;
  }

  getExpandedSelectionRange(filePath, buffer, currentSelection) {
    throw new Error('Not implemented');
  }

  getCollapsedSelectionRange(filePath, buffer, currentSelection, originalCursorPosition) {
    throw new Error('Not implemented');
  }

  dispose() {}

} // Assert that HackSingleFileLanguageService satisifes the SingleFileLanguageService interface:


null;

function formatAtomLineColumn(position) {
  return formatLineColumn(position.row + 1, position.column + 1);
}

function formatLineColumn(line, column) {
  return `${line}:${column}`;
}

function getIdentifierAndRange(buffer, position) {
  const matchData = (0, _range().wordAtPositionFromBuffer)(buffer, position, _nuclideHackCommon().HACK_WORD_REGEX);
  return matchData == null || matchData.wordMatch.length === 0 ? null : {
    id: matchData.wordMatch[0],
    range: matchData.range
  };
}

function getIdentifierAtPosition(buffer, position) {
  const result = getIdentifierAndRange(buffer, position);
  return result == null ? null : result.id;
}