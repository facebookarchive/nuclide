'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getConnection = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const [fileNotifier, host] = yield Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getClangdLSPServiceByConnection)(connection);
    const clangdService = yield service.createClangdService({
      fileNotifier,
      host,
      logCategory: 'clangd-language-server',
      logLevel: 'ALL' // TODO pelmers: change to WARN
    });
    if (clangdService) {
      return new ClangdLSPClient(clangdService);
    } else {
      return new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
    }
  });

  return function getConnection(_x) {
    return _ref.apply(this, arguments);
  };
})();

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('nuclide-commons-atom/feature-config'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _libclang;

function _load_libclang() {
  return _libclang = require('../../nuclide-clang/lib/libclang');
}

var _nuclideLanguageService;

function _load_nuclideLanguageService() {
  return _nuclideLanguageService = require('../../nuclide-language-service');
}

var _nuclideLanguageServiceRpc;

function _load_nuclideLanguageServiceRpc() {
  return _nuclideLanguageServiceRpc = require('../../nuclide-language-service-rpc');
}

var _nuclideOpenFiles;

function _load_nuclideOpenFiles() {
  return _nuclideOpenFiles = require('../../nuclide-open-files');
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Wrapper that queries for clang settings when new files seen.
class ClangdLSPClient {

  constructor(service) {
    this._service = service;
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('clangd-language-server');
  }

  dispose() {
    this._service.dispose();
  }

  ensureServer(path) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(yield _this._service.isFileKnown(path))) {
        const settings = yield (0, (_libclang || _load_libclang()).getClangRequestSettings)(path);
        if (settings != null) {
          if (!(yield _this._service.addClangRequest(settings))) {
            _this._logger.error('Failure adding settings for ' + path);
          }
        }
      }
    })();
  }

  getDiagnostics(fileVersion) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this2.ensureServer(fileVersion.filePath);
      return _this2._service.getDiagnostics(fileVersion);
    })();
  }

  getAutocompleteSuggestions(fileVersion, position, request) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this3.ensureServer(fileVersion.filePath);
      return _this3._service.getAutocompleteSuggestions(fileVersion, position, request);
    })();
  }

  getAdditionalLogFiles(deadline) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this4._service.getAdditionalLogFiles(deadline);
    })();
  }

  getDefinition(fileVersion, position) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this5.ensureServer(fileVersion.filePath);
      return _this5._service.getDefinition(fileVersion, position);
    })();
  }

  findReferences(fileVersion, position) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this6.ensureServer(fileVersion.filePath);
      return _this6._service.findReferences(fileVersion, position);
    })();
  }

  getCoverage(filePath) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this7.ensureServer(filePath);
      return _this7._service.getCoverage(filePath);
    })();
  }

  getOutline(fileVersion) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this8.ensureServer(fileVersion.filePath);
      return _this8._service.getOutline(fileVersion);
    })();
  }

  getCodeActions(fileVersion, range, diagnostics) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this9.ensureServer(fileVersion.filePath);
      return _this9._service.getCodeActions(fileVersion, range, diagnostics);
    })();
  }

  highlight(fileVersion, position) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this10.ensureServer(fileVersion.filePath);
      return _this10.highlight(fileVersion, position);
    })();
  }

  formatSource(fileVersion, range, options) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this11.ensureServer(fileVersion.filePath);
      return _this11._service.formatSource(fileVersion, range, options);
    })();
  }

  formatAtPosition(fileVersion, position, triggerCharacter, options) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this12.ensureServer(fileVersion.filePath);
      return _this12._service.formatAtPosition(fileVersion, position, triggerCharacter, options);
    })();
  }

  formatEntireFile(fileVersion, range, options) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this13.ensureServer(fileVersion.filePath);
      return _this13._service.formatEntireFile(fileVersion, range, options);
    })();
  }

  getEvaluationExpression(fileVersion, position) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this14.ensureServer(fileVersion.filePath);
      return _this14._service.getEvaluationExpression(fileVersion, position);
    })();
  }

  getProjectRoot(filePath) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this15.ensureServer(filePath);
      yield _this15._service.getProjectRoot(filePath);
    })();
  }

  isFileInProject(filePath) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this16.ensureServer(filePath);
      return _this16._service.isFileInProject(filePath);
    })();
  }

  observeDiagnostics() {
    return this._service.observeDiagnostics();
  }

  typeHint(fileVersion, position) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this17.ensureServer(fileVersion.filePath);
      return _this17._service.typeHint(fileVersion, position);
    })();
  }

  supportsSymbolSearch(directories) {
    var _this18 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // TODO pelmers: wrap with ensure server
      return _this18._service.supportsSymbolSearch(directories);
    })();
  }

  symbolSearch(query, directories) {
    var _this19 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this19._service.symbolSearch(query, directories);
    })();
  }

  getExpandedSelectionRange(fileVersion, currentSelection) {
    var _this20 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this20._service.getExpandedSelectionRange(fileVersion, currentSelection);
    })();
  }

  getCollapsedSelectionRange(fileVersion, currentSelection, originalCursorPosition) {
    var _this21 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this21._service.getCollapsedSelectionRange(fileVersion, currentSelection, originalCursorPosition);
    })();
  }
}
// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line rulesdir/no-cross-atom-imports
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Activation {

  constructor(state) {
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    if ((_featureConfig || _load_featureConfig()).default.get('nuclide-clangd-lsp.useClangd')) {
      if (!this._subscriptions.disposed) {
        this._subscriptions.add(this.initializeLsp());
      }
    }
  }

  consumeClangConfigurationProvider(provider) {
    return (0, (_libclang || _load_libclang()).registerClangProvider)(provider);
  }

  initializeLsp() {
    const atomConfig = {
      name: 'clangd',
      grammars: ['source.cpp', 'source.c'],
      autocomplete: {
        version: '2.0.0',
        inclusionPriority: 1,
        suggestionPriority: 3,
        disableForSelector: null,
        excludeLowerPriority: false,
        autocompleteCacherConfig: {
          updateResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteResults,
          updateFirstResults: (_nuclideLanguageService || _load_nuclideLanguageService()).updateAutocompleteFirstResults
        },
        analyticsEventName: 'clangd.getAutocompleteSuggestions',
        onDidInsertSuggestionAnalyticsEventName: 'clangd.autocomplete-chosen'
      },
      definition: {
        version: '0.1.0',
        priority: 1,
        definitionEventName: 'clangd.getDefinition'
      },
      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'clangd.observe-diagnostics'
      },
      codeFormat: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'clangd.formatCode',
        canFormatRanges: true,
        canFormatAtPosition: false
      },
      codeAction: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'clangd.getActions',
        applyAnalyticsEventName: 'clangd.applyAction'
      }
    };

    const languageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(getConnection, atomConfig, null, (0, (_log4js || _load_log4js()).getLogger)('clangd-language-server'));
    languageService.activate();
    this._languageService = languageService;
    return languageService;
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);