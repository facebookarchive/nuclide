'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowSingleProjectLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.processAutocompleteItem = processAutocompleteItem;
exports.groupParamNames = groupParamNames;
exports.emptyDiagnosticsState = emptyDiagnosticsState;
exports.updateDiagnostics = updateDiagnostics;
exports.getDiagnosticUpdates = getDiagnosticUpdates;

var _range;

function _load_range() {
  return _range = require('nuclide-commons/range');
}

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _collection;

function _load_collection() {
  return _collection = require('nuclide-commons/collection');
}

var _nuclideFlowCommon;

function _load_nuclideFlowCommon() {
  return _nuclideFlowCommon = require('../../nuclide-flow-common');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _FlowProcess;

function _load_FlowProcess() {
  return _FlowProcess = require('./FlowProcess');
}

var _FlowVersion;

function _load_FlowVersion() {
  return _FlowVersion = require('./FlowVersion');
}

var _prettyPrintTypes;

function _load_prettyPrintTypes() {
  return _prettyPrintTypes = _interopRequireDefault(require('./prettyPrintTypes'));
}

var _astToOutline;

function _load_astToOutline() {
  return _astToOutline = require('./astToOutline');
}

var _diagnosticsParser;

function _load_diagnosticsParser() {
  return _diagnosticsParser = require('./diagnosticsParser');
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

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc');

/** Encapsulates all of the state information we need about a specific Flow root */
class FlowSingleProjectLanguageService {
  // The path to the directory where the .flowconfig is -- i.e. the root of the Flow project.
  constructor(root, execInfoContainer, fileCache) {
    this._root = root;
    this._execInfoContainer = execInfoContainer;
    this._process = new (_FlowProcess || _load_FlowProcess()).FlowProcess(root, execInfoContainer, fileCache);
    this._version = new (_FlowVersion || _load_FlowVersion()).FlowVersion((0, _asyncToGenerator.default)(function* () {
      const execInfo = yield execInfoContainer.getFlowExecInfo(root);
      if (!execInfo) {
        return null;
      }
      return execInfo.flowVersion;
    }));
    this._process.getServerStatusUpdates().filter(state => state === 'not running').subscribe(() => this._version.invalidateVersion());
  }

  dispose() {
    this._process.dispose();
  }

  allowServerRestart() {
    this._process.allowServerRestart();
  }

  getPathToRoot() {
    return this._root;
  }

  getProjectRoot(fileUri) {
    // TODO Consider an invariant to assert that fileUri is inside this root. However, that should
    // never happen since this will be enclosed by MultiProjectLanguageService which will dispatch
    // to the correct instance of this class.
    return Promise.resolve(this._root);
  }

  getServerStatusUpdates() {
    return this._process.getServerStatusUpdates();
  }

  getDefinition(filePath, buffer, position) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const match = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, (_nuclideFlowCommon || _load_nuclideFlowCommon()).JAVASCRIPT_WORD_REGEX);
      if (match == null) {
        return null;
      }
      const line = position.row + 1;
      const column = position.column + 1;
      const options = {};
      // We pass the current contents of the buffer to Flow via stdin.
      // This makes it possible for get-def to operate on the unsaved content in
      // the user's editor rather than what is saved on disk. It would be annoying
      // if the user had to save before using the jump-to-definition feature to
      // ensure he or she got accurate results.
      options.input = buffer.getText();

      const args = ['get-def', '--json', '--path', filePath, line, column];
      try {
        const result = yield _this._process.execFlow(args, options);
        if (!result) {
          return null;
        }
        const json = parseJSON(args, result.stdout);
        if (json.path) {
          const loc = {
            file: json.path,
            point: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(json.line - 1, json.start - 1)
          };
          return {
            queryRange: [match.range],
            definitions: [{
              path: loc.file,
              position: loc.point,
              language: 'Flow'
            }]
          };
        } else {
          return null;
        }
      } catch (e) {
        return null;
      }
    })();
  }

  highlight(filePath, buffer, position) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // `flow find-refs` came out in v0.38.0
      // https://github.com/facebook/flow/releases/tag/v0.38.0
      const isSupported = yield _this2._version.satisfies('>=0.38.0');
      if (!isSupported) {
        return null;
      }

      const options = { input: buffer.getText() };
      const args = ['find-refs', '--json', '--path', filePath, position.row + 1, position.column + 1];
      try {
        const result = yield _this2._process.execFlow(args, options);
        if (result == null) {
          return null;
        }
        const json = parseJSON(args, result.stdout);
        if (!Array.isArray(json)) {
          return null;
        }
        return json.map(function (loc) {
          return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(loc.start.line - 1, loc.start.column - 1), new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(loc.end.line - 1, loc.end.column));
        });
      } catch (e) {
        logger.error(`flowFindRefs error: ${String(e)}`);
        return null;
      }
    })();
  }

  /**
   * If currentContents is null, it means that the file has not changed since
   * it has been saved, so we can avoid piping the whole contents to the Flow
   * process.
   */
  getDiagnostics(filePath, buffer) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this3._forceRecheck(filePath);

      const options = {};

      const args = ['status', '--json', filePath];

      let result;

      try {
        // Don't log errors if the command returns a nonzero exit code, because status returns nonzero
        // if it is reporting any issues, even when it succeeds.
        result = yield _this3._process.execFlow(args, options,
        /* waitForServer */true);
        if (!result) {
          return null;
        }
      } catch (e) {
        // This codepath will be exercised when Flow finds type errors as the
        // exit code will be non-zero. Note this codepath could also be exercised
        // due to a logical error in Nuclide, so we try to differentiate.
        if (e.exitCode !== undefined) {
          result = e;
        } else {
          logger.error(e);
          return null;
        }
      }

      let json;
      try {
        json = parseJSON(args, result.stdout);
      } catch (e) {
        return null;
      }

      const diagnostics = (0, (_diagnosticsParser || _load_diagnosticsParser()).flowStatusOutputToDiagnostics)(json);

      const filePathToMessages = new Map();

      for (const diagnostic of diagnostics) {
        const path = diagnostic.filePath;
        let diagnosticArray = filePathToMessages.get(path);
        if (!diagnosticArray) {
          diagnosticArray = [];
          filePathToMessages.set(path, diagnosticArray);
        }
        diagnosticArray.push(diagnostic);
      }

      return {
        filePathToMessages
      };
    })();
  }

  observeDiagnostics() {
    const ideConnections = this._process.getIDEConnections();
    return ideConnections.switchMap(ideConnection => {
      if (ideConnection != null) {
        return ideConnection.observeDiagnostics();
      } else {
        // if ideConnection is null, it means there is currently no connection. So, invalidate the
        // current diagnostics so we don't display stale data.
        return _rxjsBundlesRxMinJs.Observable.of(null);
      }
    }).scan(updateDiagnostics, emptyDiagnosticsState()).concatMap(getDiagnosticUpdates).catch(err => {
      logger.error(err);
      throw err;
    });
  }

  getAutocompleteSuggestions(filePath, buffer, position, activatedManually, prefix) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const replacementPrefix = (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).getReplacementPrefix)(prefix);
      // We may want to make this configurable, but if it is ever higher than one we need to make sure
      // it works properly when the user manually activates it (e.g. with ctrl+space). See
      // https://github.com/atom/autocomplete-plus/issues/597
      //
      // If this is made configurable, consider using autocomplete-plus' minimumWordLength setting, as
      // per https://github.com/atom/autocomplete-plus/issues/594
      const minimumPrefixLength = 1;

      // Allows completions to immediately appear when we are completing off of object properties.
      // This also needs to be changed if minimumPrefixLength goes above 1, since after you type a
      // single alphanumeric character, autocomplete-plus no longer includes the dot in the prefix.
      const prefixHasDot =
      // charAt(index) returns an empty string if the index is out of bounds
      buffer.lineForRow(position.row).charAt(position.column - 1) === '.' || prefix.indexOf('.') !== -1;

      if (!activatedManually && !prefixHasDot && replacementPrefix.length < minimumPrefixLength) {
        return null;
      }

      // Note that Atom coordinates are 0-indexed whereas Flow's are 1-indexed, so we must add 1.
      const line = position.row + 1;
      const column = position.column + 1;
      const contents = buffer.getText();
      try {
        let json;
        const ideConnection = _this4._process.getCurrentIDEConnection();
        if (ideConnection != null && (yield _this4._version.satisfies('>=0.48.0'))) {
          json = yield ideConnection.getAutocompleteSuggestions(filePath, line, column, contents);
        } else {
          const args = ['autocomplete', '--json', filePath, line, column];
          const options = { input: contents };

          const result = yield _this4._process.execFlow(args, options);
          if (!result) {
            return { isIncomplete: false, items: [] };
          }
          json = parseJSON(args, result.stdout);
        }
        const resultsArray = json.result;
        const completions = resultsArray.map(function (item) {
          return processAutocompleteItem(replacementPrefix, item);
        });
        return (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).filterResultsByPrefix)(prefix, {
          isIncomplete: false,
          items: completions
        });
      } catch (e) {
        return { isIncomplete: false, items: [] };
      }
    })();
  }

  typeHint(filePath, buffer, position) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // Do not show typehints for whitespace.
      const character = buffer.getTextInRange([position, {
        row: position.row,
        column: position.column + 1
      }]);
      if (character.match(/\s/)) {
        return null;
      }

      const options = {};

      options.input = buffer.getText();

      const line = position.row + 1;
      const column = position.column + 1;
      const args = ['type-at-pos', '--json', '--path', filePath, line, column];

      let result;
      try {
        result = yield _this5._process.execFlow(args, options);
      } catch (e) {
        result = null;
      }
      if (!result) {
        return null;
      }
      const output = result.stdout;

      let json;
      try {
        json = parseJSON(args, output);
      } catch (e) {
        return null;
      }
      const type = json.type;
      const range = (0, (_nuclideFlowCommon || _load_nuclideFlowCommon()).flowCoordsToAtomCoords)(json.loc);
      if (!type || type === '(unknown)') {
        return null;
      }
      let typeString;
      try {
        typeString = (0, (_prettyPrintTypes || _load_prettyPrintTypes()).default)(type);
      } catch (e) {
        logger.error(`Problem pretty printing type hint: ${e.message}`);
        typeString = type;
      }
      return {
        hint: typeString,
        range
      };
    })();
  }

  getCoverage(filePath) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const args = ['coverage', '--json', filePath];
      let result;
      try {
        result = yield _this6._process.execFlow(args, {});
      } catch (e) {
        return null;
      }
      if (result == null) {
        return null;
      }
      let json;
      try {
        json = parseJSON(args, result.stdout);
      } catch (e) {
        // The error is already logged in parseJSON
        return null;
      }

      const expressions = json.expressions;

      const uncoveredCount = expressions.uncovered_count;
      const coveredCount = expressions.covered_count;
      const totalCount = uncoveredCount + coveredCount;

      const uncoveredRegions = expressions.uncovered_locs.map((_nuclideFlowCommon || _load_nuclideFlowCommon()).flowCoordsToAtomCoords).map(function (range) {
        return { range };
      });

      return {
        percentage: totalCount === 0 ? 100 : coveredCount / totalCount * 100,
        uncoveredRegions
      };
    })();
  }

  _forceRecheck(file) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        yield _this7._process.execFlow(['force-recheck', file],
        /* options */{},
        // Make an attempt to force a recheck, but if the server is busy don't insist.
        /* waitsForServer */false,
        /* suppressErrors */true);
        return true;
      } catch (e) {
        // This command was introduced in Flow v0.23, so silently swallow errors to avoid logspam on
        // earlier versions, until we want to break support for earlier version.
        return false;
      }
    })();
  }

  getOutline(filePath, buffer) {
    return FlowSingleProjectLanguageService.getOutline(filePath, buffer, this, this._execInfoContainer);
  }

  // This static function takes an optional FlowRoot instance so that *if* it is part of a Flow
  // root, it can use the appropriate flow-bin installation (which may be the only Flow
  // installation) but if it lives outside of a Flow root, outlining still works using the system
  // Flow.
  static getOutline(filePath, buffer, root, execInfoContainer) {
    return (0, _asyncToGenerator.default)(function* () {
      const json = yield FlowSingleProjectLanguageService.flowGetAst(root, buffer.getText(), execInfoContainer);

      try {
        return json ? (0, (_astToOutline || _load_astToOutline()).astToOutline)(json) : null;
      } catch (e) {
        // Traversing the AST is an error-prone process and it's hard to be sure we've handled all the
        // cases. Fail gracefully if it does not work.
        logger.error(e);
        return null;
      }
    })();
  }

  static flowGetAst(root, currentContents, execInfoContainer) {
    return (0, _asyncToGenerator.default)(function* () {
      const options = {
        input: currentContents
      };

      const flowRootPath = root == null ? null : root.getPathToRoot();

      const args = ['ast'];

      let json;
      try {
        const result = yield (_FlowProcess || _load_FlowProcess()).FlowProcess.execFlowClient(args, flowRootPath, execInfoContainer, options);
        if (result == null) {
          return null;
        }
        json = parseJSON(args, result.stdout);
      } catch (e) {
        logger.warn(e);
        return null;
      }
      return json;
    })();
  }

  getCodeActions(filePath, range, diagnostics) {
    throw new Error('Not implemeneted');
  }

  formatSource(filePath, buffer, range) {
    throw new Error('Not Yet Implemented');
  }

  formatEntireFile(filePath, buffer, range) {
    throw new Error('Not implemented');
  }

  formatAtPosition(filePath, buffer, position, triggerCharacter) {
    throw new Error('Not Yet Implemented');
  }

  findReferences(filePath, buffer, position) {
    throw new Error('Not Yet Implemented');
  }

  getEvaluationExpression(filePath, buffer, position) {
    throw new Error('Not implemented');
  }

  isFileInProject(fileUri) {
    throw new Error('Not Yet Implemented');
  }
}

