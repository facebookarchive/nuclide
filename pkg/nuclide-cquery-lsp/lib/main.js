'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getConnection = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (connection) {
    const [fileNotifier, host] = yield Promise.all([(0, (_nuclideOpenFiles || _load_nuclideOpenFiles()).getNotifierByConnection)(connection), (0, (_nuclideLanguageService || _load_nuclideLanguageService()).getHostServices)()]);
    const cqueryService = yield (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getCqueryLSPServiceByConnection)(connection).createCqueryService({
      fileNotifier,
      host,
      logCategory: 'cquery-language-server',
      logLevel: 'ALL' // TODO pelmers: change to WARN
    });
    return cqueryService != null ? new CqueryLSPClient(cqueryService) : new (_nuclideLanguageServiceRpc || _load_nuclideLanguageServiceRpc()).NullLanguageService();
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

var _CqueryProject;

function _load_CqueryProject() {
  return _CqueryProject = require('./CqueryProject');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Wrapper that queries for clang settings when new files seen.

// TODO pelmers: maybe don't import from libclang
// eslint-disable-next-line rulesdir/no-cross-atom-imports
class CqueryLSPClient {

  constructor(service) {
    this._service = service;
    this._logger = (0, (_log4js || _load_log4js()).getLogger)('cquery-language-server');
  }

  dispose() {
    this._service.dispose();
  }

  ensureProject(file) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield (0, (_CqueryProject || _load_CqueryProject()).determineCqueryProject)(file);
      return _this._service.associateFileWithProject(file, project).then(function () {
        return project;
      }, function () {
        return null;
      });
    })();
  }

  getDiagnostics(fileVersion) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this2.ensureProject(fileVersion.filePath);
      return project == null ? null : _this2._service.getDiagnostics(fileVersion);
    })();
  }

  getAutocompleteSuggestions(fileVersion, position, request) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this3.ensureProject(fileVersion.filePath);
      return project == null ? null : _this3._service.getAutocompleteSuggestions(fileVersion, position, request);
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
      const project = yield _this5.ensureProject(fileVersion.filePath);
      return project == null ? null : _this5._service.getDefinition(fileVersion, position);
    })();
  }

  findReferences(fileVersion, position) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this6.ensureProject(fileVersion.filePath);
      return project == null ? null : _this6._service.findReferences(fileVersion, position);
    })();
  }

  getCoverage(filePath) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this7.ensureProject(filePath);
      return project == null ? null : _this7._service.getCoverage(filePath);
    })();
  }

  getOutline(fileVersion) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this8.ensureProject(fileVersion.filePath);
      return project == null ? null : _this8._service.getOutline(fileVersion);
    })();
  }

  getCodeActions(fileVersion, range, diagnostics) {
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this9.ensureProject(fileVersion.filePath);
      return project == null ? [] : _this9._service.getCodeActions(fileVersion, range, diagnostics);
    })();
  }

  highlight(fileVersion, position) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this10.ensureProject(fileVersion.filePath);
      return project == null ? null : _this10._service.highlight(fileVersion, position);
    })();
  }

  formatSource(fileVersion, range, options) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this11.ensureProject(fileVersion.filePath);
      return project == null ? null : _this11._service.formatSource(fileVersion, range, options);
    })();
  }

  formatAtPosition(fileVersion, position, triggerCharacter, options) {
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this12.ensureProject(fileVersion.filePath);
      return project == null ? null : _this12._service.formatAtPosition(fileVersion, position, triggerCharacter, options);
    })();
  }

  formatEntireFile(fileVersion, range, options) {
    var _this13 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this13.ensureProject(fileVersion.filePath);
      return project == null ? null : _this13._service.formatEntireFile(fileVersion, range, options);
    })();
  }

  getEvaluationExpression(fileVersion, position) {
    var _this14 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this14.ensureProject(fileVersion.filePath);
      return project == null ? null : _this14._service.getEvaluationExpression(fileVersion, position);
    })();
  }

  getProjectRoot(filePath) {
    var _this15 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this15.ensureProject(filePath);
      return project == null ? null : _this15._service.getProjectRoot(filePath);
    })();
  }

  isFileInProject(filePath) {
    var _this16 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this16.ensureProject(filePath);
      return project != null;
    })();
  }

  observeDiagnostics() {
    return this._service.observeDiagnostics();
  }

  typeHint(fileVersion, position) {
    var _this17 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const project = yield _this17.ensureProject(fileVersion.filePath);
      return project == null ? null : _this17._service.typeHint(fileVersion, position);
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
} /**
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

    if (this._canInitializeLsp()) {
      this._subscriptions.add(this.initializeLsp());
    }
  }

  _canInitializeLsp() {
    return (_featureConfig || _load_featureConfig()).default.get('nuclide-cquery-lsp.use-cquery') === true && !this._subscriptions.disposed;
  }

  consumeClangConfigurationProvider(provider) {
    return (0, (_libclang || _load_libclang()).registerClangProvider)(provider);
  }

  initializeLsp() {
    const atomConfig = {
      name: 'cquery',
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
        analyticsEventName: 'cquery.getAutocompleteSuggestions',
        onDidInsertSuggestionAnalyticsEventName: 'cquery.autocomplete-chosen'
      },
      definition: {
        version: '0.1.0',
        priority: 1,
        definitionEventName: 'cquery.getDefinition'
      },
      diagnostics: {
        version: '0.2.0',
        analyticsEventName: 'cquery.observe-diagnostics'
      },
      codeAction: {
        version: '0.1.0',
        priority: 1,
        analyticsEventName: 'cquery.getActions',
        applyAnalyticsEventName: 'cquery.applyAction'
      }
    };

    const languageService = new (_nuclideLanguageService || _load_nuclideLanguageService()).AtomLanguageService(getConnection, atomConfig, null, (0, (_log4js || _load_log4js()).getLogger)('cquery-language-server'));
    languageService.activate();
    this._languageService = languageService;
    return languageService;
  }

  dispose() {
    this._subscriptions.dispose();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);