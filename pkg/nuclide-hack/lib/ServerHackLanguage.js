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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TypedRegions = require('./TypedRegions');

var _atom = require('atom');

var _nuclideLogging = require('../../nuclide-logging');

var _LocalHackLanguage = require('./LocalHackLanguage');

/**
 * Serves language requests from HackService.
 */

var ServerHackLanguage = (function () {

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */

  function ServerHackLanguage(hackService, hhAvailable, basePath) {
    _classCallCheck(this, ServerHackLanguage);

    this._hackService = hackService;
    this._hhAvailable = hhAvailable;
    this._basePath = basePath;
  }

  _createClass(ServerHackLanguage, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'getCompletions',
    value: _asyncToGenerator(function* (filePath, contents, offset) {
      var markedContents = (0, _LocalHackLanguage.markFileForCompletion)(contents, offset);
      var completions = [];
      var completionsResult = yield this._hackService.getCompletions(filePath, markedContents);
      if (completionsResult) {
        completions = completionsResult.completions;
      }
      return (0, _LocalHackLanguage.processCompletions)(completions);
    })
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (contents, startPosition, endPosition) {
      var path = this._basePath;
      if (path == null) {
        throw new Error('No Hack provider for this file.');
      }
      var response = yield this._hackService.formatSource(path, contents, startPosition, endPosition);
      if (response == null) {
        throw new Error('Error formatting hack source.');
      } else if (response.error_message !== '') {
        throw new Error('Error formatting hack source: ' + response.error_message);
      }
      return response.result;
    })
  }, {
    key: 'highlightSource',
    value: _asyncToGenerator(function* (filePath, contents, line, col) {
      var response = yield this._hackService.getSourceHighlights(filePath, contents, line, col);
      if (response == null) {
        return [];
      }
      return response.positions.map(hackRangeToAtomRange);
    })
  }, {
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (filePath, contents) {
      var diagnosticResult = null;
      try {
        diagnosticResult = yield this._hackService.getDiagnostics(filePath, contents);
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
      var definitionResult = yield this._hackService.getIdentifierDefinition(filePath, contents, lineNumber, column);
      var identifierResult = (0, _LocalHackLanguage.processDefinitionsForXhp)(definitionResult, column, lineText);
      return identifierResult.length === 1 ? identifierResult : [];
    })
  }, {
    key: 'getType',
    value: _asyncToGenerator(function* (filePath, contents, expression, lineNumber, column) {
      if (!expression.startsWith('$')) {
        return null;
      }
      var result = yield this._hackService.getTypeAtPos(filePath, contents, lineNumber, column);
      return result == null ? null : result.type;
    })
  }, {
    key: 'findReferences',
    value: _asyncToGenerator(function* (filePath, contents, line, column) {
      var getMethodNameResult = yield this._hackService.getMethodName(filePath, contents, line + 1, column + 1);
      if (getMethodNameResult == null) {
        return null;
      }
      var symbolName = getMethodNameResult.name;
      var symbolType = (0, _LocalHackLanguage.getSymbolType)(getMethodNameResult.result_type);

      if (!_LocalHackLanguage.SYMBOL_TYPES_WITH_REFERENCES.has(symbolType)) {
        return null;
      }

      var referencesResult = yield this._hackService.getReferences(filePath, symbolName, symbolType);
      if (!referencesResult) {
        return null;
      }
      var hackRoot = referencesResult.hackRoot;
      var references = referencesResult.references;

      return { baseUri: hackRoot, symbolName: symbolName, references: references };
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
  }]);

  return ServerHackLanguage;
})();

exports.ServerHackLanguage = ServerHackLanguage;

