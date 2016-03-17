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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.processCompletions = processCompletions;
exports.markFileForCompletion = markFileForCompletion;
exports.processDefinitionsForXhp = processDefinitionsForXhp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TypedRegions = require('./TypedRegions');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

var _utils = require('./utils');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideCommons = require('../../nuclide-commons');

var _atom = require('atom');

var _HackWorker = require('./HackWorker');

var _HackWorker2 = _interopRequireDefault(_HackWorker);

var _nuclideHackCommon = require('../../nuclide-hack-common');

// The word char regex include \ to search for namespaced classes.
var wordCharRegex = /[\w\\]/;
// The xhp char regex include : and - to match xhp tags like <ui:button-group>.
var xhpCharRegex = /[\w:-]/;
var XHP_LINE_TEXT_REGEX = /<([a-z][a-z0-9_.:-]*)[^>]*\/?>/gi;

var UPDATE_DEPENDENCIES_INTERVAL_MS = 10000;
var DEPENDENCIES_LOADED_EVENT = 'dependencies-loaded';
var MAX_HACK_WORKER_TEXT_SIZE = 10000;

/**
 * The HackLanguage is the controller that servers language requests by trying to get worker results
 * and/or results from HackService (which would be executing hh_client on a supporting server)
 * and combining and/or selecting the results to give back to the requester.
 */

