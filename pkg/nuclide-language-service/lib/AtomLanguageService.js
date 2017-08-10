'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AtomLanguageService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _CodeHighlightProvider;

function _load_CodeHighlightProvider() {
  return _CodeHighlightProvider = require('./CodeHighlightProvider');
}

var _OutlineViewProvider;

function _load_OutlineViewProvider() {
  return _OutlineViewProvider = require('./OutlineViewProvider');
}

var _TypeCoverageProvider;

function _load_TypeCoverageProvider() {
  return _TypeCoverageProvider = require('./TypeCoverageProvider');
}

var _DefinitionProvider;

function _load_DefinitionProvider() {
  return _DefinitionProvider = require('./DefinitionProvider');
}

var _TypeHintProvider;

function _load_TypeHintProvider() {
  return _TypeHintProvider = require('./TypeHintProvider');
}

var _CodeFormatProvider;

function _load_CodeFormatProvider() {
  return _CodeFormatProvider = require('./CodeFormatProvider');
}

var _FindReferencesProvider;

function _load_FindReferencesProvider() {
  return _FindReferencesProvider = require('./FindReferencesProvider');
}

var _EvaluationExpressionProvider;

function _load_EvaluationExpressionProvider() {
  return _EvaluationExpressionProvider = require('./EvaluationExpressionProvider');
}

var _AutocompleteProvider;

function _load_AutocompleteProvider() {
  return _AutocompleteProvider = require('./AutocompleteProvider');
}

var _DiagnosticsProvider;

function _load_DiagnosticsProvider() {
  return _DiagnosticsProvider = require('./DiagnosticsProvider');
}

var _CodeActionProvider;

function _load_CodeActionProvider() {
  return _CodeActionProvider = require('./CodeActionProvider');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

class AtomLanguageService {

  constructor(languageServiceFactory, config, onDidInsertSuggestion, logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-language-service')) {
    this._config = config;
    this._onDidInsertSuggestion = onDidInsertSuggestion;
    this._logger = logger;
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    const lazy = true;
    this._connectionToLanguageService = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(languageServiceFactory, lazy);
    this._subscriptions.add(this._connectionToLanguageService);
  }

  _selector() {
    return this._config.grammars.join(', ');
  }

  activate() {
    let busySignalService = null;
    const busySignalProvider = {
      reportBusyWhile(message, f) {
        if (busySignalService != null) {
          return busySignalService.reportBusyWhile(message, f);
        } else {
          return f();
        }
      }
    };

    this._subscriptions.add(atom.packages.serviceHub.consume('atom-ide-busy-signal', '0.1.0', service => {
      this._subscriptions.add(service);
      busySignalService = service;
      return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
        this._subscriptions.remove(service);
        busySignalService = null;
      });
    }));

    const highlightConfig = this._config.highlight;
    if (highlightConfig != null) {
      this._subscriptions.add((_CodeHighlightProvider || _load_CodeHighlightProvider()).CodeHighlightProvider.register(this._config.name, this._config.grammars, highlightConfig, this._connectionToLanguageService));
    }

    const outlineConfig = this._config.outline;
    if (outlineConfig != null) {
      this._subscriptions.add((_OutlineViewProvider || _load_OutlineViewProvider()).OutlineViewProvider.register(this._config.name, this._config.grammars, outlineConfig, this._connectionToLanguageService));
    }

    const coverageConfig = this._config.coverage;
    if (coverageConfig != null) {
      this._subscriptions.add((_TypeCoverageProvider || _load_TypeCoverageProvider()).TypeCoverageProvider.register(this._config.name, this._selector(), coverageConfig, this._connectionToLanguageService));
    }

    const definitionConfig = this._config.definition;
    if (definitionConfig != null) {
      this._subscriptions.add((_DefinitionProvider || _load_DefinitionProvider()).DefinitionProvider.register(this._config.name, this._config.grammars, definitionConfig, this._connectionToLanguageService));
    }

    const typeHintConfig = this._config.typeHint;
    if (typeHintConfig != null) {
      this._subscriptions.add((_TypeHintProvider || _load_TypeHintProvider()).TypeHintProvider.register(this._config.name, this._selector(), typeHintConfig, this._connectionToLanguageService));
    }

    const codeFormatConfig = this._config.codeFormat;
    if (codeFormatConfig != null) {
      this._subscriptions.add((_CodeFormatProvider || _load_CodeFormatProvider()).CodeFormatProvider.register(this._config.name, this._config.grammars, codeFormatConfig, this._connectionToLanguageService, busySignalProvider));
    }

    const findReferencesConfig = this._config.findReferences;
    if (findReferencesConfig != null) {
      this._subscriptions.add((_FindReferencesProvider || _load_FindReferencesProvider()).FindReferencesProvider.register(this._config.name, this._config.grammars, findReferencesConfig, this._connectionToLanguageService));
    }

    const evaluationExpressionConfig = this._config.evaluationExpression;
    if (evaluationExpressionConfig != null) {
      this._subscriptions.add((_EvaluationExpressionProvider || _load_EvaluationExpressionProvider()).EvaluationExpressionProvider.register(this._config.name, this._selector(), evaluationExpressionConfig, this._connectionToLanguageService));
    }

    const autocompleteConfig = this._config.autocomplete;
    if (autocompleteConfig != null) {
      this._subscriptions.add((_AutocompleteProvider || _load_AutocompleteProvider()).AutocompleteProvider.register(this._config.name, this._config.grammars, autocompleteConfig, this._onDidInsertSuggestion, this._connectionToLanguageService));
    }

    const diagnosticsConfig = this._config.diagnostics;
    if (diagnosticsConfig != null) {
      this._subscriptions.add((0, (_DiagnosticsProvider || _load_DiagnosticsProvider()).registerDiagnostics)(this._config.name, this._config.grammars, diagnosticsConfig, this._logger, this._connectionToLanguageService, busySignalProvider));
    }

    const codeActionConfig = this._config.codeAction;
    if (codeActionConfig != null) {
      this._subscriptions.add((_CodeActionProvider || _load_CodeActionProvider()).CodeActionProvider.register(this._config.name, this._config.grammars, codeActionConfig, this._connectionToLanguageService));
    }
  }

  getLanguageServiceForUri(fileUri) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this._connectionToLanguageService.getForUri(fileUri);
    })();
  }

  isFileInProject(fileUri) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const languageService = _this2._connectionToLanguageService.getExistingForUri(fileUri);
      if (languageService == null) {
        return false;
      }
      return (yield languageService).isFileInProject(fileUri);
    })();
  }

  getCachedLanguageServices() {
    return this._connectionToLanguageService.values();
  }

  observeLanguageServices() {
    return this._connectionToLanguageService.observeValues().switchMap(languageService => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(languageService);
    });
  }

  observeConnectionLanguageEntries() {
    return this._connectionToLanguageService.observeEntries().switchMap(([connection, servicePromise]) => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(servicePromise).map(languageService => [connection, languageService]);
    });
  }

  dispose() {
    this._subscriptions.dispose();
  }
}
exports.AtomLanguageService = AtomLanguageService;