function hackRangeToAtomRange(position) {
  return new _atom.Range([position.line - 1, position.char_start - 1], [position.line - 1, position.char_end]);
}
//# sourceMappingURL=data:application/json;base64,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QkFBa0I7Ozs7O0FBaUsvQixTQUFTLG9CQUFvQixDQUFDLFFBQW1CLEVBQWM7QUFDN0QsU0FBTyxnQkFDRCxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxVQUFVLEdBQUcsQ0FBQyxDQUFDLEVBQzVDLENBQUMsUUFBUSxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUN2QyxDQUFDO0NBQ1AiLCJmaWxlIjoiU2VydmVySGFja0xhbmd1YWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7Q29tcGxldGlvblJlc3VsdH0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuaW1wb3J0IHR5cGUge1xuICBIYWNrRGlhZ25vc3RpYyxcbiAgSGFja1NlYXJjaFBvc2l0aW9uLFxuICBIYWNrUmFuZ2UsXG4gIEhhY2tSZWZlcmVuY2UsXG4gIEhhY2tPdXRsaW5lLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuaW1wb3J0IHR5cGVvZiAqIGFzIEhhY2tTZXJ2aWNlIGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQge1R5cGVDb3ZlcmFnZVJlZ2lvbn0gZnJvbSAnLi9UeXBlZFJlZ2lvbnMnO1xuXG5pbXBvcnQge1JhbmdlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuaW1wb3J0IHtjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnN9IGZyb20gJy4vVHlwZWRSZWdpb25zJztcbmltcG9ydCB7XG4gIG1hcmtGaWxlRm9yQ29tcGxldGlvbixcbiAgcHJvY2Vzc0NvbXBsZXRpb25zLFxuICBwcm9jZXNzRGVmaW5pdGlvbnNGb3JYaHAsXG4gIGdldFN5bWJvbFR5cGUsXG4gIFNZTUJPTF9UWVBFU19XSVRIX1JFRkVSRU5DRVMsXG59IGZyb20gJy4vTG9jYWxIYWNrTGFuZ3VhZ2UnO1xuXG4vKipcbiAqIFNlcnZlcyBsYW5ndWFnZSByZXF1ZXN0cyBmcm9tIEhhY2tTZXJ2aWNlLlxuICovXG5leHBvcnQgY2xhc3MgU2VydmVySGFja0xhbmd1YWdlIHtcblxuICBfaGFja1NlcnZpY2U6IEhhY2tTZXJ2aWNlO1xuICBfaGhBdmFpbGFibGU6IGJvb2xlYW47XG4gIF9iYXNlUGF0aDogP3N0cmluZztcblxuICAvKipcbiAgICogYGJhc2VQYXRoYCBzaG91bGQgYmUgdGhlIGRpcmVjdG9yeSB3aGVyZSB0aGUgLmhoY29uZmlnIGZpbGUgaXMgbG9jYXRlZC5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGhhY2tTZXJ2aWNlOiBIYWNrU2VydmljZSwgaGhBdmFpbGFibGU6IGJvb2xlYW4sIGJhc2VQYXRoOiA/c3RyaW5nKSB7XG4gICAgdGhpcy5faGFja1NlcnZpY2UgPSBoYWNrU2VydmljZTtcbiAgICB0aGlzLl9oaEF2YWlsYWJsZSA9IGhoQXZhaWxhYmxlO1xuICAgIHRoaXMuX2Jhc2VQYXRoID0gYmFzZVBhdGg7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICB9XG5cbiAgYXN5bmMgZ2V0Q29tcGxldGlvbnMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBvZmZzZXQ6IG51bWJlclxuICApOiBQcm9taXNlPEFycmF5PENvbXBsZXRpb25SZXN1bHQ+PiB7XG4gICAgY29uc3QgbWFya2VkQ29udGVudHMgPSBtYXJrRmlsZUZvckNvbXBsZXRpb24oY29udGVudHMsIG9mZnNldCk7XG4gICAgbGV0IGNvbXBsZXRpb25zID0gW107XG4gICAgY29uc3QgY29tcGxldGlvbnNSZXN1bHQgPSBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXRDb21wbGV0aW9ucyhmaWxlUGF0aCwgbWFya2VkQ29udGVudHMpO1xuICAgIGlmIChjb21wbGV0aW9uc1Jlc3VsdCkge1xuICAgICAgY29tcGxldGlvbnMgPSBjb21wbGV0aW9uc1Jlc3VsdC5jb21wbGV0aW9ucztcbiAgICB9XG4gICAgcmV0dXJuIHByb2Nlc3NDb21wbGV0aW9ucyhjb21wbGV0aW9ucyk7XG4gIH1cblxuICBhc3luYyBmb3JtYXRTb3VyY2UoXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBzdGFydFBvc2l0aW9uOiBudW1iZXIsXG4gICAgZW5kUG9zaXRpb246IG51bWJlcixcbiAgKTogUHJvbWlzZTxzdHJpbmc+IHtcbiAgICBjb25zdCBwYXRoID0gdGhpcy5fYmFzZVBhdGg7XG4gICAgaWYgKHBhdGggPT0gbnVsbCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdObyBIYWNrIHByb3ZpZGVyIGZvciB0aGlzIGZpbGUuJyk7XG4gICAgfVxuICAgIGNvbnN0IHJlc3BvbnNlID1cbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmZvcm1hdFNvdXJjZShwYXRoLCBjb250ZW50cywgc3RhcnRQb3NpdGlvbiwgZW5kUG9zaXRpb24pO1xuICAgIGlmIChyZXNwb25zZSA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Vycm9yIGZvcm1hdHRpbmcgaGFjayBzb3VyY2UuJyk7XG4gICAgfSBlbHNlIGlmIChyZXNwb25zZS5lcnJvcl9tZXNzYWdlICE9PSAnJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFcnJvciBmb3JtYXR0aW5nIGhhY2sgc291cmNlOiAke3Jlc3BvbnNlLmVycm9yX21lc3NhZ2V9YCk7XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZS5yZXN1bHQ7XG4gIH1cblxuICBhc3luYyBoaWdobGlnaHRTb3VyY2UoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sOiBudW1iZXIsXG4gICk6IFByb21pc2U8QXJyYXk8YXRvbSRSYW5nZT4+IHtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldFNvdXJjZUhpZ2hsaWdodHMoZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lLCBjb2wpO1xuICAgIGlmIChyZXNwb25zZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiByZXNwb25zZS5wb3NpdGlvbnMubWFwKGhhY2tSYW5nZVRvQXRvbVJhbmdlKTtcbiAgfVxuXG4gIGFzeW5jIGdldERpYWdub3N0aWNzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gICAgbGV0IGRpYWdub3N0aWNSZXN1bHQgPSBudWxsO1xuICAgIHRyeSB7XG4gICAgICBkaWFnbm9zdGljUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0RGlhZ25vc3RpY3MoZmlsZVBhdGgsIGNvbnRlbnRzKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGdldExvZ2dlcigpLmVycm9yKGVycik7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGlmICghZGlhZ25vc3RpY1Jlc3VsdCkge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoJ2hoX2NsaWVudCBjb3VsZCBub3QgYmUgcmVhY2hlZCcpO1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBoYWNrRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljUmVzdWx0O1xuICAgIHJldHVybiBoYWNrRGlhZ25vc3RpY3MubWVzc2FnZXM7XG4gIH1cblxuICBhc3luYyBnZXRUeXBlQ292ZXJhZ2UoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICk6IFByb21pc2U8QXJyYXk8VHlwZUNvdmVyYWdlUmVnaW9uPj4ge1xuICAgIGNvbnN0IHJlZ2lvbnMgPSBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXRUeXBlZFJlZ2lvbnMoZmlsZVBhdGgpO1xuICAgIHJldHVybiBjb252ZXJ0VHlwZWRSZWdpb25zVG9Db3ZlcmFnZVJlZ2lvbnMocmVnaW9ucyk7XG4gIH1cblxuICBnZXRPdXRsaW5lKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICk6IFByb21pc2U8P0hhY2tPdXRsaW5lPiB7XG4gICAgcmV0dXJuIHRoaXMuX2hhY2tTZXJ2aWNlLmdldE91dGxpbmUoZmlsZVBhdGgsIGNvbnRlbnRzKTtcbiAgfVxuXG4gIGFzeW5jIGdldERlZmluaXRpb24oXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICAgbGluZVRleHQ6IHN0cmluZ1xuICApOiBQcm9taXNlPEFycmF5PEhhY2tTZWFyY2hQb3NpdGlvbj4+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0SWRlbnRpZmllckRlZmluaXRpb24oXG4gICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtblxuICAgICk7XG4gICAgY29uc3QgaWRlbnRpZmllclJlc3VsdCA9IHByb2Nlc3NEZWZpbml0aW9uc0ZvclhocChkZWZpbml0aW9uUmVzdWx0LCBjb2x1bW4sIGxpbmVUZXh0KTtcbiAgICByZXR1cm4gaWRlbnRpZmllclJlc3VsdC5sZW5ndGggPT09IDEgPyBpZGVudGlmaWVyUmVzdWx0IDogW107XG4gIH1cblxuICBhc3luYyBnZXRUeXBlKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgZXhwcmVzc2lvbjogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgKTogUHJvbWlzZTw/c3RyaW5nPiB7XG4gICAgaWYgKCFleHByZXNzaW9uLnN0YXJ0c1dpdGgoJyQnKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldFR5cGVBdFBvcyhmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtbik7XG4gICAgcmV0dXJuIHJlc3VsdCA9PSBudWxsID8gbnVsbCA6IHJlc3VsdC50eXBlO1xuICB9XG5cbiAgYXN5bmMgZmluZFJlZmVyZW5jZXMoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgICBsaW5lOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXJcbiAgKTogUHJvbWlzZTw/e2Jhc2VVcmk6IHN0cmluZzsgc3ltYm9sTmFtZTogc3RyaW5nOyByZWZlcmVuY2VzOiBBcnJheTxIYWNrUmVmZXJlbmNlPn0+IHtcbiAgICBjb25zdCBnZXRNZXRob2ROYW1lUmVzdWx0ID1cbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldE1ldGhvZE5hbWUoZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lICsgMSwgY29sdW1uICsgMSk7XG4gICAgaWYgKGdldE1ldGhvZE5hbWVSZXN1bHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHN5bWJvbE5hbWUgPSBnZXRNZXRob2ROYW1lUmVzdWx0Lm5hbWU7XG4gICAgY29uc3Qgc3ltYm9sVHlwZSA9IGdldFN5bWJvbFR5cGUoZ2V0TWV0aG9kTmFtZVJlc3VsdC5yZXN1bHRfdHlwZSk7XG5cbiAgICBpZiAoIVNZTUJPTF9UWVBFU19XSVRIX1JFRkVSRU5DRVMuaGFzKHN5bWJvbFR5cGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZWZlcmVuY2VzUmVzdWx0ID1cbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldFJlZmVyZW5jZXMoZmlsZVBhdGgsIHN5bWJvbE5hbWUsIHN5bWJvbFR5cGUpO1xuICAgIGlmICghcmVmZXJlbmNlc1Jlc3VsdCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHtoYWNrUm9vdCwgcmVmZXJlbmNlc30gPSByZWZlcmVuY2VzUmVzdWx0O1xuICAgIHJldHVybiB7YmFzZVVyaTogaGFja1Jvb3QsIHN5bWJvbE5hbWUsIHJlZmVyZW5jZXN9O1xuICB9XG5cbiAgZ2V0QmFzZVBhdGgoKTogP3N0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VQYXRoO1xuICB9XG5cbiAgaXNIYWNrQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9oaEF2YWlsYWJsZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYWNrUmFuZ2VUb0F0b21SYW5nZShwb3NpdGlvbjogSGFja1JhbmdlKTogYXRvbSRSYW5nZSB7XG4gIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgICAgIFtwb3NpdGlvbi5saW5lIC0gMSwgcG9zaXRpb24uY2hhcl9zdGFydCAtIDFdLFxuICAgICAgICBbcG9zaXRpb24ubGluZSAtIDEsIHBvc2l0aW9uLmNoYXJfZW5kXSxcbiAgICAgICk7XG59XG4iXX0=