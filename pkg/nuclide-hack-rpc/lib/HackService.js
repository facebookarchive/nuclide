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

var initialize = _asyncToGenerator(function* (hackCommand, useIdeConnection, logLevel, fileNotifier) {
  (0, (_hackConfig2 || _hackConfig()).setHackCommand)(hackCommand);
  (0, (_hackConfig2 || _hackConfig()).setUseIdeConnection)(useIdeConnection);
  (_hackConfig4 || _hackConfig3()).logger.setLogLevel(logLevel);
  yield (0, (_hackConfig2 || _hackConfig()).getHackCommand)();
  return new HackLanguageService(fileNotifier);
});

exports.initialize = initialize;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeRange2;

function _commonsNodeRange() {
  return _commonsNodeRange2 = require('../../commons-node/range');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _commonsNodePromise2;

function _commonsNodePromise() {
  return _commonsNodePromise2 = require('../../commons-node/promise');
}

var _HackHelpers2;

function _HackHelpers() {
  return _HackHelpers2 = require('./HackHelpers');
}

var _hackConfig2;

function _hackConfig() {
  return _hackConfig2 = require('./hack-config');
}

var _hackConfig4;

function _hackConfig3() {
  return _hackConfig4 = require('./hack-config');
}

var _HackProcess2;

function _HackProcess() {
  return _HackProcess2 = require('./HackProcess');
}

var _nuclideOpenFilesRpc2;

function _nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc2 = require('../../nuclide-open-files-rpc');
}

var _Definitions2;

function _Definitions() {
  return _Definitions2 = require('./Definitions');
}

var _HackHelpers4;

function _HackHelpers3() {
  return _HackHelpers4 = require('./HackHelpers');
}

var _OutlineView2;

function _OutlineView() {
  return _OutlineView2 = require('./OutlineView');
}

var _TypedRegions2;

function _TypedRegions() {
  return _TypedRegions2 = require('./TypedRegions');
}

var _FindReferences2;

function _FindReferences() {
  return _FindReferences2 = require('./FindReferences');
}

var _Completions2;

function _Completions() {
  return _Completions2 = require('./Completions');
}

var _Diagnostics2;

function _Diagnostics() {
  return _Diagnostics2 = require('./Diagnostics');
}

var _SymbolSearch2;

function _SymbolSearch() {
  return _SymbolSearch2 = require('./SymbolSearch');
}

var HH_DIAGNOSTICS_DELAY_MS = 600;
var HH_CLIENT_MAX_TRIES = 10;

