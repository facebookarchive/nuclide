'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = initialize;
exports._getReferences = _getReferences;
exports.getDiagnostics = getDiagnostics;
exports.getBuildableTargets = getBuildableTargets;
exports.reset = reset;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _process;

function _load_process() {
  return _process = require('../../../modules/nuclide-commons/process');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _range;

function _load_range() {
  return _range = require('../../../modules/nuclide-commons/range');
}

var _string;

function _load_string() {
  return _string = require('../../../modules/nuclide-commons/string');
}

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _once;

function _load_once() {
  return _once = _interopRequireDefault(require('../../commons-node/once'));
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
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
                                                                                        *  strict-local
                                                                                        * @format
                                                                                        */

async function initialize(fileNotifier, config) {
  return new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService(fileNotifier, new PythonSingleFileLanguageService(fileNotifier, config));
}

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

  async getCodeActions(filePath, range, diagnostics) {
    throw new Error('Not implemented');
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

  resolveAutocompleteSuggestion(suggestion) {
    return Promise.resolve(null);
  }

  getDefinition(filePath, buffer, position) {
    return (0, (_DefinitionHelpers || _load_DefinitionHelpers()).getDefinition)(serverManager, filePath, buffer, position);
  }

  findReferences(filePath, buffer, position) {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(this._findReferences(filePath, buffer, position));
  }

  async _findReferences(filePath, buffer, position) {
    const result = await _getReferences(serverManager, filePath, buffer.getText(), position.row, position.column);

    if (!result || result.length === 0) {
      return { type: 'error', message: 'No usages were found.' };
    }

    const symbolName = result[0].text;

    // Process this into the format nuclide-find-references expects.
    const references = result.map(ref => {
      return {
        uri: ref.file,
        name: ref.parentName,
        range: new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(ref.line, ref.column), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(ref.line, ref.column + ref.text.length))
      };
    });

    // Choose the project root as baseUri, or if no project exists,
    // use the dirname of the src file.
    const baseUri = this._fileCache.getContainingDirectory(filePath) || (_nuclideUri || _load_nuclideUri()).default.dirname(filePath);

    return {
      type: 'data',
      baseUri,
      referencedSymbolName: symbolName,
      references
    };
  }

  getCoverage(filePath) {
    throw new Error('Not Yet Implemented');
  }

  async getOutline(filePath, buffer) {
    const service = await serverManager.getJediService();
    const items = await service.get_outline(filePath, buffer.getText());

    if (items == null) {
      return null;
    }

    const mode = this._showGlobalVariables ? 'all' : 'constants';
    return {
      outlineTrees: (0, (_outline || _load_outline()).itemsToOutline)(mode, items)
    };
  }

  async typeHint(filePath, buffer, position) {
    const word = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_constants || _load_constants()).IDENTIFIER_REGEXP);
    if (word == null) {
      return null;
    }
    const service = await serverManager.getJediService();
    const result = await service.get_hover(filePath, buffer.getText(), serverManager.getSysPath(filePath), word.wordMatch[0], position.row, position.column);
    if (result == null) {
      return null;
    }
    return {
      hint: [{
        type: 'markdown',
        value: result
      }],
      range: word.range
    };
  }

  async onToggleCoverage(set) {
    return;
  }

  highlight(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  formatSource(filePath, buffer, range) {
    throw new Error('Not Yet Implemented');
  }

  async formatEntireFile(filePath, buffer, range) {
    const contents = buffer.getText();
    const { command, args } = await getFormatterCommandImpl()(filePath, range);
    const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname((_nuclideUri || _load_nuclideUri()).default.getPath(filePath));

    let stdout;
    try {
      stdout = await (0, (_process || _load_process()).runCommand)(command, args, {
        cwd: dirName,
        input: contents,
        // At the moment, yapf outputs 3 possible exit codes:
        // 0 - success, no content change.
        // 2 - success, contents changed.
        // 1 - internal failure, most likely due to syntax errors.
        //
        // See: https://github.com/google/yapf/issues/228#issuecomment-198682079
        isExitError: exit => exit.exitCode === 1
      }).toPromise();
    } catch (err) {
      throw new Error(`"${command}" failed, likely due to syntax errors.`);
    }

    if (contents !== '' && stdout === '') {
      // Throw error if the yapf output is empty, which is almost never desirable.
      throw new Error('Empty output received from yapf.');
    }

    return { formatted: stdout };
  }

  formatAtPosition(filePath, buffer, position, triggerCharacter) {
    throw new Error('Not Yet Implemented');
  }

  async signatureHelp(filePath, buffer, position) {
    const service = await serverManager.getJediService();
    return service.get_signature_help(filePath, buffer.getText(), serverManager.getSysPath(filePath), position.row, position.column);
  }

  getProjectRoot(fileUri) {
    throw new Error('Not Yet Implemented');
  }

  isFileInProject(fileUri) {
    throw new Error('Not Yet Implemented');
  }

  getExpandedSelectionRange(filePath, buffer, currentSelection) {
    throw new Error('Not Yet Implemented');
  }

  getCollapsedSelectionRange(filePath, buffer, currentSelection, originalCursorPosition) {
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

// Exported for testing.
async function _getReferences(manager, src, contents, line, column) {
  const service = await manager.getJediService();
  return service.get_references(src, contents, manager.getSysPath(src), line, column);
}

// Set to false if flake8 isn't found, so we don't repeatedly fail.
let shouldRunFlake8 = true;

async function getDiagnostics(src) {
  if (!shouldRunFlake8) {
    return [];
  }

  let result;
  try {
    result = await runLinterCommand(src);
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
}

async function runLinterCommand(src) {
  const dirName = (_nuclideUri || _load_nuclideUri()).default.dirname(src);

  let result;
  let runFlake8;
  try {
    // $FlowFB
    runFlake8 = require('./fb/run-flake8').default;
  } catch (e) {
    // Ignore.
  }

  if (runFlake8 != null) {
    result = await runFlake8(src);
    if (result != null) {
      return result;
    }
  }

  const command = global.atom && atom.config.get('nuclide.nuclide-python.pathToFlake8') || 'flake8';

  if (!(typeof command === 'string')) {
    throw new Error('Invariant violation: "typeof command === \'string\'"');
  }

  return (0, (_process || _load_process()).runCommand)(command, [src], {
    cwd: dirName,
    // 1 indicates unclean lint result (i.e. has errors/warnings).
    isExitError: exit => exit.exitCode == null || exit.exitCode > 1
  }).toPromise();
}

/**
 * Retrieves a list of buildable targets to obtain link trees for a given file.
 * (This won't return anything if a link tree is already available.)
 */
async function getBuildableTargets(src) {
  const linkTreeManager = serverManager._linkTreeManager;
  const linkTrees = await linkTreeManager.getLinkTreePaths(src);
  if (linkTrees.length === 0) {
    return [];
  }
  if (await (0, (_promise || _load_promise()).asyncSome)(linkTrees, (_fsPromise || _load_fsPromise()).default.exists)) {
    return [];
  }
  const buckRoot = await linkTreeManager.getBuckRoot(src);
  const owner = await linkTreeManager.getOwner(src);
  if (buckRoot == null || owner == null) {
    return [];
  }
  const dependents = await linkTreeManager.getDependents(buckRoot, owner);
  return Array.from(dependents.keys());
}

function reset() {
  serverManager.reset();
}