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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _TypedRegions2;

function _TypedRegions() {
  return _TypedRegions2 = require('./TypedRegions');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

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
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(err);
        return [];
      }
      if (!diagnosticResult) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('hh_client could not be reached');
        return [];
      }
      var hackDiagnostics = diagnosticResult;
      return hackDiagnostics.messages;
    })
  }, {
    key: 'getTypeCoverage',
    value: _asyncToGenerator(function* (filePath) {
      var regions = yield this._hackService.getTypedRegions(filePath);
      return (0, (_TypedRegions2 || _TypedRegions()).convertTypedRegionsToCoverageResult)(regions);
    })
  }, {
    key: 'getIdeOutline',
    value: function getIdeOutline(filePath, contents) {
      return this._hackService.getIdeOutline(filePath, contents);
    }
  }, {
    key: 'getIdeDefinition',
    value: _asyncToGenerator(function* (filePath, contents, lineNumber, column) {
      var definitions = yield this._hackService.getDefinition(filePath, contents, lineNumber, column);
      if (definitions == null) {
        return [];
      }
      function convertDefinition(def) {
        (0, (_assert2 || _assert()).default)(def.definition_pos != null);
        return {
          name: def.name,
          path: def.definition_pos.filename,
          line: def.definition_pos.line,
          column: def.definition_pos.char_start,
          queryRange: hackRangeToAtomRange(def.pos)
        };
      }
      return definitions.filter(function (definition) {
        return definition.definition_pos != null;
      }).map(convertDefinition);
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
      var referencesResult = yield this._hackService.findReferences(filePath, contents, line, column);
      if (!referencesResult) {
        return null;
      }
      var hackRoot = referencesResult.hackRoot;
      var references = referencesResult.references;

      if (references == null || references.length === 0) {
        return null;
      }
      return { baseUri: hackRoot, symbolName: references[0].name, references: references };
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
  return new (_atom2 || _atom()).Range([position.line - 1, position.char_start - 1], [position.line - 1, position.char_end]);
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