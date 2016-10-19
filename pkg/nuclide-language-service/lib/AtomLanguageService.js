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

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
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

var AtomLanguageService = (function () {
  function AtomLanguageService(languageServiceFactory, config) {
    _classCallCheck(this, AtomLanguageService);

    this._config = config;
    this._subscriptions = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default();
    this._connectionToLanguageService = new (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ConnectionCache(languageServiceFactory);
    this._subscriptions.add(this._connectionToLanguageService);
  }

  _createClass(AtomLanguageService, [{
    key: '_selector',
    value: function _selector() {
      return this._config.grammars.join(', ');
    }
  }, {
    key: 'activate',
    value: function activate() {
      var highlightsConfig = this._config.highlights;
      if (highlightsConfig != null) {
        this._subscriptions.add((_CodeHighlightProvider || _load_CodeHighlightProvider()).CodeHighlightProvider.register(this._config.name, this._selector(), highlightsConfig, this._connectionToLanguageService));
      }

      var outlinesConfig = this._config.outlines;
      if (outlinesConfig != null) {
        this._subscriptions.add((_OutlineViewProvider || _load_OutlineViewProvider()).OutlineViewProvider.register(this._config.name, this._selector(), outlinesConfig, this._connectionToLanguageService));
      }

      var coverageConfig = this._config.coverage;
      if (coverageConfig != null) {
        this._subscriptions.add((_TypeCoverageProvider || _load_TypeCoverageProvider()).TypeCoverageProvider.register(this._config.name, this._selector(), coverageConfig, this._connectionToLanguageService));
      }

      var definitionConfig = this._config.definition;
      if (definitionConfig != null) {
        this._subscriptions.add((_DefinitionProvider || _load_DefinitionProvider()).DefinitionProvider.register(this._config.name, this._config.grammars, definitionConfig, this._connectionToLanguageService));
      }

      var typeHintConfig = this._config.typeHint;
      if (typeHintConfig != null) {
        this._subscriptions.add((_TypeHintProvider || _load_TypeHintProvider()).TypeHintProvider.register(this._config.name, this._selector(), typeHintConfig, this._connectionToLanguageService));
      }

      var codeFormatConfig = this._config.codeFormat;
      if (codeFormatConfig != null) {
        this._subscriptions.add((_CodeFormatProvider || _load_CodeFormatProvider()).CodeFormatProvider.register(this._config.name, this._selector(), codeFormatConfig, this._connectionToLanguageService));
      }

      var findReferencesConfig = this._config.findReferences;
      if (findReferencesConfig != null) {
        this._subscriptions.add((_FindReferencesProvider || _load_FindReferencesProvider()).FindReferencesProvider.register(this._config.name, this._config.grammars, findReferencesConfig, this._connectionToLanguageService));
      }

      var evaluationExpressionConfig = this._config.evaluationExpression;
      if (evaluationExpressionConfig != null) {
        this._subscriptions.add((_EvaluationExpressionProvider || _load_EvaluationExpressionProvider()).EvaluationExpressionProvider.register(this._config.name, this._selector(), evaluationExpressionConfig, this._connectionToLanguageService));
      }

      var autocompleteConfig = this._config.autocomplete;
      if (autocompleteConfig != null) {
        this._subscriptions.add((_AutocompleteProvider || _load_AutocompleteProvider()).AutocompleteProvider.register(this._config.name, this._config.grammars, autocompleteConfig, this._connectionToLanguageService));
      }

      var diagnosticsConfig = this._config.diagnostics;
      if (diagnosticsConfig != null) {
        this._subscriptions.add((0, (_DiagnosticsProvider || _load_DiagnosticsProvider()).registerDiagnostics)(this._config.name, this._config.grammars, diagnosticsConfig, this._connectionToLanguageService));
      }
    }
  }, {
    key: 'getLanguageServiceForUri',
    value: _asyncToGenerator(function* (fileUri) {
      var result = this._connectionToLanguageService.getForUri(fileUri);
      return result == null ? null : (yield result);
    })
  }, {
    key: 'isFileInProject',
    value: _asyncToGenerator(function* (fileUri) {
      var languageService = yield this.getLanguageServiceForUri(fileUri);
      return languageService != null && (yield languageService.isFileInProject(fileUri));
    })
  }, {
    key: 'observeLanguageServices',
    value: function observeLanguageServices() {
      return this._connectionToLanguageService.observeValues().switchMap(function (languageService) {
        return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(languageService);
      });
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return AtomLanguageService;
})();

exports.AtomLanguageService = AtomLanguageService;