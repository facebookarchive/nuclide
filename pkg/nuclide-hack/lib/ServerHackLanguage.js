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

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _TypedRegions = require('./TypedRegions');

var _atom = require('atom');

var _nuclideLogging = require('../../nuclide-logging');

var _nuclideHackCommon = require('../../nuclide-hack-common');

/**
 * Serves language requests from HackService.
 * Note that all line/column values are 1 based.
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
      var markedContents = markFileForCompletion(contents, offset);
      var completions = [];
      var completionsResult = yield this._hackService.getCompletions(filePath, markedContents);
      if (completionsResult) {
        completions = completionsResult.completions;
      }
      return processCompletions(completions);
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
      var identifierResult = processDefinitionsForXhp(definitionResult, column, lineText);
      return identifierResult.length === 1 ? identifierResult : [];
    })
  }, {
    key: 'getIdeDefinition',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column) {
      var definition = yield this._hackService.getDefinition(filePath, contents, lineNumber, column);
      if (definition == null || definition.definition_pos == null) {
        return null;
      }
      return {
        name: definition.name,
        path: definition.definition_pos.filename,
        line: definition.definition_pos.line,
        column: definition.definition_pos.char_start,
        queryRange: hackRangeToAtomRange(definition.pos)
      };
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
      var symbolType = getSymbolType(getMethodNameResult.result_type);

      if (!SYMBOL_TYPES_WITH_REFERENCES.has(symbolType)) {
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

// The xhp char regex include : and - to match xhp tags like <ui:button-group>.
var xhpCharRegex = /[\w:-]/;

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
      return _extends({}, definition);
    } else {
      return _extends({}, definition, {
        searchStartColumn: definitionIndex,
        searchEndColumn: definitionIndex + definition.name.length
      });
    }
  });
}
//# sourceMappingURL=data:application/json;base64,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WSxVQUFVLEVBQUc7S0FDMUIsTUFBTTtBQUNMLDBCQUNLLFVBQVU7QUFDYix5QkFBaUIsRUFBRSxlQUFlO0FBQ2xDLHVCQUFlLEVBQUUsZUFBZSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTTtTQUN6RDtLQUNIO0dBQ0YsQ0FBQyxDQUFDO0NBQ0oiLCJmaWxlIjoiU2VydmVySGFja0xhbmd1YWdlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7Q29tcGxldGlvblJlc3VsdCwgRGVmaW5pdGlvblJlc3VsdCwgRGVmaW5pdGlvbn0gZnJvbSAnLi9IYWNrTGFuZ3VhZ2UnO1xuaW1wb3J0IHR5cGUge1xuICBIYWNrQ29tcGxldGlvbixcbiAgSGFja0RpYWdub3N0aWMsXG4gIEhhY2tEZWZpbml0aW9uUmVzdWx0LFxuICBIYWNrU2VhcmNoUG9zaXRpb24sXG4gIEhhY2tSYW5nZSxcbiAgSGFja1JlZmVyZW5jZSxcbiAgSGFja091dGxpbmUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQgdHlwZW9mICogYXMgSGFja1NlcnZpY2UgZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtTeW1ib2xUeXBlVmFsdWV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuaW1wb3J0IHtUeXBlQ292ZXJhZ2VSZWdpb259IGZyb20gJy4vVHlwZWRSZWdpb25zJztcblxuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmltcG9ydCB7Y29udmVydFR5cGVkUmVnaW9uc1RvQ292ZXJhZ2VSZWdpb25zfSBmcm9tICcuL1R5cGVkUmVnaW9ucyc7XG5pbXBvcnQge1N5bWJvbFR5cGV9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuXG4vKipcbiAqIFNlcnZlcyBsYW5ndWFnZSByZXF1ZXN0cyBmcm9tIEhhY2tTZXJ2aWNlLlxuICogTm90ZSB0aGF0IGFsbCBsaW5lL2NvbHVtbiB2YWx1ZXMgYXJlIDEgYmFzZWQuXG4gKi9cbmV4cG9ydCBjbGFzcyBTZXJ2ZXJIYWNrTGFuZ3VhZ2Uge1xuXG4gIF9oYWNrU2VydmljZTogSGFja1NlcnZpY2U7XG4gIF9oaEF2YWlsYWJsZTogYm9vbGVhbjtcbiAgX2Jhc2VQYXRoOiA/c3RyaW5nO1xuXG4gIC8qKlxuICAgKiBgYmFzZVBhdGhgIHNob3VsZCBiZSB0aGUgZGlyZWN0b3J5IHdoZXJlIHRoZSAuaGhjb25maWcgZmlsZSBpcyBsb2NhdGVkLlxuICAgKi9cbiAgY29uc3RydWN0b3IoaGFja1NlcnZpY2U6IEhhY2tTZXJ2aWNlLCBoaEF2YWlsYWJsZTogYm9vbGVhbiwgYmFzZVBhdGg6ID9zdHJpbmcpIHtcbiAgICB0aGlzLl9oYWNrU2VydmljZSA9IGhhY2tTZXJ2aWNlO1xuICAgIHRoaXMuX2hoQXZhaWxhYmxlID0gaGhBdmFpbGFibGU7XG4gICAgdGhpcy5fYmFzZVBhdGggPSBiYXNlUGF0aDtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gIH1cblxuICBhc3luYyBnZXRDb21wbGV0aW9ucyhcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIG9mZnNldDogbnVtYmVyXG4gICk6IFByb21pc2U8QXJyYXk8Q29tcGxldGlvblJlc3VsdD4+IHtcbiAgICBjb25zdCBtYXJrZWRDb250ZW50cyA9IG1hcmtGaWxlRm9yQ29tcGxldGlvbihjb250ZW50cywgb2Zmc2V0KTtcbiAgICBsZXQgY29tcGxldGlvbnMgPSBbXTtcbiAgICBjb25zdCBjb21wbGV0aW9uc1Jlc3VsdCA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldENvbXBsZXRpb25zKGZpbGVQYXRoLCBtYXJrZWRDb250ZW50cyk7XG4gICAgaWYgKGNvbXBsZXRpb25zUmVzdWx0KSB7XG4gICAgICBjb21wbGV0aW9ucyA9IGNvbXBsZXRpb25zUmVzdWx0LmNvbXBsZXRpb25zO1xuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zKTtcbiAgfVxuXG4gIGFzeW5jIGZvcm1hdFNvdXJjZShcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIHN0YXJ0UG9zaXRpb246IG51bWJlcixcbiAgICBlbmRQb3NpdGlvbjogbnVtYmVyLFxuICApOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIGNvbnN0IHBhdGggPSB0aGlzLl9iYXNlUGF0aDtcbiAgICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vIEhhY2sgcHJvdmlkZXIgZm9yIHRoaXMgZmlsZS4nKTtcbiAgICB9XG4gICAgY29uc3QgcmVzcG9uc2UgPVxuICAgICAgYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZm9ybWF0U291cmNlKHBhdGgsIGNvbnRlbnRzLCBzdGFydFBvc2l0aW9uLCBlbmRQb3NpdGlvbik7XG4gICAgaWYgKHJlc3BvbnNlID09IG51bGwpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXJyb3IgZm9ybWF0dGluZyBoYWNrIHNvdXJjZS4nKTtcbiAgICB9IGVsc2UgaWYgKHJlc3BvbnNlLmVycm9yX21lc3NhZ2UgIT09ICcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGZvcm1hdHRpbmcgaGFjayBzb3VyY2U6ICR7cmVzcG9uc2UuZXJyb3JfbWVzc2FnZX1gKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlLnJlc3VsdDtcbiAgfVxuXG4gIGFzeW5jIGhpZ2hsaWdodFNvdXJjZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmU6IG51bWJlcixcbiAgICBjb2w6IG51bWJlcixcbiAgKTogUHJvbWlzZTxBcnJheTxhdG9tJFJhbmdlPj4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0U291cmNlSGlnaGxpZ2h0cyhmaWxlUGF0aCwgY29udGVudHMsIGxpbmUsIGNvbCk7XG4gICAgaWYgKHJlc3BvbnNlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3BvbnNlLnBvc2l0aW9ucy5tYXAoaGFja1JhbmdlVG9BdG9tUmFuZ2UpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGlhZ25vc3RpY3MoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgKTogUHJvbWlzZTxBcnJheTx7bWVzc2FnZTogSGFja0RpYWdub3N0aWM7fT4+IHtcbiAgICBsZXQgZGlhZ25vc3RpY1Jlc3VsdCA9IG51bGw7XG4gICAgdHJ5IHtcbiAgICAgIGRpYWdub3N0aWNSZXN1bHQgPSBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXREaWFnbm9zdGljcyhmaWxlUGF0aCwgY29udGVudHMpO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgZ2V0TG9nZ2VyKCkuZXJyb3IoZXJyKTtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgaWYgKCFkaWFnbm9zdGljUmVzdWx0KSB7XG4gICAgICBnZXRMb2dnZXIoKS5lcnJvcignaGhfY2xpZW50IGNvdWxkIG5vdCBiZSByZWFjaGVkJyk7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGhhY2tEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNSZXN1bHQ7XG4gICAgcmV0dXJuIGhhY2tEaWFnbm9zdGljcy5tZXNzYWdlcztcbiAgfVxuXG4gIGFzeW5jIGdldFR5cGVDb3ZlcmFnZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgKTogUHJvbWlzZTxBcnJheTxUeXBlQ292ZXJhZ2VSZWdpb24+PiB7XG4gICAgY29uc3QgcmVnaW9ucyA9IGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldFR5cGVkUmVnaW9ucyhmaWxlUGF0aCk7XG4gICAgcmV0dXJuIGNvbnZlcnRUeXBlZFJlZ2lvbnNUb0NvdmVyYWdlUmVnaW9ucyhyZWdpb25zKTtcbiAgfVxuXG4gIGdldE91dGxpbmUoXG4gICAgZmlsZVBhdGg6IE51Y2xpZGVVcmksXG4gICAgY29udGVudHM6IHN0cmluZyxcbiAgKTogUHJvbWlzZTw/SGFja091dGxpbmU+IHtcbiAgICByZXR1cm4gdGhpcy5faGFja1NlcnZpY2UuZ2V0T3V0bGluZShmaWxlUGF0aCwgY29udGVudHMpO1xuICB9XG5cbiAgYXN5bmMgZ2V0RGVmaW5pdGlvbihcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBjb2x1bW46IG51bWJlcixcbiAgICBsaW5lVGV4dDogc3RyaW5nXG4gICk6IFByb21pc2U8QXJyYXk8RGVmaW5pdGlvblJlc3VsdD4+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uUmVzdWx0ID0gYXdhaXQgdGhpcy5faGFja1NlcnZpY2UuZ2V0SWRlbnRpZmllckRlZmluaXRpb24oXG4gICAgICBmaWxlUGF0aCwgY29udGVudHMsIGxpbmVOdW1iZXIsIGNvbHVtblxuICAgICk7XG4gICAgY29uc3QgaWRlbnRpZmllclJlc3VsdCA9IHByb2Nlc3NEZWZpbml0aW9uc0ZvclhocChkZWZpbml0aW9uUmVzdWx0LCBjb2x1bW4sIGxpbmVUZXh0KTtcbiAgICByZXR1cm4gaWRlbnRpZmllclJlc3VsdC5sZW5ndGggPT09IDEgPyBpZGVudGlmaWVyUmVzdWx0IDogW107XG4gIH1cblxuICBhc3luYyBnZXRJZGVEZWZpbml0aW9uKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8P0RlZmluaXRpb24+IHtcbiAgICBjb25zdCBkZWZpbml0aW9uID1cbiAgICAgIGF3YWl0IHRoaXMuX2hhY2tTZXJ2aWNlLmdldERlZmluaXRpb24oZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pO1xuICAgIGlmIChkZWZpbml0aW9uID09IG51bGwgfHwgZGVmaW5pdGlvbi5kZWZpbml0aW9uX3BvcyA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIG5hbWU6IGRlZmluaXRpb24ubmFtZSxcbiAgICAgIHBhdGg6IGRlZmluaXRpb24uZGVmaW5pdGlvbl9wb3MuZmlsZW5hbWUsXG4gICAgICBsaW5lOiBkZWZpbml0aW9uLmRlZmluaXRpb25fcG9zLmxpbmUsXG4gICAgICBjb2x1bW46IGRlZmluaXRpb24uZGVmaW5pdGlvbl9wb3MuY2hhcl9zdGFydCxcbiAgICAgIHF1ZXJ5UmFuZ2U6IGhhY2tSYW5nZVRvQXRvbVJhbmdlKGRlZmluaXRpb24ucG9zKSxcbiAgICB9O1xuICB9XG5cbiAgYXN5bmMgZ2V0VHlwZShcbiAgICBmaWxlUGF0aDogTnVjbGlkZVVyaSxcbiAgICBjb250ZW50czogc3RyaW5nLFxuICAgIGV4cHJlc3Npb246IHN0cmluZyxcbiAgICBsaW5lTnVtYmVyOiBudW1iZXIsXG4gICAgY29sdW1uOiBudW1iZXIsXG4gICk6IFByb21pc2U8P3N0cmluZz4ge1xuICAgIGlmICghZXhwcmVzc2lvbi5zdGFydHNXaXRoKCckJykpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXRUeXBlQXRQb3MoZmlsZVBhdGgsIGNvbnRlbnRzLCBsaW5lTnVtYmVyLCBjb2x1bW4pO1xuICAgIHJldHVybiByZXN1bHQgPT0gbnVsbCA/IG51bGwgOiByZXN1bHQudHlwZTtcbiAgfVxuXG4gIGFzeW5jIGZpbmRSZWZlcmVuY2VzKFxuICAgIGZpbGVQYXRoOiBOdWNsaWRlVXJpLFxuICAgIGNvbnRlbnRzOiBzdHJpbmcsXG4gICAgbGluZTogbnVtYmVyLFxuICAgIGNvbHVtbjogbnVtYmVyXG4gICk6IFByb21pc2U8P3tiYXNlVXJpOiBzdHJpbmc7IHN5bWJvbE5hbWU6IHN0cmluZzsgcmVmZXJlbmNlczogQXJyYXk8SGFja1JlZmVyZW5jZT59PiB7XG4gICAgY29uc3QgZ2V0TWV0aG9kTmFtZVJlc3VsdCA9XG4gICAgICBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXRNZXRob2ROYW1lKGZpbGVQYXRoLCBjb250ZW50cywgbGluZSArIDEsIGNvbHVtbiArIDEpO1xuICAgIGlmIChnZXRNZXRob2ROYW1lUmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCBzeW1ib2xOYW1lID0gZ2V0TWV0aG9kTmFtZVJlc3VsdC5uYW1lO1xuICAgIGNvbnN0IHN5bWJvbFR5cGUgPSBnZXRTeW1ib2xUeXBlKGdldE1ldGhvZE5hbWVSZXN1bHQucmVzdWx0X3R5cGUpO1xuXG4gICAgaWYgKCFTWU1CT0xfVFlQRVNfV0lUSF9SRUZFUkVOQ0VTLmhhcyhzeW1ib2xUeXBlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgY29uc3QgcmVmZXJlbmNlc1Jlc3VsdCA9XG4gICAgICBhd2FpdCB0aGlzLl9oYWNrU2VydmljZS5nZXRSZWZlcmVuY2VzKGZpbGVQYXRoLCBzeW1ib2xOYW1lLCBzeW1ib2xUeXBlKTtcbiAgICBpZiAoIXJlZmVyZW5jZXNSZXN1bHQpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdCB7aGFja1Jvb3QsIHJlZmVyZW5jZXN9ID0gcmVmZXJlbmNlc1Jlc3VsdDtcbiAgICByZXR1cm4ge2Jhc2VVcmk6IGhhY2tSb290LCBzeW1ib2xOYW1lLCByZWZlcmVuY2VzfTtcbiAgfVxuXG4gIGdldEJhc2VQYXRoKCk6ID9zdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9iYXNlUGF0aDtcbiAgfVxuXG4gIGlzSGFja0F2YWlsYWJsZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faGhBdmFpbGFibGU7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFja1JhbmdlVG9BdG9tUmFuZ2UocG9zaXRpb246IEhhY2tSYW5nZSk6IGF0b20kUmFuZ2Uge1xuICByZXR1cm4gbmV3IFJhbmdlKFxuICAgICAgICBbcG9zaXRpb24ubGluZSAtIDEsIHBvc2l0aW9uLmNoYXJfc3RhcnQgLSAxXSxcbiAgICAgICAgW3Bvc2l0aW9uLmxpbmUgLSAxLCBwb3NpdGlvbi5jaGFyX2VuZF0sXG4gICAgICApO1xufVxuXG4vLyBUaGUgeGhwIGNoYXIgcmVnZXggaW5jbHVkZSA6IGFuZCAtIHRvIG1hdGNoIHhocCB0YWdzIGxpa2UgPHVpOmJ1dHRvbi1ncm91cD4uXG5jb25zdCB4aHBDaGFyUmVnZXggPSAvW1xcdzotXS87XG5cbmNvbnN0IHN0cmluZ1RvU3ltYm9sVHlwZSA9IHtcbiAgJ2NsYXNzJzogU3ltYm9sVHlwZS5DTEFTUyxcbiAgJ2Z1bmN0aW9uJzogU3ltYm9sVHlwZS5GVU5DVElPTixcbiAgJ21ldGhvZCc6IFN5bWJvbFR5cGUuTUVUSE9ELFxuICAnbG9jYWwnOiBTeW1ib2xUeXBlLkxPQ0FMLFxufTtcblxuLy8gU3ltYm9sIHR5cGVzIHdlIGNhbiBnZXQgcmVmZXJlbmNlcyBmb3IuXG5jb25zdCBTWU1CT0xfVFlQRVNfV0lUSF9SRUZFUkVOQ0VTID0gbmV3IFNldChbXG4gIFN5bWJvbFR5cGUuQ0xBU1MsXG4gIFN5bWJvbFR5cGUuRlVOQ1RJT04sXG4gIFN5bWJvbFR5cGUuTUVUSE9ELFxuXSk7XG5cbmZ1bmN0aW9uIGdldFN5bWJvbFR5cGUoaW5wdXQ6IHN0cmluZyk6IFN5bWJvbFR5cGVWYWx1ZSB7XG4gIGxldCBzeW1ib2xUeXBlID0gc3RyaW5nVG9TeW1ib2xUeXBlW2lucHV0XTtcbiAgaWYgKHR5cGVvZiBzeW1ib2xUeXBlID09PSAndW5kZWZpbmVkJykge1xuICAgIHN5bWJvbFR5cGUgPSBTeW1ib2xUeXBlLk1FVEhPRDtcbiAgfVxuICByZXR1cm4gc3ltYm9sVHlwZTtcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc0NvbXBsZXRpb25zKGNvbXBsZXRpb25zUmVzcG9uc2U6IEFycmF5PEhhY2tDb21wbGV0aW9uPik6XG4gICAgQXJyYXk8Q29tcGxldGlvblJlc3VsdD4ge1xuICByZXR1cm4gY29tcGxldGlvbnNSZXNwb25zZS5tYXAoY29tcGxldGlvbiA9PiB7XG4gICAgY29uc3Qge25hbWUsIGZ1bmNfZGV0YWlsczogZnVuY3Rpb25EZXRhaWxzfSA9IGNvbXBsZXRpb247XG4gICAgbGV0IHt0eXBlfSA9IGNvbXBsZXRpb247XG4gICAgaWYgKHR5cGUgJiYgdHlwZS5pbmRleE9mKCcoJykgPT09IDAgJiYgdHlwZS5sYXN0SW5kZXhPZignKScpID09PSB0eXBlLmxlbmd0aCAtIDEpIHtcbiAgICAgIHR5cGUgPSB0eXBlLnN1YnN0cmluZygxLCB0eXBlLmxlbmd0aCAtIDEpO1xuICAgIH1cbiAgICBsZXQgbWF0Y2hTbmlwcGV0ID0gbmFtZTtcbiAgICBpZiAoZnVuY3Rpb25EZXRhaWxzKSB7XG4gICAgICBjb25zdCB7cGFyYW1zfSA9IGZ1bmN0aW9uRGV0YWlscztcbiAgICAgIC8vIENvbnN0cnVjdCB0aGUgc25pcHBldDogZS5nLiBteUZ1bmN0aW9uKCR7MTokYXJnMX0sICR7MjokYXJnMn0pO1xuICAgICAgY29uc3QgcGFyYW1zU3RyaW5nID0gcGFyYW1zLm1hcChcbiAgICAgICAgKHBhcmFtLCBpbmRleCkgPT4gJyR7JyArIChpbmRleCArIDEpICsgJzonICsgcGFyYW0ubmFtZSArICd9Jykuam9pbignLCAnKTtcbiAgICAgIG1hdGNoU25pcHBldCA9IG5hbWUgKyAnKCcgKyBwYXJhbXNTdHJpbmcgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBtYXRjaFNuaXBwZXQsXG4gICAgICBtYXRjaFRleHQ6IG5hbWUsXG4gICAgICBtYXRjaFR5cGU6IHR5cGUsXG4gICAgfTtcbiAgfSk7XG59XG5cbi8vIENhbGN1bGF0ZSB0aGUgb2Zmc2V0IG9mIHRoZSBjdXJzb3IgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSBmaWxlLlxuLy8gVGhlbiBpbnNlcnQgQVVUTzMzMiBpbiBhdCB0aGlzIG9mZnNldC4gKEhhY2sgdXNlcyB0aGlzIGFzIGEgbWFya2VyLilcbmZ1bmN0aW9uIG1hcmtGaWxlRm9yQ29tcGxldGlvbihjb250ZW50czogc3RyaW5nLCBvZmZzZXQ6IG51bWJlcik6IHN0cmluZyB7XG4gIHJldHVybiBjb250ZW50cy5zdWJzdHJpbmcoMCwgb2Zmc2V0KSArXG4gICAgICAnQVVUTzMzMicgKyBjb250ZW50cy5zdWJzdHJpbmcob2Zmc2V0LCBjb250ZW50cy5sZW5ndGgpO1xufVxuXG5mdW5jdGlvbiBwcm9jZXNzRGVmaW5pdGlvbnNGb3JYaHAoXG4gIGRlZmluaXRpb25SZXN1bHQ6ID9IYWNrRGVmaW5pdGlvblJlc3VsdCxcbiAgY29sdW1uOiBudW1iZXIsXG4gIGxpbmVUZXh0OiBzdHJpbmcsXG4pOiBBcnJheTxEZWZpbml0aW9uUmVzdWx0PiB7XG4gIGlmICghZGVmaW5pdGlvblJlc3VsdCkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuICBjb25zdCB7ZGVmaW5pdGlvbnN9ID0gZGVmaW5pdGlvblJlc3VsdDtcbiAgcmV0dXJuIGRlZmluaXRpb25zLm1hcCgoZGVmaW5pdGlvbjogSGFja1NlYXJjaFBvc2l0aW9uKSA9PiB7XG4gICAgbGV0IHtuYW1lfSA9IGRlZmluaXRpb247XG4gICAgaWYgKG5hbWUuc3RhcnRzV2l0aCgnOicpKSB7XG4gICAgICAvLyBYSFAgY2xhc3MgbmFtZSwgdXNhZ2VzIG9taXQgdGhlIGxlYWRpbmcgJzonLlxuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKDEpO1xuICAgIH1cbiAgICBjb25zdCBkZWZpbml0aW9uSW5kZXggPSBsaW5lVGV4dC5pbmRleE9mKG5hbWUpO1xuICAgIGlmIChcbiAgICAgIGRlZmluaXRpb25JbmRleCA9PT0gLTEgfHxcbiAgICAgIGRlZmluaXRpb25JbmRleCA+PSBjb2x1bW4gfHxcbiAgICAgICF4aHBDaGFyUmVnZXgudGVzdChsaW5lVGV4dC5zdWJzdHJpbmcoZGVmaW5pdGlvbkluZGV4LCBjb2x1bW4pKVxuICAgICkge1xuICAgICAgcmV0dXJuIHsgLi4uZGVmaW5pdGlvbiB9O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAuLi5kZWZpbml0aW9uLFxuICAgICAgICBzZWFyY2hTdGFydENvbHVtbjogZGVmaW5pdGlvbkluZGV4LFxuICAgICAgICBzZWFyY2hFbmRDb2x1bW46IGRlZmluaXRpb25JbmRleCArIGRlZmluaXRpb24ubmFtZS5sZW5ndGgsXG4gICAgICB9O1xuICAgIH1cbiAgfSk7XG59XG4iXX0=