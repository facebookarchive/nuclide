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

var getHackLanguageForUri = _asyncToGenerator(function* (uri) {
  return yield connectionToHackLanguage.getForUri(uri);
});

exports.getHackLanguageForUri = getHackLanguageForUri;
exports.clearHackLanguageCache = clearHackLanguageCache;

var getHackServiceByNuclideUri = _asyncToGenerator(function* (fileUri) {
  var language = yield getHackLanguageForUri(fileUri);
  if (language == null) {
    return null;
  }
  return language.getLanguageService();
});

exports.getHackServiceByNuclideUri = getHackServiceByNuclideUri;

var isFileInHackProject = _asyncToGenerator(function* (fileUri) {
  var language = yield getHackLanguageForUri(fileUri);
  if (language == null) {
    return false;
  }
  return yield language.isFileInHackProject(fileUri);
});

exports.isFileInHackProject = isFileInHackProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

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

var _config2;

function _config() {
  return _config2 = require('./config');
}

/**
 * Serves language requests from HackService.
 * Note that all line/column values are 1 based.
 */

var HackLanguage = (function () {

  /**
   * `basePath` should be the directory where the .hhconfig file is located.
   */

  function HackLanguage(hackService) {
    _classCallCheck(this, HackLanguage);

    this._hackService = hackService;
  }

  _createClass(HackLanguage, [{
    key: 'dispose',
    value: function dispose() {}
  }, {
    key: 'getLanguageService',
    value: function getLanguageService() {
      return this._hackService;
    }
  }, {
    key: 'getProjectRoot',
    value: function getProjectRoot(filePath) {
      return this._hackService.getProjectRoot(filePath);
    }
  }, {
    key: 'isFileInHackProject',
    value: function isFileInHackProject(fileUri) {
      return this._hackService.isFileInHackProject(fileUri);
    }
  }, {
    key: 'getCompletions',
    value: _asyncToGenerator(function* (filePath, contents, offset, line, column) {
      var completions = yield this._hackService.getCompletions(filePath, contents, offset, line, column);
      if (completions == null) {
        return [];
      }
      return processCompletions(completions, contents, offset);
    })
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (filePath, contents, startPosition, endPosition) {
      var response = yield this._hackService.formatSource(filePath, contents, startPosition, endPosition);
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
      return response.map(hackRangeToAtomRange);
    })
  }, {
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (filePath, contents) {
      try {
        var result = yield this._hackService.getDiagnostics(filePath, contents);
        if (result == null) {
          (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('hh_client could not be reached');
          return [];
        }
        return result;
      } catch (err) {
        (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(err);
        return [];
      }
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
          projectRoot: def.projectRoot,
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
    key: 'getDefinitionById',
    value: function getDefinitionById(filePath, id) {
      return this._hackService.getDefinitionById(filePath, id);
    }
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
      var references = yield this._hackService.findReferences(filePath, contents, line, column);
      if (references == null || references.length === 0) {
        return null;
      }
      return { baseUri: references[0].projectRoot, symbolName: references[0].name, references: references };
    })
  }]);

  return HackLanguage;
})();

exports.HackLanguage = HackLanguage;

function hackRangeToAtomRange(position) {
  return new (_atom2 || _atom()).Range([position.line - 1, position.char_start - 1], [position.line - 1, position.char_end]);
}

function matchTypeOfType(type) {
  // strip parens if present
  if (type[0] === '(' && type[type.length - 1] === ')') {
    return type.substring(1, type.length - 1);
  }
  return type;
}

function escapeName(name) {
  return name.replace(/\\/g, '\\\\');
}

function paramSignature(params) {
  var paramStrings = params.map(function (param) {
    return param.type + ' ' + param.name;
  });
  return '(' + paramStrings.join(', ') + ')';
}

function matchSnippet(name, params) {
  var escapedName = escapeName(name);
  if (params != null) {
    // Construct the snippet: e.g. myFunction(${1:$arg1}, ${2:$arg2});
    var paramsString = params.map(function (param, index) {
      return '${' + (index + 1) + ':' + param.name + '}';
    }).join(', ');
    return escapedName + '(' + paramsString + ')';
  } else {
    return escapedName;
  }
}

// Returns the length of the largest match between a suffix of contents
// and a prefix of match.
function matchLength(contents, match) {
  for (var i = match.length; i > 0; i--) {
    var toMatch = match.substring(0, i);
    if (contents.endsWith(toMatch)) {
      return i;
    }
  }
  return 0;
}

function processCompletions(completionsResponse, contents, offset) {
  var contentsLine = contents.substring(contents.lastIndexOf('\n', offset - 1) + 1, offset).toLowerCase();
  return completionsResponse.map(function (completion) {
    var name = completion.name;
    var type = completion.type;
    var func_details = completion.func_details;

    var commonResult = {
      displayText: name,
      replacementPrefix: contents.substring(offset - matchLength(contentsLine, name.toLowerCase()), offset),
      description: matchTypeOfType(type)
    };
    if (func_details != null) {
      return _extends({}, commonResult, {
        snippet: matchSnippet(name, func_details.params),
        leftLabel: func_details.return_type,
        rightLabel: paramSignature(func_details.params),
        type: 'function'
      });
    } else {
      return _extends({}, commonResult, {
        snippet: matchSnippet(name),
        rightLabel: matchTypeOfType(type)
      });
    }
  });
}

var HACK_SERVICE_NAME = 'HackService';

var connectionToHackLanguage = new (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).ConnectionCache(_asyncToGenerator(function* (connection) {
  var hackService = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByConnection)(HACK_SERVICE_NAME, connection);
  var config = (0, (_config2 || _config()).getConfig)();
  var useIdeConnection = config.useIdeConnection;
  // TODO:     || (await passesGK('nuclide_hack_use_persistent_connection'));
  var languageService = yield hackService.initialize(config.hhClientPath, useIdeConnection, config.logLevel);

  return new HackLanguage(languageService);
}));

function clearHackLanguageCache() {
  connectionToHackLanguage.dispose();
}

// Range in the input where the symbol reference occurs.