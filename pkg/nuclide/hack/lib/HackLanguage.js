var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _remoteUri = require('../../remote-uri');

var _utils = require('./utils');

var _logging = require('../../logging');

var _commons = require('../../commons');

var _atom = require('atom');

var _HackWorker = require('./HackWorker');

var _HackWorker2 = _interopRequireDefault(_HackWorker);

var _hackCommon = require('../../hack-common');

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
module.exports = (function () {

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   * It should only be null if client is null.
   */

  function HackLanguage(hhAvailable, basePath, initialFileUri) {
    _classCallCheck(this, HackLanguage);

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

  _createClass(HackLanguage, [{
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
      // Calculate the offset of the cursor from the beginning of the file.
      // Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
      var markedContents = contents.substring(0, offset) + 'AUTO332' + contents.substring(offset, contents.length);
      var localPath = (0, _remoteUri.getPath)(filePath);
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
      yield this.updateFile(path, contents);
      var webWorkerMessage = { cmd: 'hh_check_file', args: [path] };

      var _ref4 = yield this._hackWorker.runWorkerTask(webWorkerMessage);

      var errors = _ref4.errors;

      return errors;
    })
  }, {
    key: 'getServerDiagnostics',
    value: _asyncToGenerator(function* (filePath) {
      var _getHackService3 = (0, _utils.getHackService)(filePath);

      var getDiagnostics = _getHackService3.getDiagnostics;

      var diagnosticResult = null;
      try {
        diagnosticResult = yield getDiagnostics(filePath, '');
      } catch (err) {
        (0, _logging.getLogger)().error(err);
        return [];
      }
      if (!diagnosticResult) {
        (0, _logging.getLogger)().error('hh_client could not be reached');
        return [];
      }
      var hackDiagnostics = diagnosticResult;
      return hackDiagnostics.messages;
    })
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
      return _commons.array.find(definitionResults, function (definitionResult) {
        return definitionResult.length === 1;
      }) || _commons.array.find(definitionResults, function (definitionResult) {
        return definitionResult.length > 1;
      }) || [];
    })
  }, {
    key: 'getSymbolNameAtPosition',
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
    key: 'getSymbolNameAtPositionWithDependencies',
    value: _asyncToGenerator(function* (path, contents, lineNumber, column, timeout) {
      var _this2 = this;

      return this._waitForDependencies(function () {
        return _this2.getSymbolNameAtPosition(path, contents, lineNumber, column);
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
        symbol = yield this.getSymbolNameAtPosition((0, _remoteUri.getPath)(filePath), contents, lineNumber, column);
      } catch (err) {
        // Ignore the error.
        (0, _logging.getLogger)().warn('_getDefinitionFromSymbolName error:', err);
        return [];
      }
      if (!symbol || !symbol.name) {
        return [];
      }

      var _getHackService4 = (0, _utils.getHackService)(filePath);

      var getDefinition = _getHackService4.getDefinition;

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

      var _parse = (0, _remoteUri.parse)(filePath);

      var hostname = _parse.hostname;
      var port = _parse.port;
      var localPath = _parse.path;

      yield this.updateFile(localPath, contents);
      var webWorkerMessage = { cmd: 'hh_infer_pos', args: [localPath, lineNumber, column] };
      var response = yield this._hackWorker.runWorkerTask(webWorkerMessage);
      var position = response.pos || {};
      if (!position.filename) {
        return [];
      }
      return [{
        path: hostname && port ? (0, _remoteUri.createRemoteUri)(hostname, parseInt(port, 10), position.filename) : position.filename,
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
      var _getHackService5 = (0, _utils.getHackService)(filePath);

      var getIdentifierDefinition = _getHackService5.getIdentifierDefinition;

      var definitionResult = yield getIdentifierDefinition(filePath, contents, lineNumber, column);
      if (!definitionResult) {
        return [];
      }
      var _ref5 = definitionResult;
      var definitions = _ref5.definitions;

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

      var _getHackService6 = (0, _utils.getHackService)(filePath);

      var getDefinition = _getHackService6.getDefinition;

      var definitionResult = yield getDefinition(filePath, search, _hackCommon.SymbolType.UNKNOWN);
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

      var _ref6 = yield this._hackWorker.runWorkerTask(webWorkerMessage);

      var type = _ref6.type;

      return type;
    })
  }, {
    key: 'getReferences',
    value: _asyncToGenerator(function* (filePath, contents, symbol) {
      var _getHackService7 = (0, _utils.getHackService)(filePath);

      var getReferences = _getHackService7.getReferences;

      var referencesResult = yield getReferences(filePath, symbol.name, symbol.type);
      return referencesResult;
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
        var result = yield func();
        if (acceptable && acceptable(result) || this.isFinishedLoadingDependencies()) {
          return result;
        }
        // Wait for dependencies to finish loading - to avoid polling, we'll wait for the callback.
        yield new Promise(function (resolve) {
          var subscription = _this3.onFinishedLoadingDependencies(function () {
            subscription.dispose();
            resolve();
          });
        });
      }
      throw new Error('Timed out waiting for Hack dependencies');
    })
  }]);

  return HackLanguage;
})();

var stringToCompletionType = {
  'id': _hackCommon.CompletionType.ID,
  'new': _hackCommon.CompletionType.NEW,
  'type': _hackCommon.CompletionType.TYPE,
  'class_get': _hackCommon.CompletionType.CLASS_GET,
  'var': _hackCommon.CompletionType.VAR
};

function getCompletionType(input) {
  var completionType = stringToCompletionType[input];
  if (typeof completionType === 'undefined') {
    completionType = _hackCommon.CompletionType.NONE;
  }
  return completionType;
}

var stringToSymbolType = {
  'class': _hackCommon.SymbolType.CLASS,
  'function': _hackCommon.SymbolType.FUNCTION,
  'method': _hackCommon.SymbolType.METHOD,
  'local': _hackCommon.SymbolType.LOCAL
};