exports.FlowSingleProjectLanguageService = FlowSingleProjectLanguageService; // FlowSingleProjectLanguageService should satisfy the SingleFileLanguageService interface

null;

function parseJSON(args, value) {
  try {
    return JSON.parse(value);
  } catch (e) {
    logger.warn(`Invalid JSON result from flow ${args.join(' ')}. JSON:\n'${value}'.`);
    throw e;
  }
}

/**
 * Takes an autocomplete item from Flow and returns a valid autocomplete-plus
 * response, as documented here:
 * https://github.com/atom/autocomplete-plus/wiki/Provider-API
 */
function processAutocompleteItem(replacementPrefix, flowItem) {
  // Truncate long types for readability
  const description = flowItem.type.length < 80 ? flowItem.type : flowItem.type.substring(0, 80) + ' ...';
  let result = {
    description,
    displayText: flowItem.name,
    replacementPrefix
  };
  const funcDetails = flowItem.func_details;
  if (funcDetails) {
    // The parameters in human-readable form for use on the right label.
    const rightParamStrings = funcDetails.params.map(param => `${param.name}: ${param.type}`);
    let snippetArgs = `(${getSnippetString(funcDetails.params.map(param => param.name))})`;
    let leftLabel = funcDetails.return_type;
    let rightLabel = `(${rightParamStrings.join(', ')})`;
    if (!(0, (_config || _load_config()).getConfig)('functionSnippetShouldIncludeArguments')) {
      snippetArgs = '';
      leftLabel = undefined;
      rightLabel += ` => ${funcDetails.return_type}`;
    }
    result = Object.assign({}, result, {
      leftLabel,
      rightLabel,
      snippet: `${flowItem.name}${snippetArgs}`,
      type: 'function'
    });
  } else {
    result = Object.assign({}, result, {
      rightLabel: flowItem.type,
      text: flowItem.name
    });
  }
  return result;
}

