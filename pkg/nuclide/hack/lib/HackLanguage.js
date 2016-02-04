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
      var _parse = (0, _remoteUri.parse)(path);

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
              message.path = (0, _remoteUri.createRemoteUri)(hostname, parseInt(port, 10), message.path);
            }
          });
        });
      }
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

      var _parse2 = (0, _remoteUri.parse)(filePath);

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
//# sourceMappingURL=data:application/json;base64,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QUksS0FBSyxHQUFHLENBQUMsQ0FBQSxBQUFDLEdBQUcsR0FBRyxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRztPQUFBLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDNUUsa0JBQVksR0FBRyxJQUFJLEdBQUcsR0FBRyxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUM7S0FDaEQ7QUFDRCxXQUFPO0FBQ0wsa0JBQVksRUFBWixZQUFZO0FBQ1osZUFBUyxFQUFFLElBQUk7QUFDZixlQUFTLEVBQUUsSUFBSTtLQUNoQixDQUFDO0dBQ0gsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiSGFja0xhbmd1YWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBIYWNrQ29tcGxldGlvbnNSZXN1bHQsXG4gIEhhY2tDb21wbGV0aW9uLFxuICBIYWNrRGlhZ25vc3RpY3NSZXN1bHQsXG4gIEhhY2tEaWFnbm9zdGljLFxuICBIYWNrRGVmaW5pdGlvblJlc3VsdCxcbiAgSGFja1NlYXJjaFBvc2l0aW9uLFxuICBIYWNrUmVmZXJlbmNlc1Jlc3VsdCxcbn0gZnJvbSAnLi4vLi4vaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5cbmltcG9ydCB0eXBlIHtIYWNrU3ltYm9sTmFtZVJlc3VsdH0gZnJvbSAnLi4vLi4vaGFjay1iYXNlL2xpYi90eXBlcyc7XG5cbmltcG9ydCB7cGFyc2UsIGNyZWF0ZVJlbW90ZVVyaSwgZ2V0UGF0aH0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQge2dldEhhY2tTZXJ2aWNlfSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9sb2dnaW5nJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHtSYW5nZSwgRW1pdHRlcn0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgSGFja1dvcmtlciBmcm9tICcuL0hhY2tXb3JrZXInO1xuaW1wb3J0IHtDb21wbGV0aW9uVHlwZSwgU3ltYm9sVHlwZX0gZnJvbSAnLi4vLi4vaGFjay1jb21tb24nO1xuXG4vLyBUaGUgd29yZCBjaGFyIHJlZ2V4IGluY2x1ZGUgXFwgdG8gc2VhcmNoIGZvciBuYW1lc3BhY2VkIGNsYXNzZXMuXG5jb25zdCB3b3JkQ2hhclJlZ2V4ID0gL1tcXHdcXFxcXS87XG4vLyBUaGUgeGhwIGNoYXIgcmVnZXggaW5jbHVkZSA6IGFuZCAtIHRvIG1hdGNoIHhocCB0YWdzIGxpa2UgPHVpOmJ1dHRvbi1ncm91cD4uXG5jb25zdCB4aHBDaGFyUmVnZXggPSAvW1xcdzotXS87XG5jb25zdCBYSFBfTElORV9URVhUX1JFR0VYID0gLzwoW2Etel1bYS16MC05Xy46LV0qKVtePl0qXFwvPz4vZ2k7XG5cbmNvbnN0IFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMgPSAxMDAwMDtcbmNvbnN0IERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQgPSAnZGVwZW5kZW5jaWVzLWxvYWRlZCc7XG5jb25zdCBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFID0gMTAwMDA7XG5cbi8qKlxuICogVGhlIEhhY2tMYW5ndWFnZSBpcyB0aGUgY29udHJvbGxlciB0aGF0IHNlcnZlcnMgbGFuZ3VhZ2UgcmVxdWVzdHMgYnkgdHJ5aW5nIHRvIGdldCB3b3JrZXIgcmVzdWx0c1xuICogYW5kL29yIHJlc3VsdHMgZnJvbSBIYWNrU2VydmljZSAod2hpY2ggd291bGQgYmUgZXhlY3V0aW5nIGhoX2NsaWVudCBvbiBhIHN1cHBvcnRpbmcgc2VydmVyKVxuICogYW5kIGNvbWJpbmluZyBhbmQvb3Igc2VsZWN0aW5nIHRoZSByZXN1bHRzIHRvIGdpdmUgYmFjayB0byB0aGUgcmVxdWVzdGVyLlxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIEhhY2tMYW5ndWFnZSB7XG5cbiAgX2hoQXZhaWxhYmxlOiBib29sZWFuO1xuICBfaGFja1dvcmtlcjogSGFja1dvcmtlcjtcbiAgX3BhdGhDb250ZW50c01hcDogTWFwPHN0cmluZywgc3RyaW5nPjtcbiAgX2Jhc2VQYXRoOiA/c3RyaW5nO1xuICBfaW5pdGlhbEZpbGVVcmk6IE51Y2xpZGVVcmk7XG4gIF9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llczogYm9vbGVhbjtcbiAgX2VtaXR0ZXI6IEVtaXR0ZXI7XG4gIF91cGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbDogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiBgYmFzZVBhdGhgIHNob3VsZCBiZSB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSAuaGhjb25maWcgZmlsZSBpcyBsb2NhdGVkLlxuICAgKiBJdCBzaG91bGQgb25seSBiZSBudWxsIGlmIGNsaWVudCBpcyBudWxsLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaGhBdmFpbGFibGU6IGJvb2xlYW4sIGJhc2VQYXRoOiA/c3RyaW5nLCBpbml0aWFsRmlsZVVyaTogTnVjbGlkZVVyaSkge1xuICAgIHRoaXMuX2hoQXZhaWxhYmxlID0gaGhBdmFpbGFibGU7XG4gICAgdGhpcy5faGFja1dvcmtlciA9IG5ldyBIYWNrV29ya2VyKCk7XG4gICAgdGhpcy5fcGF0aENvbnRlbnRzTWFwID0gbmV3IE1hcCgpO1xuICAgIHRoaXMuX2Jhc2VQYXRoID0gYmFzZVBhdGg7XG4gICAgdGhpcy5faW5pdGlhbEZpbGVVcmkgPSBpbml0aWFsRmlsZVVyaTtcbiAgICB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyA9IHRydWU7XG4gICAgdGhpcy5fZW1pdHRlciA9IG5ldyBFbWl0dGVyKCk7XG5cbiAgICBpZiAodGhpcy5faGhBdmFpbGFibGUpIHtcbiAgICAgIHRoaXMuX3NldHVwVXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwoKTtcbiAgICB9XG4gIH1cblxuICBfc2V0dXBVcGRhdGVEZXBlbmRlbmNpZXNJbnRlcnZhbCgpIHtcbiAgICAvLyBGZXRjaCBhbnkgZGVwZW5kZW5jaWVzIHRoZSBIYWNrV29ya2VyIG5lZWRzIGFmdGVyIGxlYXJuaW5nIGFib3V0IHRoaXMgZmlsZS5cbiAgICAvLyBXZSBkb24ndCBibG9jayBhbnkgcmVhbHRpbWUgbG9naWMgb24gdGhlIGRlcGVuZGVuY3kgZmV0Y2hpbmcgLSBpdCBjb3VsZCB0YWtlIGEgd2hpbGUuXG4gICAgbGV0IHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSBmYWxzZTtcblxuICAgIGNvbnN0IGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcyA9ICgpID0+IHtcbiAgICAgIHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMgPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgdGhpcy5fdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBpZiAocGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gdHJ1ZTtcbiAgICAgIHRoaXMudXBkYXRlRGVwZW5kZW5jaWVzKCkudGhlbihmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMsIGZpbmlzaFVwZGF0ZURlcGVuZGVuY2llcyk7XG4gICAgfSwgVVBEQVRFX0RFUEVOREVOQ0lFU19JTlRFUlZBTF9NUyk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX2hhY2tXb3JrZXIuZGlzcG9zZSgpO1xuICAgIGNsZWFySW50ZXJ2YWwodGhpcy5fdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwpO1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29tcGxldGlvbnMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBvZmZzZXQ6IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PGFueT4+IHtcbiAgICAvLyBDYWxjdWxhdGUgdGhlIG9mZnNldCBvZiB0aGUgY3Vyc29yIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgZmlsZS5cbiAgICAvLyBUaGVuIGluc2VydCBBVVRPMzMyIGluIGF0IHRoaXMgb2Zmc2V0LiAoSGFjayB1c2VzIHRoaXMgYXMgYSBtYXJrZXIuKVxuICAgIGNvbnN0IG1hcmtlZENvbnRlbnRzID0gY29udGVudHMuc3Vic3RyaW5nKDAsIG9mZnNldCkgK1xuICAgICAgICAnQVVUTzMzMicgKyBjb250ZW50cy5zdWJzdHJpbmcob2Zmc2V0LCBjb250ZW50cy5sZW5ndGgpO1xuICAgIGNvbnN0IGxvY2FsUGF0aCA9IGdldFBhdGgoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShsb2NhbFBhdGgsIG1hcmtlZENvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2F1dG9fY29tcGxldGUnLCBhcmdzOiBbbG9jYWxQYXRoXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgY29tcGxldGlvblR5cGUgPSBnZXRDb21wbGV0aW9uVHlwZShyZXNwb25zZS5jb21wbGV0aW9uX3R5cGUpO1xuICAgIGxldCB7Y29tcGxldGlvbnN9ID0gcmVzcG9uc2U7XG4gICAgaWYgKHNob3VsZERvU2VydmVyQ29tcGxldGlvbihjb21wbGV0aW9uVHlwZSkgfHwgIWNvbXBsZXRpb25zLmxlbmd0aCkge1xuICAgICAgY29uc3Qge2dldENvbXBsZXRpb25zfSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICAgIGNvbnN0IGNvbXBsZXRpb25zUmVzdWx0ID0gYXdhaXQgZ2V0Q29tcGxldGlvbnMoZmlsZVBhdGgsIG1hcmtlZENvbnRlbnRzKTtcbiAgICAgIGlmIChjb21wbGV0aW9uc1Jlc3VsdCkge1xuICAgICAgICBjb21wbGV0aW9ucyA9ICgoY29tcGxldGlvbnNSZXN1bHQ6IGFueSk6IEhhY2tDb21wbGV0aW9uc1Jlc3VsdCkuY29tcGxldGlvbnM7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwcm9jZXNzQ29tcGxldGlvbnMoY29tcGxldGlvbnMpO1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlRmlsZShwYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBpZiAoY29udGVudHMgIT09IHRoaXMuX3BhdGhDb250ZW50c01hcC5nZXQocGF0aCkpIHtcbiAgICAgIHRoaXMuX3BhdGhDb250ZW50c01hcC5zZXQocGF0aCwgY29udGVudHMpO1xuICAgICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9hZGRfZmlsZScsIGFyZ3M6IFtwYXRoLCBjb250ZW50c119O1xuICAgICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSBmYWxzZTtcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgdXBkYXRlRGVwZW5kZW5jaWVzKCk6IFByb21pc2Uge1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZ2V0X2RlcHMnLCBhcmdzOiBbXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgaWYgKCFyZXNwb25zZS5kZXBzLmxlbmd0aCkge1xuICAgICAgaWYgKCF0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcykge1xuICAgICAgICB0aGlzLl9lbWl0dGVyLmVtaXQoREVQRU5ERU5DSUVTX0xPQURFRF9FVkVOVCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9pc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSBmYWxzZTtcbiAgICBjb25zdCB7Z2V0RGVwZW5kZW5jaWVzfSA9IGdldEhhY2tTZXJ2aWNlKHRoaXMuX2luaXRpYWxGaWxlVXJpKTtcbiAgICBjb25zdCBkZXBlbmRlbmNpZXNSZXN1bHQgPSBhd2FpdCBnZXREZXBlbmRlbmNpZXMoXG4gICAgICB0aGlzLl9pbml0aWFsRmlsZVVyaSwgcmVzcG9uc2UuZGVwc1xuICAgICk7XG4gICAgaWYgKCFkZXBlbmRlbmNpZXNSZXN1bHQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2RlcGVuZGVuY2llc30gPSBkZXBlbmRlbmNpZXNSZXN1bHQ7XG4gICAgLy8gU2VyaWFsbHkgdXBkYXRlIGRlcGVkbmVjaWVzIG5vdCB0byBibG9jayB0aGUgd29ya2VyIGZyb20gc2VydmluZyBvdGhlciBmZWF0dXJlIHJlcXVlc3RzLlxuICAgIC8qIGVzbGludC1kaXNhYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgICBmb3IgKGNvbnN0IFtmaWxlUGF0aCwgY29udGVudHNdIG9mIGRlcGVuZGVuY2llcykge1xuICAgICAgYXdhaXQgdGhpcy51cGRhdGVEZXBlbmRlbmN5KGZpbGVQYXRoLCBjb250ZW50cyk7XG4gICAgfVxuICAgIC8qIGVzbGludC1lbmFibGUgYmFiZWwvbm8tYXdhaXQtaW4tbG9vcCAqL1xuICB9XG5cbiAgYXN5bmMgdXBkYXRlRGVwZW5kZW5jeShwYXRoOiBzdHJpbmcsIGNvbnRlbnRzOiBzdHJpbmcpOiBQcm9taXNlIHtcbiAgICBpZiAoY29udGVudHMgIT09IHRoaXMuX3BhdGhDb250ZW50c01hcC5nZXQocGF0aCkpIHtcbiAgICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYWRkX2RlcCcsIGFyZ3M6IFtwYXRoLCBjb250ZW50c119O1xuICAgICAgYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UsIHtpc0RlcGVuZGVuY3k6IHRydWV9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgd2F5IHRvIGVzdGltYXRlIGlmIGFsbCBIYWNrIGRlcGVuZGVuY2llcyBoYXZlIGJlZW4gbG9hZGVkLlxuICAgKiBUaGlzIGZsYWcgaXMgdHVybmVkIG9mZiB3aGVuIGEgZmlsZSBnZXRzIHVwZGF0ZWQgb3IgYWRkZWQsIGFuZCBnZXRzIHR1cm5lZCBiYWNrIG9uXG4gICAqIG9uY2UgYHVwZGF0ZURlcGVuZGVuY2llcygpYCByZXR1cm5zIG5vIGFkZGl0aW9uYWwgZGVwZW5kZW5jaWVzLlxuICAgKlxuICAgKiBUaGUgZmxhZyBvbmx5IHVwZGF0ZXMgZXZlcnkgVVBEQVRFX0RFUEVOREVOQ0lFU19JTlRFUlZBTF9NUywgc28gaXQncyBub3QgcGVyZmVjdCAtXG4gICAqIGhvd2V2ZXIsIGl0IHNob3VsZCBiZSBnb29kIGVub3VnaCBmb3IgbG9hZGluZyBpbmRpY2F0b3JzIC8gd2FybmluZ3MuXG4gICAqL1xuICBpc0ZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcygpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXM7XG4gIH1cblxuICBvbkZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcyhjYWxsYmFjazogKCgpID0+IG1peGVkKSk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fZW1pdHRlci5vbihERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxuICBhc3luYyBmb3JtYXRTb3VyY2UoXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBzdGFydFBvc2l0aW9uOiBudW1iZXIsXG4gICAgZW5kUG9zaXRpb246IG51bWJlcixcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2Zvcm1hdCcsIGFyZ3M6IFtjb250ZW50cywgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb25dfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSByZXNwb25zZS5lcnJvcl9tZXNzYWdlO1xuICAgIGlmIChlcnJvck1lc3NhZ2UpIHtcbiAgICAgIGlmIChlcnJvck1lc3NhZ2UgPT09ICdQaHBfb3JfZGVjbCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTb3JyeSwgUEhQIGFuZCA8P2hoIC8vZGVjbCBhcmUgbm90IHN1cHBvcnRlZCcpO1xuICAgICAgfSBlbHNlIGlmIChlcnJvck1lc3NhZ2UgPT09ICdQYXJzaW5nX2Vycm9yJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BhcnNpbmcgRXJyb3IhIEZpeCB5b3VyIGZpbGUgc28gdGhlIHN5bnRheCBpcyB2YWxpZCBhbmQgcmV0cnknKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignZmFpbGVkIGZvcm1hdGluZyBoYWNrIGNvZGUnICsgZXJyb3JNZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3BvbnNlLnJlc3VsdDtcbiAgICB9XG4gIH1cblxuICBhc3luYyBoaWdobGlnaHRTb3VyY2UoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbDogbnVtYmVyLFxuICApOiBQcm9taXNlPEFycmF5PGF0b20kUmFuZ2U+PiB7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKHBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2ZpbmRfbHZhcl9yZWZzJywgYXJnczogW3BhdGgsIGxpbmUsIGNvbF19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIHJldHVybiByZXNwb25zZS5wb3NpdGlvbnMubWFwKFxuICAgICAgcG9zaXRpb24gPT4gbmV3IFJhbmdlKFxuICAgICAgICBbcG9zaXRpb24ubGluZSAtIDEsIHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxXSxcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX2VuZF0sXG4gICAgICApXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIGdldERpYWdub3N0aWNzKFxuICAgIHBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxBcnJheTx7bWVzc2FnZTogSGFja0RpYWdub3N0aWM7fT4+IHtcbiAgICBjb25zdCB7aG9zdG5hbWUsIHBvcnQsIHBhdGg6IGxvY2FsUGF0aH0gPSBwYXJzZShwYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9jaGVja19maWxlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHtlcnJvcnN9ID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmIChob3N0bmFtZSAhPSBudWxsICYmIHBvcnQgIT0gbnVsbCkge1xuICAgICAgZXJyb3JzLmZvckVhY2goZXJyb3IgPT4ge1xuICAgICAgICBlcnJvci5tZXNzYWdlLmZvckVhY2gobWVzc2FnZSA9PiB7XG4gICAgICAgICAgaWYgKG1lc3NhZ2UucGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtZXNzYWdlLnBhdGggPSBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgbWVzc2FnZS5wYXRoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBlcnJvcnM7XG4gIH1cblxuICBhc3luYyBnZXRTZXJ2ZXJEaWFnbm9zdGljcyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgKTogUHJvbWlzZTxBcnJheTx7bWVzc2FnZTogSGFja0RpYWdub3N0aWM7fT4+IHtcbiAgICBjb25zdCB7Z2V0RGlhZ25vc3RpY3N9ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGxldCBkaWFnbm9zdGljUmVzdWx0ID0gbnVsbDtcbiAgICB0cnkge1xuICAgICAgZGlhZ25vc3RpY1Jlc3VsdCA9IGF3YWl0IGdldERpYWdub3N0aWNzKGZpbGVQYXRoLCAnJyk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcihlcnIpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBpZiAoIWRpYWdub3N0aWNSZXN1bHQpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKCdoaF9jbGllbnQgY291bGQgbm90IGJlIHJlYWNoZWQnKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgaGFja0RpYWdub3N0aWNzID0gKChkaWFnbm9zdGljUmVzdWx0OiBhbnkpOiBIYWNrRGlhZ25vc3RpY3NSZXN1bHQpO1xuICAgIHJldHVybiBoYWNrRGlhZ25vc3RpY3MubWVzc2FnZXM7XG4gIH1cblxuICBhc3luYyBnZXREZWZpbml0aW9uKFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgICBjb250ZW50czogc3RyaW5nLFxuICAgICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgICAgY29sdW1uOiBudW1iZXIsXG4gICAgICBsaW5lVGV4dDogc3RyaW5nXG4gICAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCB0byBwYXJzZSwgaW5kZW50aXkgdGhlIHBvc2l0aW9uLFxuICAgIC8vIGFuZCBsb29rdXAgdGhhdCBpZGVudGlmaWVyIGZvciBhIGxvY2F0aW9uIG1hdGNoLlxuICAgIGNvbnN0IGlkZW50aWZpZXJSZXN1bHQgPSBhd2FpdCB0aGlzLl9nZXREZWZpbml0aW9uRnJvbUlkZW50aWZpZXIoXG4gICAgICBmaWxlUGF0aCxcbiAgICAgIGNvbnRlbnRzLFxuICAgICAgbGluZU51bWJlcixcbiAgICAgIGNvbHVtbixcbiAgICAgIGxpbmVUZXh0LFxuICAgICk7XG4gICAgaWYgKGlkZW50aWZpZXJSZXN1bHQubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gaWRlbnRpZmllclJlc3VsdDtcbiAgICB9XG4gICAgY29uc3QgaGV1cmlzdGljUmVzdWx0cyA9XG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgZm9yIGEgc3ltYm9sIG5hbWUgc2VhcmNoIGxvY2F0aW9uLlxuICAgICAgICB0aGlzLl9nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUoZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHNlYXJjaCBvZiB0aGUgc3RyaW5nIHBhcnNlZC5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TdHJpbmdQYXJzZShmaWxlUGF0aCwgbGluZVRleHQsIGNvbHVtbiksXG4gICAgICAgIC8vIEFzayBIYWNrIGNsaWVudCBzaWRlIGZvciBhIHJlc3VsdCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkxvY2F0aW9uQXRQb3NpdGlvbihmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbiksXG4gICAgICBdKTtcbiAgICAvLyBXZSBub3cgaGF2ZSByZXN1bHRzIGZyb20gYWxsIDQgc291cmNlcy5cbiAgICAvLyBDaG9vc2UgdGhlIGJlc3QgcmVzdWx0cyB0byBzaG93IHRvIHRoZSB1c2VyLlxuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHRzID0gW2lkZW50aWZpZXJSZXN1bHRdLmNvbmNhdChoZXVyaXN0aWNSZXN1bHRzKTtcbiAgICByZXR1cm4gYXJyYXkuZmluZChkZWZpbml0aW9uUmVzdWx0cywgZGVmaW5pdGlvblJlc3VsdCA9PiBkZWZpbml0aW9uUmVzdWx0Lmxlbmd0aCA9PT0gMSlcbiAgICAgIHx8IGFycmF5LmZpbmQoZGVmaW5pdGlvblJlc3VsdHMsIGRlZmluaXRpb25SZXN1bHQgPT4gZGVmaW5pdGlvblJlc3VsdC5sZW5ndGggPiAxKVxuICAgICAgfHwgW107XG4gIH1cblxuICBhc3luYyBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbihcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcblxuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9nZXRfbWV0aG9kX25hbWUnLCBhcmdzOiBbcGF0aCwgbGluZU51bWJlciwgY29sdW1uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgaWYgKCFyZXNwb25zZS5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3Qgc3ltYm9sVHlwZSA9IGdldFN5bWJvbFR5cGUocmVzcG9uc2UucmVzdWx0X3R5cGUpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcmVzcG9uc2UucG9zO1xuICAgIHJldHVybiB7XG4gICAgICBuYW1lOiByZXNwb25zZS5uYW1lLFxuICAgICAgdHlwZTogc3ltYm9sVHlwZSxcbiAgICAgIGxpbmU6IHBvc2l0aW9uLmxpbmUgLSAxLFxuICAgICAgY29sdW1uOiBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMSxcbiAgICAgIGxlbmd0aDogcG9zaXRpb24uY2hhcl9lbmQgLSBwb3NpdGlvbi5jaGFyX3N0YXJ0ICsgMSxcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEEgdGhpbiB3cmFwcGVyIGFyb3VuZCBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbiB0aGF0IHdhaXRzIGZvciBkZXBlbmRlbmNpZXMgYmVmb3JlIHJlcG9ydGluZ1xuICAgKiB0aGF0IG5vIHN5bWJvbCBuYW1lIGNhbiBiZSByZXNvbHZlZC5cbiAgICovXG4gIGFzeW5jIGdldFN5bWJvbE5hbWVBdFBvc2l0aW9uV2l0aERlcGVuZGVuY2llcyhcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgdGltZW91dDogP251bWJlcixcbiAgKTogUHJvbWlzZTw/SGFja1N5bWJvbE5hbWVSZXN1bHQ+IHtcbiAgICByZXR1cm4gdGhpcy5fd2FpdEZvckRlcGVuZGVuY2llcyhcbiAgICAgICgpID0+IHRoaXMuZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24ocGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbiksXG4gICAgICB4ID0+IHggIT0gbnVsbCxcbiAgICAgIHRpbWVvdXQsXG4gICAgKTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgaWYgKGNvbnRlbnRzLmxlbmd0aCA+IE1BWF9IQUNLX1dPUktFUl9URVhUX1NJWkUpIHtcbiAgICAgIC8vIEF2b2lkIFBvb3IgV29ya2VyIFBlcmZvcm1hbmNlIGZvciBsYXJnZSBmaWxlcy5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgbGV0IHN5bWJvbCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIHN5bWJvbCA9IGF3YWl0IHRoaXMuZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24oZ2V0UGF0aChmaWxlUGF0aCksIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgLy8gSWdub3JlIHRoZSBlcnJvci5cbiAgICAgIGdldExvZ2dlcigpLndhcm4oJ19nZXREZWZpbml0aW9uRnJvbVN5bWJvbE5hbWUgZXJyb3I6JywgZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFzeW1ib2wgfHwgIXN5bWJvbC5uYW1lKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHtnZXREZWZpbml0aW9ufSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgZ2V0RGVmaW5pdGlvbihmaWxlUGF0aCwgc3ltYm9sLm5hbWUsIHN5bWJvbC50eXBlKTtcbiAgICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuICgoZGVmaW5pdGlvblJlc3VsdDogYW55KTogSGFja0RlZmluaXRpb25SZXN1bHQpLmRlZmluaXRpb25zO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgICBjb2x1bW46IG51bWJlcixcbiAgICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBpZiAoIWZpbGVQYXRoIHx8IGNvbnRlbnRzLmxlbmd0aCA+IE1BWF9IQUNLX1dPUktFUl9URVhUX1NJWkUpIHtcbiAgICAgIC8vIEF2b2lkIFBvb3IgV29ya2VyIFBlcmZvcm1hbmNlIGZvciBsYXJnZSBmaWxlcy5cbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwb3J0LCBwYXRoOiBsb2NhbFBhdGh9ID0gcGFyc2UoZmlsZVBhdGgpO1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShsb2NhbFBhdGgsIGNvbnRlbnRzKTtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2luZmVyX3BvcycsIGFyZ3M6IFtsb2NhbFBhdGgsIGxpbmVOdW1iZXIsIGNvbHVtbl19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IHBvc2l0aW9uID0gcmVzcG9uc2UucG9zIHx8IHt9O1xuICAgIGlmICghcG9zaXRpb24uZmlsZW5hbWUpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIFt7XG4gICAgICBwYXRoOiAoaG9zdG5hbWUgJiYgcG9ydClcbiAgICAgICAgPyBjcmVhdGVSZW1vdGVVcmkoaG9zdG5hbWUsIHBhcnNlSW50KHBvcnQsIDEwKSwgcG9zaXRpb24uZmlsZW5hbWUpXG4gICAgICAgIDogcG9zaXRpb24uZmlsZW5hbWUsXG4gICAgICBsaW5lOiBwb3NpdGlvbi5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogcG9zaXRpb24uY2hhcl9zdGFydCAtIDEsXG4gICAgICBsZW5ndGg6IHBvc2l0aW9uLmNoYXJfZW5kIC0gcG9zaXRpb24uY2hhcl9zdGFydCArIDEsXG4gICAgICBuYW1lOiBwb3NpdGlvbi5uYW1lLFxuICAgICAgc2NvcGU6IHBvc2l0aW9uLnNjb3BlLFxuICAgICAgYWRkaXRpb25hbEluZm86IHBvc2l0aW9uLmFkZGl0aW9uYWxJbmZvLFxuICAgIH1dO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tSWRlbnRpZmllcihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3Qge2dldElkZW50aWZpZXJEZWZpbml0aW9ufSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgZ2V0SWRlbnRpZmllckRlZmluaXRpb24oXG4gICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtblxuICAgICk7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHtkZWZpbml0aW9uc30gPSAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KTtcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4ge1xuICAgICAgbGV0IHtuYW1lfSA9IGRlZmluaXRpb247XG4gICAgICBpZiAobmFtZS5zdGFydHNXaXRoKCc6JykpIHtcbiAgICAgICAgLy8gWEhQIGNsYXNzIG5hbWUsIHVzYWdlcyBvbWl0IHRoZSBsZWFkaW5nICc6Jy5cbiAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgICAgfVxuICAgICAgY29uc3QgZGVmaW5pdGlvbkluZGV4ID0gbGluZVRleHQuaW5kZXhPZihuYW1lKTtcbiAgICAgIGlmIChcbiAgICAgICAgZGVmaW5pdGlvbkluZGV4ID09PSAtMSB8fFxuICAgICAgICBkZWZpbml0aW9uSW5kZXggPj0gY29sdW1uIHx8XG4gICAgICAgICF4aHBDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5zdWJzdHJpbmcoZGVmaW5pdGlvbkluZGV4LCBjb2x1bW4pKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBkZWZpbml0aW9uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgICAgIHNlYXJjaFN0YXJ0Q29sdW1uOiBkZWZpbml0aW9uSW5kZXgsXG4gICAgICAgICAgc2VhcmNoRW5kQ29sdW1uOiBkZWZpbml0aW9uSW5kZXggKyBkZWZpbml0aW9uLm5hbWUubGVuZ3RoLFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgbGluZVRleHQ6IHN0cmluZyxcbiAgICBjb2x1bW46IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBjb25zdCB7c2VhcmNoLCBzdGFydCwgZW5kfSA9IHRoaXMuX3BhcnNlU3RyaW5nRm9yRXhwcmVzc2lvbihsaW5lVGV4dCwgY29sdW1uKTtcbiAgICBpZiAoIXNlYXJjaCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7Z2V0RGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldERlZmluaXRpb24oZmlsZVBhdGgsIHNlYXJjaCwgU3ltYm9sVHlwZS5VTktOT1dOKTtcbiAgICBpZiAoIWRlZmluaXRpb25SZXN1bHQpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZGVmaW5pdGlvbnMgPSAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KS5kZWZpbml0aW9ucztcbiAgICByZXR1cm4gZGVmaW5pdGlvbnMubWFwKGRlZmluaXRpb24gPT4gKHtcbiAgICAgIC4uLmRlZmluaXRpb24sXG4gICAgICBzZWFyY2hTdGFydENvbHVtbjogc3RhcnQsXG4gICAgICBzZWFyY2hFbmRDb2x1bW46IGVuZCxcbiAgICB9KSk7XG4gIH1cblxuICBfcGFyc2VTdHJpbmdGb3JFeHByZXNzaW9uKFxuICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IHtzZWFyY2g6IHN0cmluZzsgc3RhcnQ6IG51bWJlcjsgZW5kOiBudW1iZXJ9IHtcbiAgICBsZXQgc2VhcmNoID0gbnVsbDtcbiAgICBsZXQgc3RhcnQgPSBjb2x1bW47XG5cbiAgICBsZXQgaXNYSFAgPSBmYWxzZTtcbiAgICBsZXQgeGhwTWF0Y2g7XG4gICAgd2hpbGUgICh4aHBNYXRjaCA9IFhIUF9MSU5FX1RFWFRfUkVHRVguZXhlYyhsaW5lVGV4dCkpIHtcbiAgICAgIGNvbnN0IHhocE1hdGNoSW5kZXggPSB4aHBNYXRjaC5pbmRleCArIDE7XG4gICAgICBpZiAoY29sdW1uID49IHhocE1hdGNoSW5kZXggJiYgY29sdW1uIDwgKHhocE1hdGNoSW5kZXggKyB4aHBNYXRjaFsxXS5sZW5ndGgpKSB7XG4gICAgICAgIGlzWEhQID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3ludGF4Q2hhclJlZ2V4ID0gaXNYSFAgPyB4aHBDaGFyUmVnZXggOiB3b3JkQ2hhclJlZ2V4O1xuICAgIC8vIFNjYW4gZm9yIHRoZSB3b3JkIHN0YXJ0IGZvciB0aGUgaGFjayB2YXJpYWJsZSwgZnVuY3Rpb24gb3IgeGhwIHRhZ1xuICAgIC8vIHdlIGFyZSB0cnlpbmcgdG8gZ2V0IHRoZSBkZWZpbml0aW9uIGZvci5cbiAgICB3aGlsZSAoc3RhcnQgPj0gMCAmJiBzeW50YXhDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5jaGFyQXQoc3RhcnQpKSkge1xuICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgaWYgKGxpbmVUZXh0W3N0YXJ0XSA9PT0gJyQnKSB7XG4gICAgICBzdGFydC0tO1xuICAgIH1cbiAgICBzdGFydCsrO1xuICAgIGxldCBlbmQgPSBjb2x1bW47XG4gICAgd2hpbGUgKHN5bnRheENoYXJSZWdleC50ZXN0KGxpbmVUZXh0LmNoYXJBdChlbmQpKSkge1xuICAgICAgZW5kKys7XG4gICAgfVxuICAgIHNlYXJjaCA9IGxpbmVUZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAvLyBYSFAgVUkgZWxlbWVudHMgc3RhcnQgd2l0aCA6IGJ1dCB0aGUgdXNhZ2VzIGRvZXNuJ3QgaGF2ZSB0aGF0IGNvbG9uLlxuICAgIGlmIChpc1hIUCAmJiAhc2VhcmNoLnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgc2VhcmNoID0gJzonICsgc2VhcmNoO1xuICAgIH1cbiAgICByZXR1cm4ge3NlYXJjaCwgc3RhcnQsIGVuZH07XG4gIH1cblxuICBhc3luYyBnZXRUeXBlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGlmICghZXhwcmVzc2lvbi5zdGFydHNXaXRoKCckJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUocGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfaW5mZXJfdHlwZScsIGFyZ3M6IFtwYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCB7dHlwZX0gPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICBhc3luYyBnZXRSZWZlcmVuY2VzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3ltYm9sOiBIYWNrU3ltYm9sTmFtZVJlc3VsdCxcbiAgKTogUHJvbWlzZTw/SGFja1JlZmVyZW5jZXNSZXN1bHQ+IHtcbiAgICBjb25zdCB7Z2V0UmVmZXJlbmNlc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9IGF3YWl0IGdldFJlZmVyZW5jZXMoZmlsZVBhdGgsIHN5bWJvbC5uYW1lLCBzeW1ib2wudHlwZSk7XG4gICAgcmV0dXJuICgocmVmZXJlbmNlc1Jlc3VsdDogYW55KTogSGFja1JlZmVyZW5jZXNSZXN1bHQpO1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgaXNIYWNrQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaEF2YWlsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250aW51YWxseSByZXRyaWVzIHRoZSBmdW5jdGlvbiBwcm92aWRlZCB1bnRpbCBlaXRoZXI6XG4gICAqIDEpIHRoZSByZXR1cm4gdmFsdWUgaXMgXCJhY2NlcHRhYmxlXCIgKGlmIHByb3ZpZGVkKVxuICAgKiAyKSBkZXBlbmRlbmNpZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLCBvclxuICAgKiAzKSB0aGUgc3BlY2lmaWVkIHRpbWVvdXQgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICovXG4gIGFzeW5jIF93YWl0Rm9yRGVwZW5kZW5jaWVzPFQ+KFxuICAgIGZ1bmM6ICgoKSA9PiBQcm9taXNlPFQ+KSxcbiAgICBhY2NlcHRhYmxlOiA/KCh2YWx1ZTogVCkgPT4gYm9vbGVhbiksXG4gICAgdGltZW91dE1zOiA/bnVtYmVyLFxuICApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHdoaWxlICghdGltZW91dE1zIHx8IERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0TXMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZ1bmMoKTtcbiAgICAgIGlmICgoYWNjZXB0YWJsZSAmJiBhY2NlcHRhYmxlKHJlc3VsdCkpIHx8IHRoaXMuaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKSkge1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgfVxuICAgICAgLy8gV2FpdCBmb3IgZGVwZW5kZW5jaWVzIHRvIGZpbmlzaCBsb2FkaW5nIC0gdG8gYXZvaWQgcG9sbGluZywgd2UnbGwgd2FpdCBmb3IgdGhlIGNhbGxiYWNrLlxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB7XG4gICAgICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMub25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKCkgPT4ge1xuICAgICAgICAgIHN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RpbWVkIG91dCB3YWl0aW5nIGZvciBIYWNrIGRlcGVuZGVuY2llcycpO1xuICB9XG5cbn07XG5cbmNvbnN0IHN0cmluZ1RvQ29tcGxldGlvblR5cGUgPSB7XG4gICdpZCc6IENvbXBsZXRpb25UeXBlLklELFxuICAnbmV3JzogQ29tcGxldGlvblR5cGUuTkVXLFxuICAndHlwZSc6IENvbXBsZXRpb25UeXBlLlRZUEUsXG4gICdjbGFzc19nZXQnOiBDb21wbGV0aW9uVHlwZS5DTEFTU19HRVQsXG4gICd2YXInOiBDb21wbGV0aW9uVHlwZS5WQVIsXG59O1xuXG5mdW5jdGlvbiBnZXRDb21wbGV0aW9uVHlwZShpbnB1dDogc3RyaW5nKSB7XG4gIGxldCBjb21wbGV0aW9uVHlwZSA9IHN0cmluZ1RvQ29tcGxldGlvblR5cGVbaW5wdXRdO1xuICBpZiAodHlwZW9mIGNvbXBsZXRpb25UeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIGNvbXBsZXRpb25UeXBlID0gQ29tcGxldGlvblR5cGUuTk9ORTtcbiAgfVxuICByZXR1cm4gY29tcGxldGlvblR5cGU7XG59XG5cbmNvbnN0IHN0cmluZ1RvU3ltYm9sVHlwZSA9IHtcbiAgJ2NsYXNzJzogU3ltYm9sVHlwZS5DTEFTUyxcbiAgJ2Z1bmN0aW9uJzogU3ltYm9sVHlwZS5GVU5DVElPTixcbiAgJ21ldGhvZCc6IFN5bWJvbFR5cGUuTUVUSE9ELFxuICAnbG9jYWwnOiBTeW1ib2xUeXBlLkxPQ0FMLFxufTtcblxuZnVuY3Rpb24gZ2V0U3ltYm9sVHlwZShpbnB1dDogc3RyaW5nKSB7XG4gIGxldCBzeW1ib2xUeXBlID0gc3RyaW5nVG9TeW1ib2xUeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBzeW1ib2xUeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIHN5bWJvbFR5cGUgPSBTeW1ib2xUeXBlLk1FVEhPRDtcbiAgfVxuICByZXR1cm4gc3ltYm9sVHlwZTtcbn1cblxuY29uc3Qgc2VydmVyQ29tcGxldGlvblR5cGVzID0gbmV3IFNldChbXG4gIENvbXBsZXRpb25UeXBlLklELFxuICBDb21wbGV0aW9uVHlwZS5ORVcsXG4gIENvbXBsZXRpb25UeXBlLlRZUEUsXG5dKTtcblxuZnVuY3Rpb24gc2hvdWxkRG9TZXJ2ZXJDb21wbGV0aW9uKHR5cGU6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gc2VydmVyQ29tcGxldGlvblR5cGVzLmhhcyh0eXBlKTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zUmVzcG9uc2U6IEFycmF5PEhhY2tDb21wbGV0aW9uPik6IEFycmF5PGFueT4ge1xuICByZXR1cm4gY29tcGxldGlvbnNSZXNwb25zZS5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgY29uc3Qge25hbWUsIGZ1bmNfZGV0YWlsczogZnVuY3Rpb25EZXRhaWxzfSA9IGNvbXBsZXRpb247XG4gICAgbGV0IHt0eXBlfSA9IGNvbXBsZXRpb247XG4gICAgaWYgKHR5cGUgJiYgdHlwZS5pbmRleE9mKCcoJykgPT09IDAgJiYgdHlwZS5sYXN0SW5kZXhPZignKScpID09PSB0eXBlLmxlbmd0aCAtIDEpIHtcbiAgICAgIHR5cGUgPSB0eXBlLnN1YnN0cmluZygxLCB0eXBlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hTbmlwcGV0ID0gbmFtZTtcbiAgICBpZiAoZnVuY3Rpb25EZXRhaWxzKSB7XG4gICAgICBjb25zdCB7cGFyYW1zfSA9IGZ1bmN0aW9uRGV0YWlscztcbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgc25pcHBldDogZS5nLiBteUZ1bmN0aW9uKCR7MTokYXJnMX0sICR7MjokYXJnMn0pO1xuICAgICAgY29uc3QgcGFyYW1zU3RyaW5nID0gcGFyYW1zLm1hcChcbiAgICAgICAgKHBhcmFtLCBpbmRleCkgPT4gJyR7JyArIChpbmRleCArIDEpICsgJzonICsgcGFyYW0ubmFtZSArICd9Jykuam9pbignLCAnKTtcbiAgICAgIG1hdGNoU25pcHBldCA9IG5hbWUgKyAnKCcgKyBwYXJhbXNTdHJpbmcgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBtYXRjaFNuaXBwZXQsXG4gICAgICBtYXRjaFRleHQ6IG5hbWUsXG4gICAgICBtYXRjaFR5cGU6IHR5cGUsXG4gICAgfTtcbiAgfSk7XG59XG4iXX0=