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

exports.activate = activate;
exports.createAutocompleteProvider = createAutocompleteProvider;
exports.createCodeFormatProvider = createCodeFormatProvider;
exports.createFindReferencesProvider = createFindReferencesProvider;
exports.createTypeHintProvider = createTypeHintProvider;
exports.createCodeHighlightProvider = createCodeHighlightProvider;
exports.createEvaluationExpressionProvider = createEvaluationExpressionProvider;
exports.deactivate = deactivate;
exports.provideOutlines = provideOutlines;
exports.provideCoverage = provideCoverage;
exports.provideDefinitions = provideDefinitions;
exports.registerQuickOpenProvider = registerQuickOpenProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _HackSymbolProvider;

function _load_HackSymbolProvider() {
  return _HackSymbolProvider = require('./HackSymbolProvider');
}

var _CodeHighlightProvider;

function _load_CodeHighlightProvider() {
  return _CodeHighlightProvider = _interopRequireDefault(require('./CodeHighlightProvider'));
}

var _atom;

function _load_atom() {
  return _atom = require('atom');
}

var _nuclideHackCommon;

function _load_nuclideHackCommon() {
  return _nuclideHackCommon = require('../../nuclide-hack-common');
}

var _TypeCoverageProvider;

function _load_TypeCoverageProvider() {
  return _TypeCoverageProvider = require('./TypeCoverageProvider');
}

var _OutlineViewProvider;

function _load_OutlineViewProvider() {
  return _OutlineViewProvider = require('./OutlineViewProvider');
}

var _HackDefinitionProvider;

function _load_HackDefinitionProvider() {
  return _HackDefinitionProvider = require('./HackDefinitionProvider');
}

var _AutocompleteProvider;

function _load_AutocompleteProvider() {
  return _AutocompleteProvider = _interopRequireDefault(require('./AutocompleteProvider'));
}

var _FindReferencesProvider;

function _load_FindReferencesProvider() {
  return _FindReferencesProvider = _interopRequireDefault(require('./FindReferencesProvider'));
}

var _TypeHintProvider;

function _load_TypeHintProvider() {
  return _TypeHintProvider = _interopRequireDefault(require('./TypeHintProvider'));
}

var _HackEvaluationExpressionProvider;

function _load_HackEvaluationExpressionProvider() {
  return _HackEvaluationExpressionProvider = require('./HackEvaluationExpressionProvider');
}

var _HackDiagnosticsProvider;

