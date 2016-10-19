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

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var initialize = _asyncToGenerator(function* (hackCommand, useIdeConnection, logLevel, fileNotifier) {
  (0, (_hackConfig || _load_hackConfig()).setHackCommand)(hackCommand);
  (_hackConfig || _load_hackConfig()).logger.setLogLevel(logLevel);
  yield (0, (_hackConfig || _load_hackConfig()).getHackCommand)();
  return new HackLanguageServiceImpl(useIdeConnection, fileNotifier);
});

exports.initialize = initialize;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeRange;

function _load_commonsNodeRange() {
  return _commonsNodeRange = require('../../commons-node/range');
}

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _commonsNodePromise;

function _load_commonsNodePromise() {
  return _commonsNodePromise = require('../../commons-node/promise');
}

var _HackHelpers;

function _load_HackHelpers() {
  return _HackHelpers = require('./HackHelpers');
}

var _hackConfig;

function _load_hackConfig() {
  return _hackConfig = require('./hack-config');
}

var _HackProcess;

function _load_HackProcess() {
  return _HackProcess = require('./HackProcess');
}

var _Definitions;

function _load_Definitions() {
  return _Definitions = require('./Definitions');
}

var _HackHelpers2;

function _load_HackHelpers2() {
  return _HackHelpers2 = require('./HackHelpers');
}

var _OutlineView;

function _load_OutlineView() {
  return _OutlineView = require('./OutlineView');
}

var _TypedRegions;

function _load_TypedRegions() {
  return _TypedRegions = require('./TypedRegions');
}

var _FindReferences;

function _load_FindReferences() {
  return _FindReferences = require('./FindReferences');
}

var _Completions;

function _load_Completions() {
  return _Completions = require('./Completions');
}

var _Diagnostics;

function _load_Diagnostics() {
  return _Diagnostics = require('./Diagnostics');
}

var _SymbolSearch;

