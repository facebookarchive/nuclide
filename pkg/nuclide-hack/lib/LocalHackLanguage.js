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
      return definitionResults.find(function (definitionResult) {
        return definitionResult.length === 1;
      }) || definitionResults.find(function (definitionResult) {
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
//# sourceMappingURL=data:application/json;base64,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QUM7R0FDWDtNQUNNLFdBQVcsR0FBSSxnQkFBZ0IsQ0FBL0IsV0FBVzs7QUFDbEIsU0FBTyxXQUFXLENBQUMsR0FBRyxDQUFDLFVBQUEsVUFBVSxFQUFJO1FBQzlCLElBQUksR0FBSSxVQUFVLENBQWxCLElBQUk7O0FBQ1QsUUFBSSxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFOztBQUV4QixVQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMxQjtBQUNELFFBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0MsUUFDRSxlQUFlLEtBQUssQ0FBQyxDQUFDLElBQ3RCLGVBQWUsSUFBSSxNQUFNLElBQ3pCLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLGVBQWUsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUMvRDtBQUNBLGFBQU8sVUFBVSxDQUFDO0tBQ25CLE1BQU07QUFDTCwwQkFDSyxVQUFVO0FBQ2IseUJBQWlCLEVBQUUsZUFBZTtBQUNsQyx1QkFBZSxFQUFFLGVBQWUsR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLE1BQU07U0FDekQ7S0FDSDtHQUNGLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IkxvY2FsSGFja0xhbmd1YWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7Q29tcGxldGlvblJlc3VsdH0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuaW1wb3J0IHR5cGUge1xuICBIYWNrQ29tcGxldGlvbnNSZXN1bHQsXG4gIEhhY2tDb21wbGV0aW9uLFxuICBIYWNrRGlhZ25vc3RpY3NSZXN1bHQsXG4gIEhhY2tEaWFnbm9zdGljLFxuICBIYWNrRGVmaW5pdGlvblJlc3VsdCxcbiAgSGFja1NlYXJjaFBvc2l0aW9uLFxuICBIYWNrUmVmZXJlbmNlLFxuICBIYWNrUmVmZXJlbmNlc1Jlc3VsdCxcbiAgSGFja091dGxpbmUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgSGFja1NlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtTeW1ib2xUeXBlVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHtUeXBlQ292ZXJhZ2VSZWdpb259IGZyb20gJy4vVHlwZWRSZWdpb25zJztcblxuaW1wb3J0IHR5cGUge0hhY2tTeW1ib2xOYW1lUmVzdWx0fSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvdHlwZXMnO1xuXG5pbXBvcnQge3BhcnNlLCBjcmVhdGVSZW1vdGVVcmksIGdldFBhdGh9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCB7UmFuZ2UsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEhhY2tXb3JrZXIgZnJvbSAnLi9IYWNrV29ya2VyJztcbmltcG9ydCB7Q29tcGxldGlvblR5cGUsIFN5bWJvbFR5cGV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHtjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnN9IGZyb20gJy4vVHlwZWRSZWdpb25zJztcblxuLy8gVGhlIHdvcmQgY2hhciByZWdleCBpbmNsdWRlIFxcIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlZCBjbGFzc2VzLlxuY29uc3Qgd29yZENoYXJSZWdleCA9IC9bXFx3XFxcXF0vO1xuLy8gVGhlIHhocCBjaGFyIHJlZ2V4IGluY2x1ZGUgOiBhbmQgLSB0byBtYXRjaCB4aHAgdGFncyBsaWtlIDx1aTpidXR0b24tZ3JvdXA+LlxuY29uc3QgeGhwQ2hhclJlZ2V4ID0gL1tcXHc6LV0vO1xuY29uc3QgWEhQX0xJTkVfVEVYVF9SRUdFWCA9IC88KFthLXpdW2EtejAtOV8uOi1dKilbXj5dKlxcLz8+L2dpO1xuXG5jb25zdCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TID0gMTAwMDA7XG5jb25zdCBERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5UID0gJ2RlcGVuZGVuY2llcy1sb2FkZWQnO1xuY29uc3QgTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSA9IDEwMDAwO1xuXG4vKipcbiAqIFRoZSBIYWNrTGFuZ3VhZ2UgaXMgdGhlIGNvbnRyb2xsZXIgdGhhdCBzZXJ2ZXJzIGxhbmd1YWdlIHJlcXVlc3RzIGJ5IHRyeWluZyB0byBnZXQgd29ya2VyIHJlc3VsdHNcbiAqIGFuZC9vciByZXN1bHRzIGZyb20gSGFja1NlcnZpY2UgKHdoaWNoIHdvdWxkIGJlIGV4ZWN1dGluZyBoaF9jbGllbnQgb24gYSBzdXBwb3J0aW5nIHNlcnZlcilcbiAqIGFuZCBjb21iaW5pbmcgYW5kL29yIHNlbGVjdGluZyB0aGUgcmVzdWx0cyB0byBnaXZlIGJhY2sgdG8gdGhlIHJlcXVlc3Rlci5cbiAqL1xuZXhwb3J0IGNsYXNzIExvY2FsSGFja0xhbmd1YWdlIHtcblxuICBfaGFja1NlcnZpY2U6IEhhY2tTZXJ2aWNlO1xuICBfaGhBdmFpbGFibGU6IGJvb2xlYW47XG4gIF9oYWNrV29ya2VyOiBIYWNrV29ya2VyO1xuICBfcGF0aENvbnRlbnRzTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuICBfYmFzZVBhdGg6ID9zdHJpbmc7XG4gIF9pbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaTtcbiAgX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzOiBib29sZWFuO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIGBiYXNlUGF0aGAgc2hvdWxkIGJlIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIC5oaGNvbmZpZyBmaWxlIGlzIGxvY2F0ZWQuXG4gICAqIEl0IHNob3VsZCBvbmx5IGJlIG51bGwgaWYgY2xpZW50IGlzIG51bGwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGhhY2tTZXJ2aWNlOiBIYWNrU2VydmljZSxcbiAgICAgIGhoQXZhaWxhYmxlOiBib29sZWFuLFxuICAgICAgYmFzZVBhdGg6ID9zdHJpbmcsXG4gICAgICBpbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaVxuICApIHtcbiAgICB0aGlzLl9oYWNrU2VydmljZSA9IGhhY2tTZXJ2aWNlO1xuICAgIHRoaXMuX2hoQXZhaWxhYmxlID0gaGhBdmFpbGFibGU7XG4gICAgdGhpcy5faGFja1dvcmtlciA9IG5ldyBIYWNrV29ya2VyKCk7XG4gICAgdGhpcy5fcGF0aENvbnRlbnRzTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Jhc2VQYXRoID0gYmFzZVBhdGg7XG4gICAgdGhpcy5faW5pdGlhbEZpbGVVcmkgPSBpbml0aWFsRmlsZVVyaTtcbiAgICB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyA9IHRydWU7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBpZiAodGhpcy5faGhBdmFpbGFibGUpIHtcbiAgICAgIHRoaXMuX3NldHVwVXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwoKTtcbiAgICB9XG4gIH1cblxuICBfc2V0dXBVcGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCgpIHtcbiAgICAvLyBGZXRjaCBhbnkgZGVwZW5kZW5jaWVzIHRoZSBIYWNrV29ya2VyIG5lZWRzIGFmdGVyIGxlYXJuaW5nIGFib3V0IHRoaXMgZmlsZS5cbiAgICAvLyBXZSBkb24ndCBibG9jayBhbnkgcmVhbHRpbWUgbG9naWMgb24gdGhlIGRlcGVuZGVuY3kgZmV0Y2hpbmcgLSBpdCBjb3VsZCB0YWtlIGEgd2hpbGUuXG4gICAgbGV0IHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSBmYWxzZTtcblxuICAgIGNvbnN0IGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcyA9ICgpID0+IHtcbiAgICAgIHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAocGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gdHJ1ZTtcbiAgICAgIHRoaXMudXBkYXRlRGVwZW5kZW5jaWVzKCkudGhlbihmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMsIGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcyk7XG4gICAgfSwgVVBEQVRFX0RFUEVOREVOQ0lFU19JTlRFUlZBTF9NUyk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2hhY2tXb3JrZXIuZGlzcG9zZSgpO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29tcGxldGlvbnMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBvZmZzZXQ6IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PENvbXBsZXRpb25SZXN1bHQ+PiB7XG4gICAgY29uc3QgbWFya2VkQ29udGVudHMgPSBtYXJrRmlsZUZvckNvbXBsZXRpb24oY29udGVudHMsIG9mZnNldCk7XG4gICAgY29uc3QgbG9jYWxQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgbWFya2VkQ29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYXV0b19jb21wbGV0ZScsIGFyZ3M6IFtsb2NhbFBhdGhdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBjb21wbGV0aW9uVHlwZSA9IGdldENvbXBsZXRpb25UeXBlKHJlc3BvbnNlLmNvbXBsZXRpb25fdHlwZSk7XG4gICAgbGV0IHtjb21wbGV0aW9uc30gPSByZXNwb25zZTtcbiAgICBpZiAoc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKGNvbXBsZXRpb25UeXBlKSB8fCAhY29tcGxldGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCBjb21wbGV0aW9uc1Jlc3VsdCA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldENvbXBsZXRpb25zKGZpbGVQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgICBpZiAoY29tcGxldGlvbnNSZXN1bHQpIHtcbiAgICAgICAgY29tcGxldGlvbnMgPSAoKGNvbXBsZXRpb25zUmVzdWx0OiBhbnkpOiBIYWNrQ29tcGxldGlvbnNSZXN1bHQpLmNvbXBsZXRpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAuc2V0KHBhdGgsIGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYWRkX2ZpbGUnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY2llcygpOiBQcm9taXNlIHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9kZXBzJywgYXJnczogW119O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UuZGVwcy5sZW5ndGgpIHtcbiAgICAgIGlmICghdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQpO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGVwZW5kZW5jaWVzKFxuICAgICAgdGhpcy5faW5pdGlhbEZpbGVVcmksIHJlc3BvbnNlLmRlcHNcbiAgICApO1xuICAgIGlmICghZGVwZW5kZW5jaWVzUmVzdWx0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtkZXBlbmRlbmNpZXN9ID0gZGVwZW5kZW5jaWVzUmVzdWx0O1xuICAgIC8vIFNlcmlhbGx5IHVwZGF0ZSBkZXBlZG5lY2llcyBub3QgdG8gYmxvY2sgdGhlIHdvcmtlciBmcm9tIHNlcnZpbmcgb3RoZXIgZmVhdHVyZSByZXF1ZXN0cy5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGNvbnRlbnRzXSBvZiBkZXBlbmRlbmNpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlRGVwZW5kZW5jeShmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY3kocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2FkZF9kZXAnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlLCB7aXNEZXBlbmRlbmN5OiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHdheSB0byBlc3RpbWF0ZSBpZiBhbGwgSGFjayBkZXBlbmRlbmNpZXMgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgICogVGhpcyBmbGFnIGlzIHR1cm5lZCBvZmYgd2hlbiBhIGZpbGUgZ2V0cyB1cGRhdGVkIG9yIGFkZGVkLCBhbmQgZ2V0cyB0dXJuZWQgYmFjayBvblxuICAgKiBvbmNlIGB1cGRhdGVEZXBlbmRlbmNpZXMoKWAgcmV0dXJucyBubyBhZGRpdGlvbmFsIGRlcGVuZGVuY2llcy5cbiAgICpcbiAgICogVGhlIGZsYWcgb25seSB1cGRhdGVzIGV2ZXJ5IFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMsIHNvIGl0J3Mgbm90IHBlcmZlY3QgLVxuICAgKiBob3dldmVyLCBpdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggZm9yIGxvYWRpbmcgaW5kaWNhdG9ycyAvIHdhcm5pbmdzLlxuICAgKi9cbiAgaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgb25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoY2FsbGJhY2s6ICgoKSA9PiBtaXhlZCkpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oREVQRU5ERU5DSUVTX0xPQURFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0U291cmNlKFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3RhcnRQb3NpdGlvbjogbnVtYmVyLFxuICAgIGVuZFBvc2l0aW9uOiBudW1iZXIsXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9mb3JtYXQnLCBhcmdzOiBbY29udGVudHMsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzcG9uc2UuZXJyb3JfbWVzc2FnZTtcbiAgICBpZiAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGhwX29yX2RlY2wnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU29ycnksIFBIUCBhbmQgPD9oaCAvL2RlY2wgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGFyc2luZ19lcnJvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJzaW5nIEVycm9yISBGaXggeW91ciBmaWxlIHNvIHRoZSBzeW50YXggaXMgdmFsaWQgYW5kIHJldHJ5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCBmb3JtYXRpbmcgaGFjayBjb2RlJyArIGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaGlnaGxpZ2h0U291cmNlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbDogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PGF0b20kUmFuZ2U+PiB7XG4gICAgY29uc3QgbG9jYWxQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZmluZF9sdmFyX3JlZnMnLCBhcmdzOiBbbG9jYWxQYXRoLCBsaW5lLCBjb2xdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICByZXR1cm4gcmVzcG9uc2UucG9zaXRpb25zLm1hcChcbiAgICAgIHBvc2l0aW9uID0+IG5ldyBSYW5nZShcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMV0sXG4gICAgICAgIFtwb3NpdGlvbi5saW5lIC0gMSwgcG9zaXRpb24uY2hhcl9lbmRdLFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBhc3luYyBnZXREaWFnbm9zdGljcyhcbiAgICBwYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgaWYgKHRoaXMuaXNIYWNrQXZhaWxhYmxlKCkpIHtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9nZXRTZXJ2ZXJEaWFnbm9zdGljcyhwYXRoKTtcbiAgICB9XG5cbiAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnQsIHBhdGg6IGxvY2FsUGF0aH0gPSBwYXJzZShwYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9jaGVja19maWxlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHtlcnJvcnN9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmIChob3N0bmFtZSAhPSBudWxsICYmIHBvcnQgIT0gbnVsbCkge1xuICAgICAgZXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBlcnJvci5tZXNzYWdlLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICAgICAgaWYgKG1lc3NhZ2UucGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnBhdGggPSBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgbWVzc2FnZS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBlcnJvcnM7XG4gIH1cblxuICBhc3luYyBfZ2V0U2VydmVyRGlhZ25vc3RpY3MoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgbGV0IGRpYWdub3N0aWNSZXN1bHQgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBkaWFnbm9zdGljUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGlhZ25vc3RpY3MoZmlsZVBhdGgsICcnKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghZGlhZ25vc3RpY1Jlc3VsdCkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ2hoX2NsaWVudCBjb3VsZCBub3QgYmUgcmVhY2hlZCcpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBoYWNrRGlhZ25vc3RpY3MgPSAoKGRpYWdub3N0aWNSZXN1bHQ6IGFueSk6IEhhY2tEaWFnbm9zdGljc1Jlc3VsdCk7XG4gICAgcmV0dXJuIGhhY2tEaWFnbm9zdGljcy5tZXNzYWdlcztcbiAgfVxuXG4gIGFzeW5jIGdldFR5cGVDb3ZlcmFnZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgKTogUHJvbWlzZTxBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+PiB7XG4gICAgY29uc3QgcmVnaW9ucyA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldFR5cGVkUmVnaW9ucyhmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGNvbnZlcnRUeXBlZFJlZ2lvbnNUb0NvdmVyYWdlUmVnaW9ucyhyZWdpb25zKTtcbiAgfVxuXG4gIGdldE91dGxpbmUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/SGFja091dGxpbmU+IHtcbiAgICByZXR1cm4gdGhpcy5faGFja1NlcnZpY2UuZ2V0T3V0bGluZShmaWxlUGF0aCwgY29udGVudHMpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZ1xuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgdG8gcGFyc2UsIGluZGVudGl5IHRoZSBwb3NpdGlvbixcbiAgICAvLyBhbmQgbG9va3VwIHRoYXQgaWRlbnRpZmllciBmb3IgYSBsb2NhdGlvbiBtYXRjaC5cbiAgICBjb25zdCBpZGVudGlmaWVyUmVzdWx0ID0gYXdhaXQgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW4sXG4gICAgICBsaW5lVGV4dCxcbiAgICApO1xuICAgIGlmIChpZGVudGlmaWVyUmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGlkZW50aWZpZXJSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGhldXJpc3RpY1Jlc3VsdHMgPVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHN5bWJvbCBuYW1lIHNlYXJjaCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKGZpbGVQYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKSxcbiAgICAgICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCBmb3IgYSBzZWFyY2ggb2YgdGhlIHN0cmluZyBwYXJzZWQuXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoZmlsZVBhdGgsIGxpbmVUZXh0LCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgSGFjayBjbGllbnQgc2lkZSBmb3IgYSByZXN1bHQgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgXSk7XG4gICAgLy8gV2Ugbm93IGhhdmUgcmVzdWx0cyBmcm9tIGFsbCA0IHNvdXJjZXMuXG4gICAgLy8gQ2hvb3NlIHRoZSBiZXN0IHJlc3VsdHMgdG8gc2hvdyB0byB0aGUgdXNlci5cbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0cyA9IFtpZGVudGlmaWVyUmVzdWx0XS5jb25jYXQoaGV1cmlzdGljUmVzdWx0cyk7XG4gICAgcmV0dXJuIGRlZmluaXRpb25SZXN1bHRzLmZpbmQoZGVmaW5pdGlvblJlc3VsdCA9PiBkZWZpbml0aW9uUmVzdWx0Lmxlbmd0aCA9PT0gMSlcbiAgICAgIHx8IGRlZmluaXRpb25SZXN1bHRzLmZpbmQoZGVmaW5pdGlvblJlc3VsdCA9PiBkZWZpbml0aW9uUmVzdWx0Lmxlbmd0aCA+IDEpXG4gICAgICB8fCBbXTtcbiAgfVxuXG4gIGFzeW5jIF9nZXRTeW1ib2xOYW1lQXRQb3NpdGlvbihcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcblxuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9nZXRfbWV0aG9kX25hbWUnLCBhcmdzOiBbcGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgaWYgKCFyZXNwb25zZS5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc3ltYm9sVHlwZSA9IGdldFN5bWJvbFR5cGUocmVzcG9uc2UucmVzdWx0X3R5cGUpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcmVzcG9uc2UucG9zO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiByZXNwb25zZS5uYW1lLFxuICAgICAgdHlwZTogc3ltYm9sVHlwZSxcbiAgICAgIGxpbmU6IHBvc2l0aW9uLmxpbmUgLSAxLFxuICAgICAgY29sdW1uOiBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMSxcbiAgICAgIGxlbmd0aDogcG9zaXRpb24uY2hhcl9lbmQgLSBwb3NpdGlvbi5jaGFyX3N0YXJ0ICsgMSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgdGhpbiB3cmFwcGVyIGFyb3VuZCBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbiB0aGF0IHdhaXRzIGZvciBkZXBlbmRlbmNpZXMgYmVmb3JlIHJlcG9ydGluZ1xuICAgKiB0aGF0IG5vIHN5bWJvbCBuYW1lIGNhbiBiZSByZXNvbHZlZC5cbiAgICovXG4gIGFzeW5jIF9nZXRTeW1ib2xOYW1lQXRQb3NpdGlvbldpdGhEZXBlbmRlbmNpZXMoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIHRpbWVvdXQ6ID9udW1iZXIsXG4gICk6IFByb21pc2U8P0hhY2tTeW1ib2xOYW1lUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3dhaXRGb3JEZXBlbmRlbmNpZXMoXG4gICAgICAoKSA9PiB0aGlzLl9nZXRTeW1ib2xOYW1lQXRQb3NpdGlvbihwYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKSxcbiAgICAgIHggPT4geCAhPSBudWxsLFxuICAgICAgdGltZW91dCxcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tU3ltYm9sTmFtZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBpZiAoY29udGVudHMubGVuZ3RoID4gTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSkge1xuICAgICAgLy8gQXZvaWQgUG9vciBXb3JrZXIgUGVyZm9ybWFuY2UgZm9yIGxhcmdlIGZpbGVzLlxuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBsZXQgc3ltYm9sID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgc3ltYm9sID0gYXdhaXQgdGhpcy5fZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24oZ2V0UGF0aChmaWxlUGF0aCksIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gSWdub3JlIHRoZSBlcnJvci5cbiAgICAgIGdldExvZ2dlcigpLndhcm4oJ19nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFzeW1ib2wgfHwgIXN5bWJvbC5uYW1lKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHQgPVxuICAgICAgYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGVmaW5pdGlvbihmaWxlUGF0aCwgc3ltYm9sLm5hbWUsIHN5bWJvbC50eXBlKTtcbiAgICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuICgoZGVmaW5pdGlvblJlc3VsdDogYW55KTogSGFja0RlZmluaXRpb25SZXN1bHQpLmRlZmluaXRpb25zO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgICBjb2x1bW46IG51bWJlcixcbiAgICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBpZiAoIWZpbGVQYXRoIHx8IGNvbnRlbnRzLmxlbmd0aCA+IE1BWF9IQUNLX1dPUktFUl9URVhUX1NJWkUpIHtcbiAgICAgIC8vIEF2b2lkIFBvb3IgV29ya2VyIFBlcmZvcm1hbmNlIGZvciBsYXJnZSBmaWxlcy5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwb3J0LCBwYXRoOiBsb2NhbFBhdGh9ID0gcGFyc2UoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShsb2NhbFBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2luZmVyX3BvcycsIGFyZ3M6IFtsb2NhbFBhdGgsIGxpbmVOdW1iZXIsIGNvbHVtbl19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcmVzcG9uc2UucG9zIHx8IHt9O1xuICAgIGlmICghcG9zaXRpb24uZmlsZW5hbWUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIFt7XG4gICAgICBwYXRoOiAoaG9zdG5hbWUgJiYgcG9ydClcbiAgICAgICAgPyBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgcG9zaXRpb24uZmlsZW5hbWUpXG4gICAgICAgIDogcG9zaXRpb24uZmlsZW5hbWUsXG4gICAgICBsaW5lOiBwb3NpdGlvbi5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogcG9zaXRpb24uY2hhcl9zdGFydCAtIDEsXG4gICAgICBsZW5ndGg6IHBvc2l0aW9uLmNoYXJfZW5kIC0gcG9zaXRpb24uY2hhcl9zdGFydCArIDEsXG4gICAgICBuYW1lOiBwb3NpdGlvbi5uYW1lLFxuICAgICAgc2NvcGU6IHBvc2l0aW9uLnNjb3BlLFxuICAgICAgYWRkaXRpb25hbEluZm86IHBvc2l0aW9uLmFkZGl0aW9uYWxJbmZvLFxuICAgIH1dO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tSWRlbnRpZmllcihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldElkZW50aWZpZXJEZWZpbml0aW9uKFxuICAgICAgZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW5cbiAgICApO1xuICAgIHJldHVybiBwcm9jZXNzRGVmaW5pdGlvbnNGb3JYaHAoZGVmaW5pdGlvblJlc3VsdCwgY29sdW1uLCBsaW5lVGV4dCk7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21TdHJpbmdQYXJzZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBsaW5lVGV4dDogc3RyaW5nLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGNvbnN0IHtzZWFyY2gsIHN0YXJ0LCBlbmR9ID0gdGhpcy5fcGFyc2VTdHJpbmdGb3JFeHByZXNzaW9uKGxpbmVUZXh0LCBjb2x1bW4pO1xuICAgIGlmICghc2VhcmNoKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHQgPVxuICAgICAgYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGVmaW5pdGlvbihmaWxlUGF0aCwgc2VhcmNoLCBTeW1ib2xUeXBlLlVOS05PV04pO1xuICAgIGlmICghZGVmaW5pdGlvblJlc3VsdCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBkZWZpbml0aW9ucyA9ICgoZGVmaW5pdGlvblJlc3VsdDogYW55KTogSGFja0RlZmluaXRpb25SZXN1bHQpLmRlZmluaXRpb25zO1xuICAgIHJldHVybiBkZWZpbml0aW9ucy5tYXAoZGVmaW5pdGlvbiA9PiAoe1xuICAgICAgLi4uZGVmaW5pdGlvbixcbiAgICAgIHNlYXJjaFN0YXJ0Q29sdW1uOiBzdGFydCxcbiAgICAgIHNlYXJjaEVuZENvbHVtbjogZW5kLFxuICAgIH0pKTtcbiAgfVxuXG4gIF9wYXJzZVN0cmluZ0ZvckV4cHJlc3Npb24oXG4gICAgbGluZVRleHQ6IHN0cmluZyxcbiAgICBjb2x1bW46IG51bWJlcixcbiAgKToge3NlYXJjaDogc3RyaW5nOyBzdGFydDogbnVtYmVyOyBlbmQ6IG51bWJlcn0ge1xuICAgIGxldCBzZWFyY2ggPSBudWxsO1xuICAgIGxldCBzdGFydCA9IGNvbHVtbjtcblxuICAgIGxldCBpc1hIUCA9IGZhbHNlO1xuICAgIGxldCB4aHBNYXRjaDtcbiAgICB3aGlsZSAgKCh4aHBNYXRjaCA9IFhIUF9MSU5FX1RFWFRfUkVHRVguZXhlYyhsaW5lVGV4dCkpKSB7XG4gICAgICBjb25zdCB4aHBNYXRjaEluZGV4ID0geGhwTWF0Y2guaW5kZXggKyAxO1xuICAgICAgaWYgKGNvbHVtbiA+PSB4aHBNYXRjaEluZGV4ICYmIGNvbHVtbiA8ICh4aHBNYXRjaEluZGV4ICsgeGhwTWF0Y2hbMV0ubGVuZ3RoKSkge1xuICAgICAgICBpc1hIUCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN5bnRheENoYXJSZWdleCA9IGlzWEhQID8geGhwQ2hhclJlZ2V4IDogd29yZENoYXJSZWdleDtcbiAgICAvLyBTY2FuIGZvciB0aGUgd29yZCBzdGFydCBmb3IgdGhlIGhhY2sgdmFyaWFibGUsIGZ1bmN0aW9uIG9yIHhocCB0YWdcbiAgICAvLyB3ZSBhcmUgdHJ5aW5nIHRvIGdldCB0aGUgZGVmaW5pdGlvbiBmb3IuXG4gICAgd2hpbGUgKHN0YXJ0ID49IDAgJiYgc3ludGF4Q2hhclJlZ2V4LnRlc3QobGluZVRleHQuY2hhckF0KHN0YXJ0KSkpIHtcbiAgICAgIHN0YXJ0LS07XG4gICAgfVxuICAgIGlmIChsaW5lVGV4dFtzdGFydF0gPT09ICckJykge1xuICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgc3RhcnQrKztcbiAgICBsZXQgZW5kID0gY29sdW1uO1xuICAgIHdoaWxlIChzeW50YXhDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5jaGFyQXQoZW5kKSkpIHtcbiAgICAgIGVuZCsrO1xuICAgIH1cbiAgICBzZWFyY2ggPSBsaW5lVGV4dC5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgLy8gWEhQIFVJIGVsZW1lbnRzIHN0YXJ0IHdpdGggOiBidXQgdGhlIHVzYWdlcyBkb2Vzbid0IGhhdmUgdGhhdCBjb2xvbi5cbiAgICBpZiAoaXNYSFAgJiYgIXNlYXJjaC5zdGFydHNXaXRoKCc6JykpIHtcbiAgICAgIHNlYXJjaCA9ICc6JyArIHNlYXJjaDtcbiAgICB9XG4gICAgcmV0dXJuIHtzZWFyY2gsIHN0YXJ0LCBlbmR9O1xuICB9XG5cbiAgYXN5bmMgZ2V0VHlwZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGNvbnN0IGxvY2FsUGF0aCA9IGdldFBhdGgoZmlsZVBhdGgpO1xuICAgIGlmICghZXhwcmVzc2lvbi5zdGFydHNXaXRoKCckJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9pbmZlcl90eXBlJywgYXJnczogW2xvY2FsUGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3Qge3R5cGV9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIHJldHVybiB0eXBlO1xuICB9XG5cbiAgYXN5bmMgX2dldFJlZmVyZW5jZXMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBzeW1ib2w6IEhhY2tTeW1ib2xOYW1lUmVzdWx0LFxuICApOiBQcm9taXNlPD9IYWNrUmVmZXJlbmNlc1Jlc3VsdD4ge1xuICAgIGNvbnN0IHJlZmVyZW5jZXNSZXN1bHQgPVxuICAgICAgYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0UmVmZXJlbmNlcyhmaWxlUGF0aCwgc3ltYm9sLm5hbWUsIHN5bWJvbC50eXBlKTtcbiAgICByZXR1cm4gKChyZWZlcmVuY2VzUmVzdWx0OiBhbnkpOiBIYWNrUmVmZXJlbmNlc1Jlc3VsdCk7XG4gIH1cblxuICBhc3luYyBmaW5kUmVmZXJlbmNlcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPD97YmFzZVVyaTogc3RyaW5nOyBzeW1ib2xOYW1lOiBzdHJpbmc7IHJlZmVyZW5jZXM6IEFycmF5PEhhY2tSZWZlcmVuY2U+fT4ge1xuICAgIGNvbnN0IHN5bWJvbCA9IGF3YWl0IHRoaXMuX2dldFN5bWJvbE5hbWVBdFBvc2l0aW9uV2l0aERlcGVuZGVuY2llcyhcbiAgICAgIGdldFBhdGgoZmlsZVBhdGgpLFxuICAgICAgY29udGVudHMsXG4gICAgICBsaW5lICsgMSxcbiAgICAgIGNvbHVtbiArIDFcbiAgICApO1xuICAgIGlmICghc3ltYm9sIHx8ICFTWU1CT0xfVFlQRVNfV0lUSF9SRUZFUkVOQ0VTLmhhcyhzeW1ib2wudHlwZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByZWZlcmVuY2VzUmVzdWx0ID0gYXdhaXQgdGhpcy5fZ2V0UmVmZXJlbmNlcyhmaWxlUGF0aCwgY29udGVudHMsIHN5bWJvbCk7XG4gICAgaWYgKCFyZWZlcmVuY2VzUmVzdWx0KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qge2hhY2tSb290LCByZWZlcmVuY2VzfSA9IHJlZmVyZW5jZXNSZXN1bHQ7XG4gICAgcmV0dXJuIHtiYXNlVXJpOiBoYWNrUm9vdCwgc3ltYm9sTmFtZTogc3ltYm9sLm5hbWUsIHJlZmVyZW5jZXN9O1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgaXNIYWNrQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaEF2YWlsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250aW51YWxseSByZXRyaWVzIHRoZSBmdW5jdGlvbiBwcm92aWRlZCB1bnRpbCBlaXRoZXI6XG4gICAqIDEpIHRoZSByZXR1cm4gdmFsdWUgaXMgXCJhY2NlcHRhYmxlXCIgKGlmIHByb3ZpZGVkKVxuICAgKiAyKSBkZXBlbmRlbmNpZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLCBvclxuICAgKiAzKSB0aGUgc3BlY2lmaWVkIHRpbWVvdXQgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICovXG4gIGFzeW5jIF93YWl0Rm9yRGVwZW5kZW5jaWVzPFQ+KFxuICAgIGZ1bmM6ICgoKSA9PiBQcm9taXNlPFQ+KSxcbiAgICBhY2NlcHRhYmxlOiA/KCh2YWx1ZTogVCkgPT4gYm9vbGVhbiksXG4gICAgdGltZW91dE1zOiA/bnVtYmVyLFxuICApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHdoaWxlICghdGltZW91dE1zIHx8IERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0TXMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZ1bmMoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICBpZiAoKGFjY2VwdGFibGUgJiYgYWNjZXB0YWJsZShyZXN1bHQpKSB8fCB0aGlzLmlzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKCkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIC8vIFdhaXQgZm9yIGRlcGVuZGVuY2llcyB0byBmaW5pc2ggbG9hZGluZyAtIHRvIGF2b2lkIHBvbGxpbmcsIHdlJ2xsIHdhaXQgZm9yIHRoZSBjYWxsYmFjay5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5vbkZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcygoKSA9PiB7XG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignVGltZWQgb3V0IHdhaXRpbmcgZm9yIEhhY2sgZGVwZW5kZW5jaWVzJyk7XG4gIH1cblxufVxuXG5jb25zdCBzdHJpbmdUb0NvbXBsZXRpb25UeXBlID0ge1xuICAnaWQnOiBDb21wbGV0aW9uVHlwZS5JRCxcbiAgJ25ldyc6IENvbXBsZXRpb25UeXBlLk5FVyxcbiAgJ3R5cGUnOiBDb21wbGV0aW9uVHlwZS5UWVBFLFxuICAnY2xhc3NfZ2V0JzogQ29tcGxldGlvblR5cGUuQ0xBU1NfR0VULFxuICAndmFyJzogQ29tcGxldGlvblR5cGUuVkFSLFxufTtcblxuZnVuY3Rpb24gZ2V0Q29tcGxldGlvblR5cGUoaW5wdXQ6IHN0cmluZykge1xuICBsZXQgY29tcGxldGlvblR5cGUgPSBzdHJpbmdUb0NvbXBsZXRpb25UeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBjb21wbGV0aW9uVHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjb21wbGV0aW9uVHlwZSA9IENvbXBsZXRpb25UeXBlLk5PTkU7XG4gIH1cbiAgcmV0dXJuIGNvbXBsZXRpb25UeXBlO1xufVxuXG5jb25zdCBzdHJpbmdUb1N5bWJvbFR5cGUgPSB7XG4gICdjbGFzcyc6IFN5bWJvbFR5cGUuQ0xBU1MsXG4gICdmdW5jdGlvbic6IFN5bWJvbFR5cGUuRlVOQ1RJT04sXG4gICdtZXRob2QnOiBTeW1ib2xUeXBlLk1FVEhPRCxcbiAgJ2xvY2FsJzogU3ltYm9sVHlwZS5MT0NBTCxcbn07XG5cbi8vIFN5bWJvbCB0eXBlcyB3ZSBjYW4gZ2V0IHJlZmVyZW5jZXMgZm9yLlxuZXhwb3J0IGNvbnN0IFNZTUJPTF9UWVBFU19XSVRIX1JFRkVSRU5DRVMgPSBuZXcgU2V0KFtcbiAgU3ltYm9sVHlwZS5DTEFTUyxcbiAgU3ltYm9sVHlwZS5GVU5DVElPTixcbiAgU3ltYm9sVHlwZS5NRVRIT0QsXG5dKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFN5bWJvbFR5cGUoaW5wdXQ6IHN0cmluZyk6IFN5bWJvbFR5cGVWYWx1ZSB7XG4gIGxldCBzeW1ib2xUeXBlID0gc3RyaW5nVG9TeW1ib2xUeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBzeW1ib2xUeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIHN5bWJvbFR5cGUgPSBTeW1ib2xUeXBlLk1FVEhPRDtcbiAgfVxuICByZXR1cm4gc3ltYm9sVHlwZTtcbn1cblxuY29uc3Qgc2VydmVyQ29tcGxldGlvblR5cGVzID0gbmV3IFNldChbXG4gIENvbXBsZXRpb25UeXBlLklELFxuICBDb21wbGV0aW9uVHlwZS5ORVcsXG4gIENvbXBsZXRpb25UeXBlLlRZUEUsXG5dKTtcblxuZnVuY3Rpb24gc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKHR5cGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gc2VydmVyQ29tcGxldGlvblR5cGVzLmhhcyh0eXBlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NDb21wbGV0aW9ucyhjb21wbGV0aW9uc1Jlc3BvbnNlOiBBcnJheTxIYWNrQ29tcGxldGlvbj4pOlxuICAgIEFycmF5PENvbXBsZXRpb25SZXN1bHQ+IHtcbiAgcmV0dXJuIGNvbXBsZXRpb25zUmVzcG9uc2UubWFwKGNvbXBsZXRpb24gPT4ge1xuICAgIGNvbnN0IHtuYW1lLCBmdW5jX2RldGFpbHM6IGZ1bmN0aW9uRGV0YWlsc30gPSBjb21wbGV0aW9uO1xuICAgIGxldCB7dHlwZX0gPSBjb21wbGV0aW9uO1xuICAgIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignKCcpID09PSAwICYmIHR5cGUubGFzdEluZGV4T2YoJyknKSA9PT0gdHlwZS5sZW5ndGggLSAxKSB7XG4gICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoMSwgdHlwZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgbGV0IG1hdGNoU25pcHBldCA9IG5hbWU7XG4gICAgaWYgKGZ1bmN0aW9uRGV0YWlscykge1xuICAgICAgY29uc3Qge3BhcmFtc30gPSBmdW5jdGlvbkRldGFpbHM7XG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIHNuaXBwZXQ6IGUuZy4gbXlGdW5jdGlvbigkezE6JGFyZzF9LCAkezI6JGFyZzJ9KTtcbiAgICAgIGNvbnN0IHBhcmFtc1N0cmluZyA9IHBhcmFtcy5tYXAoXG4gICAgICAgIChwYXJhbSwgaW5kZXgpID0+ICckeycgKyAoaW5kZXggKyAxKSArICc6JyArIHBhcmFtLm5hbWUgKyAnfScpLmpvaW4oJywgJyk7XG4gICAgICBtYXRjaFNuaXBwZXQgPSBuYW1lICsgJygnICsgcGFyYW1zU3RyaW5nICsgJyknO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hTbmlwcGV0LFxuICAgICAgbWF0Y2hUZXh0OiBuYW1lLFxuICAgICAgbWF0Y2hUeXBlOiB0eXBlLFxuICAgIH07XG4gIH0pO1xufVxuXG4vLyBDYWxjdWxhdGUgdGhlIG9mZnNldCBvZiB0aGUgY3Vyc29yIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZS5cbi8vIFRoZW4gaW5zZXJ0IEFVVE8zMzIgaW4gYXQgdGhpcyBvZmZzZXQuIChIYWNrIHVzZXMgdGhpcyBhcyBhIG1hcmtlci4pXG5leHBvcnQgZnVuY3Rpb24gbWFya0ZpbGVGb3JDb21wbGV0aW9uKGNvbnRlbnRzOiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGNvbnRlbnRzLnN1YnN0cmluZygwLCBvZmZzZXQpICtcbiAgICAgICdBVVRPMzMyJyArIGNvbnRlbnRzLnN1YnN0cmluZyhvZmZzZXQsIGNvbnRlbnRzLmxlbmd0aCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm9jZXNzRGVmaW5pdGlvbnNGb3JYaHAoXG4gIGRlZmluaXRpb25SZXN1bHQ6ID9IYWNrRGVmaW5pdGlvblJlc3VsdCxcbiAgY29sdW1uOiBudW1iZXIsXG4gIGxpbmVUZXh0OiBzdHJpbmcsXG4pOiBBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+IHtcbiAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG4gIGNvbnN0IHtkZWZpbml0aW9uc30gPSBkZWZpbml0aW9uUmVzdWx0O1xuICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4ge1xuICAgIGxldCB7bmFtZX0gPSBkZWZpbml0aW9uO1xuICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgLy8gWEhQIGNsYXNzIG5hbWUsIHVzYWdlcyBvbWl0IHRoZSBsZWFkaW5nICc6Jy5cbiAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvbkluZGV4ID0gbGluZVRleHQuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoXG4gICAgICBkZWZpbml0aW9uSW5kZXggPT09IC0xIHx8XG4gICAgICBkZWZpbml0aW9uSW5kZXggPj0gY29sdW1uIHx8XG4gICAgICAheGhwQ2hhclJlZ2V4LnRlc3QobGluZVRleHQuc3Vic3RyaW5nKGRlZmluaXRpb25JbmRleCwgY29sdW1uKSlcbiAgICApIHtcbiAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgICBzZWFyY2hTdGFydENvbHVtbjogZGVmaW5pdGlvbkluZGV4LFxuICAgICAgICBzZWFyY2hFbmRDb2x1bW46IGRlZmluaXRpb25JbmRleCArIGRlZmluaXRpb24ubmFtZS5sZW5ndGgsXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG4iXX0=