var HackLanguageService = (function () {
  function HackLanguageService(fileNotifier) {
    _classCallCheck(this, HackLanguageService);

    this._fileNotifier = fileNotifier;
  }

  _createClass(HackLanguageService, [{
    key: 'getDiagnostics',
    value: _asyncToGenerator(function* (fileVersion) {
      var filePath = fileVersion.filePath;

      var hhResult = yield (0, (_commonsNodePromise2 || _commonsNodePromise()).retryLimit)(function () {
        return (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
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

      return (0, (_Diagnostics2 || _Diagnostics()).convertDiagnostics)(hhResult);
    })
  }, {
    key: 'getAutocompleteSuggestions',
    value: _asyncToGenerator(function* (fileVersion, position, activatedManually) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();
      var offset = buffer.characterIndexForPosition(position);

      var replacementPrefix = (0, (_Completions2 || _Completions()).findHackPrefix)(buffer, position);
      if (replacementPrefix === '' && !(0, (_Completions2 || _Completions()).hasPrefix)(buffer, position)) {
        return [];
      }

      if ((0, (_hackConfig4 || _hackConfig3()).getUseIdeConnection)()) {
        var _line = position.row + 1;
        var _column = position.column + 1;
        (_hackConfig4 || _hackConfig3()).logger.logTrace('Attempting Hack Autocomplete: ' + filePath + ', ' + position.toString());
        var service = yield (0, (_HackProcess2 || _HackProcess()).getHackConnectionService)(filePath);
        if (service == null) {
          return [];
        }

        (_hackConfig4 || _hackConfig3()).logger.logTrace('Got Hack Service');
        // The file notifications are a placeholder until we get
        // full file synchronization implemented.
        yield service.didOpenFile(filePath);
        try {
          var VERSION_PLACEHOLDER = 1;
          yield service.didChangeFile(filePath, VERSION_PLACEHOLDER, [{ text: contents }]);
          return (0, (_Completions2 || _Completions()).convertCompletions)(contents, offset, replacementPrefix, (yield service.getCompletions(filePath, { line: _line, column: _column })));
        } finally {
          yield service.didCloseFile(filePath);
        }
      } else {
        var markedContents = markFileForCompletion(contents, offset);
        var _result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
        /* args */['--auto-complete'],
        /* errorStream */false,
        /* processInput */markedContents,
        /* file */filePath);
        return (0, (_Completions2 || _Completions()).convertCompletions)(contents, offset, replacementPrefix, _result);
      }
    })
  }, {
    key: 'getDefinition',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();

      var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--ide-get-definition', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* cwd */filePath);
      if (result == null) {
        return null;
      }
      var projectRoot = result.hackRoot;
      (0, (_assert2 || _assert()).default)(typeof projectRoot === 'string');

      var hackDefinitions = Array.isArray(result) ? result : [result];
      return (0, (_Definitions2 || _Definitions()).convertDefinitions)(hackDefinitions, filePath, projectRoot);
    })
  }, {
    key: 'getDefinitionById',
    value: _asyncToGenerator(function* (file, id) {
      var definition = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--get-definition-by-id', id],
      /* errorStream */false,
      /* processInput */null,
      /* cwd */file);
      if (definition == null) {
        return null;
      }

      var result = {
        path: definition.position.filename,
        position: (0, (_HackHelpers4 || _HackHelpers3()).atomPointOfHackRangeStart)(definition.position),
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
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();

      var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--ide-find-refs', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* cwd */filePath);
      if (result == null || result.length === 0) {
        return { type: 'error', message: 'No references found.' };
      }

      var projectRoot = result.hackRoot;

      return (0, (_FindReferences2 || _FindReferences()).convertReferences)(result, projectRoot);
    })

    /**
     * Performs a Hack symbol search in the specified directory.
     */
  }, {
    key: 'executeQuery',
    value: function executeQuery(rootDirectory, queryString) {
      return (0, (_SymbolSearch2 || _SymbolSearch()).executeQuery)(rootDirectory, queryString);
    }
  }, {
    key: 'getCoverage',
    value: _asyncToGenerator(function* (filePath) {
      var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--colour', filePath],
      /* errorStream */false,
      /* processInput */null,
      /* file */filePath);

      return (0, (_TypedRegions2 || _TypedRegions()).convertCoverage)(filePath, result);
    })
  }, {
    key: 'getOutline',
    value: _asyncToGenerator(function* (fileVersion) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();

      var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--ide-outline'],
      /* errorStream */false,
      /* processInput */contents, filePath);
      if (result == null) {
        return null;
      }

      return (0, (_OutlineView2 || _OutlineView()).outlineFromHackIdeOutline)(result);
    })
  }, {
    key: 'typeHint',
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();

      var match = getIdentifierAndRange(buffer, position);
      if (match == null) {
        return null;
      }

      var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
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
    value: _asyncToGenerator(function* (fileVersion, position) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();

      var id = getIdentifierAtPosition(buffer, position);
      if (id == null) {
        return [];
      }

      var result = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--ide-highlight-refs', formatAtomLineColumn(position)],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);
      return result == null ? [] : result.map((_HackHelpers4 || _HackHelpers3()).hackRangeToAtomRange);
    })
  }, {
    key: 'formatSource',
    value: _asyncToGenerator(function* (fileVersion, range) {
      var filePath = fileVersion.filePath;
      var buffer = yield (0, (_nuclideOpenFilesRpc2 || _nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      var contents = buffer.getText();
      var startOffset = buffer.characterIndexForPosition(range.start) + 1;
      var endOffset = buffer.characterIndexForPosition(range.end) + 1;

      var response = yield (0, (_HackHelpers2 || _HackHelpers()).callHHClient)(
      /* args */['--format', startOffset, endOffset],
      /* errorStream */false,
      /* processInput */contents,
      /* file */filePath);

      if (response == null) {
        throw new Error('Error formatting hack source.');
      } else if (response.error_message !== '') {
        throw new Error('Error formatting hack source: ' + response.error_message);
      }
      return response.result;
    })
  }, {
    key: 'getProjectRoot',
    value: function getProjectRoot(fileUri) {
      return (0, (_hackConfig2 || _hackConfig()).findHackConfigDir)(fileUri);
    }

    /**
     * @param fileUri a file path.  It cannot be a directory.
     * @return whether the file represented by fileUri is inside of a Hack project.
     */
  }, {
    key: 'isFileInHackProject',
    value: _asyncToGenerator(function* (fileUri) {
      var hhconfigPath = yield (0, (_hackConfig2 || _hackConfig()).findHackConfigDir)(fileUri);
      return hhconfigPath != null;
    })
  }, {
    key: 'dispose',
    value: function dispose() {}
  }]);

  return HackLanguageService;
})();

exports.HackLanguageService = HackLanguageService;

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
  var matchData = (0, (_commonsNodeRange2 || _commonsNodeRange()).wordAtPositionFromBuffer)(buffer, position, (_HackHelpers2 || _HackHelpers()).HACK_WORD_REGEX);
  return matchData == null || matchData.wordMatch.length === 0 ? null : { id: matchData.wordMatch[0], range: matchData.range };
}

function getIdentifierAtPosition(buffer, position) {
  var result = getIdentifierAndRange(buffer, position);
  return result == null ? null : result.id;
}