function getSymbolType(input) {
  var symbolType = stringToSymbolType[input];
  if (typeof symbolType === 'undefined') {
    symbolType = _hackCommon.SymbolType.METHOD;
  }
  return symbolType;
}

var serverCompletionTypes = new Set([_hackCommon.CompletionType.ID, _hackCommon.CompletionType.NEW, _hackCommon.CompletionType.TYPE]);

function shouldDoServerCompletion(type) {
  return serverCompletionTypes.has(type);
}

function processCompletions(completionsResponse) {
  return completionsResponse.map(function (completion) {
    var name = completion.name;
    var type = completion.type;
    var functionDetails = completion.func_details;

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
//# sourceMappingURL=data:application/json;base64,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QSxVQUFVLEVBQUk7UUFDdEMsSUFBSSxHQUF5QyxVQUFVLENBQXZELElBQUk7UUFBRSxJQUFJLEdBQW1DLFVBQVUsQ0FBakQsSUFBSTtRQUFnQixlQUFlLEdBQUksVUFBVSxDQUEzQyxZQUFZOztBQUM3QixRQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2hGLFVBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksZUFBZSxFQUFFO1VBQ1osTUFBTSxHQUFJLGVBQWUsQ0FBekIsTUFBTTs7O0FBRWIsVUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxLQUFLO2VBQUssSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUc7T0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFHLGtCQUFZLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxZQUFZLEdBQUcsR0FBRyxDQUFDO0tBQ2hEO0FBQ0QsV0FBTztBQUNMLGtCQUFZLEVBQVosWUFBWTtBQUNaLGVBQVMsRUFBRSxJQUFJO0FBQ2YsZUFBUyxFQUFFLElBQUk7S0FDaEIsQ0FBQztHQUNILENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IkhhY2tMYW5ndWFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgSGFja0NvbXBsZXRpb25zUmVzdWx0LFxuICBIYWNrQ29tcGxldGlvbixcbiAgSGFja0RpYWdub3N0aWNzUmVzdWx0LFxuICBIYWNrRGlhZ25vc3RpYyxcbiAgSGFja0RlZmluaXRpb25SZXN1bHQsXG4gIEhhY2tTZWFyY2hQb3NpdGlvbixcbiAgSGFja1N5bWJvbE5hbWVSZXN1bHQsXG4gIEhhY2tSZWZlcmVuY2VzUmVzdWx0LFxufSBmcm9tICcuLi8uLi9oYWNrLWJhc2UvbGliL3R5cGVzJztcblxuaW1wb3J0IHtwYXJzZSwgY3JlYXRlUmVtb3RlVXJpLCBnZXRQYXRofSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB7Z2V0SGFja1NlcnZpY2V9IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHtnZXRMb2dnZXJ9IGZyb20gJy4uLy4uL2xvZ2dpbmcnO1xuaW1wb3J0IHthcnJheX0gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge1JhbmdlLCBFbWl0dGVyfSBmcm9tICdhdG9tJztcbmltcG9ydCBIYWNrV29ya2VyIGZyb20gJy4vSGFja1dvcmtlcic7XG5pbXBvcnQge0NvbXBsZXRpb25UeXBlLCBTeW1ib2xUeXBlfSBmcm9tICcuLi8uLi9oYWNrLWNvbW1vbic7XG5cbi8vIFRoZSB3b3JkIGNoYXIgcmVnZXggaW5jbHVkZSBcXCB0byBzZWFyY2ggZm9yIG5hbWVzcGFjZWQgY2xhc3Nlcy5cbmNvbnN0IHdvcmRDaGFyUmVnZXggPSAvW1xcd1xcXFxdLztcbi8vIFRoZSB4aHAgY2hhciByZWdleCBpbmNsdWRlIDogYW5kIC0gdG8gbWF0Y2ggeGhwIHRhZ3MgbGlrZSA8dWk6YnV0dG9uLWdyb3VwPi5cbmNvbnN0IHhocENoYXJSZWdleCA9IC9bXFx3Oi1dLztcbmNvbnN0IFhIUF9MSU5FX1RFWFRfUkVHRVggPSAvPChbYS16XVthLXowLTlfLjotXSopW14+XSpcXC8/Pi9naTtcblxuY29uc3QgVVBEQVRFX0RFUEVOREVOQ0lFU19JTlRFUlZBTF9NUyA9IDEwMDAwO1xuY29uc3QgREVQRU5ERU5DSUVTX0xPQURFRF9FVkVOVCA9ICdkZXBlbmRlbmNpZXMtbG9hZGVkJztcbmNvbnN0IE1BWF9IQUNLX1dPUktFUl9URVhUX1NJWkUgPSAxMDAwMDtcblxuLyoqXG4gKiBUaGUgSGFja0xhbmd1YWdlIGlzIHRoZSBjb250cm9sbGVyIHRoYXQgc2VydmVycyBsYW5ndWFnZSByZXF1ZXN0cyBieSB0cnlpbmcgdG8gZ2V0IHdvcmtlciByZXN1bHRzXG4gKiBhbmQvb3IgcmVzdWx0cyBmcm9tIEhhY2tTZXJ2aWNlICh3aGljaCB3b3VsZCBiZSBleGVjdXRpbmcgaGhfY2xpZW50IG9uIGEgc3VwcG9ydGluZyBzZXJ2ZXIpXG4gKiBhbmQgY29tYmluaW5nIGFuZC9vciBzZWxlY3RpbmcgdGhlIHJlc3VsdHMgdG8gZ2l2ZSBiYWNrIHRvIHRoZSByZXF1ZXN0ZXIuXG4gKi9cbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgSGFja0xhbmd1YWdlIHtcblxuICBfaGhBdmFpbGFibGU6IGJvb2xlYW47XG4gIF9oYWNrV29ya2VyOiBIYWNrV29ya2VyO1xuICBfcGF0aENvbnRlbnRzTWFwOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xuICBfYmFzZVBhdGg6ID9zdHJpbmc7XG4gIF9pbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaTtcbiAgX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzOiBib29sZWFuO1xuICBfZW1pdHRlcjogRW1pdHRlcjtcbiAgX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIGBiYXNlUGF0aGAgc2hvdWxkIGJlIHRoZSBkaXJlY3Rvcnkgd2hlcmUgdGhlIC5oaGNvbmZpZyBmaWxlIGlzIGxvY2F0ZWQuXG4gICAqIEl0IHNob3VsZCBvbmx5IGJlIG51bGwgaWYgY2xpZW50IGlzIG51bGwuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihoaEF2YWlsYWJsZTogYm9vbGVhbiwgYmFzZVBhdGg6ID9zdHJpbmcsIGluaXRpYWxGaWxlVXJpOiBOdWNsaWRlVXJpKSB7XG4gICAgdGhpcy5faGhBdmFpbGFibGUgPSBoaEF2YWlsYWJsZTtcbiAgICB0aGlzLl9oYWNrV29ya2VyID0gbmV3IEhhY2tXb3JrZXIoKTtcbiAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAgPSBuZXcgTWFwKCk7XG4gICAgdGhpcy5fYmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgICB0aGlzLl9pbml0aWFsRmlsZVVyaSA9IGluaXRpYWxGaWxlVXJpO1xuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gdHJ1ZTtcbiAgICB0aGlzLl9lbWl0dGVyID0gbmV3IEVtaXR0ZXIoKTtcblxuICAgIGlmICh0aGlzLl9oaEF2YWlsYWJsZSkge1xuICAgICAgdGhpcy5fc2V0dXBVcGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZXR1cFVwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsKCkge1xuICAgIC8vIEZldGNoIGFueSBkZXBlbmRlbmNpZXMgdGhlIEhhY2tXb3JrZXIgbmVlZHMgYWZ0ZXIgbGVhcm5pbmcgYWJvdXQgdGhpcyBmaWxlLlxuICAgIC8vIFdlIGRvbid0IGJsb2NrIGFueSByZWFsdGltZSBsb2dpYyBvbiB0aGUgZGVwZW5kZW5jeSBmZXRjaGluZyAtIGl0IGNvdWxkIHRha2UgYSB3aGlsZS5cbiAgICBsZXQgcGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcyA9IGZhbHNlO1xuXG4gICAgY29uc3QgZmluaXNoVXBkYXRlRGVwZW5kZW5jaWVzID0gKCkgPT4ge1xuICAgICAgcGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcyA9IGZhbHNlO1xuICAgIH07XG5cbiAgICB0aGlzLl91cGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGlmIChwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgdGhpcy51cGRhdGVEZXBlbmRlbmNpZXMoKS50aGVuKGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcywgZmluaXNoVXBkYXRlRGVwZW5kZW5jaWVzKTtcbiAgICB9LCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5faGFja1dvcmtlci5kaXNwb3NlKCk7XG4gICAgY2xlYXJJbnRlcnZhbCh0aGlzLl91cGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCk7XG4gIH1cblxuICBhc3luYyBnZXRDb21wbGV0aW9ucyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIG9mZnNldDogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8YW55Pj4ge1xuICAgIC8vIENhbGN1bGF0ZSB0aGUgb2Zmc2V0IG9mIHRoZSBjdXJzb3IgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlLlxuICAgIC8vIFRoZW4gaW5zZXJ0IEFVVE8zMzIgaW4gYXQgdGhpcyBvZmZzZXQuIChIYWNrIHVzZXMgdGhpcyBhcyBhIG1hcmtlci4pXG4gICAgY29uc3QgbWFya2VkQ29udGVudHMgPSBjb250ZW50cy5zdWJzdHJpbmcoMCwgb2Zmc2V0KSArXG4gICAgICAgICdBVVRPMzMyJyArIGNvbnRlbnRzLnN1YnN0cmluZyhvZmZzZXQsIGNvbnRlbnRzLmxlbmd0aCk7XG4gICAgY29uc3QgbG9jYWxQYXRoID0gZ2V0UGF0aChmaWxlUGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgbWFya2VkQ29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYXV0b19jb21wbGV0ZScsIGFyZ3M6IFtsb2NhbFBhdGhdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBjb21wbGV0aW9uVHlwZSA9IGdldENvbXBsZXRpb25UeXBlKHJlc3BvbnNlLmNvbXBsZXRpb25fdHlwZSk7XG4gICAgbGV0IHtjb21wbGV0aW9uc30gPSByZXNwb25zZTtcbiAgICBpZiAoc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKGNvbXBsZXRpb25UeXBlKSB8fCAhY29tcGxldGlvbnMubGVuZ3RoKSB7XG4gICAgICBjb25zdCB7Z2V0Q29tcGxldGlvbnN9ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgICAgY29uc3QgY29tcGxldGlvbnNSZXN1bHQgPSBhd2FpdCBnZXRDb21wbGV0aW9ucyhmaWxlUGF0aCwgbWFya2VkQ29udGVudHMpO1xuICAgICAgaWYgKGNvbXBsZXRpb25zUmVzdWx0KSB7XG4gICAgICAgIGNvbXBsZXRpb25zID0gKChjb21wbGV0aW9uc1Jlc3VsdDogYW55KTogSGFja0NvbXBsZXRpb25zUmVzdWx0KS5jb21wbGV0aW9ucztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHByb2Nlc3NDb21wbGV0aW9ucyhjb21wbGV0aW9ucyk7XG4gIH1cblxuICBhc3luYyB1cGRhdGVGaWxlKHBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGlmIChjb250ZW50cyAhPT0gdGhpcy5fcGF0aENvbnRlbnRzTWFwLmdldChwYXRoKSkge1xuICAgICAgdGhpcy5fcGF0aENvbnRlbnRzTWFwLnNldChwYXRoLCBjb250ZW50cyk7XG4gICAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2FkZF9maWxlJywgYXJnczogW3BhdGgsIGNvbnRlbnRzXX07XG4gICAgICB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyA9IGZhbHNlO1xuICAgICAgcmV0dXJuIGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICB9XG4gIH1cblxuICBhc3luYyB1cGRhdGVEZXBlbmRlbmNpZXMoKTogUHJvbWlzZSB7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9nZXRfZGVwcycsIGFyZ3M6IFtdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBpZiAoIXJlc3BvbnNlLmRlcHMubGVuZ3RoKSB7XG4gICAgICBpZiAoIXRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIHRoaXMuX2VtaXR0ZXIuZW1pdChERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5UKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyA9IGZhbHNlO1xuICAgIGNvbnN0IHtnZXREZXBlbmRlbmNpZXN9ID0gZ2V0SGFja1NlcnZpY2UodGhpcy5faW5pdGlhbEZpbGVVcmkpO1xuICAgIGNvbnN0IGRlcGVuZGVuY2llc1Jlc3VsdCA9IGF3YWl0IGdldERlcGVuZGVuY2llcyhcbiAgICAgIHRoaXMuX2luaXRpYWxGaWxlVXJpLCByZXNwb25zZS5kZXBzXG4gICAgKTtcbiAgICBpZiAoIWRlcGVuZGVuY2llc1Jlc3VsdCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7ZGVwZW5kZW5jaWVzfSA9IGRlcGVuZGVuY2llc1Jlc3VsdDtcbiAgICAvLyBTZXJpYWxseSB1cGRhdGUgZGVwZWRuZWNpZXMgbm90IHRvIGJsb2NrIHRoZSB3b3JrZXIgZnJvbSBzZXJ2aW5nIG90aGVyIGZlYXR1cmUgcmVxdWVzdHMuXG4gICAgLyogZXNsaW50LWRpc2FibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICAgIGZvciAoY29uc3QgW2ZpbGVQYXRoLCBjb250ZW50c10gb2YgZGVwZW5kZW5jaWVzKSB7XG4gICAgICBhd2FpdCB0aGlzLnVwZGF0ZURlcGVuZGVuY3koZmlsZVBhdGgsIGNvbnRlbnRzKTtcbiAgICB9XG4gICAgLyogZXNsaW50LWVuYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gIH1cblxuICBhc3luYyB1cGRhdGVEZXBlbmRlbmN5KHBhdGg6IHN0cmluZywgY29udGVudHM6IHN0cmluZyk6IFByb21pc2Uge1xuICAgIGlmIChjb250ZW50cyAhPT0gdGhpcy5fcGF0aENvbnRlbnRzTWFwLmdldChwYXRoKSkge1xuICAgICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9hZGRfZGVwJywgYXJnczogW3BhdGgsIGNvbnRlbnRzXX07XG4gICAgICBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSwge2lzRGVwZW5kZW5jeTogdHJ1ZX0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBIHNpbXBsZSB3YXkgdG8gZXN0aW1hdGUgaWYgYWxsIEhhY2sgZGVwZW5kZW5jaWVzIGhhdmUgYmVlbiBsb2FkZWQuXG4gICAqIFRoaXMgZmxhZyBpcyB0dXJuZWQgb2ZmIHdoZW4gYSBmaWxlIGdldHMgdXBkYXRlZCBvciBhZGRlZCwgYW5kIGdldHMgdHVybmVkIGJhY2sgb25cbiAgICogb25jZSBgdXBkYXRlRGVwZW5kZW5jaWVzKClgIHJldHVybnMgbm8gYWRkaXRpb25hbCBkZXBlbmRlbmNpZXMuXG4gICAqXG4gICAqIFRoZSBmbGFnIG9ubHkgdXBkYXRlcyBldmVyeSBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TLCBzbyBpdCdzIG5vdCBwZXJmZWN0IC1cbiAgICogaG93ZXZlciwgaXQgc2hvdWxkIGJlIGdvb2QgZW5vdWdoIGZvciBsb2FkaW5nIGluZGljYXRvcnMgLyB3YXJuaW5ncy5cbiAgICovXG4gIGlzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcztcbiAgfVxuXG4gIG9uRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKGNhbGxiYWNrOiAoKCkgPT4gbWl4ZWQpKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBmb3JtYXRTb3VyY2UoXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBzdGFydFBvc2l0aW9uOiBudW1iZXIsXG4gICAgZW5kUG9zaXRpb246IG51bWJlcixcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2Zvcm1hdCcsIGFyZ3M6IFtjb250ZW50cywgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb25dfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNwb25zZS5lcnJvcl9tZXNzYWdlO1xuICAgIGlmIChlcnJvck1lc3NhZ2UpIHtcbiAgICAgIGlmIChlcnJvck1lc3NhZ2UgPT09ICdQaHBfb3JfZGVjbCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3JyeSwgUEhQIGFuZCA8P2hoIC8vZGVjbCBhcmUgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfSBlbHNlIGlmIChlcnJvck1lc3NhZ2UgPT09ICdQYXJzaW5nX2Vycm9yJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcnNpbmcgRXJyb3IhIEZpeCB5b3VyIGZpbGUgc28gdGhlIHN5bnRheCBpcyB2YWxpZCBhbmQgcmV0cnknKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkIGZvcm1hdGluZyBoYWNrIGNvZGUnICsgZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc3VsdDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBoaWdobGlnaHRTb3VyY2UoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbDogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PGF0b20kUmFuZ2U+PiB7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKHBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2ZpbmRfbHZhcl9yZWZzJywgYXJnczogW3BhdGgsIGxpbmUsIGNvbF19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIHJldHVybiByZXNwb25zZS5wb3NpdGlvbnMubWFwKFxuICAgICAgcG9zaXRpb24gPT4gbmV3IFJhbmdlKFxuICAgICAgICBbcG9zaXRpb24ubGluZSAtIDEsIHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxXSxcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX2VuZF0sXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGdldERpYWdub3N0aWNzKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICApOiBQcm9taXNlPEFycmF5PHttZXNzYWdlOiBIYWNrRGlhZ25vc3RpYzt9Pj4ge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9jaGVja19maWxlJywgYXJnczogW3BhdGhdfTtcbiAgICBjb25zdCB7ZXJyb3JzfSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICByZXR1cm4gZXJyb3JzO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2VydmVyRGlhZ25vc3RpY3MoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgY29uc3Qge2dldERpYWdub3N0aWNzfSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBsZXQgZGlhZ25vc3RpY1Jlc3VsdCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGRpYWdub3N0aWNSZXN1bHQgPSBhd2FpdCBnZXREaWFnbm9zdGljcyhmaWxlUGF0aCwgJycpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFkaWFnbm9zdGljUmVzdWx0KSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcignaGhfY2xpZW50IGNvdWxkIG5vdCBiZSByZWFjaGVkJyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGhhY2tEaWFnbm9zdGljcyA9ICgoZGlhZ25vc3RpY1Jlc3VsdDogYW55KTogSGFja0RpYWdub3N0aWNzUmVzdWx0KTtcbiAgICByZXR1cm4gaGFja0RpYWdub3N0aWNzLm1lc3NhZ2VzO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZ1xuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgdG8gcGFyc2UsIGluZGVudGl5IHRoZSBwb3NpdGlvbixcbiAgICAvLyBhbmQgbG9va3VwIHRoYXQgaWRlbnRpZmllciBmb3IgYSBsb2NhdGlvbiBtYXRjaC5cbiAgICBjb25zdCBpZGVudGlmaWVyUmVzdWx0ID0gYXdhaXQgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW4sXG4gICAgICBsaW5lVGV4dCxcbiAgICApO1xuICAgIGlmIChpZGVudGlmaWVyUmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGlkZW50aWZpZXJSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGhldXJpc3RpY1Jlc3VsdHMgPVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHN5bWJvbCBuYW1lIHNlYXJjaCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKGZpbGVQYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKSxcbiAgICAgICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCBmb3IgYSBzZWFyY2ggb2YgdGhlIHN0cmluZyBwYXJzZWQuXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoZmlsZVBhdGgsIGxpbmVUZXh0LCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgSGFjayBjbGllbnQgc2lkZSBmb3IgYSByZXN1bHQgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgXSk7XG4gICAgLy8gV2Ugbm93IGhhdmUgcmVzdWx0cyBmcm9tIGFsbCA0IHNvdXJjZXMuXG4gICAgLy8gQ2hvb3NlIHRoZSBiZXN0IHJlc3VsdHMgdG8gc2hvdyB0byB0aGUgdXNlci5cbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0cyA9IFtpZGVudGlmaWVyUmVzdWx0XS5jb25jYXQoaGV1cmlzdGljUmVzdWx0cyk7XG4gICAgcmV0dXJuIGFycmF5LmZpbmQoZGVmaW5pdGlvblJlc3VsdHMsIGRlZmluaXRpb25SZXN1bHQgPT4gZGVmaW5pdGlvblJlc3VsdC5sZW5ndGggPT09IDEpXG4gICAgICB8fCBhcnJheS5maW5kKGRlZmluaXRpb25SZXN1bHRzLCBkZWZpbml0aW9uUmVzdWx0ID0+IGRlZmluaXRpb25SZXN1bHQubGVuZ3RoID4gMSlcbiAgICAgIHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24oXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8P0hhY2tTeW1ib2xOYW1lUmVzdWx0PiB7XG5cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUocGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZ2V0X21ldGhvZF9uYW1lJywgYXJnczogW3BhdGgsIGxpbmVOdW1iZXIsIGNvbHVtbl19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UubmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHN5bWJvbFR5cGUgPSBnZXRTeW1ib2xUeXBlKHJlc3BvbnNlLnJlc3VsdF90eXBlKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHJlc3BvbnNlLnBvcztcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogcmVzcG9uc2UubmFtZSxcbiAgICAgIHR5cGU6IHN5bWJvbFR5cGUsXG4gICAgICBsaW5lOiBwb3NpdGlvbi5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogcG9zaXRpb24uY2hhcl9zdGFydCAtIDEsXG4gICAgICBsZW5ndGg6IHBvc2l0aW9uLmNoYXJfZW5kIC0gcG9zaXRpb24uY2hhcl9zdGFydCArIDEsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHRoaW4gd3JhcHBlciBhcm91bmQgZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24gdGhhdCB3YWl0cyBmb3IgZGVwZW5kZW5jaWVzIGJlZm9yZSByZXBvcnRpbmdcbiAgICogdGhhdCBubyBzeW1ib2wgbmFtZSBjYW4gYmUgcmVzb2x2ZWQuXG4gICAqL1xuICBhc3luYyBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbldpdGhEZXBlbmRlbmNpZXMoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIHRpbWVvdXQ6ID9udW1iZXIsXG4gICk6IFByb21pc2U8P0hhY2tTeW1ib2xOYW1lUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3dhaXRGb3JEZXBlbmRlbmNpZXMoXG4gICAgICAoKSA9PiB0aGlzLmdldFN5bWJvbE5hbWVBdFBvc2l0aW9uKHBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgeCA9PiB4ICE9IG51bGwsXG4gICAgICB0aW1lb3V0LFxuICAgICk7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGlmIChjb250ZW50cy5sZW5ndGggPiBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFKSB7XG4gICAgICAvLyBBdm9pZCBQb29yIFdvcmtlciBQZXJmb3JtYW5jZSBmb3IgbGFyZ2UgZmlsZXMuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBzeW1ib2wgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBzeW1ib2wgPSBhd2FpdCB0aGlzLmdldFN5bWJvbE5hbWVBdFBvc2l0aW9uKGdldFBhdGgoZmlsZVBhdGgpLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIElnbm9yZSB0aGUgZXJyb3IuXG4gICAgICBnZXRMb2dnZXIoKS53YXJuKCdfZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lIGVycm9yOicsIGVycik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghc3ltYm9sIHx8ICFzeW1ib2wubmFtZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7Z2V0RGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldERlZmluaXRpb24oZmlsZVBhdGgsIHN5bWJvbC5uYW1lLCBzeW1ib2wudHlwZSk7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KS5kZWZpbml0aW9ucztcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uTG9jYXRpb25BdFBvc2l0aW9uKFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgICBjb250ZW50czogc3RyaW5nLFxuICAgICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgICAgY29sdW1uOiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgaWYgKCFmaWxlUGF0aCB8fCBjb250ZW50cy5sZW5ndGggPiBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFKSB7XG4gICAgICAvLyBBdm9pZCBQb29yIFdvcmtlciBQZXJmb3JtYW5jZSBmb3IgbGFyZ2UgZmlsZXMuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHtob3N0bmFtZSwgcG9ydCwgcGF0aDogbG9jYWxQYXRofSA9IHBhcnNlKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9pbmZlcl9wb3MnLCBhcmdzOiBbbG9jYWxQYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHJlc3BvbnNlLnBvcyB8fCB7fTtcbiAgICBpZiAoIXBvc2l0aW9uLmZpbGVuYW1lKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBbe1xuICAgICAgcGF0aDogKGhvc3RuYW1lICYmIHBvcnQpXG4gICAgICAgID8gY3JlYXRlUmVtb3RlVXJpKGhvc3RuYW1lLCBwYXJzZUludChwb3J0LCAxMCksIHBvc2l0aW9uLmZpbGVuYW1lKVxuICAgICAgICA6IHBvc2l0aW9uLmZpbGVuYW1lLFxuICAgICAgbGluZTogcG9zaXRpb24ubGluZSAtIDEsXG4gICAgICBjb2x1bW46IHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxLFxuICAgICAgbGVuZ3RoOiBwb3NpdGlvbi5jaGFyX2VuZCAtIHBvc2l0aW9uLmNoYXJfc3RhcnQgKyAxLFxuICAgICAgbmFtZTogcG9zaXRpb24ubmFtZSxcbiAgICAgIHNjb3BlOiBwb3NpdGlvbi5zY29wZSxcbiAgICAgIGFkZGl0aW9uYWxJbmZvOiBwb3NpdGlvbi5hZGRpdGlvbmFsSW5mbyxcbiAgICB9XTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbUlkZW50aWZpZXIoXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgICBjb2x1bW46IG51bWJlcixcbiAgICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGNvbnN0IHtnZXRJZGVudGlmaWVyRGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldElkZW50aWZpZXJEZWZpbml0aW9uKFxuICAgICAgZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW5cbiAgICApO1xuICAgIGlmICghZGVmaW5pdGlvblJlc3VsdCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7ZGVmaW5pdGlvbnN9ID0gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCk7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcChkZWZpbml0aW9uID0+IHtcbiAgICAgIGxldCB7bmFtZX0gPSBkZWZpbml0aW9uO1xuICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnOicpKSB7XG4gICAgICAgIC8vIFhIUCBjbGFzcyBuYW1lLCB1c2FnZXMgb21pdCB0aGUgbGVhZGluZyAnOicuXG4gICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRlZmluaXRpb25JbmRleCA9IGxpbmVUZXh0LmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoXG4gICAgICAgIGRlZmluaXRpb25JbmRleCA9PT0gLTEgfHxcbiAgICAgICAgZGVmaW5pdGlvbkluZGV4ID49IGNvbHVtbiB8fFxuICAgICAgICAheGhwQ2hhclJlZ2V4LnRlc3QobGluZVRleHQuc3Vic3RyaW5nKGRlZmluaXRpb25JbmRleCwgY29sdW1uKSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZGVmaW5pdGlvbixcbiAgICAgICAgICBzZWFyY2hTdGFydENvbHVtbjogZGVmaW5pdGlvbkluZGV4LFxuICAgICAgICAgIHNlYXJjaEVuZENvbHVtbjogZGVmaW5pdGlvbkluZGV4ICsgZGVmaW5pdGlvbi5uYW1lLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbVN0cmluZ1BhcnNlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3Qge3NlYXJjaCwgc3RhcnQsIGVuZH0gPSB0aGlzLl9wYXJzZVN0cmluZ0ZvckV4cHJlc3Npb24obGluZVRleHQsIGNvbHVtbik7XG4gICAgaWYgKCFzZWFyY2gpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qge2dldERlZmluaXRpb259ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHQgPSBhd2FpdCBnZXREZWZpbml0aW9uKGZpbGVQYXRoLCBzZWFyY2gsIFN5bWJvbFR5cGUuVU5LTk9XTik7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCkuZGVmaW5pdGlvbnM7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcChkZWZpbml0aW9uID0+ICh7XG4gICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgc2VhcmNoU3RhcnRDb2x1bW46IHN0YXJ0LFxuICAgICAgc2VhcmNoRW5kQ29sdW1uOiBlbmQsXG4gICAgfSkpO1xuICB9XG5cbiAgX3BhcnNlU3RyaW5nRm9yRXhwcmVzc2lvbihcbiAgICBsaW5lVGV4dDogc3RyaW5nLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiB7c2VhcmNoOiBzdHJpbmc7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyfSB7XG4gICAgbGV0IHNlYXJjaCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gY29sdW1uO1xuXG4gICAgbGV0IGlzWEhQID0gZmFsc2U7XG4gICAgbGV0IHhocE1hdGNoO1xuICAgIHdoaWxlICAoeGhwTWF0Y2ggPSBYSFBfTElORV9URVhUX1JFR0VYLmV4ZWMobGluZVRleHQpKSB7XG4gICAgICBjb25zdCB4aHBNYXRjaEluZGV4ID0geGhwTWF0Y2guaW5kZXggKyAxO1xuICAgICAgaWYgKGNvbHVtbiA+PSB4aHBNYXRjaEluZGV4ICYmIGNvbHVtbiA8ICh4aHBNYXRjaEluZGV4ICsgeGhwTWF0Y2hbMV0ubGVuZ3RoKSkge1xuICAgICAgICBpc1hIUCA9IHRydWU7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN5bnRheENoYXJSZWdleCA9IGlzWEhQID8geGhwQ2hhclJlZ2V4IDogd29yZENoYXJSZWdleDtcbiAgICAvLyBTY2FuIGZvciB0aGUgd29yZCBzdGFydCBmb3IgdGhlIGhhY2sgdmFyaWFibGUsIGZ1bmN0aW9uIG9yIHhocCB0YWdcbiAgICAvLyB3ZSBhcmUgdHJ5aW5nIHRvIGdldCB0aGUgZGVmaW5pdGlvbiBmb3IuXG4gICAgd2hpbGUgKHN0YXJ0ID49IDAgJiYgc3ludGF4Q2hhclJlZ2V4LnRlc3QobGluZVRleHQuY2hhckF0KHN0YXJ0KSkpIHtcbiAgICAgIHN0YXJ0LS07XG4gICAgfVxuICAgIGlmIChsaW5lVGV4dFtzdGFydF0gPT09ICckJykge1xuICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgc3RhcnQrKztcbiAgICBsZXQgZW5kID0gY29sdW1uO1xuICAgIHdoaWxlIChzeW50YXhDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5jaGFyQXQoZW5kKSkpIHtcbiAgICAgIGVuZCsrO1xuICAgIH1cbiAgICBzZWFyY2ggPSBsaW5lVGV4dC5zdWJzdHJpbmcoc3RhcnQsIGVuZCk7XG4gICAgLy8gWEhQIFVJIGVsZW1lbnRzIHN0YXJ0IHdpdGggOiBidXQgdGhlIHVzYWdlcyBkb2Vzbid0IGhhdmUgdGhhdCBjb2xvbi5cbiAgICBpZiAoaXNYSFAgJiYgIXNlYXJjaC5zdGFydHNXaXRoKCc6JykpIHtcbiAgICAgIHNlYXJjaCA9ICc6JyArIHNlYXJjaDtcbiAgICB9XG4gICAgcmV0dXJuIHtzZWFyY2gsIHN0YXJ0LCBlbmR9O1xuICB9XG5cbiAgYXN5bmMgZ2V0VHlwZShcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBleHByZXNzaW9uOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiBQcm9taXNlPD9zdHJpbmc+IHtcbiAgICBpZiAoIWV4cHJlc3Npb24uc3RhcnRzV2l0aCgnJCcpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKHBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2luZmVyX3R5cGUnLCBhcmdzOiBbcGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3Qge3R5cGV9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIHJldHVybiB0eXBlO1xuICB9XG5cbiAgYXN5bmMgZ2V0UmVmZXJlbmNlcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIHN5bWJvbDogSGFja1N5bWJvbE5hbWVSZXN1bHQsXG4gICk6IFByb21pc2U8P0hhY2tSZWZlcmVuY2VzUmVzdWx0PiB7XG4gICAgY29uc3Qge2dldFJlZmVyZW5jZXN9ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IHJlZmVyZW5jZXNSZXN1bHQgPSBhd2FpdCBnZXRSZWZlcmVuY2VzKGZpbGVQYXRoLCBzeW1ib2wubmFtZSwgc3ltYm9sLnR5cGUpO1xuICAgIHJldHVybiAoKHJlZmVyZW5jZXNSZXN1bHQ6IGFueSk6IEhhY2tSZWZlcmVuY2VzUmVzdWx0KTtcbiAgfVxuXG4gIGdldEJhc2VQYXRoKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9iYXNlUGF0aDtcbiAgfVxuXG4gIGlzSGFja0F2YWlsYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGhBdmFpbGFibGU7XG4gIH1cblxuICAvKipcbiAgICogQ29udGludWFsbHkgcmV0cmllcyB0aGUgZnVuY3Rpb24gcHJvdmlkZWQgdW50aWwgZWl0aGVyOlxuICAgKiAxKSB0aGUgcmV0dXJuIHZhbHVlIGlzIFwiYWNjZXB0YWJsZVwiIChpZiBwcm92aWRlZClcbiAgICogMikgZGVwZW5kZW5jaWVzIGhhdmUgZmluaXNoZWQgbG9hZGluZywgb3JcbiAgICogMykgdGhlIHNwZWNpZmllZCB0aW1lb3V0IGhhcyBiZWVuIHJlYWNoZWQuXG4gICAqL1xuICBhc3luYyBfd2FpdEZvckRlcGVuZGVuY2llczxUPihcbiAgICBmdW5jOiAoKCkgPT4gUHJvbWlzZTxUPiksXG4gICAgYWNjZXB0YWJsZTogPygodmFsdWU6IFQpID0+IGJvb2xlYW4pLFxuICAgIHRpbWVvdXRNczogP251bWJlcixcbiAgKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3Qgc3RhcnRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICB3aGlsZSAoIXRpbWVvdXRNcyB8fCBEYXRlLm5vdygpIC0gc3RhcnRUaW1lIDwgdGltZW91dE1zKSB7XG4gICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBmdW5jKCk7XG4gICAgICBpZiAoKGFjY2VwdGFibGUgJiYgYWNjZXB0YWJsZShyZXN1bHQpKSB8fCB0aGlzLmlzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKCkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIC8vIFdhaXQgZm9yIGRlcGVuZGVuY2llcyB0byBmaW5pc2ggbG9hZGluZyAtIHRvIGF2b2lkIHBvbGxpbmcsIHdlJ2xsIHdhaXQgZm9yIHRoZSBjYWxsYmFjay5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLm9uRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKCgpID0+IHtcbiAgICAgICAgICBzdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaW1lZCBvdXQgd2FpdGluZyBmb3IgSGFjayBkZXBlbmRlbmNpZXMnKTtcbiAgfVxuXG59O1xuXG5jb25zdCBzdHJpbmdUb0NvbXBsZXRpb25UeXBlID0ge1xuICAnaWQnOiBDb21wbGV0aW9uVHlwZS5JRCxcbiAgJ25ldyc6IENvbXBsZXRpb25UeXBlLk5FVyxcbiAgJ3R5cGUnOiBDb21wbGV0aW9uVHlwZS5UWVBFLFxuICAnY2xhc3NfZ2V0JzogQ29tcGxldGlvblR5cGUuQ0xBU1NfR0VULFxuICAndmFyJzogQ29tcGxldGlvblR5cGUuVkFSLFxufTtcblxuZnVuY3Rpb24gZ2V0Q29tcGxldGlvblR5cGUoaW5wdXQ6IHN0cmluZykge1xuICBsZXQgY29tcGxldGlvblR5cGUgPSBzdHJpbmdUb0NvbXBsZXRpb25UeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBjb21wbGV0aW9uVHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBjb21wbGV0aW9uVHlwZSA9IENvbXBsZXRpb25UeXBlLk5PTkU7XG4gIH1cbiAgcmV0dXJuIGNvbXBsZXRpb25UeXBlO1xufVxuXG5jb25zdCBzdHJpbmdUb1N5bWJvbFR5cGUgPSB7XG4gICdjbGFzcyc6IFN5bWJvbFR5cGUuQ0xBU1MsXG4gICdmdW5jdGlvbic6IFN5bWJvbFR5cGUuRlVOQ1RJT04sXG4gICdtZXRob2QnOiBTeW1ib2xUeXBlLk1FVEhPRCxcbiAgJ2xvY2FsJzogU3ltYm9sVHlwZS5MT0NBTCxcbn07XG5cbmZ1bmN0aW9uIGdldFN5bWJvbFR5cGUoaW5wdXQ6IHN0cmluZykge1xuICBsZXQgc3ltYm9sVHlwZSA9IHN0cmluZ1RvU3ltYm9sVHlwZVtpbnB1dF07XG4gIGlmICh0eXBlb2Ygc3ltYm9sVHlwZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBzeW1ib2xUeXBlID0gU3ltYm9sVHlwZS5NRVRIT0Q7XG4gIH1cbiAgcmV0dXJuIHN5bWJvbFR5cGU7XG59XG5cbmNvbnN0IHNlcnZlckNvbXBsZXRpb25UeXBlcyA9IG5ldyBTZXQoW1xuICBDb21wbGV0aW9uVHlwZS5JRCxcbiAgQ29tcGxldGlvblR5cGUuTkVXLFxuICBDb21wbGV0aW9uVHlwZS5UWVBFLFxuXSk7XG5cbmZ1bmN0aW9uIHNob3VsZERvU2VydmVyQ29tcGxldGlvbih0eXBlOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIHNlcnZlckNvbXBsZXRpb25UeXBlcy5oYXModHlwZSk7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NDb21wbGV0aW9ucyhjb21wbGV0aW9uc1Jlc3BvbnNlOiBBcnJheTxIYWNrQ29tcGxldGlvbj4pOiBBcnJheTxhbnk+IHtcbiAgcmV0dXJuIGNvbXBsZXRpb25zUmVzcG9uc2UubWFwKGNvbXBsZXRpb24gPT4ge1xuICAgIGxldCB7bmFtZSwgdHlwZSwgZnVuY19kZXRhaWxzOiBmdW5jdGlvbkRldGFpbHN9ID0gY29tcGxldGlvbjtcbiAgICBpZiAodHlwZSAmJiB0eXBlLmluZGV4T2YoJygnKSA9PT0gMCAmJiB0eXBlLmxhc3RJbmRleE9mKCcpJykgPT09IHR5cGUubGVuZ3RoIC0gMSkge1xuICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKDEsIHR5cGUubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGxldCBtYXRjaFNuaXBwZXQgPSBuYW1lO1xuICAgIGlmIChmdW5jdGlvbkRldGFpbHMpIHtcbiAgICAgIGNvbnN0IHtwYXJhbXN9ID0gZnVuY3Rpb25EZXRhaWxzO1xuICAgICAgLy8gQ29uc3RydWN0IHRoZSBzbmlwcGV0OiBlLmcuIG15RnVuY3Rpb24oJHsxOiRhcmcxfSwgJHsyOiRhcmcyfSk7XG4gICAgICBjb25zdCBwYXJhbXNTdHJpbmcgPSBwYXJhbXMubWFwKChwYXJhbSwgaW5kZXgpID0+ICckeycgKyAoaW5kZXggKyAxKSArICc6JyArIHBhcmFtLm5hbWUgKyAnfScpLmpvaW4oJywgJyk7XG4gICAgICBtYXRjaFNuaXBwZXQgPSBuYW1lICsgJygnICsgcGFyYW1zU3RyaW5nICsgJyknO1xuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hTbmlwcGV0LFxuICAgICAgbWF0Y2hUZXh0OiBuYW1lLFxuICAgICAgbWF0Y2hUeXBlOiB0eXBlLFxuICAgIH07XG4gIH0pO1xufVxuIl19