var LocalHackLanguage = (function () {

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   * It should only be null if client is null.
   */

  function LocalHackLanguage(hhAvailable, basePath, initialFileUri) {
    _classCallCheck(this, LocalHackLanguage);

    this._hhAvailable = hhAvailable;
    this._hackWorker = new _HackWorker2['default']();
    this._pathContentsMap = new Map();
    this._basePath = basePath;
    this._initialFileUri = initialFileUri;
    this._isFinishedLoadingDependencies = true;
    this._emitter = new _atom.Emitter();

    if (this._hhAvailable) {
      this._setupUpdateDependenciesInterval();
    }
  }

  _createClass(LocalHackLanguage, [{
    key: '_setupUpdateDependenciesInterval',
    value: function _setupUpdateDependenciesInterval() {
      var _this = this;

      // Fetch any dependencies the HackWorker needs after learning about this file.
      // We don't block any realtime logic on the dependency fetching - it could take a while.
      var pendingUpdateDependencies = false;

      var finishUpdateDependencies = function finishUpdateDependencies() {
        pendingUpdateDependencies = false;
      };

      this._updateDependenciesInterval = setInterval(function () {
        if (pendingUpdateDependencies) {
          return;
        }
        pendingUpdateDependencies = true;
        _this.updateDependencies().then(finishUpdateDependencies, finishUpdateDependencies);
      }, UPDATE_DEPENDENCIES_INTERVAL_MS);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._hackWorker.dispose();
      clearInterval(this._updateDependenciesInterval);
    }
  }, {
    key: 'getCompletions',
    value: _asyncToGenerator(function* (filePath, contents, offset) {
      var markedContents = markFileForCompletion(contents, offset);
      var localPath = (0, _nuclideRemoteUri.getPath)(filePath);
      yield this.updateFile(localPath, markedContents);
      var webWorkerMessage = { cmd: 'hh_auto_complete', args: [localPath] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      var completionType = getCompletionType(response.completion_type);
      var completions = response.completions;

      if (shouldDoServerCompletion(completionType) || !completions.length) {
        var _getHackService = (0, _utils.getHackService)(filePath);

        var getCompletions = _getHackService.getCompletions;

        var completionsResult = yield getCompletions(filePath, markedContents);
        if (completionsResult) {
          completions = completionsResult.completions;
        }
      }
      return processCompletions(completions);
    })
  }, {
    key: 'updateFile',
    value: _asyncToGenerator(function* (path, contents) {
      if (contents !== this._pathContentsMap.get(path)) {
        this._pathContentsMap.set(path, contents);
        var webWorkerMessage = { cmd: 'hh_add_file', args: [path, contents] };
        this._isFinishedLoadingDependencies = false;
        return yield this._hackWorker.runWorkerTask(webWorkerMessage);
      }
    })
  }, {
    key: 'updateDependencies',
    value: _asyncToGenerator(function* () {
      var webWorkerMessage = { cmd: 'hh_get_deps', args: [] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      if (!response.deps.length) {
        if (!this._isFinishedLoadingDependencies) {
          this._emitter.emit(DEPENDENCIES_LOADED_EVENT);
        }
        this._isFinishedLoadingDependencies = true;
        return;
      }

      this._isFinishedLoadingDependencies = false;

      var _getHackService2 = (0, _utils.getHackService)(this._initialFileUri);

      var getDependencies = _getHackService2.getDependencies;

      var dependenciesResult = yield getDependencies(this._initialFileUri, response.deps);
      if (!dependenciesResult) {
        return;
      }
      var dependencies = dependenciesResult.dependencies;

      // Serially update depednecies not to block the worker from serving other feature requests.
      /* eslint-disable babel/no-await-in-loop */
      for (var _ref3 of dependencies) {
        var _ref2 = _slicedToArray(_ref3, 2);

        var filePath = _ref2[0];
        var contents = _ref2[1];

        yield this.updateDependency(filePath, contents);
      }
      /* eslint-enable babel/no-await-in-loop */
    })
  }, {
    key: 'updateDependency',
    value: _asyncToGenerator(function* (path, contents) {
      if (contents !== this._pathContentsMap.get(path)) {
        var webWorkerMessage = { cmd: 'hh_add_dep', args: [path, contents] };
        yield this._hackWorker.runWorkerTask(webWorkerMessage, { isDependency: true });
      }
    })

    /**
     * A simple way to estimate if all Hack dependencies have been loaded.
     * This flag is turned off when a file gets updated or added, and gets turned back on
     * once `updateDependencies()` returns no additional dependencies.
     *
     * The flag only updates every UPDATE_DEPENDENCIES_INTERVAL_MS, so it's not perfect -
     * however, it should be good enough for loading indicators / warnings.
     */
  }, {
    key: 'isFinishedLoadingDependencies',
    value: function isFinishedLoadingDependencies() {
      return this._isFinishedLoadingDependencies;
    }
  }, {
    key: 'onFinishedLoadingDependencies',
    value: function onFinishedLoadingDependencies(callback) {
      return this._emitter.on(DEPENDENCIES_LOADED_EVENT, callback);
    }
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (contents, startPosition, endPosition) {
      var webWorkerMessage = { cmd: 'hh_format', args: [contents, startPosition, endPosition] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      var errorMessage = response.error_message;
      if (errorMessage) {
        if (errorMessage === 'Php_or_decl') {
          throw new Error('Sorry, PHP and <?hh //decl are not supported');
        } else if (errorMessage === 'Parsing_error') {
          throw new Error('Parsing Error! Fix your file so the syntax is valid and retry');
        } else {
          throw new Error('failed formating hack code' + errorMessage);
        }
      } else {
        return response.result;
      }
    })
  }, {
    key: 'highlightSource',
    value: _asyncToGenerator(function* (path, contents, line, col) {
      yield this.updateFile(path, contents);
      var webWorkerMessage = { cmd: 'hh_find_lvar_refs', args: [path, line, col] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      return response.positions.map(function (position) {
        return new _atom.Range([position.line - 1, position.char_start - 1], [position.line - 1, position.char_end]);
      });
    })
  }, {
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (path, contents) {
      if (this.isHackAvailable()) {
        return yield this._getServerDiagnostics(path);
      }

      var _parse = (0, _nuclideRemoteUri.parse)(path);

      var hostname = _parse.hostname;
      var port = _parse.port;
      var localPath = _parse.path;

      yield this.updateFile(localPath, contents);
      var webWorkerMessage = { cmd: 'hh_check_file', args: [localPath] };

      var _ref4 = yield this._hackWorker.runWorkerTask(webWorkerMessage);

      var errors = _ref4.errors;

      if (hostname != null && port != null) {
        errors.forEach(function (error) {
          error.message.forEach(function (message) {
            if (message.path != null) {
              message.path = (0, _nuclideRemoteUri.createRemoteUri)(hostname, parseInt(port, 10), message.path);
            }
          });
        });
      }
      return errors;
    })
  }, {
    key: '_getServerDiagnostics',
    value: _asyncToGenerator(function* (filePath) {
      var _getHackService3 = (0, _utils.getHackService)(filePath);

      var getDiagnostics = _getHackService3.getDiagnostics;

      var diagnosticResult = null;
      try {
        diagnosticResult = yield getDiagnostics(filePath, '');
      } catch (err) {
        (0, _nuclideLogging.getLogger)().error(err);
        return [];
      }
      if (!diagnosticResult) {
        (0, _nuclideLogging.getLogger)().error('hh_client could not be reached');
        return [];
      }
      var hackDiagnostics = diagnosticResult;
      return hackDiagnostics.messages;
    })
  }, {
    key: 'getTypeCoverage',
    value: _asyncToGenerator(function* (filePath) {
      var _getHackService4 = (0, _utils.getHackService)(filePath);

      var getTypedRegions = _getHackService4.getTypedRegions;

      var regions = yield getTypedRegions(filePath);
      return (0, _TypedRegions.convertTypedRegionsToCoverageRegions)(regions);
    })
  }, {
    key: 'getOutline',
    value: function getOutline(filePath, contents) {
      var _getHackService5 = (0, _utils.getHackService)(filePath);

      var getOutline = _getHackService5.getOutline;

      return getOutline(filePath, contents);
    }
  }, {
    key: 'getDefinition',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column, lineText) {
      // Ask the `hh_server` to parse, indentiy the position,
      // and lookup that identifier for a location match.
      var identifierResult = yield this._getDefinitionFromIdentifier(filePath, contents, lineNumber, column, lineText);
      if (identifierResult.length === 1) {
        return identifierResult;
      }
      var heuristicResults = yield Promise.all([
      // Ask the `hh_server` for a symbol name search location.
      this._getDefinitionFromSymbolName(filePath, contents, lineNumber, column),
      // Ask the `hh_server` for a search of the string parsed.
      this._getDefinitionFromStringParse(filePath, lineText, column),
      // Ask Hack client side for a result location.
      this._getDefinitionLocationAtPosition(filePath, contents, lineNumber, column)]);
      // We now have results from all 4 sources.
      // Choose the best results to show to the user.
      var definitionResults = [identifierResult].concat(heuristicResults);
      return _nuclideCommons.array.find(definitionResults, function (definitionResult) {
        return definitionResult.length === 1;
      }) || _nuclideCommons.array.find(definitionResults, function (definitionResult) {
        return definitionResult.length > 1;
      }) || [];
    })
  }, {
    key: '_getSymbolNameAtPosition',
    value: _asyncToGenerator(function* (path, contents, lineNumber, column) {

      yield this.updateFile(path, contents);
      var webWorkerMessage = { cmd: 'hh_get_method_name', args: [path, lineNumber, column] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      if (!response.name) {
        return null;
      }
      var symbolType = getSymbolType(response.result_type);
      var position = response.pos;
      return {
        name: response.name,
        type: symbolType,
        line: position.line - 1,
        column: position.char_start - 1,
        length: position.char_end - position.char_start + 1
      };
    })

    /**
     * A thin wrapper around getSymbolNameAtPosition that waits for dependencies before reporting
     * that no symbol name can be resolved.
     */
  }, {
    key: '_getSymbolNameAtPositionWithDependencies',
    value: _asyncToGenerator(function* (path, contents, lineNumber, column, timeout) {
      var _this2 = this;

      return this._waitForDependencies(function () {
        return _this2._getSymbolNameAtPosition(path, contents, lineNumber, column);
      }, function (x) {
        return x != null;
      }, timeout);
    })
  }, {
    key: '_getDefinitionFromSymbolName',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column) {
      if (contents.length > MAX_HACK_WORKER_TEXT_SIZE) {
        // Avoid Poor Worker Performance for large files.
        return [];
      }
      var symbol = null;
      try {
        symbol = yield this._getSymbolNameAtPosition((0, _nuclideRemoteUri.getPath)(filePath), contents, lineNumber, column);
      } catch (err) {
        // Ignore the error.
        (0, _nuclideLogging.getLogger)().warn('_getDefinitionFromSymbolName error:', err);
        return [];
      }
      if (!symbol || !symbol.name) {
        return [];
      }

      var _getHackService6 = (0, _utils.getHackService)(filePath);

      var getDefinition = _getHackService6.getDefinition;

      var definitionResult = yield getDefinition(filePath, symbol.name, symbol.type);
      if (!definitionResult) {
        return [];
      }
      return definitionResult.definitions;
    })
  }, {
    key: '_getDefinitionLocationAtPosition',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column) {
      if (!filePath || contents.length > MAX_HACK_WORKER_TEXT_SIZE) {
        // Avoid Poor Worker Performance for large files.
        return [];
      }

      var _parse2 = (0, _nuclideRemoteUri.parse)(filePath);

      var hostname = _parse2.hostname;
      var port = _parse2.port;
      var localPath = _parse2.path;

      yield this.updateFile(localPath, contents);
      var webWorkerMessage = { cmd: 'hh_infer_pos', args: [localPath, lineNumber, column] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      var position = response.pos || {};
      if (!position.filename) {
        return [];
      }
      return [{
        path: hostname && port ? (0, _nuclideRemoteUri.createRemoteUri)(hostname, parseInt(port, 10), position.filename) : position.filename,
        line: position.line - 1,
        column: position.char_start - 1,
        length: position.char_end - position.char_start + 1,
        name: position.name,
        scope: position.scope,
        additionalInfo: position.additionalInfo
      }];
    })
  }, {
    key: '_getDefinitionFromIdentifier',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column, lineText) {
      var _getHackService7 = (0, _utils.getHackService)(filePath);

      var getIdentifierDefinition = _getHackService7.getIdentifierDefinition;

      var definitionResult = yield getIdentifierDefinition(filePath, contents, lineNumber, column);
      return processDefinitionsForXhp(definitionResult, column, lineText);
    })
  }, {
    key: '_getDefinitionFromStringParse',
    value: _asyncToGenerator(function* (filePath, lineText, column) {
      var _parseStringForExpression2 = this._parseStringForExpression(lineText, column);

      var search = _parseStringForExpression2.search;
      var start = _parseStringForExpression2.start;
      var end = _parseStringForExpression2.end;

      if (!search) {
        return [];
      }

      var _getHackService8 = (0, _utils.getHackService)(filePath);

      var getDefinition = _getHackService8.getDefinition;

      var definitionResult = yield getDefinition(filePath, search, _nuclideHackCommon.SymbolType.UNKNOWN);
      if (!definitionResult) {
        return [];
      }
      var definitions = definitionResult.definitions;
      return definitions.map(function (definition) {
        return _extends({}, definition, {
          searchStartColumn: start,
          searchEndColumn: end
        });
      });
    })
  }, {
    key: '_parseStringForExpression',
    value: function _parseStringForExpression(lineText, column) {
      var search = null;
      var start = column;

      var isXHP = false;
      var xhpMatch = undefined;
      while (xhpMatch = XHP_LINE_TEXT_REGEX.exec(lineText)) {
        var xhpMatchIndex = xhpMatch.index + 1;
        if (column >= xhpMatchIndex && column < xhpMatchIndex + xhpMatch[1].length) {
          isXHP = true;
          break;
        }
      }

      var syntaxCharRegex = isXHP ? xhpCharRegex : wordCharRegex;
      // Scan for the word start for the hack variable, function or xhp tag
      // we are trying to get the definition for.
      while (start >= 0 && syntaxCharRegex.test(lineText.charAt(start))) {
        start--;
      }
      if (lineText[start] === '$') {
        start--;
      }
      start++;
      var end = column;
      while (syntaxCharRegex.test(lineText.charAt(end))) {
        end++;
      }
      search = lineText.substring(start, end);
      // XHP UI elements start with : but the usages doesn't have that colon.
      if (isXHP && !search.startsWith(':')) {
        search = ':' + search;
      }
      return { search: search, start: start, end: end };
    }
  }, {
    key: 'getType',
    value: _asyncToGenerator(function* (path, contents, expression, lineNumber, column) {
      if (!expression.startsWith('$')) {
        return null;
      }
      yield this.updateFile(path, contents);
      var webWorkerMessage = { cmd: 'hh_infer_type', args: [path, lineNumber, column] };

      var _ref5 = yield this._hackWorker.runWorkerTask(webWorkerMessage);

      var type = _ref5.type;

      return type;
    })
  }, {
    key: '_getReferences',
    value: _asyncToGenerator(function* (filePath, contents, symbol) {
      var _getHackService9 = (0, _utils.getHackService)(filePath);

      var getReferences = _getHackService9.getReferences;

      var referencesResult = yield getReferences(filePath, symbol.name, symbol.type);
      return referencesResult;
    })
  }, {
    key: 'findReferences',
    value: _asyncToGenerator(function* (filePath, contents, line, column) {
      var symbol = yield this._getSymbolNameAtPositionWithDependencies((0, _nuclideRemoteUri.getPath)(filePath), contents, line + 1, column + 1);
      if (!symbol || !SYMBOL_TYPES_WITH_REFERENCES.has(symbol.type)) {
        return null;
      }
      var referencesResult = yield this._getReferences(filePath, contents, symbol);
      if (!referencesResult) {
        return null;
      }
      var hackRoot = referencesResult.hackRoot;
      var references = referencesResult.references;

      return { baseUri: hackRoot, symbolName: symbol.name, references: references };
    })
  }, {
    key: 'getBasePath',
    value: function getBasePath() {
      return this._basePath;
    }
  }, {
    key: 'isHackAvailable',
    value: function isHackAvailable() {
      return this._hhAvailable;
    }

    /**
     * Continually retries the function provided until either:
     * 1) the return value is "acceptable" (if provided)
     * 2) dependencies have finished loading, or
     * 3) the specified timeout has been reached.
     */
  }, {
    key: '_waitForDependencies',
    value: _asyncToGenerator(function* (func, acceptable, timeoutMs) {
      var _this3 = this;

      var startTime = Date.now();
      while (!timeoutMs || Date.now() - startTime < timeoutMs) {
        var result = yield func(); // eslint-disable-line babel/no-await-in-loop
        if (acceptable && acceptable(result) || this.isFinishedLoadingDependencies()) {
          return result;
        }
        // Wait for dependencies to finish loading - to avoid polling, we'll wait for the callback.
        yield new Promise(function (resolve) {
          // eslint-disable-line babel/no-await-in-loop
          var subscription = _this3.onFinishedLoadingDependencies(function () {
            subscription.dispose();
            resolve();
          });
        });
      }
      throw new Error('Timed out waiting for Hack dependencies');
    })
  }]);

  return LocalHackLanguage;
})();