function getSnippetString(paramNames) {
  const groupedParams = groupParamNames(paramNames);
  // The parameters turned into snippet strings.
  const snippetParamStrings = groupedParams.map(params => params.join(', ')).map((param, i) => `\${${i + 1}:${param}}`);
  return snippetParamStrings.join(', ');
}

/**
 * Group the parameter names so that all of the trailing optional parameters are together with the
 * last non-optional parameter. That makes it easy to ignore the optional parameters, since they
 * will be selected along with the last non-optional parameter and you can just type to overwrite
 * them.
 */
// Exported for testing
function groupParamNames(paramNames) {
  // Split the parameters into two groups -- all of the trailing optional paramaters, and the rest
  // of the parameters. Trailing optional means all optional parameters that have only optional
  const [ordinaryParams, trailingOptional] = paramNames.reduceRight(([ordinary, optional], param) => {
    // If there have only been optional params so far, and this one is optional, add it to the
    // list of trailing optional params.
    if (isOptional(param) && ordinary.length === 0) {
      optional.unshift(param);
    } else {
      ordinary.unshift(param);
    }
    return [ordinary, optional];
  }, [[], []]);

  const groupedParams = ordinaryParams.map(param => [param]);
  const lastParam = groupedParams[groupedParams.length - 1];
  if (lastParam != null) {
    lastParam.push(...trailingOptional);
  } else if (trailingOptional.length > 0) {
    groupedParams.push(trailingOptional);
  }

  return groupedParams;
}

