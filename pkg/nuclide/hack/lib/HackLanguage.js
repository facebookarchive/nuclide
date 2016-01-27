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
//# sourceMappingURL=data:application/json;base64,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QSxVQUFVLEVBQUk7UUFDdEMsSUFBSSxHQUF5QyxVQUFVLENBQXZELElBQUk7UUFBRSxJQUFJLEdBQW1DLFVBQVUsQ0FBakQsSUFBSTtRQUFnQixlQUFlLEdBQUksVUFBVSxDQUEzQyxZQUFZOztBQUM3QixRQUFJLElBQUksSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxLQUFLLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQ2hGLFVBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0tBQzNDO0FBQ0QsUUFBSSxZQUFZLEdBQUcsSUFBSSxDQUFDO0FBQ3hCLFFBQUksZUFBZSxFQUFFO1VBQ1osTUFBTSxHQUFJLGVBQWUsQ0FBekIsTUFBTTs7O0FBRWIsVUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFDLEtBQUssRUFBRSxLQUFLO2VBQUssSUFBSSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUc7T0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzFHLGtCQUFZLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxZQUFZLEdBQUcsR0FBRyxDQUFDO0tBQ2hEO0FBQ0QsV0FBTztBQUNMLGtCQUFZLEVBQVosWUFBWTtBQUNaLGVBQVMsRUFBRSxJQUFJO0FBQ2YsZUFBUyxFQUFFLElBQUk7S0FDaEIsQ0FBQztHQUNILENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IkhhY2tMYW5ndWFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgSGFja0NvbXBsZXRpb25zUmVzdWx0LFxuICBIYWNrQ29tcGxldGlvbixcbiAgSGFja0RpYWdub3N0aWNzUmVzdWx0LFxuICBIYWNrRGlhZ25vc3RpYyxcbiAgSGFja0RlZmluaXRpb25SZXN1bHQsXG4gIEhhY2tTZWFyY2hQb3NpdGlvbixcbiAgSGFja1JlZmVyZW5jZXNSZXN1bHQsXG59IGZyb20gJy4uLy4uL2hhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuXG5pbXBvcnQgdHlwZSB7SGFja1N5bWJvbE5hbWVSZXN1bHR9IGZyb20gJy4uLy4uL2hhY2stYmFzZS9saWIvdHlwZXMnO1xuXG5pbXBvcnQge3BhcnNlLCBjcmVhdGVSZW1vdGVVcmksIGdldFBhdGh9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRIYWNrU2VydmljZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7UmFuZ2UsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEhhY2tXb3JrZXIgZnJvbSAnLi9IYWNrV29ya2VyJztcbmltcG9ydCB7Q29tcGxldGlvblR5cGUsIFN5bWJvbFR5cGV9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uJztcblxuLy8gVGhlIHdvcmQgY2hhciByZWdleCBpbmNsdWRlIFxcIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlZCBjbGFzc2VzLlxuY29uc3Qgd29yZENoYXJSZWdleCA9IC9bXFx3XFxcXF0vO1xuLy8gVGhlIHhocCBjaGFyIHJlZ2V4IGluY2x1ZGUgOiBhbmQgLSB0byBtYXRjaCB4aHAgdGFncyBsaWtlIDx1aTpidXR0b24tZ3JvdXA+LlxuY29uc3QgeGhwQ2hhclJlZ2V4ID0gL1tcXHc6LV0vO1xuY29uc3QgWEhQX0xJTkVfVEVYVF9SRUdFWCA9IC88KFthLXpdW2EtejAtOV8uOi1dKilbXj5dKlxcLz8+L2dpO1xuXG5jb25zdCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TID0gMTAwMDA7XG5jb25zdCBERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5UID0gJ2RlcGVuZGVuY2llcy1sb2FkZWQnO1xuY29uc3QgTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSA9IDEwMDAwO1xuXG4vKipcbiAqIFRoZSBIYWNrTGFuZ3VhZ2UgaXMgdGhlIGNvbnRyb2xsZXIgdGhhdCBzZXJ2ZXJzIGxhbmd1YWdlIHJlcXVlc3RzIGJ5IHRyeWluZyB0byBnZXQgd29ya2VyIHJlc3VsdHNcbiAqIGFuZC9vciByZXN1bHRzIGZyb20gSGFja1NlcnZpY2UgKHdoaWNoIHdvdWxkIGJlIGV4ZWN1dGluZyBoaF9jbGllbnQgb24gYSBzdXBwb3J0aW5nIHNlcnZlcilcbiAqIGFuZCBjb21iaW5pbmcgYW5kL29yIHNlbGVjdGluZyB0aGUgcmVzdWx0cyB0byBnaXZlIGJhY2sgdG8gdGhlIHJlcXVlc3Rlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIYWNrTGFuZ3VhZ2Uge1xuXG4gIF9oaEF2YWlsYWJsZTogYm9vbGVhbjtcbiAgX2hhY2tXb3JrZXI6IEhhY2tXb3JrZXI7XG4gIF9wYXRoQ29udGVudHNNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz47XG4gIF9iYXNlUGF0aDogP3N0cmluZztcbiAgX2luaXRpYWxGaWxlVXJpOiBOdWNsaWRlVXJpO1xuICBfaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXM6IGJvb2xlYW47XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWw6IG51bWJlcjtcblxuICAvKipcbiAgICogYGJhc2VQYXRoYCBzaG91bGQgYmUgdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmhoY29uZmlnIGZpbGUgaXMgbG9jYXRlZC5cbiAgICogSXQgc2hvdWxkIG9ubHkgYmUgbnVsbCBpZiBjbGllbnQgaXMgbnVsbC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGhoQXZhaWxhYmxlOiBib29sZWFuLCBiYXNlUGF0aDogP3N0cmluZywgaW5pdGlhbEZpbGVVcmk6IE51Y2xpZGVVcmkpIHtcbiAgICB0aGlzLl9oaEF2YWlsYWJsZSA9IGhoQXZhaWxhYmxlO1xuICAgIHRoaXMuX2hhY2tXb3JrZXIgPSBuZXcgSGFja1dvcmtlcigpO1xuICAgIHRoaXMuX3BhdGhDb250ZW50c01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9iYXNlUGF0aCA9IGJhc2VQYXRoO1xuICAgIHRoaXMuX2luaXRpYWxGaWxlVXJpID0gaW5pdGlhbEZpbGVVcmk7XG4gICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gICAgaWYgKHRoaXMuX2hoQXZhaWxhYmxlKSB7XG4gICAgICB0aGlzLl9zZXR1cFVwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldHVwVXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwoKSB7XG4gICAgLy8gRmV0Y2ggYW55IGRlcGVuZGVuY2llcyB0aGUgSGFja1dvcmtlciBuZWVkcyBhZnRlciBsZWFybmluZyBhYm91dCB0aGlzIGZpbGUuXG4gICAgLy8gV2UgZG9uJ3QgYmxvY2sgYW55IHJlYWx0aW1lIGxvZ2ljIG9uIHRoZSBkZXBlbmRlbmN5IGZldGNoaW5nIC0gaXQgY291bGQgdGFrZSBhIHdoaWxlLlxuICAgIGxldCBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gZmFsc2U7XG5cbiAgICBjb25zdCBmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMgPSAoKSA9PiB7XG4gICAgICBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgfTtcblxuICAgIHRoaXMuX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcyA9IHRydWU7XG4gICAgICB0aGlzLnVwZGF0ZURlcGVuZGVuY2llcygpLnRoZW4oZmluaXNoVXBkYXRlRGVwZW5kZW5jaWVzLCBmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMpO1xuICAgIH0sIFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9oYWNrV29ya2VyLmRpc3Bvc2UoKTtcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbXBsZXRpb25zKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgb2Zmc2V0OiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBvZmZzZXQgb2YgdGhlIGN1cnNvciBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUuXG4gICAgLy8gVGhlbiBpbnNlcnQgQVVUTzMzMiBpbiBhdCB0aGlzIG9mZnNldC4gKEhhY2sgdXNlcyB0aGlzIGFzIGEgbWFya2VyLilcbiAgICBjb25zdCBtYXJrZWRDb250ZW50cyA9IGNvbnRlbnRzLnN1YnN0cmluZygwLCBvZmZzZXQpICtcbiAgICAgICAgJ0FVVE8zMzInICsgY29udGVudHMuc3Vic3RyaW5nKG9mZnNldCwgY29udGVudHMubGVuZ3RoKTtcbiAgICBjb25zdCBsb2NhbFBhdGggPSBnZXRQYXRoKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9hdXRvX2NvbXBsZXRlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IGNvbXBsZXRpb25UeXBlID0gZ2V0Q29tcGxldGlvblR5cGUocmVzcG9uc2UuY29tcGxldGlvbl90eXBlKTtcbiAgICBsZXQge2NvbXBsZXRpb25zfSA9IHJlc3BvbnNlO1xuICAgIGlmIChzaG91bGREb1NlcnZlckNvbXBsZXRpb24oY29tcGxldGlvblR5cGUpIHx8ICFjb21wbGV0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHtnZXRDb21wbGV0aW9uc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgICBjb25zdCBjb21wbGV0aW9uc1Jlc3VsdCA9IGF3YWl0IGdldENvbXBsZXRpb25zKGZpbGVQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgICBpZiAoY29tcGxldGlvbnNSZXN1bHQpIHtcbiAgICAgICAgY29tcGxldGlvbnMgPSAoKGNvbXBsZXRpb25zUmVzdWx0OiBhbnkpOiBIYWNrQ29tcGxldGlvbnNSZXN1bHQpLmNvbXBsZXRpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAuc2V0KHBhdGgsIGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYWRkX2ZpbGUnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY2llcygpOiBQcm9taXNlIHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9kZXBzJywgYXJnczogW119O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UuZGVwcy5sZW5ndGgpIHtcbiAgICAgIGlmICghdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQpO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgY29uc3Qge2dldERlcGVuZGVuY2llc30gPSBnZXRIYWNrU2VydmljZSh0aGlzLl9pbml0aWFsRmlsZVVyaSk7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzUmVzdWx0ID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKFxuICAgICAgdGhpcy5faW5pdGlhbEZpbGVVcmksIHJlc3BvbnNlLmRlcHNcbiAgICApO1xuICAgIGlmICghZGVwZW5kZW5jaWVzUmVzdWx0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtkZXBlbmRlbmNpZXN9ID0gZGVwZW5kZW5jaWVzUmVzdWx0O1xuICAgIC8vIFNlcmlhbGx5IHVwZGF0ZSBkZXBlZG5lY2llcyBub3QgdG8gYmxvY2sgdGhlIHdvcmtlciBmcm9tIHNlcnZpbmcgb3RoZXIgZmVhdHVyZSByZXF1ZXN0cy5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGNvbnRlbnRzXSBvZiBkZXBlbmRlbmNpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlRGVwZW5kZW5jeShmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY3kocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2FkZF9kZXAnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlLCB7aXNEZXBlbmRlbmN5OiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHdheSB0byBlc3RpbWF0ZSBpZiBhbGwgSGFjayBkZXBlbmRlbmNpZXMgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgICogVGhpcyBmbGFnIGlzIHR1cm5lZCBvZmYgd2hlbiBhIGZpbGUgZ2V0cyB1cGRhdGVkIG9yIGFkZGVkLCBhbmQgZ2V0cyB0dXJuZWQgYmFjayBvblxuICAgKiBvbmNlIGB1cGRhdGVEZXBlbmRlbmNpZXMoKWAgcmV0dXJucyBubyBhZGRpdGlvbmFsIGRlcGVuZGVuY2llcy5cbiAgICpcbiAgICogVGhlIGZsYWcgb25seSB1cGRhdGVzIGV2ZXJ5IFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMsIHNvIGl0J3Mgbm90IHBlcmZlY3QgLVxuICAgKiBob3dldmVyLCBpdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggZm9yIGxvYWRpbmcgaW5kaWNhdG9ycyAvIHdhcm5pbmdzLlxuICAgKi9cbiAgaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgb25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoY2FsbGJhY2s6ICgoKSA9PiBtaXhlZCkpOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9lbWl0dGVyLm9uKERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG4gIGFzeW5jIGZvcm1hdFNvdXJjZShcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIHN0YXJ0UG9zaXRpb246IG51bWJlcixcbiAgICBlbmRQb3NpdGlvbjogbnVtYmVyLFxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZm9ybWF0JywgYXJnczogW2NvbnRlbnRzLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbl19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZSA9IHJlc3BvbnNlLmVycm9yX21lc3NhZ2U7XG4gICAgaWYgKGVycm9yTWVzc2FnZSkge1xuICAgICAgaWYgKGVycm9yTWVzc2FnZSA9PT0gJ1BocF9vcl9kZWNsJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NvcnJ5LCBQSFAgYW5kIDw/aGggLy9kZWNsIGFyZSBub3Qgc3VwcG9ydGVkJyk7XG4gICAgICB9IGVsc2UgaWYgKGVycm9yTWVzc2FnZSA9PT0gJ1BhcnNpbmdfZXJyb3InKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignUGFyc2luZyBFcnJvciEgRml4IHlvdXIgZmlsZSBzbyB0aGUgc3ludGF4IGlzIHZhbGlkIGFuZCByZXRyeScpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQgZm9ybWF0aW5nIGhhY2sgY29kZScgKyBlcnJvck1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gcmVzcG9uc2UucmVzdWx0O1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGhpZ2hsaWdodFNvdXJjZShcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sOiBudW1iZXIsXG4gICk6IFByb21pc2U8QXJyYXk8YXRvbSRSYW5nZT4+IHtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUocGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZmluZF9sdmFyX3JlZnMnLCBhcmdzOiBbcGF0aCwgbGluZSwgY29sXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgcmV0dXJuIHJlc3BvbnNlLnBvc2l0aW9ucy5tYXAoXG4gICAgICBwb3NpdGlvbiA9PiBuZXcgUmFuZ2UoXG4gICAgICAgIFtwb3NpdGlvbi5saW5lIC0gMSwgcG9zaXRpb24uY2hhcl9zdGFydCAtIDFdLFxuICAgICAgICBbcG9zaXRpb24ubGluZSAtIDEsIHBvc2l0aW9uLmNoYXJfZW5kXSxcbiAgICAgIClcbiAgICApO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGlhZ25vc3RpY3MoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKHBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2NoZWNrX2ZpbGUnLCBhcmdzOiBbcGF0aF19O1xuICAgIGNvbnN0IHtlcnJvcnN9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIHJldHVybiBlcnJvcnM7XG4gIH1cblxuICBhc3luYyBnZXRTZXJ2ZXJEaWFnbm9zdGljcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgKTogUHJvbWlzZTxBcnJheTx7bWVzc2FnZTogSGFja0RpYWdub3N0aWM7fT4+IHtcbiAgICBjb25zdCB7Z2V0RGlhZ25vc3RpY3N9ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGxldCBkaWFnbm9zdGljUmVzdWx0ID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgZGlhZ25vc3RpY1Jlc3VsdCA9IGF3YWl0IGdldERpYWdub3N0aWNzKGZpbGVQYXRoLCAnJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIWRpYWdub3N0aWNSZXN1bHQpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKCdoaF9jbGllbnQgY291bGQgbm90IGJlIHJlYWNoZWQnKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgaGFja0RpYWdub3N0aWNzID0gKChkaWFnbm9zdGljUmVzdWx0OiBhbnkpOiBIYWNrRGlhZ25vc3RpY3NSZXN1bHQpO1xuICAgIHJldHVybiBoYWNrRGlhZ25vc3RpY3MubWVzc2FnZXM7XG4gIH1cblxuICBhc3luYyBnZXREZWZpbml0aW9uKFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgICBjb250ZW50czogc3RyaW5nLFxuICAgICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgICAgY29sdW1uOiBudW1iZXIsXG4gICAgICBsaW5lVGV4dDogc3RyaW5nXG4gICAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCB0byBwYXJzZSwgaW5kZW50aXkgdGhlIHBvc2l0aW9uLFxuICAgIC8vIGFuZCBsb29rdXAgdGhhdCBpZGVudGlmaWVyIGZvciBhIGxvY2F0aW9uIG1hdGNoLlxuICAgIGNvbnN0IGlkZW50aWZpZXJSZXN1bHQgPSBhd2FpdCB0aGlzLl9nZXREZWZpbml0aW9uRnJvbUlkZW50aWZpZXIoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbnRlbnRzLFxuICAgICAgbGluZU51bWJlcixcbiAgICAgIGNvbHVtbixcbiAgICAgIGxpbmVUZXh0LFxuICAgICk7XG4gICAgaWYgKGlkZW50aWZpZXJSZXN1bHQubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gaWRlbnRpZmllclJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgaGV1cmlzdGljUmVzdWx0cyA9XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgZm9yIGEgc3ltYm9sIG5hbWUgc2VhcmNoIGxvY2F0aW9uLlxuICAgICAgICB0aGlzLl9nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUoZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHNlYXJjaCBvZiB0aGUgc3RyaW5nIHBhcnNlZC5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TdHJpbmdQYXJzZShmaWxlUGF0aCwgbGluZVRleHQsIGNvbHVtbiksXG4gICAgICAgIC8vIEFzayBIYWNrIGNsaWVudCBzaWRlIGZvciBhIHJlc3VsdCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkxvY2F0aW9uQXRQb3NpdGlvbihmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbiksXG4gICAgICBdKTtcbiAgICAvLyBXZSBub3cgaGF2ZSByZXN1bHRzIGZyb20gYWxsIDQgc291cmNlcy5cbiAgICAvLyBDaG9vc2UgdGhlIGJlc3QgcmVzdWx0cyB0byBzaG93IHRvIHRoZSB1c2VyLlxuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHRzID0gW2lkZW50aWZpZXJSZXN1bHRdLmNvbmNhdChoZXVyaXN0aWNSZXN1bHRzKTtcbiAgICByZXR1cm4gYXJyYXkuZmluZChkZWZpbml0aW9uUmVzdWx0cywgZGVmaW5pdGlvblJlc3VsdCA9PiBkZWZpbml0aW9uUmVzdWx0Lmxlbmd0aCA9PT0gMSlcbiAgICAgIHx8IGFycmF5LmZpbmQoZGVmaW5pdGlvblJlc3VsdHMsIGRlZmluaXRpb25SZXN1bHQgPT4gZGVmaW5pdGlvblJlc3VsdC5sZW5ndGggPiAxKVxuICAgICAgfHwgW107XG4gIH1cblxuICBhc3luYyBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbihcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcblxuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9nZXRfbWV0aG9kX25hbWUnLCBhcmdzOiBbcGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgaWYgKCFyZXNwb25zZS5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc3ltYm9sVHlwZSA9IGdldFN5bWJvbFR5cGUocmVzcG9uc2UucmVzdWx0X3R5cGUpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcmVzcG9uc2UucG9zO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiByZXNwb25zZS5uYW1lLFxuICAgICAgdHlwZTogc3ltYm9sVHlwZSxcbiAgICAgIGxpbmU6IHBvc2l0aW9uLmxpbmUgLSAxLFxuICAgICAgY29sdW1uOiBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMSxcbiAgICAgIGxlbmd0aDogcG9zaXRpb24uY2hhcl9lbmQgLSBwb3NpdGlvbi5jaGFyX3N0YXJ0ICsgMSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgdGhpbiB3cmFwcGVyIGFyb3VuZCBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbiB0aGF0IHdhaXRzIGZvciBkZXBlbmRlbmNpZXMgYmVmb3JlIHJlcG9ydGluZ1xuICAgKiB0aGF0IG5vIHN5bWJvbCBuYW1lIGNhbiBiZSByZXNvbHZlZC5cbiAgICovXG4gIGFzeW5jIGdldFN5bWJvbE5hbWVBdFBvc2l0aW9uV2l0aERlcGVuZGVuY2llcyhcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgdGltZW91dDogP251bWJlcixcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5fd2FpdEZvckRlcGVuZGVuY2llcyhcbiAgICAgICgpID0+IHRoaXMuZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24ocGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbiksXG4gICAgICB4ID0+IHggIT0gbnVsbCxcbiAgICAgIHRpbWVvdXQsXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgaWYgKGNvbnRlbnRzLmxlbmd0aCA+IE1BWF9IQUNLX1dPUktFUl9URVhUX1NJWkUpIHtcbiAgICAgIC8vIEF2b2lkIFBvb3IgV29ya2VyIFBlcmZvcm1hbmNlIGZvciBsYXJnZSBmaWxlcy5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbGV0IHN5bWJvbCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHN5bWJvbCA9IGF3YWl0IHRoaXMuZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24oZ2V0UGF0aChmaWxlUGF0aCksIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gSWdub3JlIHRoZSBlcnJvci5cbiAgICAgIGdldExvZ2dlcigpLndhcm4oJ19nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFzeW1ib2wgfHwgIXN5bWJvbC5uYW1lKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHtnZXREZWZpbml0aW9ufSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgZ2V0RGVmaW5pdGlvbihmaWxlUGF0aCwgc3ltYm9sLm5hbWUsIHN5bWJvbC50eXBlKTtcbiAgICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuICgoZGVmaW5pdGlvblJlc3VsdDogYW55KTogSGFja0RlZmluaXRpb25SZXN1bHQpLmRlZmluaXRpb25zO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgICBjb2x1bW46IG51bWJlcixcbiAgICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBpZiAoIWZpbGVQYXRoIHx8IGNvbnRlbnRzLmxlbmd0aCA+IE1BWF9IQUNLX1dPUktFUl9URVhUX1NJWkUpIHtcbiAgICAgIC8vIEF2b2lkIFBvb3IgV29ya2VyIFBlcmZvcm1hbmNlIGZvciBsYXJnZSBmaWxlcy5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwb3J0LCBwYXRoOiBsb2NhbFBhdGh9ID0gcGFyc2UoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShsb2NhbFBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2luZmVyX3BvcycsIGFyZ3M6IFtsb2NhbFBhdGgsIGxpbmVOdW1iZXIsIGNvbHVtbl19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcmVzcG9uc2UucG9zIHx8IHt9O1xuICAgIGlmICghcG9zaXRpb24uZmlsZW5hbWUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIFt7XG4gICAgICBwYXRoOiAoaG9zdG5hbWUgJiYgcG9ydClcbiAgICAgICAgPyBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgcG9zaXRpb24uZmlsZW5hbWUpXG4gICAgICAgIDogcG9zaXRpb24uZmlsZW5hbWUsXG4gICAgICBsaW5lOiBwb3NpdGlvbi5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogcG9zaXRpb24uY2hhcl9zdGFydCAtIDEsXG4gICAgICBsZW5ndGg6IHBvc2l0aW9uLmNoYXJfZW5kIC0gcG9zaXRpb24uY2hhcl9zdGFydCArIDEsXG4gICAgICBuYW1lOiBwb3NpdGlvbi5uYW1lLFxuICAgICAgc2NvcGU6IHBvc2l0aW9uLnNjb3BlLFxuICAgICAgYWRkaXRpb25hbEluZm86IHBvc2l0aW9uLmFkZGl0aW9uYWxJbmZvLFxuICAgIH1dO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tSWRlbnRpZmllcihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3Qge2dldElkZW50aWZpZXJEZWZpbml0aW9ufSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgZ2V0SWRlbnRpZmllckRlZmluaXRpb24oXG4gICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtblxuICAgICk7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHtkZWZpbml0aW9uc30gPSAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KTtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4ge1xuICAgICAgbGV0IHtuYW1lfSA9IGRlZmluaXRpb247XG4gICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCc6JykpIHtcbiAgICAgICAgLy8gWEhQIGNsYXNzIG5hbWUsIHVzYWdlcyBvbWl0IHRoZSBsZWFkaW5nICc6Jy5cbiAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuICAgICAgY29uc3QgZGVmaW5pdGlvbkluZGV4ID0gbGluZVRleHQuaW5kZXhPZihuYW1lKTtcbiAgICAgIGlmIChcbiAgICAgICAgZGVmaW5pdGlvbkluZGV4ID09PSAtMSB8fFxuICAgICAgICBkZWZpbml0aW9uSW5kZXggPj0gY29sdW1uIHx8XG4gICAgICAgICF4aHBDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5zdWJzdHJpbmcoZGVmaW5pdGlvbkluZGV4LCBjb2x1bW4pKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgICAgIHNlYXJjaFN0YXJ0Q29sdW1uOiBkZWZpbml0aW9uSW5kZXgsXG4gICAgICAgICAgc2VhcmNoRW5kQ29sdW1uOiBkZWZpbml0aW9uSW5kZXggKyBkZWZpbml0aW9uLm5hbWUubGVuZ3RoLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgbGluZVRleHQ6IHN0cmluZyxcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBjb25zdCB7c2VhcmNoLCBzdGFydCwgZW5kfSA9IHRoaXMuX3BhcnNlU3RyaW5nRm9yRXhwcmVzc2lvbihsaW5lVGV4dCwgY29sdW1uKTtcbiAgICBpZiAoIXNlYXJjaCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7Z2V0RGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldERlZmluaXRpb24oZmlsZVBhdGgsIHNlYXJjaCwgU3ltYm9sVHlwZS5VTktOT1dOKTtcbiAgICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KS5kZWZpbml0aW9ucztcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4gKHtcbiAgICAgIC4uLmRlZmluaXRpb24sXG4gICAgICBzZWFyY2hTdGFydENvbHVtbjogc3RhcnQsXG4gICAgICBzZWFyY2hFbmRDb2x1bW46IGVuZCxcbiAgICB9KSk7XG4gIH1cblxuICBfcGFyc2VTdHJpbmdGb3JFeHByZXNzaW9uKFxuICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IHtzZWFyY2g6IHN0cmluZzsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXJ9IHtcbiAgICBsZXQgc2VhcmNoID0gbnVsbDtcbiAgICBsZXQgc3RhcnQgPSBjb2x1bW47XG5cbiAgICBsZXQgaXNYSFAgPSBmYWxzZTtcbiAgICBsZXQgeGhwTWF0Y2g7XG4gICAgd2hpbGUgICh4aHBNYXRjaCA9IFhIUF9MSU5FX1RFWFRfUkVHRVguZXhlYyhsaW5lVGV4dCkpIHtcbiAgICAgIGNvbnN0IHhocE1hdGNoSW5kZXggPSB4aHBNYXRjaC5pbmRleCArIDE7XG4gICAgICBpZiAoY29sdW1uID49IHhocE1hdGNoSW5kZXggJiYgY29sdW1uIDwgKHhocE1hdGNoSW5kZXggKyB4aHBNYXRjaFsxXS5sZW5ndGgpKSB7XG4gICAgICAgIGlzWEhQID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3ludGF4Q2hhclJlZ2V4ID0gaXNYSFAgPyB4aHBDaGFyUmVnZXggOiB3b3JkQ2hhclJlZ2V4O1xuICAgIC8vIFNjYW4gZm9yIHRoZSB3b3JkIHN0YXJ0IGZvciB0aGUgaGFjayB2YXJpYWJsZSwgZnVuY3Rpb24gb3IgeGhwIHRhZ1xuICAgIC8vIHdlIGFyZSB0cnlpbmcgdG8gZ2V0IHRoZSBkZWZpbml0aW9uIGZvci5cbiAgICB3aGlsZSAoc3RhcnQgPj0gMCAmJiBzeW50YXhDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5jaGFyQXQoc3RhcnQpKSkge1xuICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgaWYgKGxpbmVUZXh0W3N0YXJ0XSA9PT0gJyQnKSB7XG4gICAgICBzdGFydC0tO1xuICAgIH1cbiAgICBzdGFydCsrO1xuICAgIGxldCBlbmQgPSBjb2x1bW47XG4gICAgd2hpbGUgKHN5bnRheENoYXJSZWdleC50ZXN0KGxpbmVUZXh0LmNoYXJBdChlbmQpKSkge1xuICAgICAgZW5kKys7XG4gICAgfVxuICAgIHNlYXJjaCA9IGxpbmVUZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAvLyBYSFAgVUkgZWxlbWVudHMgc3RhcnQgd2l0aCA6IGJ1dCB0aGUgdXNhZ2VzIGRvZXNuJ3QgaGF2ZSB0aGF0IGNvbG9uLlxuICAgIGlmIChpc1hIUCAmJiAhc2VhcmNoLnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgc2VhcmNoID0gJzonICsgc2VhcmNoO1xuICAgIH1cbiAgICByZXR1cm4ge3NlYXJjaCwgc3RhcnQsIGVuZH07XG4gIH1cblxuICBhc3luYyBnZXRUeXBlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGlmICghZXhwcmVzc2lvbi5zdGFydHNXaXRoKCckJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUocGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfaW5mZXJfdHlwZScsIGFyZ3M6IFtwYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCB7dHlwZX0gPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICBhc3luYyBnZXRSZWZlcmVuY2VzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3ltYm9sOiBIYWNrU3ltYm9sTmFtZVJlc3VsdCxcbiAgKTogUHJvbWlzZTw/SGFja1JlZmVyZW5jZXNSZXN1bHQ+IHtcbiAgICBjb25zdCB7Z2V0UmVmZXJlbmNlc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9IGF3YWl0IGdldFJlZmVyZW5jZXMoZmlsZVBhdGgsIHN5bWJvbC5uYW1lLCBzeW1ib2wudHlwZSk7XG4gICAgcmV0dXJuICgocmVmZXJlbmNlc1Jlc3VsdDogYW55KTogSGFja1JlZmVyZW5jZXNSZXN1bHQpO1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgaXNIYWNrQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaEF2YWlsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250aW51YWxseSByZXRyaWVzIHRoZSBmdW5jdGlvbiBwcm92aWRlZCB1bnRpbCBlaXRoZXI6XG4gICAqIDEpIHRoZSByZXR1cm4gdmFsdWUgaXMgXCJhY2NlcHRhYmxlXCIgKGlmIHByb3ZpZGVkKVxuICAgKiAyKSBkZXBlbmRlbmNpZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLCBvclxuICAgKiAzKSB0aGUgc3BlY2lmaWVkIHRpbWVvdXQgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICovXG4gIGFzeW5jIF93YWl0Rm9yRGVwZW5kZW5jaWVzPFQ+KFxuICAgIGZ1bmM6ICgoKSA9PiBQcm9taXNlPFQ+KSxcbiAgICBhY2NlcHRhYmxlOiA/KCh2YWx1ZTogVCkgPT4gYm9vbGVhbiksXG4gICAgdGltZW91dE1zOiA/bnVtYmVyLFxuICApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHdoaWxlICghdGltZW91dE1zIHx8IERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0TXMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZ1bmMoKTtcbiAgICAgIGlmICgoYWNjZXB0YWJsZSAmJiBhY2NlcHRhYmxlKHJlc3VsdCkpIHx8IHRoaXMuaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgLy8gV2FpdCBmb3IgZGVwZW5kZW5jaWVzIHRvIGZpbmlzaCBsb2FkaW5nIC0gdG8gYXZvaWQgcG9sbGluZywgd2UnbGwgd2FpdCBmb3IgdGhlIGNhbGxiYWNrLlxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMub25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKCkgPT4ge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RpbWVkIG91dCB3YWl0aW5nIGZvciBIYWNrIGRlcGVuZGVuY2llcycpO1xuICB9XG5cbn07XG5cbmNvbnN0IHN0cmluZ1RvQ29tcGxldGlvblR5cGUgPSB7XG4gICdpZCc6IENvbXBsZXRpb25UeXBlLklELFxuICAnbmV3JzogQ29tcGxldGlvblR5cGUuTkVXLFxuICAndHlwZSc6IENvbXBsZXRpb25UeXBlLlRZUEUsXG4gICdjbGFzc19nZXQnOiBDb21wbGV0aW9uVHlwZS5DTEFTU19HRVQsXG4gICd2YXInOiBDb21wbGV0aW9uVHlwZS5WQVIsXG59O1xuXG5mdW5jdGlvbiBnZXRDb21wbGV0aW9uVHlwZShpbnB1dDogc3RyaW5nKSB7XG4gIGxldCBjb21wbGV0aW9uVHlwZSA9IHN0cmluZ1RvQ29tcGxldGlvblR5cGVbaW5wdXRdO1xuICBpZiAodHlwZW9mIGNvbXBsZXRpb25UeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbXBsZXRpb25UeXBlID0gQ29tcGxldGlvblR5cGUuTk9ORTtcbiAgfVxuICByZXR1cm4gY29tcGxldGlvblR5cGU7XG59XG5cbmNvbnN0IHN0cmluZ1RvU3ltYm9sVHlwZSA9IHtcbiAgJ2NsYXNzJzogU3ltYm9sVHlwZS5DTEFTUyxcbiAgJ2Z1bmN0aW9uJzogU3ltYm9sVHlwZS5GVU5DVElPTixcbiAgJ21ldGhvZCc6IFN5bWJvbFR5cGUuTUVUSE9ELFxuICAnbG9jYWwnOiBTeW1ib2xUeXBlLkxPQ0FMLFxufTtcblxuZnVuY3Rpb24gZ2V0U3ltYm9sVHlwZShpbnB1dDogc3RyaW5nKSB7XG4gIGxldCBzeW1ib2xUeXBlID0gc3RyaW5nVG9TeW1ib2xUeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBzeW1ib2xUeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIHN5bWJvbFR5cGUgPSBTeW1ib2xUeXBlLk1FVEhPRDtcbiAgfVxuICByZXR1cm4gc3ltYm9sVHlwZTtcbn1cblxuY29uc3Qgc2VydmVyQ29tcGxldGlvblR5cGVzID0gbmV3IFNldChbXG4gIENvbXBsZXRpb25UeXBlLklELFxuICBDb21wbGV0aW9uVHlwZS5ORVcsXG4gIENvbXBsZXRpb25UeXBlLlRZUEUsXG5dKTtcblxuZnVuY3Rpb24gc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKHR5cGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gc2VydmVyQ29tcGxldGlvblR5cGVzLmhhcyh0eXBlKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zUmVzcG9uc2U6IEFycmF5PEhhY2tDb21wbGV0aW9uPik6IEFycmF5PGFueT4ge1xuICByZXR1cm4gY29tcGxldGlvbnNSZXNwb25zZS5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgbGV0IHtuYW1lLCB0eXBlLCBmdW5jX2RldGFpbHM6IGZ1bmN0aW9uRGV0YWlsc30gPSBjb21wbGV0aW9uO1xuICAgIGlmICh0eXBlICYmIHR5cGUuaW5kZXhPZignKCcpID09PSAwICYmIHR5cGUubGFzdEluZGV4T2YoJyknKSA9PT0gdHlwZS5sZW5ndGggLSAxKSB7XG4gICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoMSwgdHlwZS5sZW5ndGggLSAxKTtcbiAgICB9XG4gICAgbGV0IG1hdGNoU25pcHBldCA9IG5hbWU7XG4gICAgaWYgKGZ1bmN0aW9uRGV0YWlscykge1xuICAgICAgY29uc3Qge3BhcmFtc30gPSBmdW5jdGlvbkRldGFpbHM7XG4gICAgICAvLyBDb25zdHJ1Y3QgdGhlIHNuaXBwZXQ6IGUuZy4gbXlGdW5jdGlvbigkezE6JGFyZzF9LCAkezI6JGFyZzJ9KTtcbiAgICAgIGNvbnN0IHBhcmFtc1N0cmluZyA9IHBhcmFtcy5tYXAoKHBhcmFtLCBpbmRleCkgPT4gJyR7JyArIChpbmRleCArIDEpICsgJzonICsgcGFyYW0ubmFtZSArICd9Jykuam9pbignLCAnKTtcbiAgICAgIG1hdGNoU25pcHBldCA9IG5hbWUgKyAnKCcgKyBwYXJhbXNTdHJpbmcgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBtYXRjaFNuaXBwZXQsXG4gICAgICBtYXRjaFRleHQ6IG5hbWUsXG4gICAgICBtYXRjaFR5cGU6IHR5cGUsXG4gICAgfTtcbiAgfSk7XG59XG4iXX0=