function _load_HackDiagnosticsProvider() {
  return _HackDiagnosticsProvider = require('./HackDiagnosticsProvider');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideBusySignal;

function _load_nuclideBusySignal() {
  return _nuclideBusySignal = require('../../nuclide-busy-signal');
}

var _CodeFormatProvider;

function _load_CodeFormatProvider() {
  return _CodeFormatProvider = _interopRequireDefault(require('./CodeFormatProvider'));
}

var _HackLanguage;

function _load_HackLanguage() {
  return _HackLanguage = require('./HackLanguage');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var HACK_GRAMMARS_STRING = (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS.join(', ');
var PACKAGE_NAME = 'nuclide-hack';

var subscriptions = null;
var hackDiagnosticsProvider = undefined;
var observableDiagnosticsProvider = undefined;
var busySignalProvider = undefined;
var coverageProvider = null;
var definitionProvider = null;

var diagnosticService = 'nuclide-diagnostics-provider';

function activate() {
  subscriptions = new (_atom || _load_atom()).CompositeDisposable();
  subscriptions.add(new (_atom || _load_atom()).Disposable((_HackLanguage || _load_HackLanguage()).clearHackLanguageCache));

  if ((0, (_config || _load_config()).getConfig)().useIdeConnection) {
    subscriptions.add(atom.packages.serviceHub.provide(diagnosticService, '0.2.0', provideObservableDiagnostics()));
  } else {
    subscriptions.add(atom.packages.serviceHub.provide(diagnosticService, '0.1.0', provideDiagnostics()));
  }
}

/** Provider for autocomplete service. */

function createAutocompleteProvider() {
  var autocompleteProvider = new (_AutocompleteProvider || _load_AutocompleteProvider()).default();

  return {
    selector: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS.map(function (grammar) {
      return '.' + grammar;
    }).join(', '),
    inclusionPriority: 1,
    // The context-sensitive hack autocompletions are more relevant than snippets.
    suggestionPriority: 3,
    excludeLowerPriority: false,

    getSuggestions: function getSuggestions(request) {
      return autocompleteProvider.getAutocompleteSuggestions(request);
    }
  };
}

/** Provider for code format service. */

function createCodeFormatProvider() {
  var codeFormatProvider = new (_CodeFormatProvider || _load_CodeFormatProvider()).default();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,

    formatCode: function formatCode(editor, range) {
      return codeFormatProvider.formatCode(editor, range);
    }
  };
}

function createFindReferencesProvider() {
  return (_FindReferencesProvider || _load_FindReferencesProvider()).default;
}

function createTypeHintProvider() {
  var typeHintProvider = new (_TypeHintProvider || _load_TypeHintProvider()).default();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,
    providerName: PACKAGE_NAME,

    typeHint: function typeHint(editor, position) {
      return typeHintProvider.typeHint(editor, position);
    }
  };
}

function createCodeHighlightProvider() {
  var codeHighlightProvider = new (_CodeHighlightProvider || _load_CodeHighlightProvider()).default();

  return {
    selector: HACK_GRAMMARS_STRING,
    inclusionPriority: 1,
    highlight: function highlight(editor, position) {
      return codeHighlightProvider.highlight(editor, position);
    }
  };
}

function createEvaluationExpressionProvider() {
  var evaluationExpressionProvider = new (_HackEvaluationExpressionProvider || _load_HackEvaluationExpressionProvider()).HackEvaluationExpressionProvider();
  var getEvaluationExpression = evaluationExpressionProvider.getEvaluationExpression.bind(evaluationExpressionProvider);
  return {
    selector: HACK_GRAMMARS_STRING,
    name: PACKAGE_NAME,
    getEvaluationExpression: getEvaluationExpression
  };
}

function provideDiagnostics() {
  if (!hackDiagnosticsProvider) {
    var busyProvider = provideBusySignal();
    hackDiagnosticsProvider = new (_HackDiagnosticsProvider || _load_HackDiagnosticsProvider()).HackDiagnosticsProvider(false, busyProvider);
  }
  return hackDiagnosticsProvider;
}

function provideObservableDiagnostics() {
  if (observableDiagnosticsProvider == null) {
    observableDiagnosticsProvider = new (_HackDiagnosticsProvider || _load_HackDiagnosticsProvider()).ObservableDiagnosticProvider();
  }
  return observableDiagnosticsProvider;
}

function deactivate() {
  if (subscriptions) {
    subscriptions.dispose();
    subscriptions = null;
  }
  if (hackDiagnosticsProvider) {
    hackDiagnosticsProvider.dispose();
    hackDiagnosticsProvider = null;
  }
}

function provideOutlines() {
  var provider = new (_OutlineViewProvider || _load_OutlineViewProvider()).OutlineViewProvider();
  return {
    grammarScopes: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS,
    priority: 1,
    name: 'Hack',
    getOutline: provider.getOutline.bind(provider)
  };
}

function provideBusySignal() {
  if (busySignalProvider == null) {
    busySignalProvider = new (_nuclideBusySignal || _load_nuclideBusySignal()).BusySignalProviderBase();
  }
  return busySignalProvider;
}

function provideCoverage() {
  return {
    displayName: 'Hack',
    priority: 10,
    grammarScopes: (_nuclideHackCommon || _load_nuclideHackCommon()).HACK_GRAMMARS,
    getCoverage: function getCoverage(path) {
      return getTypeCoverageProvider().getCoverage(path);
    }
  };
}

function getTypeCoverageProvider() {
  if (coverageProvider == null) {
    coverageProvider = new (_TypeCoverageProvider || _load_TypeCoverageProvider()).TypeCoverageProvider();
  }
  return coverageProvider;
}

function provideDefinitions() {
  if (definitionProvider == null) {
    definitionProvider = new (_HackDefinitionProvider || _load_HackDefinitionProvider()).HackDefinitionProvider();
  }
  return definitionProvider;
}

function registerQuickOpenProvider() {
  return (_HackSymbolProvider || _load_HackSymbolProvider()).HackSymbolProvider;
}