exports.LocalHackLanguage = LocalHackLanguage;

var stringToCompletionType = {
  'id': _nuclideHackCommon.CompletionType.ID,
  'new': _nuclideHackCommon.CompletionType.NEW,
  'type': _nuclideHackCommon.CompletionType.TYPE,
  'class_get': _nuclideHackCommon.CompletionType.CLASS_GET,
  'var': _nuclideHackCommon.CompletionType.VAR
};

function getCompletionType(input) {
  var completionType = stringToCompletionType[input];
  if (typeof completionType === 'undefined') {
    completionType = _nuclideHackCommon.CompletionType.NONE;
  }
  return completionType;
}

var stringToSymbolType = {
  'class': _nuclideHackCommon.SymbolType.CLASS,
  'function': _nuclideHackCommon.SymbolType.FUNCTION,
  'method': _nuclideHackCommon.SymbolType.METHOD,
  'local': _nuclideHackCommon.SymbolType.LOCAL
};

// Symbol types we can get references for.
var SYMBOL_TYPES_WITH_REFERENCES = new Set([_nuclideHackCommon.SymbolType.CLASS, _nuclideHackCommon.SymbolType.FUNCTION, _nuclideHackCommon.SymbolType.METHOD]);

function getSymbolType(input) {
  var symbolType = stringToSymbolType[input];
  if (typeof symbolType === 'undefined') {
    symbolType = _nuclideHackCommon.SymbolType.METHOD;
  }
  return symbolType;
}

var serverCompletionTypes = new Set([_nuclideHackCommon.CompletionType.ID, _nuclideHackCommon.CompletionType.NEW, _nuclideHackCommon.CompletionType.TYPE]);

function shouldDoServerCompletion(type) {
  return serverCompletionTypes.has(type);
}

function processCompletions(completionsResponse) {
  return completionsResponse.map(function (completion) {
    var name = completion.name;
    var functionDetails = completion.func_details;
    var type = completion.type;

    if (type && type.indexOf('(') === 0 && type.lastIndexOf(')') === type.length - 1) {
      type = type.substring(1, type.length - 1);
    }
    var matchSnippet = name;
    if (functionDetails) {
      var params = functionDetails.params;

      // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
      var paramsString = params.map(function (param, index) {
        return '${' + (index + 1) + ':' + param.name + '}';
      }).join(', ');
      matchSnippet = name + '(' + paramsString + ')';
    }
    return {
      matchSnippet: matchSnippet,
      matchText: name,
      matchType: type
    };
  });
}

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)

function markFileForCompletion(contents, offset) {
  return contents.substring(0, offset) + 'AUTO332' + contents.substring(offset, contents.length);
}

