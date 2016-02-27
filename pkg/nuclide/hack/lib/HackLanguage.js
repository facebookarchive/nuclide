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
//# sourceMappingURL=data:application/json;base64,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QUFJLEtBQUssR0FBRyxDQUFDLENBQUEsQUFBQyxHQUFHLEdBQUcsR0FBRyxLQUFLLENBQUMsSUFBSSxHQUFHLEdBQUc7T0FBQSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVFLGtCQUFZLEdBQUcsSUFBSSxHQUFHLEdBQUcsR0FBRyxZQUFZLEdBQUcsR0FBRyxDQUFDO0tBQ2hEO0FBQ0QsV0FBTztBQUNMLGtCQUFZLEVBQVosWUFBWTtBQUNaLGVBQVMsRUFBRSxJQUFJO0FBQ2YsZUFBUyxFQUFFLElBQUk7S0FDaEIsQ0FBQztHQUNILENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IkhhY2tMYW5ndWFnZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgSGFja0NvbXBsZXRpb25zUmVzdWx0LFxuICBIYWNrQ29tcGxldGlvbixcbiAgSGFja0RpYWdub3N0aWNzUmVzdWx0LFxuICBIYWNrRGlhZ25vc3RpYyxcbiAgSGFja0RlZmluaXRpb25SZXN1bHQsXG4gIEhhY2tTZWFyY2hQb3NpdGlvbixcbiAgSGFja1JlZmVyZW5jZXNSZXN1bHQsXG59IGZyb20gJy4uLy4uL2hhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuXG5pbXBvcnQgdHlwZSB7SGFja1N5bWJvbE5hbWVSZXN1bHR9IGZyb20gJy4uLy4uL2hhY2stYmFzZS9saWIvdHlwZXMnO1xuXG5pbXBvcnQge3BhcnNlLCBjcmVhdGVSZW1vdGVVcmksIGdldFBhdGh9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHtnZXRIYWNrU2VydmljZX0gZnJvbSAnLi91dGlscyc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7UmFuZ2UsIEVtaXR0ZXJ9IGZyb20gJ2F0b20nO1xuaW1wb3J0IEhhY2tXb3JrZXIgZnJvbSAnLi9IYWNrV29ya2VyJztcbmltcG9ydCB7Q29tcGxldGlvblR5cGUsIFN5bWJvbFR5cGV9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uJztcblxuLy8gVGhlIHdvcmQgY2hhciByZWdleCBpbmNsdWRlIFxcIHRvIHNlYXJjaCBmb3IgbmFtZXNwYWNlZCBjbGFzc2VzLlxuY29uc3Qgd29yZENoYXJSZWdleCA9IC9bXFx3XFxcXF0vO1xuLy8gVGhlIHhocCBjaGFyIHJlZ2V4IGluY2x1ZGUgOiBhbmQgLSB0byBtYXRjaCB4aHAgdGFncyBsaWtlIDx1aTpidXR0b24tZ3JvdXA+LlxuY29uc3QgeGhwQ2hhclJlZ2V4ID0gL1tcXHc6LV0vO1xuY29uc3QgWEhQX0xJTkVfVEVYVF9SRUdFWCA9IC88KFthLXpdW2EtejAtOV8uOi1dKilbXj5dKlxcLz8+L2dpO1xuXG5jb25zdCBVUERBVEVfREVQRU5ERU5DSUVTX0lOVEVSVkFMX01TID0gMTAwMDA7XG5jb25zdCBERVBFTkRFTkNJRVNfTE9BREVEX0VWRU5UID0gJ2RlcGVuZGVuY2llcy1sb2FkZWQnO1xuY29uc3QgTUFYX0hBQ0tfV09SS0VSX1RFWFRfU0laRSA9IDEwMDAwO1xuXG4vKipcbiAqIFRoZSBIYWNrTGFuZ3VhZ2UgaXMgdGhlIGNvbnRyb2xsZXIgdGhhdCBzZXJ2ZXJzIGxhbmd1YWdlIHJlcXVlc3RzIGJ5IHRyeWluZyB0byBnZXQgd29ya2VyIHJlc3VsdHNcbiAqIGFuZC9vciByZXN1bHRzIGZyb20gSGFja1NlcnZpY2UgKHdoaWNoIHdvdWxkIGJlIGV4ZWN1dGluZyBoaF9jbGllbnQgb24gYSBzdXBwb3J0aW5nIHNlcnZlcilcbiAqIGFuZCBjb21iaW5pbmcgYW5kL29yIHNlbGVjdGluZyB0aGUgcmVzdWx0cyB0byBnaXZlIGJhY2sgdG8gdGhlIHJlcXVlc3Rlci5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBIYWNrTGFuZ3VhZ2Uge1xuXG4gIF9oaEF2YWlsYWJsZTogYm9vbGVhbjtcbiAgX2hhY2tXb3JrZXI6IEhhY2tXb3JrZXI7XG4gIF9wYXRoQ29udGVudHNNYXA6IE1hcDxzdHJpbmcsIHN0cmluZz47XG4gIF9iYXNlUGF0aDogP3N0cmluZztcbiAgX2luaXRpYWxGaWxlVXJpOiBOdWNsaWRlVXJpO1xuICBfaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXM6IGJvb2xlYW47XG4gIF9lbWl0dGVyOiBFbWl0dGVyO1xuICBfdXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWw6IG51bWJlcjtcblxuICAvKipcbiAgICogYGJhc2VQYXRoYCBzaG91bGQgYmUgdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmhoY29uZmlnIGZpbGUgaXMgbG9jYXRlZC5cbiAgICogSXQgc2hvdWxkIG9ubHkgYmUgbnVsbCBpZiBjbGllbnQgaXMgbnVsbC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGhoQXZhaWxhYmxlOiBib29sZWFuLCBiYXNlUGF0aDogP3N0cmluZywgaW5pdGlhbEZpbGVVcmk6IE51Y2xpZGVVcmkpIHtcbiAgICB0aGlzLl9oaEF2YWlsYWJsZSA9IGhoQXZhaWxhYmxlO1xuICAgIHRoaXMuX2hhY2tXb3JrZXIgPSBuZXcgSGFja1dvcmtlcigpO1xuICAgIHRoaXMuX3BhdGhDb250ZW50c01hcCA9IG5ldyBNYXAoKTtcbiAgICB0aGlzLl9iYXNlUGF0aCA9IGJhc2VQYXRoO1xuICAgIHRoaXMuX2luaXRpYWxGaWxlVXJpID0gaW5pdGlhbEZpbGVVcmk7XG4gICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgIHRoaXMuX2VtaXR0ZXIgPSBuZXcgRW1pdHRlcigpO1xuXG4gICAgaWYgKHRoaXMuX2hoQXZhaWxhYmxlKSB7XG4gICAgICB0aGlzLl9zZXR1cFVwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsKCk7XG4gICAgfVxuICB9XG5cbiAgX3NldHVwVXBkYXRlRGVwZW5kZW5jaWVzSW50ZXJ2YWwoKSB7XG4gICAgLy8gRmV0Y2ggYW55IGRlcGVuZGVuY2llcyB0aGUgSGFja1dvcmtlciBuZWVkcyBhZnRlciBsZWFybmluZyBhYm91dCB0aGlzIGZpbGUuXG4gICAgLy8gV2UgZG9uJ3QgYmxvY2sgYW55IHJlYWx0aW1lIGxvZ2ljIG9uIHRoZSBkZXBlbmRlbmN5IGZldGNoaW5nIC0gaXQgY291bGQgdGFrZSBhIHdoaWxlLlxuICAgIGxldCBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gZmFsc2U7XG5cbiAgICBjb25zdCBmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMgPSAoKSA9PiB7XG4gICAgICBwZW5kaW5nVXBkYXRlRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgfTtcblxuICAgIHRoaXMuX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgaWYgKHBlbmRpbmdVcGRhdGVEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcGVuZGluZ1VwZGF0ZURlcGVuZGVuY2llcyA9IHRydWU7XG4gICAgICB0aGlzLnVwZGF0ZURlcGVuZGVuY2llcygpLnRoZW4oZmluaXNoVXBkYXRlRGVwZW5kZW5jaWVzLCBmaW5pc2hVcGRhdGVEZXBlbmRlbmNpZXMpO1xuICAgIH0sIFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9oYWNrV29ya2VyLmRpc3Bvc2UoKTtcbiAgICBjbGVhckludGVydmFsKHRoaXMuX3VwZGF0ZURlcGVuZGVuY2llc0ludGVydmFsKTtcbiAgfVxuXG4gIGFzeW5jIGdldENvbXBsZXRpb25zKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgb2Zmc2V0OiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxhbnk+PiB7XG4gICAgLy8gQ2FsY3VsYXRlIHRoZSBvZmZzZXQgb2YgdGhlIGN1cnNvciBmcm9tIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGZpbGUuXG4gICAgLy8gVGhlbiBpbnNlcnQgQVVUTzMzMiBpbiBhdCB0aGlzIG9mZnNldC4gKEhhY2sgdXNlcyB0aGlzIGFzIGEgbWFya2VyLilcbiAgICBjb25zdCBtYXJrZWRDb250ZW50cyA9IGNvbnRlbnRzLnN1YnN0cmluZygwLCBvZmZzZXQpICtcbiAgICAgICAgJ0FVVE8zMzInICsgY29udGVudHMuc3Vic3RyaW5nKG9mZnNldCwgY29udGVudHMubGVuZ3RoKTtcbiAgICBjb25zdCBsb2NhbFBhdGggPSBnZXRQYXRoKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9hdXRvX2NvbXBsZXRlJywgYXJnczogW2xvY2FsUGF0aF19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGNvbnN0IGNvbXBsZXRpb25UeXBlID0gZ2V0Q29tcGxldGlvblR5cGUocmVzcG9uc2UuY29tcGxldGlvbl90eXBlKTtcbiAgICBsZXQge2NvbXBsZXRpb25zfSA9IHJlc3BvbnNlO1xuICAgIGlmIChzaG91bGREb1NlcnZlckNvbXBsZXRpb24oY29tcGxldGlvblR5cGUpIHx8ICFjb21wbGV0aW9ucy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHtnZXRDb21wbGV0aW9uc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgICBjb25zdCBjb21wbGV0aW9uc1Jlc3VsdCA9IGF3YWl0IGdldENvbXBsZXRpb25zKGZpbGVQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgICBpZiAoY29tcGxldGlvbnNSZXN1bHQpIHtcbiAgICAgICAgY29tcGxldGlvbnMgPSAoKGNvbXBsZXRpb25zUmVzdWx0OiBhbnkpOiBIYWNrQ29tcGxldGlvbnNSZXN1bHQpLmNvbXBsZXRpb25zO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZUZpbGUocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICB0aGlzLl9wYXRoQ29udGVudHNNYXAuc2V0KHBhdGgsIGNvbnRlbnRzKTtcbiAgICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfYWRkX2ZpbGUnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY2llcygpOiBQcm9taXNlIHtcbiAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2dldF9kZXBzJywgYXJnczogW119O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UuZGVwcy5sZW5ndGgpIHtcbiAgICAgIGlmICghdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KERFUEVOREVOQ0lFU19MT0FERURfRVZFTlQpO1xuICAgICAgfVxuICAgICAgdGhpcy5faXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzID0gZmFsc2U7XG4gICAgY29uc3Qge2dldERlcGVuZGVuY2llc30gPSBnZXRIYWNrU2VydmljZSh0aGlzLl9pbml0aWFsRmlsZVVyaSk7XG4gICAgY29uc3QgZGVwZW5kZW5jaWVzUmVzdWx0ID0gYXdhaXQgZ2V0RGVwZW5kZW5jaWVzKFxuICAgICAgdGhpcy5faW5pdGlhbEZpbGVVcmksIHJlc3BvbnNlLmRlcHNcbiAgICApO1xuICAgIGlmICghZGVwZW5kZW5jaWVzUmVzdWx0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtkZXBlbmRlbmNpZXN9ID0gZGVwZW5kZW5jaWVzUmVzdWx0O1xuICAgIC8vIFNlcmlhbGx5IHVwZGF0ZSBkZXBlZG5lY2llcyBub3QgdG8gYmxvY2sgdGhlIHdvcmtlciBmcm9tIHNlcnZpbmcgb3RoZXIgZmVhdHVyZSByZXF1ZXN0cy5cbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wICovXG4gICAgZm9yIChjb25zdCBbZmlsZVBhdGgsIGNvbnRlbnRzXSBvZiBkZXBlbmRlbmNpZXMpIHtcbiAgICAgIGF3YWl0IHRoaXMudXBkYXRlRGVwZW5kZW5jeShmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIH1cbiAgICAvKiBlc2xpbnQtZW5hYmxlIGJhYmVsL25vLWF3YWl0LWluLWxvb3AgKi9cbiAgfVxuXG4gIGFzeW5jIHVwZGF0ZURlcGVuZGVuY3kocGF0aDogc3RyaW5nLCBjb250ZW50czogc3RyaW5nKTogUHJvbWlzZSB7XG4gICAgaWYgKGNvbnRlbnRzICE9PSB0aGlzLl9wYXRoQ29udGVudHNNYXAuZ2V0KHBhdGgpKSB7XG4gICAgICBjb25zdCB3ZWJXb3JrZXJNZXNzYWdlID0ge2NtZDogJ2hoX2FkZF9kZXAnLCBhcmdzOiBbcGF0aCwgY29udGVudHNdfTtcbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlLCB7aXNEZXBlbmRlbmN5OiB0cnVlfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEEgc2ltcGxlIHdheSB0byBlc3RpbWF0ZSBpZiBhbGwgSGFjayBkZXBlbmRlbmNpZXMgaGF2ZSBiZWVuIGxvYWRlZC5cbiAgICogVGhpcyBmbGFnIGlzIHR1cm5lZCBvZmYgd2hlbiBhIGZpbGUgZ2V0cyB1cGRhdGVkIG9yIGFkZGVkLCBhbmQgZ2V0cyB0dXJuZWQgYmFjayBvblxuICAgKiBvbmNlIGB1cGRhdGVEZXBlbmRlbmNpZXMoKWAgcmV0dXJucyBubyBhZGRpdGlvbmFsIGRlcGVuZGVuY2llcy5cbiAgICpcbiAgICogVGhlIGZsYWcgb25seSB1cGRhdGVzIGV2ZXJ5IFVQREFURV9ERVBFTkRFTkNJRVNfSU5URVJWQUxfTVMsIHNvIGl0J3Mgbm90IHBlcmZlY3QgLVxuICAgKiBob3dldmVyLCBpdCBzaG91bGQgYmUgZ29vZCBlbm91Z2ggZm9yIGxvYWRpbmcgaW5kaWNhdG9ycyAvIHdhcm5pbmdzLlxuICAgKi9cbiAgaXNGaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2lzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzO1xuICB9XG5cbiAgb25GaW5pc2hlZExvYWRpbmdEZXBlbmRlbmNpZXMoY2FsbGJhY2s6ICgoKSA9PiBtaXhlZCkpOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX2VtaXR0ZXIub24oREVQRU5ERU5DSUVTX0xPQURFRF9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbiAgYXN5bmMgZm9ybWF0U291cmNlKFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3RhcnRQb3NpdGlvbjogbnVtYmVyLFxuICAgIGVuZFBvc2l0aW9uOiBudW1iZXIsXG4gICk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9mb3JtYXQnLCBhcmdzOiBbY29udGVudHMsIHN0YXJ0UG9zaXRpb24sIGVuZFBvc2l0aW9uXX07XG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gcmVzcG9uc2UuZXJyb3JfbWVzc2FnZTtcbiAgICBpZiAoZXJyb3JNZXNzYWdlKSB7XG4gICAgICBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGhwX29yX2RlY2wnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU29ycnksIFBIUCBhbmQgPD9oaCAvL2RlY2wgYXJlIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICAgIH0gZWxzZSBpZiAoZXJyb3JNZXNzYWdlID09PSAnUGFyc2luZ19lcnJvcicpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXJzaW5nIEVycm9yISBGaXggeW91ciBmaWxlIHNvIHRoZSBzeW50YXggaXMgdmFsaWQgYW5kIHJldHJ5Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ZhaWxlZCBmb3JtYXRpbmcgaGFjayBjb2RlJyArIGVycm9yTWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiByZXNwb25zZS5yZXN1bHQ7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgaGlnaGxpZ2h0U291cmNlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2w6IG51bWJlcixcbiAgKTogUHJvbWlzZTxBcnJheTxhdG9tJFJhbmdlPj4ge1xuICAgIGF3YWl0IHRoaXMudXBkYXRlRmlsZShwYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9maW5kX2x2YXJfcmVmcycsIGFyZ3M6IFtwYXRoLCBsaW5lLCBjb2xdfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICByZXR1cm4gcmVzcG9uc2UucG9zaXRpb25zLm1hcChcbiAgICAgIHBvc2l0aW9uID0+IG5ldyBSYW5nZShcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX3N0YXJ0IC0gMV0sXG4gICAgICAgIFtwb3NpdGlvbi5saW5lIC0gMSwgcG9zaXRpb24uY2hhcl9lbmRdLFxuICAgICAgKVxuICAgICk7XG4gIH1cblxuICBhc3luYyBnZXREaWFnbm9zdGljcyhcbiAgICBwYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgY29uc3Qge2hvc3RuYW1lLCBwb3J0LCBwYXRoOiBsb2NhbFBhdGh9ID0gcGFyc2UocGF0aCk7XG4gICAgYXdhaXQgdGhpcy51cGRhdGVGaWxlKGxvY2FsUGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfY2hlY2tfZmlsZScsIGFyZ3M6IFtsb2NhbFBhdGhdfTtcbiAgICBjb25zdCB7ZXJyb3JzfSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBpZiAoaG9zdG5hbWUgIT0gbnVsbCAmJiBwb3J0ICE9IG51bGwpIHtcbiAgICAgIGVycm9ycy5mb3JFYWNoKGVycm9yID0+IHtcbiAgICAgICAgZXJyb3IubWVzc2FnZS5mb3JFYWNoKG1lc3NhZ2UgPT4ge1xuICAgICAgICAgIGlmIChtZXNzYWdlLnBhdGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWVzc2FnZS5wYXRoID0gY3JlYXRlUmVtb3RlVXJpKGhvc3RuYW1lLCBwYXJzZUludChwb3J0LCAxMCksIG1lc3NhZ2UucGF0aCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gZXJyb3JzO1xuICB9XG5cbiAgYXN5bmMgZ2V0U2VydmVyRGlhZ25vc3RpY3MoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgY29uc3Qge2dldERpYWdub3N0aWNzfSA9IGdldEhhY2tTZXJ2aWNlKGZpbGVQYXRoKTtcbiAgICBsZXQgZGlhZ25vc3RpY1Jlc3VsdCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGRpYWdub3N0aWNSZXN1bHQgPSBhd2FpdCBnZXREaWFnbm9zdGljcyhmaWxlUGF0aCwgJycpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFkaWFnbm9zdGljUmVzdWx0KSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcignaGhfY2xpZW50IGNvdWxkIG5vdCBiZSByZWFjaGVkJyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGhhY2tEaWFnbm9zdGljcyA9ICgoZGlhZ25vc3RpY1Jlc3VsdDogYW55KTogSGFja0RpYWdub3N0aWNzUmVzdWx0KTtcbiAgICByZXR1cm4gaGFja0RpYWdub3N0aWNzLm1lc3NhZ2VzO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihcbiAgICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgICAgY29udGVudHM6IHN0cmluZyxcbiAgICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICAgIGNvbHVtbjogbnVtYmVyLFxuICAgICAgbGluZVRleHQ6IHN0cmluZ1xuICAgICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIC8vIEFzayB0aGUgYGhoX3NlcnZlcmAgdG8gcGFyc2UsIGluZGVudGl5IHRoZSBwb3NpdGlvbixcbiAgICAvLyBhbmQgbG9va3VwIHRoYXQgaWRlbnRpZmllciBmb3IgYSBsb2NhdGlvbiBtYXRjaC5cbiAgICBjb25zdCBpZGVudGlmaWVyUmVzdWx0ID0gYXdhaXQgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21JZGVudGlmaWVyKFxuICAgICAgZmlsZVBhdGgsXG4gICAgICBjb250ZW50cyxcbiAgICAgIGxpbmVOdW1iZXIsXG4gICAgICBjb2x1bW4sXG4gICAgICBsaW5lVGV4dCxcbiAgICApO1xuICAgIGlmIChpZGVudGlmaWVyUmVzdWx0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgcmV0dXJuIGlkZW50aWZpZXJSZXN1bHQ7XG4gICAgfVxuICAgIGNvbnN0IGhldXJpc3RpY1Jlc3VsdHMgPVxuICAgICAgYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBBc2sgdGhlIGBoaF9zZXJ2ZXJgIGZvciBhIHN5bWJvbCBuYW1lIHNlYXJjaCBsb2NhdGlvbi5cbiAgICAgICAgdGhpcy5fZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKGZpbGVQYXRoLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKSxcbiAgICAgICAgLy8gQXNrIHRoZSBgaGhfc2VydmVyYCBmb3IgYSBzZWFyY2ggb2YgdGhlIHN0cmluZyBwYXJzZWQuXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Gcm9tU3RyaW5nUGFyc2UoZmlsZVBhdGgsIGxpbmVUZXh0LCBjb2x1bW4pLFxuICAgICAgICAvLyBBc2sgSGFjayBjbGllbnQgc2lkZSBmb3IgYSByZXN1bHQgbG9jYXRpb24uXG4gICAgICAgIHRoaXMuX2dldERlZmluaXRpb25Mb2NhdGlvbkF0UG9zaXRpb24oZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgXSk7XG4gICAgLy8gV2Ugbm93IGhhdmUgcmVzdWx0cyBmcm9tIGFsbCA0IHNvdXJjZXMuXG4gICAgLy8gQ2hvb3NlIHRoZSBiZXN0IHJlc3VsdHMgdG8gc2hvdyB0byB0aGUgdXNlci5cbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0cyA9IFtpZGVudGlmaWVyUmVzdWx0XS5jb25jYXQoaGV1cmlzdGljUmVzdWx0cyk7XG4gICAgcmV0dXJuIGFycmF5LmZpbmQoZGVmaW5pdGlvblJlc3VsdHMsIGRlZmluaXRpb25SZXN1bHQgPT4gZGVmaW5pdGlvblJlc3VsdC5sZW5ndGggPT09IDEpXG4gICAgICB8fCBhcnJheS5maW5kKGRlZmluaXRpb25SZXN1bHRzLCBkZWZpbml0aW9uUmVzdWx0ID0+IGRlZmluaXRpb25SZXN1bHQubGVuZ3RoID4gMSlcbiAgICAgIHx8IFtdO1xuICB9XG5cbiAgYXN5bmMgZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24oXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8P0hhY2tTeW1ib2xOYW1lUmVzdWx0PiB7XG5cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUocGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfZ2V0X21ldGhvZF9uYW1lJywgYXJnczogW3BhdGgsIGxpbmVOdW1iZXIsIGNvbHVtbl19O1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1dvcmtlci5ydW5Xb3JrZXJUYXNrKHdlYldvcmtlck1lc3NhZ2UpO1xuICAgIGlmICghcmVzcG9uc2UubmFtZSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHN5bWJvbFR5cGUgPSBnZXRTeW1ib2xUeXBlKHJlc3BvbnNlLnJlc3VsdF90eXBlKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHJlc3BvbnNlLnBvcztcbiAgICByZXR1cm4ge1xuICAgICAgbmFtZTogcmVzcG9uc2UubmFtZSxcbiAgICAgIHR5cGU6IHN5bWJvbFR5cGUsXG4gICAgICBsaW5lOiBwb3NpdGlvbi5saW5lIC0gMSxcbiAgICAgIGNvbHVtbjogcG9zaXRpb24uY2hhcl9zdGFydCAtIDEsXG4gICAgICBsZW5ndGg6IHBvc2l0aW9uLmNoYXJfZW5kIC0gcG9zaXRpb24uY2hhcl9zdGFydCArIDEsXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBIHRoaW4gd3JhcHBlciBhcm91bmQgZ2V0U3ltYm9sTmFtZUF0UG9zaXRpb24gdGhhdCB3YWl0cyBmb3IgZGVwZW5kZW5jaWVzIGJlZm9yZSByZXBvcnRpbmdcbiAgICogdGhhdCBubyBzeW1ib2wgbmFtZSBjYW4gYmUgcmVzb2x2ZWQuXG4gICAqL1xuICBhc3luYyBnZXRTeW1ib2xOYW1lQXRQb3NpdGlvbldpdGhEZXBlbmRlbmNpZXMoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICAgIHRpbWVvdXQ6ID9udW1iZXIsXG4gICk6IFByb21pc2U8P0hhY2tTeW1ib2xOYW1lUmVzdWx0PiB7XG4gICAgcmV0dXJuIHRoaXMuX3dhaXRGb3JEZXBlbmRlbmNpZXMoXG4gICAgICAoKSA9PiB0aGlzLmdldFN5bWJvbE5hbWVBdFBvc2l0aW9uKHBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pLFxuICAgICAgeCA9PiB4ICE9IG51bGwsXG4gICAgICB0aW1lb3V0LFxuICAgICk7XG4gIH1cblxuICBhc3luYyBfZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGlmIChjb250ZW50cy5sZW5ndGggPiBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFKSB7XG4gICAgICAvLyBBdm9pZCBQb29yIFdvcmtlciBQZXJmb3JtYW5jZSBmb3IgbGFyZ2UgZmlsZXMuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGxldCBzeW1ib2wgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBzeW1ib2wgPSBhd2FpdCB0aGlzLmdldFN5bWJvbE5hbWVBdFBvc2l0aW9uKGdldFBhdGgoZmlsZVBhdGgpLCBjb250ZW50cywgbGluZU51bWJlciwgY29sdW1uKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIC8vIElnbm9yZSB0aGUgZXJyb3IuXG4gICAgICBnZXRMb2dnZXIoKS53YXJuKCdfZ2V0RGVmaW5pdGlvbkZyb21TeW1ib2xOYW1lIGVycm9yOicsIGVycik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghc3ltYm9sIHx8ICFzeW1ib2wubmFtZSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7Z2V0RGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldERlZmluaXRpb24oZmlsZVBhdGgsIHN5bWJvbC5uYW1lLCBzeW1ib2wudHlwZSk7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiAoKGRlZmluaXRpb25SZXN1bHQ6IGFueSk6IEhhY2tEZWZpbml0aW9uUmVzdWx0KS5kZWZpbml0aW9ucztcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uTG9jYXRpb25BdFBvc2l0aW9uKFxuICAgICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgICBjb250ZW50czogc3RyaW5nLFxuICAgICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgICAgY29sdW1uOiBudW1iZXIsXG4gICAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgaWYgKCFmaWxlUGF0aCB8fCBjb250ZW50cy5sZW5ndGggPiBNQVhfSEFDS19XT1JLRVJfVEVYVF9TSVpFKSB7XG4gICAgICAvLyBBdm9pZCBQb29yIFdvcmtlciBQZXJmb3JtYW5jZSBmb3IgbGFyZ2UgZmlsZXMuXG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IHtob3N0bmFtZSwgcG9ydCwgcGF0aDogbG9jYWxQYXRofSA9IHBhcnNlKGZpbGVQYXRoKTtcbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUobG9jYWxQYXRoLCBjb250ZW50cyk7XG4gICAgY29uc3Qgd2ViV29ya2VyTWVzc2FnZSA9IHtjbWQ6ICdoaF9pbmZlcl9wb3MnLCBhcmdzOiBbbG9jYWxQYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tXb3JrZXIucnVuV29ya2VyVGFzayh3ZWJXb3JrZXJNZXNzYWdlKTtcbiAgICBjb25zdCBwb3NpdGlvbiA9IHJlc3BvbnNlLnBvcyB8fCB7fTtcbiAgICBpZiAoIXBvc2l0aW9uLmZpbGVuYW1lKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBbe1xuICAgICAgcGF0aDogKGhvc3RuYW1lICYmIHBvcnQpXG4gICAgICAgID8gY3JlYXRlUmVtb3RlVXJpKGhvc3RuYW1lLCBwYXJzZUludChwb3J0LCAxMCksIHBvc2l0aW9uLmZpbGVuYW1lKVxuICAgICAgICA6IHBvc2l0aW9uLmZpbGVuYW1lLFxuICAgICAgbGluZTogcG9zaXRpb24ubGluZSAtIDEsXG4gICAgICBjb2x1bW46IHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxLFxuICAgICAgbGVuZ3RoOiBwb3NpdGlvbi5jaGFyX2VuZCAtIHBvc2l0aW9uLmNoYXJfc3RhcnQgKyAxLFxuICAgICAgbmFtZTogcG9zaXRpb24ubmFtZSxcbiAgICAgIHNjb3BlOiBwb3NpdGlvbi5zY29wZSxcbiAgICAgIGFkZGl0aW9uYWxJbmZvOiBwb3NpdGlvbi5hZGRpdGlvbmFsSW5mbyxcbiAgICB9XTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbUlkZW50aWZpZXIoXG4gICAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgICBjb2x1bW46IG51bWJlcixcbiAgICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8SGFja1NlYXJjaFBvc2l0aW9uPj4ge1xuICAgIGNvbnN0IHtnZXRJZGVudGlmaWVyRGVmaW5pdGlvbn0gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgZGVmaW5pdGlvblJlc3VsdCA9IGF3YWl0IGdldElkZW50aWZpZXJEZWZpbml0aW9uKFxuICAgICAgZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW5cbiAgICApO1xuICAgIGlmICghZGVmaW5pdGlvblJlc3VsdCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCB7ZGVmaW5pdGlvbnN9ID0gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCk7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcChkZWZpbml0aW9uID0+IHtcbiAgICAgIGxldCB7bmFtZX0gPSBkZWZpbml0aW9uO1xuICAgICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnOicpKSB7XG4gICAgICAgIC8vIFhIUCBjbGFzcyBuYW1lLCB1c2FnZXMgb21pdCB0aGUgbGVhZGluZyAnOicuXG4gICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGRlZmluaXRpb25JbmRleCA9IGxpbmVUZXh0LmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoXG4gICAgICAgIGRlZmluaXRpb25JbmRleCA9PT0gLTEgfHxcbiAgICAgICAgZGVmaW5pdGlvbkluZGV4ID49IGNvbHVtbiB8fFxuICAgICAgICAheGhwQ2hhclJlZ2V4LnRlc3QobGluZVRleHQuc3Vic3RyaW5nKGRlZmluaXRpb25JbmRleCwgY29sdW1uKSlcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZGVmaW5pdGlvbjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgLi4uZGVmaW5pdGlvbixcbiAgICAgICAgICBzZWFyY2hTdGFydENvbHVtbjogZGVmaW5pdGlvbkluZGV4LFxuICAgICAgICAgIHNlYXJjaEVuZENvbHVtbjogZGVmaW5pdGlvbkluZGV4ICsgZGVmaW5pdGlvbi5uYW1lLmxlbmd0aCxcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIF9nZXREZWZpbml0aW9uRnJvbVN0cmluZ1BhcnNlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGxpbmVUZXh0OiBzdHJpbmcsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTxBcnJheTxIYWNrU2VhcmNoUG9zaXRpb24+PiB7XG4gICAgY29uc3Qge3NlYXJjaCwgc3RhcnQsIGVuZH0gPSB0aGlzLl9wYXJzZVN0cmluZ0ZvckV4cHJlc3Npb24obGluZVRleHQsIGNvbHVtbik7XG4gICAgaWYgKCFzZWFyY2gpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3Qge2dldERlZmluaXRpb259ID0gZ2V0SGFja1NlcnZpY2UoZmlsZVBhdGgpO1xuICAgIGNvbnN0IGRlZmluaXRpb25SZXN1bHQgPSBhd2FpdCBnZXREZWZpbml0aW9uKGZpbGVQYXRoLCBzZWFyY2gsIFN5bWJvbFR5cGUuVU5LTk9XTik7XG4gICAgaWYgKCFkZWZpbml0aW9uUmVzdWx0KSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGRlZmluaXRpb25zID0gKChkZWZpbml0aW9uUmVzdWx0OiBhbnkpOiBIYWNrRGVmaW5pdGlvblJlc3VsdCkuZGVmaW5pdGlvbnM7XG4gICAgcmV0dXJuIGRlZmluaXRpb25zLm1hcChkZWZpbml0aW9uID0+ICh7XG4gICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgc2VhcmNoU3RhcnRDb2x1bW46IHN0YXJ0LFxuICAgICAgc2VhcmNoRW5kQ29sdW1uOiBlbmQsXG4gICAgfSkpO1xuICB9XG5cbiAgX3BhcnNlU3RyaW5nRm9yRXhwcmVzc2lvbihcbiAgICBsaW5lVGV4dDogc3RyaW5nLFxuICAgIGNvbHVtbjogbnVtYmVyLFxuICApOiB7c2VhcmNoOiBzdHJpbmc7IHN0YXJ0OiBudW1iZXI7IGVuZDogbnVtYmVyfSB7XG4gICAgbGV0IHNlYXJjaCA9IG51bGw7XG4gICAgbGV0IHN0YXJ0ID0gY29sdW1uO1xuXG4gICAgbGV0IGlzWEhQID0gZmFsc2U7XG4gICAgbGV0IHhocE1hdGNoO1xuICAgIHdoaWxlICAoKHhocE1hdGNoID0gWEhQX0xJTkVfVEVYVF9SRUdFWC5leGVjKGxpbmVUZXh0KSkpIHtcbiAgICAgIGNvbnN0IHhocE1hdGNoSW5kZXggPSB4aHBNYXRjaC5pbmRleCArIDE7XG4gICAgICBpZiAoY29sdW1uID49IHhocE1hdGNoSW5kZXggJiYgY29sdW1uIDwgKHhocE1hdGNoSW5kZXggKyB4aHBNYXRjaFsxXS5sZW5ndGgpKSB7XG4gICAgICAgIGlzWEhQID0gdHJ1ZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3ludGF4Q2hhclJlZ2V4ID0gaXNYSFAgPyB4aHBDaGFyUmVnZXggOiB3b3JkQ2hhclJlZ2V4O1xuICAgIC8vIFNjYW4gZm9yIHRoZSB3b3JkIHN0YXJ0IGZvciB0aGUgaGFjayB2YXJpYWJsZSwgZnVuY3Rpb24gb3IgeGhwIHRhZ1xuICAgIC8vIHdlIGFyZSB0cnlpbmcgdG8gZ2V0IHRoZSBkZWZpbml0aW9uIGZvci5cbiAgICB3aGlsZSAoc3RhcnQgPj0gMCAmJiBzeW50YXhDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5jaGFyQXQoc3RhcnQpKSkge1xuICAgICAgc3RhcnQtLTtcbiAgICB9XG4gICAgaWYgKGxpbmVUZXh0W3N0YXJ0XSA9PT0gJyQnKSB7XG4gICAgICBzdGFydC0tO1xuICAgIH1cbiAgICBzdGFydCsrO1xuICAgIGxldCBlbmQgPSBjb2x1bW47XG4gICAgd2hpbGUgKHN5bnRheENoYXJSZWdleC50ZXN0KGxpbmVUZXh0LmNoYXJBdChlbmQpKSkge1xuICAgICAgZW5kKys7XG4gICAgfVxuICAgIHNlYXJjaCA9IGxpbmVUZXh0LnN1YnN0cmluZyhzdGFydCwgZW5kKTtcbiAgICAvLyBYSFAgVUkgZWxlbWVudHMgc3RhcnQgd2l0aCA6IGJ1dCB0aGUgdXNhZ2VzIGRvZXNuJ3QgaGF2ZSB0aGF0IGNvbG9uLlxuICAgIGlmIChpc1hIUCAmJiAhc2VhcmNoLnN0YXJ0c1dpdGgoJzonKSkge1xuICAgICAgc2VhcmNoID0gJzonICsgc2VhcmNoO1xuICAgIH1cbiAgICByZXR1cm4ge3NlYXJjaCwgc3RhcnQsIGVuZH07XG4gIH1cblxuICBhc3luYyBnZXRUeXBlKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGlmICghZXhwcmVzc2lvbi5zdGFydHNXaXRoKCckJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBhd2FpdCB0aGlzLnVwZGF0ZUZpbGUocGF0aCwgY29udGVudHMpO1xuICAgIGNvbnN0IHdlYldvcmtlck1lc3NhZ2UgPSB7Y21kOiAnaGhfaW5mZXJfdHlwZScsIGFyZ3M6IFtwYXRoLCBsaW5lTnVtYmVyLCBjb2x1bW5dfTtcbiAgICBjb25zdCB7dHlwZX0gPSBhd2FpdCB0aGlzLl9oYWNrV29ya2VyLnJ1bldvcmtlclRhc2sod2ViV29ya2VyTWVzc2FnZSk7XG4gICAgcmV0dXJuIHR5cGU7XG4gIH1cblxuICBhc3luYyBnZXRSZWZlcmVuY2VzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgc3ltYm9sOiBIYWNrU3ltYm9sTmFtZVJlc3VsdCxcbiAgKTogUHJvbWlzZTw/SGFja1JlZmVyZW5jZXNSZXN1bHQ+IHtcbiAgICBjb25zdCB7Z2V0UmVmZXJlbmNlc30gPSBnZXRIYWNrU2VydmljZShmaWxlUGF0aCk7XG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9IGF3YWl0IGdldFJlZmVyZW5jZXMoZmlsZVBhdGgsIHN5bWJvbC5uYW1lLCBzeW1ib2wudHlwZSk7XG4gICAgcmV0dXJuICgocmVmZXJlbmNlc1Jlc3VsdDogYW55KTogSGFja1JlZmVyZW5jZXNSZXN1bHQpO1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgaXNIYWNrQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaEF2YWlsYWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb250aW51YWxseSByZXRyaWVzIHRoZSBmdW5jdGlvbiBwcm92aWRlZCB1bnRpbCBlaXRoZXI6XG4gICAqIDEpIHRoZSByZXR1cm4gdmFsdWUgaXMgXCJhY2NlcHRhYmxlXCIgKGlmIHByb3ZpZGVkKVxuICAgKiAyKSBkZXBlbmRlbmNpZXMgaGF2ZSBmaW5pc2hlZCBsb2FkaW5nLCBvclxuICAgKiAzKSB0aGUgc3BlY2lmaWVkIHRpbWVvdXQgaGFzIGJlZW4gcmVhY2hlZC5cbiAgICovXG4gIGFzeW5jIF93YWl0Rm9yRGVwZW5kZW5jaWVzPFQ+KFxuICAgIGZ1bmM6ICgoKSA9PiBQcm9taXNlPFQ+KSxcbiAgICBhY2NlcHRhYmxlOiA/KCh2YWx1ZTogVCkgPT4gYm9vbGVhbiksXG4gICAgdGltZW91dE1zOiA/bnVtYmVyLFxuICApOiBQcm9taXNlPFQ+IHtcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpO1xuICAgIHdoaWxlICghdGltZW91dE1zIHx8IERhdGUubm93KCkgLSBzdGFydFRpbWUgPCB0aW1lb3V0TXMpIHtcbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGZ1bmMoKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBiYWJlbC9uby1hd2FpdC1pbi1sb29wXG4gICAgICBpZiAoKGFjY2VwdGFibGUgJiYgYWNjZXB0YWJsZShyZXN1bHQpKSB8fCB0aGlzLmlzRmluaXNoZWRMb2FkaW5nRGVwZW5kZW5jaWVzKCkpIHtcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgIH1cbiAgICAgIC8vIFdhaXQgZm9yIGRlcGVuZGVuY2llcyB0byBmaW5pc2ggbG9hZGluZyAtIHRvIGF2b2lkIHBvbGxpbmcsIHdlJ2xsIHdhaXQgZm9yIHRoZSBjYWxsYmFjay5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4geyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGJhYmVsL25vLWF3YWl0LWluLWxvb3BcbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gdGhpcy5vbkZpbmlzaGVkTG9hZGluZ0RlcGVuZGVuY2llcygoKSA9PiB7XG4gICAgICAgICAgc3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRocm93IG5ldyBFcnJvcignVGltZWQgb3V0IHdhaXRpbmcgZm9yIEhhY2sgZGVwZW5kZW5jaWVzJyk7XG4gIH1cblxufTtcblxuY29uc3Qgc3RyaW5nVG9Db21wbGV0aW9uVHlwZSA9IHtcbiAgJ2lkJzogQ29tcGxldGlvblR5cGUuSUQsXG4gICduZXcnOiBDb21wbGV0aW9uVHlwZS5ORVcsXG4gICd0eXBlJzogQ29tcGxldGlvblR5cGUuVFlQRSxcbiAgJ2NsYXNzX2dldCc6IENvbXBsZXRpb25UeXBlLkNMQVNTX0dFVCxcbiAgJ3Zhcic6IENvbXBsZXRpb25UeXBlLlZBUixcbn07XG5cbmZ1bmN0aW9uIGdldENvbXBsZXRpb25UeXBlKGlucHV0OiBzdHJpbmcpIHtcbiAgbGV0IGNvbXBsZXRpb25UeXBlID0gc3RyaW5nVG9Db21wbGV0aW9uVHlwZVtpbnB1dF07XG4gIGlmICh0eXBlb2YgY29tcGxldGlvblR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgY29tcGxldGlvblR5cGUgPSBDb21wbGV0aW9uVHlwZS5OT05FO1xuICB9XG4gIHJldHVybiBjb21wbGV0aW9uVHlwZTtcbn1cblxuY29uc3Qgc3RyaW5nVG9TeW1ib2xUeXBlID0ge1xuICAnY2xhc3MnOiBTeW1ib2xUeXBlLkNMQVNTLFxuICAnZnVuY3Rpb24nOiBTeW1ib2xUeXBlLkZVTkNUSU9OLFxuICAnbWV0aG9kJzogU3ltYm9sVHlwZS5NRVRIT0QsXG4gICdsb2NhbCc6IFN5bWJvbFR5cGUuTE9DQUwsXG59O1xuXG5mdW5jdGlvbiBnZXRTeW1ib2xUeXBlKGlucHV0OiBzdHJpbmcpIHtcbiAgbGV0IHN5bWJvbFR5cGUgPSBzdHJpbmdUb1N5bWJvbFR5cGVbaW5wdXRdO1xuICBpZiAodHlwZW9mIHN5bWJvbFR5cGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgc3ltYm9sVHlwZSA9IFN5bWJvbFR5cGUuTUVUSE9EO1xuICB9XG4gIHJldHVybiBzeW1ib2xUeXBlO1xufVxuXG5jb25zdCBzZXJ2ZXJDb21wbGV0aW9uVHlwZXMgPSBuZXcgU2V0KFtcbiAgQ29tcGxldGlvblR5cGUuSUQsXG4gIENvbXBsZXRpb25UeXBlLk5FVyxcbiAgQ29tcGxldGlvblR5cGUuVFlQRSxcbl0pO1xuXG5mdW5jdGlvbiBzaG91bGREb1NlcnZlckNvbXBsZXRpb24odHlwZTogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiBzZXJ2ZXJDb21wbGV0aW9uVHlwZXMuaGFzKHR5cGUpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzQ29tcGxldGlvbnMoY29tcGxldGlvbnNSZXNwb25zZTogQXJyYXk8SGFja0NvbXBsZXRpb24+KTogQXJyYXk8YW55PiB7XG4gIHJldHVybiBjb21wbGV0aW9uc1Jlc3BvbnNlLm1hcChjb21wbGV0aW9uID0+IHtcbiAgICBjb25zdCB7bmFtZSwgZnVuY19kZXRhaWxzOiBmdW5jdGlvbkRldGFpbHN9ID0gY29tcGxldGlvbjtcbiAgICBsZXQge3R5cGV9ID0gY29tcGxldGlvbjtcbiAgICBpZiAodHlwZSAmJiB0eXBlLmluZGV4T2YoJygnKSA9PT0gMCAmJiB0eXBlLmxhc3RJbmRleE9mKCcpJykgPT09IHR5cGUubGVuZ3RoIC0gMSkge1xuICAgICAgdHlwZSA9IHR5cGUuc3Vic3RyaW5nKDEsIHR5cGUubGVuZ3RoIC0gMSk7XG4gICAgfVxuICAgIGxldCBtYXRjaFNuaXBwZXQgPSBuYW1lO1xuICAgIGlmIChmdW5jdGlvbkRldGFpbHMpIHtcbiAgICAgIGNvbnN0IHtwYXJhbXN9ID0gZnVuY3Rpb25EZXRhaWxzO1xuICAgICAgLy8gQ29uc3RydWN0IHRoZSBzbmlwcGV0OiBlLmcuIG15RnVuY3Rpb24oJHsxOiRhcmcxfSwgJHsyOiRhcmcyfSk7XG4gICAgICBjb25zdCBwYXJhbXNTdHJpbmcgPSBwYXJhbXMubWFwKFxuICAgICAgICAocGFyYW0sIGluZGV4KSA9PiAnJHsnICsgKGluZGV4ICsgMSkgKyAnOicgKyBwYXJhbS5uYW1lICsgJ30nKS5qb2luKCcsICcpO1xuICAgICAgbWF0Y2hTbmlwcGV0ID0gbmFtZSArICcoJyArIHBhcmFtc1N0cmluZyArICcpJztcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoU25pcHBldCxcbiAgICAgIG1hdGNoVGV4dDogbmFtZSxcbiAgICAgIG1hdGNoVHlwZTogdHlwZSxcbiAgICB9O1xuICB9KTtcbn1cbiJdfQ==