function _load_SymbolSearch() {
  return _SymbolSearch = require('./SymbolSearch');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _EvaluationExpression;

function _load_EvaluationExpression() {
  return _EvaluationExpression = require('./EvaluationExpression');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var HH_DIAGNOSTICS_DELAY_MS = 600;
var HH_CLIENT_MAX_TRIES = 10;

var HackLanguageServiceImpl = (function (_ServerLanguageService) {
  _inherits(HackLanguageServiceImpl, _ServerLanguageService);

  function HackLanguageServiceImpl(useIdeConnection, fileNotifier) {
    _classCallCheck(this, HackLanguageServiceImpl);

    _get(Object.getPrototypeOf(HackLanguageServiceImpl.prototype), 'constructor', this).call(this, fileNotifier, new HackLanguageAnalyzer(useIdeConnection, fileNotifier));
    this._useIdeConnection = useIdeConnection;
  }

  _createClass(HackLanguageServiceImpl, [{
    key: 'getAutocompleteSuggestions',
    value: _asyncToGenerator(function* (fileVersion, position, activatedManually) {
      if (this._useIdeConnection) {
        var _process = yield (0, (_HackProcess || _load_HackProcess()).getHackProcess)(this._fileCache, fileVersion.filePath);
        if (_process == null) {
          return [];
        } else {
          return _process.getAutocompleteSuggestions(fileVersion, position, activatedManually);
        }
      } else {
        // Babel workaround: w/o the es2015-classes transform, async functions can't call `super`.
        // https://github.com/babel/babel/issues/3930
        return (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService.prototype.getAutocompleteSuggestions.call(this, fileVersion, position, activatedManually);
      }
    })

    /**
     * Performs a Hack symbol search in the specified directory.
     */
  }, {
    key: 'executeQuery',
    value: function executeQuery(rootDirectory, queryString) {
      return (0, (_SymbolSearch || _load_SymbolSearch()).executeQuery)(rootDirectory, queryString);
    }
  }]);

  return HackLanguageServiceImpl;
})((_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService);

var HackLanguageAnalyzer = (function () {
  function HackLanguageAnalyzer(useIdeConnection, fileNotifier) {
    _classCallCheck(this, HackLanguageAnalyzer);

    this._useIdeConnection = useIdeConnection;
    (0, (_assert || _load_assert()).default)(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache);
    this._fileCache = fileNotifier;
  }

  _createClass(HackLanguageAnalyzer, [{
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (filePath, buffer) {
      var hhResult = yield (0, (_commonsNodePromise || _load_commonsNodePromise()).retryLimit)(function () {
        return (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
        /* args */[],
        /* errorStream */true,
        /* processInput */null,
        /* file */filePath);
      }, function (result) {
        return result != null;
      }, HH_CLIENT_MAX_TRIES, HH_DIAGNOSTICS_DELAY_MS);
      if (!hhResult) {
        return null;
      }

      return (0, (_Diagnostics || _load_Diagnostics()).convertDiagnostics)(hhResult);
    })
  }, {
    key: 'observeDiagnostics',
    value: function observeDiagnostics() {
      (_hackConfig || _load_hackConfig()).logger.logTrace('observeDiagnostics');
      (0, (_assert || _load_assert()).default)(this._useIdeConnection);
      return (0, (_HackProcess || _load_HackProcess()).observeConnections)(this._fileCache).mergeMap(function (connection) {
        (_hackConfig || _load_hackConfig()).logger.logTrace('notifyDiagnostics');
        return connection.notifyDiagnostics().refCount().map(function (diagnostics) {
          return {
            filePath: diagnostics.filename,
            messages: diagnostics.errors.map(function (diagnostic) {
              return (0, (_Diagnostics || _load_Diagnostics()).hackMessageToDiagnosticMessage)(diagnostic.message);
            })
          };
        });
      });
    }
  }, {
    key: 'getAutocompleteSuggestions',
    value: _asyncToGenerator(function* (filePath, buffer, position, activatedManually) {
      var contents = buffer.getText();
      var offset = buffer.characterIndexForPosition(position);

      var replacementPrefix = (0, (_Completions || _load_Completions()).findHackPrefix)(buffer, position);
      if (replacementPrefix === '' && !(0, (_Completions || _load_Completions()).hasPrefix)(buffer, position)) {
        return [];
      }

      var markedContents = markFileForCompletion(contents, offset);
      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--auto-complete'],
      /* errorStream */false,
      /* processInput */markedContents,
      /* file */filePath);
      return (0, (_Completions || _load_Completions()).convertCompletions)(contents, offset, replacementPrefix, result);
    })
  }, {
    key: 'getDefinition',
    value: _asyncToGenerator(function* (filePath, buffer, position) {
      var contents = buffer.getText();

      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-get-definition', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* cwd */filePath);
      if (result == null) {
        return null;
      }
      var projectRoot = result.hackRoot;
      (0, (_assert || _load_assert()).default)(typeof projectRoot === 'string');

      var hackDefinitions = Array.isArray(result) ? result : [result];
      return (0, (_Definitions || _load_Definitions()).convertDefinitions)(hackDefinitions, filePath, projectRoot);
    })
  }, {
    key: 'getDefinitionById',
    value: _asyncToGenerator(function* (file, id) {
      var definition = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--get-definition-by-id', id],
      /* errorStream */false,
      /* processInput */null,
      /* cwd */file);
      if (definition == null) {
        return null;
      }

      var result = {
        path: definition.position.filename,
        position: (0, (_HackHelpers2 || _load_HackHelpers2()).atomPointOfHackRangeStart)(definition.position),
        name: definition.name,
        language: 'php',
        // TODO: range
        projectRoot: definition.hackRoot
      };
      if (typeof definition.id === 'string') {
        return _extends({}, result, {
          id: definition.id
        });
      } else {
        return result;
      }
    })
  }, {
    key: 'findReferences',
    value: _asyncToGenerator(function* (filePath, buffer, position) {
      var contents = buffer.getText();

      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-find-refs', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* cwd */filePath);
      if (result == null || result.length === 0) {
        return { type: 'error', message: 'No references found.' };
      }

      var projectRoot = result.hackRoot;

      return (0, (_FindReferences || _load_FindReferences()).convertReferences)(result, projectRoot);
    })
  }, {
    key: 'getCoverage',
    value: _asyncToGenerator(function* (filePath) {
      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--colour', filePath],
      /* errorStream */false,
      /* processInput */null,
      /* file */filePath);

      return (0, (_TypedRegions || _load_TypedRegions()).convertCoverage)(filePath, result);
    })
  }, {
    key: 'getOutline',
    value: _asyncToGenerator(function* (filePath, buffer) {
      var contents = buffer.getText();

      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-outline'],
      /* errorStream */false,
      /* processInput */contents, filePath);
      if (result == null) {
        return null;
      }

      return (0, (_OutlineView || _load_OutlineView()).outlineFromHackIdeOutline)(result);
    })
  }, {
    key: 'typeHint',
    value: _asyncToGenerator(function* (filePath, buffer, position) {
      var contents = buffer.getText();

      var match = getIdentifierAndRange(buffer, position);
      if (match == null) {
        return null;
      }

      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--type-at-pos', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);

      if (result == null || result.type == null || result.type === '_') {
        return null;
      } else {
        return {
          hint: result.type,
          // TODO: Use hack range for type hints, not nuclide range.
          range: match.range
        };
      }
    })
  }, {
    key: 'highlight',
    value: _asyncToGenerator(function* (filePath, buffer, position) {
      var contents = buffer.getText();

      var id = getIdentifierAtPosition(buffer, position);
      if (id == null) {
        return [];
      }

      var result = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--ide-highlight-refs', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);
      return result == null ? [] : result.map((_HackHelpers2 || _load_HackHelpers2()).hackRangeToAtomRange);
    })
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (filePath, buffer, range) {
      var contents = buffer.getText();
      var startOffset = buffer.characterIndexForPosition(range.start) + 1;
      var endOffset = buffer.characterIndexForPosition(range.end) + 1;

      var response = yield (0, (_HackHelpers || _load_HackHelpers()).callHHClient)(
      /* args */['--format', startOffset, endOffset],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);

      if (response == null) {
        throw new Error('Error formatting hack source.');
      } else if (response.internal_error) {
        throw new Error('Internal error formatting hack source.');
      } else if (response.error_message !== '') {
        throw new Error('Error formatting hack source: ' + response.error_message);
      }
      return response.result;
    })
  }, {
    key: 'getEvaluationExpression',
    value: _asyncToGenerator(function* (filePath, buffer, position) {
      return (0, (_EvaluationExpression || _load_EvaluationExpression()).getEvaluationExpression)(filePath, buffer, position);
    })
  }, {
    key: 'getProjectRoot',
    value: function getProjectRoot(fileUri) {
      return (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(fileUri);
    }

    /**
     * @param fileUri a file path.  It cannot be a directory.
     * @return whether the file represented by fileUri is inside of a Hack project.
     */
  }, {
    key: 'isFileInProject',
    value: _asyncToGenerator(function* (fileUri) {
      var hhconfigPath = yield (0, (_hackConfig || _load_hackConfig()).findHackConfigDir)(fileUri);
      return hhconfigPath != null;
    })
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return HackLanguageAnalyzer;
})();

function formatAtomLineColumn(position) {
  return formatLineColumn(position.row + 1, position.column + 1);
}

function formatLineColumn(line, column) {
  return line + ':' + column;
}

// Calculate the offset of the cursor from the beginning of the file.
// Then insert AUTO332 in at this offset. (Hack uses this as a marker.)
function markFileForCompletion(contents, offset) {
  return contents.substring(0, offset) + 'AUTO332' + contents.substring(offset, contents.length);
}

function getIdentifierAndRange(buffer, position) {
  var matchData = (0, (_commonsNodeRange || _load_commonsNodeRange()).wordAtPositionFromBuffer)(buffer, position, (_HackHelpers || _load_HackHelpers()).HACK_WORD_REGEX);
  return matchData == null || matchData.wordMatch.length === 0 ? null : { id: matchData.wordMatch[0], range: matchData.range };
}

function getIdentifierAtPosition(buffer, position) {
  var result = getIdentifierAndRange(buffer, position);
  return result == null ? null : result.id;
}