function processDefinitionsForXhp(definitionResult, column, lineText) {
  if (!definitionResult) {
    return [];
  }
  var definitions = definitionResult.definitions;

  return definitions.map(function (definition) {
    var name = definition.name;

    if (name.startsWith(':')) {
      // XHP class name, usages omit the leading ':'.
      name = name.substring(1);
    }
    var definitionIndex = lineText.indexOf(name);
    if (definitionIndex === -1 || definitionIndex >= column || !xhpCharRegex.test(lineText.substring(definitionIndex, column))) {
      return definition;
    } else {
      return _extends({}, definition, {
        searchStartColumn: definitionIndex,
        searchEndColumn: definitionIndex + definition.name.length
      });
    }
  });
}
//# sourceMappingURL=data:application/json;base64,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QUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztDQUM3RDs7QUFFTSxTQUFTLHdCQUF3QixDQUN0QyxnQkFBdUMsRUFDdkMsTUFBYyxFQUNkLFFBQWdCLEVBQ1c7QUFDM0IsTUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3JCLFdBQU8sRUFBRSxDQUFDO0dBQ1g7TUFDTSxXQUFXLEdBQUksZ0JBQWdCLENBQS9CLFdBQVc7O0FBQ2xCLFNBQU8sV0FBVyxDQUFDLEdBQUcsQ0FBQyxVQUFBLFVBQVUsRUFBSTtRQUM5QixJQUFJLEdBQUksVUFBVSxDQUFsQixJQUFJOztBQUNULFFBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTs7QUFFeEIsVUFBSSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDMUI7QUFDRCxRQUFNLGVBQWUsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLFFBQ0UsZUFBZSxLQUFLLENBQUMsQ0FBQyxJQUN0QixlQUFlLElBQUksTUFBTSxJQUN6QixDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxlQUFlLEVBQUUsTUFBTSxDQUFDLENBQUMsRUFDL0Q7QUFDQSxhQUFPLFVBQVUsQ0FBQztLQUNuQixNQUFNO0FBQ0wsMEJBQ0ssVUFBVTtBQUNiLHlCQUFpQixFQUFFLGVBQWU7QUFDbEMsdUJBQWUsRUFBRSxlQUFlLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNO1NBQ3pEO0tBQ0g7R0FDRixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJMb2NhbEhhY2tMYW5ndWFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0NvbXBsZXRpb25SZXN1bHR9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB0eXBlIHtcbiAgSGFja0NvbXBsZXRpb25zUmVzdWx0LFxuICBIYWNrQ29tcGxldGlvbixcbiAgSGFja0RpYWdub3N0aWNzUmVzdWx0LFxuICBIYWNrRGlhZ25vc3RpYyxcbiAgSGFja0RlZmluaXRpb25SZXN1bHQsXG4gIEhhY2tTZWFyY2hQb3NpdGlvbixcbiAgSGFja1JlZmVyZW5jZSxcbiAgSGFja1JlZmVyZW5jZXNSZXN1bHQsXG4gIEhhY2tPdXRsaW5lLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuaW1wb3J0IHtUeXBlQ292ZXJhZ2VSZWdpb259IGZyb20gJy4vVHlwZWRSZWdpb25zJztcblxuaW1wb3J0IHR5cGUge0hhY2tTeW1ib2xOYW1lUmVzdWx0fSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvdHlwZXMnO1xuXG5pbXBvcnQge3BhcnNlLCBjcmVhdGVSZW1vdGVVcmksIGdldFBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge2dldEhhY2tTZXJ2aWNlfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7UmFuZ2UsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEhhY2tXb3JrZXIgZnJvbSAnLi9IYWNrV29ya2VyJztcbmltcG9ydCB7Q29tcGxldGlvblR5cGUsIFN5bWJvbFR5cGV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHtjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnN9IGZyb20gJy4vVHlwZWRSZWdpb25zJztcblxuLy8gVGhlIHdvcmQgY2hhciByZWdleCBpbmNsdWRlIFxcIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlZCBjbGFzc2VzLlxuY29uc3Qgd29yZENoYXJSZWdleCA9IC9bXFx3XFxcXF0vO1xuLy8gVGhlIHhocCBjaGFyIHJlZ2V4IGluY2x1ZGUgOiBhbmQgLSB0byBtYXRjaCB4aHAgdGFncyBsaWtlIDx1aTpidXR0b24tZ3JvdXA+LlxuY29uc3QgeGhwQ2hhclJlZ2V4ID0gL1tcXHc6LV0vO1xuY29uc3QgWEhQX0xJTkVfVEVYVF9SRUdFWCA9IC88KFthLXpdW2EtejAtOV8uOi1dKilbXj5dKlxcLz8+L2dpO1xuXG5jb25zdCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TID0gMTAwMDA7XG5jb25zdCBERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5UID0gJ2RlcGVuZGVuY2llcy1sb2FkZWQnO1xuY29uc3QgTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSA9IDEwMDAwO1xuXG4vKipcbiAqIFRoZSBIYWNrTGFuZ3VhZ2UgaXMgdGhlIGNvbnRyb2xsZXIgdGhhdCBzZXJ2ZXJzIGxhbmd1YWdlIHJlcXVlc3RzIGJ5IHRyeWluZyB0byBnZXQgd29ya2VyIHJlc3VsdHNcbiAqIGFuZC9vciByZXN1bHRzIGZyb20gSGFja1NlcnZpY2UgKHdoaWNoIHdvdWxkIGJlIGV4ZWN1dGluZyBoaF9jbGllbnQgb24gYSBzdXBwb3J0aW5nIHNlcnZlcilcbiAqIGFuZCBjb21iaW5pbmcgYW5kL29yIHNlbGVjdGluZyB0aGUgcmVzdWx0cyB0byBnaXZlIGJhY2sgdG8gdGhlIHJlcXVlc3Rlci5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsSGFja0xhbmd1YWdlIHtcblxuICBfaGhBdmFpbGFibGU6IGJvb2xlYW47XG4gIF9oYWNrV29ya2VyOiBIYWNrV29ya2VyO1xuICBfcGF0aENvbnRlbnRzTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuICBfYmFzZVBhdGg6ID9zdHJpbmc7XG4gIF9pbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaTtcbiAgX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzOiBib29sZWFuO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIGBiYXNlUGF0aGAgc2hvdWxkIGJlIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIC5oaGNvbmZpZyBmaWxlIGlzIGxvY2F0ZWQuXG4gICAqIEl0IHNob3VsZCBvbmx5IGJlIG51bGwgaWYgY2xpZW50IGlzIG51bGwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoaEF2YWlsYWJsZTogYm9vbGVhbiwgYmFzZVBhdGg6ID9zdHJpbmcsIGluaXRpYWxGaWxlVXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgdGhpcy5faGhBdmFpbGFibGUgPSBoaEF2YWlsYWJsZTtcbiAgICB0aGlzLl9oYWNrV29ya2VyID0gbmV3IEhhY2tXb3JrZXIoKTtcbiAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgICB0aGlzLl9pbml0aWFsRmlsZVVyaSA9IGluaXRpYWxGaWxlVXJpO1xuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gdHJ1ZTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgIGlmICh0aGlzLl9oaEF2YWlsYWJsZSkge1xuICAgICAgdGhpcy5fc2V0dXBVcGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR1cFVwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsKCkge1xuICAgIC8vIEZldGNoIGFueSBkZXBlbmRlbmNpZXMgdGhlIEhhY2tXb3JrZXIgbmVlZHMgYWZ0ZXIgbGVhcm5pbmcgYWJvdXQgdGhpcyBmaWxlLlxuICAgIC8vIFdlIGRvbid0IGJsb2NrIGFueSByZWFsdGltZSBsb2dpYyBvbiB0aGUgZGVwZW5kZW5jeSBmZXRjaGluZyAtIGl0IGNvdWxkIHRha2UgYSB3aGlsZS5cbiAgICBsZXQgcGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcyA9IGZhbHNlO1xuXG4gICAgY29uc3QgZmluaXNoVXBkYXRlRGVwZW5kZW5jaWVzID0gKCkgPT4ge1xuICAgICAgcGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICB0aGlzLl91cGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgdGhpcy51cGRhdGVEZXBlbmRlbmNpZXMoKS50aGVuKGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcywgZmluaXNoVXBkYXRlRGVwZW5kZW5jaWVzKTtcbiAgICB9LCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5faGFja1dvcmtlci5kaXNwb3NlKCk7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLl91cGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCk7XG4gIH1cblxuICBhc3luYyBnZXRDb21wbGV0aW9ucyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIG9mZnNldDogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8Q29tcGxldGlvblJlc3VsdD4+IHtcbiAgICBjb25zdCBtYXJrZWRDb250ZW50cyA9IG1hcmtGaWxlRm9yQ29tcGxldGlvbihjb250ZW50cywgb2Zmc2V0KTtcbiAgICBjb25zdCBsb2NhbFBhdGggPSBnZXRQYXRoKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9hdXRvX2NvbXBsZXRlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IGNvbXBsZXRpb25UeXBlID0gZ2V0Q29tcGxldGlvblR5cGUocmVzcG9uc2UuY29tcGxldGlvbl90eXBlKTtcbiAgICBsZXQge2NvbXBsZXRpb25zfSA9IHJlc3BvbnNlO1xuICAgIGlmIChzaG91bGREb1NlcnZlckNvbXBsZXRpb24oY29tcGxldGlvblR5cGUpIHx8ICFjb21wbGV0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHtnZXRDb21wbGV0aW9uc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgICBjb25zdCBjb21wbGV0aW9uc1Jlc3VsdCA9IGF3YWl0IGdldENvbXBsZXRpb25zKGZpbGVQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgICBpZiAoY29tcGxldGlvbnNSZXN1bHQpIHtcbiAgICAgICAgY29tcGxldGlvbnMgPSAoKGNvbXBsZXRpb25zUmVzdWx0OiBhbnkpOiBIYWNrQ29tcGxldGlvbnNSZXN1bHQpLmNvbXBsZXRpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAuc2V0KHBhdGgsIGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYWRkX2ZpbGUnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY2llcygpOiBQcm9taXNlIHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9kZXBzJywgYXJnczogW119O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UuZGVwcy5sZW5ndGgpIHtcbiAgICAgIGlmICghdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQpO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgY29uc3Qge2dldERlcGVuZGVuY2llc30gPSBnZXRIYWNrU2VydmljZSh0aGlzLl9pbml0aWFsRmlsZVVyaSk7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzUmVzdWx0ID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKFxuICAgICAgdGhpcy5faW5pdGlhbEZpbGVVcmksIHJlc3BvbnNlLmRlcHNcbiAgICApO1xuICAgIGlmICghZGVwZW5kZW5jaWVzUmVzdWx0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtkZXBlbmRlbmNpZXN9ID0gZGVwZW5kZW5jaWVzUmVzdWx0O1xuICAgIC8vIFNlcmlhbGx5IHVwZGF0ZSBkZXBlZG5lY2llcyBub3QgdG8gYmxvY2sgdGhlIHdvcmtlciBmcm9tIHNlcnZpbmcgb3RoZXIgZmVhdHVyZSByZXF1ZXN0cy5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGNvbnRlbnRzXSBvZiBkZXBlbmRlbmNpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlRGVwZW5kZW5jeShmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY3kocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2FkZF9kZXAnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlLCB7aXNEZXBlbmRlbmN5OiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHdheSB0byBlc3RpbWF0ZSBpZiBhbGwgSGFjayBkZXBlbmRlbmNpZXMgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgICogVGhpcyBmbGFnIGlzIHR1cm5lZCBvZmYgd2hlbiBhIGZpbGUgZ2V0cyB1cGRhdGVkIG9yIGFkZGVkLCBhbmQgZ2V0cyB0dXJuZWQgYmFjayBvblxuICAgKiBvbmNlIGB1cGRhdGVEZXBlbmRlbmNpZXMoKWAgcmV0dXJucyBubyBhZGRpdGlvbmFsIGRlcGVuZGVuY2llcy5cbiAgICpcbiAgICogVGhlIGZsYWcgb25seSB1cGRhdGVzIGV2ZXJ5IFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMsIHNvIGl0J3Mgbm90IHBlcmZlY3QgLVxuICAgKiBob3dldmVyLCBpdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggZm9yIGxvYWRpbmcgaW5kaWNhdG9ycyAvIHdhcm5pbmdzLlxuICAgKi9cbiAgaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgb25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoY2FsbGJhY2s6ICgoKSA9PiBtaXhlZCkpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oREVQRU5ERU5DSUVTX0xPQURFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0U291cmNlKFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3RhcnRQb3NpdGlvbjogbnVtYmVyLFxuICAgIGVuZFBvc2l0aW9uOiBudW1iZXIsXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9mb3JtYXQnLCBhcmdzOiBbY29udGVudHMsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzcG9uc2UuZXJyb3JfbWVzc2FnZTtcbiAgICBpZiAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGhwX29yX2RlY2wnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU29ycnksIFBIUCBhbmQgPD9oaCAvL2RlY2wgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGFyc2luZ19lcnJvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJzaW5nIEVycm9yISBGaXggeW91ciBmaWxlIHNvIHRoZSBzeW50YXggaXMgdmFsaWQgYW5kIHJldHJ5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCBmb3JtYXRpbmcgaGFjayBjb2RlJyArIGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaGlnaGxpZ2h0U291cmNlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2w6IG51bWJlcixcbiAgKTogUHJvbWlzZTxBcnJheTxhdG9tJFJhbmdlPj4ge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9maW5kX2x2YXJfcmVmcycsIGFyZ3M6IFtwYXRoLCBsaW5lLCBjb2xdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICByZXR1cm4gcmVzcG9uc2UucG9zaXRpb25zLm1hcChcbiAgICAgIHBvc2l0aW9uID0+IG5ldyBSYW5nZShcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMV0sXG4gICAgICAgIFtwb3NpdGlvbi5saW5lIC0gMSwgcG9zaXRpb24uY2hhcl9lbmRdLFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBhc3luYyBnZXREaWFnbm9zdGljcyhcbiAgICBwYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgaWYgKHRoaXMuaXNIYWNrQXZhaWxhYmxlKCkpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9nZXRTZXJ2ZXJEaWFnbm9zdGljcyhwYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnQsIHBhdGg6IGxvY2FsUGF0aH0gPSBwYXJzZShwYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9jaGVja19maWxlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHtlcnJvcnN9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmIChob3N0bmFtZSAhPSBudWxsICYmIHBvcnQgIT0gbnVsbCkge1xuICAgICAgZXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBlcnJvci5tZXNzYWdlLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICAgICAgaWYgKG1lc3NhZ2UucGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnBhdGggPSBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgbWVzc2FnZS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBlcnJvcnM7XG4gIH1cblxuICBhc3luYyBfZ2V0U2VydmVyRGlhZ25vc3RpY3MoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgY29uc3Qge2dldERpYWdub3N0aWNzfSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBsZXQgZGlhZ25vc3RpY1Jlc3VsdCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGRpYWdub3N0aWNSZXN1bHQgPSBhd2FpdCBnZXREaWFnbm9zdGljcyhmaWxlUGF0aCwgJycpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFkaWFnbm9zdGljUmVzdWx0KSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcignaGhfY2xpZW50IGNvdWxkIG5vdCBiZSByZWFjaGVkJyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGhhY2tEaWFnbm9zdGljcyA9ICgoZGlhZ25vc3RpY1Jlc3VsdDogYW55KTogSGFja0RpYWdub3N0aWNzUmVzdWx0KTtcbiAgICByZXR1cm4gaGFja0RpYWdub3N0aWNzLm1lc3NhZ2VzO1xuICB9XG5cbiAgYXN5bmMgZ2V0VHlwZUNvdmVyYWdlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICApOiBQcm9taXNlPEFycmF5PFR5cGVDb3ZlcmFnZVJlZ2lvbj4+IHtcbiAgICBjb25zdCB7Z2V0VHlwZWRSZWdpb25zfSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBjb25zdCByZWdpb25zID0gYXdhaXQgZ2V0VHlwZWRSZWdpb25zKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gY29udmVydFR5cGVkUmVnaW9uc1RvQ292ZXJhZ2VSZWdpb25zKHJlZ2lvbnMpO1xuICB9XG5cbiAgZ2V0T3V0bGluZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICApOiBQcm9taXNlPD9IYWNrT3V0bGluZT4ge1xuICAgIGNvbnN0IHtnZXRPdXRsaW5lfSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICByZXR1cm4gZ2V0T3V0bGluZShmaWxlUGF0aCwgY29udGVudHMpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZ1xuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgdG8gcGFyc2UsIGluZGVudGl5IHRoZSBwb3NpdGlvbixcbiAgICAvLyBhbmQgbG9va3VwIHRoYXQgaWRlbnRpZmllciBmb3IgYSBsb2NhdGlvbiBtYXRjaC5cbiAgICBjb25zdCBpZGVudGlmaWVyUmVzdWx0ID0gYXdhaXQgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW4sXG4gICAgICBsaW5lVGV4dCxcbiAgICApO1xuICAgIGlmIChpZGVudGlmaWVyUmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGlkZW50aWZpZXJSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGhldXJpc3RpY1Jlc3VsdHMgPVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHN5bWJvbCBuYW1lIHNlYXJjaCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKGZpbGVQYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKSxcbiAgICAgICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCBmb3IgYSBzZWFyY2ggb2YgdGhlIHN0cmluZyBwYXJzZWQuXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoZmlsZVBhdGgsIGxpbmVUZXh0LCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgSGFjayBjbGllbnQgc2lkZSBmb3IgYSByZXN1bHQgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgXSk7XG4gICAgLy8gV2Ugbm93IGhhdmUgcmVzdWx0cyBmcm9tIGFsbCA0IHNvdXJjZXMuXG4gICAgLy8gQ2hvb3NlIHRoZSBiZXN0IHJlc3VsdHMgdG8gc2hvdyB0byB0aGUgdXNlci5cbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0cyA9IFtpZGVudGlmaWVyUmVzdWx0XS5jb25jYXQoaGV1cmlzdGljUmVzdWx0cyk7XG4gICAgcmV0dXJuIGFycmF5LmZpbmQoZGVmaW5pdGlvblJlc3VsdHMsIGRlZmluaXRpb25SZXN1bHQgPT4gZGVmaW5pdGlvblJlc3VsdC5sZW5ndGggPT09IDEpXG4gICAgICB8fCBhcnJheS5maW5kKGRlZmluaXRpb25SZXN1bHRzLCBkZWZpbml0aW9uUmVzdWx0ID0+IGRlZmluaXRpb25SZXN1bHQubGVuZ3RoID4gMSlcbiAgICAgIHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPD9IYWNrU3ltYm9sTmFtZVJlc3VsdD4ge1xuXG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKHBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9tZXRob2RfbmFtZScsIGFyZ3M6IFtwYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBpZiAoIXJlc3BvbnNlLm5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzeW1ib2xUeXBlID0gZ2V0U3ltYm9sVHlwZShyZXNwb25zZS5yZXN1bHRfdHlwZSk7XG4gICAgY29uc3QgcG9zaXRpb24gPSByZXNwb25zZS5wb3M7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHJlc3BvbnNlLm5hbWUsXG4gICAgICB0eXBlOiBzeW1ib2xUeXBlLFxuICAgICAgbGluZTogcG9zaXRpb24ubGluZSAtIDEsXG4gICAgICBjb2x1bW46IHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxLFxuICAgICAgbGVuZ3RoOiBwb3NpdGlvbi5jaGFyX2VuZCAtIHBvc2l0aW9uLmNoYXJfc3RhcnQgKyAxLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSB0aGluIHdyYXBwZXIgYXJvdW5kIGdldFN5bWJvbE5hbWVBdFBvc2l0aW9uIHRoYXQgd2FpdHMgZm9yIGRlcGVuZGVuY2llcyBiZWZvcmUgcmVwb3J0aW5nXG4gICAqIHRoYXQgbm8gc3ltYm9sIG5hbWUgY2FuIGJlIHJlc29sdmVkLlxuICAgKi9cbiAgYXN5bmMgX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uV2l0aERlcGVuZGVuY2llcyhcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgdGltZW91dDogP251bWJlcixcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5fd2FpdEZvckRlcGVuZGVuY2llcyhcbiAgICAgICgpID0+IHRoaXMuX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uKHBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgeCA9PiB4ICE9IG51bGwsXG4gICAgICB0aW1lb3V0LFxuICAgICk7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGlmIChjb250ZW50cy5sZW5ndGggPiBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFKSB7XG4gICAgICAvLyBBdm9pZCBQb29yIFdvcmtlciBQZXJmb3JtYW5jZSBmb3IgbGFyZ2UgZmlsZXMuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBzeW1ib2wgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBzeW1ib2wgPSBhd2FpdCB0aGlzLl9nZXRTeW1ib2xOYW1lQXRQb3NpdGlvbihnZXRQYXRoKGZpbGVQYXRoKSwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBJZ25vcmUgdGhlIGVycm9yLlxuICAgICAgZ2V0TG9nZ2VyKCkud2FybignX2dldERlZmluaXRpb25Gcm9tU3ltYm9sTmFtZSBlcnJvcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIXN5bWJvbCB8fCAhc3ltYm9sLm5hbWUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qge2dldERlZmluaXRpb259ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHQgPSBhd2FpdCBnZXREZWZpbml0aW9uKGZpbGVQYXRoLCBzeW1ib2wubmFtZSwgc3ltYm9sLnR5cGUpO1xuICAgIGlmICghZGVmaW5pdGlvblJlc3VsdCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCkuZGVmaW5pdGlvbnM7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkxvY2F0aW9uQXRQb3NpdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGlmICghZmlsZVBhdGggfHwgY29udGVudHMubGVuZ3RoID4gTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSkge1xuICAgICAgLy8gQXZvaWQgUG9vciBXb3JrZXIgUGVyZm9ybWFuY2UgZm9yIGxhcmdlIGZpbGVzLlxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnQsIHBhdGg6IGxvY2FsUGF0aH0gPSBwYXJzZShmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfaW5mZXJfcG9zJywgYXJnczogW2xvY2FsUGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgcG9zaXRpb24gPSByZXNwb25zZS5wb3MgfHwge307XG4gICAgaWYgKCFwb3NpdGlvbi5maWxlbmFtZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gW3tcbiAgICAgIHBhdGg6IChob3N0bmFtZSAmJiBwb3J0KVxuICAgICAgICA/IGNyZWF0ZVJlbW90ZVVyaShob3N0bmFtZSwgcGFyc2VJbnQocG9ydCwgMTApLCBwb3NpdGlvbi5maWxlbmFtZSlcbiAgICAgICAgOiBwb3NpdGlvbi5maWxlbmFtZSxcbiAgICAgIGxpbmU6IHBvc2l0aW9uLmxpbmUgLSAxLFxuICAgICAgY29sdW1uOiBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMSxcbiAgICAgIGxlbmd0aDogcG9zaXRpb24uY2hhcl9lbmQgLSBwb3NpdGlvbi5jaGFyX3N0YXJ0ICsgMSxcbiAgICAgIG5hbWU6IHBvc2l0aW9uLm5hbWUsXG4gICAgICBzY29wZTogcG9zaXRpb24uc2NvcGUsXG4gICAgICBhZGRpdGlvbmFsSW5mbzogcG9zaXRpb24uYWRkaXRpb25hbEluZm8sXG4gICAgfV07XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgICBjb250ZW50czogc3RyaW5nLFxuICAgICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgICAgY29sdW1uOiBudW1iZXIsXG4gICAgICBsaW5lVGV4dDogc3RyaW5nLFxuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBjb25zdCB7Z2V0SWRlbnRpZmllckRlZmluaXRpb259ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHQgPSBhd2FpdCBnZXRJZGVudGlmaWVyRGVmaW5pdGlvbihcbiAgICAgIGZpbGVQYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uXG4gICAgKTtcbiAgICByZXR1cm4gcHJvY2Vzc0RlZmluaXRpb25zRm9yWGhwKGRlZmluaXRpb25SZXN1bHQsIGNvbHVtbiwgbGluZVRleHQpO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgbGluZVRleHQ6IHN0cmluZyxcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBjb25zdCB7c2VhcmNoLCBzdGFydCwgZW5kfSA9IHRoaXMuX3BhcnNlU3RyaW5nRm9yRXhwcmVzc2lvbihsaW5lVGV4dCwgY29sdW1uKTtcbiAgICBpZiAoIXNlYXJjaCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7Z2V0RGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldERlZmluaXRpb24oZmlsZVBhdGgsIHNlYXJjaCwgU3ltYm9sVHlwZS5VTktOT1dOKTtcbiAgICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KS5kZWZpbml0aW9ucztcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4gKHtcbiAgICAgIC4uLmRlZmluaXRpb24sXG4gICAgICBzZWFyY2hTdGFydENvbHVtbjogc3RhcnQsXG4gICAgICBzZWFyY2hFbmRDb2x1bW46IGVuZCxcbiAgICB9KSk7XG4gIH1cblxuICBfcGFyc2VTdHJpbmdGb3JFeHByZXNzaW9uKFxuICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IHtzZWFyY2g6IHN0cmluZzsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXJ9IHtcbiAgICBsZXQgc2VhcmNoID0gbnVsbDtcbiAgICBsZXQgc3RhcnQgPSBjb2x1bW47XG5cbiAgICBsZXQgaXNYSFAgPSBmYWxzZTtcbiAgICBsZXQgeGhwTWF0Y2g7XG4gICAgd2hpbGUgICgoeGhwTWF0Y2ggPSBYSFBfTElORV9URVhUX1JFR0VYLmV4ZWMobGluZVRleHQpKSkge1xuICAgICAgY29uc3QgeGhwTWF0Y2hJbmRleCA9IHhocE1hdGNoLmluZGV4ICsgMTtcbiAgICAgIGlmIChjb2x1bW4gPj0geGhwTWF0Y2hJbmRleCAmJiBjb2x1bW4gPCAoeGhwTWF0Y2hJbmRleCArIHhocE1hdGNoWzFdLmxlbmd0aCkpIHtcbiAgICAgICAgaXNYSFAgPSB0cnVlO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzeW50YXhDaGFyUmVnZXggPSBpc1hIUCA/IHhocENoYXJSZWdleCA6IHdvcmRDaGFyUmVnZXg7XG4gICAgLy8gU2NhbiBmb3IgdGhlIHdvcmQgc3RhcnQgZm9yIHRoZSBoYWNrIHZhcmlhYmxlLCBmdW5jdGlvbiBvciB4aHAgdGFnXG4gICAgLy8gd2UgYXJlIHRyeWluZyB0byBnZXQgdGhlIGRlZmluaXRpb24gZm9yLlxuICAgIHdoaWxlIChzdGFydCA+PSAwICYmIHN5bnRheENoYXJSZWdleC50ZXN0KGxpbmVUZXh0LmNoYXJBdChzdGFydCkpKSB7XG4gICAgICBzdGFydC0tO1xuICAgIH1cbiAgICBpZiAobGluZVRleHRbc3RhcnRdID09PSAnJCcpIHtcbiAgICAgIHN0YXJ0LS07XG4gICAgfVxuICAgIHN0YXJ0Kys7XG4gICAgbGV0IGVuZCA9IGNvbHVtbjtcbiAgICB3aGlsZSAoc3ludGF4Q2hhclJlZ2V4LnRlc3QobGluZVRleHQuY2hhckF0KGVuZCkpKSB7XG4gICAgICBlbmQrKztcbiAgICB9XG4gICAgc2VhcmNoID0gbGluZVRleHQuc3Vic3RyaW5nKHN0YXJ0LCBlbmQpO1xuICAgIC8vIFhIUCBVSSBlbGVtZW50cyBzdGFydCB3aXRoIDogYnV0IHRoZSB1c2FnZXMgZG9lc24ndCBoYXZlIHRoYXQgY29sb24uXG4gICAgaWYgKGlzWEhQICYmICFzZWFyY2guc3RhcnRzV2l0aCgnOicpKSB7XG4gICAgICBzZWFyY2ggPSAnOicgKyBzZWFyY2g7XG4gICAgfVxuICAgIHJldHVybiB7c2VhcmNoLCBzdGFydCwgZW5kfTtcbiAgfVxuXG4gIGFzeW5jIGdldFR5cGUoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgZXhwcmVzc2lvbjogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgaWYgKCFleHByZXNzaW9uLnN0YXJ0c1dpdGgoJyQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9pbmZlcl90eXBlJywgYXJnczogW3BhdGgsIGxpbmVOdW1iZXIsIGNvbHVtbl19O1xuICAgIGNvbnN0IHt0eXBlfSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICByZXR1cm4gdHlwZTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRSZWZlcmVuY2VzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3ltYm9sOiBIYWNrU3ltYm9sTmFtZVJlc3VsdCxcbiAgKTogUHJvbWlzZTw/SGFja1JlZmVyZW5jZXNSZXN1bHQ+IHtcbiAgICBjb25zdCB7Z2V0UmVmZXJlbmNlc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9IGF3YWl0IGdldFJlZmVyZW5jZXMoZmlsZVBhdGgsIHN5bWJvbC5uYW1lLCBzeW1ib2wudHlwZSk7XG4gICAgcmV0dXJuICgocmVmZXJlbmNlc1Jlc3VsdDogYW55KTogSGFja1JlZmVyZW5jZXNSZXN1bHQpO1xuICB9XG5cbiAgYXN5bmMgZmluZFJlZmVyZW5jZXMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTw/e2Jhc2VVcmk6IHN0cmluZzsgc3ltYm9sTmFtZTogc3RyaW5nOyByZWZlcmVuY2VzOiBBcnJheTxIYWNrUmVmZXJlbmNlPn0+IHtcbiAgICBjb25zdCBzeW1ib2wgPSBhd2FpdCB0aGlzLl9nZXRTeW1ib2xOYW1lQXRQb3NpdGlvbldpdGhEZXBlbmRlbmNpZXMoXG4gICAgICBnZXRQYXRoKGZpbGVQYXRoKSxcbiAgICAgIGNvbnRlbnRzLFxuICAgICAgbGluZSArIDEsXG4gICAgICBjb2x1bW4gKyAxXG4gICAgKTtcbiAgICBpZiAoIXN5bWJvbCB8fCAhU1lNQk9MX1RZUEVTX1dJVEhfUkVGRVJFTkNFUy5oYXMoc3ltYm9sLnR5cGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9IGF3YWl0IHRoaXMuX2dldFJlZmVyZW5jZXMoZmlsZVBhdGgsIGNvbnRlbnRzLCBzeW1ib2wpO1xuICAgIGlmICghcmVmZXJlbmNlc1Jlc3VsdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtoYWNrUm9vdCwgcmVmZXJlbmNlc30gPSByZWZlcmVuY2VzUmVzdWx0O1xuICAgIHJldHVybiB7YmFzZVVyaTogaGFja1Jvb3QsIHN5bWJvbE5hbWU6IHN5bWJvbC5uYW1lLCByZWZlcmVuY2VzfTtcbiAgfVxuXG4gIGdldEJhc2VQYXRoKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9iYXNlUGF0aDtcbiAgfVxuXG4gIGlzSGFja0F2YWlsYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGhBdmFpbGFibGU7XG4gIH1cblxuICAvKipcbiAgICogQ29udGludWFsbHkgcmV0cmllcyB0aGUgZnVuY3Rpb24gcHJvdmlkZWQgdW50aWwgZWl0aGVyOlxuICAgKiAxKSB0aGUgcmV0dXJuIHZhbHVlIGlzIFwiYWNjZXB0YWJsZVwiIChpZiBwcm92aWRlZClcbiAgICogMikgZGVwZW5kZW5jaWVzIGhhdmUgZmluaXNoZWQgbG9hZGluZywgb3JcbiAgICogMykgdGhlIHNwZWNpZmllZCB0aW1lb3V0IGhhcyBiZWVuIHJlYWNoZWQuXG4gICAqL1xuICBhc3luYyBfd2FpdEZvckRlcGVuZGVuY2llczxUPihcbiAgICBmdW5jOiAoKCkgPT4gUHJvbWlzZTxUPiksXG4gICAgYWNjZXB0YWJsZTogPygodmFsdWU6IFQpID0+IGJvb2xlYW4pLFxuICAgIHRpbWVvdXRNczogP251bWJlcixcbiAgKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB3aGlsZSAoIXRpbWVvdXRNcyB8fCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lIDwgdGltZW91dE1zKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmdW5jKCk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgaWYgKChhY2NlcHRhYmxlICYmIGFjY2VwdGFibGUocmVzdWx0KSkgfHwgdGhpcy5pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcygpKSB7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICB9XG4gICAgICAvLyBXYWl0IGZvciBkZXBlbmRlbmNpZXMgdG8gZmluaXNoIGxvYWRpbmcgLSB0byBhdm9pZCBwb2xsaW5nLCB3ZSdsbCB3YWl0IGZvciB0aGUgY2FsbGJhY2suXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMub25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKCkgPT4ge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RpbWVkIG91dCB3YWl0aW5nIGZvciBIYWNrIGRlcGVuZGVuY2llcycpO1xuICB9XG5cbn1cblxuY29uc3Qgc3RyaW5nVG9Db21wbGV0aW9uVHlwZSA9IHtcbiAgJ2lkJzogQ29tcGxldGlvblR5cGUuSUQsXG4gICduZXcnOiBDb21wbGV0aW9uVHlwZS5ORVcsXG4gICd0eXBlJzogQ29tcGxldGlvblR5cGUuVFlQRSxcbiAgJ2NsYXNzX2dldCc6IENvbXBsZXRpb25UeXBlLkNMQVNTX0dFVCxcbiAgJ3Zhcic6IENvbXBsZXRpb25UeXBlLlZBUixcbn07XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRpb25UeXBlKGlucHV0OiBzdHJpbmcpIHtcbiAgbGV0IGNvbXBsZXRpb25UeXBlID0gc3RyaW5nVG9Db21wbGV0aW9uVHlwZVtpbnB1dF07XG4gIGlmICh0eXBlb2YgY29tcGxldGlvblR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29tcGxldGlvblR5cGUgPSBDb21wbGV0aW9uVHlwZS5OT05FO1xuICB9XG4gIHJldHVybiBjb21wbGV0aW9uVHlwZTtcbn1cblxuY29uc3Qgc3RyaW5nVG9TeW1ib2xUeXBlID0ge1xuICAnY2xhc3MnOiBTeW1ib2xUeXBlLkNMQVNTLFxuICAnZnVuY3Rpb24nOiBTeW1ib2xUeXBlLkZVTkNUSU9OLFxuICAnbWV0aG9kJzogU3ltYm9sVHlwZS5NRVRIT0QsXG4gICdsb2NhbCc6IFN5bWJvbFR5cGUuTE9DQUwsXG59O1xuXG4vLyBTeW1ib2wgdHlwZXMgd2UgY2FuIGdldCByZWZlcmVuY2VzIGZvci5cbmNvbnN0IFNZTUJPTF9UWVBFU19XSVRIX1JFRkVSRU5DRVMgPSBuZXcgU2V0KFtcbiAgU3ltYm9sVHlwZS5DTEFTUyxcbiAgU3ltYm9sVHlwZS5GVU5DVElPTixcbiAgU3ltYm9sVHlwZS5NRVRIT0QsXG5dKTtcblxuZnVuY3Rpb24gZ2V0U3ltYm9sVHlwZShpbnB1dDogc3RyaW5nKSB7XG4gIGxldCBzeW1ib2xUeXBlID0gc3RyaW5nVG9TeW1ib2xUeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBzeW1ib2xUeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIHN5bWJvbFR5cGUgPSBTeW1ib2xUeXBlLk1FVEhPRDtcbiAgfVxuICByZXR1cm4gc3ltYm9sVHlwZTtcbn1cblxuY29uc3Qgc2VydmVyQ29tcGxldGlvblR5cGVzID0gbmV3IFNldChbXG4gIENvbXBsZXRpb25UeXBlLklELFxuICBDb21wbGV0aW9uVHlwZS5ORVcsXG4gIENvbXBsZXRpb25UeXBlLlRZUEUsXG5dKTtcblxuZnVuY3Rpb24gc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKHR5cGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gc2VydmVyQ29tcGxldGlvblR5cGVzLmhhcyh0eXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NDb21wbGV0aW9ucyhjb21wbGV0aW9uc1Jlc3BvbnNlOiBBcnJheTxIYWNrQ29tcGxldGlvbj4pOlxuICAgIEFycmF5PENvbXBsZXRpb25SZXN1bHQ+IHtcbiAgcmV0dXJuIGNvbXBsZXRpb25zUmVzcG9uc2UubWFwKGNvbXBsZXRpb24gPT4ge1xuICAgIGNvbnN0IHtuYW1lLCBmdW5jX2RldGFpbHM6IGZ1bmN0aW9uRGV0YWlsc30gPSBjb21wbGV0aW9uO1xuICAgIGxldCB7dHlwZX0gPSBjb21wbGV0aW9uO1xuICAgIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignKCcpID09PSAwICYmIHR5cGUubGFzdEluZGV4T2YoJyknKSA9PT0gdHlwZS5sZW5ndGggLSAxKSB7XG4gICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoMSwgdHlwZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgbGV0IG1hdGNoU25pcHBldCA9IG5hbWU7XG4gICAgaWYgKGZ1bmN0aW9uRGV0YWlscykge1xuICAgICAgY29uc3Qge3BhcmFtc30gPSBmdW5jdGlvbkRldGFpbHM7XG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIHNuaXBwZXQ6IGUuZy4gbXlGdW5jdGlvbigkezE6JGFyZzF9LCAkezI6JGFyZzJ9KTtcbiAgICAgIGNvbnN0IHBhcmFtc1N0cmluZyA9IHBhcmFtcy5tYXAoXG4gICAgICAgIChwYXJhbSwgaW5kZXgpID0+ICckeycgKyAoaW5kZXggKyAxKSArICc6JyArIHBhcmFtLm5hbWUgKyAnfScpLmpvaW4oJywgJyk7XG4gICAgICBtYXRjaFNuaXBwZXQgPSBuYW1lICsgJygnICsgcGFyYW1zU3RyaW5nICsgJyknO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hTbmlwcGV0LFxuICAgICAgbWF0Y2hUZXh0OiBuYW1lLFxuICAgICAgbWF0Y2hUeXBlOiB0eXBlLFxuICAgIH07XG4gIH0pO1xufVxuXG4vLyBDYWxjdWxhdGUgdGhlIG9mZnNldCBvZiB0aGUgY3Vyc29yIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZS5cbi8vIFRoZW4gaW5zZXJ0IEFVVE8zMzIgaW4gYXQgdGhpcyBvZmZzZXQuIChIYWNrIHVzZXMgdGhpcyBhcyBhIG1hcmtlci4pXG5leHBvcnQgZnVuY3Rpb24gbWFya0ZpbGVGb3JDb21wbGV0aW9uKGNvbnRlbnRzOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNvbnRlbnRzLnN1YnN0cmluZygwLCBvZmZzZXQpICtcbiAgICAgICdBVVRPMzMyJyArIGNvbnRlbnRzLnN1YnN0cmluZyhvZmZzZXQsIGNvbnRlbnRzLmxlbmd0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRGVmaW5pdGlvbnNGb3JYaHAoXG4gIGRlZmluaXRpb25SZXN1bHQ6ID9IYWNrRGVmaW5pdGlvblJlc3VsdCxcbiAgY29sdW1uOiBudW1iZXIsXG4gIGxpbmVUZXh0OiBzdHJpbmcsXG4pOiBBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+IHtcbiAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHtkZWZpbml0aW9uc30gPSBkZWZpbml0aW9uUmVzdWx0O1xuICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4ge1xuICAgIGxldCB7bmFtZX0gPSBkZWZpbml0aW9uO1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgLy8gWEhQIGNsYXNzIG5hbWUsIHVzYWdlcyBvbWl0IHRoZSBsZWFkaW5nICc6Jy5cbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvbkluZGV4ID0gbGluZVRleHQuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoXG4gICAgICBkZWZpbml0aW9uSW5kZXggPT09IC0xIHx8XG4gICAgICBkZWZpbml0aW9uSW5kZXggPj0gY29sdW1uIHx8XG4gICAgICAheGhwQ2hhclJlZ2V4LnRlc3QobGluZVRleHQuc3Vic3RyaW5nKGRlZmluaXRpb25JbmRleCwgY29sdW1uKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgICBzZWFyY2hTdGFydENvbHVtbjogZGVmaW5pdGlvbkluZGV4LFxuICAgICAgICBzZWFyY2hFbmRDb2x1bW46IGRlZmluaXRpb25JbmRleCArIGRlZmluaXRpb24ubmFtZS5sZW5ndGgsXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG4iXX0=