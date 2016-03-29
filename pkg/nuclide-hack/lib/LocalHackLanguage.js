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

exports.getSymbolType = getSymbolType;
exports.processCompletions = processCompletions;
exports.markFileForCompletion = markFileForCompletion;
exports.processDefinitionsForXhp = processDefinitionsForXhp;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TypedRegions = require('./TypedRegions');

var _nuclideRemoteUri = require('../../nuclide-remote-uri');

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

  function LocalHackLanguage(hackService, hhAvailable, basePath, initialFileUri) {
    _classCallCheck(this, LocalHackLanguage);

    this._hackService = hackService;
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
        var completionsResult = yield this._hackService.getCompletions(filePath, markedContents);
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
      var dependenciesResult = yield this._hackService.getDependencies(this._initialFileUri, response.deps);
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
    value: _asyncToGenerator(function* (filePath, contents, line, col) {
      var localPath = (0, _nuclideRemoteUri.getPath)(filePath);
      yield this.updateFile(localPath, contents);
      var webWorkerMessage = { cmd: 'hh_find_lvar_refs', args: [localPath, line, col] };
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
      var diagnosticResult = null;
      try {
        diagnosticResult = yield this._hackService.getDiagnostics(filePath, '');
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
      var regions = yield this._hackService.getTypedRegions(filePath);
      return (0, _TypedRegions.convertTypedRegionsToCoverageRegions)(regions);
    })
  }, {
    key: 'getOutline',
    value: function getOutline(filePath, contents) {
      return this._hackService.getOutline(filePath, contents);
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
      var definitionResult = yield this._hackService.getDefinition(filePath, symbol.name, symbol.type);
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
      var definitionResult = yield this._hackService.getIdentifierDefinition(filePath, contents, lineNumber, column);
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
      var definitionResult = yield this._hackService.getDefinition(filePath, search, _nuclideHackCommon.SymbolType.UNKNOWN);
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
    value: _asyncToGenerator(function* (filePath, contents, expression, lineNumber, column) {
      var localPath = (0, _nuclideRemoteUri.getPath)(filePath);
      if (!expression.startsWith('$')) {
        return null;
      }
      yield this.updateFile(localPath, contents);
      var webWorkerMessage = { cmd: 'hh_infer_type', args: [localPath, lineNumber, column] };

      var _ref5 = yield this._hackWorker.runWorkerTask(webWorkerMessage);

      var type = _ref5.type;

      return type;
    })
  }, {
    key: '_getReferences',
    value: _asyncToGenerator(function* (filePath, contents, symbol) {
      var referencesResult = yield this._hackService.getReferences(filePath, symbol.name, symbol.type);
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

exports.SYMBOL_TYPES_WITH_REFERENCES = SYMBOL_TYPES_WITH_REFERENCES;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkxvY2FsSGFja0xhbmd1YWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OzRCQTBCaUMsZ0JBQWdCOztnQ0FJSCwwQkFBMEI7OzhCQUNoRCx1QkFBdUI7OzhCQUMzQix1QkFBdUI7O29CQUNkLE1BQU07OzBCQUNaLGNBQWM7Ozs7aUNBQ0ksMkJBQTJCOzs7QUFJcEUsSUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDOztBQUUvQixJQUFNLFlBQVksR0FBRyxRQUFRLENBQUM7QUFDOUIsSUFBTSxtQkFBbUIsR0FBRyxrQ0FBa0MsQ0FBQzs7QUFFL0QsSUFBTSwrQkFBK0IsR0FBRyxLQUFLLENBQUM7QUFDOUMsSUFBTSx5QkFBeUIsR0FBRyxxQkFBcUIsQ0FBQztBQUN4RCxJQUFNLHlCQUF5QixHQUFHLEtBQUssQ0FBQzs7Ozs7Ozs7SUFPM0IsaUJBQWlCOzs7Ozs7O0FBZ0JqQixXQWhCQSxpQkFBaUIsQ0FpQnhCLFdBQXdCLEVBQ3hCLFdBQW9CLEVBQ3BCLFFBQWlCLEVBQ2pCLGNBQTBCLEVBQzVCOzBCQXJCUyxpQkFBaUI7O0FBc0IxQixRQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztBQUNoQyxRQUFJLENBQUMsWUFBWSxHQUFHLFdBQVcsQ0FBQztBQUNoQyxRQUFJLENBQUMsV0FBVyxHQUFHLDZCQUFnQixDQUFDO0FBQ3BDLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2xDLFFBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO0FBQzFCLFFBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0FBQ3RDLFFBQUksQ0FBQyw4QkFBOEIsR0FBRyxJQUFJLENBQUM7QUFDM0MsUUFBSSxDQUFDLFFBQVEsR0FBRyxtQkFBYSxDQUFDOztBQUU5QixRQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDckIsVUFBSSxDQUFDLGdDQUFnQyxFQUFFLENBQUM7S0FDekM7R0FDRjs7ZUFsQ1UsaUJBQWlCOztXQW9DSSw0Q0FBRzs7Ozs7QUFHakMsVUFBSSx5QkFBeUIsR0FBRyxLQUFLLENBQUM7O0FBRXRDLFVBQU0sd0JBQXdCLEdBQUcsU0FBM0Isd0JBQXdCLEdBQVM7QUFDckMsaUNBQXlCLEdBQUcsS0FBSyxDQUFDO09BQ25DLENBQUM7O0FBRUYsVUFBSSxDQUFDLDJCQUEyQixHQUFHLFdBQVcsQ0FBQyxZQUFNO0FBQ25ELFlBQUkseUJBQXlCLEVBQUU7QUFDN0IsaUJBQU87U0FDUjtBQUNELGlDQUF5QixHQUFHLElBQUksQ0FBQztBQUNqQyxjQUFLLGtCQUFrQixFQUFFLENBQUMsSUFBSSxDQUFDLHdCQUF3QixFQUFFLHdCQUF3QixDQUFDLENBQUM7T0FDcEYsRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO0tBQ3JDOzs7V0FFTSxtQkFBRztBQUNSLFVBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDM0IsbUJBQWEsQ0FBQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsQ0FBQztLQUNqRDs7OzZCQUVtQixXQUNsQixRQUFvQixFQUNwQixRQUFnQixFQUNoQixNQUFjLEVBQ29CO0FBQ2xDLFVBQU0sY0FBYyxHQUFHLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvRCxVQUFNLFNBQVMsR0FBRywrQkFBUSxRQUFRLENBQUMsQ0FBQztBQUNwQyxZQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxDQUFDO0FBQ2pELFVBQU0sZ0JBQWdCLEdBQUcsRUFBQyxHQUFHLEVBQUUsa0JBQWtCLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQztBQUN0RSxVQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEUsVUFBTSxjQUFjLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1VBQzlELFdBQVcsR0FBSSxRQUFRLENBQXZCLFdBQVc7O0FBQ2hCLFVBQUksd0JBQXdCLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFO0FBQ25FLFlBQU0saUJBQWlCLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLENBQUM7QUFDM0YsWUFBSSxpQkFBaUIsRUFBRTtBQUNyQixxQkFBVyxHQUFHLEFBQUUsaUJBQWlCLENBQStCLFdBQVcsQ0FBQztTQUM3RTtPQUNGO0FBQ0QsYUFBTyxrQkFBa0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUN4Qzs7OzZCQUVlLFdBQUMsSUFBWSxFQUFFLFFBQWdCLEVBQVc7QUFDeEQsVUFBSSxRQUFRLEtBQUssSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUNoRCxZQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMxQyxZQUFNLGdCQUFnQixHQUFHLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEVBQUMsQ0FBQztBQUN0RSxZQUFJLENBQUMsOEJBQThCLEdBQUcsS0FBSyxDQUFDO0FBQzVDLGVBQU8sTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO09BQy9EO0tBQ0Y7Ozs2QkFFdUIsYUFBWTtBQUNsQyxVQUFNLGdCQUFnQixHQUFHLEVBQUMsR0FBRyxFQUFFLGFBQWEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFDeEQsVUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hFLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUN6QixZQUFJLENBQUMsSUFBSSxDQUFDLDhCQUE4QixFQUFFO0FBQ3hDLGNBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLENBQUM7U0FDL0M7QUFDRCxZQUFJLENBQUMsOEJBQThCLEdBQUcsSUFBSSxDQUFDO0FBQzNDLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsOEJBQThCLEdBQUcsS0FBSyxDQUFDO0FBQzVDLFVBQU0sa0JBQWtCLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FDaEUsSUFBSSxDQUFDLGVBQWUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUNwQyxDQUFDO0FBQ0YsVUFBSSxDQUFDLGtCQUFrQixFQUFFO0FBQ3ZCLGVBQU87T0FDUjtVQUNNLFlBQVksR0FBSSxrQkFBa0IsQ0FBbEMsWUFBWTs7OztBQUduQix3QkFBbUMsWUFBWSxFQUFFOzs7WUFBckMsUUFBUTtZQUFFLFFBQVE7O0FBQzVCLGNBQU0sSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztPQUNqRDs7S0FFRjs7OzZCQUVxQixXQUFDLElBQVksRUFBRSxRQUFnQixFQUFXO0FBQzlELFVBQUksUUFBUSxLQUFLLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7QUFDaEQsWUFBTSxnQkFBZ0IsR0FBRyxFQUFDLEdBQUcsRUFBRSxZQUFZLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxFQUFDLENBQUM7QUFDckUsY0FBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFDLFlBQVksRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO09BQzlFO0tBQ0Y7Ozs7Ozs7Ozs7OztXQVU0Qix5Q0FBWTtBQUN2QyxhQUFPLElBQUksQ0FBQyw4QkFBOEIsQ0FBQztLQUM1Qzs7O1dBRTRCLHVDQUFDLFFBQXVCLEVBQWU7QUFDbEUsYUFBTyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyx5QkFBeUIsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUM5RDs7OzZCQUVpQixXQUNoQixRQUFnQixFQUNoQixhQUFxQixFQUNyQixXQUFtQixFQUNGO0FBQ2pCLFVBQU0sZ0JBQWdCLEdBQUcsRUFBQyxHQUFHLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxhQUFhLEVBQUUsV0FBVyxDQUFDLEVBQUMsQ0FBQztBQUMxRixVQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEUsVUFBTSxZQUFZLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQztBQUM1QyxVQUFJLFlBQVksRUFBRTtBQUNoQixZQUFJLFlBQVksS0FBSyxhQUFhLEVBQUU7QUFDbEMsZ0JBQU0sSUFBSSxLQUFLLENBQUMsOENBQThDLENBQUMsQ0FBQztTQUNqRSxNQUFNLElBQUksWUFBWSxLQUFLLGVBQWUsRUFBRTtBQUMzQyxnQkFBTSxJQUFJLEtBQUssQ0FBQywrREFBK0QsQ0FBQyxDQUFDO1NBQ2xGLE1BQU07QUFDTCxnQkFBTSxJQUFJLEtBQUssQ0FBQyw0QkFBNEIsR0FBRyxZQUFZLENBQUMsQ0FBQztTQUM5RDtPQUNGLE1BQU07QUFDTCxlQUFPLFFBQVEsQ0FBQyxNQUFNLENBQUM7T0FDeEI7S0FDRjs7OzZCQUVvQixXQUNuQixRQUFvQixFQUNwQixRQUFnQixFQUNoQixJQUFZLEVBQ1osR0FBVyxFQUNpQjtBQUM1QixVQUFNLFNBQVMsR0FBRywrQkFBUSxRQUFRLENBQUMsQ0FBQztBQUNwQyxZQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNDLFVBQU0sZ0JBQWdCLEdBQUcsRUFBQyxHQUFHLEVBQUUsbUJBQW1CLEVBQUUsSUFBSSxFQUFFLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxHQUFHLENBQUMsRUFBQyxDQUFDO0FBQ2xGLFVBQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN4RSxhQUFPLFFBQVEsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUMzQixVQUFBLFFBQVE7ZUFBSSxnQkFDVixDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQzVDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUN2QztPQUFBLENBQ0YsQ0FBQztLQUNIOzs7NkJBRW1CLFdBQ2xCLElBQWdCLEVBQ2hCLFFBQWdCLEVBQzRCO0FBQzVDLFVBQUksSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFO0FBQzFCLGVBQU8sTUFBTSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7T0FDL0M7O21CQUV5Qyw2QkFBTSxJQUFJLENBQUM7O1VBQTlDLFFBQVEsVUFBUixRQUFRO1VBQUUsSUFBSSxVQUFKLElBQUk7VUFBUSxTQUFTLFVBQWYsSUFBSTs7QUFDM0IsWUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUMzQyxVQUFNLGdCQUFnQixHQUFHLEVBQUMsR0FBRyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxTQUFTLENBQUMsRUFBQyxDQUFDOztrQkFDbEQsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQzs7VUFBaEUsTUFBTSxTQUFOLE1BQU07O0FBQ2IsVUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDcEMsY0FBTSxDQUFDLE9BQU8sQ0FBQyxVQUFBLEtBQUssRUFBSTtBQUN0QixlQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU8sRUFBSTtBQUMvQixnQkFBSSxPQUFPLENBQUMsSUFBSSxJQUFJLElBQUksRUFBRTtBQUN4QixxQkFBTyxDQUFDLElBQUksR0FBRyx1Q0FBZ0IsUUFBUSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO2FBQzVFO1dBQ0YsQ0FBQyxDQUFDO1NBQ0osQ0FBQyxDQUFDO09BQ0o7QUFDRCxhQUFPLE1BQU0sQ0FBQztLQUNmOzs7NkJBRTBCLFdBQ3pCLFFBQW9CLEVBQ3dCO0FBQzVDLFVBQUksZ0JBQWdCLEdBQUcsSUFBSSxDQUFDO0FBQzVCLFVBQUk7QUFDRix3QkFBZ0IsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUN6RSxDQUFDLE9BQU8sR0FBRyxFQUFFO0FBQ1osd0NBQVcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDdkIsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELFVBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyQix3Q0FBVyxDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO0FBQ3BELGVBQU8sRUFBRSxDQUFDO09BQ1g7QUFDRCxVQUFNLGVBQWUsR0FBSyxnQkFBZ0IsQUFBOEIsQ0FBQztBQUN6RSxhQUFPLGVBQWUsQ0FBQyxRQUFRLENBQUM7S0FDakM7Ozs2QkFFb0IsV0FDbkIsUUFBb0IsRUFDZ0I7QUFDcEMsVUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNsRSxhQUFPLHdEQUFxQyxPQUFPLENBQUMsQ0FBQztLQUN0RDs7O1dBRVMsb0JBQ1IsUUFBb0IsRUFDcEIsUUFBZ0IsRUFDTztBQUN2QixhQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN6RDs7OzZCQUVrQixXQUNmLFFBQW9CLEVBQ3BCLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLE1BQWMsRUFDZCxRQUFnQixFQUNvQjs7O0FBR3RDLFVBQU0sZ0JBQWdCLEdBQUcsTUFBTSxJQUFJLENBQUMsNEJBQTRCLENBQzlELFFBQVEsRUFDUixRQUFRLEVBQ1IsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLENBQ1QsQ0FBQztBQUNGLFVBQUksZ0JBQWdCLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUNqQyxlQUFPLGdCQUFnQixDQUFDO09BQ3pCO0FBQ0QsVUFBTSxnQkFBZ0IsR0FDcEIsTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDOztBQUVoQixVQUFJLENBQUMsNEJBQTRCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDOztBQUV6RSxVQUFJLENBQUMsNkJBQTZCLENBQUMsUUFBUSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUM7O0FBRTlELFVBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FDOUUsQ0FBQyxDQUFDOzs7QUFHTCxVQUFNLGlCQUFpQixHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUN0RSxhQUFPLHNCQUFNLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxVQUFBLGdCQUFnQjtlQUFJLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDO09BQUEsQ0FBQyxJQUNsRixzQkFBTSxJQUFJLENBQUMsaUJBQWlCLEVBQUUsVUFBQSxnQkFBZ0I7ZUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEdBQUcsQ0FBQztPQUFBLENBQUMsSUFDOUUsRUFBRSxDQUFDO0tBQ1Q7Ozs2QkFFNkIsV0FDNUIsSUFBWSxFQUNaLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLE1BQWMsRUFDa0I7O0FBRWhDLFlBQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDdEMsVUFBTSxnQkFBZ0IsR0FBRyxFQUFDLEdBQUcsRUFBRSxvQkFBb0IsRUFBRSxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxFQUFDLENBQUM7QUFDdkYsVUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3hFLFVBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ2xCLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxVQUFNLFVBQVUsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZELFVBQU0sUUFBUSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUM7QUFDOUIsYUFBTztBQUNMLFlBQUksRUFBRSxRQUFRLENBQUMsSUFBSTtBQUNuQixZQUFJLEVBQUUsVUFBVTtBQUNoQixZQUFJLEVBQUUsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ3ZCLGNBQU0sRUFBRSxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUM7QUFDL0IsY0FBTSxFQUFFLFFBQVEsQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDLFVBQVUsR0FBRyxDQUFDO09BQ3BELENBQUM7S0FDSDs7Ozs7Ozs7NkJBTTZDLFdBQzVDLElBQVksRUFDWixRQUFnQixFQUNoQixVQUFrQixFQUNsQixNQUFjLEVBQ2QsT0FBZ0IsRUFDZ0I7OztBQUNoQyxhQUFPLElBQUksQ0FBQyxvQkFBb0IsQ0FDOUI7ZUFBTSxPQUFLLHdCQUF3QixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQztPQUFBLEVBQ3ZFLFVBQUEsQ0FBQztlQUFJLENBQUMsSUFBSSxJQUFJO09BQUEsRUFDZCxPQUFPLENBQ1IsQ0FBQztLQUNIOzs7NkJBRWlDLFdBQ2hDLFFBQW9CLEVBQ3BCLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLE1BQWMsRUFDc0I7QUFDcEMsVUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLHlCQUF5QixFQUFFOztBQUUvQyxlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUk7QUFDRixjQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsd0JBQXdCLENBQUMsK0JBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztPQUMvRixDQUFDLE9BQU8sR0FBRyxFQUFFOztBQUVaLHdDQUFXLENBQUMsSUFBSSxDQUFDLHFDQUFxQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQzdELGVBQU8sRUFBRSxDQUFDO09BQ1g7QUFDRCxVQUFJLENBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtBQUMzQixlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsVUFBTSxnQkFBZ0IsR0FDcEIsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUUsVUFBSSxDQUFDLGdCQUFnQixFQUFFO0FBQ3JCLGVBQU8sRUFBRSxDQUFDO09BQ1g7QUFDRCxhQUFPLEFBQUUsZ0JBQWdCLENBQThCLFdBQVcsQ0FBQztLQUNwRTs7OzZCQUVxQyxXQUNsQyxRQUFvQixFQUNwQixRQUFnQixFQUNoQixVQUFrQixFQUNsQixNQUFjLEVBQ3NCO0FBQ3RDLFVBQUksQ0FBQyxRQUFRLElBQUksUUFBUSxDQUFDLE1BQU0sR0FBRyx5QkFBeUIsRUFBRTs7QUFFNUQsZUFBTyxFQUFFLENBQUM7T0FDWDs7b0JBQ3lDLDZCQUFNLFFBQVEsQ0FBQzs7VUFBbEQsUUFBUSxXQUFSLFFBQVE7VUFBRSxJQUFJLFdBQUosSUFBSTtVQUFRLFNBQVMsV0FBZixJQUFJOztBQUMzQixZQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNDLFVBQU0sZ0JBQWdCLEdBQUcsRUFBQyxHQUFHLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUMsQ0FBQztBQUN0RixVQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEUsVUFBTSxRQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsSUFBSSxFQUFFLENBQUM7QUFDcEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDdEIsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELGFBQU8sQ0FBQztBQUNOLFlBQUksRUFBRSxBQUFDLFFBQVEsSUFBSSxJQUFJLEdBQ25CLHVDQUFnQixRQUFRLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsUUFBUSxDQUFDLEdBQ2hFLFFBQVEsQ0FBQyxRQUFRO0FBQ3JCLFlBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxHQUFHLENBQUM7QUFDdkIsY0FBTSxFQUFFLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQztBQUMvQixjQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsVUFBVSxHQUFHLENBQUM7QUFDbkQsWUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO0FBQ25CLGFBQUssRUFBRSxRQUFRLENBQUMsS0FBSztBQUNyQixzQkFBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjO09BQ3hDLENBQUMsQ0FBQztLQUNKOzs7NkJBRWlDLFdBQzlCLFFBQW9CLEVBQ3BCLFFBQWdCLEVBQ2hCLFVBQWtCLEVBQ2xCLE1BQWMsRUFDZCxRQUFnQixFQUNrQjtBQUNwQyxVQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FDdEUsUUFBUSxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUN2QyxDQUFDO0FBQ0YsYUFBTyx3QkFBd0IsQ0FBQyxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDckU7Ozs2QkFFa0MsV0FDakMsUUFBb0IsRUFDcEIsUUFBZ0IsRUFDaEIsTUFBYyxFQUNzQjt1Q0FDUCxJQUFJLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQzs7VUFBdEUsTUFBTSw4QkFBTixNQUFNO1VBQUUsS0FBSyw4QkFBTCxLQUFLO1VBQUUsR0FBRyw4QkFBSCxHQUFHOztBQUN6QixVQUFJLENBQUMsTUFBTSxFQUFFO0FBQ1gsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELFVBQU0sZ0JBQWdCLEdBQ3BCLE1BQU0sSUFBSSxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSw4QkFBVyxPQUFPLENBQUMsQ0FBQztBQUM5RSxVQUFJLENBQUMsZ0JBQWdCLEVBQUU7QUFDckIsZUFBTyxFQUFFLENBQUM7T0FDWDtBQUNELFVBQU0sV0FBVyxHQUFHLEFBQUUsZ0JBQWdCLENBQThCLFdBQVcsQ0FBQztBQUNoRixhQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVOzRCQUM1QixVQUFVO0FBQ2IsMkJBQWlCLEVBQUUsS0FBSztBQUN4Qix5QkFBZSxFQUFFLEdBQUc7O09BQ3BCLENBQUMsQ0FBQztLQUNMOzs7V0FFd0IsbUNBQ3ZCLFFBQWdCLEVBQ2hCLE1BQWMsRUFDZ0M7QUFDOUMsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ2xCLFVBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQzs7QUFFbkIsVUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ2xCLFVBQUksUUFBUSxZQUFBLENBQUM7QUFDYixhQUFTLFFBQVEsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUc7QUFDdkQsWUFBTSxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDekMsWUFBSSxNQUFNLElBQUksYUFBYSxJQUFJLE1BQU0sR0FBSSxhQUFhLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQUFBQyxFQUFFO0FBQzVFLGVBQUssR0FBRyxJQUFJLENBQUM7QUFDYixnQkFBTTtTQUNQO09BQ0Y7O0FBRUQsVUFBTSxlQUFlLEdBQUcsS0FBSyxHQUFHLFlBQVksR0FBRyxhQUFhLENBQUM7OztBQUc3RCxhQUFPLEtBQUssSUFBSSxDQUFDLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7QUFDakUsYUFBSyxFQUFFLENBQUM7T0FDVDtBQUNELFVBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsRUFBRTtBQUMzQixhQUFLLEVBQUUsQ0FBQztPQUNUO0FBQ0QsV0FBSyxFQUFFLENBQUM7QUFDUixVQUFJLEdBQUcsR0FBRyxNQUFNLENBQUM7QUFDakIsYUFBTyxlQUFlLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtBQUNqRCxXQUFHLEVBQUUsQ0FBQztPQUNQO0FBQ0QsWUFBTSxHQUFHLFFBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDOztBQUV4QyxVQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFDcEMsY0FBTSxHQUFHLEdBQUcsR0FBRyxNQUFNLENBQUM7T0FDdkI7QUFDRCxhQUFPLEVBQUMsTUFBTSxFQUFOLE1BQU0sRUFBRSxLQUFLLEVBQUwsS0FBSyxFQUFFLEdBQUcsRUFBSCxHQUFHLEVBQUMsQ0FBQztLQUM3Qjs7OzZCQUVZLFdBQ1gsUUFBb0IsRUFDcEIsUUFBZ0IsRUFDaEIsVUFBa0IsRUFDbEIsVUFBa0IsRUFDbEIsTUFBYyxFQUNJO0FBQ2xCLFVBQU0sU0FBUyxHQUFHLCtCQUFRLFFBQVEsQ0FBQyxDQUFDO0FBQ3BDLFVBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQy9CLGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxZQUFNLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzNDLFVBQU0sZ0JBQWdCLEdBQUcsRUFBQyxHQUFHLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxDQUFDLEVBQUMsQ0FBQzs7a0JBQ3hFLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUM7O1VBQTlELElBQUksU0FBSixJQUFJOztBQUNYLGFBQU8sSUFBSSxDQUFDO0tBQ2I7Ozs2QkFFbUIsV0FDbEIsUUFBb0IsRUFDcEIsUUFBZ0IsRUFDaEIsTUFBNEIsRUFDSTtBQUNoQyxVQUFNLGdCQUFnQixHQUNwQixNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1RSxhQUFTLGdCQUFnQixDQUE4QjtLQUN4RDs7OzZCQUVtQixXQUNsQixRQUFvQixFQUNwQixRQUFnQixFQUNoQixJQUFZLEVBQ1osTUFBYyxFQUNxRTtBQUNuRixVQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyx3Q0FBd0MsQ0FDaEUsK0JBQVEsUUFBUSxDQUFDLEVBQ2pCLFFBQVEsRUFDUixJQUFJLEdBQUcsQ0FBQyxFQUNSLE1BQU0sR0FBRyxDQUFDLENBQ1gsQ0FBQztBQUNGLFVBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyw0QkFBNEIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxFQUFFO0FBQzdELGVBQU8sSUFBSSxDQUFDO09BQ2I7QUFDRCxVQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9FLFVBQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyQixlQUFPLElBQUksQ0FBQztPQUNiO1VBQ00sUUFBUSxHQUFnQixnQkFBZ0IsQ0FBeEMsUUFBUTtVQUFFLFVBQVUsR0FBSSxnQkFBZ0IsQ0FBOUIsVUFBVTs7QUFDM0IsYUFBTyxFQUFDLE9BQU8sRUFBRSxRQUFRLEVBQUUsVUFBVSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFWLFVBQVUsRUFBQyxDQUFDO0tBQ2pFOzs7V0FFVSx1QkFBWTtBQUNyQixhQUFPLElBQUksQ0FBQyxTQUFTLENBQUM7S0FDdkI7OztXQUVjLDJCQUFZO0FBQ3pCLGFBQU8sSUFBSSxDQUFDLFlBQVksQ0FBQztLQUMxQjs7Ozs7Ozs7Ozs2QkFRNEIsV0FDM0IsSUFBd0IsRUFDeEIsVUFBb0MsRUFDcEMsU0FBa0IsRUFDTjs7O0FBQ1osVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzdCLGFBQU8sQ0FBQyxTQUFTLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLFNBQVMsR0FBRyxTQUFTLEVBQUU7QUFDdkQsWUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLEVBQUUsQ0FBQztBQUM1QixZQUFJLEFBQUMsVUFBVSxJQUFJLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsRUFBRTtBQUM5RSxpQkFBTyxNQUFNLENBQUM7U0FDZjs7QUFFRCxjQUFNLElBQUksT0FBTyxDQUFDLFVBQUEsT0FBTyxFQUFJOztBQUMzQixjQUFNLFlBQVksR0FBRyxPQUFLLDZCQUE2QixDQUFDLFlBQU07QUFDNUQsd0JBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN2QixtQkFBTyxFQUFFLENBQUM7V0FDWCxDQUFDLENBQUM7U0FDSixDQUFDLENBQUM7T0FDSjtBQUNELFlBQU0sSUFBSSxLQUFLLENBQUMseUNBQXlDLENBQUMsQ0FBQztLQUM1RDs7O1NBbGhCVSxpQkFBaUI7Ozs7O0FBc2hCOUIsSUFBTSxzQkFBc0IsR0FBRztBQUM3QixNQUFJLEVBQUUsa0NBQWUsRUFBRTtBQUN2QixPQUFLLEVBQUUsa0NBQWUsR0FBRztBQUN6QixRQUFNLEVBQUUsa0NBQWUsSUFBSTtBQUMzQixhQUFXLEVBQUUsa0NBQWUsU0FBUztBQUNyQyxPQUFLLEVBQUUsa0NBQWUsR0FBRztDQUMxQixDQUFDOztBQUVGLFNBQVMsaUJBQWlCLENBQUMsS0FBYSxFQUFFO0FBQ3hDLE1BQUksY0FBYyxHQUFHLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25ELE1BQUksT0FBTyxjQUFjLEtBQUssV0FBVyxFQUFFO0FBQ3pDLGtCQUFjLEdBQUcsa0NBQWUsSUFBSSxDQUFDO0dBQ3RDO0FBQ0QsU0FBTyxjQUFjLENBQUM7Q0FDdkI7O0FBRUQsSUFBTSxrQkFBa0IsR0FBRztBQUN6QixTQUFPLEVBQUUsOEJBQVcsS0FBSztBQUN6QixZQUFVLEVBQUUsOEJBQVcsUUFBUTtBQUMvQixVQUFRLEVBQUUsOEJBQVcsTUFBTTtBQUMzQixTQUFPLEVBQUUsOEJBQVcsS0FBSztDQUMxQixDQUFDOzs7QUFHSyxJQUFNLDRCQUE0QixHQUFHLElBQUksR0FBRyxDQUFDLENBQ2xELDhCQUFXLEtBQUssRUFDaEIsOEJBQVcsUUFBUSxFQUNuQiw4QkFBVyxNQUFNLENBQ2xCLENBQUMsQ0FBQzs7OztBQUVJLFNBQVMsYUFBYSxDQUFDLEtBQWEsRUFBbUI7QUFDNUQsTUFBSSxVQUFVLEdBQUcsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDM0MsTUFBSSxPQUFPLFVBQVUsS0FBSyxXQUFXLEVBQUU7QUFDckMsY0FBVSxHQUFHLDhCQUFXLE1BQU0sQ0FBQztHQUNoQztBQUNELFNBQU8sVUFBVSxDQUFDO0NBQ25COztBQUVELElBQU0scUJBQXFCLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FDcEMsa0NBQWUsRUFBRSxFQUNqQixrQ0FBZSxHQUFHLEVBQ2xCLGtDQUFlLElBQUksQ0FDcEIsQ0FBQyxDQUFDOztBQUVILFNBQVMsd0JBQXdCLENBQUMsSUFBWSxFQUFXO0FBQ3ZELFNBQU8scUJBQXFCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0NBQ3hDOztBQUVNLFNBQVMsa0JBQWtCLENBQUMsbUJBQTBDLEVBQ2pEO0FBQzFCLFNBQU8sbUJBQW1CLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO1FBQ3BDLElBQUksR0FBbUMsVUFBVSxDQUFqRCxJQUFJO1FBQWdCLGVBQWUsR0FBSSxVQUFVLENBQTNDLFlBQVk7UUFDcEIsSUFBSSxHQUFJLFVBQVUsQ0FBbEIsSUFBSTs7QUFDVCxRQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2hGLFVBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksZUFBZSxFQUFFO1VBQ1osTUFBTSxHQUFJLGVBQWUsQ0FBekIsTUFBTTs7O0FBRWIsVUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FDN0IsVUFBQyxLQUFLLEVBQUUsS0FBSztlQUFLLElBQUksSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFBLEFBQUMsR0FBRyxHQUFHLEdBQUcsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHO09BQUEsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1RSxrQkFBWSxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsWUFBWSxHQUFHLEdBQUcsQ0FBQztLQUNoRDtBQUNELFdBQU87QUFDTCxrQkFBWSxFQUFaLFlBQVk7QUFDWixlQUFTLEVBQUUsSUFBSTtBQUNmLGVBQVMsRUFBRSxJQUFJO0tBQ2hCLENBQUM7R0FDSCxDQUFDLENBQUM7Q0FDSjs7Ozs7QUFJTSxTQUFTLHFCQUFxQixDQUFDLFFBQWdCLEVBQUUsTUFBYyxFQUFVO0FBQzlFLFNBQU8sUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQ2hDLFNBQVMsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7Q0FDN0Q7O0FBRU0sU0FBUyx3QkFBd0IsQ0FDdEMsZ0JBQXVDLEVBQ3ZDLE1BQWMsRUFDZCxRQUFnQixFQUNXO0FBQzNCLE1BQUksQ0FBQyxnQkFBZ0IsRUFBRTtBQUNyQixXQUFPLEVBQUUsQ0FBQztHQUNYO01BQ00sV0FBVyxHQUFJLGdCQUFnQixDQUEvQixXQUFXOztBQUNsQixTQUFPLFdBQVcsQ0FBQyxHQUFHLENBQUMsVUFBQSxVQUFVLEVBQUk7UUFDOUIsSUFBSSxHQUFJLFVBQVUsQ0FBbEIsSUFBSTs7QUFDVCxRQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7O0FBRXhCLFVBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQzFCO0FBQ0QsUUFBTSxlQUFlLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQyxRQUNFLGVBQWUsS0FBSyxDQUFDLENBQUMsSUFDdEIsZUFBZSxJQUFJLE1BQU0sSUFDekIsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEVBQy9EO0FBQ0EsYUFBTyxVQUFVLENBQUM7S0FDbkIsTUFBTTtBQUNMLDBCQUNLLFVBQVU7QUFDYix5QkFBaUIsRUFBRSxlQUFlO0FBQ2xDLHVCQUFlLEVBQUUsZUFBZSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTTtTQUN6RDtLQUNIO0dBQ0YsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiTG9jYWxIYWNrTGFuZ3VhZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtDb21wbGV0aW9uUmVzdWx0fSBmcm9tICcuL0hhY2tMYW5ndWFnZSc7XG5pbXBvcnQgdHlwZSB7XG4gIEhhY2tDb21wbGV0aW9uc1Jlc3VsdCxcbiAgSGFja0NvbXBsZXRpb24sXG4gIEhhY2tEaWFnbm9zdGljc1Jlc3VsdCxcbiAgSGFja0RpYWdub3N0aWMsXG4gIEhhY2tEZWZpbml0aW9uUmVzdWx0LFxuICBIYWNrU2VhcmNoUG9zaXRpb24sXG4gIEhhY2tSZWZlcmVuY2UsXG4gIEhhY2tSZWZlcmVuY2VzUmVzdWx0LFxuICBIYWNrT3V0bGluZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcbmltcG9ydCB0eXBlb2YgKiBhcyBIYWNrU2VydmljZSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge1N5bWJvbFR5cGVWYWx1ZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWNvbW1vbic7XG5pbXBvcnQge1R5cGVDb3ZlcmFnZVJlZ2lvbn0gZnJvbSAnLi9UeXBlZFJlZ2lvbnMnO1xuXG5pbXBvcnQgdHlwZSB7SGFja1N5bWJvbE5hbWVSZXN1bHR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi90eXBlcyc7XG5cbmltcG9ydCB7cGFyc2UsIGNyZWF0ZVJlbW90ZVVyaSwgZ2V0UGF0aH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jb21tb25zJztcbmltcG9ydCB7UmFuZ2UsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEhhY2tXb3JrZXIgZnJvbSAnLi9IYWNrV29ya2VyJztcbmltcG9ydCB7Q29tcGxldGlvblR5cGUsIFN5bWJvbFR5cGV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHtjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnN9IGZyb20gJy4vVHlwZWRSZWdpb25zJztcblxuLy8gVGhlIHdvcmQgY2hhciByZWdleCBpbmNsdWRlIFxcIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlZCBjbGFzc2VzLlxuY29uc3Qgd29yZENoYXJSZWdleCA9IC9bXFx3XFxcXF0vO1xuLy8gVGhlIHhocCBjaGFyIHJlZ2V4IGluY2x1ZGUgOiBhbmQgLSB0byBtYXRjaCB4aHAgdGFncyBsaWtlIDx1aTpidXR0b24tZ3JvdXA+LlxuY29uc3QgeGhwQ2hhclJlZ2V4ID0gL1tcXHc6LV0vO1xuY29uc3QgWEhQX0xJTkVfVEVYVF9SRUdFWCA9IC88KFthLXpdW2EtejAtOV8uOi1dKilbXj5dKlxcLz8+L2dpO1xuXG5jb25zdCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TID0gMTAwMDA7XG5jb25zdCBERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5UID0gJ2RlcGVuZGVuY2llcy1sb2FkZWQnO1xuY29uc3QgTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSA9IDEwMDAwO1xuXG4vKipcbiAqIFRoZSBIYWNrTGFuZ3VhZ2UgaXMgdGhlIGNvbnRyb2xsZXIgdGhhdCBzZXJ2ZXJzIGxhbmd1YWdlIHJlcXVlc3RzIGJ5IHRyeWluZyB0byBnZXQgd29ya2VyIHJlc3VsdHNcbiAqIGFuZC9vciByZXN1bHRzIGZyb20gSGFja1NlcnZpY2UgKHdoaWNoIHdvdWxkIGJlIGV4ZWN1dGluZyBoaF9jbGllbnQgb24gYSBzdXBwb3J0aW5nIHNlcnZlcilcbiAqIGFuZCBjb21iaW5pbmcgYW5kL29yIHNlbGVjdGluZyB0aGUgcmVzdWx0cyB0byBnaXZlIGJhY2sgdG8gdGhlIHJlcXVlc3Rlci5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsSGFja0xhbmd1YWdlIHtcblxuICBfaGFja1NlcnZpY2U6IEhhY2tTZXJ2aWNlO1xuICBfaGhBdmFpbGFibGU6IGJvb2xlYW47XG4gIF9oYWNrV29ya2VyOiBIYWNrV29ya2VyO1xuICBfcGF0aENvbnRlbnRzTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuICBfYmFzZVBhdGg6ID9zdHJpbmc7XG4gIF9pbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaTtcbiAgX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzOiBib29sZWFuO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIGBiYXNlUGF0aGAgc2hvdWxkIGJlIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIC5oaGNvbmZpZyBmaWxlIGlzIGxvY2F0ZWQuXG4gICAqIEl0IHNob3VsZCBvbmx5IGJlIG51bGwgaWYgY2xpZW50IGlzIG51bGwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGhhY2tTZXJ2aWNlOiBIYWNrU2VydmljZSxcbiAgICAgIGhoQXZhaWxhYmxlOiBib29sZWFuLFxuICAgICAgYmFzZVBhdGg6ID9zdHJpbmcsXG4gICAgICBpbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaVxuICApIHtcbiAgICB0aGlzLl9oYWNrU2VydmljZSA9IGhhY2tTZXJ2aWNlO1xuICAgIHRoaXMuX2hoQXZhaWxhYmxlID0gaGhBdmFpbGFibGU7XG4gICAgdGhpcy5faGFja1dvcmtlciA9IG5ldyBIYWNrV29ya2VyKCk7XG4gICAgdGhpcy5fcGF0aENvbnRlbnRzTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Jhc2VQYXRoID0gYmFzZVBhdGg7XG4gICAgdGhpcy5faW5pdGlhbEZpbGVVcmkgPSBpbml0aWFsRmlsZVVyaTtcbiAgICB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyA9IHRydWU7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBpZiAodGhpcy5faGhBdmFpbGFibGUpIHtcbiAgICAgIHRoaXMuX3NldHVwVXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwoKTtcbiAgICB9XG4gIH1cblxuICBfc2V0dXBVcGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCgpIHtcbiAgICAvLyBGZXRjaCBhbnkgZGVwZW5kZW5jaWVzIHRoZSBIYWNrV29ya2VyIG5lZWRzIGFmdGVyIGxlYXJuaW5nIGFib3V0IHRoaXMgZmlsZS5cbiAgICAvLyBXZSBkb24ndCBibG9jayBhbnkgcmVhbHRpbWUgbG9naWMgb24gdGhlIGRlcGVuZGVuY3kgZmV0Y2hpbmcgLSBpdCBjb3VsZCB0YWtlIGEgd2hpbGUuXG4gICAgbGV0IHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSBmYWxzZTtcblxuICAgIGNvbnN0IGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcyA9ICgpID0+IHtcbiAgICAgIHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAocGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gdHJ1ZTtcbiAgICAgIHRoaXMudXBkYXRlRGVwZW5kZW5jaWVzKCkudGhlbihmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMsIGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcyk7XG4gICAgfSwgVVBEQVRFX0RFUEVOREVOQ0lFU19JTlRFUlZBTF9NUyk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2hhY2tXb3JrZXIuZGlzcG9zZSgpO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29tcGxldGlvbnMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBvZmZzZXQ6IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PENvbXBsZXRpb25SZXN1bHQ+PiB7XG4gICAgY29uc3QgbWFya2VkQ29udGVudHMgPSBtYXJrRmlsZUZvckNvbXBsZXRpb24oY29udGVudHMsIG9mZnNldCk7XG4gICAgY29uc3QgbG9jYWxQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgbWFya2VkQ29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYXV0b19jb21wbGV0ZScsIGFyZ3M6IFtsb2NhbFBhdGhdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBjb21wbGV0aW9uVHlwZSA9IGdldENvbXBsZXRpb25UeXBlKHJlc3BvbnNlLmNvbXBsZXRpb25fdHlwZSk7XG4gICAgbGV0IHtjb21wbGV0aW9uc30gPSByZXNwb25zZTtcbiAgICBpZiAoc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKGNvbXBsZXRpb25UeXBlKSB8fCAhY29tcGxldGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjb21wbGV0aW9uc1Jlc3VsdCA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldENvbXBsZXRpb25zKGZpbGVQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgICBpZiAoY29tcGxldGlvbnNSZXN1bHQpIHtcbiAgICAgICAgY29tcGxldGlvbnMgPSAoKGNvbXBsZXRpb25zUmVzdWx0OiBhbnkpOiBIYWNrQ29tcGxldGlvbnNSZXN1bHQpLmNvbXBsZXRpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAuc2V0KHBhdGgsIGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYWRkX2ZpbGUnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY2llcygpOiBQcm9taXNlIHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9kZXBzJywgYXJnczogW119O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UuZGVwcy5sZW5ndGgpIHtcbiAgICAgIGlmICghdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQpO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGVwZW5kZW5jaWVzKFxuICAgICAgdGhpcy5faW5pdGlhbEZpbGVVcmksIHJlc3BvbnNlLmRlcHNcbiAgICApO1xuICAgIGlmICghZGVwZW5kZW5jaWVzUmVzdWx0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtkZXBlbmRlbmNpZXN9ID0gZGVwZW5kZW5jaWVzUmVzdWx0O1xuICAgIC8vIFNlcmlhbGx5IHVwZGF0ZSBkZXBlZG5lY2llcyBub3QgdG8gYmxvY2sgdGhlIHdvcmtlciBmcm9tIHNlcnZpbmcgb3RoZXIgZmVhdHVyZSByZXF1ZXN0cy5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGNvbnRlbnRzXSBvZiBkZXBlbmRlbmNpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlRGVwZW5kZW5jeShmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY3kocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2FkZF9kZXAnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlLCB7aXNEZXBlbmRlbmN5OiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHdheSB0byBlc3RpbWF0ZSBpZiBhbGwgSGFjayBkZXBlbmRlbmNpZXMgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgICogVGhpcyBmbGFnIGlzIHR1cm5lZCBvZmYgd2hlbiBhIGZpbGUgZ2V0cyB1cGRhdGVkIG9yIGFkZGVkLCBhbmQgZ2V0cyB0dXJuZWQgYmFjayBvblxuICAgKiBvbmNlIGB1cGRhdGVEZXBlbmRlbmNpZXMoKWAgcmV0dXJucyBubyBhZGRpdGlvbmFsIGRlcGVuZGVuY2llcy5cbiAgICpcbiAgICogVGhlIGZsYWcgb25seSB1cGRhdGVzIGV2ZXJ5IFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMsIHNvIGl0J3Mgbm90IHBlcmZlY3QgLVxuICAgKiBob3dldmVyLCBpdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggZm9yIGxvYWRpbmcgaW5kaWNhdG9ycyAvIHdhcm5pbmdzLlxuICAgKi9cbiAgaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgb25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoY2FsbGJhY2s6ICgoKSA9PiBtaXhlZCkpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oREVQRU5ERU5DSUVTX0xPQURFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0U291cmNlKFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3RhcnRQb3NpdGlvbjogbnVtYmVyLFxuICAgIGVuZFBvc2l0aW9uOiBudW1iZXIsXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9mb3JtYXQnLCBhcmdzOiBbY29udGVudHMsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzcG9uc2UuZXJyb3JfbWVzc2FnZTtcbiAgICBpZiAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGhwX29yX2RlY2wnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU29ycnksIFBIUCBhbmQgPD9oaCAvL2RlY2wgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGFyc2luZ19lcnJvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJzaW5nIEVycm9yISBGaXggeW91ciBmaWxlIHNvIHRoZSBzeW50YXggaXMgdmFsaWQgYW5kIHJldHJ5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCBmb3JtYXRpbmcgaGFjayBjb2RlJyArIGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaGlnaGxpZ2h0U291cmNlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbDogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PGF0b20kUmFuZ2U+PiB7XG4gICAgY29uc3QgbG9jYWxQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZmluZF9sdmFyX3JlZnMnLCBhcmdzOiBbbG9jYWxQYXRoLCBsaW5lLCBjb2xdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICByZXR1cm4gcmVzcG9uc2UucG9zaXRpb25zLm1hcChcbiAgICAgIHBvc2l0aW9uID0+IG5ldyBSYW5nZShcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMV0sXG4gICAgICAgIFtwb3NpdGlvbi5saW5lIC0gMSwgcG9zaXRpb24uY2hhcl9lbmRdLFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBhc3luYyBnZXREaWFnbm9zdGljcyhcbiAgICBwYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgaWYgKHRoaXMuaXNIYWNrQXZhaWxhYmxlKCkpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9nZXRTZXJ2ZXJEaWFnbm9zdGljcyhwYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnQsIHBhdGg6IGxvY2FsUGF0aH0gPSBwYXJzZShwYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9jaGVja19maWxlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHtlcnJvcnN9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmIChob3N0bmFtZSAhPSBudWxsICYmIHBvcnQgIT0gbnVsbCkge1xuICAgICAgZXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBlcnJvci5tZXNzYWdlLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICAgICAgaWYgKG1lc3NhZ2UucGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnBhdGggPSBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgbWVzc2FnZS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBlcnJvcnM7XG4gIH1cblxuICBhc3luYyBfZ2V0U2VydmVyRGlhZ25vc3RpY3MoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgbGV0IGRpYWdub3N0aWNSZXN1bHQgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBkaWFnbm9zdGljUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGlhZ25vc3RpY3MoZmlsZVBhdGgsICcnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghZGlhZ25vc3RpY1Jlc3VsdCkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ2hoX2NsaWVudCBjb3VsZCBub3QgYmUgcmVhY2hlZCcpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBoYWNrRGlhZ25vc3RpY3MgPSAoKGRpYWdub3N0aWNSZXN1bHQ6IGFueSk6IEhhY2tEaWFnbm9zdGljc1Jlc3VsdCk7XG4gICAgcmV0dXJuIGhhY2tEaWFnbm9zdGljcy5tZXNzYWdlcztcbiAgfVxuXG4gIGFzeW5jIGdldFR5cGVDb3ZlcmFnZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgKTogUHJvbWlzZTxBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+PiB7XG4gICAgY29uc3QgcmVnaW9ucyA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldFR5cGVkUmVnaW9ucyhmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGNvbnZlcnRUeXBlZFJlZ2lvbnNUb0NvdmVyYWdlUmVnaW9ucyhyZWdpb25zKTtcbiAgfVxuXG4gIGdldE91dGxpbmUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/SGFja091dGxpbmU+IHtcbiAgICByZXR1cm4gdGhpcy5faGFja1NlcnZpY2UuZ2V0T3V0bGluZShmaWxlUGF0aCwgY29udGVudHMpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZ1xuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgdG8gcGFyc2UsIGluZGVudGl5IHRoZSBwb3NpdGlvbixcbiAgICAvLyBhbmQgbG9va3VwIHRoYXQgaWRlbnRpZmllciBmb3IgYSBsb2NhdGlvbiBtYXRjaC5cbiAgICBjb25zdCBpZGVudGlmaWVyUmVzdWx0ID0gYXdhaXQgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW4sXG4gICAgICBsaW5lVGV4dCxcbiAgICApO1xuICAgIGlmIChpZGVudGlmaWVyUmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGlkZW50aWZpZXJSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGhldXJpc3RpY1Jlc3VsdHMgPVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHN5bWJvbCBuYW1lIHNlYXJjaCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKGZpbGVQYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKSxcbiAgICAgICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCBmb3IgYSBzZWFyY2ggb2YgdGhlIHN0cmluZyBwYXJzZWQuXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoZmlsZVBhdGgsIGxpbmVUZXh0LCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgSGFjayBjbGllbnQgc2lkZSBmb3IgYSByZXN1bHQgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgXSk7XG4gICAgLy8gV2Ugbm93IGhhdmUgcmVzdWx0cyBmcm9tIGFsbCA0IHNvdXJjZXMuXG4gICAgLy8gQ2hvb3NlIHRoZSBiZXN0IHJlc3VsdHMgdG8gc2hvdyB0byB0aGUgdXNlci5cbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0cyA9IFtpZGVudGlmaWVyUmVzdWx0XS5jb25jYXQoaGV1cmlzdGljUmVzdWx0cyk7XG4gICAgcmV0dXJuIGFycmF5LmZpbmQoZGVmaW5pdGlvblJlc3VsdHMsIGRlZmluaXRpb25SZXN1bHQgPT4gZGVmaW5pdGlvblJlc3VsdC5sZW5ndGggPT09IDEpXG4gICAgICB8fCBhcnJheS5maW5kKGRlZmluaXRpb25SZXN1bHRzLCBkZWZpbml0aW9uUmVzdWx0ID0+IGRlZmluaXRpb25SZXN1bHQubGVuZ3RoID4gMSlcbiAgICAgIHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPD9IYWNrU3ltYm9sTmFtZVJlc3VsdD4ge1xuXG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKHBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9tZXRob2RfbmFtZScsIGFyZ3M6IFtwYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBpZiAoIXJlc3BvbnNlLm5hbWUpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzeW1ib2xUeXBlID0gZ2V0U3ltYm9sVHlwZShyZXNwb25zZS5yZXN1bHRfdHlwZSk7XG4gICAgY29uc3QgcG9zaXRpb24gPSByZXNwb25zZS5wb3M7XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IHJlc3BvbnNlLm5hbWUsXG4gICAgICB0eXBlOiBzeW1ib2xUeXBlLFxuICAgICAgbGluZTogcG9zaXRpb24ubGluZSAtIDEsXG4gICAgICBjb2x1bW46IHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxLFxuICAgICAgbGVuZ3RoOiBwb3NpdGlvbi5jaGFyX2VuZCAtIHBvc2l0aW9uLmNoYXJfc3RhcnQgKyAxLFxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQSB0aGluIHdyYXBwZXIgYXJvdW5kIGdldFN5bWJvbE5hbWVBdFBvc2l0aW9uIHRoYXQgd2FpdHMgZm9yIGRlcGVuZGVuY2llcyBiZWZvcmUgcmVwb3J0aW5nXG4gICAqIHRoYXQgbm8gc3ltYm9sIG5hbWUgY2FuIGJlIHJlc29sdmVkLlxuICAgKi9cbiAgYXN5bmMgX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uV2l0aERlcGVuZGVuY2llcyhcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgdGltZW91dDogP251bWJlcixcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5fd2FpdEZvckRlcGVuZGVuY2llcyhcbiAgICAgICgpID0+IHRoaXMuX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uKHBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgeCA9PiB4ICE9IG51bGwsXG4gICAgICB0aW1lb3V0LFxuICAgICk7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGlmIChjb250ZW50cy5sZW5ndGggPiBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFKSB7XG4gICAgICAvLyBBdm9pZCBQb29yIFdvcmtlciBQZXJmb3JtYW5jZSBmb3IgbGFyZ2UgZmlsZXMuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBzeW1ib2wgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBzeW1ib2wgPSBhd2FpdCB0aGlzLl9nZXRTeW1ib2xOYW1lQXRQb3NpdGlvbihnZXRQYXRoKGZpbGVQYXRoKSwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAvLyBJZ25vcmUgdGhlIGVycm9yLlxuICAgICAgZ2V0TG9nZ2VyKCkud2FybignX2dldERlZmluaXRpb25Gcm9tU3ltYm9sTmFtZSBlcnJvcjonLCBlcnIpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIXN5bWJvbCB8fCAhc3ltYm9sLm5hbWUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9XG4gICAgICBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXREZWZpbml0aW9uKGZpbGVQYXRoLCBzeW1ib2wubmFtZSwgc3ltYm9sLnR5cGUpO1xuICAgIGlmICghZGVmaW5pdGlvblJlc3VsdCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCkuZGVmaW5pdGlvbnM7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkxvY2F0aW9uQXRQb3NpdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGlmICghZmlsZVBhdGggfHwgY29udGVudHMubGVuZ3RoID4gTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSkge1xuICAgICAgLy8gQXZvaWQgUG9vciBXb3JrZXIgUGVyZm9ybWFuY2UgZm9yIGxhcmdlIGZpbGVzLlxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnQsIHBhdGg6IGxvY2FsUGF0aH0gPSBwYXJzZShmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfaW5mZXJfcG9zJywgYXJnczogW2xvY2FsUGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgcG9zaXRpb24gPSByZXNwb25zZS5wb3MgfHwge307XG4gICAgaWYgKCFwb3NpdGlvbi5maWxlbmFtZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gW3tcbiAgICAgIHBhdGg6IChob3N0bmFtZSAmJiBwb3J0KVxuICAgICAgICA/IGNyZWF0ZVJlbW90ZVVyaShob3N0bmFtZSwgcGFyc2VJbnQocG9ydCwgMTApLCBwb3NpdGlvbi5maWxlbmFtZSlcbiAgICAgICAgOiBwb3NpdGlvbi5maWxlbmFtZSxcbiAgICAgIGxpbmU6IHBvc2l0aW9uLmxpbmUgLSAxLFxuICAgICAgY29sdW1uOiBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMSxcbiAgICAgIGxlbmd0aDogcG9zaXRpb24uY2hhcl9lbmQgLSBwb3NpdGlvbi5jaGFyX3N0YXJ0ICsgMSxcbiAgICAgIG5hbWU6IHBvc2l0aW9uLm5hbWUsXG4gICAgICBzY29wZTogcG9zaXRpb24uc2NvcGUsXG4gICAgICBhZGRpdGlvbmFsSW5mbzogcG9zaXRpb24uYWRkaXRpb25hbEluZm8sXG4gICAgfV07XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgICBjb250ZW50czogc3RyaW5nLFxuICAgICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgICAgY29sdW1uOiBudW1iZXIsXG4gICAgICBsaW5lVGV4dDogc3RyaW5nLFxuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0SWRlbnRpZmllckRlZmluaXRpb24oXG4gICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtblxuICAgICk7XG4gICAgcmV0dXJuIHByb2Nlc3NEZWZpbml0aW9uc0ZvclhocChkZWZpbml0aW9uUmVzdWx0LCBjb2x1bW4sIGxpbmVUZXh0KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbVN0cmluZ1BhcnNlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3Qge3NlYXJjaCwgc3RhcnQsIGVuZH0gPSB0aGlzLl9wYXJzZVN0cmluZ0ZvckV4cHJlc3Npb24obGluZVRleHQsIGNvbHVtbik7XG4gICAgaWYgKCFzZWFyY2gpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9XG4gICAgICBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXREZWZpbml0aW9uKGZpbGVQYXRoLCBzZWFyY2gsIFN5bWJvbFR5cGUuVU5LTk9XTik7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCkuZGVmaW5pdGlvbnM7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcChkZWZpbml0aW9uID0+ICh7XG4gICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgc2VhcmNoU3RhcnRDb2x1bW46IHN0YXJ0LFxuICAgICAgc2VhcmNoRW5kQ29sdW1uOiBlbmQsXG4gICAgfSkpO1xuICB9XG5cbiAgX3BhcnNlU3RyaW5nRm9yRXhwcmVzc2lvbihcbiAgICBsaW5lVGV4dDogc3RyaW5nLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiB7c2VhcmNoOiBzdHJpbmc7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyfSB7XG4gICAgbGV0IHNlYXJjaCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gY29sdW1uO1xuXG4gICAgbGV0IGlzWEhQID0gZmFsc2U7XG4gICAgbGV0IHhocE1hdGNoO1xuICAgIHdoaWxlICAoKHhocE1hdGNoID0gWEhQX0xJTkVfVEVYVF9SRUdFWC5leGVjKGxpbmVUZXh0KSkpIHtcbiAgICAgIGNvbnN0IHhocE1hdGNoSW5kZXggPSB4aHBNYXRjaC5pbmRleCArIDE7XG4gICAgICBpZiAoY29sdW1uID49IHhocE1hdGNoSW5kZXggJiYgY29sdW1uIDwgKHhocE1hdGNoSW5kZXggKyB4aHBNYXRjaFsxXS5sZW5ndGgpKSB7XG4gICAgICAgIGlzWEhQID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3ludGF4Q2hhclJlZ2V4ID0gaXNYSFAgPyB4aHBDaGFyUmVnZXggOiB3b3JkQ2hhclJlZ2V4O1xuICAgIC8vIFNjYW4gZm9yIHRoZSB3b3JkIHN0YXJ0IGZvciB0aGUgaGFjayB2YXJpYWJsZSwgZnVuY3Rpb24gb3IgeGhwIHRhZ1xuICAgIC8vIHdlIGFyZSB0cnlpbmcgdG8gZ2V0IHRoZSBkZWZpbml0aW9uIGZvci5cbiAgICB3aGlsZSAoc3RhcnQgPj0gMCAmJiBzeW50YXhDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5jaGFyQXQoc3RhcnQpKSkge1xuICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgaWYgKGxpbmVUZXh0W3N0YXJ0XSA9PT0gJyQnKSB7XG4gICAgICBzdGFydC0tO1xuICAgIH1cbiAgICBzdGFydCsrO1xuICAgIGxldCBlbmQgPSBjb2x1bW47XG4gICAgd2hpbGUgKHN5bnRheENoYXJSZWdleC50ZXN0KGxpbmVUZXh0LmNoYXJBdChlbmQpKSkge1xuICAgICAgZW5kKys7XG4gICAgfVxuICAgIHNlYXJjaCA9IGxpbmVUZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAvLyBYSFAgVUkgZWxlbWVudHMgc3RhcnQgd2l0aCA6IGJ1dCB0aGUgdXNhZ2VzIGRvZXNuJ3QgaGF2ZSB0aGF0IGNvbG9uLlxuICAgIGlmIChpc1hIUCAmJiAhc2VhcmNoLnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgc2VhcmNoID0gJzonICsgc2VhcmNoO1xuICAgIH1cbiAgICByZXR1cm4ge3NlYXJjaCwgc3RhcnQsIGVuZH07XG4gIH1cblxuICBhc3luYyBnZXRUeXBlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgZXhwcmVzc2lvbjogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgY29uc3QgbG9jYWxQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgaWYgKCFleHByZXNzaW9uLnN0YXJ0c1dpdGgoJyQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShsb2NhbFBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2luZmVyX3R5cGUnLCBhcmdzOiBbbG9jYWxQYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCB7dHlwZX0gPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICBhc3luYyBfZ2V0UmVmZXJlbmNlcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIHN5bWJvbDogSGFja1N5bWJvbE5hbWVSZXN1bHQsXG4gICk6IFByb21pc2U8P0hhY2tSZWZlcmVuY2VzUmVzdWx0PiB7XG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9XG4gICAgICBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXRSZWZlcmVuY2VzKGZpbGVQYXRoLCBzeW1ib2wubmFtZSwgc3ltYm9sLnR5cGUpO1xuICAgIHJldHVybiAoKHJlZmVyZW5jZXNSZXN1bHQ6IGFueSk6IEhhY2tSZWZlcmVuY2VzUmVzdWx0KTtcbiAgfVxuXG4gIGFzeW5jIGZpbmRSZWZlcmVuY2VzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8P3tiYXNlVXJpOiBzdHJpbmc7IHN5bWJvbE5hbWU6IHN0cmluZzsgcmVmZXJlbmNlczogQXJyYXk8SGFja1JlZmVyZW5jZT59PiB7XG4gICAgY29uc3Qgc3ltYm9sID0gYXdhaXQgdGhpcy5fZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb25XaXRoRGVwZW5kZW5jaWVzKFxuICAgICAgZ2V0UGF0aChmaWxlUGF0aCksXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmUgKyAxLFxuICAgICAgY29sdW1uICsgMVxuICAgICk7XG4gICAgaWYgKCFzeW1ib2wgfHwgIVNZTUJPTF9UWVBFU19XSVRIX1JFRkVSRU5DRVMuaGFzKHN5bWJvbC50eXBlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlZmVyZW5jZXNSZXN1bHQgPSBhd2FpdCB0aGlzLl9nZXRSZWZlcmVuY2VzKGZpbGVQYXRoLCBjb250ZW50cywgc3ltYm9sKTtcbiAgICBpZiAoIXJlZmVyZW5jZXNSZXN1bHQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7aGFja1Jvb3QsIHJlZmVyZW5jZXN9ID0gcmVmZXJlbmNlc1Jlc3VsdDtcbiAgICByZXR1cm4ge2Jhc2VVcmk6IGhhY2tSb290LCBzeW1ib2xOYW1lOiBzeW1ib2wubmFtZSwgcmVmZXJlbmNlc307XG4gIH1cblxuICBnZXRCYXNlUGF0aCgpOiA/c3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5fYmFzZVBhdGg7XG4gIH1cblxuICBpc0hhY2tBdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2hoQXZhaWxhYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnRpbnVhbGx5IHJldHJpZXMgdGhlIGZ1bmN0aW9uIHByb3ZpZGVkIHVudGlsIGVpdGhlcjpcbiAgICogMSkgdGhlIHJldHVybiB2YWx1ZSBpcyBcImFjY2VwdGFibGVcIiAoaWYgcHJvdmlkZWQpXG4gICAqIDIpIGRlcGVuZGVuY2llcyBoYXZlIGZpbmlzaGVkIGxvYWRpbmcsIG9yXG4gICAqIDMpIHRoZSBzcGVjaWZpZWQgdGltZW91dCBoYXMgYmVlbiByZWFjaGVkLlxuICAgKi9cbiAgYXN5bmMgX3dhaXRGb3JEZXBlbmRlbmNpZXM8VD4oXG4gICAgZnVuYzogKCgpID0+IFByb21pc2U8VD4pLFxuICAgIGFjY2VwdGFibGU6ID8oKHZhbHVlOiBUKSA9PiBib29sZWFuKSxcbiAgICB0aW1lb3V0TXM6ID9udW1iZXIsXG4gICk6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IHN0YXJ0VGltZSA9IERhdGUubm93KCk7XG4gICAgd2hpbGUgKCF0aW1lb3V0TXMgfHwgRGF0ZS5ub3coKSAtIHN0YXJ0VGltZSA8IHRpbWVvdXRNcykge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZnVuYygpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICAgIGlmICgoYWNjZXB0YWJsZSAmJiBhY2NlcHRhYmxlKHJlc3VsdCkpIHx8IHRoaXMuaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgLy8gV2FpdCBmb3IgZGVwZW5kZW5jaWVzIHRvIGZpbmlzaCBsb2FkaW5nIC0gdG8gYXZvaWQgcG9sbGluZywgd2UnbGwgd2FpdCBmb3IgdGhlIGNhbGxiYWNrLlxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcFxuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLm9uRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKCgpID0+IHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaW1lZCBvdXQgd2FpdGluZyBmb3IgSGFjayBkZXBlbmRlbmNpZXMnKTtcbiAgfVxuXG59XG5cbmNvbnN0IHN0cmluZ1RvQ29tcGxldGlvblR5cGUgPSB7XG4gICdpZCc6IENvbXBsZXRpb25UeXBlLklELFxuICAnbmV3JzogQ29tcGxldGlvblR5cGUuTkVXLFxuICAndHlwZSc6IENvbXBsZXRpb25UeXBlLlRZUEUsXG4gICdjbGFzc19nZXQnOiBDb21wbGV0aW9uVHlwZS5DTEFTU19HRVQsXG4gICd2YXInOiBDb21wbGV0aW9uVHlwZS5WQVIsXG59O1xuXG5mdW5jdGlvbiBnZXRDb21wbGV0aW9uVHlwZShpbnB1dDogc3RyaW5nKSB7XG4gIGxldCBjb21wbGV0aW9uVHlwZSA9IHN0cmluZ1RvQ29tcGxldGlvblR5cGVbaW5wdXRdO1xuICBpZiAodHlwZW9mIGNvbXBsZXRpb25UeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbXBsZXRpb25UeXBlID0gQ29tcGxldGlvblR5cGUuTk9ORTtcbiAgfVxuICByZXR1cm4gY29tcGxldGlvblR5cGU7XG59XG5cbmNvbnN0IHN0cmluZ1RvU3ltYm9sVHlwZSA9IHtcbiAgJ2NsYXNzJzogU3ltYm9sVHlwZS5DTEFTUyxcbiAgJ2Z1bmN0aW9uJzogU3ltYm9sVHlwZS5GVU5DVElPTixcbiAgJ21ldGhvZCc6IFN5bWJvbFR5cGUuTUVUSE9ELFxuICAnbG9jYWwnOiBTeW1ib2xUeXBlLkxPQ0FMLFxufTtcblxuLy8gU3ltYm9sIHR5cGVzIHdlIGNhbiBnZXQgcmVmZXJlbmNlcyBmb3IuXG5leHBvcnQgY29uc3QgU1lNQk9MX1RZUEVTX1dJVEhfUkVGRVJFTkNFUyA9IG5ldyBTZXQoW1xuICBTeW1ib2xUeXBlLkNMQVNTLFxuICBTeW1ib2xUeXBlLkZVTkNUSU9OLFxuICBTeW1ib2xUeXBlLk1FVEhPRCxcbl0pO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U3ltYm9sVHlwZShpbnB1dDogc3RyaW5nKTogU3ltYm9sVHlwZVZhbHVlIHtcbiAgbGV0IHN5bWJvbFR5cGUgPSBzdHJpbmdUb1N5bWJvbFR5cGVbaW5wdXRdO1xuICBpZiAodHlwZW9mIHN5bWJvbFR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3ltYm9sVHlwZSA9IFN5bWJvbFR5cGUuTUVUSE9EO1xuICB9XG4gIHJldHVybiBzeW1ib2xUeXBlO1xufVxuXG5jb25zdCBzZXJ2ZXJDb21wbGV0aW9uVHlwZXMgPSBuZXcgU2V0KFtcbiAgQ29tcGxldGlvblR5cGUuSUQsXG4gIENvbXBsZXRpb25UeXBlLk5FVyxcbiAgQ29tcGxldGlvblR5cGUuVFlQRSxcbl0pO1xuXG5mdW5jdGlvbiBzaG91bGREb1NlcnZlckNvbXBsZXRpb24odHlwZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBzZXJ2ZXJDb21wbGV0aW9uVHlwZXMuaGFzKHR5cGUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zUmVzcG9uc2U6IEFycmF5PEhhY2tDb21wbGV0aW9uPik6XG4gICAgQXJyYXk8Q29tcGxldGlvblJlc3VsdD4ge1xuICByZXR1cm4gY29tcGxldGlvbnNSZXNwb25zZS5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgY29uc3Qge25hbWUsIGZ1bmNfZGV0YWlsczogZnVuY3Rpb25EZXRhaWxzfSA9IGNvbXBsZXRpb247XG4gICAgbGV0IHt0eXBlfSA9IGNvbXBsZXRpb247XG4gICAgaWYgKHR5cGUgJiYgdHlwZS5pbmRleE9mKCcoJykgPT09IDAgJiYgdHlwZS5sYXN0SW5kZXhPZignKScpID09PSB0eXBlLmxlbmd0aCAtIDEpIHtcbiAgICAgIHR5cGUgPSB0eXBlLnN1YnN0cmluZygxLCB0eXBlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hTbmlwcGV0ID0gbmFtZTtcbiAgICBpZiAoZnVuY3Rpb25EZXRhaWxzKSB7XG4gICAgICBjb25zdCB7cGFyYW1zfSA9IGZ1bmN0aW9uRGV0YWlscztcbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgc25pcHBldDogZS5nLiBteUZ1bmN0aW9uKCR7MTokYXJnMX0sICR7MjokYXJnMn0pO1xuICAgICAgY29uc3QgcGFyYW1zU3RyaW5nID0gcGFyYW1zLm1hcChcbiAgICAgICAgKHBhcmFtLCBpbmRleCkgPT4gJyR7JyArIChpbmRleCArIDEpICsgJzonICsgcGFyYW0ubmFtZSArICd9Jykuam9pbignLCAnKTtcbiAgICAgIG1hdGNoU25pcHBldCA9IG5hbWUgKyAnKCcgKyBwYXJhbXNTdHJpbmcgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBtYXRjaFNuaXBwZXQsXG4gICAgICBtYXRjaFRleHQ6IG5hbWUsXG4gICAgICBtYXRjaFR5cGU6IHR5cGUsXG4gICAgfTtcbiAgfSk7XG59XG5cbi8vIENhbGN1bGF0ZSB0aGUgb2Zmc2V0IG9mIHRoZSBjdXJzb3IgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlLlxuLy8gVGhlbiBpbnNlcnQgQVVUTzMzMiBpbiBhdCB0aGlzIG9mZnNldC4gKEhhY2sgdXNlcyB0aGlzIGFzIGEgbWFya2VyLilcbmV4cG9ydCBmdW5jdGlvbiBtYXJrRmlsZUZvckNvbXBsZXRpb24oY29udGVudHM6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpOiBzdHJpbmcge1xuICByZXR1cm4gY29udGVudHMuc3Vic3RyaW5nKDAsIG9mZnNldCkgK1xuICAgICAgJ0FVVE8zMzInICsgY29udGVudHMuc3Vic3RyaW5nKG9mZnNldCwgY29udGVudHMubGVuZ3RoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NEZWZpbml0aW9uc0ZvclhocChcbiAgZGVmaW5pdGlvblJlc3VsdDogP0hhY2tEZWZpbml0aW9uUmVzdWx0LFxuICBjb2x1bW46IG51bWJlcixcbiAgbGluZVRleHQ6IHN0cmluZyxcbik6IEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4ge1xuICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICByZXR1cm4gW107XG4gIH1cbiAgY29uc3Qge2RlZmluaXRpb25zfSA9IGRlZmluaXRpb25SZXN1bHQ7XG4gIHJldHVybiBkZWZpbml0aW9ucy5tYXAoZGVmaW5pdGlvbiA9PiB7XG4gICAgbGV0IHtuYW1lfSA9IGRlZmluaXRpb247XG4gICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnOicpKSB7XG4gICAgICAvLyBYSFAgY2xhc3MgbmFtZSwgdXNhZ2VzIG9taXQgdGhlIGxlYWRpbmcgJzonLlxuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBjb25zdCBkZWZpbml0aW9uSW5kZXggPSBsaW5lVGV4dC5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChcbiAgICAgIGRlZmluaXRpb25JbmRleCA9PT0gLTEgfHxcbiAgICAgIGRlZmluaXRpb25JbmRleCA+PSBjb2x1bW4gfHxcbiAgICAgICF4aHBDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5zdWJzdHJpbmcoZGVmaW5pdGlvbkluZGV4LCBjb2x1bW4pKVxuICAgICkge1xuICAgICAgcmV0dXJuIGRlZmluaXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIC4uLmRlZmluaXRpb24sXG4gICAgICAgIHNlYXJjaFN0YXJ0Q29sdW1uOiBkZWZpbml0aW9uSW5kZXgsXG4gICAgICAgIHNlYXJjaEVuZENvbHVtbjogZGVmaW5pdGlvbkluZGV4ICsgZGVmaW5pdGlvbi5uYW1lLmxlbmd0aCxcbiAgICAgIH07XG4gICAgfVxuICB9KTtcbn1cbiJdfQ==