function isOptional(param) {
  if (!(param.length > 0)) {
    throw new Error('Invariant violation: "param.length > 0"');
  }

  const lastChar = param[param.length - 1];
  return lastChar === '?';
}

// This should be immutable, but lacking good immutable data structure implementations, we are just
// going to mutate it
// Exported only for testing


// Exported only for testing
function emptyDiagnosticsState() {
  return {
    isInRecheck: false,
    staleMessages: new Map(),
    currentMessages: new Map(),
    filesToUpdate: new Set()
  };
}

// Exported only for testing
function updateDiagnostics(state,
// null means we have received a null ide connection (meaning the previous one has gone away)
msg) {
  if (msg == null) {
    return {
      isInRecheck: false,
      staleMessages: new Map(),
      currentMessages: new Map(),
      filesToUpdate: (0, (_collection || _load_collection()).setUnion)(new Set(state.staleMessages.keys()), new Set(state.currentMessages.keys()))
    };
  }
  switch (msg.kind) {
    case 'errors':
      const newErrors = collateDiagnostics(msg.errors);
      if (state.isInRecheck) {
        // Yes we are going to mutate this :(
        const { currentMessages } = state;
        for (const [file, newMessages] of newErrors) {
          let messages = currentMessages.get(file);
          if (messages == null) {
            messages = [];
            currentMessages.set(file, messages);
          }
          messages.push(...newMessages);
        }
        return {
          isInRecheck: state.isInRecheck,
          staleMessages: state.staleMessages,
          currentMessages,
          filesToUpdate: new Set(newErrors.keys())
        };
      } else {
        // Update the files that now have errors, and those that had errors the last time (we need
        // to make sure to remove errors that no longer exist).
        const filesToUpdate = (0, (_collection || _load_collection()).setUnion)(new Set(newErrors.keys()), new Set(state.currentMessages.keys()));
        return {
          isInRecheck: state.isInRecheck,
          staleMessages: state.staleMessages,
          currentMessages: newErrors,
          filesToUpdate
        };
      }
    case 'start-recheck':
      const staleMessages = new Map();
      for (const [file, oldMessages] of state.currentMessages.entries()) {
        const messages = oldMessages.map(message => Object.assign({}, message, {
          stale: true
        }));
        staleMessages.set(file, messages);
      }
      return {
        isInRecheck: true,
        staleMessages,
        currentMessages: new Map(),
        filesToUpdate: new Set(state.currentMessages.keys())
      };
    case 'end-recheck':
      return {
        isInRecheck: false,
        staleMessages: new Map(),
        currentMessages: state.currentMessages,
        filesToUpdate: new Set(state.staleMessages.keys())
      };
    default:
      // Enforce exhaustiveness
      msg.kind;
      throw new Error(`Unknown message kind ${msg.kind}`);
  }
}

// Exported only for testing
function getDiagnosticUpdates(state) {
  const updates = [];
  for (const file of state.filesToUpdate) {
    const messages = [...(0, (_collection || _load_collection()).mapGetWithDefault)(state.staleMessages, file, []), ...(0, (_collection || _load_collection()).mapGetWithDefault)(state.currentMessages, file, [])];
    updates.push({ filePath: file, messages });
  }
  return _rxjsBundlesRxMinJs.Observable.of(updates);
}

function collateDiagnostics(output) {
  const diagnostics = (0, (_diagnosticsParser || _load_diagnosticsParser()).flowStatusOutputToDiagnostics)(output);
  const filePathToMessages = new Map();

  for (const diagnostic of diagnostics) {
    const path = diagnostic.filePath;
    let diagnosticArray = filePathToMessages.get(path);
    if (!diagnosticArray) {
      diagnosticArray = [];
      filePathToMessages.set(path, diagnosticArray);
    }
    diagnosticArray.push(diagnostic);
  }
  return filePathToMessages;
}