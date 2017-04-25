'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initialize = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

/* LanguageService related type imports */
let initialize = exports.initialize = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (fileNotifier) {
    return new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).ServerLanguageService(fileNotifier, new GraphQLLanguageAnalyzer(fileNotifier));
  });

  return function initialize(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       */

var _DiagnosticsHelper;

function _load_DiagnosticsHelper() {
  return _DiagnosticsHelper = require('./DiagnosticsHelper');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _GraphQLProcess;

function _load_GraphQLProcess() {
  return _GraphQLProcess = require('./GraphQLProcess');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class GraphQLLanguageAnalyzer {

  constructor(fileNotifier) {
    if (!(fileNotifier instanceof (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileCache)) {
      throw new Error('Invariant violation: "fileNotifier instanceof FileCache"');
    }

    this._fileCache = fileNotifier;
  }

  getDiagnostics(filePath, buffer) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('GraphQLLanguageAnalyzer.getDiagnostics', (0, _asyncToGenerator.default)(function* () {
        const graphQLProcess = yield (0, (_GraphQLProcess || _load_GraphQLProcess()).getGraphQLProcess)(_this._fileCache, filePath);
        if (!graphQLProcess) {
          return null;
        }

        const result = yield graphQLProcess.getDiagnostics(buffer.getText(), filePath);
        return (0, (_DiagnosticsHelper || _load_DiagnosticsHelper()).convertDiagnostics)(result);
      }));
    })();
  }

  /**
   * Returns the root of .graphqlrc file.
   */
  getProjectRoot(fileUri) {
    return (0, (_config || _load_config()).findGraphQLConfigDir)(fileUri);
  }

  observeDiagnostics() {
    throw new Error('Not implemented');
  }

  getAutocompleteSuggestions(filePath, buffer, position, activatedManually) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('GraphQLLanguageAnalyzer.getAutocompleteSuggestions', (0, _asyncToGenerator.default)(function* () {
        const graphQLProcess = yield (0, (_GraphQLProcess || _load_GraphQLProcess()).getGraphQLProcess)(_this2._fileCache, filePath);

        if (!graphQLProcess) {
          return { isIncomplete: false, items: [] };
        }

        const result = yield graphQLProcess.getAutocompleteSuggestions(buffer.getText(), position, filePath);

        const items = result.map(function (completion) {
          return {
            text: completion.text,
            description: completion.description || null,
            iconHTML: '<i class="icon-nuclicon-graphql"></i>',
            leftLabelHTML: completion.typeName ? `<span style="color: #E10098;">${completion.typeName}</span>` : null
          };
        });
        return {
          isIncomplete: false,
          items
        };
      }));
    })();
  }

  getDefinition(filePath, buffer, position) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('GraphQLLanguageAnalyzer.getDefinition', (0, _asyncToGenerator.default)(function* () {
        const graphQLProcess = yield (0, (_GraphQLProcess || _load_GraphQLProcess()).getGraphQLProcess)(_this3._fileCache, filePath);
        if (!graphQLProcess || !position) {
          (_config || _load_config()).logger.logError('no GraphQLProcess or position during getDefinition');
          return null;
        }
        return graphQLProcess.getDefinition(buffer.getText(), position, filePath);
      }));
    })();
  }

  getDefinitionById(file, id) {
    throw new Error('Not implemented');
  }

  findReferences(filePath, buffer, position) {
    throw new Error('Not implemented');
  }

  getCoverage(filePath) {
    throw new Error('Not implemented');
  }

  getOutline(filePath, buffer) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_nuclideAnalytics || _load_nuclideAnalytics()).trackTiming)('GraphQLLanguageAnalyzer.getOutline', (0, _asyncToGenerator.default)(function* () {
        const graphQLProcess = yield (0, (_GraphQLProcess || _load_GraphQLProcess()).getGraphQLProcess)(_this4._fileCache, filePath);
        if (!graphQLProcess) {
          (_config || _load_config()).logger.logError('no GraphQLProcess during getOutline');
          return null;
        }

        return (yield graphQLProcess.getService()).getOutline(buffer.getText());
      }));
    })();
  }

  typeHint(filePath, buffer, position) {
    throw new Error('Not implemented');
  }

  highlight(filePath, buffer, position) {
    throw new Error('Not implemented');
  }

  formatSource(filePath, buffer, range) {
    throw new Error('Not implemented');
  }

  formatEntireFile(filePath, buffer, range) {
    throw new Error('Not implemented');
  }

  getEvaluationExpression(filePath, buffer, position) {
    throw new Error('Not implemented');
  }

  isFileInProject(fileUri) {
    throw new Error('Not implemented');
  }

  dispose() {}
}